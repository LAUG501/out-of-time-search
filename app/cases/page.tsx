import Link from "next/link";

import { auth } from "@/auth";
import { FollowCaseButton } from "@/components/cases/follow-case-button";
import { PageSectionsRenderer } from "@/components/portal/page-sections-renderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listNationalCases } from "@/lib/national-cases";
import { getPortalLayoutBySlug } from "@/lib/portal-builder";
import { listFollowedCaseIds } from "@/lib/user-follows";

type SearchParams = Promise<{ q?: string; state?: string; status?: string }>;

export const dynamic = "force-dynamic";

function statusTone(status: string) {
  if (status === "active") {
    return "border-emerald-700/70 bg-emerald-500/15 text-emerald-200";
  }
  if (status === "cold") {
    return "border-sky-700/70 bg-sky-500/15 text-sky-200";
  }
  return "border-amber-700/70 bg-amber-500/15 text-amber-200";
}

export default async function CasesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const session = await auth();
  const email = session?.user?.email || null;
  const status =
    params.status === "active" || params.status === "cold" || params.status === "resolved"
      ? params.status
      : undefined;

  const [cases, followedIds, managedLayout] = await Promise.all([
    listNationalCases({ q: params.q, state: params.state, status, limit: 500 }),
    email ? listFollowedCaseIds(email) : Promise.resolve([]),
    getPortalLayoutBySlug("cases"),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">National Case Index</p>
        <h1 className="text-3xl font-semibold tracking-tight">All States Missing-Person Case Board</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Unified national board with state filters, follow actions, and case-level workflow links.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search and Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/cases" method="get" className="grid gap-2 md:grid-cols-4">
            <input
              name="q"
              defaultValue={params.q || ""}
              className="h-10 rounded border border-border bg-background px-3 text-sm"
              placeholder="Person, city, or keyword"
            />
            <input
              name="state"
              defaultValue={params.state || ""}
              className="h-10 rounded border border-border bg-background px-3 text-sm"
              placeholder="State code (AZ) or name"
            />
            <select
              name="status"
              defaultValue={params.status || ""}
              className="h-10 rounded border border-border bg-background px-3 text-sm"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="cold">Cold</option>
              <option value="resolved">Resolved</option>
            </select>
            <button type="submit" className="h-10 rounded bg-primary px-3 text-sm font-medium text-primary-foreground">
              Apply
            </button>
          </form>
        </CardContent>
      </Card>

      <PageSectionsRenderer sections={managedLayout?.sections || []} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cases.map((item) => (
          <Card key={item.id} className="border-border/80">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">{item.personName}</CardTitle>
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusTone(item.status)}`}>
                  {item.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex h-full flex-col space-y-2 text-sm">
              <p>
                <span className="font-medium">State:</span> {item.stateName} ({item.stateCode})
              </p>
              <p>
                <span className="font-medium">City:</span> {item.city}
              </p>
              <p className="text-muted-foreground">{item.summary}</p>
              <div className="mt-auto flex flex-wrap gap-2 pt-1">
                <Link href={`/cases/${item.id}`} className="rounded border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted">
                  Open Case
                </Link>
                <FollowCaseButton
                  caseId={item.id}
                  initialFollowed={followedIds.includes(item.id)}
                  requiresAuth={!email}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
