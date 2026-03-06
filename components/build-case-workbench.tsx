"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ChecklistItem = {
  id: string;
  text: string;
  done: boolean;
};

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

type Step = {
  id: string;
  title: string;
  objective: string;
  actions: string[];
  deliverable: string;
};

const STORAGE_KEY = "out-of-time-case-builder-v1";

function hasLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStorage(key: string): string | null {
  if (!hasLocalStorage()) {
    return null;
  }
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  if (!hasLocalStorage()) {
    return;
  }
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // swallow storage errors
  }
}

const steps: Step[] = [
  {
    id: "baseline",
    title: "Step 1 - Baseline Facts",
    objective: "Lock known events for Nancy Guthrie from first report to current updates.",
    actions: [
      "Capture last known contact time with timezone.",
      "Record report filing and first official statement.",
      "Mark unknowns clearly instead of guessing.",
    ],
    deliverable: "Version 1 timeline anchor file.",
  },
  {
    id: "scene",
    title: "Step 2 - Scene and Camera Context",
    objective: "Map Nancy home, back-door ring, and neighbor backway view with source notes.",
    actions: [
      "Pin house identifier and camera angles.",
      "Attach source links per pin.",
      "Flag approximate vs confirmed coverage.",
    ],
    deliverable: "Scene map with camera context notes.",
  },
  {
    id: "vehicle",
    title: "Step 3 - Vehicle and Person Descriptors",
    objective: "Capture white Kia Soul context and any person descriptors from public reporting.",
    actions: [
      "Store descriptor text exactly as sourced.",
      "Log source outlet and publish date.",
      "Separate confirmed details from leads.",
    ],
    deliverable: "Descriptor board with confidence labels.",
  },
  {
    id: "routes",
    title: "Step 4 - Route Hypotheses",
    objective: "Maintain max 3 route hypotheses and validate against camera visibility.",
    actions: [
      "Snap route to roads and name each hypothesis.",
      "Add support and contradiction evidence for each route.",
      "Retire weak routes as new evidence arrives.",
    ],
    deliverable: "Prioritized route table with rationale.",
  },
  {
    id: "tips",
    title: "Step 5 - Tip Triage",
    objective: "Score tips by trust and urgency while preserving audit trail.",
    actions: [
      "Classify each tip: new, reviewed, escalated, closed.",
      "Capture submitter evidence and timestamp.",
      "Track duplication and contradiction notes.",
    ],
    deliverable: "Live triage board.",
  },
  {
    id: "escalation",
    title: "Step 6 - Agency Escalation",
    objective: "Route high-confidence leads through official channels first.",
    actions: [
      "Prepare packet: summary, timestamps, source links.",
      "Send to FBI/Pima Sheriff route as applicable.",
      "Log submission time and recipient channel.",
    ],
    deliverable: "Escalation packet log.",
  },
  {
    id: "public",
    title: "Step 7 - Public Update Discipline",
    objective: "Publish only verified updates and maintain correction loop.",
    actions: [
      "Write update in plain language with source attribution.",
      "Avoid naming unconfirmed individuals.",
      "Publish correction quickly when needed.",
    ],
    deliverable: "Public brief with corrections section.",
  },
  {
    id: "archive",
    title: "Step 8 - Archive and Continuity",
    objective: "Preserve evidence package for long-running case support.",
    actions: [
      "Version snapshots of timeline and media links.",
      "Keep file export for handoff.",
      "Tag unresolved items for next review cycle.",
    ],
    deliverable: "Continuity-ready case archive.",
  },
];

const initialChecklist: ChecklistItem[] = [
  { id: "c1", text: "Nancy case profile created", done: true },
  { id: "c2", text: "Timeline anchors entered", done: false },
  { id: "c3", text: "Home + ring + neighbor camera notes added", done: false },
  { id: "c4", text: "Vehicle context and evidence links attached", done: false },
  { id: "c5", text: "Agency escalation packet drafted", done: false },
];

function localAssistantReply(input: string, step: Step, checklist: ChecklistItem[]): string {
  const q = input.toLowerCase();
  const done = checklist.filter((item) => item.done).length;

  if (q.includes("next") || q.includes("what now")) {
    return `Focus on ${step.title}. Objective: ${step.objective}`;
  }
  if (q.includes("upload") || q.includes("image")) {
    return "Use image upload in the right panel. Keep video/audio as external links and route raw uploads to YouTube Studio to save server space.";
  }
  if (q.includes("agency") || q.includes("fbi") || q.includes("sheriff")) {
    return "Escalate only high-confidence leads with timestamp, source URL, and one-sentence rationale. Keep a submission log entry in your case file export.";
  }

  return `You are ${done}/${checklist.length} checklist items complete. Recommended now: ${step.actions[0]}`;
}

