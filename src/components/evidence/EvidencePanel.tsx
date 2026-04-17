"use client";

import { type ReactNode } from "react";
import {
  BookOpen,
  ChevronRight,
  CreditCard,
  Database,
  FileText,
  Hash,
  Landmark,
  type LucideIcon,
  Mail,
  Receipt,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LaneBadge } from "@/components/primitives/LaneBadge";
import { useAppState } from "@/state/AppStateContext";
import type { EvidenceChain, SourceType } from "@/data/types";

// 5d · Generic Evidence Panel. Auditor-grade drill-down for any agent action.
// Renders as a right-overlay inside MainBodySlot. Concrete instances (Bank Rec,
// Adv Adj, Rev Rec) wrap this and can inject extra slots via the `extraSlot`
// and `scheduleSlot` props.

const SOURCE_ICON: Record<SourceType, LucideIcon> = {
  "bank-feed": Landmark,
  gl: Database,
  "ap-subledger": BookOpen,
  "ar-subledger": BookOpen,
  "contract-pdf": FileText,
  email: Mail,
  crm: Users,
  "payment-processor": CreditCard,
  payroll: Wallet,
  "expense-tool": Receipt,
};

function fmtMoney(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

function fmtTimestamp(iso: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

type EvidencePanelProps = {
  evidence: EvidenceChain;
  /** Optional slot rendered above sources — used by rev-rec for the schedule. */
  scheduleSlot?: ReactNode;
  /** Optional extra slot rendered after the alternatives accordion. */
  extraSlot?: ReactNode;
  /**
   * Footer mode. `pending` → Confirm & post · Modify · Delegate · Reject.
   * `auto-posted` → Confirm · Override · Reverse.
   * Auto-detected from `evidence.summary.actionTaken` if omitted.
   */
  footerMode?: "pending" | "auto-posted";
};

// ---- Confidence gauge (inline SVG, no chart deps) --------------------

function ConfidenceGauge({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (clamped / 100) * circumference;
  const colorClass =
    clamped >= 95
      ? "stroke-lane-emerald-500"
      : clamped >= 80
      ? "stroke-lane-emerald-500"
      : clamped >= 60
      ? "stroke-lane-amber-500"
      : "stroke-lane-rose-500";

  return (
    <div className="relative inline-flex size-20 items-center justify-center">
      <svg className="size-20 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" className="fill-none stroke-neutral-200" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r="28"
          className={cn("fill-none transition-all", colorClass)}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[18px] font-bold tabular-nums text-neutral-900">
          {clamped}
        </span>
        <span className="text-[9px] font-medium uppercase tracking-wider text-neutral-500">
          conf
        </span>
      </div>
    </div>
  );
}

// ---- Main panel --------------------------------------------------------

export function EvidencePanel({
  evidence,
  scheduleSlot,
  extraSlot,
  footerMode,
}: EvidencePanelProps) {
  const { closePanel } = useAppState();

  const autoPosted =
    footerMode ??
    (evidence.output.glPostingTimestamp
      ? "auto-posted"
      : "pending");

  const policy = evidence.agentReasoning.policyCited;
  const breakdown = evidence.agentReasoning.confidenceBreakdown;
  const totalWeight = breakdown.reduce((sum, b) => sum + b.weight, 0) || 1;

  return (
    <aside className="absolute inset-y-0 right-0 z-10 flex w-[720px] flex-col border-l border-neutral-200 bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-neutral-200 px-6 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
              Evidence chain
            </span>
            <LaneBadge lane={evidence.summary.lane} size="sm" />
          </div>
          <h2 className="mt-1 text-[15px] font-semibold text-neutral-900">
            {evidence.summary.transactionIdentity}
          </h2>
          <p className="mt-0.5 text-[11.5px] text-neutral-600">
            {evidence.summary.actionTaken}
          </p>
          <div className="mt-1 flex items-center gap-2 text-[10px] text-neutral-500">
            <span>{evidence.agentName}</span>
            <span className="text-neutral-300">·</span>
            <span>{evidence.agentVersion}</span>
            <span className="text-neutral-300">·</span>
            <span>{fmtTimestamp(evidence.timestamp)}</span>
          </div>
        </div>
        <Button size="icon" variant="ghost" onClick={closePanel} aria-label="Close panel">
          <X className="size-4" />
        </Button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        {/* Confidence section */}
        <section>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            Confidence breakdown
          </div>
          <div className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-4">
            <ConfidenceGauge score={evidence.summary.confidenceScore} />
            <div className="flex-1 space-y-1.5">
              {breakdown.map((row, i) => {
                const pct = (row.weight / totalWeight) * 100;
                const earned = row.score / (row.weight || 1);
                const earnedColor =
                  earned >= 0.85
                    ? "bg-lane-emerald-500"
                    : earned >= 0.5
                    ? "bg-lane-amber-500"
                    : "bg-lane-rose-500";
                return (
                  <div key={`cb-${i}`} className="space-y-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="truncate text-neutral-700">
                        {row.signal}
                      </span>
                      <span className="tabular-nums text-neutral-500">
                        {row.score}/{row.weight}
                      </span>
                    </div>
                    <div
                      className="h-1.5 overflow-hidden rounded-full bg-neutral-100"
                      style={{ width: `${pct}%`, minWidth: "20%" }}
                    >
                      <div
                        className={cn("h-full", earnedColor)}
                        style={{ width: `${earned * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Schedule slot (rev-rec uses this) */}
        {scheduleSlot}

        {/* Sources */}
        <section>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            Sources gathered ({evidence.sourcesGathered.length})
          </div>
          <div className="grid grid-cols-2 gap-2">
            {evidence.sourcesGathered.map((src, i) => {
              const Icon = SOURCE_ICON[src.sourceType] ?? FileText;
              return (
                <div
                  key={`src-${i}`}
                  className="flex items-start gap-2 rounded-md border border-neutral-200 bg-white p-2.5"
                >
                  <span className="inline-flex size-7 shrink-0 items-center justify-center rounded bg-neutral-100 text-neutral-600">
                    <Icon className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="truncate text-[11.5px] font-semibold text-neutral-800">
                        {src.sourceLabel}
                      </span>
                    </div>
                    <p className="text-[11px] leading-snug text-neutral-600">
                      {src.detail}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1 text-[10px] text-neutral-400">
                      <span>{fmtTimestamp(src.extractedAt)}</span>
                      <span>·</span>
                      <span className="capitalize">
                        {src.confidenceContribution} contribution
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Policy cited */}
        <section>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            Policy cited
          </div>
          {policy ? (
            <div className="rounded-md border border-neutral-200 bg-white p-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded bg-lane-violet-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-lane-violet-800 ring-1 ring-inset ring-lane-violet-200">
                  {policy.id}
                </span>
                <ShieldCheck className="size-3 text-lane-violet-600" />
              </div>
              <p className="mt-1.5 text-[11.5px] italic leading-relaxed text-neutral-700">
                &ldquo;{policy.summary}&rdquo;
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-lane-rose-300 bg-lane-rose-50/30 p-3 text-[11.5px] text-lane-rose-800">
              No policy cited · policy gap detected.
            </div>
          )}
        </section>

        {/* Evidence chain flow diagram */}
        <section>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            Evidence chain
          </div>
          <div className="flex items-stretch gap-1 rounded-md border border-neutral-200 bg-white p-3">
            <ChainNode
              label="Source"
              detail={evidence.sourcesGathered[0]?.sourceLabel ?? "—"}
            />
            <ChainArrow />
            <ChainNode
              label="Normalization"
              detail={evidence.normalizationApplied[0]?.rule ?? "(none)"}
            />
            <ChainArrow />
            <ChainNode
              label="Matching"
              detail={`${evidence.summary.confidenceScore}% confidence`}
            />
            <ChainArrow />
            <ChainNode
              label="Policy"
              detail={policy?.id ?? "gap"}
              variant={policy ? "default" : "warn"}
            />
            <ChainArrow />
            <ChainNode
              label="Output"
              detail={
                evidence.output.journalEntries.length > 0
                  ? "GL entry posted"
                  : "no entry"
              }
              variant={
                evidence.output.journalEntries.length > 0 ? "success" : "muted"
              }
            />
          </div>
        </section>

        {/* Alternatives considered */}
        <section>
          <details className="group rounded-md border border-neutral-200 bg-white">
            <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
              <span>
                Alternatives considered ({evidence.agentReasoning.alternativesConsidered.length})
              </span>
              <ChevronRight className="size-3.5 transition-transform group-open:rotate-90" />
            </summary>
            <div className="space-y-1.5 border-t border-neutral-200 p-3">
              {evidence.agentReasoning.alternativesConsidered.length === 0 ? (
                <p className="text-[11px] italic text-neutral-500">
                  No alternatives recorded.
                </p>
              ) : (
                evidence.agentReasoning.alternativesConsidered.map((alt, i) => (
                  <div
                    key={`alt-${i}`}
                    className="rounded bg-neutral-50 p-2.5 text-[11.5px]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-neutral-800">
                        {alt.option}
                      </span>
                      <span className="shrink-0 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-neutral-700 ring-1 ring-inset ring-neutral-200">
                        {alt.confidence}%
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-neutral-600">
                      Rejected · {alt.rejected}
                    </p>
                  </div>
                ))
              )}
            </div>
          </details>
        </section>

        {/* Exception triggers */}
        <section>
          <details className="group rounded-md border border-neutral-200 bg-white">
            <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
              <span>
                Exception triggers evaluated ({evidence.agentReasoning.exceptionTriggersEvaluated.length})
              </span>
              <ChevronRight className="size-3.5 transition-transform group-open:rotate-90" />
            </summary>
            <div className="space-y-1 border-t border-neutral-200 p-3">
              {evidence.agentReasoning.exceptionTriggersEvaluated.map((t, i) => (
                <div
                  key={`trg-${i}`}
                  className="flex items-center justify-between rounded px-2 py-1 text-[11.5px]"
                >
                  <span className="text-neutral-700">{t.trigger}</span>
                  <span
                    className={cn(
                      "inline-flex h-5 items-center gap-1 rounded-full px-1.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset",
                      t.triggered
                        ? "bg-lane-rose-50 text-lane-rose-800 ring-lane-rose-200"
                        : "bg-lane-emerald-50 text-lane-emerald-800 ring-lane-emerald-200",
                    )}
                  >
                    {t.triggered ? "Triggered" : "Clear"}
                  </span>
                </div>
              ))}
            </div>
          </details>
        </section>

        {/* Extra slot */}
        {extraSlot}

        {/* Output journal entries */}
        <section>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            Output · journal entries
          </div>
          {evidence.output.journalEntries.length === 0 ? (
            <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 p-3 text-[11.5px] text-neutral-600">
              No journal entry posted.
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border border-neutral-200 bg-white">
              <div className="grid grid-cols-[1fr_90px_90px] border-b border-neutral-200 bg-neutral-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                <span>Account</span>
                <span className="text-right">Debit</span>
                <span className="text-right">Credit</span>
              </div>
              {evidence.output.journalEntries.map((e, i) => (
                <div
                  key={`je-${i}`}
                  className="grid grid-cols-[1fr_90px_90px] border-b border-neutral-100 px-3 py-2 text-[11.5px] last:border-0"
                >
                  <span className="text-neutral-800">{e.account}</span>
                  <span className="text-right tabular-nums text-neutral-900">
                    {e.debit ? fmtMoney(e.amount) : ""}
                  </span>
                  <span className="text-right tabular-nums text-neutral-900">
                    {!e.debit ? fmtMoney(e.amount) : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Immutable hash */}
        <div className="flex items-center gap-1 pt-1 text-[10px] text-neutral-400">
          <Hash className="size-3" />
          <span>Evidence hash · {evidence.immutableHash}</span>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-2 border-t border-neutral-200 bg-white px-6 py-3">
        {autoPosted === "auto-posted" ? (
          <>
            <Button size="sm" className="h-8 px-3 text-[11px]">
              Confirm
            </Button>
            <Button size="sm" variant="outline" className="h-8 px-3 text-[11px]">
              Override
            </Button>
            <Button size="sm" variant="outline" className="h-8 px-3 text-[11px]">
              Reverse
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" className="h-8 px-3 text-[11px]">
              Confirm &amp; post
            </Button>
            <Button size="sm" variant="outline" className="h-8 px-3 text-[11px]">
              Modify
            </Button>
            <Button size="sm" variant="outline" className="h-8 px-3 text-[11px]">
              Delegate
            </Button>
            <Button size="sm" variant="ghost" className="h-8 px-3 text-[11px]">
              Reject
            </Button>
          </>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={closePanel}
          className="ml-auto h-8 px-3 text-[11px] text-neutral-600"
        >
          Close
        </Button>
      </div>
    </aside>
  );
}

// ---- Chain diagram pieces ------------------------------------------------

function ChainNode({
  label,
  detail,
  variant = "default",
}: {
  label: string;
  detail: string;
  variant?: "default" | "success" | "warn" | "muted";
}) {
  const palette: Record<typeof variant, string> = {
    default: "border-neutral-200 bg-neutral-50 text-neutral-800",
    success: "border-lane-emerald-200 bg-lane-emerald-50 text-lane-emerald-800",
    warn: "border-lane-amber-200 bg-lane-amber-50 text-lane-amber-800",
    muted: "border-neutral-200 bg-neutral-50 text-neutral-500",
  };
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col rounded border px-2 py-1.5",
        palette[variant],
      )}
    >
      <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-500">
        {label}
      </span>
      <span className="truncate text-[11px] font-medium">{detail}</span>
    </div>
  );
}

function ChainArrow() {
  return (
    <span className="flex shrink-0 items-center text-neutral-300">
      <ChevronRight className="size-3.5" />
    </span>
  );
}
