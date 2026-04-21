# Module to handle files, and run pandas
import io
import json

import docx
import fitz
import pandas as pd


# Write
def generate_doc(contents):
    print("Word File Contents are ", contents)
    """Fill Data into Word File"""
    doc = docx.Document()
    doc.add_paragraph(contents)

    # Save as Bytes
    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)

    return buffer


# Pass in JSON String from the AI
def generate_excel(contents):
    print("Input content on excel is ", contents)

    """Fill Data into Excel File"""
    data = json.loads(contents)
    df = pd.DataFrame(data)

    # Write into Memory, Return as Bytes
    buffer = io.BytesIO()

    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        df.to_excel(writer, index=False)

    buffer.seek(0)

    return buffer
