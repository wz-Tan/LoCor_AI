import asyncio
from dotenv import load_dotenv
import time
from redis import Redis

load_dotenv()  # Needed by imports

# Relative imports if run as package
if __package__:
    from .fetch_all_apis import fetch_all
    from .ai_summarise import summarise_trends
    from .apis import news_trends, tiktok_trends, twitter_trends, youtube_trends
else:
    from fetch_all_apis import fetch_all
    from ai_summarise import summarise_trends
    from apis import news_trends, tiktok_trends, twitter_trends, youtube_trends

# Constants
ACTIVE_APIS = [news_trends, youtube_trends, tiktok_trends, twitter_trends]  # Modify if for debug
TRENDS_CACHE_KEY = 'cached_trends'
TRENDS_TTL = 60 * 60    # 1 hour

# Setup redis
redis_client = Redis(host='localhost', port=6379, db=0)


# Serve cached trends if present
async def serve_cached_trends(cached) -> str:
    print('✅ Trends served from cache\n')
    text = cached.decode('utf-8')

    # Mimic AI print
    for char in text:
        print(char, end='', flush=True)
        time.sleep(0.01)
    print()

    return text


async def main() -> str:
    cached = redis_client.get(TRENDS_CACHE_KEY)
    if cached:
        return await serve_cached_trends(cached)

    # Fetch APIs
    print('Fetching trends from all platforms...')
    data = await fetch_all(ACTIVE_APIS)

    # Summarise with AI
    print(f'✅ Got data from {len(data)} platforms. Summarising...\n')
    trends = summarise_trends(data)

    # Add to redis
    redis_client.setex(TRENDS_CACHE_KEY, TRENDS_TTL, trends)
    return trends


if __name__ == '__main__':
    asyncio.run(main())
