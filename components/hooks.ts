"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CategoryId, VotesData } from "@/lib/types";
import { CATEGORY_IDS } from "@/lib/teams";

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
