"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useData } from "@/hooks/useData";
import { useUiFocus } from "@/hooks/useUiFocus";
import type { ActivityEntry, WorkflowId } from "@/data/types";
import { ActivityRow } from "./ActivityRow";

// Activity feed never shows items that are currently in the Pending Review
// pane — avoids duplication since controller flow happens there.
const HIDDEN_OUTCOMES = new Set<ActivityEntry["outcome"]>([
  "routed-to-pending",
  "flagged-for-attention",
]);

// ---- Filter definitions ----
type DateRangeKey = "all" | "today" | "24h" | "7d";

const DATE_RANGES: Array<{ key: DateRangeKey; label: string }> = [
  { key: "all", label: "All time" },
  { key: "today", label: "Today" },
  { key: "24h", label: "Last 24 hours" },
  { key: "7d", label: "Last 7 days" },
];

function dateRangeMatches(entry: ActivityEntry, range: DateRangeKey): boolean {
  if (range === "all") return true;
  const ts = Date.parse(entry.timestamp);
  if (Number.isNaN(ts)) return true;
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  if (range === "24h") return now - ts <= dayMs;
  if (range === "7d") return now - ts <= 7 * dayMs;
  if (range === "today") {
    const d = new Date(ts);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    return ts >= start;
  }
  return true;
}

// Workflow ids → human label. Centralized so filter labels stay consistent
// with whatever the feed shows.
const WORKFLOW_LABEL: Record<WorkflowId, string> = {
  "connector-health": "Connector Health",
  "bank-rec": "Bank Rec",
  ar: "Accounts Receivable",
  ap: "Accounts Payable",
  "advanced-adjustments": "Advanced Adjustments",
  "rev-rec": "Rev Rec",
  "fixed-assets": "Fixed Assets",
  "prepaids-amortization": "Prepaids",
  allocations: "Allocations",
  "financial-statement-substantiation": "FSS",
  "flux-variance": "Flux & Variance",
};

type WorkflowFilter = "all" | WorkflowId;

// ---- Dropdown-style pill trigger ----

function FilterPill({
  label,
  value,
  onClick,
  isOpen,
}: {
  label: string;
  value: string;
  onClick: () => void;
  isOpen: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300",
        isOpen
          ? "bg-white text-neutral-900 ring-2 ring-inset ring-neutral-400"
          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
      )}
    >
      <span className="text-neutral-500">{label}</span>
      <span className="text-neutral-900">{value}</span>
      <ChevronDown className="size-3 text-neutral-500" />
    </button>
  );
}

function DropdownItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-[12px] transition-colors",
        active
          ? "bg-neutral-100 text-neutral-900"
          : "text-neutral-700 hover:bg-neutral-50",
      )}
    >
      <span>{label}</span>
      {active ? <Check className="size-3.5 text-neutral-600" /> : null}
    </button>
  );
}

// ---- Main ----

export function ActivityFeed() {
  const { activityFeed } = useData();
  const [workflowFilter, setWorkflowFilter] = useState<WorkflowFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateRangeKey>("all");
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  useUiFocus(workflowOpen || dateOpen);

  // Base feed — hide pending-review outcomes so they live only in the queue.
  const entries = useMemo(() => {
    return activityFeed
      .filter((e) => e.timestamp !== "FUTURE")
      .filter((e) => !HIDDEN_OUTCOMES.has(e.outcome))
      .slice()
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [activityFeed]);

  // Workflows actually present in the feed — keeps the dropdown honest.
  const workflowOptions = useMemo(() => {
    const set = new Set<WorkflowId>();
    entries.forEach((e) => set.add(e.workflowId));
    return Array.from(set);
  }, [entries]);

  const visible = useMemo(
    () =>
      entries.filter((e) => {
        if (workflowFilter !== "all" && e.workflowId !== workflowFilter)
          return false;
        if (!dateRangeMatches(e, dateFilter)) return false;
        return true;
      }),
    [entries, workflowFilter, dateFilter],
  );

  const workflowValue =
    workflowFilter === "all" ? "All" : WORKFLOW_LABEL[workflowFilter];
  const dateValue =
    DATE_RANGES.find((r) => r.key === dateFilter)?.label ?? "All time";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Filter bar — two dropdown pills */}
      <div className="flex items-center gap-1.5 border-b border-neutral-200 bg-white px-6 py-2">
        <Popover open={workflowOpen} onOpenChange={setWorkflowOpen}>
          <PopoverTrigger asChild>
            <div>
              <FilterPill
                label="Workflow"
                value={workflowValue}
                onClick={() => setWorkflowOpen((v) => !v)}
                isOpen={workflowOpen}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-56 p-1"
            sideOffset={6}
          >
            <DropdownItem
              label="All workflows"
              active={workflowFilter === "all"}
              onClick={() => {
                setWorkflowFilter("all");
                setWorkflowOpen(false);
              }}
            />
            <div className="my-1 h-px bg-neutral-100" />
            {workflowOptions.map((id) => (
              <DropdownItem
                key={id}
                label={WORKFLOW_LABEL[id]}
                active={workflowFilter === id}
                onClick={() => {
                  setWorkflowFilter(id);
                  setWorkflowOpen(false);
                }}
              />
            ))}
          </PopoverContent>
        </Popover>

        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <div>
              <FilterPill
                label="Date"
                value={dateValue}
                onClick={() => setDateOpen((v) => !v)}
                isOpen={dateOpen}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-44 p-1"
            sideOffset={6}
          >
            {DATE_RANGES.map((r) => (
              <DropdownItem
                key={r.key}
                label={r.label}
                active={dateFilter === r.key}
                onClick={() => {
                  setDateFilter(r.key);
                  setDateOpen(false);
                }}
              />
            ))}
          </PopoverContent>
        </Popover>

        <span className="ml-auto text-[11px] text-neutral-500">
          {visible.length} of {entries.length}
        </span>
      </div>

      {/* Scrollable row list — rotated rows slide in from the top. */}
      <div className="flex-1 overflow-y-auto">
        {visible.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-neutral-400">
            No activity matches these filters.
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {visible.map((entry) => (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                <ActivityRow
                  entry={entry}
                  expanded={expandedId === entry.id}
                  onToggle={() =>
                    setExpandedId((prev) =>
                      prev === entry.id ? null : entry.id,
                    )
                  }
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
