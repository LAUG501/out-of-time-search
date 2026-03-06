"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type ForumReportButtonProps = {
  targetType: "thread" | "reply";
  targetId: string;
};

export function ForumReportButton({ targetType, targetId }: ForumReportButtonProps) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function reportItem() {
    setBusy(true);
    setStatus("Submitting...");

    const response = await fetch("/api/forum/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetType,
        targetId,
        reason: "Needs moderator review",
      }),
    });

    const payload = (await response.json()) as { ok: boolean; error?: string };
    if (!response.ok || !payload.ok) {
      setStatus(payload.error || "Unable to submit");
      setBusy(false);
      return;
    }

    setStatus("Reported");
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-2">
      <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void reportItem()}>
        Report
      </Button>
      {status ? <span className="text-xs text-muted-foreground">{status}</span> : null}
    </div>
  );
}
