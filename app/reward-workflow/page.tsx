import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const flow = [
  "Submit tip with evidence and timestamp",
  "Automated duplicate/fraud screening",
  "Analyst review and confidence scoring",
  "Agency handoff for official determination",
  "Reward eligibility verification",
  "Claim processing through sponsor/legal terms",
];

export default function RewardWorkflowPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Reward Center</p>
        <h1 className="text-3xl font-semibold tracking-tight">Reward Workflow</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Transparent process for tips, verification, and reward claim routing.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Step-by-Step Reward Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {flow.map((step, index) => (
            <p key={step}>{index + 1}. {step}</p>
          ))}
          <p className="text-xs">Only official agency-confirmed outcomes move into final claim decisions.</p>
        </CardContent>
      </Card>
    </div>
  );
}
