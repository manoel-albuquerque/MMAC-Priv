"use client";

import { Pause } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppState } from "@/state/AppStateContext";

// Small chip that appears in the bottom-right corner when the alive system is
// paused (via Space / P). Intentionally subtle — presence says "we know, you
// paused it" without demanding attention.
export function PausedIndicator() {
  const { state } = useAppState();
  return (
    <AnimatePresence>
      {state.pausedAlive ? (
        <motion.div
          key="paused-chip"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.18 }}
          className="pointer-events-none absolute bottom-4 left-1/2 z-50 -translate-x-1/2"
        >
          <div className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white/95 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-neutral-700 shadow-md backdrop-blur">
            <Pause className="size-3 text-neutral-500" />
            Paused · press Space to resume
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
