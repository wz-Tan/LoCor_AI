import httpx
import os

async def fetch_api(host: str, endpoint: str, params: dict = {}) -> dict:
    headers = {
        'x-rapidapi-key': os.getenv('RAPIDAPI_API_KEY'),
        'x-rapidapi-host': host,
        'Content-Type': 'application/json'
    }
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(
            url=f'https://{host}{endpoint}',
            headers=headers,
            params=params
        )
        response.raise_for_status()
        return response.json()
