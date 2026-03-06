"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SHARED_WHITE_KIA_IMAGE } from "@/lib/case-media";

type VehicleEvidence = {
  id: string;
  title: string;
  link: string;
  source: string;
  image: string | null;
  vehicleScore: number;
};

type VehicleCheckResponse = {
  modelGuess: string;
  confidence: number;
  verdict: string;
  note: string;
  lastKnownVisual: {
    title: string;
    source: string;
    link: string;
    image: string | null;
  } | null;
  evidence: VehicleEvidence[];
};

export function VehicleVerification({ query }: { query: string }) {
  const [data, setData] = useState<VehicleCheckResponse | null>(null);

  useEffect(() => {
    async function load() {
      const response = await fetch(`/api/vehicle-check?query=${encodeURIComponent(query)}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        return;
      }
      const payload = (await response.json()) as VehicleCheckResponse;
      setData(payload);
    }
    load();
  }, [query]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Vehicle Check</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {!data ? <p className="text-muted-foreground">Running vehicle classification check...</p> : null}
        {data ? (
          <>
            <p><span className="font-semibold">Model Guess:</span> {data.modelGuess}</p>
            <p><span className="font-semibold">Confidence:</span> {data.confidence}%</p>
            <p><span className="font-semibold">Verdict:</span> {data.verdict}</p>
            <p className="text-xs text-muted-foreground">{data.note}</p>

            {data.lastKnownVisual ? (
              <a
                href={data.lastKnownVisual.link}
                target="_blank"
                rel="noreferrer"
                className="block rounded-md border border-border p-2 hover:bg-muted"
              >
                {data.lastKnownVisual.image ? (
                  <img
                    src={data.lastKnownVisual.image}
                    alt={data.lastKnownVisual.title}
                    className="h-36 w-full rounded object-cover"
                  />
                ) : (
                  <img
                    src={SHARED_WHITE_KIA_IMAGE}
                    alt="White Kia Soul reference fallback"
                    className="h-36 w-full rounded object-cover"
                  />
                )}
                <p className="mt-2 text-sm font-medium">Last Known Visual Signal</p>
                <p className="text-xs text-muted-foreground">{data.lastKnownVisual.title}</p>
                <p className="text-xs text-muted-foreground">{data.lastKnownVisual.source}</p>
              </a>
            ) : (
              <p className="text-muted-foreground">No last known vehicle visual found yet.</p>
            )}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
