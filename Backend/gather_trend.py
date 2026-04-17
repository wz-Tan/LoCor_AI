import requests
from dotenv import load_dotenv
import os

load_dotenv()

url = "https://yt-api.p.rapidapi.com/trending"

payload = {"geo":"US","type":"now"}

headers = {
	"x-rapidapi-key": os.getenv('API_KEY'),
	"x-rapidapi-host": "yt-api.p.rapidapi.com",
	"Content-Type": "application/json"
}

def fetch_data():
    return requests.get(url, headers=headers, params=payload)

def main():
    response = fetch_data()
    print(response.json())

if __name__ == '__main__':
    main()
