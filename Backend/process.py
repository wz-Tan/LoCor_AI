# Module to handle files, and run pandas
import fitz
import pandas as pd
import textract


# Take in Company Description - Word File / PDF , Inventory Excel Sheets, Sales Sheets, Balance Sheets
def initialise_data(
    description_file=None, inventory_sheet=None, sales_sheet=None, balance_sheet=None
):
    company_description = ""
    inventory_data = None
    sales_data = None
    balance_sheet_data = None

    # Extract Company Description
    if description_file:
        ext = description_file.name.split(".")[-1].lower()
        if ext == "pdf":
            company_description = extract_from_pdf(description_file)
        elif ext in ["doc", "docx"]:
            company_description = extract_from_doc(description_file)
        else:
            return

    # Inventory Sheet
    if inventory_sheet:
        ext = inventory_sheet.name.split(".")[-1].lower()
        if ext == "csv":
            inventory_data = pd.read_csv(inventory_sheet)
        elif ext in ["xls", "xlsx"]:
            inventory_data = pd.read_excel(inventory_sheet)
        else:
            return

    # Sales Sheet
    if sales_sheet:
        ext = sales_sheet.name.split(".")[-1].lower()
        if ext == "csv":
            sales_data = pd.read_csv(sales_sheet)
        elif ext in ["xls", "xlsx"]:
            sales_data = pd.read_excel(sales_sheet)
        else:
            return

    # Balance Sheet
    if balance_sheet:
        ext = balance_sheet.name.split(".")[-1].lower()
        if ext == "csv":
            balance_sheet_data = pd.read_csv(balance_sheet)
        elif ext in ["xls", "xlsx"]:
            balance_sheet_data = pd.read_excel(balance_sheet)
        else:
            return

    return company_description, inventory_data, sales_data, balance_sheet_data


# Word Processing
def extract_from_doc(file_path):
    text = textract.process(file_path)
    return text.decode("utf-8")


# PDF Processing
def extract_from_pdf(file_path):
    doc = fitz.open(file_path)
    full_text = ""
    for page in doc:
        full_text += page.get_text()
    return full_text
