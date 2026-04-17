"use client";

import { format, parseISO } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  FileSearch,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAppState } from "@/state/AppStateContext";
import { useUiFocus } from "@/hooks/useUiFocus";
import { LANES } from "@/lib/lanes";
import type { ActivityEntry, ActivityOutcome, LaneColor } from "@/data/types";
import { WORKFLOW_ICONS } from "./workflow-icons";
import { ActivityRowExpanded } from "./ActivityRowExpanded";

type ActivityRowProps = {
  entry: ActivityEntry;
  expanded: boolean;
  onToggle: () => void;
};

// Color-code confidence pills: >=95 emerald, 85-94 amber, <85 neutral.
function confidenceClasses(score: number): string {
  if (score >= 95) {
    return "bg-lane-emerald-50 text-lane-emerald-800 ring-1 ring-inset ring-lane-emerald-200";
  }
  if (score >= 85) {
    return "bg-lane-amber-50 text-lane-amber-800 ring-1 ring-inset ring-lane-amber-200";
  }
  return "bg-neutral-100 text-neutral-700 ring-1 ring-inset ring-neutral-200";
}

const OUTCOME_META: Record<
  ActivityOutcome,
  { label: string; className: string }
> = {
  "auto-posted": {
    label: "Auto-posted",
    className:
      "bg-lane-emerald-50 text-lane-emerald-800 ring-lane-emerald-200",
  },
  "routed-to-pending": {
    label: "Pending review",
    className: "bg-lane-amber-50 text-lane-amber-800 ring-lane-amber-200",
  },
  "flagged-for-attention": {
    label: "Flagged",
    className: "bg-lane-amber-50 text-lane-amber-800 ring-lane-amber-200",
  },
  "controller-confirmed": {
    label: "Confirmed",
    className: "bg-lane-emerald-50 text-lane-emerald-800 ring-lane-emerald-200",
  },
  "controller-overridden": {
    label: "Overridden",
    className: "bg-lane-sky-50 text-lane-sky-800 ring-lane-sky-200",
  },
  reversed: {
    label: "Reversed",
    className: "bg-lane-rose-50 text-lane-rose-800 ring-lane-rose-200",
  },
};

const AVATAR_SURFACE: Record<LaneColor, string> = {
  "lane-emerald": "bg-lane-emerald-50 text-lane-emerald-700 ring-lane-emerald-200",
  "lane-amber": "bg-lane-amber-50 text-lane-amber-700 ring-lane-amber-200",
  "lane-sky": "bg-lane-sky-50 text-lane-sky-700 ring-lane-sky-200",
  "lane-violet": "bg-lane-violet-50 text-lane-violet-700 ring-lane-violet-200",
  "lane-rose": "bg-lane-rose-50 text-lane-rose-700 ring-lane-rose-200",
};

function MoneyDirection({
  nature,
  amount,
}: {
  nature?: "money-in" | "money-out" | "internal";
  amount?: number;
}) {
  if (!nature || nature === "internal" || amount == null) return null;
  const isIn = nature === "money-in";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ring-1 ring-inset",
        isIn
          ? "bg-lane-emerald-50 text-lane-emerald-800 ring-lane-emerald-200"
          : "bg-lane-rose-50 text-lane-rose-800 ring-lane-rose-200",
      )}
    >
      {isIn ? (
        <ArrowDownLeft className="size-3" />
      ) : (
        <ArrowUpRight className="size-3" />
      )}
      {isIn ? "+" : "−"}${amount.toLocaleString("en-US")}
    </span>
  );
}

export function ActivityRow({ entry, expanded, onToggle }: ActivityRowProps) {
  const { openPanel } = useAppState();
  useUiFocus(expanded);
  const Icon = WORKFLOW_ICONS[entry.workflowId];
  const laneColor = LANES[entry.lane].color;
  const outcome = OUTCOME_META[entry.outcome];
  const detail = entry.transactionDetail;

  const ts = parseISO(entry.timestamp);
  const timestampLabel = format(ts, "MMM d · h:mm a");

  // Prefer the human summary when we have transaction detail; fall back to the
  // legacy action copy for rows that haven't been enriched yet.
  const primaryLine = detail?.humanSummary ?? entry.action;
  const isExpandable = Boolean(detail);

  const handleEvidenceClick = (e: React.MouseEvent) => {
    if (!entry.evidenceRef) return;
    e.stopPropagation();
    openPanel({ type: "evidence", id: entry.evidenceRef });
  };

  return (
    <div
      className={cn(
        "group border-b border-neutral-100",
        expanded ? "bg-white" : "hover:bg-neutral-50",
      )}
    >
      <div
        role={isExpandable ? "button" : undefined}
        tabIndex={isExpandable ? 0 : undefined}
        onClick={isExpandable ? onToggle : undefined}
        onKeyDown={(e) => {
          if (!isExpandable) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        aria-expanded={isExpandable ? expanded : undefined}
        className={cn(
          "flex min-h-[64px] items-start gap-3 px-6 py-2.5 text-[13px] text-neutral-800",
          isExpandable && "cursor-pointer",
        )}
      >
        {/* Small agent avatar */}
        <div
          className={cn(
            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ring-1 ring-inset",
            AVATAR_SURFACE[laneColor],
          )}
          aria-hidden
        >
          <Icon className="size-2.5" />
        </div>

        {/* Primary text — no truncate; wraps within the fixed-height budget */}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="line-clamp-2 text-[13px] leading-snug text-neutral-900">
            {primaryLine}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wide text-neutral-400">
            {timestampLabel} · {entry.agentName}
          </span>
        </div>

        {/* Money direction */}
        <MoneyDirection nature={detail?.nature} amount={entry.amount} />

        {/* Confidence */}
        {typeof entry.confidenceScore === "number" && (
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums",
              confidenceClasses(entry.confidenceScore),
            )}
          >
            {entry.confidenceScore}%
          </span>
        )}

        {/* Outcome pill */}
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
            outcome.className,
          )}
        >
          {outcome.label}
        </span>

        {/* Evidence link — still available even when row is expandable */}
        {entry.evidenceRef ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleEvidenceClick}
                aria-label="View evidence"
                className={cn(
                  "inline-flex size-6 shrink-0 items-center justify-center rounded text-neutral-400",
                  "hover:bg-neutral-100 hover:text-neutral-700",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300",
                )}
              >
                <FileSearch className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">
              View evidence
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className="size-6 shrink-0" aria-hidden />
        )}

        {/* Expand chevron (only when there's a detail to show) */}
        {isExpandable ? (
          <ChevronDown
            className={cn(
              "mt-1 size-4 shrink-0 text-neutral-400 transition-transform",
              expanded && "rotate-180",
            )}
          />
        ) : (
          <span className="size-4 shrink-0" aria-hidden />
        )}
      </div>

      <AnimatePresence initial={false}>
        {expanded && detail ? (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <ActivityRowExpanded entry={entry} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
