# Module to Send a Generated Report for the User
import os
import smtplib
from email.mime.text import MIMEText

import dotenv
import resend

# Initialise Environment
dotenv.load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")
email_address = os.getenv("EMAIL")


# Send Email to User (TODO: Add attachments into email)
def send_email(report, spreadsheet):
    params: resend.Emails.SendParams = {
        "from": "onboarding@resend.dev",
        "to": [email_address],
        "subject": "Testing Email",
        "html": "<strong>it works!</strong><br/>Hello",
    }

    email = resend.Emails.send(params)
    print(email)


send_email("a", "b")
