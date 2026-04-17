"use client";

import { format, parseISO } from "date-fns";
import { useState } from "react";
import { X, FileSearch, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LaneBadge } from "@/components/primitives/LaneBadge";
import { cn } from "@/lib/utils";
import { useAppState } from "@/state/AppStateContext";
import { useData, useWorkflow } from "@/hooks/useData";
import { LANES } from "@/lib/lanes";
import { WORKFLOW_ICONS } from "@/components/activity-feed/workflow-icons";
import type {
  ActivityEntry,
  ActivityOutcome,
  HealthIndicator,
  LaneColor,
  PendingQueueItem,
  WorkflowCard,
} from "@/data/types";

// Full workflow drill-in panel. Opens over the main body when an agent is
// clicked in the fleet sidebar. Shows agent identity, period stats, recent
// activity attributed to this agent, pending items, and parameter controls.

const HEALTH_DOT: Record<HealthIndicator, string> = {
  healthy: "bg-lane-emerald-500",
  attention: "bg-lane-amber-500",
  blocked: "bg-lane-rose-500",
};

const HEALTH_LABEL: Record<HealthIndicator, string> = {
  healthy: "Healthy",
  attention: "Needs attention",
  blocked: "Blocked",
};

const AVATAR_SURFACE: Record<LaneColor, string> = {
  "lane-emerald": "bg-lane-emerald-50 text-lane-emerald-700 ring-lane-emerald-200",
  "lane-amber": "bg-lane-amber-50 text-lane-amber-700 ring-lane-amber-200",
  "lane-sky": "bg-lane-sky-50 text-lane-sky-700 ring-lane-sky-200",
  "lane-violet": "bg-lane-violet-50 text-lane-violet-700 ring-lane-violet-200",
  "lane-rose": "bg-lane-rose-50 text-lane-rose-700 ring-lane-rose-200",
};

const DONUT_STROKE: Record<LaneColor, string> = {
  "lane-emerald": "text-lane-emerald-500",
  "lane-amber": "text-lane-amber-500",
  "lane-sky": "text-lane-sky-500",
  "lane-violet": "text-lane-violet-500",
  "lane-rose": "text-lane-rose-500",
};

const OUTCOME_META: Record<
  ActivityOutcome,
  { label: string; className: string }
> = {
  "auto-posted": {
    label: "Auto-posted",
    className: "bg-lane-emerald-50 text-lane-emerald-800 ring-lane-emerald-200",
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

export function WorkflowDrillPanel() {
  const { state, closePanel, openPanel } = useAppState();
  const { activityFeed, pendingQueue } = useData();

  const workflowId =
    state.activePanel?.type === "workflow-drill"
      ? state.activePanel.workflowId
      : null;
  const workflow = useWorkflow(workflowId ?? ("bank-rec" as const));

  if (!workflow) return null;

  const Icon = WORKFLOW_ICONS[workflow.id];
  const laneColor = LANES[workflow.lane].color;
  const { completed, total } = workflow.periodProgress;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const recentActivity = activityFeed
    .filter((a) => a.workflowId === workflow.id)
    .slice(0, 8);

  const workflowPending = pendingQueue.filter(
    (p) => p.workflowId === workflow.id,
  );

  return (
    <aside className="absolute inset-y-0 right-0 z-30 flex w-[640px] flex-col overflow-hidden border-l border-neutral-200 bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-start gap-3 border-b border-neutral-200 bg-neutral-50 px-6 py-5">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset",
            AVATAR_SURFACE[laneColor],
          )}
          aria-hidden
        >
          <Icon className="size-5" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-lg font-semibold text-neutral-900">
              {workflow.name}
            </h2>
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      HEALTH_DOT[workflow.healthIndicator],
                    )}
                    aria-label={HEALTH_LABEL[workflow.healthIndicator]}
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {HEALTH_LABEL[workflow.healthIndicator]}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="mt-0.5 text-[13px] text-neutral-500">
            {workflow.description}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <LaneBadge
              lane={workflow.lane}
              size="sm"
              interactive
              onClick={() => openPanel({ type: "policy", workflowId: workflow.id })}
            />
            <span className="text-[11px] text-neutral-500">
              Click lane to adjust policy
            </span>
          </div>
        </div>
        <button
          type="button"
          aria-label="Workflow menu"
          className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
        >
          <MoreHorizontal className="size-4" />
        </button>
        <Button
          size="icon"
          variant="ghost"
          onClick={closePanel}
          aria-label="Close panel"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {/* Stats row */}
        <section className="grid grid-cols-3 gap-3 border-b border-neutral-100 px-6 py-5">
          <StatCard label="Period progress">
            <div className="flex items-center gap-3">
              <div className="relative size-[60px] shrink-0">
                <Donut
                  percent={percent}
                  strokeClass={DONUT_STROKE[laneColor]}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold tabular-nums text-neutral-900">
                  {percent}%
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold tabular-nums text-neutral-900">
                  {completed}/{total}
                </span>
                <span className="text-[11px] text-neutral-500">
                  {workflow.periodProgress.unit}
                </span>
              </div>
            </div>
          </StatCard>

          <StatCard label="Pending">
            <div className="flex items-baseline gap-1">
              <span
                className={cn(
                  "text-2xl font-semibold tabular-nums leading-none",
                  workflow.pendingQueueCount > 0
                    ? "text-lane-amber-700"
                    : "text-neutral-900",
                )}
              >
                {workflow.pendingQueueCount}
              </span>
              <span className="text-[11px] text-neutral-500">items</span>
            </div>
            <span className="text-[11px] text-neutral-500">
              Awaiting controller
            </span>
          </StatCard>

          <StatCard label="Verification flags">
            <div className="flex items-baseline gap-1">
              <span
                className={cn(
                  "text-2xl font-semibold tabular-nums leading-none",
                  workflow.verificationFlags > 0
                    ? "text-lane-amber-700"
                    : "text-neutral-900",
                )}
              >
                {workflow.verificationFlags}
              </span>
              <span className="text-[11px] text-neutral-500">flagged</span>
            </div>
            <span className="text-[11px] text-neutral-500">This period</span>
          </StatCard>
        </section>

        {/* Agent behavior callout */}
        <section className="border-b border-neutral-100 px-6 py-4">
          <div className="flex items-start gap-2 rounded-lg bg-neutral-50 p-3 ring-1 ring-inset ring-neutral-200">
            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-neutral-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                Current behavior
              </span>
              <span className="text-[13px] text-neutral-800">
                {workflow.agentBehavior}
              </span>
            </div>
          </div>
        </section>

        {/* Parameter controls */}
        <ParameterSection workflow={workflow} />

        {/* Pending items */}
        {workflowPending.length > 0 && (
          <section className="border-b border-neutral-100 px-6 py-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Pending for this agent ({workflowPending.length})
              </h3>
            </div>
            <ul className="flex flex-col gap-2">
              {workflowPending.map((item) => (
                <PendingRow key={item.id} item={item} />
              ))}
            </ul>
          </section>
        )}

        {/* Recent activity */}
        <section className="px-6 py-4">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            Recent activity ({recentActivity.length})
          </h3>
          {recentActivity.length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-4 text-center text-[12px] text-neutral-500">
              No activity recorded for this agent yet.
            </div>
          ) : (
            <ul className="flex flex-col">
              {recentActivity.map((entry) => (
                <ActivityPanelRow key={entry.id} entry={entry} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </aside>
  );
}

// ---- Stat card ----

function StatCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3">
      <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">
        {label}
      </span>
      {children}
    </div>
  );
}

