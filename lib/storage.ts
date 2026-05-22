import fs from "fs";
import path from "path";
import { CATEGORY_IDS, TEAM_IDS } from "./teams";
import type { CategoryId, VoteCounts, VotesData } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const VOTES_FILE = path.join(DATA_DIR, "votes.json");
const TMP_FILE = VOTES_FILE + ".tmp";

/**
 * Persist the in-memory snapshot on globalThis so it survives Next.js dev-mode
 * module reloads (HMR). Writing to data/votes.json triggers the file watcher,
 * which would otherwise blow away a module-scoped `let memoryStore = null`.
 */
const GLOBAL_KEY = "__hackvote_store_v1__";

type Globals = {
  [GLOBAL_KEY]?: VotesData;
};
const g = globalThis as unknown as Globals;

function getMem(): VotesData | undefined {
  return g[GLOBAL_KEY];
}
function setMem(s: VotesData) {
  g[GLOBAL_KEY] = s;
}

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

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
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
        : recomputeTotal(base.votes),
    updatedAt: parsed.updatedAt ?? new Date().toISOString(),
  };
}

function recomputeTotal(votes: VoteCounts): number {
  let n = 0;
  for (const c of CATEGORY_IDS) {
    for (const t of TEAM_IDS) {
      n += votes[c as CategoryId]?.[t] ?? 0;
    }
  }
  return n;
}

function readFromFile(): VotesData | null {
  try {
    if (!fs.existsSync(VOTES_FILE)) return null;
    const raw = fs.readFileSync(VOTES_FILE, "utf-8");
    if (!raw.trim()) return null;
    const parsed = JSON.parse(raw) as Partial<VotesData>;
    return normalize(parsed);
  } catch {
    return null;
  }
}

function writeToFile(state: VotesData): boolean {
  try {
    ensureDir();
    // Atomic write: write to .tmp then rename, so a partial/aborted write
    // never leaves an empty or half-written votes.json on disk.
    fs.writeFileSync(TMP_FILE, JSON.stringify(state, null, 2), "utf-8");
    fs.renameSync(TMP_FILE, VOTES_FILE);
    return true;
  } catch {
    // Cleanup orphan tmp if rename failed
    try {
      if (fs.existsSync(TMP_FILE)) fs.unlinkSync(TMP_FILE);
    } catch {
      /* ignore */
    }
    return false;
  }
}

/**
 * Pick the most-trusted snapshot from memory + disk.
 * The one with the higher totalVotes (or newer updatedAt) wins — this protects
 * against the dev-mode case where memory was reset to null but disk still has
 * the latest writes, or vice-versa.
 */
function bestOf(a: VotesData | undefined, b: VotesData | null): VotesData | null {
  if (!a && !b) return null;
  if (!a) return b;
  if (!b) return a;
  if (a.totalVotes !== b.totalVotes) {
    return a.totalVotes > b.totalVotes ? a : b;
  }
  return new Date(a.updatedAt) >= new Date(b.updatedAt) ? a : b;
}

export function readState(): VotesData {
  const mem = getMem();
  const file = readFromFile();
  const merged = bestOf(mem, file) ?? defaultState();

  // Keep both stores in sync with the chosen snapshot.
  setMem(merged);
  if (!file || file.updatedAt !== merged.updatedAt) {
    writeToFile(merged);
  }
  return merged;
}

export function writeState(state: VotesData): VotesData {
  const next: VotesData = {
    ...state,
    totalVotes: recomputeTotal(state.votes),
    updatedAt: new Date().toISOString(),
  };
  setMem(next);
  writeToFile(next);
  return next;
}

export function updateState(mutator: (s: VotesData) => VotesData | void): VotesData {
  const current = readState();
  const next: VotesData = {
    isOpen: current.isOpen,
    totalVotes: current.totalVotes,
    updatedAt: current.updatedAt,
    votes: {
      innovative: { ...current.votes.innovative },
      organized: { ...current.votes.organized },
      pitch: { ...current.votes.pitch },
    },
  };
  const result = mutator(next) ?? next;
  return writeState(result);
}

export function resetVotes(): VotesData {
  return updateState((s) => {
    s.votes = emptyCounts();
    s.totalVotes = 0;
  });
}
