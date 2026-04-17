"use client";

import { ChevronRight } from "lucide-react";
import type { PolicyAccuracy } from "@/data/policy-accuracy";

type ImpactSimulatorProps = {
  accuracy: PolicyAccuracy;
};

const formatCurrency = (amount: number) =>
  `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

// Impact preview card + expandable example items list. Uses native <details>
// so we don't take a shadcn accordion dep.
export function ImpactSimulator({ accuracy }: ImpactSimulatorProps) {
  const { suggestedChange, segments } = accuracy;

  // Pick the segment that maps to the suggested change. For the Rev Rec demo
  // this is the single-obligation segment (first non-multi). Fallback: first segment.
  const targetSegment =
    segments.find((s) => /single|known|above|match/i.test(s.label)) ??
    segments[0];

  return (
    <section className="space-y-3">
      <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
          If this policy had been in effect this period
        </p>
        <p className="mt-2 text-sm leading-relaxed text-neutral-700">
          <span className="text-2xl font-semibold tabular-nums text-neutral-900">
            {suggestedChange.simulatedAutoPostCount}
          </span>{" "}
          of{" "}
          <span className="font-semibold tabular-nums text-neutral-900">
            {targetSegment.processed}
          </span>{" "}
          items would have auto-posted
          <span className="text-neutral-500">
            {" "}
            ({formatCurrency(suggestedChange.simulatedAutoPostTotal)})
          </span>
          .
        </p>
      </div>

      {suggestedChange.exampleItems.length > 0 && (
        <details className="group rounded-md border border-neutral-200 bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-2.5 text-[12px] font-medium text-neutral-700 hover:bg-neutral-50">
            <span>
              Preview {suggestedChange.exampleItems.length} example item
              {suggestedChange.exampleItems.length === 1 ? "" : "s"}
            </span>
            <ChevronRight className="size-4 text-neutral-400 transition-transform group-open:rotate-90" />
          </summary>
          <ul className="divide-y divide-neutral-100 border-t border-neutral-200">
            {suggestedChange.exampleItems.map((item, i) => (
              <li
                key={`${item.description}-${i}`}
                className="flex items-center justify-between gap-4 px-4 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-neutral-900">
                    {item.description}
                  </p>
                  {item.counterparty ? (
                    <p className="mt-0.5 truncate text-[12px] text-neutral-500">
                      {item.counterparty}
                    </p>
                  ) : null}
                </div>
                <span className="shrink-0 text-sm font-medium tabular-nums text-neutral-900">
                  {formatCurrency(item.amount)}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
