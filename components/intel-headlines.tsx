"use client";

import { useEffect, useMemo, useState, type SyntheticEvent } from "react";

import { ExternalLinkConfirm } from "@/components/external-link-confirm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type IntelItem = {
  id: string;
  title: string;
  link: string;
  source: string;
  sourceType: "youtube" | "news" | "official" | "community";
  image: string | null;
};

type IntelResponse = {
  timeline: Array<{ items: IntelItem[] }>;
};

type YouTubeVideo = {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  thumbnail: string;
  publishedAt?: string;
  approxPublishedAt?: string;
};

type YouTubeResponse = {
  videos: YouTubeVideo[];
};

export function IntelHeadlines({ query }: { query: string }) {
  const [items, setItems] = useState<IntelItem[]>([]);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);

  function onStoryImageError(event: SyntheticEvent<HTMLImageElement>) {
    const target = event.currentTarget;
    target.onerror = null;
    const alternatives = [
      "/media/case/nancy-cover.jpg",
      "/media/case/white-kia-reference.jpg",
      "/media/missing-person-silhouette.svg",
      "/media/vehicle-of-interest.svg",
    ];
    const current = target.src;
    const next = alternatives.find((item) => !current.includes(item)) || alternatives[0];
    target.src = next;
  }

  function onVideoImageError(event: SyntheticEvent<HTMLImageElement>) {
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
    async function load() {
      const [intelRes, ytRes] = await Promise.all([
        fetch(`/api/intel?query=${encodeURIComponent(query)}`, { cache: "no-store" }),
        fetch(`/api/youtube-search?query=${encodeURIComponent(query)}`, { cache: "no-store" }),
      ]);

      if (intelRes.ok) {
        const data = (await intelRes.json()) as IntelResponse;
        const flat = data.timeline.flatMap((bucket) => bucket.items);
        setItems(flat.slice(0, 40));
      }

      if (ytRes.ok) {
        const data = (await ytRes.json()) as YouTubeResponse;
        setVideos((data.videos || []).slice(0, 8));
      }
    }

    load();
  }, [query]);

  function isLocal(item: IntelItem | YouTubeVideo): boolean {
    const text = `${"source" in item ? item.source : ""} ${item.title}`.toLowerCase();
    return ["arizona", "phoenix", "tucson", "pima", "fox 10", "kgun", "kvoa", "local"].some((token) => text.includes(token));
  }

  const topStories = useMemo(() => items.filter((item) => item.sourceType !== "youtube"), [items]);
  const localStories = useMemo(() => topStories.filter((item) => isLocal(item)).slice(0, 4), [topStories]);
  const nationalStories = useMemo(() => topStories.filter((item) => !isLocal(item)).slice(0, 4), [topStories]);
  const localVideos = useMemo(() => videos.filter((video) => isLocal(video)).slice(0, 4), [videos]);

  const nationalFallback = [
    {
      id: "nat-reuters",
      title: "Reuters coverage and developments",
      source: "Reuters",
      link: "https://www.reuters.com/",
      image: "/media/case/white-kia-reference.jpg",
    },
    {
      id: "nat-ap",
      title: "AP public-interest updates",
      source: "Associated Press",
      link: "https://apnews.com/",
      image: "/media/missing-person-silhouette.svg",
    },
    {
      id: "nat-cnn",
      title: "CNN national missing-person desk",
      source: "CNN",
      link: "https://www.cnn.com/",
      image: "/media/vehicle-of-interest.svg",
    },
    {
      id: "nat-fbi",
      title: "FBI wanted and missing resources",
      source: "FBI",
      link: "https://www.fbi.gov/wanted/kidnap/nancy-guthrie",
      image: "/media/case/nancy-cover.jpg",
    },
  ];

  const localFallback = [
    {
      id: "local-fox10",
      title: "FOX 10 Phoenix Nancy case search feed",
      source: "FOX 10 Phoenix",
      link: "https://www.fox10phoenix.com/search?q=Nancy+Guthrie",
      image: "/media/case/nancy-cover.jpg",
    },
    {
      id: "local-kgun",
      title: "KGUN9 Tucson local updates",
      source: "KGUN9 Tucson",
      link: "https://www.kgun9.com/",
      image: "/media/case/white-kia-reference.jpg",
    },
    {
      id: "local-kvoa",
      title: "KVOA coverage index",
      source: "KVOA",
      link: "https://www.kvoa.com/",
      image: "/media/missing-person-silhouette.svg",
    },
    {
      id: "local-azfamily",
      title: "AZFamily regional reporting",
      source: "AZFamily",
      link: "https://www.azfamily.com/",
      image: "/media/vehicle-of-interest.svg",
    },
  ];

  const localVideoFallback = [
    {
      id: "lv-1",
      title: "Nancy case update search - local coverage",
      source: "YouTube Local Search",
      sourceUrl: "https://www.youtube.com/results?search_query=Nancy+Guthrie+FOX+10+Phoenix",
      thumbnail: "/media/case/nancy-cover.jpg",
      publishedAt: "",
      approxPublishedAt: "",
    },
    {
      id: "lv-2",
      title: "Arizona community clips and update threads",
      source: "YouTube Local Search",
      sourceUrl: "https://www.youtube.com/results?search_query=Nancy+Guthrie+Arizona+update",
      thumbnail: "/media/case/white-kia-reference.jpg",
      publishedAt: "",
      approxPublishedAt: "",
    },
    {
      id: "lv-3",
      title: "Tucson discussion and verified lead recaps",
      source: "YouTube Local Search",
      sourceUrl: "https://www.youtube.com/results?search_query=Nancy+Guthrie+Tucson",
      thumbnail: "/media/video-placeholder.svg",
      publishedAt: "",
      approxPublishedAt: "",
    },
    {
      id: "lv-4",
      title: "Pima-area public camera context updates",
      source: "YouTube Local Search",
      sourceUrl: "https://www.youtube.com/results?search_query=Nancy+Guthrie+Pima+County",
      thumbnail: "/media/missing-person-silhouette.svg",
      publishedAt: "",
      approxPublishedAt: "",
    },
  ];

  const localView = localStories.length ? localStories : localFallback;
  const nationalView = nationalStories.length ? nationalStories : nationalFallback;
  const localVideoView = localVideos.length ? localVideos : localVideoFallback;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Top Stories - Local</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {localView.map((story, index) => (
            <ExternalLinkConfirm key={story.id} href={story.link} className="flex gap-3 rounded-md p-2 hover:bg-muted">
              <img
                src={story.image || ["/media/case/nancy-cover.jpg", "/media/case/white-kia-reference.jpg", "/media/missing-person-silhouette.svg", "/media/vehicle-of-interest.svg"][index % 4]}
                alt={story.title}
                className="h-14 w-24 rounded object-cover"
                loading="lazy"
                onError={onStoryImageError}
              />
              <div>
                <p className="line-clamp-2 text-sm font-medium">{story.title}</p>
                <p className="text-xs text-muted-foreground">{story.source}</p>
              </div>
            </ExternalLinkConfirm>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Stories - National</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {nationalView.map((story, index) => {
            return (
              <ExternalLinkConfirm key={story.id} href={story.link} className="flex gap-3 rounded-md p-2 hover:bg-muted">
                <img
                  src={story.image || ["/media/case/white-kia-reference.jpg", "/media/missing-person-silhouette.svg", "/media/vehicle-of-interest.svg", "/media/case/nancy-cover.jpg"][index % 4]}
                  alt={story.title}
                  className="h-14 w-24 rounded object-cover"
                  loading="lazy"
                  onError={onStoryImageError}
                />
                <div>
                  <p className="line-clamp-2 text-sm font-medium">{story.title}</p>
                  <p className="text-xs text-muted-foreground">{story.source}</p>
                </div>
              </ExternalLinkConfirm>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Local YouTube Updates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {localVideoView.map((video) => {
            const label = publishedLabel(video);
            return (
              <ExternalLinkConfirm key={video.id} href={video.sourceUrl} className="flex gap-3 rounded-md p-2 hover:bg-muted">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-14 w-24 rounded object-cover"
                  loading="lazy"
                  onError={onVideoImageError}
                />
                <div>
                  <p className="line-clamp-2 text-sm font-medium">{video.title}</p>
                  <p className="text-xs text-muted-foreground">{video.source}{label ? ` · ${label}` : ""}</p>
                </div>
              </ExternalLinkConfirm>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>National News Outlets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {nationalFallback.map((story) => (
            <ExternalLinkConfirm key={story.id} href={story.link} className="block rounded-md border border-border p-3 hover:bg-muted">
              <p className="font-medium">{story.source}</p>
              <p className="text-xs text-muted-foreground">{story.title}</p>
            </ExternalLinkConfirm>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
