import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export type ForumThreadStatus = "active" | "flagged" | "hidden" | "locked";
export type ForumReplyStatus = "active" | "hidden";
export type ForumReportStatus = "open" | "resolved";

export type ForumThread = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  caseSlug: string | null;
  status: ForumThreadStatus;
  authorId: string | null;
  authorName: string;
  authorEmail: string | null;
  createdAt: string;
  updatedAt: string;
  replyCount: number;
  lastReplyAt: string | null;
};

export type ForumReply = {
  id: string;
  threadId: string;
  body: string;
  status: ForumReplyStatus;
  authorId: string | null;
  authorName: string;
  authorEmail: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ForumReport = {
  id: string;
  targetType: "thread" | "reply";
  targetId: string;
  reason: string;
  details: string;
  status: ForumReportStatus;
  reporterName: string;
  reporterEmail: string | null;
  createdAt: string;
  updatedAt: string;
};

const THREADS_PATH = path.join(process.cwd(), "data", "forum-threads.json");
const REPLIES_PATH = path.join(process.cwd(), "data", "forum-replies.json");
const REPORTS_PATH = path.join(process.cwd(), "data", "forum-reports.json");

function normalizeTags(tags: string[]): string[] {
  return Array.from(
    new Set(
      tags
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 6)
    )
  );
}

async function ensureJsonArrayStore(filePath: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, "[]\n", "utf-8");
  }
}

async function readJsonArray<T>(filePath: string): Promise<T[]> {
  await ensureJsonArrayStore(filePath);
  const raw = await fs.readFile(filePath, "utf-8");
  const parsed = JSON.parse(raw) as T[];
  return Array.isArray(parsed) ? parsed : [];
}

async function writeJsonArray<T>(filePath: string, data: T[]): Promise<void> {
  await ensureJsonArrayStore(filePath);
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}

