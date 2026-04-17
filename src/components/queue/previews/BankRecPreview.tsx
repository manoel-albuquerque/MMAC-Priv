"use client";

import { ArrowRight } from "lucide-react";
import type { PreviewProps } from "./registry";

// 5b · BankRec preview: shows the proposed journal entry as a double-entry
// Dr/Cr mini-ledger, followed by the three strongest supporting signals from
// the evidence chain (or investigation context fallback). No extra action
// buttons — the parent QueueRow owns the action footer.

function fmtMoney(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

export function BankRecPreview({ item, evidenceChain }: PreviewProps) {
  const entries = evidenceChain?.output.journalEntries ?? [];
  const debits = entries.filter((e) => e.debit);
  const credits = entries.filter((e) => !e.debit);

  return (
    <div className="space-y-3">
      {entries.length > 0 ? (
        <div className="rounded-md border border-neutral-200 bg-white p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            Proposed journal entry
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="space-y-1">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400">
                Debit
              </div>
              {debits.length === 0 ? (
                <div className="text-[11px] text-neutral-400">—</div>
              ) : (
                debits.map((e, i) => (
                  <div
                    key={`dr-${i}`}
                    className="flex items-center justify-between gap-2 rounded bg-neutral-50 px-2 py-1 text-[11.5px]"
                  >
                    <span className="truncate font-medium text-neutral-800">
                      {e.account}
                    </span>
                    <span className="tabular-nums text-neutral-900">
                      {fmtMoney(e.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
            <ArrowRight className="size-3 text-neutral-400" />
            <div className="space-y-1">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400">
                Credit
              </div>
              {credits.length === 0 ? (
                <div className="text-[11px] text-neutral-400">—</div>
              ) : (
                credits.map((e, i) => (
                  <div
                    key={`cr-${i}`}
                    className="flex items-center justify-between gap-2 rounded bg-neutral-50 px-2 py-1 text-[11.5px]"
                  >
                    <span className="truncate font-medium text-neutral-800">
                      {e.account}
                    </span>
                    <span className="tabular-nums text-neutral-900">
                      {fmtMoney(e.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-neutral-300 bg-white p-3 text-[11.5px] text-neutral-600">
          No proposed entry — manual review required.
          <div className="mt-1 text-[11px] text-neutral-500">
            {item.investigationContext.exceptionRationale}
          </div>
        </div>
      )}
    </div>
  );
}
