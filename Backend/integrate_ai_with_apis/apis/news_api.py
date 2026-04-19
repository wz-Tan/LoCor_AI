from .base import fetch_api

async def fetch_trends() -> dict:
    data = await fetch_api(
        url='https://news-api14.p.rapidapi.com/v2/trendings',
        host='news-api14.p.rapidapi.com',
        params={
            'topic': 'General',
            'limit': '10'
        }
    )
    return {
        'platform': 'News',
        'data': data
    }
