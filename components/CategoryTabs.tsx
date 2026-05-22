"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Category, CategoryId } from "@/lib/types";
import AnimatedCounter from "./AnimatedCounter";

interface Props {
  categories: Category[];
  active: CategoryId;
  onChange: (id: CategoryId) => void;
  votedMap: Record<CategoryId, string | null>;
  totals: Record<CategoryId, number>;
}

const ACTIVE_GRADIENT: Record<Category["accent"], string> = {
  violet:
    "from-neon-violet/30 via-neon-violet/10 to-transparent border-neon-violet/40",
  cyan: "from-neon-cyan/30 via-neon-cyan/10 to-transparent border-neon-cyan/40",
  magenta:
    "from-neon-magenta/30 via-neon-magenta/10 to-transparent border-neon-magenta/40",
};

const ACTIVE_TEXT: Record<Category["accent"], string> = {
  violet: "text-neon-violet",
  cyan: "text-neon-cyan",
  magenta: "text-neon-magenta",
};

const ACTIVE_GLOW: Record<Category["accent"], string> = {
  violet: "shadow-glow",
  cyan: "shadow-cyan",
  magenta: "shadow-magenta",
};

function shortLabel(label: string) {
  // strip lead-in phrasing for compact contexts
  return label
    .replace(/^Who will win the\s+/i, "")
    .replace(/^Who do you think will win the\s+/i, "")
    .replace(/\?$/, "");
}

export default function CategoryTabs({
  categories,
  active,
  onChange,
  votedMap,
  totals,
}: Props) {
  const activeCat = categories.find((c) => c.id === active)!;
  const others = categories.filter((c) => c.id !== active);

  return (
    <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr]">
      {/* Active category — dominant focal block */}
      <motion.div
        layout
        key={activeCat.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 sm:p-6 ${ACTIVE_GRADIENT[activeCat.accent]} ${ACTIVE_GLOW[activeCat.accent]}`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(600px circle at 80% -20%, rgba(255,255,255,0.08), transparent 50%)",
          }}
        />
        <div className="relative flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/55">
            <span className="relative flex h-1.5 w-1.5">
              <motion.span
                animate={{ scale: [1, 2.4, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className={`absolute inset-0 rounded-full ${ACTIVE_TEXT[activeCat.accent].replace("text-", "bg-")}`}
              />
              <span
                className={`relative inline-flex h-1.5 w-1.5 rounded-full ${ACTIVE_TEXT[activeCat.accent].replace("text-", "bg-")}`}
              />
            </span>
            Active Market
            {votedMap[activeCat.id] && (
              <span className="ml-2 rounded-sm border border-neon-lime/40 bg-neon-lime/10 px-1.5 py-0.5 text-[9px] tracking-[0.2em] text-neon-lime">
                ✓ Voted
              </span>
            )}
          </div>
          <AnimatePresence mode="wait">
            <motion.h2
              key={activeCat.id + "-label"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="font-display text-2xl font-semibold leading-tight tracking-tightest text-white sm:text-3xl"
            >
              {activeCat.label}
            </motion.h2>
          </AnimatePresence>
          <p className="max-w-md text-[13px] leading-relaxed text-white/55">
            {activeCat.tagline}
          </p>
          <div className="mt-1 flex items-end gap-2">
            <AnimatedCounter
              value={totals[active] ?? 0}
              className="tabular font-mono text-3xl font-bold leading-none text-white"
            />
            <span className="pb-0.5 text-[10px] uppercase tracking-[0.22em] text-white/40">
              bets in this market
            </span>
          </div>
        </div>
      </motion.div>

      {/* Inactive — minimal chips */}
      <div className="grid gap-2">
        {others.map((c) => {
          const total = totals[c.id] ?? 0;
          const voted = votedMap[c.id];
          return (
            <motion.button
              key={c.id}
              layout
              whileHover={{ x: 2 }}
              onClick={() => onChange(c.id)}
              className="group relative flex items-center justify-between gap-3 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.015] px-4 py-3 text-left transition hover:border-white/15 hover:bg-white/[0.03]"
            >
              <span
                aria-hidden
                className={`absolute left-0 top-0 h-full w-0.5 ${ACTIVE_TEXT[c.accent].replace("text-", "bg-")} opacity-50 transition group-hover:opacity-100`}
              />
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-[0.24em] text-white/35">
                  Switch to
                </span>
                <span className="text-sm font-medium text-white/85">
                  {shortLabel(c.label)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {voted && (
                  <span className="rounded-sm bg-neon-lime/10 px-1.5 py-0.5 text-[9px] tracking-[0.18em] text-neon-lime">
                    ✓
                  </span>
                )}
                <div className="flex flex-col items-end leading-none">
                  <span className="text-[9px] uppercase tracking-[0.22em] text-white/35">
                    Bets
                  </span>
                  <AnimatedCounter
                    value={total}
                    className="tabular mt-0.5 font-mono text-sm font-semibold text-white/90"
                  />
                </div>
                <span className="text-white/30 transition group-hover:translate-x-0.5 group-hover:text-white/80">
                  →
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
