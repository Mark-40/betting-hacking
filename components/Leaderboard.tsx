"use client";

import { motion, AnimatePresence } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";
import { TEAMS, CATEGORIES } from "@/lib/teams";
import type { VoteCounts, CategoryId, RankedTeam } from "@/lib/types";

interface Props {
  votes: VoteCounts;
}

function rank(counts: Record<string, number>): RankedTeam[] {
  return TEAMS.map((team) => ({ team, count: counts[team.id] ?? 0, rank: 0 }))
    .sort((a, b) => b.count - a.count)
    .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
}

const ACCENT_BAR: Record<string, string> = {
  innovative: "from-neon-violet to-neon-magenta",
  organized: "from-neon-cyan to-sky-500",
  pitch: "from-neon-magenta to-neon-violet",
};

export default function Leaderboard({ votes }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {CATEGORIES.map((c) => {
        const ranked = rank(votes[c.id as CategoryId] ?? {});
        const leader = ranked[0];
        return (
          <div
            key={c.id}
            className="relative overflow-hidden rounded-2xl border border-white/8 bg-ink-800/60 p-5 backdrop-blur-xl"
          >
            <div
              aria-hidden
              className={`absolute -top-px left-0 h-px w-full bg-gradient-to-r ${ACCENT_BAR[c.id]} opacity-70`}
            />
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                  Leaderboard
                </div>
                <div className="text-sm font-semibold text-white">{c.label}</div>
              </div>
              {leader && leader.count > 0 && (
                <span className="rounded-full border border-neon-gold/40 bg-neon-gold/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-neon-gold">
                  Leader · {leader.team.name}
                </span>
              )}
            </div>

            <ol className="space-y-2">
              <AnimatePresence initial={false}>
                {ranked.map((row) => (
                  <motion.li
                    key={row.team.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 240, damping: 26 }}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-7 w-7 place-items-center rounded-md bg-white/5 text-xs font-bold text-white/70">
                        #{row.rank}
                      </span>
                      <span className="text-lg">{row.team.emoji}</span>
                      <span className="text-sm font-medium text-white">
                        {row.team.name}
                      </span>
                    </div>
                    <AnimatedCounter
                      value={row.count}
                      className="font-mono text-lg font-bold text-white"
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ol>
          </div>
        );
      })}
    </div>
  );
}

export { rank };
