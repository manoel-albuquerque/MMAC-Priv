"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReversalGraph } from "@/data/types";

// State B of the Reversal Graph — the cascade animation.
// ~12 seconds total. Resolves edges-inward: interest leaf first, then loan
// balance, then AP chain from aging back to the invoice, then root
// reclassification. Each beat is visible before the next begins.
//
// Timing chosen to match the spec's "edges to root" directive:
//   t=0.0s  start — everything muted, pulse ring on interest-expense leaf
//   t=1.6s  interest-expense → emerald + checkmark, new label
//   t=3.2s  interest-accrual → emerald + checkmark, new label
//   t=4.8s  np-understated → emerald + checkmark, "Notes Payable restored"
//   t=6.4s  aging-overdue → emerald
//   t=8.0s  accrual-persisting → emerald
//   t=9.6s  invoice-open → emerald, "Invoice #4872 paid"
//   t=11.2s root → emerald, label flips to "Reclassified · Dr AP $200K · Cr Cash"
//   t=12.0s done — caller transitions to State C

const NODE_W = 196;
const NODE_H = 80;
const CANVAS_W = 820;
const CANVAS_H = 520;

const POSITIONS: Record<string, { x: number; y: number }> = {
  root: { x: 410, y: 60 },
  "n-np-understated": { x: 130, y: 210 },
  "n-interest-accrual": { x: 410, y: 210 },
  "n-interest-expense": { x: 410, y: 355 },
  "n-invoice-open": { x: 690, y: 210 },
  "n-accrual-persisting": { x: 690, y: 355 },
  "n-aging-overdue": { x: 690, y: 475 },
};

type Step = {
  id: string;
  delay: number;
  resolvedLabel: string;
  resolvedDetail: string;
};

const SEQUENCE: Step[] = [
  {
    id: "n-interest-expense",
    delay: 1.6,
    resolvedLabel: "Interest expense corrected",
    resolvedDetail: "+$300 correction · Interest Expense",
  },
  {
    id: "n-interest-accrual",
    delay: 3.2,
    resolvedLabel: "Interest accrual recalculated",
    resolvedDetail: "Reversed against Interest Payable",
  },
  {
    id: "n-np-understated",
    delay: 4.8,
    resolvedLabel: "Notes Payable restored",
    resolvedDetail: "+$200,000 restored · Notes Payable",
  },
  {
    id: "n-aging-overdue",
    delay: 6.4,
    resolvedLabel: "Stellar Logistics · current",
    resolvedDetail: "Aging cleared · 0 days past due",
  },
  {
    id: "n-accrual-persisting",
    delay: 8.0,
    resolvedLabel: "Accrued liability released",
    resolvedDetail: "-$200,000 · Accrued Liabilities",
  },
  {
    id: "n-invoice-open",
    delay: 9.6,
    resolvedLabel: "Invoice #4872 paid",
    resolvedDetail: "AP Trade — Stellar Logistics settled",
  },
];

const ROOT_RESOLVE_AT = 11.2;
const TOTAL_DURATION_MS = 12_000;

type Props = {
  graph: ReversalGraph;
  onComplete: () => void;
};

