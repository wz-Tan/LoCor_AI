import json
import os
from toon import encode
from zai import ZaiClient  # type: ignore

client = ZaiClient(api_key=os.getenv('Z_AI_API_KEY'))

def convert_to_toon(all_platform_data: list[dict]) -> str:
    toon_text = ''
    json_text = ''

    # Convert to toon
    for platform_data in all_platform_data:
        trends = [
            {**t, 'keywords': ','.join(t.get('keywords', []))}
            for t in platform_data.get('trends', [])[:15]
        ]
        header = f'\n\n### {platform_data['platform']}\n'
        toon_text += header + encode(trends) + '\n'
        json_text += header + json.dumps(trends) + '\n'

    # Compare
    j, t = len(json_text), len(toon_text)
    print(f'\nJSON  : {j} chars (~{j // 4} tokens)')
    print(f'TOON  : {t} chars (~{t // 4} tokens)')
    print(f'Saved : {j - t} chars ({round((1 - t / j) * 100, 1)}%)\n')

    return toon_text

def summarise_trends(all_platform_data: list[dict]) -> str:
    # Convert data to toon
    platforms_text = convert_to_toon(all_platform_data)

    prompt = f'''
You are a strategic business intelligence analyst. Below is real-time trending content scraped from multiple platforms.

{platforms_text}

Analyze this data from a **business opportunity lens**. Your audience is business owners and marketers making decisions today.

Provide:

1. **Trending Topics Right Now** — What are people talking about across platforms? Group related topics together.

2. **Business Opportunities** — For each major trend, suggest:
   - What type of business/industry benefits from this
   - What content, product, or campaign they could launch
   - How urgently they should act (is this a spike or a sustained trend?)

3. **Audience Insights** — What do these trends reveal about what people want, fear, or care about right now?

4. **Content Strategy Recommendations** — What should businesses be posting about this week to stay relevant?

Be specific and actionable. Avoid generic advice. Reference actual topics, hashtags, and publishers from the data.
'''

    response = client.chat.completions.create(
        model='glm-4.5-flash',
        messages=[{'role': 'user', 'content': prompt}],
        thinking={'type': 'disabled'},
        max_tokens=1000,
        temperature=0.5,
        stream=True
    )

    # Print stream by stream
    result = ''
    for chunk in response:
        delta = chunk.choices[0].delta.content or ''
        print(delta, end='', flush=True)
        result += delta
    return result

    # If not using stream
    # return response.choices[0].message.content
