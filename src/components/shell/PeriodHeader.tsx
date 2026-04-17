"use client";

import { format, parseISO } from "date-fns";
import { useData } from "@/hooks/useData";

// Slim top bar: workspace context only. The heavy metrics have moved into
// the HeaderMetrics hero row at the top of the main body.
export function PeriodHeader() {
  const { period } = useData();
  const currentDate = parseISO(period.currentSimulatedDate);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between rounded-2xl border border-neutral-200 bg-white px-6 shadow-sm">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Period
          </span>
          <span className="text-sm font-semibold text-neutral-900">
            {period.period} · Close running since April 1
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Simulated clock
          </span>
          <span className="text-sm font-medium tabular-nums text-neutral-900">
            {format(currentDate, "MMM d, yyyy · h:mm a")}
          </span>
        </div>
      </div>
    </header>
  );
}
