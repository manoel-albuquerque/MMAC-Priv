"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LaneBadge } from "@/components/primitives/LaneBadge";
import { cn } from "@/lib/utils";
import { useData } from "@/hooks/useData";
import { useAppState } from "@/state/AppStateContext";
import type { HealthIndicator } from "@/data/types";

// Fleet Status Board — right sidebar (320px). Replaces the horizontal strip.
// Stacked list of all 11 agents so the controller can see the whole team at
// a glance even when a detail panel is open over the main body.

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

export function FleetSidebar() {
  const { workflows: allWorkflows } = useData();
  const { state, openPanel } = useAppState();
  const [collapsed, setCollapsed] = useState(false);

  // Connector Health surfaces in the top-bar Connectors metric card, not here.
  const workflows = allWorkflows.filter((w) => w.id !== "connector-health");

  const activeWorkflowId =
    state.activePanel?.type === "workflow-drill"
      ? state.activePanel.workflowId
      : null;

  const attentionCount = workflows.filter(
    (w) => w.healthIndicator !== "healthy",
  ).length;

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-[width] duration-200",
        collapsed ? "w-[56px]" : "w-[280px]",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-start gap-2 border-b border-neutral-200 bg-white py-4",
          collapsed ? "justify-center px-2" : "justify-between px-5",
        )}
      >
        {!collapsed ? (
          <>
            <div className="flex flex-col">
              <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                Your close agent team
              </span>
              <span className="text-sm font-semibold text-neutral-900">
                {workflows.length} agents
              </span>
            </div>
            <div className="flex items-start gap-2">
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                  Attention
                </span>
                <span
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    attentionCount > 0
                      ? "text-lane-amber-700"
                      : "text-neutral-900",
                  )}
                >
                  {attentionCount}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                aria-label="Collapse agent team"
                className="mt-0.5 flex size-6 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            aria-label="Expand agent team"
            className="flex size-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          >
            <ChevronLeft className="size-4" />
          </button>
        )}
      </div>

      {/* Stacked fleet list */}
      <div className="flex-1 overflow-y-auto">
        <ul className="flex flex-col">
          {workflows.map((workflow) => {
            const { completed, total } = workflow.periodProgress;
            const percent =
              total > 0 ? Math.round((completed / total) * 100) : 0;
            const isActive = activeWorkflowId === workflow.id;

            if (collapsed) {
              return (
                <li key={workflow.id}>
                  <TooltipProvider delayDuration={150}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() =>
                            openPanel({
                              type: "workflow-drill",
                              workflowId: workflow.id,
                            })
                          }
                          aria-label={`${workflow.name} · ${percent}%`}
                          className={cn(
                            "flex w-full items-center justify-center border-b border-neutral-200 py-3 transition-colors",
                            isActive
                              ? "bg-white ring-1 ring-inset ring-neutral-900/10"
                              : "bg-neutral-50 hover:bg-white",
                          )}
                        >
                          <span
                            className={cn(
                              "size-2 rounded-full",
                              HEALTH_DOT[workflow.healthIndicator],
                            )}
                          />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="text-xs">
                        <div className="font-medium">{workflow.name}</div>
                        <div className="text-neutral-400">
                          {percent}% · {HEALTH_LABEL[workflow.healthIndicator]}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </li>
              );
            }

            return (
              <li key={workflow.id}>
                <button
                  type="button"
                  onClick={() =>
                    openPanel({
                      type: "workflow-drill",
                      workflowId: workflow.id,
                    })
                  }
                  className={cn(
                    "group flex w-full flex-col gap-2 border-b border-neutral-200 px-5 py-3 text-left transition-colors",
                    isActive
                      ? "bg-white ring-1 ring-inset ring-neutral-900/10"
                      : "bg-neutral-50 hover:bg-white",
                  )}
                >
                  {/* Top row: name + health dot */}
                  <div className="flex min-w-0 items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <TooltipProvider delayDuration={150}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span
                              className={cn(
                                "size-1.5 shrink-0 rounded-full",
                                HEALTH_DOT[workflow.healthIndicator],
                              )}
                              aria-label={HEALTH_LABEL[workflow.healthIndicator]}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            {HEALTH_LABEL[workflow.healthIndicator]}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <h3 className="min-w-0 flex-1 truncate text-[13px] font-medium text-neutral-900">
                        {workflow.name}
                      </h3>
                    </div>
                    <span className="shrink-0 text-[11px] font-semibold tabular-nums text-neutral-900">
                      {percent}%
                    </span>
                  </div>

                  {/* Bar */}
                  <div
                    className="h-1 w-full overflow-hidden rounded-full bg-neutral-200"
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

                  {/* Bottom row: lane + counts — wrap onto two rows if tight */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <LaneBadge lane={workflow.lane} size="sm" showIcon={false} />
                    <div className="ml-auto flex items-center gap-1 text-[10px] tabular-nums text-neutral-500">
                      <span>
                        {completed}/{total}
                      </span>
                      {workflow.pendingQueueCount > 0 && (
                        <span className="rounded-full bg-neutral-200 px-1.5 py-0.5 font-medium text-neutral-700">
                          {workflow.pendingQueueCount}p
                        </span>
                      )}
                      {workflow.verificationFlags > 0 && (
                        <span className="rounded-full bg-lane-amber-100 px-1.5 py-0.5 font-medium text-lane-amber-800">
                          {workflow.verificationFlags}f
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
