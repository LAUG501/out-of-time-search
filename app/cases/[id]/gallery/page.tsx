import { notFound } from "next/navigation";

import { CaseMediaWall } from "@/components/case/case-media-wall";
import { YouTubeCaseBoard } from "@/components/case/youtube-case-board";
import { featuredCases } from "@/lib/mock-data";

export default async function CaseGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = featuredCases.find((entry) => entry.id === id);

  if (!item) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Case Gallery</p>
        <h1 className="text-3xl font-semibold tracking-tight">{item.name} - Media and Video Gallery</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dedicated image and video view for rapid review without leaving the portal.
        </p>
      </div>
      <YouTubeCaseBoard query={`${item.name} missing Arizona case update`} />
      <CaseMediaWall query={`${item.name} missing ${item.state} videos`} />
    </div>
  );
}
