import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  "Submit sightings with exact date, local time, location, and why it matches the case profile.",
  "Upload media with original source links, capture method, and chain-of-custody notes.",
  "Mark uncertainty clearly (confirmed, likely, unknown) instead of guessing.",
  "Report misinformation through correction channels with direct evidence.",
  "Escalate urgent/high-confidence tips to official agency channels first.",
  "Join volunteer amplification only for verified updates and missing-person alerts.",
];

const evidenceChecklist = [
  "Timestamp (local timezone and source timezone if known)",
  "Location (address, cross-street, or map coordinate)",
  "Source URL or file origin",
  "One-sentence reason this may relate to the case",
  "Confidence level: low / medium / high",
  "Whether law enforcement has already received this lead",
];

const antiHarmRules = [
  "Do not name unconfirmed individuals as suspects.",
  "Do not publish private addresses, plates, or family data without legal clearance.",
  "Do not edit or crop evidence in ways that remove context.",
  "Do not run independent confrontations; route safety concerns to officials.",
];

export default function ContributePage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Community Action</p>
        <h1 className="text-3xl font-semibold tracking-tight">How to Help Responsibly</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This portal is designed to support families and agencies with clean, usable leads. The goal is quality over quantity.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contribution Playbook</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-muted-foreground">
            {steps.map((step, index) => (
              <li key={step}>{index + 1}. {step}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Minimum Evidence Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {evidenceChecklist.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Safety and Accuracy Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {antiHarmRules.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
