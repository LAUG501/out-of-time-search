import Link from "next/link";

import { auth } from "@/auth";
import { ForumThreadComposer } from "@/components/forum/forum-thread-composer";
import { Badge } from "@/components/forum/forum-tag";
import { PageSectionsRenderer } from "@/components/portal/page-sections-renderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getForumThreads } from "@/lib/forum-store";
import { forumGuideSections, portalLatestNews } from "@/lib/mock-data";
import { getPortalLayoutBySlug } from "@/lib/portal-builder";

type SearchParams = Promise<{ q?: string; tag?: string; case?: string; status?: string }>;

const fallbackGuideSections = [
  {
    title: "Welcome",
    points: [
      "Welcome to the Out of Time Search Forum.",
      "This space is for evidence-based case discussion and portal coordination.",
    ],
  },
  {
    title: "How to Use This Forum",
    points: [
      "Use clear titles and include source links whenever possible.",
      "Use tags and case slug to make threads easier to find.",
      "Post corrections in replies so timelines stay accurate.",
    ],
  },
  {
    title: "Rules",
    points: [
      "No harassment, doxxing, or unverified accusations.",
      "Keep discussion case-relevant and respectful.",
      "Report risky or misleading content for moderator review.",
    ],
  },
  {
    title: "What We Need",
    points: [
      "Timestamped source links and location context.",
      "Accurate timeline updates and validation help.",
      "Constructive collaboration that supports families and investigators.",
    ],
  },
];

const fallbackLatestNews = [
  {
    date: "2026-03-04",
    title: "Forum and Dashboard Now Live",
    details: "The forum, reporting flow, moderation queue, and user dashboard are active.",
  },
];

export const dynamic = "force-dynamic";

export default async function ForumPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";
  const params = await searchParams;
  const status =
    params.status === "active" ||
    params.status === "flagged" ||
    params.status === "hidden" ||
    params.status === "locked"
      ? params.status
      : undefined;

  const threads = await getForumThreads({
    includeHidden: isAdmin,
    status: isAdmin ? status : undefined,
    query: params.q,
    tag: params.tag,
    caseSlug: params.case,
    limit: 200,
  });

  const guideSections = forumGuideSections.length > 0 ? forumGuideSections : fallbackGuideSections;
  const latestNews = portalLatestNews.length > 0 ? portalLatestNews : fallbackLatestNews;
  const managedLayout = await getPortalLayoutBySlug("forum");

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Community Forum</p>
        <h1 className="text-3xl font-semibold tracking-tight">Case Discussions and OSINT Collaboration</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pair every post with source context, timeline notes, and clear evidence boundaries.
        </p>
      </div>

      <section className="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">Forum Front Section</p>
        <h2 className="mt-1 text-xl font-semibold">Start Here: Welcome, Rules, and Latest News</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This area explains how to use the forum before posting or replying.
        </p>
      </section>

      <PageSectionsRenderer sections={managedLayout?.sections || []} />

      <div className="grid gap-3 md:grid-cols-2">
        {guideSections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {section.points.map((point) => (
                <p key={point}>- {point}</p>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest News About Us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {latestNews.map((item) => (
            <p key={`${item.date}-${item.title}`}>
              - <span className="font-semibold text-foreground">{item.title}</span> ({item.date}): {item.details}
            </p>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-2 md:grid-cols-4" action="/forum" method="get">
            <input
              className="h-10 rounded border border-border bg-background px-3 text-sm"
              name="q"
              placeholder="Search threads"
              defaultValue={params.q || ""}
            />
            <input
              className="h-10 rounded border border-border bg-background px-3 text-sm"
              name="tag"
              placeholder="Tag"
              defaultValue={params.tag || ""}
            />
            <input
              className="h-10 rounded border border-border bg-background px-3 text-sm"
              name="case"
              placeholder="Case slug"
              defaultValue={params.case || ""}
            />
            <button className="h-10 rounded bg-primary px-3 text-sm font-medium text-primary-foreground" type="submit">
              Apply Filters
            </button>
          </form>
        </CardContent>
      </Card>

      {session?.user ? (
        <ForumThreadComposer defaultCaseSlug={params.case || ""} />
      ) : (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Sign in to start a thread or post replies.
            <Link className="ml-2 font-medium text-primary hover:underline" href="/login?callbackUrl=/forum">
              Sign in now
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {threads.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">No threads match this filter set.</CardContent>
          </Card>
        ) : (
          threads.map((thread) => (
            <Card key={thread.id}>
              <CardContent className="space-y-2 pt-4 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/forum/${thread.id}`} className="text-base font-semibold text-primary hover:underline">
                    {thread.title}
                  </Link>
                  <Badge value={thread.status} />
                  {thread.caseSlug ? <Badge value={`case:${thread.caseSlug}`} /> : null}
                </div>
                <p className="line-clamp-3 text-muted-foreground">{thread.body}</p>
                <div className="flex flex-wrap gap-2">
                  {thread.tags.map((tag) => (
                    <Badge key={`${thread.id}-${tag}`} value={`#${tag}`} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {thread.authorName} • {thread.replyCount} replies • {new Date(thread.updatedAt).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
