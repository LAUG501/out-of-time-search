"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CustomPage = {
  slug: string;
  title: string;
  summary: string;
  heroImage: string;
  body: string;
  updatedAt: string;
};

type PortalContent = Record<string, unknown>;

type PortalBuilderSection = {
  id?: string;
  type: "hero" | "text" | "checklist" | "stats" | "links";
  title: string;
  subtitle?: string;
  content?: string;
  items?: string[];
  links?: Array<{ label: string; href: string }>;
  stats?: Array<{ label: string; value: string }>;
};

type PortalBuilderLayout = {
  slug: string;
  title: string;
  summary: string;
  updatedAt: string;
  sections: PortalBuilderSection[];
};

type NationalCase = {
  id: string;
  personName: string;
  stateCode: string;
  stateName: string;
  city: string;
  status: "active" | "cold" | "resolved";
  missingSince: string;
  reward: string;
  sourceCount: number;
  summary: string;
  updatedAt: string;
};

type ModerationThread = {
  id: string;
  title: string;
  status: "active" | "flagged" | "hidden" | "locked";
  updatedAt: string;
};

type ModerationReport = {
  id: string;
  targetType: "thread" | "reply";
  targetId: string;
  reason: string;
  status: "open" | "resolved";
  createdAt: string;
};

const emptyPage: CustomPage = {
  slug: "",
  title: "",
  summary: "",
  heroImage: "",
  body: "",
  updatedAt: "",
};

