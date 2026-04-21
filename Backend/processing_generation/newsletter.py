# Module to Send a Generated Report for the User
import os

from dotenv import load_dotenv
import resend
from pandas.io.common import BytesIO

# Initialise Environment
load_dotenv()

resend.api_key = os.getenv('RESEND_API_KEY')
email_address = os.getenv('EMAIL')


# Send Email to User
def send_email(reportBuffer: BytesIO, spreadsheetBuffer: BytesIO) -> None:
    '''Send Email to User with Attachments after Generating Word and Excel File'''
    report = reportBuffer.read()
    spreadsheet = spreadsheetBuffer.read()

    # Convert Bytes into Attachment items
    report_attachment: resend.Attachment = {
        'content': list(report),
        'filename': 'report.docx',
    }

    spreadsheet_attachment: resend.Attachment = {
        'content': list(spreadsheet),
        'filename': 'spreadsheet.xlsx',
    }

    # Email content
    params: resend.Emails.SendParams = {
        'from': 'onboarding@resend.dev',
        'to': [email_address],
        'subject': 'Testing Email',
        'html': '<strong>it works!</strong><br/>Hello',
        'attachments': [report_attachment, spreadsheet_attachment],
    }

    # Send email
    email = resend.Emails.send(params)
    print(f'\nEmail sent:\n{email}\n')
