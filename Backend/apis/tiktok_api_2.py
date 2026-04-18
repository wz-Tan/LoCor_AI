import requests
import os
from dotenv import load_dotenv

load_dotenv()

url = "https://tiktok-best-experience.p.rapidapi.com/trending"

headers = {
	"x-rapidapi-key": os.getenv('API_KEY'),
	"x-rapidapi-host": "tiktok-best-experience.p.rapidapi.com",
	"Content-Type": "application/json"
}

response = requests.get(url, headers=headers)

print(response.json())