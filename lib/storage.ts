import fs from "fs";
import path from "path";
import { CATEGORY_IDS, TEAM_IDS } from "./teams";
import type { CategoryId, VoteCounts, VotesData } from "./types";

/**
 * Storage facade.
 *
 * - In production / when Vercel KV env vars are present (KV_REST_API_URL +
 *   KV_REST_API_TOKEN), all reads/writes go through @vercel/kv. Vote
 *   counters use atomic INCR so concurrent votes never lose updates.
 * - Otherwise, falls back to local JSON file storage with an in-memory
 *   mirror on globalThis (so Next.js dev HMR doesn't drop counts).
 */

const USE_KV = Boolean(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
);

const NS = "hackvote";
const K_OPEN = `${NS}:isOpen`;
const K_UPDATED = `${NS}:updatedAt`;
const kCount = (c: string, t: string) => `${NS}:votes:${c}:${t}`;

// ---------- shared helpers ----------

function emptyCounts(): VoteCounts {
  const counts = {} as VoteCounts;
  for (const cat of CATEGORY_IDS) {
    counts[cat as CategoryId] = {};
    for (const teamId of TEAM_IDS) {
      counts[cat as CategoryId][teamId] = 0;
    }
  }
  return counts;
}

function defaultState(): VotesData {
  return {
    isOpen: false,
    votes: emptyCounts(),
    totalVotes: 0,
    updatedAt: new Date().toISOString(),
  };
}

function sumVotes(votes: VoteCounts): number {
  let n = 0;
  for (const c of CATEGORY_IDS) {
    for (const t of TEAM_IDS) {
      n += votes[c as CategoryId]?.[t] ?? 0;
    }
  }
  return n;
}

// ---------- public API ----------

export async function getState(): Promise<VotesData> {
  return USE_KV ? kvGet() : Promise.resolve(fileGet());
}

export async function incrementVote(
  categoryId: CategoryId,
  teamId: string
): Promise<VotesData> {
  return USE_KV ? kvIncrement(categoryId, teamId) : Promise.resolve(fileIncrement(categoryId, teamId));
}

export async function setOpen(isOpen: boolean): Promise<VotesData> {
  return USE_KV ? kvSetOpen(isOpen) : Promise.resolve(fileSetOpen(isOpen));
}

export async function toggleOpen(): Promise<VotesData> {
  const s = await getState();
  return setOpen(!s.isOpen);
}

export async function resetAll(): Promise<VotesData> {
  return USE_KV ? kvReset() : Promise.resolve(fileReset());
}

// ============================================================
// Vercel KV backend
// ============================================================

async function kvGet(): Promise<VotesData> {
  const { kv } = await import("@vercel/kv");
  const cellKeys: string[] = [];
  for (const c of CATEGORY_IDS) {
    for (const t of TEAM_IDS) cellKeys.push(kCount(c, t));
  }
  const [isOpen, updatedAt, ...counts] = await Promise.all([
    kv.get<boolean>(K_OPEN),
    kv.get<string>(K_UPDATED),
    ...cellKeys.map((k) => kv.get<number>(k)),
  ]);

  const votes = emptyCounts();
  let i = 0;
  for (const c of CATEGORY_IDS) {
    for (const t of TEAM_IDS) {
      votes[c as CategoryId][t] = counts[i] ?? 0;
      i++;
    }
  }
  return {
    isOpen: Boolean(isOpen),
    votes,
    totalVotes: sumVotes(votes),
    updatedAt: updatedAt ?? new Date().toISOString(),
  };
}

async function kvIncrement(
  categoryId: CategoryId,
  teamId: string
): Promise<VotesData> {
  const { kv } = await import("@vercel/kv");
  // Atomic — no race condition between concurrent votes.
  await Promise.all([
    kv.incr(kCount(categoryId, teamId)),
    kv.set(K_UPDATED, new Date().toISOString()),
  ]);
  return kvGet();
}

async function kvSetOpen(isOpen: boolean): Promise<VotesData> {
  const { kv } = await import("@vercel/kv");
  await Promise.all([
    kv.set(K_OPEN, isOpen),
    kv.set(K_UPDATED, new Date().toISOString()),
  ]);
  return kvGet();
}

