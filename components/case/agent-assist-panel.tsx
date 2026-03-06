"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AgentResponse = {
  source: string;
  insights: string[];
  note?: string;
};

export function AgentAssistPanel({ caseId }: { caseId: string }) {
  const [data, setData] = useState<AgentResponse | null>(null);

  useEffect(() => {
    async function load() {
      const response = await fetch(`/api/agent-assist?caseId=${encodeURIComponent(caseId)}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        return;
      }
      const payload = (await response.json()) as AgentResponse;
      setData(payload);
    }

    load();
  }, [caseId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Assist (Case Intelligence)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {!data ? <p>Loading assistance...</p> : null}
        {data ? (
          <>
            <p><span className="font-semibold">Data Source:</span> {data.source}</p>
            {data.insights.map((insight) => (
              <p key={insight}>- {insight}</p>
            ))}
            {data.note ? <p className="text-xs">{data.note}</p> : null}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
