# Relative import
if __name__ == "__main__":
    import os
    import sys

    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


from dotenv import load_dotenv

load_dotenv()  # Needed by imports

import asyncio

from pricing_strategy.apis import lazada_products
from cache_manager import CacheManager
from pricing_strategy.fetch_all_apis import fetch_all
from pricing_strategy.ai_pricing_strategy import compare_prices

# APIs
ACTIVE_APIS = [lazada_products]  # Modify if for debug
CACHE_KEY = "cached_products"


async def main(user_data: dict, competitor_data: list[dict] | None) -> str:
    # Cache if got
    cached = CacheManager.serve_cache(CACHE_KEY)
    if cached:
        print("✅ Products served from cache\n")
        print(cached, end="\n\n")
        return cached

    # Fetch APIs
    if not competitor_data:
        print("Fetching products from all platforms...")
        competitor_data = await fetch_all(ACTIVE_APIS, query="20000mah power bank built in cable")

    # Summarise with AI
    print(f"✅ Got data from {len(competitor_data)} platforms. Summarising...\n")
    products = compare_prices(user_data, competitor_data)

    # Store cache
    CacheManager.store_cache(CACHE_KEY, products)

    return products


if __name__ == "__main__":
    from prompts.ai_pricing_strategy import USER_DATA, COMPETITOR_DATA
    asyncio.run(main(USER_DATA, COMPETITOR_DATA))
