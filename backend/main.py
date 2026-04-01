# =========================
# 🔹 IMPORTS
# =========================
from fastapi import FastAPI
from pydantic import BaseModel
from groq import Groq
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from fastapi import UploadFile, File
import shutil

# Import RAG functions
from rag import process_pdf, query_rag

# =========================
# 🔹 LOAD ENV VARIABLES
# =========================
load_dotenv()  
# 👉 Loads your GROQ_API_KEY from .env file

# =========================
# 🔹 CREATE FASTAPI APP
# =========================
app = FastAPI()

# =========================
# 🔹 ENABLE CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow frontend (localhost:3000)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# 🔹 INITIALIZE AI CLIENT
# =========================
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
# 👉 Connects backend to AI model

# =========================
# 🔹 REQUEST SCHEMAS
# =========================

# Chat request structure
class ChatRequest(BaseModel):
    message: str  # user input message

# PDF query request structure
class QueryRequest(BaseModel):
    query: str  # question for PDF

# =========================
# 🔹 TEST ROUTE
# =========================
@app.get("/")
def home():
    return {"message": "OmniAI Backend Running 🚀"}
# 👉 Check if server is working

# =========================
# 🔹 CHAT API (GEN AI)
# =========================
@app.post("/chat")
def chat(data: ChatRequest):
    """
    Takes user message → sends to AI → returns response
    """

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

# =========================
# 🔹 UPLOAD PDF (RAG)
# =========================
@app.post("/upload-pdf")
def upload_pdf(file: UploadFile = File(...)):
    """
    Uploads PDF → saves file → processes into embeddings
    """

    # Save file locally
    file_path = f"temp_{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Process PDF (convert → chunks → embeddings → FAISS)
    result = process_pdf(file_path)

    return {"message": result}

# =========================
# 🔹 ASK PDF QUESTION (RAG)
# =========================
@app.post("/ask-pdf")
def ask_pdf(data: QueryRequest):
    """
    Takes user query → searches PDF → returns relevant answer
    """

    answer = query_rag(data.query)

    return {"answer": answer}