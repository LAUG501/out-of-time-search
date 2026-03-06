"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LightboxImage } from "@/components/ui/lightbox-image";
import { SHARED_NANCY_COVER_IMAGE, SHARED_WHITE_KIA_IMAGE } from "@/lib/case-media";

const DOORBELL_SUBJECT_IMAGE =
  "https://media-cldnry.s-nbcnews.com/image/upload/t_social_share_1024x768_scale,f_auto,q_auto:best/rockcms/2026-02/260210-16x9-nancy-guthrie-security-cam-ew-1253p-6db27b.jpg";

const authorizedSuspects: Array<{ name: string; source: string; status: string }> = [];
const authorizedPersonOfInterest = {
  name: "Unidentified masked individual seen on Ring/surveillance images",
  source: "Public law-enforcement/media reporting",
  status: "Person of interest - identity not publicly confirmed",
};

const activeEntities = [
  "Pima County Sheriff (Sheriff Chris Nanos)",
  "FBI Phoenix / federal investigators",
  "Family-led search updates",
  "Volunteer and media tip channels",
];

const criticalFacts = [
  { label: "Name", value: "Nancy Guthrie" },
  { label: "Case State", value: "Ongoing Investigation" },
  { label: "Vehicle Descriptor", value: "White Kia Soul (public reporting context)" },
  { label: "Last Known Vehicle Visual", value: "Map pin + AI vehicle check panel" },
  { label: "Night Window", value: "Key camera/pacemaker events reported overnight" },
];

export function CaseStatusAndProfile() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>4 Critical Case Facts</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm md:grid-cols-2">
          {criticalFacts.map((fact) => (
            <p key={fact.label}>
              <span className="font-semibold">{fact.label}:</span> {fact.value}
            </p>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Who Is Missing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <LightboxImage
              src={SHARED_NANCY_COVER_IMAGE}
              alt="Nancy public cover image"
              className="h-44 w-full rounded-md border border-border object-cover"
            />
            <p>
              <span className="font-semibold">Name:</span> Nancy Guthrie
            </p>
            <p>
              <span className="font-semibold">Status:</span> Ongoing (Day 32)
            </p>
            <p>
              <span className="font-semibold">Summary:</span> Tucson-area missing-person case with active tip and media investigation.
            </p>
            <p>
              <span className="font-semibold">Timeline correction:</span> key activity windows are reported in the overnight period, not daytime.
            </p>
            <p className="text-xs text-muted-foreground">Click image to zoom. Source retained from provided public share link.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Doorbell Camera Subject Detail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <LightboxImage
              src={DOORBELL_SUBJECT_IMAGE}
              alt="Masked subject on Nancy Guthrie doorbell camera"
              className="h-40 w-full rounded-md border border-border object-cover"
            />
            <p><span className="font-semibold">Description:</span> masked male, average build.</p>
            <p><span className="font-semibold">Height range (public FBI reporting):</span> approximately 5'9"-5'10".</p>
            <p><span className="font-semibold">Gear:</span> black 25-liter Ozark Trail Hiker Pack backpack (reported).</p>
            <p><span className="font-semibold">Camera context:</span> doorbell camera tampering reported in public coverage.</p>
            <p className="text-xs text-muted-foreground">
              Use official agency releases for final suspect wording and updates. Source: <a className="text-primary underline" target="_blank" rel="noreferrer" href="https://www.nbcnews.com/news/us-news/authorities-release-surveillance-photo-potential-subject-nancy-guthrie-rcna258356">NBC News release</a>.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle of Interest</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <LightboxImage
              src={SHARED_WHITE_KIA_IMAGE}
              alt="White Kia Soul reference image"
              className="h-44 w-full rounded-md border border-border object-cover"
            />
            <p>
              <span className="font-semibold">Type:</span> White Kia Soul
            </p>
            <p>
              <span className="font-semibold">Path Note:</span> The route shown is a reconstructed drivable path and not an official final track.
            </p>
            <p className="text-xs text-muted-foreground">Click image to zoom. Reference image is for vehicle model context only, not a claim of exact plate/owner match.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Who Is Still There (Active Entities)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {activeEntities.map((entity) => (
              <p key={entity}>- {entity}</p>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Case Lifecycle and Authorized Suspects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <span className="font-semibold">Current State:</span> Ongoing Investigation
            </p>
            <p>
              <span className="font-semibold">Case Close Trigger:</span> Official agency closure, recovery confirmation, or legal resolution.
            </p>
            <div>
              <p className="font-semibold">Authorized Suspects List</p>
              <p className="text-muted-foreground">
                {authorizedPersonOfInterest.name} ({authorizedPersonOfInterest.status})
              </p>
              {authorizedSuspects.length === 0 ? (
                <p className="text-muted-foreground">
                  No authorized suspect entries published. Only official agency-confirmed entries appear here.
                </p>
              ) : (
                authorizedSuspects.map((entry) => (
                  <p key={entry.name}>
                    {entry.name} - {entry.status} ({entry.source})
                  </p>
                ))
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              This section is restricted to authorized official disclosures to avoid misidentification harm.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
