from .base import fetch_api

async def fetch_trends() -> dict:
    data = await fetch_api(
        url='https://youtube-trending.p.rapidapi.com/trending',
        host='youtube-trending.p.rapidapi.com',
        params={
            'country': 'US',
            'type': 'default'
        }
    )
    return {
        'platform': 'YouTube',
        'data': data
    }
