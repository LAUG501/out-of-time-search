"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type NewsItem = {
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  summary: string;
  imageUrl?: string;
};

type DraftResponse = {
  ok: boolean;
  cadence?: "daily" | "weekly";
  model?: string;
  draft?: string;
  n8nStatus?: string;
  error?: string;
};

export default function BlogPage() {
  const [cadence, setCadence] = useState<"daily" | "weekly">("daily");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [draft, setDraft] = useState("");
  const [n8nStatus, setN8nStatus] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const pullLatest = async () => {
    setError("");
    setStatus("Pulling latest news...");
    const response = await fetch("/api/blog/latest", { cache: "no-store" });
    const payload = (await response.json()) as { items?: NewsItem[]; error?: string };
    if (!response.ok) {
      setStatus("");
      setError(payload.error || "Unable to pull news");
      return;
    }
    setNews(payload.items || []);
    setStatus(`Pulled ${payload.items?.length || 0} latest relevant blog items.`);
  };

  const draftWithAi = async () => {
    setError("");
    setStatus(`Drafting ${cadence} post with AI...`);
    const response = await fetch("/api/blog/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cadence }),
    });
    const payload = (await response.json()) as DraftResponse;
    if (!response.ok || !payload.ok) {
      setStatus("");
      setError(payload.error || "Unable to draft blog post");
      return;
    }
    setDraft(payload.draft || "");
    setN8nStatus(payload.n8nStatus || "");
    setStatus(`Drafted with ${payload.model || "AI model"}.`);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>AI Blog + News Alerts</CardTitle>
          <CardDescription>
            Pull daily news, create weekly digest, and draft updates with Ollama cloud.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={pullLatest}>Pull 5 Latest Blogs</Button>
            <Button type="button" variant="outline" onClick={() => setCadence(cadence === "daily" ? "weekly" : "daily")}>
              Switch to {cadence === "daily" ? "weekly" : "daily"}
            </Button>
            <Button type="button" variant="outline" onClick={draftWithAi}>
              AI Draft {cadence}
            </Button>
          </div>
          {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
          {n8nStatus ? <p className="text-xs text-muted-foreground">n8n daily pipeline: {n8nStatus}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Latest News</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm">
            {news.map((item, index) => (
              <li key={`${item.link}-${index}`} className="overflow-hidden rounded-lg border border-border bg-card">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.title} className="h-44 w-full object-cover" />
                ) : null}
                <div className="space-y-1 p-3">
                  <a href={item.link} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
                    {item.title}
                  </a>
                  <p className="text-xs text-muted-foreground">{item.source} - {new Date(item.publishedAt).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{item.summary}</p>
                </div>
              </li>
            ))}
            {news.length === 0 ? <li className="text-sm text-muted-foreground">No feed loaded yet. Click "Pull 5 Latest Blogs".</li> : null}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Draft Output</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-md border border-border bg-muted/40 p-3 text-sm">{draft || "No draft yet."}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
