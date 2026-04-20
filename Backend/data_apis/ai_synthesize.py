import json
from zai import ZaiClient   # type: ignore
import os

client = ZaiClient(api_key=os.getenv('Z_AI_API_KEY'))

def synthesize_trends(all_platform_data: list[dict]) -> str:
    # Build a compact summary string per platform
    platforms_text = ''
    for platform_data in all_platform_data:
        platforms_text += f'\n\n### {platform_data['platform']}\n'
        for i, trend in enumerate(platform_data.get('trends', [])[:15], 1):
            platforms_text += f'{i}. {json.dumps(trend)}\n'

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
        model='glm-4.7-flash',
        messages=[{'role': 'user', 'content': prompt}],
        thinking={'type': 'disabled'},  # Faster
        max_tokens=2048,
        temperature=0.5,
    )
    return response.choices[0].message.content
