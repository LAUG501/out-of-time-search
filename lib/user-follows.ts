import { promises as fs } from "node:fs";
import path from "node:path";

export type UserFollow = {
  email: string;
  caseId: string;
  createdAt: string;
};

const STORE_PATH = path.join(process.cwd(), "data", "user-follows.json");

async function ensureStore() {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  try {
    await fs.access(STORE_PATH);
  } catch {
    await fs.writeFile(STORE_PATH, "[]\n", "utf-8");
  }
}

async function readStore(): Promise<UserFollow[]> {
  await ensureStore();
  const raw = await fs.readFile(STORE_PATH, "utf-8");
  const parsed = JSON.parse(raw) as UserFollow[];
  return Array.isArray(parsed) ? parsed : [];
}

async function writeStore(items: UserFollow[]): Promise<void> {
  await ensureStore();
  await fs.writeFile(STORE_PATH, `${JSON.stringify(items, null, 2)}\n`, "utf-8");
}

export async function listFollowedCaseIds(emailInput: string): Promise<string[]> {
  const email = emailInput.trim().toLowerCase();
  const store = await readStore();
  return store.filter((item) => item.email === email).map((item) => item.caseId);
}

export async function isCaseFollowedByUser(emailInput: string, caseId: string): Promise<boolean> {
  const ids = await listFollowedCaseIds(emailInput);
  return ids.includes(caseId);
}

export async function toggleCaseFollow(emailInput: string, caseId: string): Promise<{ followed: boolean }> {
  const email = emailInput.trim().toLowerCase();
  if (!email || !caseId) {
    throw new Error("Email and caseId are required");
  }

  const store = await readStore();
  const index = store.findIndex((item) => item.email === email && item.caseId === caseId);
  if (index >= 0) {
    store.splice(index, 1);
    await writeStore(store);
    return { followed: false };
  }

  store.push({ email, caseId, createdAt: new Date().toISOString() });
  await writeStore(store);
  return { followed: true };
}
