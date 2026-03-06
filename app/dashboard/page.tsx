import Link from "next/link";

import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageSectionsRenderer } from "@/components/portal/page-sections-renderer";
import { buildAnalytics } from "@/lib/mock-data";
import { getForumReports, getForumStats, getForumThreads, getUserForumSummary } from "@/lib/forum-store";
import { listNationalCases } from "@/lib/national-cases";
import { getPortalLayoutBySlug } from "@/lib/portal-builder";
import { listFollowedCaseIds } from "@/lib/user-follows";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const isSignedIn = Boolean(session?.user);
  const isAdmin = session?.user?.role === "admin";

  const [stats, recentThreads, userSummary, openReports, allCases, followedCaseIds, managedLayout] = await Promise.all([
    getForumStats(),
    getForumThreads({ includeHidden: isAdmin, limit: 5 }),
    session?.user?.email ? getUserForumSummary(session.user.email) : Promise.resolve(null),
    isAdmin ? getForumReports({ status: "open" }) : Promise.resolve([]),
    listNationalCases({ limit: 2000 }),
    session?.user?.email ? listFollowedCaseIds(session.user.email) : Promise.resolve([]),
    getPortalLayoutBySlug("dashboard"),
  ]);

  const followedCases = allCases.filter((item) => followedCaseIds.includes(item.id));
  const activeCases = allCases.filter((item) => item.status === "active").length;
  const coveredStates = new Set(allCases.map((item) => item.stateCode)).size;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Operations Dashboard</p>
          <h1 className="text-3xl font-semibold tracking-tight">Portal Command Board</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Unified workspace for case ops, contributor activity, and forum moderation.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/forum">Open Forum</Link>
          </Button>
          <Button asChild>
            <Link href="/mission-control">Open Mission Control</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Threads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.totalThreads}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Threads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.openThreads}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Replies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.totalReplies}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>States Covered</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{coveredStates}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>National Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{allCases.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{activeCases}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Open Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.openReports}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Build Transparency</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
          <p>
            <span className="font-semibold text-foreground">{buildAnalytics.forumAndDashboardCustomLines}</span> lines
            of custom forum/dashboard code added for this release.
          </p>
          <p>
            Built with secure open-source components and credited AI tooling.
            <Link href="/credits" className="ml-1 text-primary hover:underline">View credits</Link>
          </p>
          <p>
            Portal AI is scoped for investigation workflow and portal operations,
            not general homework/chat usage.
          </p>
        </CardContent>
      </Card>

      <PageSectionsRenderer sections={managedLayout?.sections || []} />

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent Forum Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {recentThreads.length === 0 ? (
              <p className="text-muted-foreground">No discussions yet. Start the first thread in the forum.</p>
            ) : (
              recentThreads.map((thread) => (
                <div key={thread.id} className="rounded border border-border p-3">
                  <Link href={`/forum/${thread.id}`} className="font-medium text-primary hover:underline">
                    {thread.title}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {thread.authorName} • {thread.replyCount} replies • {new Date(thread.updatedAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isSignedIn ? "Your Workspace" : "Guest Access"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {isSignedIn ? (
              <>
                <p className="text-muted-foreground">Signed in as {session?.user?.name || session?.user?.email}.</p>
                <p>
                  <span className="font-medium">Threads created:</span> {userSummary?.threadCount || 0}
                </p>
                <p>
                  <span className="font-medium">Replies posted:</span> {userSummary?.replyCount || 0}
                </p>
                <Button asChild size="sm" className="w-full">
                  <Link href="/forum">Create / Respond in Forum</Link>
                </Button>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">Sign in to create threads, post replies, and follow case discussions.</p>
                <Button asChild size="sm" className="w-full">
                  <Link href="/login?callbackUrl=/dashboard">Sign In</Link>
                </Button>
              </>
            )}
            {isAdmin ? (
              <div className="rounded border border-border p-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin Queue</p>
                <p className="mt-1 font-medium">Open moderation reports: {openReports.length}</p>
                <Button asChild size="sm" variant="outline" className="mt-2 w-full">
                  <Link href="/admin">Open Admin Studio</Link>
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cases You Follow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {!isSignedIn ? (
            <p className="text-muted-foreground">Sign in to build your personal case watchlist.</p>
          ) : followedCases.length === 0 ? (
            <p className="text-muted-foreground">You are not following any cases yet. Open National Cases to follow one.</p>
          ) : (
            followedCases.map((item) => (
              <div key={item.id} className="rounded border border-border p-3">
                <Link href={`/cases/${item.id}`} className="font-medium text-primary hover:underline">
                  {item.personName}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {item.stateName} ({item.stateCode}) • {item.status} • updated {new Date(item.updatedAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
          <Button asChild size="sm" variant="outline">
            <Link href="/cases">Open National Cases</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
