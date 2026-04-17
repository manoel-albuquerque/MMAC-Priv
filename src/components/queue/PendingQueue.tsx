"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useData } from "@/hooks/useData";
import { QueueRow } from "./QueueRow";
import type { PendingQueueItem } from "@/data/types";

// Container for the pending review queue. Two-tier filters:
//   • ownership (primary) — Open / Delegated / All
//   • severity  (secondary, only when Open is active) — Material / High urgency
// Verification flags are no longer a filter — the whole pane is about items
// needing review, so a separate "verification" sibling mixed taxonomies.

type OwnershipKey = "open" | "delegated" | "all";
type SeverityKey = "all" | "material" | "high";

const OWNERSHIP_FILTERS: Array<{ key: OwnershipKey; label: string }> = [
  { key: "open", label: "Open" },
  { key: "delegated", label: "Delegated" },
  { key: "all", label: "All" },
];

const SEVERITY_FILTERS: Array<{ key: SeverityKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "material", label: "Material" },
  { key: "high", label: "High urgency" },
];

function passesOwnership(item: PendingQueueItem, key: OwnershipKey): boolean {
  if (key === "all") return true;
  if (key === "delegated") return Boolean(item.delegatedTo);
  return !item.delegatedTo; // open
}

function passesSeverity(item: PendingQueueItem, key: SeverityKey): boolean {
  if (key === "all") return true;
  if (key === "material") return item.riskTier === "material";
  return item.urgency === "high";
}

export function PendingQueue() {
  const { pendingQueue } = useData();
  const [ownership, setOwnership] = useState<OwnershipKey>("open");
  const [severity, setSeverity] = useState<SeverityKey>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const ownershipCounts = useMemo(
    () => ({
      open: pendingQueue.filter((i) => !i.delegatedTo).length,
      delegated: pendingQueue.filter((i) => i.delegatedTo).length,
      all: pendingQueue.length,
    }),
    [pendingQueue],
  );

  // Severity counts are scoped to the Open bucket — showing a Material count
  // that includes delegated items would be misleading when the row is only
  // visible while Open is active.
  const openItems = useMemo(
    () => pendingQueue.filter((i) => !i.delegatedTo),
    [pendingQueue],
  );
  const severityCounts = useMemo(
    () => ({
      all: openItems.length,
      material: openItems.filter((i) => i.riskTier === "material").length,
      high: openItems.filter((i) => i.urgency === "high").length,
    }),
    [openItems],
  );

  const visible = useMemo(
    () =>
      pendingQueue.filter((i) => {
        if (!passesOwnership(i, ownership)) return false;
        if (ownership === "open" && !passesSeverity(i, severity)) return false;
        return true;
      }),
    [pendingQueue, ownership, severity],
  );

  const showSeverityRow = ownership === "open";

  return (
    <section className="flex w-[640px] shrink-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-5 py-3">
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Pending Review
          </span>
          <span className="text-sm font-semibold text-neutral-900">
            ({pendingQueue.length})
          </span>
        </div>
        <span className="text-[11px] text-neutral-500">
          {visible.length} shown
        </span>
      </div>

      {/* Ownership row */}
      <div className="flex items-center gap-1.5 border-b border-neutral-200 bg-white px-5 py-2">
        {OWNERSHIP_FILTERS.map((f) => {
          const active = ownership === f.key;
          const count = ownershipCounts[f.key];
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setOwnership(f.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                active
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
              )}
            >
              <span>{f.label}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px] font-semibold leading-4",
                  active
                    ? "bg-white/20 text-white"
                    : "bg-white text-neutral-600",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Severity row — only visible for Open */}
      {showSeverityRow ? (
        <div className="flex items-center gap-1.5 border-b border-neutral-200 bg-white px-5 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            Severity
          </span>
          {SEVERITY_FILTERS.map((f) => {
            const active = severity === f.key;
            const count = severityCounts[f.key];
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setSeverity(f.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                  active
                    ? "bg-white text-neutral-900 ring-2 ring-inset ring-neutral-400"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
                )}
              >
                <span>{f.label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[10px] font-semibold leading-4",
                    active
                      ? "bg-neutral-100 text-neutral-700"
                      : "bg-white text-neutral-600",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Queue list */}
      <div className="flex-1 overflow-y-auto">
        {visible.length === 0 ? (
          <div className="flex h-full items-center justify-center p-8 text-center text-xs text-neutral-500">
            {ownership === "delegated"
              ? "Nothing delegated yet."
              : "No items match these filters."}
          </div>
        ) : (
          <ul className="divide-y divide-neutral-200">
            <AnimatePresence initial={false}>
              {visible.map((item) => (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                >
                  <QueueRow
                    item={item}
                    expanded={expandedId === item.id}
                    onToggle={() =>
                      setExpandedId((prev) =>
                        prev === item.id ? null : item.id,
                      )
                    }
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </section>
  );
}
