"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Header from "@/components/Header";
import CategoryTabs from "@/components/CategoryTabs";
import TeamCard from "@/components/TeamCard";
import Leaderboard from "@/components/Leaderboard";
import AnimatedCounter from "@/components/AnimatedCounter";
import Toast from "@/components/Toast";
import Ticker from "@/components/Ticker";
import {
  useLocalVotes,
  useResultsPolling,
  useToasts,
  useSignals,
} from "@/components/hooks";

import { CATEGORIES, TEAMS } from "@/lib/teams";
import { rank } from "@/components/Leaderboard";
import type { CategoryId } from "@/lib/types";

export default function VotingPage() {
  const [active, setActive] = useState<CategoryId>("innovative");
  const { data, loading, setData } = useResultsPolling(2000);
  const { voted, markVoted } = useLocalVotes();
  const { toasts, push } = useToasts();
  const { signals } = useSignals(data?.votes);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const isOpen = data?.isOpen ?? false;
  const totalVotes = data?.totalVotes ?? 0;
  const activeCategory = CATEGORIES.find((c) => c.id === active)!;
  const activeCounts = data?.votes?.[active] ?? {};
  const ranked = useMemo(() => rank(activeCounts), [activeCounts]);

  const totalsByCategory = useMemo(() => {
    const out = {} as Record<CategoryId, number>;
    for (const c of CATEGORIES) {
      const counts = data?.votes?.[c.id as CategoryId] ?? {};
      out[c.id as CategoryId] = Object.values(counts).reduce((a, b) => a + b, 0);
    }
    return out;
  }, [data]);

  async function castVote(teamId: string) {
    if (!isOpen) {
      push("Market is closed right now.", "error");
      return;
    }
    if (voted[active]) {
      push("You already placed a vote in this market.", "error");
      return;
    }
    setSubmitting(teamId);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: active, teamId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Vote failed");
      setData(json);
      markVoted(active, teamId);
      const team = TEAMS.find((t) => t.id === teamId);
      push(`Locked in for ${team?.name.split(" - ")[0] ?? "your pick"} ✨`, "success");
    } catch (e) {
      push((e as Error).message, "error");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <main className="relative">
      <Header isOpen={isOpen} totalVotes={totalVotes} />

      {/* HERO — tall, asymmetric, cinematic */}
      <section className="relative mx-auto max-w-7xl px-5 pt-14 sm:px-8 sm:pt-20 lg:pt-24">
        {/* radial accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[600px] -z-10"
          style={{
            background:
              "radial-gradient(700px circle at 30% 0%, rgba(168,85,247,0.22), transparent 55%), radial-gradient(700px circle at 80% 30%, rgba(34,211,238,0.16), transparent 60%)",
          }}
        />

        <div className="grid items-start gap-10 lg:grid-cols-[1.45fr_1fr] lg:gap-14">
          {/* Left — title block */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.28em]">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-white/65">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-neon-violet/70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-neon-violet" />
                </span>
                Hack the Workflow · Wellevate
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-white/45">
                3 Markets · 3 Teams · 1 Pick Each
              </span>
            </div>

            <h1 className="font-display text-5xl font-bold leading-[0.92] tracking-tightest text-white sm:text-6xl lg:text-[78px]">
              Place your bets on the{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-neon-violet via-neon-magenta to-neon-cyan bg-clip-text text-transparent">
                  winners
                </span>
                <span
                  aria-hidden
                  className="absolute inset-0 -z-10 bg-gradient-to-r from-neon-violet via-neon-magenta to-neon-cyan opacity-30 blur-2xl"
                />
              </span>
              .
            </h1>

            <p className="max-w-xl text-[15px] leading-relaxed text-white/55 sm:text-base">
              A live, Polymarket-style arena for our hackathon. Vote across
              three markets — <span className="text-white/85">Innovation</span>,{" "}
              <span className="text-white/85">Execution</span>, and{" "}
              <span className="text-white/85">Pitch</span>. Counts move in real
              time as the room decides.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#markets"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-950 transition hover:bg-white/90"
              >
                Enter Market
                <span className="transition group-hover:translate-x-0.5">→</span>
              </a>
              <a
                href="#standings"
                className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.03] px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-white/80 transition hover:border-white/30 hover:bg-white/[0.06]"
              >
                Live Standings
              </a>
            </div>
          </motion.div>

          {/* Right — live stats panel */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-2 -z-10 rounded-3xl opacity-60 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle at 50% 30%, rgba(168,85,247,0.25), transparent 70%)",
              }}
            />
            <div className="glass-strong relative overflow-hidden rounded-2xl p-5 sm:p-6">
              <div className="absolute inset-x-0 top-0 h-px bg-hairline" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.28em] text-white/35">
                    Live Index
                  </div>
                  <div className="mt-1 font-display text-sm font-semibold tracking-tight text-white/90">
                    Market Activity
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-white/55">
                  <span className="h-1 w-1 rounded-full bg-neon-lime animate-pulse" />
                  2s refresh
                </span>
              </div>

              <div className="mt-5 flex items-end gap-3">
                <AnimatedCounter
                  value={totalVotes}
                  className="tabular font-display text-6xl font-bold leading-none tracking-tightest text-white"
                />
                <span className="pb-1.5 text-[10px] uppercase tracking-[0.24em] text-white/40">
                  total bets cast
                </span>
              </div>

              <div className="mt-5 hairline" />

              <div className="mt-4 grid grid-cols-3 gap-3">
                {CATEGORIES.map((c) => {
                  const total = totalsByCategory[c.id as CategoryId] ?? 0;
                  const dot =
                    c.accent === "violet"
                      ? "bg-neon-violet"
                      : c.accent === "cyan"
                        ? "bg-neon-cyan"
                        : "bg-neon-magenta";
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActive(c.id as CategoryId)}
                      className={`group flex flex-col items-start rounded-lg border px-3 py-2.5 text-left transition ${
                        c.id === active
                          ? "border-white/20 bg-white/[0.04]"
                          : "border-white/[0.06] bg-white/[0.015] hover:border-white/15 hover:bg-white/[0.03]"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-white/45">
                        <span className={`h-1 w-1 rounded-full ${dot}`} />
                        {c.label
                          .replace(/^Who will win the\s+/i, "")
                          .replace(/^Who do you think will win the\s+/i, "")
                          .replace(/\?$/, "")
                          .split(" ")
                          .slice(-1)}
                      </span>
                      <AnimatedCounter
                        value={total}
                        className="tabular mt-1 font-mono text-xl font-bold text-white"
                      />
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-lg border border-white/[0.05] bg-ink-950/40 px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2 w-2">
                    {isOpen && (
                      <span className="absolute inset-0 animate-ping rounded-full bg-neon-lime/60" />
                    )}
                    <span
                      className={`relative inline-flex h-2 w-2 rounded-full ${
                        isOpen ? "bg-neon-lime shadow-[0_0_10px_rgba(163,230,53,0.7)]" : "bg-white/40"
                      }`}
                    />
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.22em] text-white/65">
                    {isOpen ? "Market open — go bet" : "Awaiting admin to open"}
                  </span>
                </div>
                <span className="text-[10px] text-white/35">
                  {data?.updatedAt
                    ? new Date(data.updatedAt).toLocaleTimeString()
                    : "—"}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TICKER */}
      <div className="mt-12 sm:mt-16">
        <Ticker votes={data?.votes} signals={signals} />
      </div>

      {/* MARKETS */}
      <section
        id="markets"
        className="mx-auto mt-12 max-w-7xl px-5 sm:mt-16 sm:px-8"
      >
        <div className="mb-5 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.26em] text-white/40">
              <span className="h-1 w-6 bg-gradient-to-r from-neon-violet to-transparent" />
              Markets
            </div>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tightest text-white sm:text-3xl">
              Cast your votes
            </h2>
          </div>
          <div className="hidden text-right text-[11px] text-white/40 sm:block">
            One vote per market · same team allowed across markets
          </div>
        </div>

        <CategoryTabs
          categories={CATEGORIES}
          active={active}
          onChange={setActive}
          votedMap={voted}
          totals={totalsByCategory}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
            {ranked.map((row, idx) => {
              const votedHere = voted[active];
              const sig = signals[active]?.[row.team.id];
              return (
                <div key={row.team.id} className={idx === 0 ? "xl:col-span-1" : ""}>
                  <TeamCard
                    team={row.team}
                    category={activeCategory}
                    count={row.count}
                    rank={row.rank}
                    isOpen={isOpen}
                    votedForThis={votedHere === row.team.id}
                    hasVotedInCategory={Boolean(votedHere)}
                    signal={sig}
                    emphasize={row.rank === 1 && row.count > 0}
                    disabled={
                      !isOpen || Boolean(votedHere) || submitting !== null || loading
                    }
                    onVote={() => castVote(row.team.id)}
                  />
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* STANDINGS */}
      <section
        id="standings"
        className="mx-auto mt-20 max-w-7xl px-5 pb-16 sm:px-8"
      >
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.26em] text-white/40">
              <span className="h-1 w-6 bg-gradient-to-r from-neon-cyan to-transparent" />
              Live Standings
            </div>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tightest text-white sm:text-3xl">
              The board
            </h2>
          </div>
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/35">
            ranks auto-update
          </span>
        </div>
        {data ? (
          <Leaderboard votes={data.votes} signals={signals} />
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            {CATEGORIES.map((c) => (
              <div
                key={c.id}
                className="h-64 rounded-2xl border border-white/[0.06] bg-ink-850/50 shimmer"
              />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-white/[0.06] bg-ink-950/60 py-7">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 text-center text-[11px] text-white/35 sm:flex-row sm:px-8 sm:text-left">
          <span className="uppercase tracking-[0.22em]">
            HackVote · Built for the floor
          </span>
          <span>One device → one vote per market · localStorage gated</span>
        </div>
      </footer>

      <Toast toasts={toasts} />
    </main>
  );
}
