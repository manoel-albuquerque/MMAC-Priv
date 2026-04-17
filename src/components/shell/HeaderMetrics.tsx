"use client";

import { format, parseISO } from "date-fns";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useData } from "@/hooks/useData";
import { cn } from "@/lib/utils";
import { LANES, LANE_ORDER } from "@/lib/lanes";
import type { Connector, Lane, LaneColor, WorkflowCard } from "@/data/types";

// 4-up hero metric cards. Sits at the top of the main body, giving the
// command center the big-picture dashboard feel you'd expect before you
// scan the activity feed and the fleet sidebar.

export function HeaderMetrics() {
  const { period, workflows } = useData();

  // Synthetic 14-point sparkline for "transactions today" to look alive.
  const sparkSeed = [
    22, 18, 24, 30, 28, 34, 40, 38, 44, 48, 46, 50, 52, period.transactionsProcessedToday,
  ];

  return (
    <div className="grid shrink-0 grid-cols-4 gap-4">
      <PeriodHealthCard percent={period.healthPercent} workflows={workflows} />
      <TransactionsCard
        total={period.transactionsProcessedThisPeriod}
        today={period.transactionsProcessedToday}
        spark={sparkSeed}
      />
      <MisstatementsCard
        count={period.materialMisstatements}
        autoPostRate={period.autoPostRate}
      />
      <ConnectorsCard />
    </div>
  );
}

// ---- Card primitives ----

function MetricCard({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm",
        className,
      )}
    >
      <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
        {label}
      </span>
      {children}
    </div>
  );
}

// ---- Period Health — donut with lane-contributed arcs ----

const LANE_ARC_STROKE: Record<LaneColor, string> = {
  "lane-emerald": "text-lane-emerald-500",
  "lane-amber": "text-lane-amber-500",
  "lane-sky": "text-lane-sky-500",
  "lane-violet": "text-lane-violet-500",
  "lane-rose": "text-lane-rose-500",
};

function PeriodHealthCard({
  percent,
  workflows,
}: {
  percent: number;
  workflows: WorkflowCard[];
}) {
  const clamped = Math.max(0, Math.min(100, percent));

  // Group completed/total by lane to drive the per-lane arc contributions.
  const laneTotals: Record<Lane, { completed: number; total: number }> = {
    "auto-execute": { completed: 0, total: 0 },
    "draft-confirm": { completed: 0, total: 0 },
    "ask-clarification": { completed: 0, total: 0 },
    "create-task": { completed: 0, total: 0 },
    "escalate-stop": { completed: 0, total: 0 },
  };
  for (const w of workflows) {
    laneTotals[w.lane].completed += w.periodProgress.completed;
    laneTotals[w.lane].total += w.periodProgress.total;
  }
  const grandTotal = Object.values(laneTotals).reduce(
    (sum, t) => sum + t.total,
    0,
  );

  // Build the arc path data. Each lane gets a slice of the ring sized by its
  // total, and filled by its completed ratio within that slice.
  const radius = 28;
  const circumference = 2 * Math.PI * radius;

  let cursorAngle = 0;
  const arcs = LANE_ORDER.flatMap((lane) => {
    const { completed, total } = laneTotals[lane];
    if (total === 0) return [];
    const slicePortion = total / grandTotal;
    const sliceLength = slicePortion * circumference;
    const filledLength = (completed / total) * sliceLength;

    const meta = LANES[lane];
    const arc = {
      lane,
      color: meta.color,
      // dasharray trick: render the filled portion of THIS slice starting at
      // the current cursor angle. We render each arc as a full circle with
      // gaps so they show up at the correct positions.
      strokeDasharray: `${filledLength} ${circumference}`,
      strokeDashoffset: -cursorAngle,
      sliceLength,
    };
    cursorAngle += sliceLength + 2; // 2px gap between lane slices
    return [arc];
  });

  return (
    <MetricCard label="Close progress">
      <div className="flex items-center gap-4">
        <div className="relative size-[72px] shrink-0">
          <svg viewBox="0 0 72 72" className="size-[72px] -rotate-90">
            <circle
              cx="36"
              cy="36"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-neutral-100"
            />
            {arcs.map((arc) => (
              <circle
                key={arc.lane}
                cx="36"
                cy="36"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="butt"
                strokeDasharray={arc.strokeDasharray}
                strokeDashoffset={arc.strokeDashoffset}
                className={cn(
                  LANE_ARC_STROKE[arc.color],
                  "[transition:stroke-dasharray_800ms_ease-out,stroke-dashoffset_800ms_ease-out]",
                )}
              />
            ))}
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-base font-semibold tabular-nums text-neutral-900">
            {Math.round(clamped)}%
          </span>
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="text-sm font-semibold text-neutral-900">
            In progress
          </span>
          <span className="text-[11px] text-neutral-500">
            On pace for Apr 30 lock
          </span>
          <span className="mt-1 text-[10px] text-neutral-400">
            By lane · {workflows.length} agents
          </span>
        </div>
      </div>
    </MetricCard>
  );
}

