import { promises as fs } from "fs";
import { randomBytes, randomInt, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import path from "path";
import { promisify } from "util";

const scrypt = promisify(scryptCallback);
const USERS_PATH = path.join(process.cwd(), "data", "users.json");

type StoredUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: "admin" | "contributor";
  emailVerified: boolean;
  phoneVerified: boolean;
  verificationCodeHash?: string;
  verificationCodeExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
};

type UserFile = {
  users: StoredUser[];
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "contributor";
  emailVerified: boolean;
  phoneVerified: boolean;
};

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function isAdminEmail(email: string): boolean {
  const raw = process.env.ADMIN_EMAILS || "";
  const admins = raw
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

async function ensureStore(): Promise<UserFile> {
  try {
    const raw = await fs.readFile(USERS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as UserFile;
    return { users: Array.isArray(parsed.users) ? parsed.users : [] };
  } catch {
    const empty: UserFile = { users: [] };
    await fs.mkdir(path.dirname(USERS_PATH), { recursive: true });
    await fs.writeFile(USERS_PATH, `${JSON.stringify(empty, null, 2)}\n`, "utf-8");
    return empty;
  }
}

async function saveStore(store: UserFile): Promise<void> {
  await fs.mkdir(path.dirname(USERS_PATH), { recursive: true });
  await fs.writeFile(USERS_PATH, `${JSON.stringify(store, null, 2)}\n`, "utf-8");
}

async function hashSecret(secret: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(secret, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

async function verifySecret(secret: string, storedHash: string): Promise<boolean> {
  const [salt, keyHex] = storedHash.split(":");
  if (!salt || !keyHex) {
    return false;
  }
  const derived = (await scrypt(secret, salt, 64)) as Buffer;
  const stored = Buffer.from(keyHex, "hex");
  if (stored.length !== derived.length) {
    return false;
  }
  return timingSafeEqual(stored, derived);
}

function toAuthUser(user: StoredUser): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
  };
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<AuthUser> {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const password = input.password;
  const phone = input.phone?.trim() || undefined;

  if (!name || name.length < 2) {
    throw new Error("Name must be at least 2 characters");
  }
  if (!email || !email.includes("@")) {
    throw new Error("Valid email is required");
  }
  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const store = await ensureStore();
  const exists = store.users.some((user) => user.email === email);
  if (exists) {
    throw new Error("An account with this email already exists");
  }

  const role: "admin" | "contributor" = isAdminEmail(email) ? "admin" : "contributor";
  const now = new Date().toISOString();
  const user: StoredUser = {
    id: randomUUID(),
    name,
    email,
    phone,
    passwordHash: await hashSecret(password),
    role,
    emailVerified: false,
    phoneVerified: false,
    createdAt: now,
    updatedAt: now,
  };

  store.users.push(user);
  await saveStore(store);

  return toAuthUser(user);
}

export async function createVerificationCode(emailInput: string): Promise<{ email: string; code: string } | null> {
  const email = normalizeEmail(emailInput);
  const store = await ensureStore();
  const user = store.users.find((entry) => entry.email === email);
  if (!user) {
    return null;
  }

  const code = `${randomInt(100000, 1000000)}`;
  user.verificationCodeHash = await hashSecret(code);
  user.verificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  user.updatedAt = new Date().toISOString();
  await saveStore(store);
  return { email, code };
}

export async function confirmVerificationCode(emailInput: string, code: string): Promise<boolean> {
  const email = normalizeEmail(emailInput);
  const store = await ensureStore();
  const user = store.users.find((entry) => entry.email === email);
  if (!user || !user.verificationCodeHash || !user.verificationCodeExpiresAt) {
    return false;
  }

  if (new Date(user.verificationCodeExpiresAt).getTime() < Date.now()) {
    return false;
  }

  const valid = await verifySecret(code.trim(), user.verificationCodeHash);
  if (!valid) {
    return false;
  }

  user.emailVerified = true;
  user.verificationCodeHash = undefined;
  user.verificationCodeExpiresAt = undefined;
  user.updatedAt = new Date().toISOString();
  await saveStore(store);
  return true;
}

export async function verifyUser(emailInput: string, password: string): Promise<AuthUser | null> {
  const email = normalizeEmail(emailInput);
  const store = await ensureStore();
  const user = store.users.find((entry) => entry.email === email);
  if (!user) {
    return null;
  }

  const valid = await verifySecret(password, user.passwordHash);
  if (!valid || !user.emailVerified) {
    return null;
  }

  return toAuthUser(user);
}

export async function getUserByEmail(emailInput: string): Promise<AuthUser | null> {
  const email = normalizeEmail(emailInput);
  const store = await ensureStore();
  const user = store.users.find((entry) => entry.email === email);
  return user ? toAuthUser(user) : null;
}
