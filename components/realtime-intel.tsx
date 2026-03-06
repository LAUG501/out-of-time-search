"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type IntelItem = {
  id: string;
  title: string;
  link: string;
  source: string;
  sourceType: "youtube" | "news" | "official" | "community";
  publishedAt: string;
  minuteKey: string;
  summary: string;
  image: string | null;
  visualClusterId: string;
  relevanceScore: number;
};

type IntelTimelineBucket = {
  minute: string;
  count: number;
  items: IntelItem[];
};

type IntelResponse = {
  query: string;
  fetchedAt: string;
  totalItems: number;
  timeline: IntelTimelineBucket[];
};

function sourceBadge(type: IntelItem["sourceType"]): string {
  switch (type) {
    case "youtube":
      return "bg-red-500/15 text-red-700 dark:text-red-300";
    case "official":
      return "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300";
    case "news":
      return "bg-blue-500/15 text-blue-700 dark:text-blue-300";
    default:
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  }
}

export function RealtimeIntel({ query }: { query: string }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<IntelResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadIntel() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/intel?query=${encodeURIComponent(query)}`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Intel request failed with ${response.status}`);
      }
      const payload = (await response.json()) as IntelResponse;
      setData(payload);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unknown feed error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIntel();
    const timer = setInterval(loadIntel, 60000);
    return () => clearInterval(timer);
  }, [query]);

  const topVisualClusters = useMemo(() => {
    if (!data) {
      return [];
    }

    const counts = new Map<string, number>();
    for (const bucket of data.timeline) {
      for (const item of bucket.items) {
        const key = item.visualClusterId;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .filter(([key]) => key !== "no-image")
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [data]);

  const feedStats = useMemo(() => {
    const flat = (data?.timeline ?? []).flatMap((bucket) => bucket.items);
    const youtube = flat.filter((item) => item.sourceType === "youtube").length;
    const news = flat.filter((item) => item.sourceType === "news").length;
    const xPosts = flat.filter((item) => item.sourceType === "community").length;
    return { youtube, news, xPosts };
  }, [data]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Live Intel Feed (Video + RSS + X Public)</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Query: {query} · Auto-refresh every 60 seconds · Relevance-filtered to case keywords.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadIntel} disabled={loading}>
            <RefreshCw className={`mr-1 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          {data ? (
            <div className="text-xs text-muted-foreground">
              Last sync: {new Date(data.fetchedAt).toLocaleString()} · Items: {data.totalItems} · YouTube: {feedStats.youtube} · News: {feedStats.news} · X: {feedStats.xPosts}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.8fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Minute Timeline (Image-to-Image Clue Stream)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && !data ? <p className="text-sm text-muted-foreground">Loading live signals...</p> : null}
            {(data?.timeline ?? []).slice(0, 20).map((bucket) => (
              <div key={bucket.minute} className="rounded-lg border border-border p-3">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  {bucket.minute.replace("T", " ")} UTC · {bucket.count} updates
                </p>
                <div className="space-y-2">
                  {bucket.items.slice(0, 5).map((item) => (
                    <a
                      key={item.id}
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex gap-3 rounded-md p-2 transition hover:bg-muted"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-14 w-24 rounded object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <img src="/media/video-placeholder.svg" alt="Video placeholder" className="h-14 w-24 rounded object-cover" />
                      )}
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-medium">{item.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{item.source} · Relevance {item.relevanceScore}</p>
                      </div>
                      <ExternalLink className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visual Cluster Hints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-xs text-muted-foreground">
              Grouping by recurring image fingerprints from source thumbnails.
            </p>
            {topVisualClusters.length === 0 ? (
              <p className="text-muted-foreground">No repeated visual signatures yet.</p>
            ) : (
              topVisualClusters.map(([clusterId, count]) => (
                <div key={clusterId} className="rounded-md border border-border p-2">
                  <p className="text-xs text-muted-foreground">Cluster</p>
                  <p className="truncate font-mono text-[11px]">{clusterId}</p>
                  <p className="mt-1 text-xs font-semibold">{count} linked items</p>
                </div>
              ))
            )}
            <p className="text-xs text-muted-foreground">
              Tip: use clusters to spot duplicate angles and repeated uploads from multiple channels.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Source Legend</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 text-xs">
          {[
            ["youtube", "YouTube"],
            ["news", "News"],
            ["official", "Official"],
            ["community", "X/Community"],
          ].map(([key, label]) => (
            <span key={key} className={`rounded-full px-2 py-1 ${sourceBadge(key as IntelItem["sourceType"])}`}>
              {label}
            </span>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