// ---- Transactions — number + sparkline ----

function TransactionsCard({
  total,
  today,
  spark,
}: {
  total: number;
  today: number;
  spark: number[];
}) {
  return (
    <MetricCard label="Transactions">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-2xl font-semibold tabular-nums leading-none text-neutral-900">
            {total.toLocaleString()}
          </span>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-neutral-500">
            <ArrowUpRight className="size-3 text-lane-emerald-600" />
            <span className="font-medium tabular-nums text-lane-emerald-700">
              +{today}
            </span>
            <span>today</span>
          </div>
        </div>
        <Sparkline data={spark} className="text-lane-sky-500" />
      </div>
    </MetricCard>
  );
}

// ---- Misstatements — number + trend ----

function MisstatementsCard({
  count,
  autoPostRate,
}: {
  count: number;
  autoPostRate: number;
}) {
  const trendIcon = count === 0 ? Minus : ArrowDownRight;
  const TrendIcon = trendIcon;
  const trendTone =
    count === 0
      ? "text-lane-emerald-700"
      : count <= 2
        ? "text-lane-amber-700"
        : "text-lane-rose-700";

  return (
    <MetricCard label="Material misstatements">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <span
            className={cn(
              "text-2xl font-semibold tabular-nums leading-none",
              count === 0 ? "text-lane-emerald-700" : "text-neutral-900",
            )}
          >
            {count}
          </span>
          <div className={cn("mt-1 flex items-center gap-1 text-[11px]", trendTone)}>
            <TrendIcon className="size-3" />
            <span className="font-medium">
              {count === 0 ? "Clean period" : "Review required"}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400">
            Auto-post
          </span>
          <span className="text-sm font-semibold tabular-nums text-neutral-900">
            {Math.round(autoPostRate * 100)}%
          </span>
        </div>
      </div>
    </MetricCard>
  );
}

// ---- Connectors — grid of dots ----

const STATUS_CLASS: Record<Connector["status"], string> = {
  active: "bg-lane-emerald-500",
  degraded: "bg-lane-amber-500",
  disconnected: "bg-lane-rose-500",
};

function ConnectorsCard() {
  const { connectors } = useData();
  const active = connectors.filter((c) => c.status === "active").length;
  const total = connectors.length;

  return (
    <MetricCard label="Connectors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-2xl font-semibold tabular-nums leading-none text-neutral-900">
            {active}
            <span className="text-base text-neutral-400"> / {total}</span>
          </span>
          <span className="mt-1 text-[11px] text-neutral-500">Sources live</span>
        </div>
        <TooltipProvider delayDuration={100}>
          <div className="grid grid-cols-4 gap-1.5">
            {connectors.map((c) => (
              <Tooltip key={c.id}>
                <TooltipTrigger asChild>
                  <span
                    className={cn(
                      "size-3 rounded-md ring-1 ring-inset ring-white/60",
                      STATUS_CLASS[c.status],
                    )}
                    aria-label={`${c.name}: ${c.status}`}
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-muted-foreground">
                    {c.type} · {c.status}
                  </div>
                  <div className="text-muted-foreground">
                    Last sync {format(parseISO(c.lastSyncAt), "MMM d, h:mm a")}
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>
    </MetricCard>
  );
}

// ---- Sparkline primitive ----

function Sparkline({
  data,
  className,
}: {
  data: number[];
  className?: string;
}) {
  if (data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 88;
  const h = 32;
  const step = w / (data.length - 1 || 1);

  const points = data
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  // Build an area-fill path under the line.
  const areaPath = `M0,${h} L${points
    .split(" ")
    .map((p) => p.replace(",", " "))
    .join(" L ")} L${w},${h} Z`
    .replace(/L/g, " L ")
    .replace(/ +/g, " ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className={cn("shrink-0", className)}>
      <path d={areaPath} fill="currentColor" opacity={0.1} />
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
