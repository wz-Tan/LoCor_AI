import os

from chat_history import sql
from dotenv import load_dotenv
from zai import ZaiClient

load_dotenv()

# Get this API Key from This Link (+ Documentation)
# https://docs.z.ai/guides/overview/quick-start
API_KEY = os.getenv("Z_AI_API_KEY")
AI_ENDPOINT = "https://api.z.ai/api/paas/v4/"

# Create Client Instance
client = ZaiClient(api_key=API_KEY)


# Talk to the AI
async def get_ai_response(chat_history):
    messages = chat_history

    # Create chat completion
    response = client.chat.completions.create(
        model="glm-4.5-flash",
        messages=messages,
        thinking={"type": "disabled"},
        max_tokens=250,
        temperature=0.5,
    )

    return response.choices[0].message.content
