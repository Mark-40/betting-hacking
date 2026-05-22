"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import Header from "@/components/Header";
import Leaderboard from "@/components/Leaderboard";
import AnimatedCounter from "@/components/AnimatedCounter";
import Toast from "@/components/Toast";
import Ticker from "@/components/Ticker";
import {
  useResultsPolling,
  useToasts,
  useLocalVotes,
  useSignals,
} from "@/components/hooks";
import { CATEGORIES } from "@/lib/teams";
import type { CategoryId } from "@/lib/types";

export default function AdminPage() {
  const { data, setData } = useResultsPolling(1500);
  const { signals } = useSignals(data?.votes);
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
      push(target ? "Market opened 🚀" : "Market closed 🛑", "success");
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

      <section className="mx-auto max-w-7xl px-5 pt-12 sm:px-8 sm:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col gap-3"
        >
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-neon-magenta/30 bg-neon-magenta/10 px-3 py-1 text-[10px] uppercase tracking-[0.26em] text-neon-magenta">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-magenta animate-pulse" />
            Admin Control
          </span>
          <h1 className="font-display text-4xl font-bold tracking-tightest text-white sm:text-5xl">
            Mission Control
          </h1>
          <p className="max-w-xl text-sm text-white/55">
            Open and close the markets, reset the books, and watch the
            standings shift in real time.
          </p>
        </motion.div>
      </section>

      <div className="mt-8">
        <Ticker votes={data?.votes} signals={signals} />
      </div>

      {/* Controls */}
      <section className="mx-auto mt-10 max-w-7xl px-5 sm:px-8">
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel title="Market Status" subtitle="Open or close voting" accent="lime">
            <div className="flex items-center gap-3">
              <div
                className={`grid h-12 w-12 place-items-center rounded-xl text-2xl font-bold ${
                  isOpen
                    ? "bg-neon-lime/15 text-neon-lime shadow-[0_0_24px_rgba(163,230,53,0.25)]"
                    : "bg-white/5 text-white/50"
                }`}
              >
                {isOpen ? "●" : "○"}
              </div>
              <div className="leading-tight">
                <div className="font-display text-lg font-semibold tracking-tight text-white">
                  {isOpen ? "Open" : "Closed"}
                </div>
                <div className="mt-0.5 text-[11px] text-white/45">
                  Updated{" "}
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
                className="rounded-xl bg-neon-lime/95 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-950 transition hover:bg-neon-lime disabled:cursor-not-allowed disabled:opacity-40"
              >
                Open Market
              </button>
              <button
                disabled={busy !== null || !isOpen}
                onClick={() => toggle(false)}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Close Market
              </button>
            </div>
          </Panel>

          <Panel
            title="Reset Votes"
            subtitle="Wipe all counts back to zero"
            accent="rose"
          >
            <div className="text-sm text-white/60">
              Clears every vote across all markets. The market status stays as
              it is.
            </div>
            <div className="mt-5">
              {!confirmReset ? (
                <button
                  disabled={busy !== null}
                  onClick={() => setConfirmReset(true)}
                  className="w-full rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-200 transition hover:bg-rose-500/20 disabled:opacity-40"
                >
                  Reset all votes…
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={busy !== null}
                    onClick={reset}
                    className="rounded-xl bg-rose-500 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-rose-400 disabled:opacity-40"
                  >
                    {busy === "reset" ? "Resetting…" : "Confirm"}
                  </button>
                  <button
                    disabled={busy !== null}
                    onClick={() => setConfirmReset(false)}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/[0.08]"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </Panel>

          <Panel title="Total Bets" subtitle="Across all markets" accent="violet">
            <div className="flex items-end gap-2">
              <AnimatedCounter
                value={totalVotes}
                className="tabular font-display text-5xl font-bold leading-none tracking-tightest text-white"
              />
              <span className="pb-1.5 text-[10px] uppercase tracking-[0.24em] text-white/40">
                votes
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {CATEGORIES.map((c) => {
                const counts = data?.votes?.[c.id as CategoryId] ?? {};
                const sum = Object.values(counts).reduce((a, b) => a + b, 0);
                const dot =
                  c.accent === "violet"
                    ? "bg-neon-violet"
                    : c.accent === "cyan"
                      ? "bg-neon-cyan"
                      : "bg-neon-magenta";
                return (
                  <div
                    key={c.id}
                    className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5"
                  >
                    <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.18em] text-white/40">
                      <span className={`h-1 w-1 rounded-full ${dot}`} />
                      {c.label
                        .replace("Who do you think will win the ", "")
                        .replace("?", "")
                        .split(" ")
                        .slice(-1)}
                    </div>
                    <AnimatedCounter
                      value={sum}
                      className="tabular mt-0.5 font-mono text-lg font-bold text-white"
                    />
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      </section>

      {/* Live leaderboards */}
      <section className="mx-auto mt-12 max-w-7xl px-5 pb-16 sm:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.26em] text-white/40">
              <span className="h-1 w-6 bg-gradient-to-r from-neon-cyan to-transparent" />
              Live Results
            </div>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tightest text-white sm:text-3xl">
              Standings
            </h2>
          </div>
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/35">
            1.5s refresh
          </span>
        </div>
        {data && <Leaderboard votes={data.votes} signals={signals} />}
      </section>

      <Toast toasts={toasts} />
    </main>
  );
}

const ACCENT_BAR: Record<string, string> = {
  lime: "from-neon-lime via-emerald-500 to-transparent",
  rose: "from-rose-500 via-rose-400 to-transparent",
  violet: "from-neon-violet via-neon-magenta to-transparent",
};

function Panel({
  title,
  subtitle,
  children,
  accent = "violet",
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  accent?: "lime" | "rose" | "violet";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-850/70 p-5 backdrop-blur-xl"
    >
      <div
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${ACCENT_BAR[accent]}`}
      />
      <div className="mb-4">
        <div className="text-[9px] uppercase tracking-[0.24em] text-white/40">
          {subtitle}
        </div>
        <div className="font-display text-sm font-semibold tracking-tight text-white">
          {title}
        </div>
      </div>
      {children}
    </motion.div>
  );
}
