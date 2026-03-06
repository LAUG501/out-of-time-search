"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type Props = {
  defaultCaseSlug?: string;
};

export function ForumThreadComposer({ defaultCaseSlug = "" }: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [caseSlug, setCaseSlug] = useState(defaultCaseSlug);
  const [status, setStatus] = useState<string>("");

  return (
    <form
      className="space-y-2 rounded-lg border border-border bg-card p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setStatus("");
        const response = await fetch("/api/forum/threads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            body,
            tags: tags
              .split(",")
              .map((item) => item.trim().toLowerCase())
              .filter(Boolean),
            caseSlug,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          setStatus(payload.error ?? "Unable to create thread");
          return;
        }

        setTitle("");
        setBody("");
        setTags("");
        setStatus("Thread posted. Refresh to see it in the list.");
      }}
    >
      <p className="text-sm font-medium">Start a forum thread</p>
      <input
        className="h-10 w-full rounded border border-border bg-background px-3 text-sm"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Thread title"
        required
      />
      <textarea
        className="min-h-24 w-full rounded border border-border bg-background px-3 py-2 text-sm"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="What should the community review?"
        required
      />
      <div className="grid gap-2 md:grid-cols-2">
        <input
          className="h-10 rounded border border-border bg-background px-3 text-sm"
          value={caseSlug}
          onChange={(event) => setCaseSlug(event.target.value)}
          placeholder="Case slug (optional)"
        />
        <input
          className="h-10 rounded border border-border bg-background px-3 text-sm"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="Tags separated by commas"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit">Post thread</Button>
        {status ? <p className="text-xs text-muted-foreground">{status}</p> : null}
      </div>
    </form>
  );
}
