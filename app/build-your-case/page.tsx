import { BuildCaseWorkbench } from "@/components/build-case-workbench";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BuildYourCasePage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Case Operations Demo</p>
        <h1 className="text-3xl font-semibold tracking-tight">Build a Case - Guided Workflow</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Demo builder preloaded with Nancy Guthrie context. Cycle through all steps, track checklist progress,
          upload images, and keep audio/video as external links to preserve server space.
        </p>
        <p className="mt-2 inline-flex rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-700">
          Interactive demo is live on this page
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>- Use source-backed evidence only, with timestamps and links.</p>
          <p>- Images can be uploaded directly to this portal.</p>
          <p>- Audio and video should be kept as external links (YouTube upload recommended).</p>
          <p>- Export the case file JSON at any time for handoff and archive continuity.</p>
        </CardContent>
      </Card>

      <BuildCaseWorkbench />
    </div>
  );
}
