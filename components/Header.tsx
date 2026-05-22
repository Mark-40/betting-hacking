"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import StatusBadge from "./StatusBadge";
import AnimatedCounter from "./AnimatedCounter";

interface HeaderProps {
  isOpen: boolean;
  totalVotes: number;
  variant?: "voter" | "admin";
}

export default function Header({ isOpen, totalVotes, variant = "voter" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-ink-950/70 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 8, scale: 1.06 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative grid h-9 w-9 place-items-center"
          >
            <span
              aria-hidden
              className="absolute inset-0 rounded-lg bg-gradient-to-br from-neon-violet via-neon-magenta to-neon-cyan blur-[10px] opacity-60"
            />
            <span className="relative grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-neon-violet to-neon-cyan text-base font-bold">
              ⬢
            </span>
          </motion.div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-[15px] font-semibold tracking-tightest text-white">
              HACK<span className="text-neon-cyan">VOTE</span>
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/35">
              Live Hackathon Market
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          <div className="hidden items-center gap-5 sm:flex">
            <Metric label="Total Bets" value={totalVotes} />
            <span className="h-6 w-px bg-white/8" />
          </div>
          <StatusBadge isOpen={isOpen} />
          {variant === "voter" ? (
            <Link
              href="/admin"
              className="hidden rounded-md border border-white/10 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-white/65 transition hover:border-white/30 hover:text-white sm:inline-block"
            >
              Admin
            </Link>
          ) : (
            <Link
              href="/"
              className="rounded-md border border-white/10 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-white/65 transition hover:border-white/30 hover:text-white"
            >
              ← Voter
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-end leading-none">
      <span className="text-[9px] uppercase tracking-[0.24em] text-white/35">
        {label}
      </span>
      <AnimatedCounter
        value={value}
        className="tabular mt-1 font-mono text-sm font-semibold text-white"
      />
    </div>
  );
}
