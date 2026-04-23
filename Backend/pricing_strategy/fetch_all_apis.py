import asyncio

async def fetch_all(active_apis, query: str) -> list:
    results = await asyncio.gather(
        *[f(query) for f in active_apis],
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
