import json
import os
from json_toon import json_to_toon
from zai import ZaiClient  # type: ignore
from prompts.ai_pricing_strategy import prompt_with_data


client = ZaiClient(api_key=os.getenv("Z_AI_API_KEY"))


def convert_to_toon(all_platform_data: list[dict]) -> str:
    toon_text = ""
    json_text = ""

    # Convert to toon
    for platform_data in all_platform_data:
        products = [
            {**t, "keywords": ",".join(t.get("keywords", []))}
            for t in platform_data.get("products", [])
        ]
        header = f"\n\n### {platform_data['platform']}\n"
        toon_text += header + json_to_toon(products) + "\n"
        json_text += header + json.dumps(products) + "\n"

    # Compare
    j, t = len(json_text), len(toon_text)
    print(f"\nJSON  : {j} chars (~{j // 4} tokens)")
    print(f"TOON  : {t} chars (~{t // 4} tokens)")
    print(f"Saved : {j - t} chars ({round((1 - t / j) * 100, 1)}%)\n")

    return toon_text


def compare_prices(user_data: dict, competitor_data: list[dict]) -> str:
    # Convert data to toon
    try:
        competitor_data = convert_to_toon(competitor_data)
    except AttributeError as e:
        print(f'Failed to convert to TOON, using raw data. Reason: {e}')
        competitor_data = json.dumps(competitor_data)

    # AI
    response = client.chat.completions.create(
        model="glm-4.5-flash",
        messages=[{
            "role": "user",
            "content": prompt_with_data(user_data, competitor_data)
        }],
        thinking={"type": "disabled"},
        max_tokens=2000,
        temperature=0.5,
        stream=True,
    )

    # Print stream by stream
    result = ""
    for chunk in response:
        delta = chunk.choices[0].delta.content or ""
        print(delta, end="", flush=True)
        result += delta
    return result
