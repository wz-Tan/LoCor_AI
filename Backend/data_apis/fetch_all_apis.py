import asyncio

from .apis import news_trends, tiktok_trends, twitter_trends, youtube_trends
from dotenv import load_dotenv

load_dotenv()  # Needed by trends


ACTIVE_APIS = [news_trends, youtube_trends, tiktok_trends, twitter_trends]


async def fetch_all() -> list:
    results = await asyncio.gather(
        *[f() for f in ACTIVE_APIS],
        return_exceptions=True,  # Don't let 1 failure kill the rest
    )

    # Filter out failed calls
    successful = []
    for result in results:
        if isinstance(result, Exception):
            print(f"⚠️  One API failed: {result}")
        else:
            successful.append(result)
    return successful
