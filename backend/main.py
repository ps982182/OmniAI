from fastapi import FastAPI
from pydantic import BaseModel
from groq import Groq
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class ChatRequest(BaseModel):
    message: str

@app.get("/")
def home():
    return {"message": "OmniAI Backend Running 🚀"}

@app.post("/chat")
def chat(data: ChatRequest):
    response = client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are OmniAI, a helpful AI assistant."},
            {"role": "user", "content": data.message}
        ],
        model="llama-3.1-8b-instant"
    )

    return {
        "response": response.choices[0].message.content
    }