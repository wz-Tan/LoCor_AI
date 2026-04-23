from redis import Redis

class CacheManager:
    # products_cache_key = 'cached_products'
    cache_expiry = 60 * 60    # 1 hour
    redis_client = Redis(host='localhost', port=6379, db=0)
    
    # Serve cached if key present
    @classmethod
    async def serve_cache(cls, cache_key: str) -> str | None:
        cached = cls.redis_client.get(cache_key)
        if cached:
            return cached.decode('utf-8')
        return None

    # Add to redis
    @classmethod
    async def store_cache(cls, cache_key, data) -> None:
        cls.redis_client.setex(cache_key, cls.cache_expiry, data)