export default function AdminPage() {
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [editingPage, setEditingPage] = useState<CustomPage>(emptyPage);
  const [contentRaw, setContentRaw] = useState("{}");
  const [uploadUrl, setUploadUrl] = useState("");
  const [status, setStatus] = useState("");
  const [flaggedThreads, setFlaggedThreads] = useState<ModerationThread[]>([]);
  const [openReports, setOpenReports] = useState<ModerationReport[]>([]);
  const [portalLayouts, setPortalLayouts] = useState<PortalBuilderLayout[]>([]);
  const [portalSlug, setPortalSlug] = useState("home");
  const [portalTitle, setPortalTitle] = useState("");
  const [portalSummary, setPortalSummary] = useState("");
  const [portalSectionsRaw, setPortalSectionsRaw] = useState("[]");
  const [nationalCases, setNationalCases] = useState<NationalCase[]>([]);
  const [caseFormRaw, setCaseFormRaw] = useState(`{
  "personName": "",
  "stateCode": "",
  "stateName": "",
  "city": "",
  "status": "active",
  "missingSince": "",
  "reward": "$0",
  "sourceCount": 0,
  "summary": ""
}`);

  async function loadPages() {
    const response = await fetch("/api/admin/pages", { cache: "no-store" });
    if (!response.ok) {
      return;
    }
    const payload = (await response.json()) as { pages: CustomPage[] };
    setPages(payload.pages || []);
  }

  async function loadContent() {
    const response = await fetch("/api/content", { cache: "no-store" });
    if (!response.ok) {
      return;
    }
    const payload = (await response.json()) as PortalContent;
    setContentRaw(JSON.stringify(payload, null, 2));
  }

  useEffect(() => {
    void loadPages();
    void loadContent();
    void loadModeration();
    void loadPortalLayouts();
    void loadNationalCases();
  }, []);

  useEffect(() => {
    const selected = portalLayouts.find((layout) => layout.slug === portalSlug);
    if (!selected) {
      return;
    }
    setPortalTitle(selected.title);
    setPortalSummary(selected.summary);
    setPortalSectionsRaw(JSON.stringify(selected.sections || [], null, 2));
  }, [portalLayouts, portalSlug]);

  async function loadPortalLayouts() {
    const response = await fetch("/api/admin/portal-builder", { cache: "no-store" });
    if (!response.ok) {
      return;
    }
    const payload = (await response.json()) as { layouts?: PortalBuilderLayout[] };
    const layouts = payload.layouts || [];
    setPortalLayouts(layouts);
    if (layouts.length > 0) {
      setPortalSlug((current) => current || layouts[0].slug);
    }
  }

  async function loadNationalCases() {
    const response = await fetch("/api/admin/cases", { cache: "no-store" });
    if (!response.ok) {
      return;
    }
    const payload = (await response.json()) as { cases?: NationalCase[] };
    setNationalCases(payload.cases || []);
  }

  async function loadModeration() {
    const response = await fetch("/api/admin/forum/moderation", { cache: "no-store" });
    if (!response.ok) {
      return;
    }
    const payload = (await response.json()) as {
      flaggedThreads?: ModerationThread[];
      openReports?: ModerationReport[];
    };
    setFlaggedThreads(payload.flaggedThreads || []);
    setOpenReports(payload.openReports || []);
  }

  async function updateThreadStatus(threadId: string, threadStatus: ModerationThread["status"]) {
    await fetch("/api/admin/forum/moderation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "thread-status", threadId, threadStatus }),
    });
    await loadModeration();
  }

  async function resolveReport(reportId: string) {
    await fetch("/api/admin/forum/moderation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "report-status", reportId, reportStatus: "resolved" }),
    });
    await loadModeration();
  }

  async function savePage() {
    setStatus("Saving page...");
    const response = await fetch("/api/admin/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingPage),
    });
    setStatus(response.ok ? "Page saved" : "Page save failed");
    await loadPages();
  }

  async function removePage(slug: string) {
    setStatus("Deleting page...");
    const response = await fetch(`/api/admin/pages/${slug}`, { method: "DELETE" });
    setStatus(response.ok ? "Page deleted" : "Delete failed");
    if (response.ok && editingPage.slug === slug) {
      setEditingPage(emptyPage);
    }
    await loadPages();
  }

  async function saveContent() {
    setStatus("Saving content...");
    try {
      const parsed = JSON.parse(contentRaw);
      const response = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      setStatus(response.ok ? "Content saved" : "Content save failed");
    } catch {
      setStatus("Invalid JSON in content editor");
    }
  }

  async function savePortalLayout() {
    setStatus("Saving portal sections...");
    try {
      const parsedSections = JSON.parse(portalSectionsRaw) as PortalBuilderSection[];
      const response = await fetch("/api/admin/portal-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: portalSlug,
          title: portalTitle,
          summary: portalSummary,
          sections: parsedSections,
        }),
      });
      setStatus(response.ok ? "Portal sections saved" : "Portal sections save failed");
      await loadPortalLayouts();
    } catch {
      setStatus("Invalid JSON in portal sections editor");
    }
  }

  async function saveNationalCase() {
    setStatus("Saving national case...");
    try {
      const parsed = JSON.parse(caseFormRaw);
      const response = await fetch("/api/admin/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      setStatus(response.ok ? "National case saved" : "National case save failed");
      await loadNationalCases();
    } catch {
      setStatus("Invalid JSON in national case form");
    }
  }

  async function uploadImage(file: File) {
    const form = new FormData();
    form.append("file", file);
    setStatus("Uploading image...");

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: form,
    });

    if (!response.ok) {
      setStatus("Upload failed");
      return;
    }

    const payload = (await response.json()) as { url: string };
    setUploadUrl(payload.url || "");
    setEditingPage((prev) => ({ ...prev, heroImage: payload.url || prev.heroImage }));
    setStatus("Upload complete");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin Studio</p>
        <h1 className="text-3xl font-semibold tracking-tight">Edit Pages and Media</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add/edit custom pages, upload images, and update portal wording in one place.
        </p>
      </div>

      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Page Builder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <input
              className="w-full rounded border border-border p-2"
              placeholder="slug (example: case-updates)"
              value={editingPage.slug}
              onChange={(e) => setEditingPage((prev) => ({ ...prev, slug: e.target.value }))}
            />
            <input
              className="w-full rounded border border-border p-2"
              placeholder="title"
              value={editingPage.title}
              onChange={(e) => setEditingPage((prev) => ({ ...prev, title: e.target.value }))}
            />
            <input
              className="w-full rounded border border-border p-2"
              placeholder="summary"
              value={editingPage.summary}
              onChange={(e) => setEditingPage((prev) => ({ ...prev, summary: e.target.value }))}
            />
            <input
              className="w-full rounded border border-border p-2"
              placeholder="hero image url (/uploads/... or https://...)"
              value={editingPage.heroImage}
              onChange={(e) => setEditingPage((prev) => ({ ...prev, heroImage: e.target.value }))}
            />
            <textarea
              className="w-full rounded border border-border p-2"
              rows={10}
              placeholder="body text (paragraphs split by blank lines)"
              value={editingPage.body}
              onChange={(e) => setEditingPage((prev) => ({ ...prev, body: e.target.value }))}
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={savePage}>Save Page</Button>
              <Button variant="outline" onClick={() => setEditingPage(emptyPage)}>New Page</Button>
            </div>
            <p className="text-xs text-muted-foreground">Custom pages render at `/p/your-slug`.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Custom Pages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {pages.length === 0 ? <p className="text-muted-foreground">No custom pages yet.</p> : null}
            {pages.map((page) => (
              <div key={page.slug} className="rounded border border-border p-2">
                <p className="font-medium">{page.title}</p>
                <p className="text-xs text-muted-foreground">/p/{page.slug}</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditingPage(page)}>Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => removePage(page.slug)}>Delete</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Media Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                void uploadImage(file);
              }
            }}
          />
          {uploadUrl ? (
            <p>
              Uploaded: <a href={uploadUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">{uploadUrl}</a>
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Global Content JSON</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <textarea className="w-full rounded border border-border p-2 font-mono" rows={16} value={contentRaw} onChange={(e) => setContentRaw(e.target.value)} />
          <Button onClick={saveContent}>Save Content JSON</Button>
          <p className="text-xs text-muted-foreground">This updates the wording used across home/mission/case context sections.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Portal Builder (WordPress-Style Sections)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid gap-2 md:grid-cols-3">
            <select
              className="h-10 rounded border border-border bg-background px-3"
              value={portalSlug}
              onChange={(event) => setPortalSlug(event.target.value)}
            >
              {portalLayouts.map((layout) => (
                <option key={layout.slug} value={layout.slug}>
                  {layout.slug}
                </option>
              ))}
            </select>
            <input
              className="h-10 rounded border border-border bg-background px-3"
              value={portalTitle}
              onChange={(event) => setPortalTitle(event.target.value)}
              placeholder="Builder title"
            />
            <input
              className="h-10 rounded border border-border bg-background px-3"
              value={portalSummary}
              onChange={(event) => setPortalSummary(event.target.value)}
              placeholder="Short summary"
            />
          </div>
          <textarea
            className="w-full rounded border border-border p-2 font-mono"
            rows={18}
            value={portalSectionsRaw}
            onChange={(event) => setPortalSectionsRaw(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={savePortalLayout}>Save Portal Sections</Button>
            <Button variant="outline" onClick={() => setPortalSectionsRaw("[]")}>
              Clear Sections
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Section schema supports type values: hero, text, checklist, stats, links. This renders on Home, Forum, and Backend pages today.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Forum Moderation Queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="mb-2 font-medium">Flagged Threads</p>
            {flaggedThreads.length === 0 ? <p className="text-muted-foreground">No flagged threads.</p> : null}
            {flaggedThreads.map((thread) => (
              <div key={thread.id} className="mb-2 rounded border border-border p-2">
                <p className="font-medium">{thread.title}</p>
                <p className="text-xs text-muted-foreground">{new Date(thread.updatedAt).toLocaleString()}</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => void updateThreadStatus(thread.id, "active")}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => void updateThreadStatus(thread.id, "locked")}>Lock</Button>
                  <Button size="sm" variant="outline" onClick={() => void updateThreadStatus(thread.id, "hidden")}>Hide</Button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <p className="mb-2 font-medium">Open Reports</p>
            {openReports.length === 0 ? <p className="text-muted-foreground">No open reports.</p> : null}
            {openReports.map((report) => (
              <div key={report.id} className="mb-2 rounded border border-border p-2">
                <p className="font-medium">{report.targetType} • {report.reason}</p>
                <p className="text-xs text-muted-foreground">{new Date(report.createdAt).toLocaleString()}</p>
                <Button size="sm" variant="outline" className="mt-2" onClick={() => void resolveReport(report.id)}>
                  Mark Resolved
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>National Case Intake</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <textarea
            className="w-full rounded border border-border p-2 font-mono"
            rows={14}
            value={caseFormRaw}
            onChange={(event) => setCaseFormRaw(event.target.value)}
          />
          <Button onClick={saveNationalCase}>Save National Case</Button>
          <p className="text-xs text-muted-foreground">
            Add one case at a time or include an existing id to update a record.
          </p>
          <div className="space-y-2">
            <p className="font-medium">Recent National Cases ({nationalCases.length})</p>
            {nationalCases.slice(0, 8).map((item) => (
              <div key={item.id} className="rounded border border-border p-2">
                <p className="font-medium">{item.personName}</p>
                <p className="text-xs text-muted-foreground">
                  {item.stateName} ({item.stateCode}) • {item.status}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
