import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Trash, Sparkles, User, X } from "lucide-react";
import { Message, Movie } from "../types";

interface CinemaSenseiProps {
  currentMovie?: Movie | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function CinemaSensei({
  currentMovie,
  isOpen,
  onClose
}: CinemaSenseiProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Salutations, cinephile! I am CineStream Sensei, your dedicated AI Film Guru. Ask me anything about blockbusters, easter eggs, plot timelines, or get deep critical score insights!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Introduce contextual support if movie changes
  useEffect(() => {
    if (currentMovie) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I see you are viewing "${currentMovie.title}". Would you like a critical analysis of its ending, thematic secrets, or director trivia? Feel free to ask!`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
      ]);
    }
  }, [currentMovie]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const txt = inputVal.trim();
    if (!txt) return;

    const userMsg: Message = {
      role: "user",
      content: txt,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          currentMovie: currentMovie?.title || "",
        }),
      });
      const data = await response.json();
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (err) {
      console.error("Chat Sensei failed to consult model", err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: "assistant",
        content: "Resetting database... Ask me your next high-fidelity cinema questions!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const handlePromptClick = (p: string) => {
    setInputVal(p);
  };

  const samplePrompts = [
    `Tell me some fun facts about ${currentMovie?.title || "Interstellar"}.`,
    "Who directed Inception and what are its core motifs?",
    "Explain the timeline of Dune series",
    "List 5 highly critically acclaimed cinema endings"
  ];

  return (
    <div className="flex flex-col h-[500px] md:h-[600px] max-w-sm w-full bg-[#050505]/95 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
      
      {/* Header chat block */}
      <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[#ff4e00] animate-pulse" />
          <div>
            <h3 className="font-display text-xs font-black text-white uppercase tracking-wider">CineStream Sensei</h3>
            <p className="text-[9px] font-mono text-zinc-500 uppercase">Interactive Film Guru</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
            title="Clear Chat Logs"
          >
            <Trash className="h-3.5 w-3.5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main chat log roll */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar icon */}
            <div className={`rounded-lg p-1.5 shrink-0 ${
              m.role === "user" 
                ? "bg-white/10 text-zinc-300 border border-white/5" 
                : "bg-[#ff4e00]/10 border border-[#ff4e00]/25 text-[#ff4e00]"
            }`}>
              {m.role === "user" ? <User className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
            </div>

            <div className="flex flex-col max-w-[80%]">
              <div className={`rounded-xl px-3 py-2 text-xs leading-relaxed font-sans shadow-md ${
                m.role === "user" 
                  ? "bg-[#ff4e00] font-medium text-white rounded-tr-none" 
                  : "bg-white/5 text-zinc-200 border border-white/5 rounded-tl-none"
              }`}>
                {m.content}
              </div>
              <span className={`text-[8px] font-mono text-zinc-500 mt-1 ${m.role === "user" ? "text-right" : "text-left"}`}>
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start gap-2.5">
            <div className="bg-[#ff4e00]/10 border border-[#ff4e00]/25 text-[#ff4e00] rounded-lg p-1.5 shrink-0 animate-bounce">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl rounded-tl-none px-3.5 py-2">
              <span className="flex py-1.5 items-center gap-1.5">
                <span className="h-1.5 w-1.5 bg-[#ff4e00] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 bg-[#ff4e00] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 bg-[#ff4e00] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested prompting list */}
      <div className="px-3 py-2 border-t border-white/5 bg-[#050505]/70 flex flex-wrap gap-1.5">
        <span className="text-[8px] font-mono text-zinc-650 block w-full mb-0.5 tracking-wider uppercase font-semibold">Sample Queries:</span>
        {samplePrompts.slice(0, currentMovie ? 2 : 3).map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handlePromptClick(prompt)}
            className="text-[9px] bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-400 hover:text-white px-2 py-1 rounded truncate max-w-full text-left font-sans transition-colors cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Inputs box */}
      <form onSubmit={handleSend} className="p-3 border-t border-white/5 bg-[#050505]/80 flex gap-2">
        <input
          type="text"
          placeholder="Ask Sensei anything about films..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="flex-1 rounded-lg bg-white/5 border border-white/10 text-xs px-3.5 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff4e00]"
        />
        <button
          type="submit"
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-[#ff4e00] text-white hover:bg-[#ff4e00]/90 shadow shadow-[#ff4e02]/30 shrink-0 transition-colors cursor-pointer"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>

    </div>
  );
}
