"use client";

import { AnimatePresence, motion } from "framer-motion";

export interface ToastData {
  id: number;
  message: string;
  tone?: "success" | "error" | "info";
}

export default function Toast({ toasts }: { toasts: ToastData[] }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm font-medium shadow-xl backdrop-blur ${
              t.tone === "error"
                ? "border-rose-400/40 bg-rose-500/20 text-rose-100"
                : t.tone === "success"
                  ? "border-neon-lime/40 bg-neon-lime/15 text-neon-lime"
                  : "border-white/15 bg-ink-800/90 text-white/90"
            }`}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
