import { Surreal } from "surrealdb";

let db: Surreal | null = null;

export async function getSurrealClient() {
  const url = process.env.SURREAL_URL;
  const user = process.env.SURREAL_USER;
  const pass = process.env.SURREAL_PASS;
  const ns = process.env.SURREAL_NS || "outoftime";
  const database = process.env.SURREAL_DB || "portal";

  if (!url || !user || !pass) {
    return null;
  }

  if (!db) {
    db = new Surreal();
    await db.connect(url);
    await db.signin({ username: user, password: pass });
    await db.use({ namespace: ns, database });
  }

  return db;
}
