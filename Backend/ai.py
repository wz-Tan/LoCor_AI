import json
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
async def get_ai_response(chat_history, context):

    messages = list(chat_history)  # copy to avoid mutating original

    if context:
        # find the existing system message and append context to it
        if messages and messages[0]["role"] == "system":
            messages[0] = {
                "role": "system",
                "content": messages[0]["content"]
                + f"\n\nRelevant business data:\n\n{context}",
            }
        else:
            messages.insert(
                0,
                {"role": "system", "content": f"Relevant business data:\n\n{context}"},
            )

    # Create chat completion
    response = client.chat.completions.create(
        model="glm-4.5-flash",
        messages=messages,
        max_tokens=2048,
        temperature=0.5,
    )

    return response.choices[0].message.content


async def generate_insights(context):
    # Format JSON to be sent to front end
    INSIGHTS_PROMPT = """
    You are a professional market analyst consulting for an SME business owner.

    Based on the business data provided, generate a JSON object with exactly this structure and nothing else. No explanation, no markdown, no extra text — only the raw JSON object.

    {
      "trends": [
        {
          "name": "category name",
          "dir": "up | down | neutral",
          "label": "↑ Trending | ↓ Slowing | → Stable",
          "desc": "2-3 sentence observation about this category based on the data",
          "competitor": "one line about competitor activity if relevant, or null"
        }
      ],
      "insights": [
        {
          "icon": "a single relevant emoji",
          "title": "short action-oriented title",
          "body": "2-3 sentences explaining what to do and why, in plain language",
          "dir": "buy | reduce | hold | watch",
          "dirLabel": "→ Buy More | → Reduce / Discount | → Hold | → Watch Closely"
        }
      ],
      "inventory": [
        {
          "name": "product name",
          "cat": "category",
          "stock": 0,
          "capacity": 0,
          "value": "RM X,XXX",
          "status": "critical | excess | ok"
        }
      ]
    }

    Rules:
    - trends: one entry per product category, derived from sales and inventory data
    - insights: 3 to 5 entries, focused on direction not numbers, written like a trusted advisor
    - inventory: one entry per product, status is critical if stock is below 20% of capacity, excess if above 90%, ok otherwise
    - Keep language concise and practical — this is for a busy SME owner, not a report
    """


    # TODO: Add Trend Fetches Here Too
    messages = [
        {"role": "system", "content": INSIGHTS_PROMPT},
        {"role": "user", "content": f"Here is the business data:\n\n{context}"},
    ]

    response = client.chat.completions.create(
        model="glm-4.5-flash",
        messages=messages,
        thinking={"type": "disabled"},
        max_tokens=2000,  # needs more room for full JSON
        temperature=0.3,  # lower = more consistent JSON output
    )

    raw = response.choices[0].message.content
    clean = (
        raw.strip()
        .removeprefix("```json")
        .removeprefix("```")
        .removesuffix("```")
        .strip()
    )

    return json.loads(clean)
