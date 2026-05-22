"use client";

import { motion } from "framer-motion";

export default function StatusBadge({ isOpen }: { isOpen: boolean }) {
  return (
    <motion.div
      layout
      className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] ${
        isOpen
          ? "border-neon-lime/40 bg-neon-lime/10 text-neon-lime"
          : "border-white/15 bg-white/5 text-white/60"
      }`}
    >
      <span className="relative flex h-2 w-2">
        {isOpen && (
          <motion.span
            animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-neon-lime"
          />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            isOpen ? "bg-neon-lime" : "bg-white/40"
          }`}
        />
      </span>
      {isOpen ? "Voting Live" : "Voting Closed"}
    </motion.div>
  );
}
