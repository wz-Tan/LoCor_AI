import asyncio
from dotenv import load_dotenv
load_dotenv()

from apis.news_api import fetch_trends as news_trends
from apis.youtube_api import fetch_trends as youtube_trends
from apis.tiktok_api_3 import fetch_trends as tiktok_trends

from ai_synthesize import synthesize_trends

async def fetch_all():
    results = await asyncio.gather(
        news_trends(),
        youtube_trends(),
        tiktok_trends(),
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

async def main(testing):
    # Test
    if testing:
        import json
        result = await asyncio.gather(
            tiktok_trends(),    # Change to the one u want to test
            return_exceptions=True
        )
        print(json.dumps(result, indent=2))
        return

    # Actual
    print("Fetching trends from all platforms...")
    all_data = await fetch_all()

    print(f"✅ Got data from {len(all_data)} platforms. Synthesizing...")
    summary = synthesize_trends(all_data)

    print("\n===== TREND REPORT =====\n")
    print(summary)

if __name__ == "__main__":
    asyncio.run(main(testing=False))