export async function getForumThreads(options?: {
  includeHidden?: boolean;
  status?: ForumThreadStatus;
  query?: string;
  tag?: string;
  caseSlug?: string;
  limit?: number;
}): Promise<ForumThread[]> {
  const threads = await readJsonArray<ForumThread>(THREADS_PATH);
  const includeHidden = Boolean(options?.includeHidden);
  const query = (options?.query || "").trim().toLowerCase();
  const tag = (options?.tag || "").trim().toLowerCase();
  const caseSlug = (options?.caseSlug || "").trim().toLowerCase();

  const filtered = threads.filter((thread) => {
    if (!includeHidden && (thread.status === "hidden" || thread.status === "locked")) {
      return false;
    }
    if (options?.status && thread.status !== options.status) {
      return false;
    }
    if (query) {
      const haystack = `${thread.title} ${thread.body}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }
    if (tag && !thread.tags.includes(tag)) {
      return false;
    }
    if (caseSlug && (thread.caseSlug || "").toLowerCase() !== caseSlug) {
      return false;
    }
    return true;
  });

  filtered.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  if (options?.limit && options.limit > 0) {
    return filtered.slice(0, options.limit);
  }

  return filtered;
}

export async function getForumThreadById(id: string): Promise<ForumThread | null> {
  const threads = await readJsonArray<ForumThread>(THREADS_PATH);
  return threads.find((thread) => thread.id === id) || null;
}

export async function createForumThread(input: {
  title: string;
  body: string;
  tags?: string[];
  caseSlug?: string | null;
  authorId?: string | null;
  authorName: string;
  authorEmail?: string | null;
}): Promise<ForumThread> {
  const title = input.title.trim();
  const body = input.body.trim();
  if (title.length < 6) {
    throw new Error("Thread title must be at least 6 characters");
  }
  if (body.length < 20) {
    throw new Error("Thread body must be at least 20 characters");
  }

  const now = new Date().toISOString();
  const next: ForumThread = {
    id: randomUUID(),
    title,
    body,
    tags: normalizeTags(input.tags || []),
    caseSlug: input.caseSlug?.trim() || null,
    status: "active",
    authorId: input.authorId || null,
    authorName: input.authorName,
    authorEmail: input.authorEmail || null,
    createdAt: now,
    updatedAt: now,
    replyCount: 0,
    lastReplyAt: null,
  };

  const threads = await readJsonArray<ForumThread>(THREADS_PATH);
  threads.push(next);
  await writeJsonArray(THREADS_PATH, threads);
  return next;
}

export async function updateForumThreadStatus(id: string, status: ForumThreadStatus): Promise<ForumThread> {
  const threads = await readJsonArray<ForumThread>(THREADS_PATH);
  const index = threads.findIndex((thread) => thread.id === id);
  if (index < 0) {
    throw new Error("Thread not found");
  }
  threads[index] = {
    ...threads[index],
    status,
    updatedAt: new Date().toISOString(),
  };
  await writeJsonArray(THREADS_PATH, threads);
  return threads[index];
}

export async function getForumRepliesByThreadId(
  threadId: string,
  options?: { includeHidden?: boolean }
): Promise<ForumReply[]> {
  const replies = await readJsonArray<ForumReply>(REPLIES_PATH);
  const includeHidden = Boolean(options?.includeHidden);
  return replies
    .filter((reply) => {
      if (reply.threadId !== threadId) {
        return false;
      }
      if (!includeHidden && reply.status === "hidden") {
        return false;
      }
      return true;
    })
    .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
}

export async function createForumReply(input: {
  threadId: string;
  body: string;
  authorId?: string | null;
  authorName: string;
  authorEmail?: string | null;
}): Promise<ForumReply> {
  const body = input.body.trim();
  if (body.length < 2) {
    throw new Error("Reply cannot be empty");
  }

  const threads = await readJsonArray<ForumThread>(THREADS_PATH);
  const threadIndex = threads.findIndex((thread) => thread.id === input.threadId);
  if (threadIndex < 0) {
    throw new Error("Thread not found");
  }
  if (threads[threadIndex].status === "locked" || threads[threadIndex].status === "hidden") {
    throw new Error("Thread is closed for replies");
  }

  const now = new Date().toISOString();
  const reply: ForumReply = {
    id: randomUUID(),
    threadId: input.threadId,
    body,
    status: "active",
    authorId: input.authorId || null,
    authorName: input.authorName,
    authorEmail: input.authorEmail || null,
    createdAt: now,
    updatedAt: now,
  };

  const replies = await readJsonArray<ForumReply>(REPLIES_PATH);
  replies.push(reply);
  await writeJsonArray(REPLIES_PATH, replies);

  threads[threadIndex] = {
    ...threads[threadIndex],
    replyCount: threads[threadIndex].replyCount + 1,
    lastReplyAt: now,
    updatedAt: now,
  };
  await writeJsonArray(THREADS_PATH, threads);

  return reply;
}

export async function createForumReport(input: {
  targetType: "thread" | "reply";
  targetId: string;
  reason: string;
  details?: string;
  reporterName: string;
  reporterEmail?: string | null;
}): Promise<ForumReport> {
  const reason = input.reason.trim();
  if (!reason) {
    throw new Error("A report reason is required");
  }

  const now = new Date().toISOString();
  const report: ForumReport = {
    id: randomUUID(),
    targetType: input.targetType,
    targetId: input.targetId,
    reason,
    details: (input.details || "").trim(),
    status: "open",
    reporterName: input.reporterName,
    reporterEmail: input.reporterEmail || null,
    createdAt: now,
    updatedAt: now,
  };

  const reports = await readJsonArray<ForumReport>(REPORTS_PATH);
  reports.push(report);
  await writeJsonArray(REPORTS_PATH, reports);

  if (input.targetType === "thread") {
    const threads = await readJsonArray<ForumThread>(THREADS_PATH);
    const index = threads.findIndex((thread) => thread.id === input.targetId);
    if (index >= 0 && threads[index].status === "active") {
      threads[index] = {
        ...threads[index],
        status: "flagged",
        updatedAt: now,
      };
      await writeJsonArray(THREADS_PATH, threads);
    }
  }

  return report;
}

export async function getForumReports(options?: { status?: ForumReportStatus }): Promise<ForumReport[]> {
  const reports = await readJsonArray<ForumReport>(REPORTS_PATH);
  return reports
    .filter((report) => (options?.status ? report.status === options.status : true))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function updateForumReportStatus(id: string, status: ForumReportStatus): Promise<ForumReport> {
  const reports = await readJsonArray<ForumReport>(REPORTS_PATH);
  const index = reports.findIndex((report) => report.id === id);
  if (index < 0) {
    throw new Error("Report not found");
  }
  reports[index] = {
    ...reports[index],
    status,
    updatedAt: new Date().toISOString(),
  };
  await writeJsonArray(REPORTS_PATH, reports);
  return reports[index];
}

export async function getForumStats(): Promise<{
  totalThreads: number;
  openThreads: number;
  flaggedThreads: number;
  totalReplies: number;
  openReports: number;
}> {
  const [threads, replies, reports] = await Promise.all([
    readJsonArray<ForumThread>(THREADS_PATH),
    readJsonArray<ForumReply>(REPLIES_PATH),
    readJsonArray<ForumReport>(REPORTS_PATH),
  ]);

  return {
    totalThreads: threads.length,
    openThreads: threads.filter((thread) => thread.status === "active").length,
    flaggedThreads: threads.filter((thread) => thread.status === "flagged").length,
    totalReplies: replies.filter((reply) => reply.status === "active").length,
    openReports: reports.filter((report) => report.status === "open").length,
  };
}

export async function getUserForumSummary(email: string): Promise<{
  threadCount: number;
  replyCount: number;
  latestThreadAt: string | null;
}> {
  const [threads, replies] = await Promise.all([
    readJsonArray<ForumThread>(THREADS_PATH),
    readJsonArray<ForumReply>(REPLIES_PATH),
  ]);

  const normalized = email.trim().toLowerCase();
  const userThreads = threads.filter((thread) => (thread.authorEmail || "").toLowerCase() === normalized);
  const userReplies = replies.filter((reply) => (reply.authorEmail || "").toLowerCase() === normalized);

  return {
    threadCount: userThreads.length,
    replyCount: userReplies.length,
    latestThreadAt: userThreads.length > 0 ? userThreads.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0].createdAt : null,
  };
}
