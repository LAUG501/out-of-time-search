"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type FollowCaseButtonProps = {
  caseId: string;
  initialFollowed: boolean;
  requiresAuth?: boolean;
};

export function FollowCaseButton({ caseId, initialFollowed, requiresAuth }: FollowCaseButtonProps) {
  const [followed, setFollowed] = useState(initialFollowed);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (requiresAuth) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(`/cases/${caseId}`)}`;
      return;
    }

    setBusy(true);
    const response = await fetch("/api/user/follows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId }),
    });
    const payload = (await response.json()) as { ok: boolean; followed?: boolean };
    if (response.ok && payload.ok) {
      setFollowed(Boolean(payload.followed));
    }
    setBusy(false);
  }

  return (
    <Button variant={followed ? "outline" : "default"} size="sm" onClick={() => void toggle()} disabled={busy}>
      {followed ? "Following" : "Follow Case"}
    </Button>
  );
}
