import { promises as fs } from "node:fs";
import path from "node:path";

export type CustomPage = {
  slug: string;
  title: string;
  summary: string;
  heroImage: string;
  body: string;
  updatedAt: string;
};

const PAGES_PATH = path.join(process.cwd(), "data", "custom-pages.json");

async function ensureStore() {
  await fs.mkdir(path.dirname(PAGES_PATH), { recursive: true });
  try {
    await fs.access(PAGES_PATH);
  } catch {
    await fs.writeFile(PAGES_PATH, "[]\n", "utf-8");
  }
}

export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function getCustomPages(): Promise<CustomPage[]> {
  await ensureStore();
  const raw = await fs.readFile(PAGES_PATH, "utf-8");
  const pages = JSON.parse(raw) as CustomPage[];
  return pages.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export async function getCustomPageBySlug(slug: string): Promise<CustomPage | null> {
  const pages = await getCustomPages();
  return pages.find((page) => page.slug === slug) || null;
}

export async function upsertCustomPage(page: Omit<CustomPage, "slug" | "updatedAt"> & { slug: string }) {
  const pages = await getCustomPages();
  const slug = normalizeSlug(page.slug);
  const next: CustomPage = {
    ...page,
    slug,
    updatedAt: new Date().toISOString(),
  };

  const index = pages.findIndex((item) => item.slug === slug);
  if (index >= 0) {
    pages[index] = next;
  } else {
    pages.push(next);
  }

  await fs.writeFile(PAGES_PATH, `${JSON.stringify(pages, null, 2)}\n`, "utf-8");
  return next;
}

export async function deleteCustomPage(slug: string) {
  const pages = await getCustomPages();
  const next = pages.filter((item) => item.slug !== slug);
  await fs.writeFile(PAGES_PATH, `${JSON.stringify(next, null, 2)}\n`, "utf-8");
}
