"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Message = { role: "user" | "assistant"; text: string };
type AssistantReply = { ok: boolean; reply?: string; route?: string; actionLabel?: string };

const quickPrompts = [
  "How do I use this portal for Nancy's case?",
  "Got a tip - what exact fields do I submit?",
  "Any new clues from current case context?",
  "How do I continue building the case?",
];

export function PortalAssistantPanel() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "MAXX Portal Assistant online. I am scoped to the active Nancy case and build workflow." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask(text: string) {
    const question = text.trim();
    if (!question || loading) {
      return;
    }

    const next = [...messages, { role: "user" as const, text: question }];
    setMessages(next);
    setInput("");
    setLoading(true);

    let reply = "I can help with Nancy case workflow, tip routing, and reward claim steps.";
    let route: string | undefined;
    let actionLabel: string | undefined;
    try {
      const response = await fetch("/api/case-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          caseName: "Nancy Guthrie",
          stepTitle: "Portal guidance",
          completion: 0,
          history: messages.slice(-6),
        }),
      });

      if (response.ok) {
        const payload = (await response.json()) as AssistantReply;
        if (payload.ok && payload.reply) {
          reply = payload.reply;
          route = payload.route;
          actionLabel = payload.actionLabel;
        }
      }
    } catch {
      // fallback kept above
    }

    const withShortcut = route
      ? `${reply}\n\nShortcut: ${actionLabel || "Open section"} -> ${route}`
      : reply;
    setMessages([...next, { role: "assistant", text: withShortcut }]);
    setLoading(false);

    if (route && /take me there|go there|open it|navigate|bring me/i.test(question)) {
      window.location.href = route;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>MAXX Portal Assistant</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <Button key={prompt} variant="outline" size="sm" onClick={() => void ask(prompt)}>
              {prompt}
            </Button>
          ))}
        </div>
        <div className="max-h-40 space-y-2 overflow-auto rounded border border-border p-2">
          {messages.map((message, index) => (
            <p key={`${message.role}-${index}`} className={message.role === "assistant" ? "text-muted-foreground" : "font-medium"}>
              {message.role === "assistant" ? "MAXX: " : "You: "}{message.text}
            </p>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="h-10 flex-1 rounded border border-border bg-background px-3"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about clues, tips, or build workflow"
          />
          <Button onClick={() => void ask(input)} disabled={loading}>{loading ? "..." : "Ask"}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
