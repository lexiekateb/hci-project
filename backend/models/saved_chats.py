from .message import Message

class SavedChats:
    def __init__(self):
        self.chats = {}

    def add_message(self, message: Message):
        if message.chat_name not in self.chats:
            self.chats[message.chat_name] = {
                "conversation": [],
                "message_id_tracker": set(),
            }

        if message.id not in self.chats[message.chat_name]["message_id_tracker"]:
            self.chats[message.chat_name]["message_id_tracker"].add(message.id)
            self.chats[message.chat_name]["conversation"].append(
                {
                    "message_id": message.id,
                    "context": message.text,
                    "sender": message.sender,
                    "data_id": message.data_id,
                }
            )

saved_chats = SavedChats()