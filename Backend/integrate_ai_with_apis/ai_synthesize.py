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

    prompt = f'''You are a social media trend analyst. Below is real-time trending content from multiple platforms.

{platforms_text}

Based on this data, provide:
1. **Top 5 Cross-Platform Trends** - topics appearing across multiple platforms
2. **Platform-Specific Highlights** - unique trends per platform
3. **Emerging Topics** - things gaining momentum right now
4. **Content Themes** - recurring themes or sentiments

Be specific, cite actual hashtags/topics from the data, and keep it concise.'''

    response = client.chat.completions.create(
        model='glm-4.7-flash',
        messages=[{'role': 'user', 'content': prompt}],
        thinking={'type': 'disabled'},  # faster, no need for deep thinking here
        max_tokens=2048,
        temperature=0.5,
    )
    return response.choices[0].message.content