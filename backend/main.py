from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .models.message import Message
from .models.saved_chats import saved_chats

app = FastAPI()

origins = ["https://web.whatsapp.com", "http://localhost"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/ping/")
async def ping():
    return {"message": "pong"}


@app.post("/messages/")
async def add_message(message: Message):
    saved_chats.add_message(message)
    return {"message": "message saved"}
