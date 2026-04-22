from .base import fetch_api

async def fetch_trends() -> dict:
    data = await fetch_api(
        host='twitter-api45.p.rapidapi.com',
        endpoint='/trends.php',
        params={
            'country': 'Malaysia'
        }
    )

    return {
        'platform': 'Twitter',
        'trends': data.get('trends', {})
    }
