"use client";

import { useState } from "react";
import {
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronRight,
  FileText,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Rev Rec Schedule Component — the content-dense centerpiece.
// Used inline in the expanded queue row (tall, scrolls within boundary) and in
// the Rev Rec Evidence Panel (more breathing room). Purely presentational —
// the one seeded Beacon Aerospace contract is hard-coded. The spec calls
// this "the single component that will convince a senior stakeholder that the
// system does accounting, not data entry."

type Mode = "inline" | "panel";

type Props = {
  mode?: Mode;
  onApproveSchedule?: () => void;
  onApproveClassification?: () => void;
  onReject?: () => void;
  onViewEvidence?: () => void;
};

// ===== Hard-coded Beacon Aerospace contract data =====

const CONTRACT = {
  customer: "Beacon Aerospace",
  contractId: "MSA-45219",
  totalValue: 180_000,
  termMonths: 24,
  startDate: "2026-04-12",
  excerpt:
    "Customer agrees to a 24-month subscription to the Platform at $7,000 per month, commencing May 1, 2026. In addition, Provider will deliver a fixed-fee implementation engagement for $12,000, comprising discovery, configuration, and user training, to be completed within 90 days of contract execution.",
  highlightPhrase:
    "24-month subscription to the Platform at $7,000 per month · fixed-fee implementation engagement for $12,000",
};

const SOURCES = [
  {
    icon: FileText,
    label: "Contract PDF (email attachment)",
    detail: "Beacon Aerospace MSA · signed Apr 12 · full contract text",
  },
  {
    icon: Users,
    label: "CRM · Deal #45219",
    detail: "Closed-won Apr 12 · list ASP captured at signature",
  },
  {
    icon: BookOpen,
    label: "CRM · historical SSPs",
    detail: "$6.8K–$7.2K/mo range across 18 comparable 24-mo deals",
  },
];

const PERFORMANCE_OBLIGATIONS = [
  {
    label: "PO 1 · SaaS Subscription",
    pattern: "Ratable over 24 months",
    allocatedPrice: 168_000,
    ssp: "$7,000/mo · CRM historical",
    method: "Relative standalone selling prices",
    trigger: "Monthly on the 1st · subscription access confirmed active",
    confidence: 96,
  },
  {
    label: "PO 2 · Implementation Services",
    pattern: "Over 3-month implementation period",
    allocatedPrice: 12_000,
    ssp: "$12,000 flat · CRM historical",
    method: "Relative standalone selling prices",
    trigger: "Milestone completion · implementation project tracker",
    confidence: 92,
  },
];

// 24-month recognition table. Apr-Jun 2026 carry both subscription AND
// implementation; Jul 2026 onwards is subscription-only.
type ScheduleRow = {
  period: string;
  subscription: number;
  implementation: number;
  total: number;
  deferredEnd: number;
  status: "staged" | "not-yet-due" | "posted";
  isRampPhase: boolean;
};

function buildSchedule(): ScheduleRow[] {
  const rows: ScheduleRow[] = [];
  const months = [
    "Apr 2026", "May 2026", "Jun 2026", "Jul 2026", "Aug 2026", "Sep 2026",
    "Oct 2026", "Nov 2026", "Dec 2026", "Jan 2027", "Feb 2027", "Mar 2027",
    "Apr 2027", "May 2027", "Jun 2027", "Jul 2027", "Aug 2027", "Sep 2027",
    "Oct 2027", "Nov 2027", "Dec 2027", "Jan 2028", "Feb 2028", "Mar 2028",
  ];
  let deferredBalance = 180_000;
  months.forEach((period, idx) => {
    const isRamp = idx < 3;
    const subscription = 7_000;
    const implementation = isRamp ? 4_000 : 0;
    const total = subscription + implementation;
    deferredBalance -= total;
    rows.push({
      period,
      subscription,
      implementation,
      total,
      deferredEnd: deferredBalance,
      status: idx === 0 ? "staged" : "not-yet-due",
      isRampPhase: isRamp,
    });
  });
  return rows;
}

const SCHEDULE = buildSchedule();

const JOURNAL_ENTRIES = [
  {
    label: "Contract signing",
    date: "Apr 12, 2026",
    memo: "Beacon contract #45219 — full TCV recognized as deferred on signing",
    status: "staged" as const,
    lines: [
      { account: "AR — Beacon Aerospace", amount: 180_000, debit: true },
      { account: "Deferred Revenue", amount: 180_000, debit: false },
    ],
  },
  {
    label: "Months 1-3 (Apr, May, Jun 2026)",
    date: "monthly",
    memo: "[Month] recognition — PO 1 ratable + PO 2 milestone",
    status: "not-yet-due" as const,
    lines: [
      { account: "Deferred Revenue", amount: 11_000, debit: true },
      { account: "Subscription Revenue", amount: 7_000, debit: false },
      { account: "Implementation Revenue", amount: 4_000, debit: false },
    ],
  },
  {
    label: "Months 4-24 (Jul 2026 – Mar 2028)",
    date: "monthly",
    memo: "[Month] subscription recognition — PO 1 ratable",
    status: "not-yet-due" as const,
    lines: [
      { account: "Deferred Revenue", amount: 7_000, debit: true },
      { account: "Subscription Revenue", amount: 7_000, debit: false },
    ],
  },
];

// ===== Component =====

export function RevRecSchedule({
  mode = "inline",
  onApproveSchedule,
  onApproveClassification,
  onReject,
  onViewEvidence,
}: Props) {
  const [excerptOpen, setExcerptOpen] = useState(mode === "panel");

  return (
    <div className={cn("space-y-5", mode === "panel" ? "text-sm" : "text-[13px]")}>
      {/* ====== Contract Summary ====== */}
      <section className="rounded-md border border-neutral-200 bg-white p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
              Contract
            </div>
            <div className="mt-0.5 text-base font-semibold text-neutral-900">
              {CONTRACT.customer} · {CONTRACT.contractId}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-neutral-600">
              <span>
                <span className="font-medium tabular-nums text-neutral-900">
                  ${CONTRACT.totalValue.toLocaleString()}
                </span>{" "}
                TCV
              </span>
              <span>{CONTRACT.termMonths} months</span>
              <span>Start: {CONTRACT.startDate}</span>
              <span>2 performance obligations</span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {SOURCES.map((src) => {
            const Icon = src.icon;
            return (
              <span
                key={src.label}
                className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-[11px] text-neutral-700"
              >
                <Icon className="size-3 text-neutral-500" />
                <span className="font-medium">{src.label}</span>
                <span className="text-neutral-500">· {src.detail}</span>
              </span>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setExcerptOpen((v) => !v)}
          className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-neutral-500 hover:text-neutral-800"
        >
          {excerptOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
          Extracted contract excerpt
        </button>
        {excerptOpen ? (
          <blockquote className="mt-2 border-l-2 border-lane-sky-300 bg-lane-sky-50/40 px-3 py-2 text-[12px] italic text-neutral-700">
            {renderWithHighlight(CONTRACT.excerpt, CONTRACT.highlightPhrase)}
          </blockquote>
        ) : null}
      </section>

      {/* ====== Performance Obligations ====== */}
      <section>
        <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
          Performance obligations
        </div>
        <div className="grid grid-cols-2 gap-3">
          {PERFORMANCE_OBLIGATIONS.map((po) => (
            <div
              key={po.label}
              className="rounded-md border border-neutral-200 bg-white p-3"
            >
              <div className="flex items-center justify-between">
                <div className="text-[13px] font-semibold text-neutral-900">{po.label}</div>
                <span className="inline-flex items-center gap-1 rounded-full bg-lane-emerald-50 px-2 py-0.5 text-[10px] font-medium text-lane-emerald-800 ring-1 ring-inset ring-lane-emerald-200">
                  {po.confidence}% distinct PO
                </span>
              </div>
              <dl className="mt-2 space-y-1 text-[11px]">
                <POField label="Pattern" value={po.pattern} />
                <POField
                  label="Allocated"
                  value={`$${po.allocatedPrice.toLocaleString()}`}
                  emphasis
                />
                <POField label="SSP" value={po.ssp} />
                <POField label="Method" value={po.method} />
                <POField label="Trigger" value={po.trigger} />
              </dl>
            </div>
          ))}
        </div>
      </section>

      {/* ====== Recognition Schedule ====== */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Recognition schedule (24 months)
          </div>
          <div className="text-[11px] text-neutral-500">
            <Calendar className="mr-1 inline size-3" />
            First 3 months combine both obligations · months 4-24 are subscription only
          </div>
        </div>
        <div
          className={cn(
            "overflow-hidden rounded-md border border-neutral-200",
            mode === "inline" ? "max-h-[260px] overflow-y-auto" : "max-h-[420px] overflow-y-auto",
          )}
        >
          <table className="w-full text-[11px] tabular-nums">
            <thead className="sticky top-0 z-[1] bg-neutral-50 text-left text-[10px] font-medium uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-3 py-2">Period</th>
                <th className="px-3 py-2 text-right">Subscription</th>
                <th className="px-3 py-2 text-right">Implementation</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-3 py-2 text-right">Deferred EOP</th>
                <th className="px-3 py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {SCHEDULE.map((row, i) => (
                <tr
                  key={row.period}
                  className={cn(
                    "border-t border-neutral-100",
                    row.isRampPhase ? "bg-lane-sky-50/40" : "bg-white",
                    i === 3 ? "border-t-2 border-lane-sky-200" : "",
                  )}
                >
                  <td className="px-3 py-1.5 font-medium text-neutral-800">{row.period}</td>
                  <td className="px-3 py-1.5 text-right text-neutral-700">
                    ${row.subscription.toLocaleString()}
                  </td>
                  <td className="px-3 py-1.5 text-right text-neutral-700">
                    {row.implementation > 0 ? `$${row.implementation.toLocaleString()}` : <span className="text-neutral-300">—</span>}
                  </td>
                  <td className="px-3 py-1.5 text-right font-medium text-neutral-900">
                    ${row.total.toLocaleString()}
                  </td>
                  <td className="px-3 py-1.5 text-right text-neutral-600">
                    ${row.deferredEnd.toLocaleString()}
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    <StatusPill status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-neutral-300 bg-neutral-50 font-semibold text-neutral-900">
                <td className="px-3 py-2 text-[11px] uppercase tracking-wider">Totals</td>
                <td className="px-3 py-2 text-right">$168,000</td>
                <td className="px-3 py-2 text-right">$12,000</td>
                <td className="px-3 py-2 text-right">$180,000</td>
                <td className="px-3 py-2 text-right text-neutral-500">—</td>
                <td className="px-3 py-2" />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* ====== Proposed Journal Entries ====== */}
      <section>
        <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
          Proposed journal entries
        </div>
        <div className="space-y-2">
          {JOURNAL_ENTRIES.map((je) => (
            <div
              key={je.label}
              className="rounded-md border border-neutral-200 bg-white p-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-semibold text-neutral-900">{je.label}</div>
                  <div className="text-[11px] text-neutral-500">
                    {je.date} · {je.memo}
                  </div>
                </div>
                <StatusPill status={je.status} />
              </div>
              <table className="mt-2 w-full text-[11px] tabular-nums">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-neutral-400">
                    <th className="py-1 text-left font-medium">Account</th>
                    <th className="py-1 text-right font-medium">Dr</th>
                    <th className="py-1 text-right font-medium">Cr</th>
                  </tr>
                </thead>
                <tbody>
                  {je.lines.map((line, i) => (
                    <tr key={i} className="border-t border-neutral-100">
                      <td className="py-1 text-neutral-800">{line.account}</td>
                      <td className="py-1 text-right text-neutral-700">
                        {line.debit ? `$${line.amount.toLocaleString()}` : ""}
                      </td>
                      <td className="py-1 text-right text-neutral-700">
                        {!line.debit ? `$${line.amount.toLocaleString()}` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>

      {/* ====== Inline Controls ====== */}
      <section className="flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-4">
        <Button
          size="sm"
          className="bg-lane-emerald-600 text-white hover:bg-lane-emerald-700"
          onClick={onApproveSchedule}
        >
          <TrendingUp className="mr-1.5 size-3.5" />
          Approve entire schedule & post first entry
        </Button>
        <Button size="sm" variant="outline" onClick={onApproveClassification}>
          Approve classification · modify schedule
        </Button>
        <Button size="sm" variant="ghost" onClick={onReject}>
          Reject · route to manual
        </Button>
        {onViewEvidence ? (
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto text-neutral-700"
            onClick={onViewEvidence}
          >
            View full evidence
            <ChevronRight className="ml-0.5 size-3.5" />
          </Button>
        ) : null}
      </section>
    </div>
  );
}

// ===== Bits =====

function POField({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">
        {label}
      </dt>
      <dd
        className={cn(
          "text-right",
          emphasis ? "text-[13px] font-semibold text-neutral-900 tabular-nums" : "text-neutral-700",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function StatusPill({ status }: { status: "staged" | "not-yet-due" | "posted" }) {
  const styles: Record<typeof status, string> = {
    staged:
      "bg-lane-amber-50 text-lane-amber-800 ring-1 ring-inset ring-lane-amber-200",
    "not-yet-due":
      "bg-neutral-100 text-neutral-600 ring-1 ring-inset ring-neutral-200",
    posted:
      "bg-lane-emerald-50 text-lane-emerald-800 ring-1 ring-inset ring-lane-emerald-200",
  };
  const label: Record<typeof status, string> = {
    staged: "Staged · awaiting approval",
    "not-yet-due": "Not yet due",
    posted: "Posted",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
        styles[status],
      )}
    >
      {label[status]}
    </span>
  );
}

function renderWithHighlight(text: string, phrase: string) {
  // Highlights the exact trigger sentence in the extracted excerpt.
  const idx = text.toLowerCase().indexOf(phrase.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-lane-amber-100 not-italic text-neutral-900">
        {text.slice(idx, idx + phrase.length)}
      </mark>
      {text.slice(idx + phrase.length)}
    </>
  );
}
