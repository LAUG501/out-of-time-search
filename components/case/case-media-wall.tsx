"use client";

import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LightboxImage } from "@/components/ui/lightbox-image";
import { nancyPublicPhotos } from "@/lib/case-media";

type IntelItem = {
  id: string;
  title: string;
  link: string;
  source: string;
  sourceType: "youtube" | "news" | "official" | "community";
  image: string | null;
  relevanceScore: number;
};

type IntelResponse = {
  totalItems: number;
  timeline: Array<{ items: IntelItem[] }>;
};

export function CaseMediaWall({ query }: { query: string }) {
  const [items, setItems] = useState<IntelItem[]>([]);

  useEffect(() => {
    async function load() {
      const response = await fetch(`/api/intel?query=${encodeURIComponent(query)}`, { cache: "no-store" });
      if (!response.ok) {
        return;
      }
      const payload = (await response.json()) as IntelResponse;
      setItems(payload.timeline.flatMap((bucket) => bucket.items));
    }
    load();
  }, [query]);

  const stories = useMemo(() => items.filter((item) => item.sourceType !== "youtube").slice(0, 100), [items]);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Case Image Gallery (Click to Zoom)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {nancyPublicPhotos.map((photo) => (
              <div key={photo.id} className="rounded-lg border border-border p-2">
                <LightboxImage
                  src={photo.image}
                  alt={photo.title}
                  className="h-44 w-full rounded object-cover"
                />
                <p className="mt-2 text-sm font-medium">{photo.title}</p>
                <a
                  href={photo.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  Source: {photo.source}
                </a>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>News and Public Updates ({stories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stories.map((story) => (
              <a
                key={story.id}
                href={story.link}
                target="_blank"
                rel="noreferrer"
                className="block rounded-md border border-border p-2 hover:bg-muted"
              >
                <p className="text-sm font-medium">{story.title}</p>
                <p className="text-xs text-muted-foreground">{story.source} · Relevance {story.relevanceScore}</p>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
