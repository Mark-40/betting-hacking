"use client";

import { motion, AnimatePresence } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";
import { TEAMS, CATEGORIES } from "@/lib/teams";
import type { VoteCounts, CategoryId, RankedTeam } from "@/lib/types";
import type { Signals } from "./hooks";

interface Props {
  votes: VoteCounts;
  signals: Signals;
}

function rank(counts: Record<string, number>): RankedTeam[] {
  return TEAMS.map((team) => ({ team, count: counts[team.id] ?? 0, rank: 0 }))
    .sort((a, b) => b.count - a.count)
    .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
}

const ACCENT_BG_HEX: Record<string, string> = {
  innovative: "168, 85, 247",
  organized: "34, 211, 238",
  pitch: "236, 72, 153",
};

const ACCENT_BAR: Record<string, string> = {
  innovative: "from-neon-violet via-neon-magenta to-transparent",
  organized: "from-neon-cyan via-sky-500 to-transparent",
  pitch: "from-neon-magenta via-neon-violet to-transparent",
};

const ACCENT_DOT: Record<string, string> = {
  innovative: "bg-neon-violet",
  organized: "bg-neon-cyan",
  pitch: "bg-neon-magenta",
};

function shortLabel(label: string) {
  return label
    .replace(/^Who will win the\s+/i, "")
    .replace(/^Who do you think will win the\s+/i, "")
    .replace(/\?$/, "");
}

export default function Leaderboard({ votes, signals }: Props) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {CATEGORIES.map((c) => {
        const ranked = rank(votes[c.id as CategoryId] ?? {});
        const total = ranked.reduce((a, r) => a + r.count, 0);
        const leader = ranked[0];
        const accent = ACCENT_BG_HEX[c.id];

        return (
          <div key={c.id} className="relative">
            {/* Ambient glow behind panel */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-3 -z-10 rounded-3xl opacity-50 blur-3xl"
              style={{ background: `radial-gradient(circle at 50% 30%, rgba(${accent}, 0.18), transparent 60%)` }}
            />
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-850/70 backdrop-blur-xl">
              <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${ACCENT_BAR[c.id]}`} />

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5">
                <div className="flex items-center gap-2.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${ACCENT_DOT[c.id]} shadow-[0_0_10px_currentColor]`} />
                  <div className="leading-tight">
                    <div className="text-[9px] uppercase tracking-[0.24em] text-white/35">
                      Standings
                    </div>
                    <div className="font-display text-sm font-semibold tracking-tight text-white">
                      {shortLabel(c.label)}
                    </div>
                  </div>
                </div>
                <div className="text-right leading-tight">
                  <div className="text-[9px] uppercase tracking-[0.22em] text-white/35">
                    Pool
                  </div>
                  <AnimatedCounter
                    value={total}
                    className="tabular font-mono text-sm font-semibold text-white/90"
                  />
                </div>
              </div>

              {/* Hero leader row */}
              <AnimatePresence initial={false} mode="popLayout">
                {leader && (
                  <motion.div
                    key={leader.team.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 26 }}
                    className="relative mx-5 mt-4 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-4"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-60 blur-3xl"
                      style={{ background: `rgba(${accent}, 0.45)` }}
                    />
                    <div className="relative flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-neon-gold to-amber-500 text-[11px] font-bold text-ink-950 shadow-[0_0_20px_rgba(251,191,36,0.45)]">
                          #1
                        </div>
                        <div className="leading-tight">
                          <div className="text-[9px] uppercase tracking-[0.22em] text-neon-gold/90">
                            Leader
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-base">{leader.team.emoji}</span>
                            <span className="truncate font-display text-[15px] font-semibold tracking-tight text-white">
                              {leader.team.name.split(" - ")[0]}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-end gap-1.5 leading-none">
                        <AnimatedCounter
                          value={leader.count}
                          className="tabular font-mono text-3xl font-bold tracking-tightest text-white"
                        />
                        <LeaderTrend
                          delta={signals[c.id as CategoryId]?.[leader.team.id]?.delta ?? 0}
                          hot={signals[c.id as CategoryId]?.[leader.team.id]?.hot ?? false}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Contender rows */}
              <ol className="mt-2 space-y-1.5 px-5 pb-5 pt-2">
                <AnimatePresence initial={false}>
                  {ranked.slice(1).map((row) => {
                    const sig = signals[c.id as CategoryId]?.[row.team.id];
                    return (
                      <motion.li
                        key={row.team.id}
                        layout
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 28 }}
                        className="group flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition hover:bg-white/[0.025]"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid h-7 w-7 place-items-center rounded-md bg-white/[0.04] text-[10px] font-bold text-white/55">
                            #{row.rank}
                          </span>
                          <span className="text-base">{row.team.emoji}</span>
                          <span className="truncate text-[13px] font-medium text-white/85">
                            {row.team.name.split(" - ")[0]}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <RowTrend delta={sig?.delta ?? 0} hot={sig?.hot ?? false} />
                          <AnimatedCounter
                            value={row.count}
                            className={`tabular font-mono text-lg font-semibold ${
                              sig?.hot ? "text-white" : "text-white/85"
                            }`}
                          />
                        </div>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ol>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LeaderTrend({ delta, hot }: { delta: number; hot: boolean }) {
  if (delta > 0) {
    return (
      <span
        className={`mb-1 rounded-sm border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] ${
          hot
            ? "border-neon-lime/40 bg-neon-lime/15 text-neon-lime"
            : "border-neon-gold/40 bg-neon-gold/10 text-neon-gold"
        }`}
      >
        ▲ +{delta}
      </span>
    );
  }
  return (
    <span className="mb-1 rounded-sm bg-white/5 px-1.5 py-0.5 text-[10px] text-white/40">●</span>
  );
}

function RowTrend({ delta, hot }: { delta: number; hot: boolean }) {
  if (delta > 0) {
    return (
      <span
        className={`rounded-sm px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.16em] ${
          hot ? "bg-neon-lime/15 text-neon-lime" : "bg-white/[0.04] text-white/55"
        }`}
      >
        ▲ +{delta}
      </span>
    );
  }
  return <span className="text-[10px] text-white/25">●</span>;
}

export { rank };
