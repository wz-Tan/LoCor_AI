import asyncio
from dotenv import load_dotenv
load_dotenv()

from apis.news_api import fetch_trends as news_trends
from apis.tiktok_api_2 import fetch_trends as tiktok_trends
from apis.youtube_api_2 import fetch_trends as youtube_trends

from ai_synthesize import synthesize_trends

async def fetch_all():
    results = await asyncio.gather(
        tiktok_trends(),
        news_trends(),
        youtube_trends(),
        return_exceptions=True   # Don't let one failure kill the rest
    )

    # Filter out any failed calls
    successful = []
    for r in results:
        if isinstance(r, Exception):
            print(f"⚠️  One API failed: {r}")
        else:
            successful.append(r)

    return successful

async def main():
    print("Fetching trends from all platforms...")
    all_data = await fetch_all()

    print(f"✅ Got data from {len(all_data)} platforms. Synthesizing...")
    summary = synthesize_trends(all_data)

    print("\n===== TREND REPORT =====\n")
    print(summary)

if __name__ == "__main__":
    asyncio.run(main())