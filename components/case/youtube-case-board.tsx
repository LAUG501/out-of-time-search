"use client";

import { useEffect, useState, type SyntheticEvent } from "react";
import { Play } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type YouTubeVideo = {
  id: string;
  title: string;
  videoId: string;
  source: string;
  sourceUrl: string;
  thumbnail: string;
  publishedAt?: string;
  approxPublishedAt?: string;
};

type YouTubeResponse = {
  total: number;
  videos: YouTubeVideo[];
};

export function YouTubeCaseBoard({ query }: { query: string }) {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  function onThumbnailError(event: SyntheticEvent<HTMLImageElement>) {
    const target = event.currentTarget;
    target.onerror = null;
    target.src = "/media/video-placeholder.svg";
  }

  function publishedLabel(video: YouTubeVideo): string {
    if (video.publishedAt?.trim()) {
      return video.publishedAt;
    }
    if (video.approxPublishedAt) {
      const parsed = new Date(video.approxPublishedAt);
      if (!Number.isNaN(parsed.getTime())) {
        return `approx ${parsed.toLocaleDateString()}`;
      }
    }
    return "";
  }

  useEffect(() => {
    async function loadVideos() {
      const response = await fetch(`/api/youtube-search?query=${encodeURIComponent(query)}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        return;
      }
      const payload = (await response.json()) as YouTubeResponse;
      setVideos(payload.videos);
    }

    loadVideos();
  }, [query]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>YouTube Video Board (In-Portal Playback)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => {
            const label = publishedLabel(video);
            return (
              <div key={video.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <button type="button" onClick={() => setActiveVideoId(video.videoId)} className="group relative block w-full">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="h-44 w-full object-cover"
                    loading="lazy"
                    onError={onThumbnailError}
                  />
                  <div className="absolute inset-0 bg-black/25 opacity-0 transition group-hover:opacity-100" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="rounded-full bg-red-600 p-3 text-white shadow-lg">
                      <Play className="h-5 w-5" fill="currentColor" />
                    </span>
                  </div>
                </button>
                <div className="p-3">
                  <p className="line-clamp-2 text-sm font-medium">{video.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{video.source}{label ? ` · ${label}` : ""}</p>
                  <a href={video.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold text-primary hover:underline">
                    Open on YouTube
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {activeVideoId ? (
          <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 p-4" onClick={() => setActiveVideoId(null)}>
            <div className="w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveVideoId(null)}
                  className="rounded bg-slate-800 px-3 py-1 text-xs font-semibold text-white"
                >
                  Close
                </button>
              </div>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?rel=0`}
                title="YouTube case player"
                className="aspect-video w-full rounded-lg border border-slate-500"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
              <p className="mt-2 text-xs text-slate-200">
                If playback is restricted by the uploader, use "Open on YouTube" on the video card.
              </p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
