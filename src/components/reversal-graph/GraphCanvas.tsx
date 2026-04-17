"use client";

import {
  CheckCircle2,
  Coins,
  FileClock,
  Layers,
  Scale,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReversalGraph, ReversalNodeType } from "@/data/types";

// Modernized causal tree. Dark techie canvas, glowing nodes, curved bezier
// edges with gradient strokes. Node geometry unchanged so the existing
// hand-tuned positions and cascade animation timings still line up.

const NODE_W = 196;
const NODE_H = 80;
const CANVAS_W = 820;
const CANVAS_H = 520;

type NodePos = { x: number; y: number };

const POSITIONS: Record<string, NodePos> = {
  root: { x: 410, y: 60 },
  "n-np-understated": { x: 130, y: 210 },
  "n-interest-accrual": { x: 410, y: 210 },
  "n-interest-expense": { x: 410, y: 355 },
  "n-invoice-open": { x: 690, y: 210 },
  "n-accrual-persisting": { x: 690, y: 355 },
  "n-aging-overdue": { x: 690, y: 475 },
};

const TYPE_META: Record<
  ReversalNodeType,
  { label: string; Icon: LucideIcon }
> = {
  "gl-balance": { label: "GL balance", Icon: Scale },
  accrual: { label: "Accrual", Icon: Layers },
  rollforward: { label: "Rollforward", Icon: FileClock },
  aging: { label: "Aging", Icon: Tag },
  other: { label: "Other", Icon: Coins },
};

const DEP_LABEL: Record<string, string> = {
  "triggered-by": "triggered by",
  "dependent-on": "dependent on",
  "updated-by": "updated by",
};

function formatAmount(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  return `${sign}$${abs.toLocaleString()}`;
}

type GraphCanvasProps = {
  graph: ReversalGraph;
  selectedIds: Set<string>;
  onToggle: (nodeId: string) => void;
  mode: "diagnostic" | "resolved";
};

