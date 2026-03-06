"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type ForumReplyComposerProps = {
  threadId: string;
};

export function ForumReplyComposer({ threadId }: ForumReplyComposerProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function submitReply() {
    setBusy(true);
    setStatus("Posting reply...");

    const response = await fetch(`/api/forum/threads/${threadId}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });

    const payload = (await response.json()) as { ok: boolean; error?: string };
    if (!response.ok || !payload.ok) {
      setBusy(false);
      setStatus(payload.error || "Unable to post reply");
      return;
    }

    setBody("");
    setStatus("Reply posted.");
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-3">
      <p className="text-sm font-medium">Add Reply</p>
      <textarea
        className="w-full rounded border border-border bg-background p-3 text-sm"
        rows={4}
        placeholder="Share source context, corrections, or next-step suggestions."
        value={body}
        onChange={(event) => setBody(event.target.value)}
      />
      <div className="flex items-center gap-2">
        <Button type="button" size="sm" disabled={busy} onClick={() => void submitReply()}>
          Post Reply
        </Button>
        {status ? <p className="text-xs text-muted-foreground">{status}</p> : null}
      </div>
    </div>
  );
}
