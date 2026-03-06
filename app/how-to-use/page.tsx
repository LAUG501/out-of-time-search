import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalAssistantPanel } from "@/components/portal-assistant-panel";

const steps = [
  {
    title: "Start in Mission Control",
    detail:
      "Open the live map, set your time window, and focus the area of interest before reviewing clues.",
  },
  {
    title: "Review minute timeline",
    detail:
      "Use the minute buckets to inspect every update in sequence. Open each source link for original context.",
  },
  {
    title: "Compare visuals",
    detail:
      "Use recurring image clusters to identify duplicate footage angles and repeated frames from different outlets.",
  },
  {
    title: "Submit responsible tips",
    detail:
      "Include date, time, location, and original media source. Mark uncertainty instead of guessing.",
  },
  {
    title: "Escalate with confidence",
    detail:
      "Only escalate high-impact clues after cross-source review. Law enforcement makes final status decisions.",
  },
];

export default function HowToUsePage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Operator Manual</p>
        <h1 className="text-3xl font-semibold tracking-tight">How to Use the Portal</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Fast playbook for families, volunteers, journalists, and law enforcement collaborators.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {steps.map((step, index) => (
          <Card key={step.title}>
            <CardHeader>
              <CardTitle>
                {index + 1}. {step.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{step.detail}</CardContent>
          </Card>
        ))}
      </div>

      <PortalAssistantPanel />
    </div>
  );
}
