"use client";

import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type IntelItem = {
  id: string;
  title: string;
  link: string;
  source: string;
  sourceType: "youtube" | "news" | "official" | "community";
  publishedAt: string;
  image: string | null;
};

type IntelResponse = {
  totalItems: number;
  timeline: Array<{ items: IntelItem[] }>;
};

async function fetchItems(query: string): Promise<IntelItem[]> {
  const response = await fetch(`/api/intel?query=${encodeURIComponent(query)}`, { cache: "no-store" });
  if (!response.ok) {
    return [];
  }
  const payload = (await response.json()) as IntelResponse;
  return payload.timeline.flatMap((bucket) => bucket.items);
}

export function StateMissingBoard() {
  const [nancyItems, setNancyItems] = useState<IntelItem[]>([]);
  const [stateItems, setStateItems] = useState<IntelItem[]>([]);

  useEffect(() => {
    void (async () => {
      const [nancy, arizona] = await Promise.all([
        fetchItems("Nancy Guthrie missing Arizona police photo"),
        fetchItems("missing person Arizona police public bulletin"),
      ]);
      setNancyItems(nancy);
      setStateItems(arizona);
    })();
  }, []);

  const nancyPhotos = useMemo(() => nancyItems.filter((item) => !!item.image).slice(0, 24), [nancyItems]);
  const otherArizona = useMemo(() => stateItems.filter((item) => !!item.image).slice(0, 24), [stateItems]);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Nancy Case - Public Missing Photos and Video Covers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {nancyPhotos.map((item) => (
              <a key={item.id} href={item.link} target="_blank" rel="noreferrer" className="rounded-lg border border-border p-2 hover:bg-muted">
                {item.image ? <img src={item.image} alt={item.title} className="h-32 w-full rounded object-cover" /> : null}
                <p className="mt-2 line-clamp-2 text-xs font-medium">{item.title}</p>
                <p className="text-[11px] text-muted-foreground">{item.source}</p>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Other Arizona Missing Cases - Public Images</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {otherArizona.map((item) => (
              <a key={item.id} href={item.link} target="_blank" rel="noreferrer" className="rounded-lg border border-border p-2 hover:bg-muted">
                {item.image ? <img src={item.image} alt={item.title} className="h-32 w-full rounded object-cover" /> : null}
                <p className="mt-2 line-clamp-2 text-xs font-medium">{item.title}</p>
                <p className="text-[11px] text-muted-foreground">{item.source}</p>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
