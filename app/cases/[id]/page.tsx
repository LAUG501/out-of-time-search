import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { FollowCaseButton } from "@/components/cases/follow-case-button";
import { LiveTimeline } from "@/components/live-timeline";
import { RealtimeIntel } from "@/components/realtime-intel";
import { CaseMediaWall } from "@/components/case/case-media-wall";
import { CaseStatusAndProfile } from "@/components/case/case-status-and-profile";
import { DeepDiveLinks } from "@/components/case/deep-dive-links";
import { VehicleVerification } from "@/components/case/vehicle-verification";
import { YouTubeCaseBoard } from "@/components/case/youtube-case-board";
import { AgentAssistPanel } from "@/components/case/agent-assist-panel";
import { Button } from "@/components/ui/button";
import { SHARED_NANCY_COVER_IMAGE, SHARED_WHITE_KIA_IMAGE } from "@/lib/case-media";
import { featuredCases } from "@/lib/mock-data";
import { getNationalCaseById } from "@/lib/national-cases";
import { isCaseFollowedByUser } from "@/lib/user-follows";

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, nationalCase] = await Promise.all([auth(), getNationalCaseById(id)]);
  const featured = featuredCases.find((entry) => entry.id === id);
  const item =
    featured ||
    (nationalCase
      ? {
          id: nationalCase.id,
          name: nationalCase.personName,
          state: nationalCase.stateName,
          missingDays: Math.max(1, Math.floor((Date.now() - new Date(nationalCase.missingSince).getTime()) / 86400000)),
          reward: nationalCase.reward,
          status: nationalCase.status,
          summary: nationalCase.summary,
        }
      : null);

  if (!item) {
    notFound();
  }

  const email = session?.user?.email || null;
  const followed = email ? await isCaseFollowedByUser(email, item.id) : false;
  const isPrimaryNancy = item.id === "nancy-guthrie";

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-xl border border-border bg-card p-6">
        {isPrimaryNancy ? (
          <div className="mb-5 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
            <div className="relative overflow-hidden rounded-lg border border-border">
              <img src={SHARED_NANCY_COVER_IMAGE} alt="Nancy case cover" className="h-52 w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <p className="absolute bottom-3 left-3 text-xs font-semibold text-white">Nancy Case Cover (Provided Source)</p>
            </div>
            <div className="relative overflow-hidden rounded-lg border border-border">
              <img src={SHARED_WHITE_KIA_IMAGE} alt="White Kia Soul reference" className="h-52 w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <p className="absolute bottom-3 left-3 text-xs font-semibold text-white">Vehicle Reference: White Kia Soul</p>
            </div>
          </div>
        ) : null}
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Case Profile</p>
        <h1 className="mt-2 text-3xl font-semibold">{item.name}</h1>
        <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
          <p><span className="font-semibold">State:</span> {item.state}</p>
          <p><span className="font-semibold">Missing:</span> {item.missingDays} days</p>
          <p><span className="font-semibold">Reward:</span> {item.reward}</p>
        </div>
        <p className="mt-4 text-muted-foreground">{item.summary}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button>Submit Tip</Button>
          <Button variant="outline">Claim Reward Info</Button>
          <Button variant="outline" asChild><a href={`/cases/${item.id}/gallery`}>Open Case Gallery</a></Button>
          <FollowCaseButton caseId={item.id} initialFollowed={followed} requiresAuth={!email} />
          <Button variant="outline">Share Case</Button>
        </div>
      </section>

      {isPrimaryNancy ? <CaseStatusAndProfile /> : null}

      <section className="space-y-4">
        <LiveTimeline />
        <YouTubeCaseBoard query={`${item.name} missing ${item.state} case update`} />
      </section>

      {isPrimaryNancy ? (
        <section className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Public Source Context</p>
          <p className="mt-1">- VirtualGlobetrotting map source: https://virtualglobetrotting.com/map/nancy-guthries-house/view/google/</p>
          <p>- FOX 10 search source: https://www.fox10phoenix.com/search?q=Nancy+Guthrie</p>
          <p>- Timeline reflects public night-window reporting context and is updated as official details evolve.</p>
        </section>
      ) : (
        <section className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">National Case Context</p>
          <p className="mt-1">This case record is sourced from the national index and continuously enriched with public and official reporting.</p>
          <p>Use follow mode to track updates in your dashboard and forum activity stream.</p>
        </section>
      )}

      <RealtimeIntel query={`${item.name} missing ${item.state} latest updates`} />
      <AgentAssistPanel caseId={item.id} />
      {isPrimaryNancy ? <VehicleVerification query={`${item.name} white Kia Soul vehicle image`} /> : null}
      {isPrimaryNancy ? <DeepDiveLinks /> : null}
      <CaseMediaWall query={`${item.name} missing ${item.state} videos`} />
    </div>
  );
}
