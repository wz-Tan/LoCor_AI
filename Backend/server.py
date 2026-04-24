import uuid
from contextlib import asynccontextmanager
from datetime import datetime
import os
from json_toon import json_to_toon
import json

from zai import ZaiClient
from ai_generation.ai_chat import AIChat
from ai_generation.ai_report import AIReportGenerator
from chat_history import sql
from chat_history.database import conn, cursor
from vector_db.retriever import VectorRetriever
from vector_db.vector_store import VectorStore
from fastapi import FastAPI
from fastapi.datastructures import UploadFile
from fastapi.middleware.cors import CORSMiddleware
from processing_tools.parser import DocumentParser
from pydantic import BaseModel
from apis import fetch_all, lazada_prices
from cache_manager import CacheManager
from fastapi.responses import StreamingResponse
from prompts.ai_pricing_strategy import prompt_with_data


client = ZaiClient(api_key=os.getenv("Z_AI_API_KEY"))
ai_chat = AIChat(client)
ai_report = AIReportGenerator(client)


class UserMessage(BaseModel):
    user_response: str


class ProductDetails(BaseModel):
    product_name: str


COLLECTION_NAMES = ["Company_Description", "Inventory_Sheets", "Balance_Sheets", "Sales_Sheets"]
PRICING_APIS = [lazada_prices]
USE_MOCK_PRICING = False


@asynccontextmanager
async def lifespan(app: FastAPI):
    sql.init_db(conn)
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _build_context(query_text: str) -> str:
    context_parts = []
    for name in COLLECTION_NAMES:
        results = VectorRetriever(name).query([query_text])
        docs = results["documents"][0] if isinstance(results, dict) and results["documents"] else []
        if docs:
            context_parts.append("\n\n".join(docs))
    return "".join(context_parts)


@app.get("/")
async def root():
    print("Root is called")
    return {"Message": "This is The Root of the Page"}


# Take In Company Description, Inventory Sheets, Sales Sheets and Balance Sheets
@app.post("/initialise_data")
async def initialise_data(
    description_file: UploadFile,
    inventory_sheet: UploadFile,
    sales_sheet: UploadFile,
    balance_sheet: UploadFile,
):

    # Parse Files into Word and Dataframes
    company_description, inventory_df, sales_df, balance_sheet_df, = (
        await DocumentParser.initialise_data(
            description_file, inventory_sheet, sales_sheet, balance_sheet
        )
    )

    # Use Current Time as metadata
    date = datetime.now().strftime("%d/%m/%Y")

    # Store data into ChromaDB
    entries = [
        ("Company_Description", company_description),
        ("Inventory_Sheets",    DocumentParser._parse_dataframe(inventory_df)),
        ("Sales_Sheets",        DocumentParser._parse_dataframe(sales_df)),
        ("Balance_Sheets",      DocumentParser._parse_dataframe(balance_sheet_df)),
    ]
    for collection_name, document in entries:
        VectorStore(collection_name).add(
            documents=[document],
            ids=[str(uuid.uuid4())],
            metadatas=[{"date_added": date}],
        )

    print("Initialisation completed")
    return {"status": "ok"}


# Acquire Chat History from SQLite
@app.get("/chat_history")
def get_chat_history():
    chat_history = sql.get_all_messages(cursor)
    print("chat history is ", chat_history)
    return {"chat_history": chat_history}


@app.post("/clear_chat")
async def clear_chat():
    sql.clear_messages(cursor, conn)
    sql.init_db(conn)
    return {"status": "cleared"}


