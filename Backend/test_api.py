'''
This file is to add APIs from RapidAPI before integration.

How to Test?
1. Edit main() function and choose an API from the API_MAP
2. If you see {'message': 'You are not subscribed to this API.'}, go to step 3
3. Subscribe to free tier of the selected API based on the url (Commented out)

How to Add New API?
1. Browse your desired API on RapidAPI
2. Ensure the free plan is enough to be used (> 100 / month)
3. Add the required fields as per the example (name, url, sample payload, x-rapidapi-host, api-key-name)
4. Add the API key to .env file
5. Include the url to the API (Commented out) so others could find the API

!!! FOR YOUR INFORMATION
The url commented out (https://rapidapi.com/ytjar/api/yt-api)
and the url for the API (https://yt-api.p.rapidapi.com/trending)
IS NOT THE SAME!!!

We need 1 for the API, 1 for us to browse (Please include both)
'''

import requests
from dotenv import load_dotenv
import os

load_dotenv()

API_MAP = {
    # https://rapidapi.com/ytjar/api/yt-api
    'YT-API': {
        'url': 'https://yt-api.p.rapidapi.com/trending',
        'payload': {
            'geo': 'US',
            'type': 'now'
        },
        'x-rapidapi-host': 'yt-api.p.rapidapi.com',
        'api-key-name': 'YT_API_KEY'
    }
}

def test_api(api_name):
    api = API_MAP[api_name]

    headers = {
        'x-rapidapi-key': os.getenv(api['api-key-name']),
        'x-rapidapi-host': api['x-rapidapi-host'],
        'Content-Type': 'application/json'
    }

    return requests.get(
        api['url'],
        headers=headers,
        params=api['payload']
    )

def main():
    # Edit name based on the API you want to test
    response = test_api('YT-API')
    print(response.json())

if __name__ == '__main__':
    main()
