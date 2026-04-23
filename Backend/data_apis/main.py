# Relative import
if __name__ == '__main__':
    import sys, os
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


from dotenv import load_dotenv
load_dotenv()  # Needed by imports


import asyncio
from fetch_all_apis import fetch_all
from ai_summarise import summarise_products
from apis import lazada_products
from cache_manager import CacheManager


# APIs
ACTIVE_APIS = [lazada_products]  # Modify if for debug
CACHE_KEY = 'cached_products'


async def main(testing: bool = False) -> str:
    # Test
    if testing:
        from test_data import COMPETITOR_DATA
        return summarise_products(COMPETITOR_DATA)

    # Cache if got
    cached = CacheManager.serve_cache(CACHE_KEY)
    if cached:
        print('✅ Products served from cache\n')
        print(cached, end='\n\n')
        return cached

    # Fetch APIs
    print('Fetching products from all platforms...')
    data = await fetch_all(ACTIVE_APIS, query='20000mah power bank built in cable')

    # Summarise with AI
    print(f'✅ Got data from {len(data)} platforms. Summarising...\n')
    products = summarise_products(data)

    # Store cache
    CacheManager.store_cache(CACHE_KEY, products)

    return products


if __name__ == '__main__':
    asyncio.run(main(testing=True))
