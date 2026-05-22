"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Header from "@/components/Header";
import CategoryTabs from "@/components/CategoryTabs";
import TeamCard from "@/components/TeamCard";
import Leaderboard from "@/components/Leaderboard";
import AnimatedCounter from "@/components/AnimatedCounter";
import Toast from "@/components/Toast";
import { useLocalVotes, useResultsPolling, useToasts } from "@/components/hooks";

import { CATEGORIES, TEAMS } from "@/lib/teams";
import { rank } from "@/components/Leaderboard";
import type { CategoryId } from "@/lib/types";

export default function VotingPage() {
  const [active, setActive] = useState<CategoryId>("innovative");
  const { data, loading, setData } = useResultsPolling(2000);
  const { voted, markVoted } = useLocalVotes();
  const { toasts, push } = useToasts();
  const [submitting, setSubmitting] = useState<string | null>(null);

  const isOpen = data?.isOpen ?? false;
  const totalVotes = data?.totalVotes ?? 0;
  const activeCategory = CATEGORIES.find((c) => c.id === active)!;
  const activeCounts = data?.votes?.[active] ?? {};
  const ranked = useMemo(() => rank(activeCounts), [activeCounts]);

  async function castVote(teamId: string) {
    if (!isOpen) {
      push("Voting is closed right now.", "error");
      return;
    }
    if (voted[active]) {
      push("You already voted in this category.", "error");
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
      push(`Locked in for ${team?.name ?? "your pick"} ✨`, "success");
    } catch (e) {
      push((e as Error).message, "error");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <main className="relative">
      <Header isOpen={isOpen} totalVotes={totalVotes} />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-3"
        >
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-violet" /> Hackathon · Live
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Place your bets on the{" "}
            <span className="bg-gradient-to-r from-neon-violet via-neon-magenta to-neon-cyan bg-clip-text text-transparent">
              winners
            </span>
            .
          </h1>
          <p className="max-w-2xl text-sm text-white/60 sm:text-base">
            Three teams. Three categories. One vote each. Counts update live as
            the room decides.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                Total votes
              </span>
              <AnimatedCounter
                value={totalVotes}
                className="font-mono text-lg font-bold text-white"
              />
            </div>
            <div className="hidden h-3 w-px bg-white/10 sm:block" />
            <span className="text-xs text-white/50">
              {isOpen ? "Voting is open — cast yours." : "Waiting for admin to open voting."}
            </span>
          </div>
        </motion.div>
      </section>

      {/* Category + cards */}
      <section className="mx-auto mt-10 max-w-6xl px-4 sm:px-6">
        <CategoryTabs
          categories={CATEGORIES}
          active={active}
          onChange={setActive}
          votedMap={voted}
        />

        <div className="mt-3 flex items-center gap-2 px-1 text-xs text-white/50">
          <span>{activeCategory.tagline}</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mt-5 grid gap-4 md:grid-cols-3"
          >
            {ranked.map((row) => {
              const votedHere = voted[active];
              return (
                <TeamCard
                  key={row.team.id}
                  team={row.team}
                  category={activeCategory}
                  count={row.count}
                  rank={row.rank}
                  isOpen={isOpen}
                  votedForThis={votedHere === row.team.id}
                  hasVotedInCategory={Boolean(votedHere)}
                  disabled={
                    !isOpen ||
                    Boolean(votedHere) ||
                    submitting !== null ||
                    loading
                  }
                  onVote={() => castVote(row.team.id)}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Leaderboards */}
      <section className="mx-auto mt-12 max-w-6xl px-4 pb-16 sm:px-6">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
              Live results
            </div>
            <h2 className="text-xl font-semibold text-white">Leaderboards</h2>
          </div>
          <span className="text-xs text-white/40">
            Auto-refreshing every 2s
          </span>
        </div>
        {data ? (
          <Leaderboard votes={data.votes} />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {CATEGORIES.map((c) => (
              <div
                key={c.id}
                className="h-56 rounded-2xl border border-white/8 bg-ink-800/50 shimmer"
              />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-white/5 bg-ink-900/60 py-6">
        <div className="mx-auto max-w-6xl px-4 text-center text-xs text-white/40 sm:px-6">
          Built for hack night. One device → one vote per category.
        </div>
      </footer>

      <Toast toasts={toasts} />
    </main>
  );
}
