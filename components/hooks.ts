"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CategoryId, VoteCounts, VotesData } from "@/lib/types";
import { CATEGORY_IDS, TEAM_IDS } from "@/lib/teams";

const STORAGE_KEY = "hackvote.votes.v1";

export type LocalVotes = Record<CategoryId, string | null>;

function emptyLocal(): LocalVotes {
  return CATEGORY_IDS.reduce((acc, c) => {
    acc[c as CategoryId] = null;
    return acc;
  }, {} as LocalVotes);
}

export function useLocalVotes() {
  const [voted, setVoted] = useState<LocalVotes>(emptyLocal);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<LocalVotes>;
        setVoted({ ...emptyLocal(), ...parsed });
      }
    } catch {
      /* ignore */
    }
  }, []);

  const markVoted = useCallback((categoryId: CategoryId, teamId: string) => {
    setVoted((prev) => {
      const next = { ...prev, [categoryId]: teamId };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const clearVoted = useCallback(() => {
    setVoted(emptyLocal());
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return { voted, markVoted, clearVoted };
}

export function useResultsPolling(intervalMs = 2000) {
  const [data, setData] = useState<VotesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const aliveRef = useRef(true);

  const fetchOnce = useCallback(async () => {
    try {
      const res = await fetch("/api/results", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as VotesData;
      if (aliveRef.current) {
        setData(json);
        setError(null);
      }
    } catch (e) {
      if (aliveRef.current) setError((e as Error).message);
    } finally {
      if (aliveRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    fetchOnce();
    const id = setInterval(fetchOnce, intervalMs);
    const onVis = () => {
      if (document.visibilityState === "visible") fetchOnce();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      aliveRef.current = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [fetchOnce, intervalMs]);

  return { data, loading, error, refresh: fetchOnce, setData };
}

export function useToasts() {
  const [toasts, setToasts] = useState<
    { id: number; message: string; tone?: "success" | "error" | "info" }[]
  >([]);

  const push = useCallback(
    (message: string, tone: "success" | "error" | "info" = "info") => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, message, tone }]);
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 2600);
    },
    []
  );

  return { toasts, push };
}

/**
 * Tracks per-cell vote deltas between poll snapshots and exposes
 * a "recently bumped" flag (true for ~LIFETIME_MS after each increment).
 * Powers the live trend chips and flash-pops.
 */
const LIFETIME_MS = 4500;

export interface CellSignal {
  delta: number; // current count minus previous count
  bumpedAt: number; // timestamp of last positive delta
  hot: boolean; // bumped within LIFETIME_MS
}

export type Signals = Record<CategoryId, Record<string, CellSignal>>;

function emptySignals(): Signals {
  const out = {} as Signals;
  for (const c of CATEGORY_IDS) {
    out[c as CategoryId] = {};
    for (const t of TEAM_IDS) {
      out[c as CategoryId][t] = { delta: 0, bumpedAt: 0, hot: false };
    }
  }
  return out;
}

export function useSignals(votes: VoteCounts | undefined) {
  const prevRef = useRef<VoteCounts | null>(null);
  const [signals, setSignals] = useState<Signals>(emptySignals);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!votes) return;
    if (!prevRef.current) {
      prevRef.current = JSON.parse(JSON.stringify(votes));
      return;
    }
    const next = emptySignals();
    let anyBumped = false;
    const now = Date.now();
    for (const c of CATEGORY_IDS) {
      const cat = c as CategoryId;
      for (const t of TEAM_IDS) {
        const prev = prevRef.current[cat]?.[t] ?? 0;
        const curr = votes[cat]?.[t] ?? 0;
        const prevSig = signals[cat]?.[t] ?? { delta: 0, bumpedAt: 0, hot: false };
        const delta = curr - prev;
        const bumpedAt = delta > 0 ? now : prevSig.bumpedAt;
        next[cat][t] = {
          delta,
          bumpedAt,
          hot: bumpedAt > 0 && now - bumpedAt < LIFETIME_MS,
        };
        if (delta > 0) anyBumped = true;
      }
    }
    prevRef.current = JSON.parse(JSON.stringify(votes));
    setSignals(next);
    if (anyBumped) setTick((n) => n + 1);
    // intentionally exclude `signals` from deps — we read latest via closure for bumpedAt persistence
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [votes]);

  // Heartbeat to cool "hot" flags without waiting for next poll
  useEffect(() => {
    const id = setInterval(() => {
      setSignals((prev) => {
        const now = Date.now();
        let changed = false;
        const next = { ...prev };
        for (const c of CATEGORY_IDS) {
          const cat = c as CategoryId;
          next[cat] = { ...prev[cat] };
          for (const t of TEAM_IDS) {
            const cell = prev[cat]?.[t];
            if (!cell) continue;
            const hot = cell.bumpedAt > 0 && now - cell.bumpedAt < LIFETIME_MS;
            if (hot !== cell.hot) {
              next[cat][t] = { ...cell, hot };
              changed = true;
            }
          }
        }
        return changed ? next : prev;
      });
    }, 800);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => ({ signals, tick }), [signals, tick]);
}
