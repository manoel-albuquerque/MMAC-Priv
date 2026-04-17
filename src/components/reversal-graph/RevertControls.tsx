"use client";

import { AlertTriangle, Clock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReversalGraph } from "@/data/types";

function formatDelta(amount: number): string {
  const sign = amount >= 0 ? "+" : "-";
  const abs = Math.abs(amount).toLocaleString();
  return `${sign}$${abs}`;
}

type RevertControlsProps = {
  graph: ReversalGraph;
  selectedIds: Set<string>;
  onExecute: () => void;
};

export function RevertControls({
  graph,
  selectedIds,
  onExecute,
}: RevertControlsProps) {
  const totalDownstream = graph.downstreamNodes.length;
  const uncheckedNodes = graph.downstreamNodes.filter(
    (n) => !selectedIds.has(n.id),
  );

  const byAccountText = graph.netGlImpactOnRevert.byAccount
    .map((entry) => `${formatDelta(entry.amount)} to ${entry.account}`)
    .join(" · ");

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2">
        <Button
          size="lg"
          className="h-auto w-full justify-start bg-emerald-600 px-4 py-3 text-left text-white hover:bg-emerald-700"
          onClick={onExecute}
        >
          <RotateCcw className="size-4" />
          <span className="flex flex-col items-start leading-tight">
            <span className="text-sm font-semibold">Surgical Revert</span>
            <span className="text-[11px] font-normal opacity-90">
              Unwind this transaction and {totalDownstream} downstream effects
            </span>
          </span>
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="h-auto w-full justify-start px-4 py-3 text-left"
        >
          <Clock className="size-4" />
          <span className="flex flex-col items-start leading-tight">
            <span className="text-sm font-semibold">Temporal Revert</span>
            <span className="text-[11px] font-normal text-neutral-600">
              Rewind book state to April 8
            </span>
          </span>
        </Button>
      </div>

      <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-700">
        <div className="font-semibold text-neutral-900">
          Net GL impact on revert
        </div>
        <div className="mt-1 tabular-nums">{byAccountText}</div>
        <div className="mt-1 text-[11px] text-neutral-500">
          Total magnitude: $
          {graph.netGlImpactOnRevert.totalMagnitude.toLocaleString()}
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-md border border-neutral-200 bg-white p-2 text-[11px] text-neutral-600">
        <input
          type="checkbox"
          defaultChecked={false}
          className="mt-0.5 size-3.5 accent-neutral-500"
          id="unanchored-toggle"
        />
        <label htmlFor="unanchored-toggle" className="leading-snug">
          Include unchecked nodes as &quot;unanchored&quot; — informational
          flag for downstream nodes left posted.
        </label>
      </div>

      {uncheckedNodes.length > 0 ? (
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-900">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
          <div>
            <span className="font-semibold">
              {uncheckedNodes.length} node
              {uncheckedNodes.length === 1 ? "" : "s"} unselected.
            </span>{" "}
            If unselected, this node remains posted and may orphan the
            parent&apos;s reversal.
          </div>
        </div>
      ) : null}

      <Button
        size="lg"
        className="w-full bg-rose-600 py-6 text-base font-semibold text-white hover:bg-rose-700"
        onClick={onExecute}
      >
        Execute Surgical Revert
      </Button>
    </div>
  );
}
