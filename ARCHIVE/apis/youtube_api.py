from .base import fetch_api

async def fetch_trends() -> dict:
    data = await fetch_api(
        host='yt-api.p.rapidapi.com',
        endpoint='/trending',
        params={
            'geo': 'MY',
            'type': 'now'
        }
    )

    # Filter fields
    items = data.get('data', {})
    normalized = []
    for item in items:
        normalized.append({
            'title':     item.get('title', ''),
            'channel_title':   item.get('channelTitle', ''),
            'description': item.get('description', ''),
            'view_count':  item.get('viewCount', ''),
            'like_count':  item.get('likeCount', ''),
            'comment_count':  item.get('commentCount', ''),
            'published':  item.get('publishedTimeText', ''),
        })

    return {
        'platform': 'YouTube',
        'trends': normalized
    }
