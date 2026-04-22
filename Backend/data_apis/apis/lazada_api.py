from .base import fetch_api

async def fetch_products(query: str) -> dict:
    data = await fetch_api(
        host='lazada-api.p.rapidapi.com',
        endpoint='/lazada/search/items',
        params={
            'keywords': query,
            'site': 'my',
        }
    )

    # Filter fields
    items = data.get('data', {}).get('items', [])
    normalized = []
    for item in items:
        # Skip ads
        if item.get('is_ad'): continue

        discount = item.get('discount')

        normalized.append({
            'title':     item.get('title', ''),
            'brand':   item.get('brand', ''),
            'price': item.get('price', ''),
            'ori_price': item.get('price_info', {}).get('origin_price', '') if discount else '',
            'discount': discount,
            'sold': item.get('sold_count', ''),
            'in_stock': item.get('is_in_stock', '')
        })

    return {
        'platform': 'Lazada',
        'products': normalized
    }
