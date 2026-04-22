from .base import fetch_api

async def fetch_trends() -> dict:
    data = await fetch_api(
        host='tiktok-download5.p.rapidapi.com',
        endpoint='/feedList',
        params={
            'region': 'MY',
            'count': '20'
        }
    )

    # Filter fields
    items = data.get('data', {})
    normalized = []
    for item in items:
        # Skip ads
        if item.get('is_ad', False) == True:
            continue

        normalized.append({
            'title':     item.get('title', ''),
            'content_desc': item.get('content_desc', []),
            'play_count': item.get('play_count', ''),
            'comment_count': item.get('comment_count', ''),
            'share_count': item.get('share_count', ''),
            'download_count': item.get('download_count', ''),
            'author': item.get('author', '').get('nickname', '')
        })
    
    return {
        'platform': 'TikTok',
        'trends': normalized
    }
