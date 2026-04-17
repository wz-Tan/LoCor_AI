'''
This file is to add APIs from RapidAPI before integration.

How to Test?
1. Comment out 1 of the 2 lines in main()
2. Run main() function with `python Backend/test_api.py`
3. If you see {'message': 'You are not subscribed to this API.'}, go to step 3
4. Subscribe to free tier of the selected API at 'api-info' at 'for-human'
5. Don't run all APIs together or you'll have no more quotas left...

How to Add New API?
1. Browse your desired API on RapidAPI
2. Ensure the free plan is enough to be used (> 100 / month)
3. Add the required fields as per the examples ('for-api' is used when calling the API, 'for-human' is just for us to see)
4. Add the API key to .env file (All APIs on RapidAPI uses same API_KEY)

!!! FOR YOUR INFORMATION
The url for humans (https://rapidapi.com/ytjar/api/yt-api)
The url for the API (https://yt-api.p.rapidapi.com/trending)

ARE NOT THE SAME!!!
We need 1 for the API, 1 for us to browse (Please include both)
'''

import requests
from dotenv import load_dotenv
import os

load_dotenv()

API_MAP = {
    # 1
    'youtube-trending': {
        'for-human': {
            'api-info': 'https://rapidapi.com/ytjar/api/yt-api',
            'free-limit': '300/month'
        },

        'for-api': {
            'url': 'https://yt-api.p.rapidapi.com/trending',
            'payload': {
                'geo': 'US',
                'type': 'now'
            },
            'x-rapidapi-host': 'yt-api.p.rapidapi.com',
        }
    },

    # 2
    'tiktok-trending': {
        'for-human': {
            'api-info': 'https://rapidapi.com/tikwm-tikwm-default/api/tiktok-scraper7',
            'free-limit': '300/month'
        },

        'for-api': {
            'url': 'https://tiktok-scraper7.p.rapidapi.com/feed/list',
            'payload': {
                'region': 'us',
                'count': '10'
            },
            'x-rapidapi-host': 'tiktok-scraper7.p.rapidapi.com',
        }
    },

    # 3
    'tiktok-trending-2': {
        'for-human': {
            'api-info': 'https://rapidapi.com/ponds4552/api/tiktok-best-experience',
            'free-limit': '100/day'     # So generous ah
        },

        'for-api': {
            'url': 'https://tiktok-best-experience.p.rapidapi.com/trending',
            'payload': None,
            'x-rapidapi-host': 'tiktok-best-experience.p.rapidapi.com',
        }
    },

    # 4
    'news': {
        'for-human': {
            'api-info': 'https://rapidapi.com/bonaipowered/api/news-api14',
            'free-limit': '100/day'     # So generous x2
        },

        'for-api': {
            'url': 'https://news-api14.p.rapidapi.com/v2/trendings',
            'payload': None,
            'x-rapidapi-host': 'news-api14.p.rapidapi.com',
        }
    },
}

def test_api(api_name):
    api = API_MAP[api_name]['for-api']

    headers = {
        'x-rapidapi-key': os.getenv('API_KEY'),
        'x-rapidapi-host': api['x-rapidapi-host'],
        'Content-Type': 'application/json'
    }

    return requests.get(
        api['url'],
        headers=headers,
        params=api['payload']
    )

def main():
    # Comment out either one
    apis_to_test = API_MAP.keys()       # Test all (Not recommended)
    apis_to_test = API_MAP['api-name']  # Test desired (Change name)

    for api in apis_to_test:
        print(f'Testing API: "{api}"')
        response = test_api(api)
        print(response.json(), end='\n\n')

if __name__ == '__main__':
    main()
