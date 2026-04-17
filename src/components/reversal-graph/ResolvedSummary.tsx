"use client";

import { CheckCircle2, Fingerprint } from "lucide-react";

type ResolvedSummaryProps = {
  reversedCount: number;
  reclassifiedCount: number;
  durationSeconds: number;
  auditHash: string;
};

export function ResolvedSummary({
  reversedCount,
  reclassifiedCount,
  durationSeconds,
  auditHash,
}: ResolvedSummaryProps) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-emerald-600 p-2 text-white">
          <CheckCircle2 className="size-5" />
        </div>
        <div className="flex-1">
          <div className="text-base font-semibold text-emerald-900">
            {reversedCount} entries reversed · {reclassifiedCount} reclassified ·
            Resolved in {durationSeconds} seconds
          </div>
          <div className="mt-1 text-xs text-emerald-800">
            Full audit trail generated — original error, detection signals,
            resolution chain.
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-white px-2 py-1 text-[11px] font-mono text-emerald-900">
            <Fingerprint className="size-3" />
            <span>Hash: {auditHash}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