# User Sends Message -> AI Responds, and The Interaction Gets Saved
@app.post("/chat_response/stream")
async def stream_ai_response(body: UserMessage):
    import asyncio

    # Fetch chat history
    chat_history = sql.get_all_messages(cursor)
    chat_history.append({"role": "user", "content": body.user_response})
    final_context = _build_context(body.user_response)

    if final_context:
        if chat_history and chat_history[0]["role"] == "system":
            chat_history[0] = {
                "role": "system",
                "content": chat_history[0]["content"] + f"\n\nRelevant business data:\n\n{final_context}",
            }
        else:
            chat_history.insert(0, {"role": "system", "content": f"Relevant business data:\n\n{final_context}"})

    sql.save_message(cursor, conn, "user", body.user_response)

    async def live_stream():
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: ai_chat.client.chat.completions.create(
                model="glm-4.5-flash",
                messages=chat_history,  # ai_chat.respond logic inlined here
                thinking={"type": "disabled"},
                max_tokens=2048,
                temperature=0.5,
                stream=True,
            )
        )
        result = ""
        for chunk in response:
            delta = chunk.choices[0].delta.content or ""
            if delta:
                result += delta
                yield delta
                await asyncio.sleep(0)
        sql.save_message(cursor, conn, "assistant", result)

    return StreamingResponse(live_stream(), media_type="text/plain")


@app.get("/generate_insights")
async def generate_insights():
    final_context = _build_context("sales trends inventory performance")
    generated_insights = await ai_chat.insights(final_context)
    return {"generated_insights": generated_insights}


@app.get("/generate_dashboard")
async def generate_dashboard():
    final_context = _build_context("sales trends inventory performance")
    generated_dashboard = await ai_chat.dashboard(final_context)
    return {"generated_dashboard": generated_dashboard}


@app.get("/generate_reports")
async def generate_reports():
    final_context = _build_context("sales trends inventory performance")
    await ai_report.generate(final_context)
    return {"status": "ok"}


def _parse_pandas_repr(text: str) -> list[dict]:
    """
    Parse a pandas DataFrame repr string like:
      '     Month          Product  Units Sold  Revenue (RM)\n0  Jan 2024  ...'
    into a list of dicts keyed by column name.
    """
    lines = [l for l in text.strip().splitlines() if l.strip()]
    if len(lines) < 2:
        return []

    # First line is the header — find column positions by their start index
    header_line = lines[0]
    # Split header into tokens and record their start positions
    import re
    header_tokens = [(m.group(), m.start()) for m in re.finditer(r'\S+(?:\s\S+)*?(?=\s{2,}|$)', header_line)]
    # Simpler: just split on 2+ spaces
    col_names = re.split(r'\s{2,}', header_line.strip())

    rows = []
    for line in lines[1:]:
        # Strip the leading row index (digits at the start)
        stripped = re.sub(r'^\s*\d+\s+', '', line)
        values = re.split(r'\s{2,}', stripped.strip())
        if len(values) == len(col_names):
            rows.append(dict(zip(col_names, [v.strip() for v in values])))
        elif len(values) > len(col_names):
            # More values than columns — merge overflow into first column
            overflow = len(values) - len(col_names)
            merged = [" ".join(values[:overflow+1])] + values[overflow+1:]
            if len(merged) == len(col_names):
                rows.append(dict(zip(col_names, [v.strip() for v in merged])))
    return rows


def _col(row: dict, *candidates) -> str:
    """Case-insensitive key lookup across a dict."""
    for c in candidates:
        for k, v in row.items():
            if k.lower().strip() == c.lower():
                return str(v).strip()
    return ""


def _query_repr(collection: str, query: str) -> list[dict]:
    """Query a VectorRetriever collection and parse the pandas repr result."""
    try:
        results = VectorRetriever(collection).query([query])
        docs = results["documents"][0] if isinstance(results, dict) and results["documents"] else []
        if docs:
            return _parse_pandas_repr(docs[0])
    except Exception as e:
        print(f"⚠️  VectorRetriever({collection}) failed: {e}")
    return []


