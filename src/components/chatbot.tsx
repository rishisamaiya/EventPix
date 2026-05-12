"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, ArrowRight } from "lucide-react";
import { findBestAnswer, suggestedQuestions } from "@/lib/chatbot-knowledge";

type Message = {
  id: string;
  role: "bot" | "user";
  text: string;
  timestamp: Date;
};

const GREETING =
  "👋 Hi! I'm the EventPix assistant. I can help you with event creation, face recognition, pricing, billing, and more. Ask me anything!";

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: GREETING,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  function addMessage(role: "bot" | "user", text: string) {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        role,
        text,
        timestamp: new Date(),
      },
    ]);
  }

  function handleSend(text?: string) {
    const query = (text || input).trim();
    if (!query) return;

    addMessage("user", query);
    setInput("");
    setIsTyping(true);

    // Simulate slight delay for natural feel
    setTimeout(() => {
      const match = findBestAnswer(query);

      if (match) {
        addMessage("bot", match.answer);
      } else {
        addMessage(
          "bot",
          "I'm not sure about that. Here are some things I can help with:\n\n• Creating events\n• Face recognition & AI\n• Pricing & billing\n• Account & security\n• Troubleshooting\n\nOr you can contact our support team at support@eventpix.in for personalized help."
        );
      }
      setIsTyping(false);
    }, 600 + Math.random() * 400);
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full shadow-2xl shadow-blue-300/50 transition-all duration-300 ${
          isOpen
            ? "rotate-0 bg-slate-700"
            : "bg-gradient-to-r from-blue-500 to-sky-400 hover:scale-110"
        }`}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Notification dot */}
      {!isOpen && (
        <div className="fixed bottom-[4.25rem] right-6 z-[61] flex h-5 w-5 items-center justify-center">
          <span className="absolute h-3 w-3 animate-ping rounded-full bg-blue-400 opacity-75" />
          <span className="relative h-2.5 w-2.5 rounded-full bg-blue-500" />
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[60] flex h-[500px] w-[380px] flex-col overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-2xl shadow-blue-200/30 max-[420px]:bottom-0 max-[420px]:left-0 max-[420px]:right-0 max-[420px]:top-0 max-[420px]:h-full max-[420px]:w-full max-[420px]:rounded-none">
          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-sky-400 px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">EventPix Assistant</h3>
              <p className="text-xs text-blue-100">
                Usually responds instantly
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 transition hover:bg-white/20"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                    msg.role === "bot"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {msg.role === "bot" ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "bot"
                      ? "rounded-tl-sm bg-slate-100 text-slate-700"
                      : "rounded-tr-sm bg-gradient-to-r from-blue-500 to-sky-400 text-white"
                  }`}
                >
                  {msg.text.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < msg.text.split("\n").length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {/* Suggested questions (only show at start) */}
            {messages.length <= 1 && !isTyping && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-400">
                  Quick questions:
                </p>
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="flex w-full items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/50 px-3 py-2 text-left text-sm text-blue-700 transition hover:bg-blue-100"
                  >
                    <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-blue-400" />
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-sky-400 text-white transition hover:from-blue-600 hover:to-sky-500 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-2 text-center text-[10px] text-slate-300">
              Need human help?{" "}
              <a href="/contact" className="text-blue-400 hover:underline">
                Contact support
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
