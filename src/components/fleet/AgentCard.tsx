"use client";

import { useState } from "react";
import { MoreHorizontal, Power } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LaneBadge } from "@/components/primitives/LaneBadge";
import { cn } from "@/lib/utils";
import { useAppState } from "@/state/AppStateContext";
import { LANES } from "@/lib/lanes";
import type { HealthIndicator, LaneColor, WorkflowCard } from "@/data/types";
import { WORKFLOW_ICONS } from "@/components/activity-feed/workflow-icons";

// A single agent card on the Agent Fleet page. Much richer than the strip
// tile: avatar, donut, sparkline, parameter panel, recent activity preview.

type AgentCardProps = {
  workflow: WorkflowCard;
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

export function AgentCard({ workflow }: AgentCardProps) {
  const { openPanel } = useAppState();
  const Icon = WORKFLOW_ICONS[workflow.id];
  const laneColor = LANES[workflow.lane].color;

  // Local state — demo only. Real system would persist to policy engine.
  const [enabled, setEnabled] = useState(true);
  const [threshold, setThreshold] = useState(
    workflow.lane === "auto-execute" ? 95 : 85,
  );

  const { completed, total } = workflow.periodProgress;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Synthetic 10-point throughput sparkline keyed to progress — makes each
  // card look unique without bloating the seed data.
  const spark = generateSpark(workflow.id, percent);

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md",
        !enabled && "opacity-60",
      )}
    >
      {/* Top section — identity + donut */}
      <div className="flex items-start gap-3 border-b border-neutral-100 p-4">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset",
            AVATAR_SURFACE[laneColor],
          )}
          aria-hidden
        >
          <Icon className="size-5" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-neutral-900">
              {workflow.name}
            </h3>
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
          </div>
          <p className="mt-0.5 line-clamp-2 text-[11px] text-neutral-500">
            {workflow.description}
          </p>
          <div className="mt-2">
            <LaneBadge lane={workflow.lane} size="sm" />
          </div>
        </div>
        <button
          type="button"
          aria-label="Agent menu"
          className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      {/* Middle — donut + sparkline row */}
      <div className="grid grid-cols-2 gap-3 border-b border-neutral-100 p-4">
        <div className="flex items-center gap-3">
          <div className="relative size-[60px] shrink-0">
            <Donut percent={percent} strokeClass={DONUT_STROKE[laneColor]} />
            <span className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold tabular-nums text-neutral-900">
              {percent}%
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400">
              Period
            </span>
            <span className="text-sm font-semibold tabular-nums text-neutral-900">
              {completed}/{total}
            </span>
            <span className="text-[11px] text-neutral-500">
              {workflow.periodProgress.unit}
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400">
            Throughput · 10d
          </span>
          <Sparkline
            data={spark}
            className={DONUT_STROKE[laneColor]}
            width={130}
            height={36}
          />
          <div className="flex items-center gap-1.5 text-[11px]">
            {workflow.pendingQueueCount > 0 && (
              <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 font-medium text-neutral-700">
                {workflow.pendingQueueCount} pending
              </span>
            )}
            {workflow.verificationFlags > 0 && (
              <span className="rounded-full bg-lane-amber-50 px-1.5 py-0.5 font-medium text-lane-amber-800 ring-1 ring-inset ring-lane-amber-200">
                {workflow.verificationFlags} flag
              </span>
            )}
            {workflow.pendingQueueCount === 0 &&
              workflow.verificationFlags === 0 && (
                <span className="text-neutral-400">Clean</span>
              )}
          </div>
        </div>
      </div>

      {/* Parameter panel */}
      <div className="flex flex-col gap-3 border-b border-neutral-100 p-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">
            Adjust parameters
          </span>
          <Switch checked={enabled} onChange={setEnabled} />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-neutral-600">
              Confidence threshold
            </span>
            <span className="text-[12px] font-semibold tabular-nums text-neutral-900">
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
        </div>
      </div>

      {/* Agent behavior footer */}
      <button
        type="button"
        onClick={() =>
          openPanel({ type: "workflow-drill", workflowId: workflow.id })
        }
        className="flex items-start gap-2 px-4 py-3 text-left hover:bg-neutral-50"
      >
        <span className="mt-0.5 inline-flex size-1.5 shrink-0 rounded-full bg-neutral-400" />
        <span className="text-[11px] leading-snug text-neutral-600">
          {workflow.agentBehavior}
        </span>
      </button>
    </div>
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

// ---- Sparkline primitive ----

function Sparkline({
  data,
  className,
  width = 100,
  height = 32,
}: {
  data: number[];
  className?: string;
  width?: number;
  height?: number;
}) {
  if (data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1 || 1);

  const pts = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * height;
    return [x, y] as const;
  });

  const polyline = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area =
    `M0,${height} ` +
    pts.map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`).join(" ") +
    ` L${width},${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn("shrink-0", className)}
    >
      <path d={area} fill="currentColor" opacity={0.1} />
      <polyline
        points={polyline}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ---- Toggle switch ----

function Switch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-[18px] w-8 items-center rounded-full transition-colors",
        checked ? "bg-lane-emerald-500" : "bg-neutral-300",
      )}
    >
      <span
        className={cn(
          "inline-block size-3.5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform",
          checked && "translate-x-[14px]",
        )}
      />
      <span className="sr-only">
        {checked ? "Agent enabled" : "Agent paused"}
      </span>
      <Power
        className={cn(
          "absolute -left-4 size-3",
          checked ? "text-lane-emerald-600" : "text-neutral-400",
        )}
        aria-hidden
      />
    </button>
  );
}

// ---- Synthetic sparkline data ----

function generateSpark(seed: string, target: number): number[] {
  // Deterministic hash so the same agent gets the same spark shape.
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const rand = () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return (h & 0xffff) / 0xffff;
  };

  const points: number[] = [];
  let v = Math.max(10, target * 0.4);
  for (let i = 0; i < 10; i++) {
    const drift = (rand() - 0.35) * 18;
    v = Math.max(4, Math.min(100, v + drift));
    points.push(Math.round(v));
  }
  // Anchor the tail near the current percent so it reads as "trending to here".
  points[points.length - 1] = Math.round(
    Math.max(5, Math.min(100, target * (0.8 + rand() * 0.3))),
  );
  return points;
}
