from dotenv import load_dotenv
from openai import OpenAI
import json

load_dotenv()
client = OpenAI()

functions = [
    {
        "name": "classify_conversation",
        "description": "Analyzes a chat conversation for unsafe content. Returns category flags and conversation excerpts supporting those flags.",
        "parameters": {
            "type": "object",
            "properties": {
                "flags": {
                    "type": "object",
                    "description": "Boolean indicators for detected unsafe content categories.",
                    "properties": {
                        "violence": {
                            "type": "boolean",
                            "description": "Violent content present.",
                        },
                        "self_harm": {
                            "type": "boolean",
                            "description": "Self-harm content present.",
                        },
                        "harassment": {
                            "type": "boolean",
                            "description": "Harassment present.",
                        },
                        "sexual_content": {
                            "type": "boolean",
                            "description": "Sexual content present.",
                        },
                        "grooming": {
                            "type": "boolean",
                            "description": "Grooming behavior present.",
                        },
                        "threatening": {
                            "type": "boolean",
                            "description": "Threatening content present.",
                        },
                    },
                    "required": [
                        "violence",
                        "self_harm",
                        "harassment",
                        "sexual_content",
                        "grooming",
                        "threatening",
                    ],
                },
                "excerpts": {
                    "type": "array",
                    "description": "Relevant conversation snippets that triggered the unsafe content flags.",
                    "items": {
                        "type": "object",
                        "properties": {
                            "category": {
                                "type": "string",
                                "description": "Category of flagged text.",
                            },
                            "sender": {
                                "type": "string",
                                "description": "Who sent the flagged message.",
                            },
                            "text": {
                                "type": "string",
                                "description": "Text of the flagged message.",
                            },
                        },
                        "required": ["category", "sender", "text"],
                    },
                },
            },
            "required": ["flags", "excerpts"],
        },
    }
]


def moderate_text(conversation):
    # Build the message list
    messages = [
        {
            "role": "system",
            "content": (
                "You are a content-safety classification agent. "
                "Analyze the entire chat conversation and identify any instances of violence, self-harm, "
                "harassment, sexual content (including minors), or grooming. "
                "Return exactly one function call with the schema provided."
            ),
        }
    ]
    for turn in conversation:
        role = "user" if turn["sender"] == "Bob" else "assistant"
        messages.append({"role": role, "content": turn["text"]})

    # Call the chat completion endpoint with function-calling enabled
    resp = client.chat.completions.create(
        model="gpt-4.1",  # or another function-calling–capable model
        messages=messages,
        functions=functions,
        function_call="auto",  # let the model decide to call classify_conversation
    )

    msg = resp.choices[0].message

    # If the model returned a function call, extract and parse its arguments
    if msg.function_call:
        return json.loads(msg.function_call.arguments)

    # Otherwise, nothing flagged
    return {
        "flags": {
            "violence": False,
            "self_harm": False,
            "harassment": False,
            "sexual_content": False,
            "grooming": False,
            "threatening": False,
        },
        "excerpts": [],
    }


def generate_parent_report(moderation_response):

    system_prompt = (
        "You are a compassionate counselor writing a report to a child's parents. "
        "You will receive a JSON with which content‐safety flags were triggered, "
        "who the child was speaking with, and brief context descriptions. "
        "Produce a clear, empathetic summary that:\n"
        " 1. Lists which flags were raised.\n"
        " 2. States whom the conversation was with.\n"
        " 3. Explains in your own words why each flag was raised, giving only a gist, "
        "     never quoting exact messages.\n"
        " 4. Provides a final section titled “Recommended Resources” with at least "
        "     three helpful hotlines, websites, or tools the parents can use."
    )

    user_prompt = (
        f"Child’s Name: Bob\n"
        f"Conversation Partner: Alice\n\n"
        f"Classification Data:\n{json.dumps(moderation_response, indent=2)}"
    )

    resp = client.chat.completions.create(
        model="gpt-4.1",  # or another function-calling–capable model
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt}
        ],
        temperature=0.3,
        max_tokens=500
    )

    return resp.choices[0].message.content.strip()