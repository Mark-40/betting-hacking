"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import StatusBadge from "./StatusBadge";

interface HeaderProps {
  isOpen: boolean;
  totalVotes: number;
  variant?: "voter" | "admin";
}

export default function Header({ isOpen, totalVotes, variant = "voter" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-ink-900/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 12, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-neon-violet to-neon-cyan shadow-glow"
          >
            <span className="text-lg">⬢</span>
          </motion.div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-white">
              HACK<span className="text-neon-cyan">VOTE</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/40">
              Live hackathon market
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <StatusBadge isOpen={isOpen} />
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/40">
              Total votes
            </span>
            <span className="font-mono text-sm text-white">{totalVotes}</span>
          </div>
          {variant === "voter" ? (
            <Link
              href="/admin"
              className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/30 hover:text-white"
            >
              Admin
            </Link>
          ) : (
            <Link
              href="/"
              className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/30 hover:text-white"
            >
              ← Voter view
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
