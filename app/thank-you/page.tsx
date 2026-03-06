import Link from "next/link";

import { platformAttribution } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ThankYouPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Portal Mission</p>
        <h1 className="text-3xl font-semibold tracking-tight">Built for Real Families, Real Cases, Real Time</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Out of Time Search is a practical assistant portal for live case workflow, not a general-purpose chat toy.
          It exists to support people who need dependable, evidence-centered assistance now.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thank You and Credits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            We are proud to build this platform with secure open-source tools and responsible AI systems,
            led by one focused builder committed to public-good outcomes.
          </p>
          {platformAttribution.map((item) => (
            <p key={item.name}>- <span className="font-semibold text-foreground">{item.name}</span>: {item.role}</p>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/dashboard">Open Dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/credits">Open Full Credits</Link>
        </Button>
      </div>
    </div>
  );
}
