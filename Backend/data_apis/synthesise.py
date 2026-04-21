import asyncio
from dotenv import load_dotenv

load_dotenv()  # Needed by trends

# Relative imports if run as package
if __package__:
    from .fetch_all_apis import fetch_all
    from .ai_summarise import summarise_trends
    from .apis import news_trends, tiktok_trends, twitter_trends, youtube_trends
else:
    from fetch_all_apis import fetch_all
    from ai_summarise import summarise_trends
    from apis import news_trends, tiktok_trends, twitter_trends, youtube_trends

# Modify if for debug
ACTIVE_APIS = [news_trends, youtube_trends, tiktok_trends, twitter_trends]

async def fetch_and_summarise_trends() -> str:
    print('Fetching trends from all platforms...')
    data = await fetch_all(ACTIVE_APIS)

    print(f'✅ Got data from {len(data)} platforms. Synthesizing...')
    return summarise_trends(data)

if __name__ == '__main__':
    asyncio.run(fetch_and_summarise_trends())