@app.get("/products")
async def get_products():
    """
    Reads inventory + sales data from ChromaDB and returns a structured
    JSON list of products with computed profit margin and monthly sales.
    """
    inv_rows   = _query_repr("Inventory_Sheets", "product inventory stock price")
    sales_rows = _query_repr("Sales_Sheets",     "product sales revenue units sold")

    print("INV ROWS:", inv_rows[:2])
    print("SALES ROWS:", sales_rows[:2])

    if not inv_rows:
        return {"products": [], "error": "No inventory data found in vector store."}

    # Build a lookup: product name → aggregated monthly sales volume
    # Sum all Units Sold entries per product across months
    sales_by_product: dict[str, int] = {}
    for row in sales_rows:
        name = _col(row, "product", "product name", "name").strip()
        try:
            units = int(float(_col(row, "units sold", "units", "quantity sold") or 0))
        except ValueError:
            units = 0
        if name:
            sales_by_product[name] = sales_by_product.get(name, 0) + units

    def safe_float(val, default=0.0):
        try: return float(str(val).replace(",", "").replace("RM", "").strip())
        except: return default

    def safe_int(val, default=0):
        try: return int(float(str(val).replace(",", "").strip()))
        except: return default

    products = []
    for row in inv_rows:
        name       = _col(row, "product", "product name", "name") or "Unknown"
        category   = _col(row, "category", "cat") or "—"
        unit_price = safe_float(_col(row, "unit price (rm)", "unit price", "price"))
        cost_price = safe_float(_col(row, "cost price (rm)", "cost price", "cost"))
        stock      = safe_int(_col(row,   "stock", "quantity", "qty"))
        reorder    = safe_int(_col(row,   "reorder level", "reorder"))

        profit_per_unit = round(unit_price - cost_price, 2)
        margin_pct      = round((profit_per_unit / unit_price) * 100, 1) if unit_price > 0 else 0.0
        stock_status    = "low" if 0 < reorder >= stock else "ok"

        # Match sales by product name (fuzzy: check if stored name contains our name or vice versa)
        monthly_sales = 0
        for sname, total in sales_by_product.items():
            if name.lower() in sname.lower() or sname.lower() in name.lower():
                monthly_sales = total
                break

        products.append({
            "name":             name,
            "category":         category,
            "stock":            stock,
            "unit_price":       unit_price,
            "cost_price":       cost_price,
            "reorder_level":    reorder,
            "profit_per_unit":  profit_per_unit,
            "margin_pct":       margin_pct,
            "stock_status":     stock_status,
            "monthly_sales":    monthly_sales,
        })

    return {"products": products}


def _build_user_data(product_name: str) -> dict:
    """
    Query VectorRetriever for inventory + sales data and return a structured
    user_data dict for the requested product.
    """
    # ── Inventory ──────────────────────────────────────────────────────────────
    inventory_row = {}
    try:
        inv_results = VectorRetriever("Inventory_Sheets").query([product_name])
        inv_docs = inv_results["documents"][0] if isinstance(inv_results, dict) and inv_results["documents"] else []
        if inv_docs:
            rows = _parse_pandas_repr(inv_docs[0])   # ← was _parse_csv_rows
            for row in rows:
                name_val = _col(row, "product", "product name", "name")
                if product_name.lower() in name_val.lower():
                    inventory_row = row
                    break
            if not inventory_row and rows:
                inventory_row = rows[0]
    except Exception as e:
        print(f"⚠️  Inventory retrieval failed: {e}")

    # ── Sales ──────────────────────────────────────────────────────────────────
    sales_row = {}
    try:
        sales_results = VectorRetriever("Sales_Sheets").query([product_name])
        sales_docs = sales_results["documents"][0] if isinstance(sales_results, dict) and sales_results["documents"] else []
        if sales_docs:
            rows = _parse_pandas_repr(sales_docs[0])   # ← was _parse_csv_rows
            for row in rows:
                name_val = _col(row, "product", "product name", "name")
                if product_name.lower() in name_val.lower():
                    sales_row = row
                    break
            if not sales_row and rows:
                sales_row = rows[0]
    except Exception as e:
        print(f"⚠️  Sales retrieval failed: {e}")

    # ── Build dict ─────────────────────────────────────────────────────────────
    def safe_float(val, default=0.0):
        try: return float(str(val).replace(",", "").replace("RM", "").strip())
        except: return default

    def safe_int(val, default=0):
        try: return int(float(str(val).replace(",", "").strip()))
        except: return default

    unit_price  = safe_float(_col(inventory_row, "unit price (rm)", "unit price", "selling price", "price"))
    cost_price  = safe_float(_col(inventory_row, "cost price (rm)", "cost price", "cost"))
    stock       = safe_int(_col(inventory_row,   "stock", "quantity", "qty"))
    category    = _col(inventory_row, "category", "cat") or "—"

    monthly_vol  = safe_int(_col(sales_row, "monthly sales", "monthly volume", "units sold", "quantity sold"))
    holding_cost = safe_float(_col(inventory_row, "holding cost", "inventory holding cost"))

    profit_per_unit = round(unit_price - cost_price, 2)
    margin_pct      = round((profit_per_unit / unit_price) * 100, 1) if unit_price > 0 else 0.0

    return {
        "product_name":                    product_name,
        "category":                        category,
        "cost_per_unit":                   cost_price,
        "current_selling_price":           unit_price,
        "current_profit_margin_percent":   margin_pct,
        "profit_per_unit":                 profit_per_unit,
        "inventory_level":                 stock,
        "monthly_sales_volume":            monthly_vol or None,
        "inventory_holding_cost_per_unit": holding_cost or None,
    }