// ---- Parameter section ----

function ParameterSection({ workflow }: { workflow: WorkflowCard }) {
  const { openPanel } = useAppState();
  const [enabled, setEnabled] = useState(true);
  const [threshold, setThreshold] = useState(
    workflow.lane === "auto-execute" ? 95 : 85,
  );

  return (
    <section className="border-b border-neutral-100 px-6 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
          Parameters
        </h3>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => setEnabled((v) => !v)}
          className={cn(
            "relative inline-flex h-[18px] w-8 items-center rounded-full transition-colors",
            enabled ? "bg-lane-emerald-500" : "bg-neutral-300",
          )}
        >
          <span
            className={cn(
              "inline-block size-3.5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform",
              enabled && "translate-x-[14px]",
            )}
          />
          <span className="sr-only">
            {enabled ? "Agent enabled" : "Agent paused"}
          </span>
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-neutral-600">
            Confidence threshold
          </span>
          <span className="text-[13px] font-semibold tabular-nums text-neutral-900">
            {threshold}%
          </span>
        </div>
        <input
          type="range"
          min={50}
          max={99}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-full accent-neutral-900"
          aria-label="Confidence threshold"
        />
        <p className="text-[11px] text-neutral-500">
          Below threshold, the agent routes to pending review instead of posting.
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="mt-3 w-full"
        onClick={() => openPanel({ type: "policy", workflowId: workflow.id })}
      >
        Adjust lane &amp; policy
      </Button>
    </section>
  );
}

// ---- Pending row ----

function PendingRow({ item }: { item: PendingQueueItem }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-[12px] font-medium text-neutral-900">
          {item.title}
        </span>
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-neutral-500">
          <span>{item.riskTier}</span>
          <span>·</span>
          <span>{item.urgency} urgency</span>
        </div>
      </div>
      {item.amount !== undefined && (
        <span className="shrink-0 text-[12px] font-semibold tabular-nums text-neutral-900">
          ${item.amount.toLocaleString()}
        </span>
      )}
    </li>
  );
}

// ---- Activity row (compact) ----

function ActivityPanelRow({ entry }: { entry: ActivityEntry }) {
  const { openPanel } = useAppState();
  const outcome = OUTCOME_META[entry.outcome];
  const ts = parseISO(entry.timestamp);

  return (
    <li className="flex items-center gap-3 border-b border-neutral-100 py-2 last:border-b-0">
      <span className="w-[72px] shrink-0 font-mono text-[10px] uppercase tracking-wide text-neutral-400">
        {format(ts, "MMM d · h:mm a")}
      </span>
      <span className="min-w-0 flex-1 truncate text-[12px] text-neutral-800">
        {entry.action}
      </span>
      {typeof entry.confidenceScore === "number" && (
        <span className="shrink-0 rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-neutral-700">
          {entry.confidenceScore}%
        </span>
      )}
      <span
        className={cn(
          "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset",
          outcome.className,
        )}
      >
        {outcome.label}
      </span>
      {entry.evidenceRef && (
        <button
          type="button"
          aria-label="View evidence"
          onClick={() => openPanel({ type: "evidence", id: entry.evidenceRef! })}
          className="shrink-0 rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
        >
          <FileSearch className="size-3.5" />
        </button>
      )}
    </li>
  );
}

// ---- Donut primitive ----

function Donut({
  percent,
  strokeClass,
}: {
  percent: number;
  strokeClass: string;
}) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <svg viewBox="0 0 60 60" className="size-[60px] -rotate-90">
      <circle
        cx="30"
        cy="30"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        className="text-neutral-100"
      />
      <circle
        cx="30"
        cy="30"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className={cn(
          strokeClass,
          "[transition:stroke-dashoffset_800ms_ease-out]",
        )}
      />
    </svg>
  );
}
