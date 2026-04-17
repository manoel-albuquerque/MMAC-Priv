"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LaneBadge } from "@/components/primitives/LaneBadge";
import { cn } from "@/lib/utils";
import { useAppState } from "@/state/AppStateContext";
import type { HealthIndicator, WorkflowCard as WorkflowCardData } from "@/data/types";

type WorkflowCardProps = {
  workflow: WorkflowCardData;
};

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

export function WorkflowCard({ workflow }: WorkflowCardProps) {
  const { openPanel } = useAppState();

  const openDrill = () =>
    openPanel({ type: "workflow-drill", workflowId: workflow.id });
  const openPolicy = () =>
    openPanel({ type: "policy", workflowId: workflow.id });

  const handleCardKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDrill();
    }
  };

  const { completed, total } = workflow.periodProgress;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openDrill}
      onKeyDown={handleCardKey}
      className={cn(
        "group flex h-full flex-1 basis-0 shrink-0 cursor-pointer flex-col gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-3",
        "transition-all hover:border-neutral-300 hover:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300",
      )}
    >
      {/* Workflow name + health dot */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-900">
          {workflow.name}
        </h3>
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "mt-1.5 size-2 shrink-0 rounded-full",
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

      {/* Lane badge */}
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.stopPropagation();
          }
        }}
      >
        <LaneBadge
          lane={workflow.lane}
          size="sm"
          interactive
          onClick={openPolicy}
        />
      </div>

      {/* Period progress % */}
      <div className="flex items-baseline justify-between gap-1 tabular-nums pt-0.5">
        <span className="text-2xl font-semibold leading-none text-neutral-900">
          {percent}%
        </span>
        <span className="text-[10px] uppercase tracking-wider text-neutral-400">
          period
        </span>
      </div>

      {/* Bar */}
      <div
        className="h-1 w-full overflow-hidden rounded-full bg-neutral-100"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={completed}
      >
        <div
          className="h-full rounded-full bg-neutral-900 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Subtitle + footer badges */}
      <div className="mt-auto flex items-center justify-between gap-2">
        <div className="text-[11px] tabular-nums text-neutral-500">
          {completed.toLocaleString()} / {total.toLocaleString()}
        </div>
        <div className="flex items-center gap-1">
          {workflow.pendingQueueCount > 0 && (
            <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-700">
              {workflow.pendingQueueCount} pending
            </span>
          )}
          {workflow.verificationFlags > 0 && (
            <span className="rounded-full bg-lane-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-lane-amber-800 ring-1 ring-inset ring-lane-amber-200">
              {workflow.verificationFlags} flagged
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