async function kvReset(): Promise<VotesData> {
  const { kv } = await import("@vercel/kv");
  const ops: Promise<unknown>[] = [];
  for (const c of CATEGORY_IDS) {
    for (const t of TEAM_IDS) {
      ops.push(kv.set(kCount(c, t), 0));
    }
  }
  ops.push(kv.set(K_UPDATED, new Date().toISOString()));
  await Promise.all(ops);
  return kvGet();
}

// ============================================================
// Local JSON file backend (dev fallback)
// ============================================================

const DATA_DIR = path.join(process.cwd(), "data");
const VOTES_FILE = path.join(DATA_DIR, "votes.json");
const TMP_FILE = VOTES_FILE + ".tmp";

const GLOBAL_KEY = "__hackvote_store_v1__";
type Globals = { [GLOBAL_KEY]?: VotesData };
const g = globalThis as unknown as Globals;

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function normalize(parsed: Partial<VotesData> | null | undefined): VotesData {
  const base = defaultState();
  if (!parsed) return base;
  for (const cat of CATEGORY_IDS) {
    const c = cat as CategoryId;
    base.votes[c] = { ...base.votes[c], ...(parsed.votes?.[c] ?? {}) };
  }
  return {
    isOpen: Boolean(parsed.isOpen),
    votes: base.votes,
    totalVotes:
      typeof parsed.totalVotes === "number"
        ? parsed.totalVotes
        : sumVotes(base.votes),
    updatedAt: parsed.updatedAt ?? new Date().toISOString(),
  };
}

function readFromFile(): VotesData | null {
  try {
    if (!fs.existsSync(VOTES_FILE)) return null;
    const raw = fs.readFileSync(VOTES_FILE, "utf-8");
    if (!raw.trim()) return null;
    return normalize(JSON.parse(raw) as Partial<VotesData>);
  } catch {
    return null;
  }
}

function writeToFile(state: VotesData): boolean {
  try {
    ensureDir();
    fs.writeFileSync(TMP_FILE, JSON.stringify(state, null, 2), "utf-8");
    fs.renameSync(TMP_FILE, VOTES_FILE);
    return true;
  } catch {
    try {
      if (fs.existsSync(TMP_FILE)) fs.unlinkSync(TMP_FILE);
    } catch {
      /* ignore */
    }
    return false;
  }
}

function bestOf(
  a: VotesData | undefined,
  b: VotesData | null
): VotesData | null {
  if (!a && !b) return null;
  if (!a) return b;
  if (!b) return a;
  if (a.totalVotes !== b.totalVotes) {
    return a.totalVotes > b.totalVotes ? a : b;
  }
  return new Date(a.updatedAt) >= new Date(b.updatedAt) ? a : b;
}

function fileGet(): VotesData {
  const merged = bestOf(g[GLOBAL_KEY], readFromFile()) ?? defaultState();
  g[GLOBAL_KEY] = merged;
  if (!fs.existsSync(VOTES_FILE)) writeToFile(merged);
  return merged;
}

function fileWrite(state: VotesData): VotesData {
  const next: VotesData = {
    ...state,
    totalVotes: sumVotes(state.votes),
    updatedAt: new Date().toISOString(),
  };
  g[GLOBAL_KEY] = next;
  writeToFile(next);
  return next;
}

function fileIncrement(cat: CategoryId, team: string): VotesData {
  const s = fileGet();
  const next: VotesData = {
    ...s,
    votes: {
      innovative: { ...s.votes.innovative },
      organized: { ...s.votes.organized },
      pitch: { ...s.votes.pitch },
    },
  };
  next.votes[cat][team] = (next.votes[cat][team] ?? 0) + 1;
  return fileWrite(next);
}

function fileSetOpen(isOpen: boolean): VotesData {
  const s = fileGet();
  return fileWrite({ ...s, isOpen });
}

function fileReset(): VotesData {
  const s = fileGet();
  return fileWrite({ ...s, votes: emptyCounts(), totalVotes: 0 });
}

// ---------- backend identity (handy for debugging) ----------
export const STORAGE_BACKEND: "kv" | "file" = USE_KV ? "kv" : "file";
