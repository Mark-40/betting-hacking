"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";
import type { Category, Team } from "@/lib/types";

interface Props {
  team: Team;
  category: Category;
  count: number;
  rank: number;
  disabled: boolean;
  votedForThis: boolean;
  hasVotedInCategory: boolean;
  isOpen: boolean;
  onVote: () => void;
}

const ACCENT_RING: Record<Category["accent"], string> = {
  violet: "hover:shadow-glow hover:border-neon-violet/50",
  cyan: "hover:shadow-cyan hover:border-neon-cyan/50",
  magenta: "hover:shadow-magenta hover:border-neon-magenta/50",
};

const ACCENT_BTN: Record<Category["accent"], string> = {
  violet: "bg-neon-violet/90 hover:bg-neon-violet text-white shadow-glow",
  cyan: "bg-neon-cyan/90 hover:bg-neon-cyan text-ink-900 shadow-cyan",
  magenta: "bg-neon-magenta/90 hover:bg-neon-magenta text-white shadow-magenta",
};

const RANK_BADGE: Record<number, string> = {
  1: "bg-gradient-to-br from-neon-gold to-amber-600 text-ink-900",
  2: "bg-gradient-to-br from-slate-300 to-slate-500 text-ink-900",
  3: "bg-gradient-to-br from-amber-700 to-orange-900 text-white",
};

export default function TeamCard({
  team,
  category,
  count,
  rank,
  disabled,
  votedForThis,
  hasVotedInCategory,
  isOpen,
  onVote,
}: Props) {
  let buttonLabel = "Cast Vote";
  if (votedForThis) buttonLabel = "Your Pick ✓";
  else if (hasVotedInCategory) buttonLabel = "Already Voted";
  else if (!isOpen) buttonLabel = "Voting Closed";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className={`group relative overflow-hidden rounded-2xl border border-white/8 bg-ink-800/70 p-5 backdrop-blur-xl transition ${ACCENT_RING[category.accent]}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-2xl"
      />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-ink-700 text-2xl">
            {team.emoji}
          </div>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-white">
              {team.name}
            </h3>
            <p className="text-xs text-white/50">{team.tagline}</p>
          </div>
        </div>
        <div
          className={`grid h-9 w-9 place-items-center rounded-lg text-xs font-bold ${
            RANK_BADGE[rank] ?? "bg-white/5 text-white/60"
          }`}
          aria-label={`Rank ${rank}`}
        >
          #{rank}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {team.members.map((m) => (
          <span
            key={m.name}
            className="rounded-full border border-white/8 bg-white/5 px-2 py-0.5 text-[11px] text-white/70"
            title={m.role}
          >
            {m.name}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.18em] text-white/40">
            Votes · {category.label}
          </span>
          <AnimatedCounter
            value={count}
            className="font-mono text-3xl font-bold text-white"
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={!disabled ? { scale: 1.03 } : undefined}
          onClick={onVote}
          disabled={disabled}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
            votedForThis
              ? "border border-white/15 bg-white/10 text-white"
              : ACCENT_BTN[category.accent]
          }`}
        >
          {buttonLabel}
        </motion.button>
      </div>
    </motion.div>
  );
}
