"use client";

import { motion } from "framer-motion";
import type { Category, CategoryId } from "@/lib/types";

interface Props {
  categories: Category[];
  active: CategoryId;
  onChange: (id: CategoryId) => void;
  votedMap: Record<CategoryId, string | null>;
}

const ACCENTS: Record<Category["accent"], string> = {
  violet: "from-neon-violet/30 to-neon-violet/0 text-neon-violet",
  cyan: "from-neon-cyan/30 to-neon-cyan/0 text-neon-cyan",
  magenta: "from-neon-magenta/30 to-neon-magenta/0 text-neon-magenta",
};

export default function CategoryTabs({ categories, active, onChange, votedMap }: Props) {
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-white/5 bg-ink-800/60 p-2 backdrop-blur-xl">
      {categories.map((c) => {
        const isActive = c.id === active;
        const hasVoted = Boolean(votedMap[c.id]);
        return (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            className={`relative flex-1 min-w-[140px] rounded-xl px-4 py-3 text-left transition ${
              isActive ? "text-white" : "text-white/60 hover:text-white/90"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="tab-bg"
                className={`absolute inset-0 rounded-xl bg-gradient-to-br ${ACCENTS[c.accent]} border border-white/10`}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <div className="relative flex items-center justify-between gap-2">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] opacity-70">
                  Category
                </div>
                <div className="text-sm font-semibold">{c.label}</div>
              </div>
              {hasVoted && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/80">
                  Voted
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
