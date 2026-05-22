"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import Header from "@/components/Header";
import Leaderboard from "@/components/Leaderboard";
import AnimatedCounter from "@/components/AnimatedCounter";
import Toast from "@/components/Toast";
import { useResultsPolling, useToasts, useLocalVotes } from "@/components/hooks";
import { CATEGORIES } from "@/lib/teams";
import type { CategoryId } from "@/lib/types";

export default function AdminPage() {
  const { data, setData } = useResultsPolling(1500);
  const { toasts, push } = useToasts();
  const { clearVoted } = useLocalVotes();
  const [confirmReset, setConfirmReset] = useState(false);
  const [busy, setBusy] = useState<null | "toggle" | "reset">(null);

  const isOpen = data?.isOpen ?? false;
  const totalVotes = data?.totalVotes ?? 0;

  async function toggle(target: boolean) {
    setBusy("toggle");
    try {
      const res = await fetch("/api/admin/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: target }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Toggle failed");
      setData(json);
      push(target ? "Voting opened 🚀" : "Voting closed 🛑", "success");
    } catch (e) {
      push((e as Error).message, "error");
    } finally {
      setBusy(null);
    }
  }

  async function reset() {
    setBusy("reset");
    try {
      const res = await fetch("/api/admin/reset", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Reset failed");
      setData(json);
      clearVoted();
      push("All votes cleared", "success");
    } catch (e) {
      push((e as Error).message, "error");
    } finally {
      setBusy(null);
      setConfirmReset(false);
    }
  }

  return (
    <main>
      <Header isOpen={isOpen} totalVotes={totalVotes} variant="admin" />

      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col gap-2"
        >
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-neon-magenta/30 bg-neon-magenta/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-neon-magenta">
            Admin Control
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Mission Control
          </h1>
          <p className="text-sm text-white/55">
            Open and close the voting window, reset the books, and watch the
            leaderboards in real time.
          </p>
        </motion.div>
      </section>

      {/* Controls */}
      <section className="mx-auto mt-8 max-w-6xl px-4 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel title="Voting Status" subtitle="Open or close voting">
            <div className="flex items-center gap-3">
              <div
                className={`grid h-12 w-12 place-items-center rounded-xl ${
                  isOpen
                    ? "bg-neon-lime/15 text-neon-lime"
                    : "bg-white/5 text-white/50"
                }`}
              >
                {isOpen ? "●" : "○"}
              </div>
              <div>
                <div className="text-lg font-semibold text-white">
                  {isOpen ? "Open" : "Closed"}
                </div>
                <div className="text-xs text-white/50">
                  Last updated{" "}
                  {data?.updatedAt
                    ? new Date(data.updatedAt).toLocaleTimeString()
                    : "—"}
                </div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                disabled={busy !== null || isOpen}
                onClick={() => toggle(true)}
                className="rounded-xl bg-neon-lime/90 px-4 py-2.5 text-sm font-semibold text-ink-900 transition hover:bg-neon-lime disabled:cursor-not-allowed disabled:opacity-40"
              >
                Open Voting
              </button>
              <button
                disabled={busy !== null || !isOpen}
                onClick={() => toggle(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Close Voting
              </button>
            </div>
          </Panel>

          <Panel title="Reset Votes" subtitle="Wipe all counts back to zero">
            <div className="text-sm text-white/60">
              This clears every vote across all categories. The voting window
              stays in its current state.
            </div>
            <div className="mt-5">
              {!confirmReset ? (
                <button
                  disabled={busy !== null}
                  onClick={() => setConfirmReset(true)}
                  className="w-full rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20 disabled:opacity-40"
                >
                  Reset all votes…
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={busy !== null}
                    onClick={reset}
                    className="rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:opacity-40"
                  >
                    {busy === "reset" ? "Resetting…" : "Confirm"}
                  </button>
                  <button
                    disabled={busy !== null}
                    onClick={() => setConfirmReset(false)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </Panel>

          <Panel title="Total Votes" subtitle="Across all categories">
            <div className="flex items-end gap-2">
              <AnimatedCounter
                value={totalVotes}
                className="font-mono text-5xl font-bold text-white"
              />
              <span className="pb-2 text-xs uppercase tracking-[0.18em] text-white/40">
                votes
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {CATEGORIES.map((c) => {
                const counts = data?.votes?.[c.id as CategoryId] ?? {};
                const sum = Object.values(counts).reduce((a, b) => a + b, 0);
                return (
                  <div
                    key={c.id}
                    className="rounded-lg border border-white/8 bg-ink-700/40 p-2.5"
                  >
                    <div className="text-[9px] uppercase tracking-[0.16em] text-white/40">
                      {c.label}
                    </div>
                    <AnimatedCounter
                      value={sum}
                      className="font-mono text-lg font-bold text-white"
                    />
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      </section>

      {/* Live leaderboards */}
      <section className="mx-auto mt-10 max-w-6xl px-4 pb-16 sm:px-6">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
              Live results
            </div>
            <h2 className="text-xl font-semibold text-white">Standings</h2>
          </div>
          <span className="text-xs text-white/40">Auto-refreshing every 1.5s</span>
        </div>
        {data && <Leaderboard votes={data.votes} />}
      </section>

      <Toast toasts={toasts} />
    </main>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-white/8 bg-ink-800/60 p-5 backdrop-blur-xl"
    >
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
          {subtitle}
        </div>
        <div className="text-sm font-semibold text-white">{title}</div>
      </div>
      {children}
    </motion.div>
  );
}
