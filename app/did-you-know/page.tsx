import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tips = [
  "Time windows matter: even 5-10 minute corrections can change route analysis.",
  "Most tips fail due to missing date/time/location metadata.",
  "A route line is a hypothesis unless visual confirmation exists.",
  "Duplicate media appears often across outlets; always trace the original source.",
  "Public claims should be reversible and corrected quickly when disproven.",
  "Agency tip lines can be flooded; concise, evidence-based submissions help most.",
];

export default function DidYouKnowPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Did You Know</p>
        <h1 className="text-3xl font-semibold tracking-tight">Investigation Tips and Reality Checks</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>High-Impact Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {tips.map((tip) => (
            <p key={tip}>- {tip}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
