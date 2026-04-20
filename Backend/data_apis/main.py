import asyncio
from fetch_all_apis import fetch_all
from ai_summarise import summarise_trends

async def fetch_and_summarise_trends() -> str:
    print('Fetching trends from all platforms...')
    data = await fetch_all()

    print(f'✅ Got data from {len(data)} platforms. Synthesizing...')
    return summarise_trends(data)

if __name__ == '__main__':
    asyncio.run(fetch_and_summarise_trends())
