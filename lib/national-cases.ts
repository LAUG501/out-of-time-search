import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export type NationalCaseStatus = "active" | "cold" | "resolved";

export type NationalCase = {
  id: string;
  personName: string;
  stateCode: string;
  stateName: string;
  city: string;
  status: NationalCaseStatus;
  missingSince: string;
  reward: string;
  sourceCount: number;
  summary: string;
  updatedAt: string;
};

const STORE_PATH = path.join(process.cwd(), "data", "national-cases.json");

const STATES: Array<{ code: string; name: string; city: string }> = [
  { code: "AL", name: "Alabama", city: "Birmingham" },
  { code: "AK", name: "Alaska", city: "Anchorage" },
  { code: "AZ", name: "Arizona", city: "Tucson" },
  { code: "AR", name: "Arkansas", city: "Little Rock" },
  { code: "CA", name: "California", city: "Los Angeles" },
  { code: "CO", name: "Colorado", city: "Denver" },
  { code: "CT", name: "Connecticut", city: "Hartford" },
  { code: "DE", name: "Delaware", city: "Wilmington" },
  { code: "FL", name: "Florida", city: "Orlando" },
  { code: "GA", name: "Georgia", city: "Atlanta" },
  { code: "HI", name: "Hawaii", city: "Honolulu" },
  { code: "ID", name: "Idaho", city: "Boise" },
  { code: "IL", name: "Illinois", city: "Chicago" },
  { code: "IN", name: "Indiana", city: "Indianapolis" },
  { code: "IA", name: "Iowa", city: "Des Moines" },
  { code: "KS", name: "Kansas", city: "Wichita" },
  { code: "KY", name: "Kentucky", city: "Louisville" },
  { code: "LA", name: "Louisiana", city: "New Orleans" },
  { code: "ME", name: "Maine", city: "Portland" },
  { code: "MD", name: "Maryland", city: "Baltimore" },
  { code: "MA", name: "Massachusetts", city: "Boston" },
  { code: "MI", name: "Michigan", city: "Detroit" },
  { code: "MN", name: "Minnesota", city: "Minneapolis" },
  { code: "MS", name: "Mississippi", city: "Jackson" },
  { code: "MO", name: "Missouri", city: "St. Louis" },
  { code: "MT", name: "Montana", city: "Billings" },
  { code: "NE", name: "Nebraska", city: "Omaha" },
  { code: "NV", name: "Nevada", city: "Las Vegas" },
  { code: "NH", name: "New Hampshire", city: "Manchester" },
  { code: "NJ", name: "New Jersey", city: "Newark" },
  { code: "NM", name: "New Mexico", city: "Albuquerque" },
  { code: "NY", name: "New York", city: "Buffalo" },
  { code: "NC", name: "North Carolina", city: "Charlotte" },
  { code: "ND", name: "North Dakota", city: "Fargo" },
  { code: "OH", name: "Ohio", city: "Columbus" },
  { code: "OK", name: "Oklahoma", city: "Tulsa" },
  { code: "OR", name: "Oregon", city: "Portland" },
  { code: "PA", name: "Pennsylvania", city: "Philadelphia" },
  { code: "RI", name: "Rhode Island", city: "Providence" },
  { code: "SC", name: "South Carolina", city: "Charleston" },
  { code: "SD", name: "South Dakota", city: "Sioux Falls" },
  { code: "TN", name: "Tennessee", city: "Nashville" },
  { code: "TX", name: "Texas", city: "Houston" },
  { code: "UT", name: "Utah", city: "Salt Lake City" },
  { code: "VT", name: "Vermont", city: "Burlington" },
  { code: "VA", name: "Virginia", city: "Richmond" },
  { code: "WA", name: "Washington", city: "Seattle" },
  { code: "WV", name: "West Virginia", city: "Charleston" },
  { code: "WI", name: "Wisconsin", city: "Milwaukee" },
  { code: "WY", name: "Wyoming", city: "Cheyenne" },
];

