"use client";

import type { PolicyAccuracy } from "@/data/policy-accuracy";
import { Sparkline } from "./Sparkline";

type AccuracyDashboardProps = {
  accuracy: PolicyAccuracy;
};

export function AccuracyDashboard({ accuracy }: AccuracyDashboardProps) {
  return (
    <section>
      <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
        Recent accuracy ·{" "}
        <span className="text-neutral-700">
          {accuracy.totalProcessedLastCycle} contracts processed last cycle
        </span>
      </h3>

      <div className="divide-y divide-neutral-200 rounded-md border border-neutral-200 bg-white">
        {accuracy.segments.map((seg) => (
          <div
            key={seg.label}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-900">
                {seg.label}
              </p>
              <p className="mt-0.5 text-[12px] tabular-nums text-neutral-500">
                {seg.accurate} / {seg.processed} accurate
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Sparkline values={accuracy.trendPercentByCycle} />
              <span className="text-2xl font-semibold tabular-nums text-neutral-900">
                {Math.round(seg.accuracyPercent)}
                <span className="text-sm font-medium text-neutral-500">%</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
