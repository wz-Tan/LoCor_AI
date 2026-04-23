import json
import os

from dotenv import load_dotenv
from processing_generation import generate, newsletter
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


# Generate Newsletter (Context is Synthesized Data from ChromaDB + Trends)
async def generate_newsletter(context):

    DOCUMENT_PROMPT = """
    You are a business analyst writing a weekly proposal document for a retail/e-commerce SME owner.

    You will be given a set of business data and insights collected from the past week. Your job is to analyze this information and produce a well-structured, persuasive proposal that helps the SME owner make clear, confident business decisions.

    **Guidelines:**
    - Write with authority and clarity. The owner is busy — be direct and back every recommendation with a reason drawn from the data.
    - Do not invent data. Only use what is provided in the context below.
    - Each recommendation must have a visible "why" — tie it explicitly to a trend, anomaly, or pattern in the data.
    - Tone should be professional but practical. Avoid jargon.

    **Output format:** Return only valid Markdown. Use the exact section structure below. Do not add extra sections or commentary outside the document.

    ---

    # Weekly Business Proposal
    ## [Week ending: {date}]

    ### Executive Summary
    A 3–5 sentence overview of the week's most important findings and the core recommendation.

    ### Key Insights
    A bulleted breakdown of the most significant patterns or anomalies found in the data this week. Each bullet should be specific and data-backed.

    - **[Insight title]:** explanation

    ### Recommendations
    For each recommendation, state what to do, why the data supports it, and what outcome to expect.

    #### Recommendation 1: [Title]
    - **Action:** ...
    - **Reasoning:** ...
    - **Expected outcome:** ...

    #### Recommendation 2: [Title]
    - **Action:** ...
    - **Reasoning:** ...
    - **Expected outcome:** ...

    *(Add more recommendations as warranted by the data)*

    ### Inventory Changes
    Based on the data, list products that need restocking and products that should be discontinued or cleared. Be specific — include product names or SKUs if present in the context.

    **Restock:**
    - **[Product]:** reason (e.g. stock running low, high velocity this week)

    **Discontinue / Clear:**
    - **[Product]:** reason (e.g. low movement, high days-on-hand)

    ### Risks & Watch Points
    Brief bullets on anything that looks uncertain, needs monitoring, or could go wrong if recommendations are not acted on.

    ### Closing Note
    One short paragraph summarizing the overall outlook for the coming week.

    ---
    """

    EXCEL_PROMPT = """
    You are a data assistant producing an inventory update for a retail/e-commerce SME.

    You will be given the current week's inventory data and the previous version of the inventory. Your job is to produce the full updated inventory as a JSON array, reflecting all changes recommended in the proposal, and flagging what has changed from the previous version.

    **Guidelines:**
    - Every product from the previous inventory must appear in the output, unless it is being discontinued/removed.
    - New products being added must also appear.
    - Compare each row against the previous version and set the `change` field accordingly.
    - Do not invent or estimate values. Only use what is provided in the context.
    - If a field is unchanged, carry it over from the previous version exactly.

    **Change types for the `change` field:**
    - `"added"` — product is new, did not exist in the previous version
    - `"removed"` — product is discontinued or cleared, no longer carried
    - `"modified"` — one or more field values changed from the previous version
    - `"unchanged"` — no changes at all

    **For `"modified"` rows, also include a `"diff"` field** listing only the fields that changed, with their old and new values.

    **Output format:** Return only a valid JSON array. No markdown, no explanation, no backticks. Each object must follow this exact schema:

    ```
    [
      {
        "product_name": "string",
        "sku": "string",
        "quantity": number,
        "status": "string",       // e.g. "active", "low stock", "clearance", "discontinued"
        "price": number,
        "change": "added" | "removed" | "modified" | "unchanged",
        "diff": {                 // only present if change is "modified"
          "field_name": {
            "old": <previous value>,
            "new": <current value>
          }
        }
      }
    ]
    ```

    ---
    """

    document_messages = [
        {"role": "system", "content": DOCUMENT_PROMPT},
        {
            "role": "user",
            "content": f"Here is the business context. Take this as a crucial point of information:\n\n{context}",
        },
    ]

    # Create Proposal Content
    response = client.chat.completions.create(
        model="glm-4.5-flash",
        messages=document_messages,
        thinking={"type": "disabled"},
        max_tokens=2000,
    )

    report_content = response.choices[0].message.content

    # Create Excel Content
    excel_messages = [
        {"role": "system", "content": EXCEL_PROMPT},
        {
            "role": "user",
            "content": f"Here is the business context. Take this as a crucial point of information and strictly follow it:\n\n{context}. Follow this business proposal {report_content}",
        },
    ]

    response = client.chat.completions.create(
        model="glm-4.5-flash",
        messages=excel_messages,
        thinking={"type": "disabled"},
        max_tokens=2000,
    )

    excel_content = response.choices[0].message.content

    # Parse Them into Buffers
    word_buffer = generate.generate_doc(report_content)
    excel_buffer = generate.generate_excel(excel_content)

    # Send Email
    newsletter.send_email(word_buffer, excel_buffer)


async def generate_dashboard(context):
    DASHBOARD_PROMPT = """
    You are a professional market analyst consulting for an SME business owner.
    Based on the business data provided, generate a JSON object with exactly this structure and nothing else. No explanation, no markdown, no extra text — only the raw JSON object.
    {
      "greeting": "Good morning 👋",
      "subtitle": "Here's your business health check for today.",
      "lastUpdated": "Updated DD Mon YYYY, H:MM AM/PM",

      "stats": [
        {
          "label": "metric name e.g. Monthly Revenue",
          "value": "formatted value e.g. RM 45,200",
          "change": "e.g. ↑ 12% vs last month",
          "dir": "up | down | neutral",
          "sub": "optional one-line footnote e.g. RM 1,506/day avg, or null"
        }
      ],

      "salesByCategory": [
        {
          "name": "category name",
          "value": "RM X,XXX",
          "change": "e.g. ↑ 8%",
          "dir": "up | down | neutral",
          "pct": 0
        }
      ],

      "topProducts": [
        {
          "name": "product name",
          "units": 0,
          "revenue": "RM X,XXX"
        }
      ],

      "trends": [
        {
          "name": "category name",
          "dir": "up | down | neutral",
          "label": "↑ Trending | ↓ Slowing | → Stable",
          "desc": "2-3 sentence observation about this category based on the data",
          "competitor": "one line about competitor activity if relevant, or null"
        }
      ]
    }

    Rules:
    - stats: always include 4 entries — Monthly Revenue, Total Sales (units), Top Category Revenue, and Items Needing Reorder. Derive all values from the data.
    - salesByCategory: one entry per product category. pct is that category's share of total revenue as a whole number (0–100).
    - topProducts: top 5 products by units sold.
    - trends: one entry per product category. desc should read like a trusted advisor, not a report. competitor should be one concise line or null.
    - All monetary values must be formatted as "RM X,XXX" with comma separators.
    - Keep language concise and practical — this is for a busy SME owner.
    """

    messages = [
        {"role": "system", "content": DASHBOARD_PROMPT},
        {"role": "user", "content": f"Here is the business data:\n\n{context}"},
    ]

    response = client.chat.completions.create(
        model="glm-4.5-flash",
        messages=messages,
        thinking={"type": "disabled"},
        max_tokens=2500,
        temperature=0.3,
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
