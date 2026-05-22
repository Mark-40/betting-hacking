"use client";

import { TEAMS, CATEGORIES } from "@/lib/teams";
import type { CategoryId, VoteCounts } from "@/lib/types";
import type { Signals } from "./hooks";

interface Props {
  votes: VoteCounts | undefined;
  signals: Signals;
}

interface Row {
  key: string;
  category: string;
  team: string;
  emoji: string;
  count: number;
  delta: number;
  accent: "violet" | "cyan" | "magenta";
}

const ACCENT_DOT: Record<string, string> = {
  violet: "bg-neon-violet",
  cyan: "bg-neon-cyan",
  magenta: "bg-neon-magenta",
};

export default function Ticker({ votes, signals }: Props) {
  const rows: Row[] = [];
  for (const c of CATEGORIES) {
    for (const t of TEAMS) {
      const count = votes?.[c.id as CategoryId]?.[t.id] ?? 0;
      const sig = signals[c.id as CategoryId]?.[t.id];
      rows.push({
        key: `${c.id}:${t.id}`,
        category: c.label.replace("Who do you think will win the ", "").replace("?", ""),
        team: t.name.split(" - ")[0] ?? t.name,
        emoji: t.emoji,
        count,
        delta: sig?.delta ?? 0,
        accent: c.accent,
      });
    }
  }

  // Duplicate so the marquee loops seamlessly with -50% translate.
  const looped = [...rows, ...rows];

  return (
    <div className="relative border-y border-white/5 bg-ink-950/60">
      <div className="ticker-mask overflow-hidden">
        <div className="flex w-max animate-ticker py-2.5 will-change-transform">
          {looped.map((r, i) => (
            <div
              key={`${r.key}-${i}`}
              className="flex items-center gap-3 whitespace-nowrap px-5 text-[12px] uppercase tracking-[0.18em]"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${ACCENT_DOT[r.accent]}`} />
              <span className="text-white/40">{r.category}</span>
              <span className="text-white/80">{r.emoji} {r.team}</span>
              <span className="tabular font-mono text-white">{r.count}</span>
              <TrendChip delta={r.delta} />
              <span className="text-white/15">/</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrendChip({ delta }: { delta: number }) {
  if (delta > 0) {
    return (
      <span className="rounded-sm bg-neon-lime/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-neon-lime">
        ▲ +{delta}
      </span>
    );
  }
  return (
    <span className="rounded-sm bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-white/35">
      ●
    </span>
  );
}
