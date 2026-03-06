"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PortalContent = {
  home: {
    heroTitle: string;
    heroSubtitle: string;
    focusNote: string;
    imagesNote: string;
  };
  missionControl: {
    guide: string;
    evidenceStandard: string;
  };
  buildYourCase: {
    priorityMessage: string;
    partsCount: string;
  };
  rewardWorkflow: {
    summary: string;
  };
  didYouKnow: {
    summary: string;
  };
  agencyContacts: {
    summary: string;
  };
  case: {
    nancy: {
      nightWindow: string;
      suspectPolicy: string;
    };
  };
};

export default function SettingsPage() {
  const [content, setContent] = useState<PortalContent | null>(null);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/content", { cache: "no-store" });
      if (!response.ok) {
        return;
      }
      const payload = (await response.json()) as PortalContent;
      setContent(payload);
    }
    load();
  }, []);

  async function save() {
    if (!content) {
      return;
    }
    setStatus("Saving...");
    const response = await fetch("/api/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    setStatus(response.ok ? "Saved" : "Save failed");
  }

  function update(path: string, value: string) {
    if (!content) {
      return;
    }
    const draft = structuredClone(content) as PortalContent;
    const keys = path.split(".");
    let current: Record<string, unknown> = draft as unknown as Record<string, unknown>;
    for (let i = 0; i < keys.length - 1; i += 1) {
      current = current[keys[i]] as Record<string, unknown>;
    }
    current[keys[keys.length - 1]] = value;
    setContent(draft);
  }

  if (!content) {
    return <p className="text-sm text-muted-foreground">Loading settings...</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Content Studio</p>
          <h1 className="text-3xl font-semibold tracking-tight">Edit Portal Words</h1>
        </div>
        <Button onClick={save}>Save</Button>
      </div>
      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}

      <Card>
        <CardHeader><CardTitle>Home Page</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <textarea className="w-full rounded border border-border p-2" rows={2} value={content.home.heroTitle} onChange={(e) => update("home.heroTitle", e.target.value)} />
          <textarea className="w-full rounded border border-border p-2" rows={3} value={content.home.heroSubtitle} onChange={(e) => update("home.heroSubtitle", e.target.value)} />
          <textarea className="w-full rounded border border-border p-2" rows={2} value={content.home.focusNote} onChange={(e) => update("home.focusNote", e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Mission Control</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <textarea className="w-full rounded border border-border p-2" rows={3} value={content.missionControl.guide} onChange={(e) => update("missionControl.guide", e.target.value)} />
          <textarea className="w-full rounded border border-border p-2" rows={2} value={content.missionControl.evidenceStandard} onChange={(e) => update("missionControl.evidenceStandard", e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Case Context</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <textarea className="w-full rounded border border-border p-2" rows={2} value={content.case.nancy.nightWindow} onChange={(e) => update("case.nancy.nightWindow", e.target.value)} />
          <textarea className="w-full rounded border border-border p-2" rows={2} value={content.case.nancy.suspectPolicy} onChange={(e) => update("case.nancy.suspectPolicy", e.target.value)} />
        </CardContent>
      </Card>
    </div>
  );
}
