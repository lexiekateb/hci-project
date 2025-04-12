from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from .models.message import Message
from .db import collection, client
from pymongo.errors import ServerSelectionTimeoutError
from datetime import datetime


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await client.admin.command("ping")
        print("✔ MongoDB connection successful")
        await collection.insert_one({"_id": "trigger_popup", "value": False})
    except ServerSelectionTimeoutError as e:
        print({"error": "Could not connect to MongoDB", "details": str(e)})

    yield


app = FastAPI(lifespan=lifespan)

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
    msg = await collection.find_one({"_id": message.id})
    if msg is None:
        try:
            await collection.insert_one(
                {
                    "_id": message.id,
                    "content": message.text,
                    "sender": message.sender,
                    "data_id": message.data_id,
                    "chat_name": message.chat_name,
                    "date_time": datetime.fromisoformat(message.date_time),
                    # "evaluated": False,
                }
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=e)
        return {"message": "message saved"}
    else:
        return {"message": "message already exists"}


@app.get("/popup_trigger/")
async def popup_trigger():
    try:
        result = await collection.find_one(filter={"_id": "trigger_popup"})
        if result:
            flag = result["value"]
            if flag:
                await collection.update_one(
                    filter={"_id": "trigger_popup"}, update={"$set": {"value": False}}
                )

        return {"trigger_popup": flag}
    except Exception as e:
        raise HTTPException(status_code=500, detail=e)
