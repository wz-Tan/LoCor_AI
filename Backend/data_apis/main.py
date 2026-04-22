import asyncio
from dotenv import load_dotenv
import time
from redis import Redis

load_dotenv()  # Needed by imports

# Relative imports if run as package
if __package__:
    from .fetch_all_apis import fetch_all
    from .ai_summarise import summarise_products
    from .apis import lazada_products
else:
    from fetch_all_apis import fetch_all
    from ai_summarise import summarise_products
    from apis import lazada_products

# Constants
ACTIVE_APIS = [lazada_products]  # Modify if for debug
PRODUCTS_CACHE_KEY = 'cached_products'
PRODUCTS_TTL = 60 * 60    # 1 hour

# Setup redis
redis_client = Redis(host='localhost', port=6379, db=0)


# Serve cached products if present
async def serve_cached_products(cached) -> str:
    print('✅ Products served from cache\n')
    text = cached.decode('utf-8')

    # Mimic AI print
    for char in text:
        print(char, end='', flush=True)
        time.sleep(0.01)
    print()

    return text


async def main() -> str:
    # For test
    # from ai_summarise import test_summarise
    # return test_summarise()
    # For test

    cached = redis_client.get(PRODUCTS_CACHE_KEY)
    if cached:
        return await serve_cached_products(cached)

    # Fetch APIs
    print('Fetching products from all platforms...')
    data = await fetch_all(ACTIVE_APIS, query='20000mah power bank built in cable')

    # Summarise with AI
    print(f'✅ Got data from {len(data)} platforms. Summarising...\n')
    products = summarise_products(data)

    # Add to redis
    redis_client.setex(PRODUCTS_CACHE_KEY, PRODUCTS_TTL, products)
    return products


if __name__ == '__main__':
    asyncio.run(main())
