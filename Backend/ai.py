import json
import os
import re

from dotenv import load_dotenv
from processing_generation import generate, newsletter
from prompts.ai import DASHBOARD_PROMPT, DOCUMENT_PROMPT, EXCEL_PROMPT, INSIGHTS_PROMPT
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
    return json.loads(_clean_json(raw))


# Generate Newsletter (Context is Synthesized Data from ChromaDB + Trends)
async def generate_newsletter(context):
    # General docx
    document_messages = [
        {"role": "system", "content": DOCUMENT_PROMPT},
        {
            "role": "user",
            "content": f"Here is the business context. Take this as a crucial point of information:\n\n{context}",
        },
    ]
    report_content = _ai_generate(document_messages)

    # Generate excel
    excel_messages = [
        {"role": "system", "content": EXCEL_PROMPT},
        {
            "role": "user",
            "content": f"Here is the business context. Take this as a crucial point of information and strictly follow it:\n\n{context}. Follow this business proposal {report_content}",
        },
    ]
    excel_content = _ai_generate(excel_messages)

    # Parse Them into Buffers
    word_buffer = generate.generate_doc(report_content)
    excel_buffer = generate.generate_excel(excel_content)

    # Send Email
    newsletter.send_email(word_buffer, excel_buffer)


async def generate_dashboard(context):
    messages = [
        {"role": "system", "content": DASHBOARD_PROMPT},
        {"role": "user", "content": f"Here is the business data:\n\n{context}"},
    ]

    response = client.chat.completions.create(
        model="glm-4.5-flash",
        messages=messages,
        thinking={"type": "disabled"},
        max_tokens=5000,
        temperature=0.3,
    )

    raw = response.choices[0].message.content
    return json.loads(_clean_json(raw))


# Helper functions
def _clean_json(raw: str) -> str:
    return re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip())


def _ai_generate(messages):
    response = client.chat.completions.create(
        model="glm-4.5-flash",
        messages=messages,
        thinking={"type": "disabled"},
        max_tokens=2000,
    )
    return response.choices[0].message.content
