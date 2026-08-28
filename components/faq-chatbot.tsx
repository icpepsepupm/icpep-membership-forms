"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { FAQS, CHATBOT_GREETING, type Faq } from "@/lib/faqs"
import { cn } from "@/lib/utils"
import { MessageCircle, X, Send, Bot } from "lucide-react"

type Message = {
  id: number
  role: "bot" | "user"
  text: string
}

function findAnswer(input: string): string {
  const q = input.toLowerCase()
  let best: { faq: Faq; score: number } | null = null
  for (const faq of FAQS) {
    let score = 0
    for (const kw of faq.keywords) {
      if (q.includes(kw)) score += kw.length
    }
    if (score > 0 && (!best || score > best.score)) best = { faq, score }
  }
  if (best) return best.faq.answer
  return "I'm not sure about that one, but our officers can help. Try one of the suggested questions below, or reach us through the official ICPEP social media pages."
}

export function FaqChatbot() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "bot", text: CHATBOT_GREETING },
  ])
  const idRef = useRef(1)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, typing, open])

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || typing) return
    const userMsg: Message = { id: idRef.current++, role: "user", text: trimmed }
    setMessages((m) => [...m, userMsg])
    setInput("")
    setTyping(true)
    const answer = findAnswer(trimmed)
    window.setTimeout(() => {
      setMessages((m) => [...m, { id: idRef.current++, role: "bot", text: answer }])
      setTyping(false)
    }, 650)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat assistant" : "Open chat assistant"}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full text-primary-foreground shadow-lg transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "bg-gradient-to-br from-primary to-accent animate-gradient-pan",
        )}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && (
          <span className="absolute inset-0 -z-10 rounded-full bg-primary/50 animate-ping" aria-hidden="true" />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-24 right-5 z-50 flex h-[30rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl animate-fade-up"
          role="dialog"
          aria-label="FAQ chat assistant"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border bg-gradient-to-r from-primary/15 to-accent/10 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <p className="font-mono text-sm font-bold text-foreground">ICPEP Assistant</p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Online — FAQ bot
              </p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn("flex animate-fade-up", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                    m.role === "user"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-secondary text-secondary-foreground",
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-secondary px-4 py-3">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                      style={{ animation: "dot-bounce 1.2s ease-in-out infinite", animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Suggested questions */}
            {messages.length <= 1 && !typing && (
              <div className="flex flex-wrap gap-2 pt-1">
                {FAQS.slice(0, 5).map((f) => (
                  <button
                    key={f.question}
                    type="button"
                    onClick={() => send(f.question)}
                    className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-left text-xs text-foreground transition-colors hover:bg-primary/20"
                  >
                    {f.question}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-border bg-popover px-3 py-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              aria-label="Type your question"
            />
            <Button
              type="button"
              size="icon"
              onClick={() => send(input)}
              disabled={!input.trim() || typing}
              className="h-9 w-9 shrink-0 rounded-full"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
