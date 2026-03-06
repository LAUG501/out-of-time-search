import Link from "next/link";

import { StateMissingBoard } from "@/components/state-missing-board";
import { Card, CardContent } from "@/components/ui/card";

export default function ArizonaCasesPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Arizona Case Board</p>
        <h1 className="text-3xl font-semibold tracking-tight">Public Missing Photos and Case Media</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Aggregates public missing-person images, police bulletin-style coverage, and related video feeds.
          Focus on Arizona context with high-relevance case filtering and source attribution.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          For full 50-state coverage, open the national board:
          <Link href="/cases" className="ml-2 font-medium text-primary hover:underline">
            /cases
          </Link>
        </CardContent>
      </Card>

      <StateMissingBoard />
    </div>
  );
}
