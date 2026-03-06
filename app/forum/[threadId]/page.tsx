import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { ForumReplyComposer } from "@/components/forum/forum-reply-composer";
import { ForumReportButton } from "@/components/forum/forum-report-button";
import { Badge } from "@/components/forum/forum-tag";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getForumRepliesByThreadId, getForumThreadById } from "@/lib/forum-store";

type Params = Promise<{ threadId: string }>;

export const dynamic = "force-dynamic";

export default async function ForumThreadPage({ params }: { params: Params }) {
  const { threadId } = await params;
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  const thread = await getForumThreadById(threadId);
  if (!thread) {
    notFound();
  }
  if (!isAdmin && (thread.status === "hidden" || thread.status === "locked")) {
    notFound();
  }

  const replies = await getForumRepliesByThreadId(threadId, { includeHidden: isAdmin });
  const canReply = Boolean(session?.user) && thread.status !== "locked" && thread.status !== "hidden";

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Forum Thread</p>
        <h1 className="text-3xl font-semibold tracking-tight">{thread.title}</h1>
        <p className="mt-2 text-xs text-muted-foreground">
          {thread.authorName} • {new Date(thread.createdAt).toLocaleString()}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thread Context</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-2">
            <Badge value={thread.status} />
            {thread.caseSlug ? <Badge value={`case:${thread.caseSlug}`} /> : null}
            {thread.tags.map((tag) => (
              <Badge key={tag} value={`#${tag}`} />
            ))}
          </div>
          <p className="whitespace-pre-wrap text-muted-foreground">{thread.body}</p>
          {session?.user ? <ForumReportButton targetType="thread" targetId={thread.id} /> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Replies ({replies.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {replies.length === 0 ? <p className="text-muted-foreground">No replies yet.</p> : null}
          {replies.map((reply) => (
            <div key={reply.id} className="rounded border border-border p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  {reply.authorName} • {new Date(reply.createdAt).toLocaleString()}
                </p>
                {session?.user ? <ForumReportButton targetType="reply" targetId={reply.id} /> : null}
              </div>
              <p className="whitespace-pre-wrap text-muted-foreground">{reply.body}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {canReply ? (
        <ForumReplyComposer threadId={thread.id} />
      ) : (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            {session?.user ? (
              "This thread is locked by moderators."
            ) : (
              <>
                Sign in to reply.
                <Link href={`/login?callbackUrl=/forum/${thread.id}`} className="ml-2 font-medium text-primary hover:underline">
                  Sign in now
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
