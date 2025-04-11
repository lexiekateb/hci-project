from pydantic import BaseModel


class Message(BaseModel):
    sender: str
    text: str
    data_id: str
    id: str
    chat_name: str
    date_time: str
