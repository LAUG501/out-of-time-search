import Parser from "rss-parser";

export type IntelItem = {
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

type FeedSource = {
  url: string;
  source: string;
  sourceType: IntelItem["sourceType"];
};

const parser = new Parser({
  timeout: 12000,
  customFields: {
    item: [
      ["media:thumbnail", "mediaThumbnail"],
      ["media:content", "mediaContent"],
      ["media:group", "mediaGroup"],
      ["enclosure", "enclosure"],
      ["description", "description"],
      ["content:encoded", "contentEncoded"],
      ["yt:videoId", "ytVideoId"],
    ],
  },
});

function clean(input: string | undefined): string {
  if (!input) {
    return "";
  }
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function toMinuteKey(dateValue: string): string {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "unknown-minute";
  }
  return date.toISOString().slice(0, 16);
}

function pickUrlFromUnknown(input: unknown): string | null {
  if (!input) {
    return null;
  }

  if (typeof input === "string") {
    return input;
  }

  if (Array.isArray(input)) {
    for (const part of input) {
      const found = pickUrlFromUnknown(part);
      if (found) {
        return found;
      }
    }
    return null;
  }

  if (typeof input === "object") {
    const record = input as Record<string, unknown>;
    const direct = record.url;
    if (typeof direct === "string") {
      return direct;
    }
    const nested = record.$ as Record<string, unknown> | undefined;
    if (nested?.url && typeof nested.url === "string") {
      return nested.url;
    }

    for (const value of Object.values(record)) {
      const found = pickUrlFromUnknown(value);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

function youtubeThumbnailFromLink(link: string, itemRecord: Record<string, unknown>): string | null {
  const ytVideoId = itemRecord.ytVideoId;
  if (typeof ytVideoId === "string" && ytVideoId.trim()) {
    return `https://i.ytimg.com/vi/${ytVideoId.trim()}/hqdefault.jpg`;
  }

  try {
    const url = new URL(link);
    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v");
      if (id) {
        return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      }
    }
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace("/", "").trim();
      if (id) {
        return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function pickImage(item: Record<string, unknown>, link: string): string | null {
  const fromMedia =
    pickUrlFromUnknown(item.mediaThumbnail) ??
    pickUrlFromUnknown(item.mediaContent) ??
    pickUrlFromUnknown(item.mediaGroup) ??
    pickUrlFromUnknown(item.enclosure) ??
    pickUrlFromUnknown(item["itunes:image"]);

  if (fromMedia) {
    return fromMedia;
  }

  return youtubeThumbnailFromLink(link, item);
}

function toVisualClusterId(image: string | null): string {
  if (!image) {
    return "no-image";
  }

  try {
    const url = new URL(image);
    return `${url.hostname}${url.pathname}`.toLowerCase().slice(0, 120);
  } catch {
    return image.toLowerCase().slice(0, 120);
  }
}

function googleNewsRss(query: string): string {
  const encoded = encodeURIComponent(query);
  return `https://news.google.com/rss/search?q=${encoded}+when:21d&hl=en-US&gl=US&ceid=US:en`;
}

function buildSources(query: string): FeedSource[] {
  const encoded = encodeURIComponent(query);

  return [
    {
      url: googleNewsRss(query),
      source: "Google News - General",
      sourceType: "news",
    },
    {
      url: googleNewsRss(`${query} site:fox10phoenix.com`),
      source: "Google News - FOX 10 Phoenix",
      sourceType: "news",
    },
    {
      url: googleNewsRss(`${query} site:12news.com`),
      source: "Google News - 12News",
      sourceType: "news",
    },
    {
      url: googleNewsRss(`${query} site:abc15.com`),
      source: "Google News - ABC15",
      sourceType: "news",
    },
    {
      url: googleNewsRss(`${query} site:azcentral.com`),
      source: "Google News - AZCentral",
      sourceType: "news",
    },
    {
      url: googleNewsRss(`${query} site:kgun9.com`),
      source: "Google News - KGUN9",
      sourceType: "news",
    },
    {
      url: googleNewsRss(`${query} site:youtube.com`),
      source: "Google News - YouTube",
      sourceType: "youtube",
    },
    {
      url: "https://www.fox10phoenix.com/rss",
      source: "FOX 10 Phoenix",
      sourceType: "news",
    },
    {
      url: "https://rss.nytimes.com/services/xml/rss/nyt/US.xml",
      source: "NYTimes US",
      sourceType: "news",
    },
    {
      url: "https://www.azfamily.com/search/?f=rss&t=article&l=100&s=start_time&sd=desc&k=nancy+guthrie",
      source: "AZ Family Search",
      sourceType: "news",
    },
    {
      url: "https://www.missingkids.org/feeds/missingkids.rss",
      source: "NCMEC",
      sourceType: "official",
    },
    {
      url: `https://nitter.net/search/rss?f=tweets&q=${encoded}`,
      source: "X Public Search",
      sourceType: "community",
    },
    {
      url: `https://nitter.net/search/rss?f=tweets&q=${encodeURIComponent(`${query} reward`)}`,
      source: "X Public Search - Reward",
      sourceType: "community",
    },
  ];
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function relevance(query: string, text: string): number {
  const qTokens = tokenize(query).filter((token) => token.length > 2);
  const t = text.toLowerCase();

  const boostTerms = ["nancy", "guthrie", "missing", "reward", "ring", "camera", "vehicle", "arizona"];
  const antiTerms = ["iran", "israel", "ukraine", "gaza", "nuclear", "war", "missile", "epic fury"];

  let score = 0;

  for (const token of qTokens) {
    if (t.includes(token)) {
      score += token === "nancy" || token === "guthrie" ? 6 : 2;
    }
  }

  for (const token of boostTerms) {
    if (t.includes(token)) {
      score += token === "nancy" || token === "guthrie" ? 5 : 1;
    }
  }

  for (const token of antiTerms) {
    if (t.includes(token)) {
      score -= 6;
    }
  }

  return score;
}

export async function fetchIntel(query: string): Promise<IntelItem[]> {
  const sources = buildSources(query);

  const settled = await Promise.allSettled(
    sources.map(async (source) => {
      const feed = await parser.parseURL(source.url);
      const items = feed.items ?? [];
      const sliceSize = source.sourceType === "youtube" ? 60 : 35;

      return items.slice(0, sliceSize).map((item) => {
        const record = item as unknown as Record<string, unknown>;
        const link = item.link?.trim() || "";
        const publishedAt = item.isoDate ?? item.pubDate ?? record.published?.toString() ?? "";
        const summary = clean(
          item.contentSnippet || item.content || (record.contentEncoded as string | undefined) || ""
        );
        const image = pickImage(record, link);
        const text = `${item.title ?? ""} ${summary} ${link}`;
        let relevanceScore = relevance(query, text);
        if (source.sourceType === "youtube") {
          relevanceScore += 4;
        }
        if (source.sourceType === "community") {
          relevanceScore += 2;
        }

        return {
          id: `${source.source}-${item.guid ?? link ?? item.title ?? Math.random().toString(36)}`,
          title: item.title?.trim() || "Untitled update",
          link,
          source: source.source,
          sourceType: source.sourceType,
          publishedAt,
          minuteKey: toMinuteKey(publishedAt),
          summary,
          image,
          visualClusterId: toVisualClusterId(image),
          relevanceScore,
        } satisfies IntelItem;
      });
    })
  );

  const merged = settled
    .filter((result): result is PromiseFulfilledResult<IntelItem[]> => result.status === "fulfilled")
    .flatMap((result) => result.value)
    .filter((item) => item.link && item.publishedAt)
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));

  const deduped = new Map<string, IntelItem>();
  for (const item of merged) {
    const key = item.link.toLowerCase();
    const existing = deduped.get(key);
    if (!existing || item.relevanceScore > existing.relevanceScore) {
      deduped.set(key, item);
    }
  }

  const filtered = Array.from(deduped.values())
    .filter((item) => {
      if (item.sourceType === "youtube") {
        return item.relevanceScore >= 1;
      }
      if (item.sourceType === "community") {
        return item.relevanceScore >= 2;
      }
      return item.relevanceScore >= 4;
    })
    .sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return +new Date(b.publishedAt) - +new Date(a.publishedAt);
    });

  return filtered.slice(0, 240);
}
