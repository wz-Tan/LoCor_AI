import json
import os

from json_toon import json_to_toon
from zai import ZaiClient  # type: ignore
from TEST_DATA import your_product


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


def summarise_products(all_products: list[dict], testing: bool = False) -> str:
    # Convert data to toon
    try:
        all_products = convert_to_toon(all_products)
    except AttributeError:
        print('Failed to convert to TOON.\n')

    prompt = f"""
You are an AI pricing strategist for a Malaysian e-commerce business selling on Lazada.

=== YOUR PRODUCT (Current Position) ===
{json.dumps(your_product, indent=2)}

=== COMPETITOR DATA FROM LAZADA ===
{json.dumps(all_products, indent=2)}

=== YOUR TASK ===
Analyze the competitive landscape and provide ONE specific pricing recommendation.

Answer these questions in order:

1. **Current Position Analysis**
   - Where does our product sit in the market right now (budget, mid-tier, premium)?
   - What is our key competitive advantage/disadvantage based on this data?

2. **The Critical Gap/Opportunity**
   - What is the most important insight from this competitor data?
   - Is there a supply gap, a pricing vacuum, or a psychological price point we're missing?

3. **Recommended Action**
   - Should we increase price, decrease price, or hold?
   - If change: What is the EXACT new price? Provide it in RM.
   - If hold: Why is holding optimal right now?

4. **"Can We Afford This?" Analysis**
   - At the recommended new price, what is our NEW profit margin percentage?
   - What is our NEW profit per unit?
   - How many ADDITIONAL units must we sell to maintain current monthly profit levels?
   - What is the maximum price drop we could sustain before hitting break-even on current volume?

5. Supply Gap Analysis: Is any competitor OUT OF STOCK at a key price point? If yes, how can we capture their orphaned demand?

6. **Execution Strategy**
   - What should we change in our Lazada listing (title, image, description) to support this price?
   - What promotion or campaign would maximize this opportunity?

Be specific. Reference actual numbers from the data. Avoid generic advice.
"""
    # Test data
    if testing:
        from TEST_DATA import PROMPT
        prompt = PROMPT

    response = client.chat.completions.create(
        model="glm-4.5-flash",
        messages=[{"role": "user", "content": prompt}],
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