def convert_to_toon(data: list[dict]) -> str:
    toon_text = ""
    json_text = ""

    # Convert to toon
    for d in data:
        products = [
            {**t, "keywords": ",".join(t.get("keywords", []))}
            for t in d.get("products", [])
        ]
        header = f"\n\n### {d['platform']}\n"
        toon_text += header + json_to_toon(products) + "\n"
        json_text += header + json.dumps(products) + "\n"

    # Compare
    j, t = len(json_text), len(toon_text)
    print(f"\nJSON  : {j} chars (~{j // 4} tokens)")
    print(f"TOON  : {t} chars (~{t // 4} tokens)")
    print(f"Saved : {j - t} chars ({round((1 - t / j) * 100, 1)}%)\n")

    return toon_text


@app.post('/pricing-strategy/stream')
async def stream_pricing_strategy(product_details: ProductDetails):
    product_name = product_details.product_name

    # Serve cache if present
    cached = CacheManager.serve_cache(product_name)
    if cached:
        print('Serving from cache...')
        async def cached_stream():
            yield cached
        return StreamingResponse(cached_stream(), media_type="text/plain")

    # Build user data dynamically from VectorRetriever
    user_data = _build_user_data(product_name)

    # Use mock data or real API depending on flag
    if USE_MOCK_PRICING:
        from prompts.ai_pricing_strategy import MOCK_COMPETITOR_DATA
        competitor_data = MOCK_COMPETITOR_DATA
    else:
        competitor_data = await fetch_all(PRICING_APIS, query=product_name)
        if not competitor_data:
            async def error_stream():
                yield "All pricing APIs failed to respond."
            return StreamingResponse(error_stream(), media_type="text/plain")

    # AI synthesis
    async def live_stream():
        import asyncio
        result = ""
        loop = asyncio.get_event_loop()

        response = await loop.run_in_executor(
            None,
            lambda: ai_chat.client.chat.completions.create(
                model="glm-4.5-flash",
                messages=[{
                    "role": "user",
                    "content": prompt_with_data(
                        json_to_toon(user_data),
                        json_to_toon(competitor_data)
                    )
                }],
                thinking={"type": "disabled"},
                max_tokens=2000,
                temperature=0.5,
                stream=True,
            )
        )

        # Stream
        for chunk in response:
            delta = chunk.choices[0].delta.content or ""
            if delta:
                result += delta
                print(delta, end='')
                yield delta
                await asyncio.sleep(0)
        CacheManager.store_cache(product_name, result)

    return StreamingResponse(live_stream(), media_type="text/plain")