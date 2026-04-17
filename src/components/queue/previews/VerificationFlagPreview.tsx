"use client";

import { AlertTriangle, RotateCcw, SearchCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/state/AppStateContext";
import type { PreviewProps } from "./registry";

// 5b · Verification-flag preview. Three-path resolution UI tailored to items
// where a second agent has contradicted an earlier action:
//   1. Revert (opens the reversal graph panel — rg-stellar-200k for demo)
//   2. Investigate further (opens the evidence panel)
//   3. Mark as reviewed and accepted
// The original decision and the contradicting signal sit side-by-side so the
// controller can weigh them at a glance.

export function VerificationFlagPreview({ item, evidenceChain }: PreviewProps) {
  const { openPanel, resolveItem } = useAppState();

  const originalDecision = evidenceChain?.summary.actionTaken ?? "Earlier agent action";
  const contradiction = item.investigationContext.exceptionRationale;

  return (
    <div className="space-y-3">
      {/* Side-by-side comparison */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-md border border-neutral-200 bg-white p-3">
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            <ShieldCheck className="size-3" /> Original decision
          </div>
          <p className="text-[11.5px] leading-relaxed text-neutral-700">
            {originalDecision}
          </p>
        </div>
        <div className="rounded-md border border-lane-rose-200 bg-lane-rose-50/40 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-lane-rose-700">
            <AlertTriangle className="size-3" /> Contradicting signal
          </div>
          <p className="text-[11.5px] leading-relaxed text-neutral-700">
            {contradiction}
          </p>
        </div>
      </div>

      {/* Resolution paths */}
      <div className="rounded-md border border-neutral-200 bg-white p-3">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          Resolution paths
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-auto flex-col items-start gap-0.5 px-2.5 py-2 text-left text-[11px]"
            onClick={() => openPanel({ type: "reversal", id: "rg-stellar-200k" })}
          >
            <span className="flex items-center gap-1 font-semibold">
              <RotateCcw className="size-3" /> Revert
            </span>
            <span className="text-[10px] font-normal text-neutral-500">
              Open reversal graph
            </span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-auto flex-col items-start gap-0.5 px-2.5 py-2 text-left text-[11px]"
            onClick={() =>
              item.evidenceRef
                ? openPanel({ type: "evidence", id: item.evidenceRef })
                : undefined
            }
          >
            <span className="flex items-center gap-1 font-semibold">
              <SearchCheck className="size-3" /> Investigate
            </span>
            <span className="text-[10px] font-normal text-neutral-500">
              Full evidence chain
            </span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-auto flex-col items-start gap-0.5 px-2.5 py-2 text-left text-[11px]"
            onClick={() => resolveItem(item.id, "mark-reviewed")}
          >
            <span className="flex items-center gap-1 font-semibold">
              <ShieldCheck className="size-3" /> Accept
            </span>
            <span className="text-[10px] font-normal text-neutral-500">
              Mark reviewed
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
