import asyncio
from dotenv import load_dotenv
from cache_manager import CacheManager

load_dotenv()  # Needed by imports

# Relative imports if run as package
if __package__:
    from data_apis.fetch_all_apis import fetch_all
    from data_apis.ai_summarise import summarise_products
    from data_apis.apis import lazada_products
else:
    from fetch_all_apis import fetch_all
    from ai_summarise import summarise_products
    from apis import lazada_products


# APIs
ACTIVE_APIS = [lazada_products]  # Modify if for debug
CACHE_KEY = 'cached_products'


async def main(testing: bool = False) -> str:
    # Test
    if testing:
        from TEST_DATA import competitor_data
        return summarise_products(competitor_data, testing=True)

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
