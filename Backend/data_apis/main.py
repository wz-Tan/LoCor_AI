import asyncio
from dotenv import load_dotenv

load_dotenv()   # Needed by trends

from apis import news_trends, youtube_trends, tiktok_trends
from ai_synthesize import synthesize_trends

ACTIVE_APIS = [news_trends, youtube_trends, tiktok_trends] 

async def fetch_all():
    results = await asyncio.gather(
        *[f() for f in ACTIVE_APIS],
        return_exceptions=True   # Don't let 1 failure kill the rest
    )

    # Filter out failed calls
    successful = []
    for result in results:
        if isinstance(result, Exception):
            print(f'⚠️  One API failed: {result}')
        else:
            successful.append(result)
    return successful

async def main():
    print('Fetching trends from all platforms...')
    all_data = await fetch_all()

    print(f'✅ Got data from {len(all_data)} platforms. Synthesizing...')
    summary = synthesize_trends(all_data)

    print('\n===== TREND REPORT =====\n')
    print(summary)

if __name__ == '__main__':
    asyncio.run(main())
