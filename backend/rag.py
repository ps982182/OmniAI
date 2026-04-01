from dotenv import load_dotenv
import os

load_dotenv()  # Load environment variables
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import CharacterTextSplitter
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Global storage
index = None
documents = []

def process_pdf(file_path):
    global index, documents

    # 1. Load PDF
    loader = PyPDFLoader(file_path)
    pages = loader.load()

    # 2. Split text into chunks
    splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    docs = splitter.split_documents(pages)

    texts = [doc.page_content for doc in docs]

    # 3. Convert text → embeddings
    embeddings = model.encode(texts)

    # 4. Store in FAISS
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(np.array(embeddings))

    documents = texts

    return "PDF processed successfully ✅"


def query_rag(query):
    global index, documents

    if index is None:
        return "No PDF uploaded."

    # 🔹 Convert query → embedding
    query_embedding = model.encode([query])

    # 🔹 Search similar chunks
    D, I = index.search(np.array(query_embedding), k=3)
    retrieved_chunks = [documents[i] for i in I[0]]

    # 🔹 Combine context
    context = "\n\n".join(retrieved_chunks)

    # 🔥 SEND TO AI (IMPORTANT)
    response = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant. Answer only from the given context."
            },
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion: {query}"
            }
        ],
        model="llama-3.1-8b-instant"
    )

    return response.choices[0].message.content