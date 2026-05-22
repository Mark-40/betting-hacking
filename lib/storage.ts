import fs from "fs";
import path from "path";
import { CATEGORY_IDS, TEAM_IDS } from "./teams";
import type { CategoryId, VoteCounts, VotesData } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const VOTES_FILE = path.join(DATA_DIR, "votes.json");

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

// Fallback in-memory store for serverless/read-only filesystems (e.g. Vercel prod).
let memoryStore: VotesData | null = null;

function tryWrite(state: VotesData): boolean {
  try {
    ensureDir();
    fs.writeFileSync(VOTES_FILE, JSON.stringify(state, null, 2), "utf-8");
    return true;
  } catch {
    return false;
  }
}

export function readState(): VotesData {
  if (memoryStore) return memoryStore;
  try {
    ensureDir();
    if (!fs.existsSync(VOTES_FILE)) {
      const initial = defaultState();
      tryWrite(initial);
      memoryStore = initial;
      return initial;
    }
    const raw = fs.readFileSync(VOTES_FILE, "utf-8");
    const parsed = JSON.parse(raw) as VotesData;
    // self-heal: ensure all category/team keys exist
    const base = defaultState();
    for (const cat of CATEGORY_IDS) {
      const c = cat as CategoryId;
      base.votes[c] = { ...base.votes[c], ...(parsed.votes?.[c] ?? {}) };
    }
    const healed: VotesData = {
      isOpen: Boolean(parsed.isOpen),
      votes: base.votes,
      totalVotes: parsed.totalVotes ?? 0,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
    memoryStore = healed;
    return healed;
  } catch {
    const initial = defaultState();
    memoryStore = initial;
    return initial;
  }
}

export function writeState(state: VotesData): VotesData {
  state.updatedAt = new Date().toISOString();
  memoryStore = state;
  tryWrite(state); // best-effort persistence
  return state;
}

export function updateState(mutator: (s: VotesData) => VotesData | void): VotesData {
  const current = readState();
  // shallow clone deep enough for our shape
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
