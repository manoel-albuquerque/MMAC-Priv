"use client";

import { Eye, Zap, type LucideIcon } from "lucide-react";
import type { ReversalGraph } from "@/data/types";

const SIGNAL_ICONS: LucideIcon[] = [Zap, Eye];

type DetectionSignalsProps = {
  signals: ReversalGraph["detectionSignals"];
};

export function DetectionSignals({ signals }: DetectionSignalsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {signals.map((signal, idx) => {
        const Icon = SIGNAL_ICONS[idx % SIGNAL_ICONS.length];
        return (
          <div
            key={signal.agentName}
            className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
              <Icon className="size-3 text-rose-500" />
              <span>{signal.agentName}</span>
            </div>
            <div className="mt-1 text-[13px] font-medium leading-snug text-neutral-900">
              {signal.signal}
            </div>
            <div className="mt-1 text-xs leading-snug text-neutral-600">
              {signal.rationale}
            </div>
          </div>
        );
      })}
    </div>
  );
}
