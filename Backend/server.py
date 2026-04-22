import sqlite3
import uuid
from datetime import datetime

import chat
from chat_history import sql
from db import data_feeder
from fastapi import FastAPI
from fastapi.datastructures import UploadFile
from fastapi.middleware.cors import CORSMiddleware
from processing_tools.parser import DocumentParser
from pydantic import BaseModel


class UserMessage(BaseModel):
    user_response: str


# Connect to SQLite
conn = sqlite3.connect("chat.db", check_same_thread=False)
cursor = conn.cursor()

# Create table
cursor.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT,
        content TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
""")

conn.commit()

app = FastAPI()


# Init DB
@app.on_event("startup")
def startup():
    sql.init_db(cursor, conn)


# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    (
        company_description,
        inventory_df,
        sales_df,
        balance_sheet_df,
    ) = await DocumentParser.initialise_data(
        description_file, sales_sheet, inventory_sheet, balance_sheet
    )

    # Use Current Time as metadata
    date = datetime.now().strftime("%d/%m/%Y")

    # Upload Data into ChromaDB
    # Company Description
    data_feeder.populate_db(
        documents=[company_description],
        ids=[str(uuid.uuid4())],
        metadatas=[{"date_added": date}],
        collection_name="Company_Description",
    )

    # Dataframes
    parsed_inventory = DocumentParser._parse_dataframe(inventory_df)

    data_feeder.populate_db(
        documents=[parsed_inventory],
        ids=[str(uuid.uuid4())],
        metadatas=[{"date_added": date}],
        collection_name="Inventory_Sheets",
    )

    parsed_sales = DocumentParser._parse_dataframe(sales_df)

    data_feeder.populate_db(
        documents=[parsed_sales],
        ids=[str(uuid.uuid4())],
        metadatas=[{"date_added": date}],
        collection_name="Sales_Sheets",
    )

    parsed_balance_sheet = DocumentParser._parse_dataframe(balance_sheet_df)

    data_feeder.populate_db(
        documents=[parsed_balance_sheet],
        ids=[str(uuid.uuid4())],
        metadatas=[{"date_added": date}],
        collection_name="Balance_Sheets",
    )

    print("Initialisation is complete")
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

    chat_history = sql.get_all_messages(cursor)
    chat_history.append({"role": "user", "content": body.user_response})

    ai_response = await chat.get_ai_response(chat_history)

    sql.save_message(cursor, conn, "user", body.user_response)
    sql.save_message(cursor, conn, "assistant", ai_response)

    return {"ai_response": ai_response}
