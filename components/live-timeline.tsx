"use client";

import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type TimelineItem = {
  id: string;
  timestamp: string;
  title: string;
  type: "tip" | "news" | "video" | "sighting";
  confidence: number;
  source: string;
  details: string;
};

type IntelItem = {
  id: string;
  title: string;
  link: string;
  source: string;
  sourceType: "youtube" | "news" | "official" | "community";
  publishedAt: string;
  summary: string;
  relevanceScore: number;
};

type IntelResponse = {
  timeline: Array<{ minute: string; items: IntelItem[] }>;
};

function mapType(sourceType: IntelItem["sourceType"]): TimelineItem["type"] {
  if (sourceType === "youtube") {
    return "video";
  }
  if (sourceType === "community") {
    return "tip";
  }
  return "news";
}

const eventTypeColor: Record<TimelineItem["type"], string> = {
  tip: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  news: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  video: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  sighting: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

export function LiveTimeline() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<TimelineItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  function toTime(value: string): number {
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  async function loadTimeline() {
    const response = await fetch(
      "/api/intel?query=Nancy%20Guthrie%20missing%20Arizona%20night%20camera%20update",
      { cache: "no-store" }
    );
    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as IntelResponse;
    const nextItems: TimelineItem[] = payload.timeline
      .flatMap((bucket) =>
        bucket.items.map((item) => ({
          id: item.id,
          timestamp: item.publishedAt || bucket.minute,
          title: item.title,
          type: mapType(item.sourceType),
          confidence: Math.min(98, Math.max(25, item.relevanceScore * 4)),
          source: item.source,
          details: item.summary || "No summary available",
        }))
      )
      .sort((a, b) => toTime(a.timestamp) - toTime(b.timestamp))
      .slice(0, 80);

    setItems(nextItems);
    if (nextItems.length) {
      setCursor(0);
      setSelected(nextItems[0]);
    }
  }

  useEffect(() => {
    loadTimeline();
    const timer = setInterval(loadTimeline, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!items.length || !isPlaying) {
      return;
    }

    const timer = setInterval(() => {
      setCursor((prev) => {
        if (prev >= items.length - 1) {
          return prev;
        }
        const next = prev + 1;
        setSelected(items[next]);
        return next;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [items, isPlaying]);

  useEffect(() => {
    if (!items.length || typeof window === "undefined") {
      return;
    }

    const active = items[cursor];
    if (!active) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent("mission-playhead", {
        detail: {
          index: cursor,
          total: items.length,
          timestamp: active.timestamp,
        },
      })
    );
  }, [cursor, items]);

  const active = useMemo(() => items.slice(0, cursor + 1), [items, cursor]);
  const totalDays = useMemo(() => {
    if (!items.length) {
      return 1;
    }
    const first = toTime(items[0].timestamp);
    const last = toTime(items[items.length - 1].timestamp);
    if (!first || !last || last <= first) {
      return items.length;
    }
    return Math.max(1, Math.floor((last - first) / (24 * 60 * 60 * 1000)) + 1);
  }, [items]);

  const activeDay = useMemo(() => {
    if (!items.length) {
      return 1;
    }
    const first = toTime(items[0].timestamp);
    const current = toTime(items[cursor]?.timestamp ?? items[0].timestamp);
    if (!first || !current || current <= first) {
      return cursor + 1;
    }
    return Math.max(1, Math.floor((current - first) / (24 * 60 * 60 * 1000)) + 1);
  }, [cursor, items]);

  if (!items.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Minute Timeline (Image-to-Image Clue Stream)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Loading latest timeline events...</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Minute Timeline (Image-to-Image Clue Stream)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between gap-3">
            <input
              type="range"
              min={0}
              max={Math.max(0, items.length - 1)}
              value={cursor}
              onChange={(event) => {
                const next = Number(event.target.value);
                setCursor(next);
                setSelected(items[next]);
              }}
              className="w-full"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const next = cursor === items.length - 1 ? 0 : cursor + 1;
                setCursor(next);
                setSelected(items[next]);
              }}
            >
              Step
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying((prev) => !prev)}
            >
              {isPlaying ? "Pause" : "Play"}
            </Button>
          </div>
          <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Day 1 (first known event)</span>
            <span>Day {activeDay} of {totalDays}</span>
            <span>Latest day</span>
          </div>
          <div className="mb-3 rounded-md border border-border bg-muted/30 p-3 text-sm">
            <p className="mb-1 font-semibold">Event Detail</p>
            {selected ? (
              <div className="space-y-1">
                <p><span className="font-semibold">What:</span> {selected.title}</p>
                <p><span className="font-semibold">How sourced:</span> {selected.source}</p>
                <p><span className="font-semibold">When:</span> {new Date(selected.timestamp).toLocaleString()}</p>
                <p><span className="font-semibold">Confidence:</span> {selected.confidence}%</p>
                <p><span className="font-semibold">Details:</span> {selected.details}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Select a timeline event.</p>
            )}
          </div>
          <div className="mb-3 text-xs text-muted-foreground">Showing {active.length} of {items.length} events in chronological order (Day 1 forward)</div>
          <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
            {active.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className="flex w-full items-start gap-3 rounded-md border border-border px-3 py-2 text-left transition hover:bg-muted"
              >
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium">{item.title}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleString()} · {item.source}</p>
                  <p className="text-xs text-muted-foreground">Confidence: {item.confidence}% · {item.type} update</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs ${eventTypeColor[item.type]}`}>
                  {item.type}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