export function RevertingCascade({ graph, onComplete }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const started = performance.now();
    let raf = 0;
    const tick = () => {
      const now = performance.now();
      setElapsed((now - started) / 1000);
      if (now - started < TOTAL_DURATION_MS) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    const done = setTimeout(onComplete, TOTAL_DURATION_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(done);
    };
  }, [onComplete]);

  const resolvedIds = new Set(
    SEQUENCE.filter((s) => elapsed >= s.delay).map((s) => s.id),
  );
  const rootResolved = elapsed >= ROOT_RESOLVE_AT;
  // Each node has a "pulsing" window: from 200ms before its delay to 300ms after.
  const isPulsing = (id: string): boolean => {
    if (id === "root") {
      return elapsed >= ROOT_RESOLVE_AT - 0.2 && elapsed < ROOT_RESOLVE_AT + 0.3;
    }
    const step = SEQUENCE.find((s) => s.id === id);
    if (!step) return false;
    return elapsed >= step.delay - 0.2 && elapsed < step.delay + 0.3;
  };

  const rootNode = graph.rootAction;
  const rootLabel = rootResolved
    ? "Reclassified · Dr AP Trade $200,000 · Cr Cash $200,000"
    : rootNode.label;

  return (
    <div className="space-y-4">
      {/* Progress readout */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-800">
          <Loader2 className="size-4 animate-spin text-lane-emerald-600" />
          Reverting · unwinding from edges to root
        </div>
        <div className="text-[11px] tabular-nums text-neutral-500">
          {elapsed.toFixed(1)}s / 12.0s
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full bg-lane-emerald-500 transition-all"
          style={{ width: `${Math.min(100, (elapsed / 12) * 100)}%` }}
        />
      </div>

      {/* Dark techie canvas */}
      <div
        className="relative mx-auto overflow-hidden rounded-xl p-4"
        style={{
          width: CANVAS_W + 32,
          height: CANVAS_H + 32,
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #171717 50%, #1a0808 100%)",
        }}
      >
        {/* Grid background */}
        <svg
          className="absolute inset-0 opacity-[0.08]"
          width="100%"
          height="100%"
          aria-hidden
        >
          <defs>
            <pattern id="cascade-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cascade-grid)" />
        </svg>

        {/* Ambient glow trailing the active beat */}
        <motion.div
          className="pointer-events-none absolute rounded-full blur-3xl"
          aria-hidden
          animate={{
            backgroundColor: rootResolved
              ? "rgba(16,185,129,0.35)"
              : "rgba(244,63,94,0.3)",
          }}
          transition={{ duration: 0.6 }}
          style={{
            left: POSITIONS.root.x - 100,
            top: POSITIONS.root.y - 40,
            width: 200,
            height: 140,
          }}
        />

        <div
          className="relative"
          style={{ width: CANVAS_W, height: CANVAS_H }}
        >
          {/* Edges */}
          <svg
            className="absolute inset-0"
            width={CANVAS_W}
            height={CANVAS_H}
            viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
          >
            <defs>
              <filter id="cascade-edge-glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {graph.downstreamNodes.map((node) => {
              const parent = POSITIONS[node.parentId] ?? POSITIONS.root;
              const child = POSITIONS[node.id];
              if (!child) return null;
              const x1 = parent.x;
              const y1 = parent.y + NODE_H / 2;
              const x2 = child.x;
              const y2 = child.y - NODE_H / 2;
              const cpOffset = Math.abs(y2 - y1) * 0.5;
              const d = `M ${x1} ${y1} C ${x1} ${y1 + cpOffset}, ${x2} ${y2 - cpOffset}, ${x2} ${y2}`;
              const childResolved = resolvedIds.has(node.id);

              return (
                <path
                  key={`edge-${node.id}`}
                  d={d}
                  fill="none"
                  stroke={childResolved ? "#10b981" : "#f43f5e"}
                  strokeOpacity={childResolved ? 0.9 : 0.35}
                  strokeWidth={childResolved ? 2 : 1}
                  filter="url(#cascade-edge-glow)"
                  style={{
                    transition:
                      "stroke 500ms ease, stroke-opacity 500ms ease, stroke-width 500ms ease",
                  }}
                />
              );
            })}
          </svg>

          {/* Root node */}
          <Node
            pos={POSITIONS.root}
            width={240}
            height={84}
            resolved={rootResolved}
            pulsing={isPulsing("root")}
            rootAccent
            title={rootLabel}
            subtitle={`$${rootNode.amount.toLocaleString()} · Apr 9`}
          />

          {/* Downstream nodes */}
          {graph.downstreamNodes.map((node) => {
            const pos = POSITIONS[node.id];
            if (!pos) return null;
            const resolved = resolvedIds.has(node.id);
            const step = SEQUENCE.find((s) => s.id === node.id);
            const title = resolved && step ? step.resolvedLabel : node.label;
            const subtitle =
              resolved && step
                ? step.resolvedDetail
                : `${formatAmount(node.impact.amount)} · ${node.impact.account}`;
            return (
              <Node
                key={node.id}
                pos={pos}
                width={NODE_W}
                height={NODE_H}
                resolved={resolved}
                pulsing={isPulsing(node.id)}
                title={title}
                subtitle={subtitle}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatAmount(amount: number) {
  const sign = amount < 0 ? "-" : "";
  return `${sign}$${Math.abs(amount).toLocaleString()}`;
}

function Node({
  pos,
  width,
  height,
  resolved,
  pulsing,
  rootAccent,
  title,
  subtitle,
}: {
  pos: { x: number; y: number };
  width: number;
  height: number;
  resolved: boolean;
  pulsing: boolean;
  rootAccent?: boolean;
  title: string;
  subtitle: string;
}) {
  return (
    <motion.div
      className={cn(
        "absolute rounded-lg border backdrop-blur-sm",
        "bg-white/[0.04] p-2.5 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)]",
        resolved
          ? "border-emerald-400/60 ring-1 ring-emerald-400/30"
          : rootAccent
            ? "border-rose-400/60 ring-1 ring-rose-400/30"
            : "border-white/10",
      )}
      style={{
        left: pos.x - width / 2,
        top: pos.y - height / 2,
        width,
        height,
      }}
      animate={{
        scale: pulsing ? 1.05 : 1,
        boxShadow: pulsing
          ? resolved
            ? "0 0 0 4px rgba(16,185,129,0.25), 0 0 24px rgba(16,185,129,0.4)"
            : "0 0 0 4px rgba(244,63,94,0.25), 0 0 24px rgba(244,63,94,0.4)"
          : "0 8px 32px -8px rgba(0,0,0,0.4)",
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <AnimatePresence mode="popLayout">
        {resolved ? (
          <motion.div
            key="check"
            className="absolute right-2 top-2 z-10"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "backOut" }}
          >
            <CheckCircle2 className="size-4 text-emerald-400" />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div
        className={cn(
          "pr-5 line-clamp-2 text-[11px] font-medium leading-tight",
          resolved
            ? "text-emerald-100"
            : rootAccent
              ? "text-rose-100"
              : "text-neutral-100",
          rootAccent && "text-[12px] font-semibold",
        )}
      >
        {title}
      </div>
      <div
        className={cn(
          "mt-1 line-clamp-1 text-[10px] tabular-nums",
          resolved ? "text-emerald-300" : "text-neutral-400",
        )}
      >
        {subtitle}
      </div>
    </motion.div>
  );
}
