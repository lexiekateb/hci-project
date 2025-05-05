from fastapi import FastAPI, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import json
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from agent import moderate_text, generate_parent_report
import markdown
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def home():
    return FileResponse("static/chat.html")


@app.get("/api/messages/{preset}")
async def get_messages(preset):
    with open(f"message_presets/preset_{preset}.json", "r") as f:
        messages = json.load(f)
    return JSONResponse(content=messages)


class Message(BaseModel):
    sender: str
    text: str


class Conversation(BaseModel):
    conversation: List[Message]


def send_email(moderation_response):
    report = generate_parent_report(moderation_response)
    html_content = markdown.markdown(report)

    # Email content
    sender_email = "rohitforcollegesearch@gmail.com"
    receiver_email = "rohitforcollegesearch@gmail.com"
    subject = "Chat Moderation Tool Triggered"

    # Create the email
    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = receiver_email
    message["Subject"] = subject

    # Attach the plain text body
    html_part = MIMEText(html_content, "html")
    message.attach(html_part)

    # Send the email via Gmail's SMTP server
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(
            sender_email, os.environ["GOOGLE_APP_PASSWORD"]
        )  # Use an app password
        server.sendmail(sender_email, receiver_email, message.as_string())


@app.post("/api/messages/")
async def send_messages(conversation: Conversation, background_tasks: BackgroundTasks):
    conversation_dict = conversation.model_dump().get("conversation")
    moderation_response = moderate_text(conversation_dict)
    conversation_flagged = False
    for _, value in moderation_response["flags"].items():
        conversation_flagged |= value

    if conversation_flagged:
        background_tasks.add_task(send_email, moderation_response)
    return {"conversation_flagged": conversation_flagged}
