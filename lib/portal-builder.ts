import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export type PortalSectionType = "hero" | "text" | "checklist" | "stats" | "links";

export type PortalLinkItem = {
  label: string;
  href: string;
};

export type PortalStatItem = {
  label: string;
  value: string;
};

export type PortalSection = {
  id: string;
  type: PortalSectionType;
  title: string;
  subtitle?: string;
  content?: string;
  items?: string[];
  links?: PortalLinkItem[];
  stats?: PortalStatItem[];
};

export type PortalPageLayout = {
  slug: string;
  title: string;
  summary: string;
  updatedAt: string;
  sections: PortalSection[];
};

const STORE_PATH = path.join(process.cwd(), "data", "portal-builder.json");

const defaultLayouts: PortalPageLayout[] = [
  {
    slug: "home",
    title: "Home Page Builder",
    summary: "Optional admin-managed sections shown on the home page.",
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: "home-welcome",
        type: "text",
        title: "Welcome",
        content:
          "Use this section manager to add operational messaging without changing code. Edits appear after publish and cache refresh.",
      },
    ],
  },
  {
    slug: "forum",
    title: "Forum Front Builder",
    summary: "Manage top-of-forum announcements and operational notes.",
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: "forum-front",
        type: "hero",
        title: "Forum Front Section",
        subtitle: "Welcome, rules, and what we need from contributors.",
      },
    ],
  },
  {
    slug: "backend",
    title: "Backend Ops Builder",
    summary: "Control intro content and KPI context for backend operations page.",
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: "backend-hero",
        type: "hero",
        title: "Backend Operations",
        subtitle: "Professional SaaS operations panel for integrations, health, and controls.",
      },
    ],
  },
  {
    slug: "dashboard",
    title: "Dashboard Builder",
    summary: "Manage top sections for the user command dashboard.",
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: "dashboard-note",
        type: "text",
        title: "Operator Note",
        content: "Use this area for announcements, policy notes, and workflow reminders for signed-in users.",
      },
    ],
  },
  {
    slug: "cases",
    title: "National Cases Builder",
    summary: "Manage hero and instruction sections for the national case index.",
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: "cases-intro",
        type: "text",
        title: "National Intake Policy",
        content:
          "All case entries should include source attribution and update timestamps before being promoted to operational status.",
      },
    ],
  },
];

async function ensureStore() {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  try {
    await fs.access(STORE_PATH);
  } catch {
    await fs.writeFile(STORE_PATH, `${JSON.stringify(defaultLayouts, null, 2)}\n`, "utf-8");
  }
}

function sanitizeSection(section: Partial<PortalSection>): PortalSection {
  const type: PortalSectionType =
    section.type === "hero" ||
    section.type === "text" ||
    section.type === "checklist" ||
    section.type === "stats" ||
    section.type === "links"
      ? section.type
      : "text";

  return {
    id: section.id || randomUUID(),
    type,
    title: section.title?.trim() || "Untitled section",
    subtitle: section.subtitle?.trim() || undefined,
    content: section.content?.trim() || undefined,
    items: Array.isArray(section.items) ? section.items.map((item) => item.trim()).filter(Boolean) : undefined,
    links: Array.isArray(section.links)
      ? section.links
          .map((item) => ({ label: item.label?.trim() || "Link", href: item.href?.trim() || "#" }))
          .filter((item) => Boolean(item.href))
      : undefined,
    stats: Array.isArray(section.stats)
      ? section.stats
          .map((item) => ({ label: item.label?.trim() || "Metric", value: item.value?.trim() || "0" }))
          .filter((item) => Boolean(item.label))
      : undefined,
  };
}

export async function getPortalLayouts(): Promise<PortalPageLayout[]> {
  await ensureStore();
  const raw = await fs.readFile(STORE_PATH, "utf-8");
  const parsed = JSON.parse(raw) as PortalPageLayout[];
  const current = Array.isArray(parsed) ? parsed : [];
  const merged = [...current];

  for (const fallback of defaultLayouts) {
    if (!merged.find((item) => item.slug === fallback.slug)) {
      merged.push(fallback);
    }
  }

  if (merged.length !== current.length) {
    await fs.writeFile(STORE_PATH, `${JSON.stringify(merged, null, 2)}\n`, "utf-8");
  }

  return merged.sort((a, b) => (a.slug > b.slug ? 1 : -1));
}

export async function getPortalLayoutBySlug(slug: string): Promise<PortalPageLayout | null> {
  const layouts = await getPortalLayouts();
  return layouts.find((item) => item.slug === slug) || null;
}

export async function upsertPortalLayout(input: {
  slug: string;
  title: string;
  summary: string;
  sections: Partial<PortalSection>[];
}): Promise<PortalPageLayout> {
  const slug = input.slug.trim().toLowerCase();
  if (!slug) {
    throw new Error("Slug is required");
  }

  const next: PortalPageLayout = {
    slug,
    title: input.title.trim() || `${slug} page`,
    summary: input.summary.trim(),
    updatedAt: new Date().toISOString(),
    sections: (input.sections || []).map((section) => sanitizeSection(section)),
  };

  const layouts = await getPortalLayouts();
  const index = layouts.findIndex((item) => item.slug === slug);
  if (index >= 0) {
    layouts[index] = next;
  } else {
    layouts.push(next);
  }

  await fs.writeFile(STORE_PATH, `${JSON.stringify(layouts, null, 2)}\n`, "utf-8");
  return next;
}
