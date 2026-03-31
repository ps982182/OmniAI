"use client";

import { useState } from "react";
import axios from "axios";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

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
        content: res.data.response,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setInput("");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-4">OmniAI 🚀</h1>

      <div className="space-y-3 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className="p-3 rounded bg-gray-800">
            <strong>{msg.role === "user" ? "You" : "AI"}:</strong>{" "}
            {msg.content}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 p-3 rounded bg-white text-black"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
        />

        <button
          onClick={sendMessage}
          className="bg-blue-500 px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}