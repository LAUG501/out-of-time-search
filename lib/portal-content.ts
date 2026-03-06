import { promises as fs } from "node:fs";
import path from "node:path";

const CONTENT_PATH = path.join(process.cwd(), "data", "portal-content.json");

type PortalContent = {
  home: {
    heroTitle: string;
    heroSubtitle: string;
    focusNote: string;
    imagesNote: string;
  };
  missionControl: {
    guide: string;
    evidenceStandard: string;
  };
  buildYourCase: {
    priorityMessage: string;
    partsCount: string;
  };
  rewardWorkflow: {
    summary: string;
  };
  didYouKnow: {
    summary: string;
  };
  agencyContacts: {
    summary: string;
  };
  case: {
    nancy: {
      nightWindow: string;
      suspectPolicy: string;
    };
  };
};

const fallbackContent: PortalContent = {
  home: {
    heroTitle: "Out of Time Search - One Live Command Center for Missing Persons",
    heroSubtitle:
      "Real-time updates, case timelines, reward workflows, and mission-control overlays built to assist families, volunteers, and law enforcement.",
    focusNote: "Current priority case: Nancy Guthrie.",
    imagesNote: "Front-page hero images are locally cached for reliability.",
  },
  missionControl: {
    guide:
      "Start with Home + Back Door Ring, then enable Vehicle and Possible Routes. Use Ring/Camera Zones to compare exits and only escalate evidence-backed clues.",
    evidenceStandard: "Route lines are hypotheses until visual confirmation.",
  },
  buildYourCase: {
    priorityMessage: "Priority One: teach families and volunteers how a real investigation workflow works.",
    partsCount: "8",
  },
  rewardWorkflow: {
    summary: "Reward submissions should be evidence-based, auditable, and reviewed by official agency channels.",
  },
  didYouKnow: {
    summary: "Small timeline corrections can materially change a case outcome.",
  },
  agencyContacts: {
    summary: "Direct official channels for lead submission.",
  },
  case: {
    nancy: {
      nightWindow: "Use night-window timeline context from official/public reports.",
      suspectPolicy: "Only official agency-confirmed suspect entries may be listed.",
    },
  },
};

export async function getPortalContent(): Promise<PortalContent> {
  try {
    const raw = await fs.readFile(CONTENT_PATH, "utf-8");
    return JSON.parse(raw) as PortalContent;
  } catch {
    return fallbackContent;
  }
}

export async function savePortalContent(content: PortalContent): Promise<void> {
  await fs.mkdir(path.dirname(CONTENT_PATH), { recursive: true });
  await fs.writeFile(CONTENT_PATH, `${JSON.stringify(content, null, 2)}\n`, "utf-8");
}
