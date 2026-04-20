import os

import dotenv
from zai import ZaiClient

dotenv.load_dotenv()

# Get this API Key from This Link (+ Documentation)
# https://docs.z.ai/guides/overview/quick-start
API_KEY = os.environ["Z_AI_API_KEY"]
AI_ENDPOINT = "https://api.z.ai/api/paas/v4/"

# Create Client Instance
client = ZaiClient(api_key=API_KEY)

# Talk to the AI
# Create chat completion
response = client.chat.completions.create(
    model="glm-4.7-flash",
    messages=[
        {"role": "system", "content": "You are an AI writer."},
        {"role": "user", "content": "Tell a story about AI."},
    ],
    stream=True,
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
