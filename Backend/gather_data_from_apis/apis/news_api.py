from .base import fetch_api

async def fetch_trends() -> dict:
    data = await fetch_api(
        host='news-api14.p.rapidapi.com',
        endpoint='/v2/trendings',
        params={
            'topic': 'General',
            'language': 'en',
            'limit': '20'
        }
    )

    # Filter fields
    items = data.get('data', {})
    normalized = []
    for item in items:
        normalized.append({
            'title':     item.get('title', ''),
            'excerpt':   item.get('excerpt', ''),
            'publisher': item.get('publisher', {}).get('name', ''),
            'keywords':  item.get('keywords', []),
        })

    return {
        'platform': 'News',
        'trends': normalized
    }
