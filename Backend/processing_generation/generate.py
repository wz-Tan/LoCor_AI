# Module to handle files, and run pandas
from io import BytesIO
import json

import docx
import pandas as pd


# String to word doc
def generate_doc(contents: str) -> BytesIO:
    '''Generate a Word document and return it as a BytesIO buffer.'''
    print(f'\nWord file content:\n{contents}\n')

    # Generate word document
    doc = docx.Document()
    doc.add_paragraph(contents)

    # Read into buffer
    buffer = BytesIO()
    doc.save(buffer)

    # Reset pointer
    buffer.seek(0)
    return buffer


# JSON string to excel
def generate_excel(contents: str) -> BytesIO:
    '''Parse a JSON string and write it into an Excel file, returned as a BytesIO buffer.'''
    print(f'\nExcel file content:\n{contents}\n')

    # Convert string -> JSON -> df
    df = pd.DataFrame(json.loads(contents))

    # Read into buffer
    buffer = BytesIO()
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        df.to_excel(writer, index=False)

    # Reset pointer
    buffer.seek(0)
    return buffer