function seededCases(): NationalCase[] {
  const now = new Date().toISOString();
  return STATES.map((state, index) => ({
    id: `case-${state.code.toLowerCase()}-${index + 1}`,
    personName: state.code === "AZ" ? "Nancy Guthrie" : `${state.name} Missing Person ${index + 1}`,
    stateCode: state.code,
    stateName: state.name,
    city: state.city,
    status: state.code === "AZ" ? "active" : index % 8 === 0 ? "cold" : "active",
    missingSince: new Date(Date.now() - (index + 3) * 86400000).toISOString(),
    reward: index % 5 === 0 ? "$50,000" : "$10,000",
    sourceCount: 5 + (index % 7),
    summary:
      state.code === "AZ"
        ? "Priority Arizona case under active multi-source review."
        : `Open-source and official reporting are being monitored for ${state.name}.`,
    updatedAt: now,
  }));
}

async function ensureStore() {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  try {
    await fs.access(STORE_PATH);
  } catch {
    await fs.writeFile(STORE_PATH, `${JSON.stringify(seededCases(), null, 2)}\n`, "utf-8");
  }
}

async function readStore(): Promise<NationalCase[]> {
  await ensureStore();
  const raw = await fs.readFile(STORE_PATH, "utf-8");
  const parsed = JSON.parse(raw) as NationalCase[];
  return Array.isArray(parsed) ? parsed : [];
}

async function writeStore(items: NationalCase[]): Promise<void> {
  await ensureStore();
  await fs.writeFile(STORE_PATH, `${JSON.stringify(items, null, 2)}\n`, "utf-8");
}

export async function listNationalCases(options?: {
  state?: string;
  q?: string;
  status?: NationalCaseStatus;
  limit?: number;
}): Promise<NationalCase[]> {
  const state = (options?.state || "").trim().toLowerCase();
  const q = (options?.q || "").trim().toLowerCase();
  const all = await readStore();
  const filtered = all
    .filter((item) => {
      if (options?.status && item.status !== options.status) {
        return false;
      }
      if (state && item.stateCode.toLowerCase() !== state && item.stateName.toLowerCase() !== state) {
        return false;
      }
      if (q) {
        const haystack = `${item.personName} ${item.stateName} ${item.city} ${item.summary}`.toLowerCase();
        if (!haystack.includes(q)) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  if (options?.limit && options.limit > 0) {
    return filtered.slice(0, options.limit);
  }

  return filtered;
}

export async function getNationalCaseById(id: string): Promise<NationalCase | null> {
  const all = await readStore();
  return all.find((item) => item.id === id) || null;
}

export async function upsertNationalCase(input: {
  id?: string;
  personName: string;
  stateCode: string;
  stateName: string;
  city: string;
  status: NationalCaseStatus;
  missingSince: string;
  reward: string;
  sourceCount: number;
  summary: string;
}): Promise<NationalCase> {
  const all = await readStore();
  const id = input.id?.trim() || `case-${input.stateCode.toLowerCase()}-${randomUUID().slice(0, 8)}`;

  const next: NationalCase = {
    id,
    personName: input.personName.trim(),
    stateCode: input.stateCode.trim().toUpperCase(),
    stateName: input.stateName.trim(),
    city: input.city.trim(),
    status: input.status,
    missingSince: input.missingSince,
    reward: input.reward.trim(),
    sourceCount: input.sourceCount,
    summary: input.summary.trim(),
    updatedAt: new Date().toISOString(),
  };

  const index = all.findIndex((item) => item.id === id);
  if (index >= 0) {
    all[index] = next;
  } else {
    all.push(next);
  }

  await writeStore(all);
  return next;
}

export async function getNationalCoverageStats(): Promise<{
  totalCases: number;
  statesCovered: number;
  activeCases: number;
  coldCases: number;
}> {
  const all = await readStore();
  return {
    totalCases: all.length,
    statesCovered: new Set(all.map((item) => item.stateCode)).size,
    activeCases: all.filter((item) => item.status === "active").length,
    coldCases: all.filter((item) => item.status === "cold").length,
  };
}