export function BuildCaseWorkbench() {
  const [currentStep, setCurrentStep] = useState(0);
  const [caseName, setCaseName] = useState("Nancy Guthrie");
  const [summary, setSummary] = useState("Active Arizona case demo with night-window camera context.");

  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
  const [newChecklistItem, setNewChecklistItem] = useState("");

  const [imageUploads, setImageUploads] = useState<string[]>([]);
  const [imageStatus, setImageStatus] = useState("");

  const [videoLinkInput, setVideoLinkInput] = useState("");
  const [audioLinkInput, setAudioLinkInput] = useState("");
  const [videoLinks, setVideoLinks] = useState<string[]>([]);
  const [audioLinks, setAudioLinks] = useState<string[]>([]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Case Copilot ready. Ask what to do next and I will guide step-by-step.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [actionIndex, setActionIndex] = useState(0);

  const step = steps[currentStep];
  const completion = useMemo(() => {
    if (!checklist.length) {
      return 0;
    }
    return Math.round((checklist.filter((item) => item.done).length / checklist.length) * 100);
  }, [checklist]);
  const quickActions = useMemo(
    () => [
      "What should I do next for Nancy right now?",
      "Draft a clean escalation packet checklist.",
      "How do I verify a ring camera clue before posting?",
      "What evidence fields are required for this step?",
    ],
    []
  );
  const activeQuickAction = quickActions[actionIndex % quickActions.length] || "";

  useEffect(() => {
    const raw = readStorage(STORAGE_KEY);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as {
        currentStep?: number;
        caseName?: string;
        summary?: string;
        checklist?: ChecklistItem[];
        imageUploads?: string[];
        videoLinks?: string[];
        audioLinks?: string[];
      };
      if (typeof parsed.currentStep === "number") {
        setCurrentStep(Math.max(0, Math.min(steps.length - 1, parsed.currentStep)));
      }
      if (parsed.caseName) {
        setCaseName(parsed.caseName);
      }
      if (parsed.summary) {
        setSummary(parsed.summary);
      }
      if (Array.isArray(parsed.checklist) && parsed.checklist.length) {
        setChecklist(parsed.checklist);
      }
      if (Array.isArray(parsed.imageUploads)) {
        setImageUploads(parsed.imageUploads);
      }
      if (Array.isArray(parsed.videoLinks)) {
        setVideoLinks(parsed.videoLinks);
      }
      if (Array.isArray(parsed.audioLinks)) {
        setAudioLinks(parsed.audioLinks);
      }
    } catch {
      // keep defaults if local storage parse fails
    }
  }, []);

  useEffect(() => {
    const payload = {
      currentStep,
      caseName,
      summary,
      checklist,
      imageUploads,
      videoLinks,
      audioLinks,
    };
    writeStorage(STORAGE_KEY, JSON.stringify(payload));
  }, [currentStep, caseName, summary, checklist, imageUploads, videoLinks, audioLinks]);

  useEffect(() => {
    if (chatInput.trim()) {
      return;
    }
    const timer = setInterval(() => {
      setActionIndex((value) => value + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, [chatInput]);

  function moveStep(direction: 1 | -1) {
    setCurrentStep((prev) => {
      const next = prev + direction;
      if (next < 0) {
        return steps.length - 1;
      }
      if (next > steps.length - 1) {
        return 0;
      }
      return next;
    });
  }

  function toggleChecklist(id: string) {
    setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  }

  function addChecklistItem() {
    const text = newChecklistItem.trim();
    if (!text) {
      return;
    }
    setChecklist((prev) => [...prev, { id: `c-${Date.now()}`, text, done: false }]);
    setNewChecklistItem("");
  }

  async function uploadImage(file: File) {
    const form = new FormData();
    form.append("file", file);
    setImageStatus("Uploading image...");

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: form,
    });

    const payload = (await response.json()) as { ok?: boolean; url?: string; error?: string };
    if (!response.ok || !payload.ok || !payload.url) {
      setImageStatus(payload.error || "Upload failed");
      return;
    }

    setImageUploads((prev) => [payload.url as string, ...prev]);
    setImageStatus("Image uploaded");
  }

  function addVideoLink() {
    const link = videoLinkInput.trim();
    if (!link) {
      return;
    }
    setVideoLinks((prev) => [link, ...prev]);
    setVideoLinkInput("");
  }

  function addAudioLink() {
    const link = audioLinkInput.trim();
    if (!link) {
      return;
    }
    setAudioLinks((prev) => [link, ...prev]);
    setAudioLinkInput("");
  }

  async function sendChat() {
    const text = chatInput.trim();
    if (!text) {
      return;
    }

    const next: ChatMessage[] = [...messages, { role: "user", text }];
    setMessages(next);
    let reply = localAssistantReply(text, step, checklist);

    try {
      const response = await fetch("/api/case-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          caseName,
          stepTitle: step.title,
          completion,
        }),
      });
      if (response.ok) {
        const payload = (await response.json()) as { ok: boolean; reply?: string };
        if (payload.ok && payload.reply) {
          reply = payload.reply;
        }
      }
    } catch {
      // fall back to local guidance
    }

    setMessages([...next, { role: "assistant", text: reply }]);
    setChatInput("");
  }

  function exportCaseFile() {
    const payload = {
      exportedAt: new Date().toISOString(),
      caseName,
      summary,
      currentStep: step.title,
      progressPercent: completion,
      checklist,
      imageUploads,
      videoLinks,
      audioLinks,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${caseName.toLowerCase().replace(/\s+/g, "-")}-case-file.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Interactive Case Builder Demo - {caseName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              className="h-10 rounded border border-border bg-background px-3"
              value={caseName}
              onChange={(event) => setCaseName(event.target.value)}
              placeholder="Case name"
            />
            <div className="rounded border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              Progress: {completion}% complete
            </div>
          </div>

          <textarea
            rows={2}
            className="w-full rounded border border-border bg-background p-3"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="Case summary"
          />

          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{step.id}</p>
            <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-muted-foreground">{step.objective}</p>
            <div className="mt-3 space-y-1">
              {step.actions.map((action) => (
                <p key={action} className="text-muted-foreground">- {action}</p>
              ))}
            </div>
            <p className="mt-3 rounded border border-border bg-muted/40 px-3 py-2 text-xs">
              Deliverable: {step.deliverable}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => moveStep(-1)}>Previous Step</Button>
            <Button onClick={() => moveStep(1)}>Next Step</Button>
            <Button variant="outline" onClick={exportCaseFile}>Add to Case File (.json)</Button>
          </div>

        </CardContent>
      </Card>

      <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <Card>
          <CardHeader>
            <CardTitle>MAXX Case Assistant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              Status: Active - synced to current step and checklist progress.
            </div>
            <button
              type="button"
              className="w-full rounded border border-border bg-background px-3 py-2 text-left text-xs text-muted-foreground hover:bg-muted"
              onClick={() => setChatInput(activeQuickAction)}
            >
              Try: {activeQuickAction}
            </button>
            <div className="max-h-52 space-y-2 overflow-auto rounded border border-border p-3">
              {messages.map((message, index) => (
                <p key={`${message.role}-${index}`} className={message.role === "assistant" ? "text-muted-foreground" : "font-medium"}>
                  {message.role === "assistant" ? "MAXX: " : "You: "}{message.text}
                </p>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="h-10 flex-1 rounded border border-border bg-background px-3"
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Ask MAXX for step-by-step help"
              />
              <Button onClick={() => void sendChat()}>Send</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {checklist.map((item) => (
              <label key={item.id} className="flex items-start gap-2">
                <input type="checkbox" checked={item.done} onChange={() => toggleChecklist(item.id)} className="mt-0.5" />
                <span className={item.done ? "text-muted-foreground line-through" : "text-foreground"}>{item.text}</span>
              </label>
            ))}

            <div className="flex gap-2">
              <input
                className="h-9 flex-1 rounded border border-border bg-background px-2"
                value={newChecklistItem}
                onChange={(event) => setNewChecklistItem(event.target.value)}
                placeholder="Add checklist item"
              />
              <Button variant="outline" onClick={addChecklistItem}>Add</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media Intake</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">Upload images only. Keep audio/video as external links to reduce server usage.</p>

            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void uploadImage(file);
                }
              }}
            />
            {imageStatus ? <p className="text-xs text-muted-foreground">{imageStatus}</p> : null}

            {imageUploads.length ? (
              <div className="space-y-2">
                {imageUploads.slice(0, 5).map((url) => (
                  <a key={url} href={url} className="block truncate text-xs text-primary hover:underline" target="_blank" rel="noreferrer">{url}</a>
                ))}
              </div>
            ) : null}

            <div className="space-y-2 rounded border border-border p-2">
              <p className="font-medium">Video Links (YouTube preferred)</p>
              <div className="flex gap-2">
                <input
                  className="h-9 flex-1 rounded border border-border bg-background px-2"
                  value={videoLinkInput}
                  onChange={(event) => setVideoLinkInput(event.target.value)}
                  placeholder="Paste video URL"
                />
                <Button variant="outline" onClick={addVideoLink}>Add</Button>
              </div>
              <a href="https://studio.youtube.com" target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                Open default YouTube upload
              </a>
              {videoLinks.length ? (
                <div className="space-y-1">
                  {videoLinks.slice(0, 4).map((url) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer" className="block truncate text-xs text-primary hover:underline">{url}</a>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="space-y-2 rounded border border-border p-2">
              <p className="font-medium">Audio Links (host externally)</p>
              <div className="flex gap-2">
                <input
                  className="h-9 flex-1 rounded border border-border bg-background px-2"
                  value={audioLinkInput}
                  onChange={(event) => setAudioLinkInput(event.target.value)}
                  placeholder="Paste audio URL"
                />
                <Button variant="outline" onClick={addAudioLink}>Add</Button>
              </div>
              {audioLinks.length ? (
                <div className="space-y-1">
                  {audioLinks.slice(0, 4).map((url) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer" className="block truncate text-xs text-primary hover:underline">{url}</a>
                  ))}
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