export function GraphCanvas({
  graph,
  selectedIds,
  onToggle,
  mode,
}: GraphCanvasProps) {
  const { rootAction, downstreamNodes, upstreamInputs } = graph;

  const edgeStart = mode === "resolved" ? "#10b981" : "#f43f5e";
  const edgeEnd = mode === "resolved" ? "#34d399" : "#fb7185";

  return (
    <div className="space-y-3">
      {/* Upstream inputs row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
          Upstream inputs
        </span>
        {upstreamInputs.map((u) => (
          <span
            key={u.id}
            className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-neutral-300 ring-1 ring-inset ring-white/10"
          >
            {u.label}
          </span>
        ))}
      </div>

      {/* Dark techie canvas */}
      <div
        className={cn(
          "relative mx-auto overflow-hidden rounded-xl p-4",
          mode === "resolved"
            ? "bg-gradient-to-br from-emerald-950 via-neutral-950 to-neutral-900"
            : "bg-gradient-to-br from-neutral-950 via-neutral-900 to-rose-950/50",
        )}
        style={{ width: CANVAS_W + 32, height: CANVAS_H + 32 }}
      >
        {/* Grid background */}
        <svg
          className="absolute inset-0 opacity-[0.08]"
          width="100%"
          height="100%"
          aria-hidden
        >
          <defs>
            <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Ambient glow behind root */}
        <div
          className={cn(
            "pointer-events-none absolute rounded-full blur-3xl opacity-40",
            mode === "resolved" ? "bg-emerald-500" : "bg-rose-500",
          )}
          style={{
            left: POSITIONS.root.x - 100,
            top: POSITIONS.root.y - 40,
            width: 200,
            height: 140,
          }}
          aria-hidden
        />

        {/* Inner canvas */}
        <div
          className="relative"
          style={{ width: CANVAS_W, height: CANVAS_H }}
        >
          {/* SVG layer — edges */}
          <svg
            className="absolute inset-0"
            width={CANVAS_W}
            height={CANVAS_H}
            viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
          >
            <defs>
              <linearGradient id="edge-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={edgeStart} stopOpacity="0.9" />
                <stop offset="100%" stopColor={edgeEnd} stopOpacity="0.3" />
              </linearGradient>
              <filter id="edge-glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {downstreamNodes.map((node) => {
              const parent = POSITIONS[node.parentId] ?? POSITIONS.root;
              const child = POSITIONS[node.id];
              if (!child) return null;
              const x1 = parent.x;
              const y1 = parent.y + NODE_H / 2;
              const x2 = child.x;
              const y2 = child.y - NODE_H / 2;
              // Cubic bezier — control points create a gentle S-curve
              const cpOffset = Math.abs(y2 - y1) * 0.5;
              const d = `M ${x1} ${y1} C ${x1} ${y1 + cpOffset}, ${x2} ${y2 - cpOffset}, ${x2} ${y2}`;
              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;

              return (
                <g key={`edge-${node.id}`}>
                  <path
                    d={d}
                    fill="none"
                    stroke="url(#edge-gradient)"
                    strokeWidth={1.5}
                    filter="url(#edge-glow)"
                  />
                  <text
                    x={midX}
                    y={midY - 6}
                    textAnchor="middle"
                    className="fill-neutral-500"
                    style={{ fontSize: 10, letterSpacing: "0.05em" }}
                  >
                    {DEP_LABEL[node.dependencyType] ?? node.dependencyType}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Root node */}
          <RootNodeBox
            label={rootAction.label}
            amount={rootAction.amount}
            pos={POSITIONS.root}
            mode={mode}
          />

          {/* Downstream nodes */}
          {downstreamNodes.map((node) => {
            const pos = POSITIONS[node.id];
            if (!pos) return null;
            const { Icon, label } = TYPE_META[node.type];
            const checked = selectedIds.has(node.id);
            const resolved = mode === "resolved";

            return (
              <div
                key={node.id}
                className={cn(
                  "group absolute rounded-lg border backdrop-blur-sm transition-all",
                  "bg-white/[0.03] p-2.5 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)]",
                  resolved
                    ? "border-emerald-400/40 ring-1 ring-emerald-400/20"
                    : checked
                      ? "border-rose-400/60 ring-1 ring-rose-400/30"
                      : "border-white/10",
                )}
                style={{
                  left: pos.x - NODE_W / 2,
                  top: pos.y - NODE_H / 2,
                  width: NODE_W,
                  height: NODE_H,
                }}
              >
                {/* Glow rim */}
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity",
                    "group-hover:opacity-100",
                    resolved
                      ? "shadow-[inset_0_0_16px_rgba(16,185,129,0.3)]"
                      : checked
                        ? "shadow-[inset_0_0_16px_rgba(244,63,94,0.3)]"
                        : "shadow-[inset_0_0_16px_rgba(255,255,255,0.08)]",
                  )}
                  aria-hidden
                />

                {/* Checkbox / check indicator top-right */}
                <div className="absolute right-2 top-2 z-10">
                  {resolved ? (
                    <CheckCircle2 className="size-4 text-emerald-400" />
                  ) : (
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(node.id)}
                      className="size-3.5 cursor-pointer accent-rose-500"
                      aria-label={`Select ${node.label}`}
                    />
                  )}
                </div>

                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-neutral-400">
                  <Icon className="size-3" />
                  <span>{label}</span>
                </div>
                <div
                  className={cn(
                    "mt-0.5 line-clamp-2 pr-5 text-[11px] font-medium leading-tight",
                    resolved ? "text-emerald-100" : "text-neutral-100",
                  )}
                >
                  {node.label}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] tabular-nums text-neutral-400">
                  <span
                    className={cn(
                      "rounded px-1 py-0.5 text-[9px] font-semibold",
                      resolved
                        ? "bg-emerald-400/10 text-emerald-300"
                        : "bg-rose-400/10 text-rose-300",
                    )}
                  >
                    {formatAmount(node.impact.amount)}
                  </span>
                  <span className="truncate">{node.impact.account}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RootNodeBox({
  label,
  amount,
  pos,
  mode,
}: {
  label: string;
  amount: number;
  pos: NodePos;
  mode: "diagnostic" | "resolved";
}) {
  const resolved = mode === "resolved";
  return (
    <div
      className={cn(
        "absolute rounded-lg border-2 p-2.5 backdrop-blur-sm",
        "shadow-[0_0_24px_-4px_currentColor]",
        resolved
          ? "border-emerald-400 bg-emerald-500/10 text-emerald-400"
          : "border-rose-400 bg-rose-500/10 text-rose-400",
      )}
      style={{
        left: pos.x - NODE_W / 2,
        top: pos.y - NODE_H / 2,
        width: NODE_W,
        height: NODE_H,
      }}
    >
      <div
        className={cn(
          "flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider",
          resolved ? "text-emerald-300" : "text-rose-300",
        )}
      >
        <span
          className={cn(
            "inline-block size-1.5 animate-pulse rounded-full",
            resolved ? "bg-emerald-400" : "bg-rose-400",
          )}
        />
        Root action
      </div>
      <div
        className={cn(
          "mt-0.5 line-clamp-2 text-[11px] font-medium leading-tight",
          resolved ? "text-emerald-100" : "text-rose-100",
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          "mt-1 text-[11px] font-semibold tabular-nums",
          resolved ? "text-emerald-300" : "text-rose-300",
        )}
      >
        ${amount.toLocaleString()}
      </div>
    </div>
  );
}
