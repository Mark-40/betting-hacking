"use client";

import { motion } from "framer-motion";

export default function StatusBadge({
  isOpen,
  size = "sm",
}: {
  isOpen: boolean;
  size?: "sm" | "md";
}) {
  const pad = size === "md" ? "px-3.5 py-1.5 text-[12px]" : "px-3 py-1 text-[11px]";
  return (
    <motion.div
      layout
      className={`relative flex items-center gap-2 rounded-full border ${pad} font-medium uppercase tracking-[0.2em] ${
        isOpen
          ? "border-neon-lime/40 bg-neon-lime/10 text-neon-lime"
          : "border-white/12 bg-white/[0.03] text-white/55"
      }`}
    >
      {isOpen && (
        <span
          aria-hidden
          className="absolute inset-0 -z-10 rounded-full bg-neon-lime/10 animate-glow-pulse"
        />
      )}
      <span className="relative flex h-2 w-2">
        {isOpen && (
          <motion.span
            animate={{ scale: [1, 2.4, 1], opacity: [0.9, 0, 0.9] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-neon-lime"
          />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            isOpen ? "bg-neon-lime shadow-[0_0_12px_rgba(163,230,53,0.8)]" : "bg-white/40"
          }`}
        />
      </span>
      {isOpen ? "Market Live" : "Market Closed"}
    </motion.div>
  );
}
