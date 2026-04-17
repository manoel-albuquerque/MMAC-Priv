"use client";

import type { PreviewProps } from "./registry";

// 5b · Advanced adjustment preview for the shared-counterparty case.
// Shows the detected condition and surfaces two side-by-side options:
//   (a) one-off handling for this instance
//   (b) promote to a policy rule
// Each option carries a mini-preview of the resulting journal entries so the
// controller can see the impact before committing.

function fmtMoney(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

export function AdvancedAdjustmentPreview({ item, evidenceChain }: PreviewProps) {
  const entries = evidenceChain?.output.journalEntries ?? [];
  const counterparty = item.counterparty ?? "counterparty";

  return (
    <div className="space-y-3">
      {/* Detected condition */}
      <div className="rounded-md border border-neutral-200 bg-white p-3">
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          Detected condition
        </div>
        <p className="text-[11.5px] leading-relaxed text-neutral-700">
          <span className="font-semibold text-neutral-900">{counterparty}</span>{" "}
          appears on both sides of the ledger — open AR balance and received
          refund of {item.amount ? fmtMoney(item.amount) : "the same amount"}.
          No policy rule governs netting of shared counterparties.
        </p>
      </div>

      {/* Two side-by-side paths */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-md border border-neutral-200 bg-white p-3">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            Handle manually
          </div>
          <p className="mb-2 text-[11px] text-neutral-600">
            One-off netting for this instance only.
          </p>
          <div className="space-y-1">
            {entries.length === 0 ? (
              <div className="text-[11px] text-neutral-400">
                (entry would net AP and AR for this counterparty)
              </div>
            ) : (
              entries.map((e, i) => (
                <div
                  key={`manual-${i}`}
                  className="flex items-center justify-between rounded bg-neutral-50 px-2 py-1 text-[11px]"
                >
                  <span className="truncate font-medium text-neutral-700">
                    {e.debit ? "Dr" : "Cr"} · {e.account}
                  </span>
                  <span className="tabular-nums text-neutral-900">
                    {fmtMoney(e.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-md border border-lane-violet-200 bg-lane-violet-50/30 p-3">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-lane-violet-700">
            Create policy rule
          </div>
          <p className="mb-2 text-[11px] text-neutral-700">
            Auto-net whenever a counterparty has both AP and AR open.
          </p>
          <div className="space-y-1">
            {entries.length === 0 ? (
              <div className="text-[11px] text-neutral-400">
                (future instances auto-execute)
              </div>
            ) : (
              entries.map((e, i) => (
                <div
                  key={`policy-${i}`}
                  className="flex items-center justify-between rounded bg-white px-2 py-1 text-[11px]"
                >
                  <span className="truncate font-medium text-neutral-700">
                    {e.debit ? "Dr" : "Cr"} · {e.account}
                  </span>
                  <span className="tabular-nums text-neutral-900">
                    {fmtMoney(e.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="mt-2 text-[10px] text-lane-violet-700">
            + applies to all future shared-counterparty cases
          </div>
        </div>
      </div>
    </div>
  );
}
