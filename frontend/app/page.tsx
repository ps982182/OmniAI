"use client";

import { useState } from "react";
import axios from "axios";

// =========================
// 🔹 TYPES
// =========================
interface Message {
  role: "user" | "ai";
  content: string;
}

export default function Home() {
  // =========================
  // 🔹 CHAT STATES
  // =========================
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  // =========================
  // 🔹 RAG STATES
  // =========================
  const [pdfQuery, setPdfQuery] = useState<string>("");
  const [pdfAnswer, setPdfAnswer] = useState<string>("");

  // =========================
  // 🔹 SEND CHAT MESSAGE
  // =========================
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await axios.post("http://127.0.0.1:8000/chat", {
        message: input,
      });

      const aiMessage: Message = {
        role: "ai",
        content: res.data.response || "No response",
      };

      setMessages((prev) => [...prev, aiMessage]);
      setInput("");
    } catch (error) {
      console.error("Chat error:", error);

      // ✅ Better UX: show error in chat
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "⚠️ Error connecting to server" },
      ]);
    }
  };

  // =========================
  // 🔹 UPLOAD PDF
  // =========================
  const uploadPDF = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://127.0.0.1:8000/upload-pdf", formData);
      alert("PDF uploaded ✅");
    } catch (error) {
      console.error("Upload error:", error);
      alert("PDF upload failed ❌");
    }
  };

  // =========================
  // 🔹 ASK PDF QUESTION
  // =========================
  const askPDF = async () => {
    if (!pdfQuery.trim()) return;

    try {
      const res = await axios.post("http://127.0.0.1:8000/ask-pdf", {
        query: pdfQuery,
      });

      setPdfAnswer(res.data.answer || "No answer found");
    } catch (error) {
      console.error("RAG error:", error);
      setPdfAnswer("⚠️ Error fetching answer");
    }
  };

  // =========================
  // 🔹 UI
  // =========================
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-4">OmniAI 🚀</h1>

      {/* ================= CHAT ================= */}
      <div className="space-y-3 mb-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded max-w-xl ${
              msg.role === "user"
                ? "bg-blue-600 ml-auto text-white"
                : "bg-gray-800 mr-auto text-gray-200"
            }`}
          >
            <strong>{msg.role === "user" ? "You" : "AI"}:</strong>{" "}
            {msg.content}
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="flex gap-2 mb-10">
        <input
          className="flex-1 p-3 rounded bg-white text-black outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
        />

        <button
          onClick={sendMessage}
          className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>

      {/* ================= RAG ================= */}
      <div className="mt-10">
        <h2 className="text-xl mb-3">📄 Ask your PDF</h2>

        {/* Upload */}
        <input
          type="file"
          onChange={uploadPDF}
          className="mb-3"
        />

        {/* Query */}
        <div className="flex gap-2">
          <input
            className="flex-1 p-2 bg-white text-black rounded"
            value={pdfQuery}
            onChange={(e) => setPdfQuery(e.target.value)}
            placeholder="Ask something from PDF..."
          />

          <button
            onClick={askPDF}
            className="bg-green-500 px-4 py-2 rounded hover:bg-green-600"
          >
            Ask
          </button>
        </div>

        {/* Answer */}
        <div className="mt-3 bg-gray-800 p-3 rounded min-h-[50px]">
          {pdfAnswer}
        </div>
      </div>
    </div>
  );
}