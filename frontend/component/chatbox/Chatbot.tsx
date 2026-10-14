
"use client";

import { useState } from "react";
import "./Chatbot.css";

type ChatMessage = {
  role: "user" | "bot";
  text: string;
};

const suggestions = [
  "Show me my appointments",
  "What is my appointment status?",
  "How can I prepare for my visit?",
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage(
    e?: React.FormEvent<HTMLFormElement>,
    suggestedMessage?: string
  ) {
    e?.preventDefault();

    const text = (suggestedMessage ?? message).trim();

    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setMessage("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in to use your healthcare assistant.");
      }

      const response = await fetch("http://localhost:5000/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "The assistant is temporarily unavailable."
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: data.reply || "Please try asking another question.",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="care-chat">
      {isOpen && (
        <section
          className="care-chat__window"
          role="dialog"
          aria-label="CarePoint Assistant"
        >
          <header className="care-chat__header">
            <div className="care-chat__brand">
              <div className="care-chat__logo">✚</div>

              <div>
                <h2>CarePoint Assistant</h2>
                <div className="care-chat__status">
                  <span />
                  Your healthcare companion
                </div>
              </div>
            </div>

            <button
              type="button"
              className="care-chat__close"
              onClick={() => setIsOpen(false)}
              aria-label="Close assistant"
            >
              ×
            </button>

            <div className="care-chat__welcome">
              <span className="care-chat__welcome-icon">✦</span>
              <div>
                <strong>Hello! Welcome to CarePoint</strong>
                <p>How can I help you today?</p>
              </div>
            </div>
          </header>

          <div className="care-chat__messages">
            {messages.length === 0 && (
              <div className="care-chat__intro">
                <div className="care-chat__bot-avatar">✚</div>
                <div className="care-chat__bubble care-chat__bubble--bot">
                  Welcome! I can help you with your appointments and general
                  healthcare questions.
                </div>

                <div className="care-chat__suggestions">
                  <p>QUICK QUESTIONS</p>

                  {suggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="care-chat__suggestion"
                      onClick={() => sendMessage(undefined, item)}
                      disabled={loading}
                    >
                      <span>{item}</span>
                      <span className="care-chat__suggestion-arrow">↗</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((item, index) => (
              <div
                key={index}
                className={`care-chat__message-row ${
                  item.role === "user"
                    ? "care-chat__message-row--user"
                    : "care-chat__message-row--bot"
                }`}
              >
                {item.role === "bot" && (
                  <div className="care-chat__bot-avatar">✚</div>
                )}

                <div
                  className={`care-chat__bubble ${
                    item.role === "user"
                      ? "care-chat__bubble--user"
                      : "care-chat__bubble--bot"
                  }`}
                >
                  {item.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="care-chat__message-row care-chat__message-row--bot">
                <div className="care-chat__bot-avatar">✚</div>
                <div className="care-chat__typing" aria-label="Assistant is typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </div>

          <form
            className="care-chat__form"
            onSubmit={(e) => sendMessage(e)}
          >
            <div className="care-chat__input-wrap">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me anything..."
                aria-label="Type your message"
                autoComplete="off"
              />

              <button
                type="submit"
                disabled={loading || !message.trim()}
                aria-label="Send message"
                className="care-chat__send"
              >
                ↑
              </button>
            </div>

            <p className="care-chat__disclaimer">
              <span>🔒</span> General information only · Not a diagnosis
            </p>
          </form>
        </section>
      )}

      <button
        type="button"
        className={`care-chat__launcher ${
          isOpen ? "care-chat__launcher--open" : ""
        }`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close assistant" : "Open assistant"}
      >
        {isOpen ? (
          <span className="care-chat__launcher-close">×</span>
        ) : (
          <>
            <span className="care-chat__launcher-icon">✚</span>
            <span className="care-chat__launcher-dot" />
          </>
        )}
      </button>
    </div>
  );
}
