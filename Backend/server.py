import uuid
from contextlib import asynccontextmanager
from datetime import datetime
import os

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


client = ZaiClient(api_key=os.getenv("Z_AI_API_KEY"))
ai_chat = AIChat(client)
ai_report = AIReportGenerator(client)


class UserMessage(BaseModel):
    user_response: str


COLLECTION_NAMES = ["Company_Description", "Inventory_Sheets", "Balance_Sheets", "Sales_Sheets"]


@asynccontextmanager
async def lifespan(app: FastAPI):
    sql.init_db(cursor, conn)
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
            description_file, sales_sheet, inventory_sheet, balance_sheet
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


# User Sends Message -> AI Responds, and The Interaction Gets Saved
@app.post("/chat_response")
async def get_ai_response(body: UserMessage):
    if body.user_response == "refresh":
        sql.clear_messages(cursor, conn)
        sql.init_db(cursor, conn)
        return {"ai_response": "Chat history cleared."}

    chat_history = sql.get_all_messages(cursor)
    chat_history.append({"role": "user", "content": body.user_response})

    final_context = _build_context(body.user_response)
    ai_response = await ai_chat.respond(chat_history, final_context)

    sql.save_message(cursor, conn, "user", body.user_response)
    sql.save_message(cursor, conn, "assistant", ai_response)
    return {"ai_response": ai_response}


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