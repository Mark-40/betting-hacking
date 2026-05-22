"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import AnimatedCounter from "./AnimatedCounter";
import type { Category, Team } from "@/lib/types";
import type { CellSignal } from "./hooks";

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
  signal?: CellSignal;
  emphasize?: boolean; // visually dominate (leader)
}

const ACCENT_BG: Record<Category["accent"], string> = {
  violet: "168, 85, 247",
  cyan: "34, 211, 238",
  magenta: "236, 72, 153",
};

const ACCENT_TXT: Record<Category["accent"], string> = {
  violet: "text-neon-violet",
  cyan: "text-neon-cyan",
  magenta: "text-neon-magenta",
};

const ACCENT_BTN: Record<Category["accent"], string> = {
  violet:
    "bg-neon-violet text-white shadow-[0_10px_30px_-10px_rgba(168,85,247,0.7)] hover:bg-neon-violet/90",
  cyan:
    "bg-neon-cyan text-ink-950 shadow-[0_10px_30px_-10px_rgba(34,211,238,0.7)] hover:bg-neon-cyan/90",
  magenta:
    "bg-neon-magenta text-white shadow-[0_10px_30px_-10px_rgba(236,72,153,0.7)] hover:bg-neon-magenta/90",
};

const RANK_PILL: Record<number, string> = {
  1: "from-neon-gold to-amber-500 text-ink-950",
  2: "from-slate-200 to-slate-400 text-ink-950",
  3: "from-amber-700 to-orange-900 text-white",
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
  signal,
  emphasize = false,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  let buttonLabel = "Place Vote";
  if (votedForThis) buttonLabel = "Your Pick · Locked";
  else if (hasVotedInCategory) buttonLabel = "Voted Elsewhere";
  else if (!isOpen) buttonLabel = "Market Closed";

  const isLeader = rank === 1;
  const dimmed = !emphasize && !votedForThis && !isLeader;
  const hot = Boolean(signal?.hot);

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      ref={cardRef}
      onMouseMove={handleMove}
      whileHover={{ y: -3 }}
      style={{
        // @ts-expect-error custom property
        "--spot-color": ACCENT_BG[category.accent],
      }}
      className={`spotlight group relative isolate overflow-hidden rounded-2xl border p-5 sm:p-6 transition will-change-transform ${
        votedForThis
          ? "border-white/30 bg-white/[0.04]"
          : dimmed
            ? "border-white/[0.06] bg-ink-850/55"
            : "border-white/12 bg-ink-800/70"
      } ${emphasize ? "ring-1 ring-white/10" : ""}`}
    >
      {/* Conic ring on leader */}
      {isLeader && (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-25 conic-ring blur-[10px]"
        />
      )}

      {/* Scanline on hot/recently-voted */}
      {hot && (
        <motion.div
          aria-hidden
          initial={{ y: "-100%" }}
          animate={{ y: "120%" }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
          className="pointer-events-none absolute inset-x-0 h-12"
          style={{
            background: `linear-gradient(180deg, transparent, rgba(${ACCENT_BG[category.accent]},0.25), transparent)`,
          }}
        />
      )}

      {/* Rank ribbon */}
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`relative grid h-12 w-12 place-items-center rounded-xl bg-ink-700/80 text-2xl ${
              isLeader ? "shadow-elevated" : ""
            }`}
          >
            <span aria-hidden className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/8 to-transparent" />
            <span className="relative">{team.emoji}</span>
          </div>
          <div className="min-w-0">
            <h3
              className={`truncate font-display text-base font-semibold leading-tight tracking-tight ${
                dimmed ? "text-white/85" : "text-white"
              }`}
              title={team.name}
            >
              {team.name}
            </h3>
            <p className="mt-2 text-[13.5px] leading-[1.55] text-white/80">
              {team.tagline}
            </p>
          </div>
        </div>

        <div
          className={`relative grid h-8 w-12 place-items-center rounded-md bg-gradient-to-br text-[11px] font-bold ${
            RANK_PILL[rank] ?? "from-white/10 to-white/5 text-white/60"
          }`}
          aria-label={`Rank ${rank}`}
        >
          #{rank}
        </div>
      </div>

      {/* Members chips */}
      <div className="relative mt-5 flex flex-wrap gap-1.5">
        {team.members.map((m) => (
          <span
            key={m.name}
            title={m.role}
            className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10.5px] text-white/65"
          >
            {m.name}
          </span>
        ))}
      </div>

      <div className="relative mt-5 hairline" />

      {/* Vote count + CTA */}
      <div className="relative mt-4 flex items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-[0.24em] text-white/40">
              Live Votes
            </span>
            <TrendBadge delta={signal?.delta ?? 0} hot={hot} accent={category.accent} />
          </div>
          <AnimatedCounter
            value={count}
            className={`tabular font-mono text-4xl font-bold tracking-tightest ${
              isLeader ? "text-white" : "text-white/90"
            } ${hot ? "flash-pop" : ""}`}
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={!disabled ? { scale: 1.03 } : undefined}
          onClick={onVote}
          disabled={disabled}
          className={`rounded-xl px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-50 ${
            votedForThis
              ? "border border-white/20 bg-white/10 text-white"
              : hasVotedInCategory || !isOpen
                ? "border border-white/10 bg-white/[0.03] text-white/60"
                : ACCENT_BTN[category.accent]
          }`}
        >
          {buttonLabel}
        </motion.button>
      </div>

      {/* Glow underlay on leader */}
      {isLeader && (
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-12 left-1/2 h-24 w-2/3 -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{
            background: `rgba(${ACCENT_BG[category.accent]}, 0.45)`,
          }}
        />
      )}
    </motion.div>
  );
}

function TrendBadge({
  delta,
  hot,
  accent,
}: {
  delta: number;
  hot: boolean;
  accent: Category["accent"];
}) {
  if (delta > 0) {
    return (
      <span
        className={`rounded-sm border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] ${
          hot
            ? "border-neon-lime/40 bg-neon-lime/15 text-neon-lime"
            : `border-white/10 bg-white/[0.04] ${ACCENT_TXT[accent]}`
        }`}
      >
        ▲ +{delta}
      </span>
    );
  }
  return (
    <span className="rounded-sm border border-white/8 bg-white/[0.02] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30">
      ●
    </span>
  );
}
