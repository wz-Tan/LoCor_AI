from .base import fetch_api

async def fetch_trends() -> dict:
    data = await fetch_api(
        url='https://tiktok-best-experience.p.rapidapi.com/trending',
        host='tiktok-best-experience.p.rapidapi.com'
    )
    return {
        'platform': 'TikTok',
        'data': data
    }
