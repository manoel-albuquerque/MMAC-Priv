"use client";

import { format, parseISO } from "date-fns";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarClock,
  Search,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CONNECTOR_META } from "@/lib/connector-meta";
import type {
  ActivityEntry,
  AmortizationSchedule,
  MatchRecord,
  PendingAction,
  PostedAction,
  TransactionDetail,
} from "@/data/types";

// Expanded detail surface rendered inside ActivityRow when clicked.
// State-driven: matched / categorized / needs-help. Capped height — layout
// budget is fixed, no "show more" affordance.

const POSTED_LABEL: Record<PostedAction, string> = {
  unmatch: "Unmatch",
  recategorize: "Re-categorize",
  revert: "Revert",
  split: "Split",
  exclude: "Exclude",
};

const PENDING_LABEL: Record<PendingAction, string> = {
  confirm: "Confirm",
  override: "Override",
  "change-to-categorize": "Categorize instead",
  "change-to-match": "Match instead",
  delegate: "Delegate",
};

function formatAmount(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

function formatDate(iso: string): string {
  try {
    return format(parseISO(iso), "MMM d, yyyy");
  } catch {
    return iso;
  }
}

function MatchCard({
  record,
  highlighted,
}: {
  record: MatchRecord;
  highlighted?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-white px-3 py-2.5",
        highlighted
          ? "border-lane-emerald-300 ring-1 ring-lane-emerald-200"
          : "border-neutral-200",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-neutral-900">
              {record.recordLabel}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-neutral-400">
              {record.kind}
            </span>
          </div>
          <span className="text-[11px] text-neutral-600">
            {record.counterparty} · {formatDate(record.date)}
          </span>
          {record.note ? (
            <span className="mt-0.5 text-[11px] text-neutral-500">
              {record.note}
            </span>
          ) : null}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[12px] font-semibold tabular-nums text-neutral-900">
            {formatAmount(record.amount)}
          </span>
          {record.openBalance != null ? (
            <span className="text-[10px] text-neutral-500">
              {record.openBalance === 0
                ? "Cleared"
                : `${formatAmount(record.openBalance)} open`}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function EvidenceList({
  signals,
}: {
  signals: TransactionDetail["evidence"];
}) {
  return (
    <ul className="space-y-1.5">
      {signals.map((s, idx) => {
        const meta = s.connector ? CONNECTOR_META[s.connector] : null;
        const Icon = meta?.icon ?? Sparkles;
        return (
          <li
            key={idx}
            className="flex items-start gap-2 rounded-md bg-white px-2.5 py-1.5 text-[11.5px] ring-1 ring-neutral-200"
          >
            <span
              className={cn(
                "mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-md",
                meta
                  ? "bg-lane-sky-50 text-lane-sky-700 ring-1 ring-inset ring-lane-sky-200"
                  : "text-neutral-400",
              )}
            >
              <Icon className="size-3" />
            </span>
            <div className="flex min-w-0 flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-neutral-800">
                  {s.label}
                </span>
                {meta ? (
                  <span className="rounded bg-neutral-100 px-1.5 py-0 text-[10px] font-medium text-neutral-600">
                    {meta.label}
                  </span>
                ) : null}
              </div>
              <span className="text-[11.5px] text-neutral-600">{s.detail}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function CategorizationCard({
  categorization,
}: {
  categorization: NonNullable<TransactionDetail["categorization"]>;
}) {
  // Renders the posting as a journal-entry table: Account / DR / CR with
  // per-line coding (Department, Project, Location, Cost Center, Segment,
  // Revenue Stream). When a categorization predates the JE-split model and
  // has no `splits` array, falls back to a single-account summary.
  const splits = categorization.splits ?? [];
  const hasSplits = splits.length > 0;

  const totalDr = splits
    .filter((s) => s.side === "DR")
    .reduce((sum, s) => sum + s.amount, 0);
  const totalCr = splits
    .filter((s) => s.side === "CR")
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      {hasSplits ? (
        <div>
          {/* Column header */}
          <div className="grid grid-cols-[1fr_80px_80px] items-center gap-3 border-b border-neutral-100 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            <span>Account</span>
            <span className="text-right">DR</span>
            <span className="text-right">CR</span>
          </div>

          <ul>
            {splits.map((split, idx) => (
              <li
                key={`${split.account}-${idx}`}
                className={cn(
                  "grid grid-cols-[1fr_80px_80px] items-start gap-3 px-3 py-2",
                  idx !== splits.length - 1 && "border-b border-neutral-100",
                )}
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[12px] font-semibold text-neutral-900">
                    {split.account}
                  </span>
                  {split.basis ? (
                    <span className="text-[10.5px] text-neutral-500">
                      {split.basis}
                    </span>
                  ) : null}
                  <SplitCoding split={split} />
                </div>
                <span className="text-right text-[12px] font-semibold tabular-nums text-neutral-900">
                  {split.side === "DR"
                    ? `$${split.amount.toLocaleString("en-US")}`
                    : ""}
                </span>
                <span className="text-right text-[12px] font-semibold tabular-nums text-neutral-900">
                  {split.side === "CR"
                    ? `$${split.amount.toLocaleString("en-US")}`
                    : ""}
                </span>
              </li>
            ))}
          </ul>

          {/* Totals row */}
          <div className="grid grid-cols-[1fr_80px_80px] items-center gap-3 border-t border-neutral-200 bg-neutral-50 px-3 py-1.5 text-[11px] font-semibold">
            <span className="uppercase tracking-wider text-neutral-500">
              Totals
            </span>
            <span className="text-right tabular-nums text-neutral-900">
              ${totalDr.toLocaleString("en-US")}
            </span>
            <span className="text-right tabular-nums text-neutral-900">
              ${totalCr.toLocaleString("en-US")}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-baseline justify-between gap-2 px-3 py-2.5">
          <span className="text-[12px] font-semibold text-neutral-900">
            {categorization.account}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-neutral-400">
            Account
          </span>
        </div>
      )}

      {categorization.memo ? (
        <div className="border-t border-neutral-100 px-3 py-1.5">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400">
            Memo
          </span>
          <p className="text-[11.5px] text-neutral-600">
            {categorization.memo}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function SplitCoding({
  split,
}: {
  split: NonNullable<TransactionDetail["categorization"]>["splits"] extends
    | Array<infer T>
    | undefined
    ? T
    : never;
}) {
  const chips: Array<{ label: string; value: string }> = [];
  if (split.department) chips.push({ label: "Dept", value: split.department });
  if (split.project) chips.push({ label: "Project", value: split.project });
  if (split.location) chips.push({ label: "Loc", value: split.location });
  const dims = split.dimensions ?? {};
  if (dims.costCenter)
    chips.push({ label: "Cost Ctr", value: dims.costCenter });
  if (dims.segment) chips.push({ label: "Segment", value: dims.segment });
  if (dims.revenueStream)
    chips.push({ label: "Stream", value: dims.revenueStream });

  if (chips.length === 0) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {chips.map((c, idx) => (
        <span
          key={`${c.label}-${idx}`}
          className="inline-flex items-center gap-1 rounded bg-neutral-100 px-1.5 py-0 text-[10px] text-neutral-700"
        >
          <span className="text-neutral-400">{c.label}</span>
          <span className="font-medium">{c.value}</span>
        </span>
      ))}
    </div>
  );
}

function ScheduleCard({ schedule }: { schedule: AmortizationSchedule }) {
  const nextLabel = schedule.nextRunDate
    ? format(parseISO(schedule.nextRunDate), "MMM d, yyyy")
    : null;
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2.5">
      <div className="flex min-w-0 items-start gap-2.5">
        <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-lane-sky-50 text-lane-sky-700 ring-1 ring-inset ring-lane-sky-200">
          <CalendarClock className="size-3.5" />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[12px] font-semibold text-neutral-900">
            Schedule built · auto-posts going forward
          </span>
          <span className="text-[11px] text-neutral-600">
            {schedule.term}
          </span>
          <span className="text-[10.5px] text-neutral-500">
            ${schedule.perPeriod.toLocaleString("en-US")} / period ·{" "}
            {schedule.monthsRecognized} recognized ·{" "}
            {schedule.monthsRemaining} remaining
            {nextLabel ? ` · next ${nextLabel}` : ""}
          </span>
        </div>
      </div>
      <button
        type="button"
        className="shrink-0 text-[11px] font-medium text-neutral-600 hover:text-neutral-900"
      >
        View schedule →
      </button>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
      {children}
    </div>
  );
}

export function ActivityRowExpanded({ entry }: { entry: ActivityEntry }) {
  const detail = entry.transactionDetail;
  if (!detail) return null;

  const isPosted =
    entry.outcome === "auto-posted" ||
    entry.outcome === "controller-confirmed";
  const actions = isPosted ? detail.postedActions : detail.pendingActions;

  return (
    <div className="space-y-3 border-t border-neutral-200 bg-neutral-50 px-5 py-4">
      {/* Summary line with money-direction re-emphasis */}
      <div className="flex items-start gap-2">
        {detail.nature !== "internal" ? (
          <span
            className={cn(
              "mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full",
              detail.nature === "money-in"
                ? "bg-lane-emerald-50 text-lane-emerald-700"
                : "bg-lane-rose-50 text-lane-rose-700",
            )}
          >
            {detail.nature === "money-in" ? (
              <ArrowDownLeft className="size-3" />
            ) : (
              <ArrowUpRight className="size-3" />
            )}
          </span>
        ) : null}
        <p className="text-[12.5px] leading-relaxed text-neutral-800">
          {detail.humanSummary}
        </p>
      </div>

      {/* State-specific body */}
      {detail.state === "matched" && detail.match ? (
        <>
          <div className="space-y-1.5">
            <SectionLabel>Matched to</SectionLabel>
            <MatchCard record={detail.match} highlighted />
          </div>

          {detail.matchAlternatives && detail.matchAlternatives.length > 0 ? (
            <div className="space-y-1.5">
              <SectionLabel>Other possible matches</SectionLabel>
              <div className="space-y-1.5">
                {detail.matchAlternatives.map((alt) => (
                  <MatchCard key={alt.recordId} record={alt} />
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <SectionLabel>Reasoning</SectionLabel>
            <EvidenceList signals={detail.evidence} />
          </div>
        </>
      ) : null}

      {detail.state === "categorized" && detail.categorization ? (
        <>
          <div className="space-y-1.5">
            <SectionLabel>Categorized as</SectionLabel>
            <CategorizationCard categorization={detail.categorization} />
          </div>
          {detail.categorization.schedule ? (
            <div className="space-y-1.5">
              <SectionLabel>Schedule</SectionLabel>
              <ScheduleCard schedule={detail.categorization.schedule} />
            </div>
          ) : null}
          <div className="space-y-1.5">
            <SectionLabel>Reasoning</SectionLabel>
            <EvidenceList signals={detail.evidence} />
          </div>
        </>
      ) : null}

      {detail.state === "needs-help" ? (
        <>
          {detail.match ? (
            <div className="space-y-1.5">
              <SectionLabel>Best guess</SectionLabel>
              <MatchCard record={detail.match} highlighted />
            </div>
          ) : null}
          {detail.matchAlternatives && detail.matchAlternatives.length > 0 ? (
            <div className="space-y-1.5">
              <SectionLabel>Other possibilities</SectionLabel>
              <div className="space-y-1.5">
                {detail.matchAlternatives.map((alt) => (
                  <MatchCard key={alt.recordId} record={alt} />
                ))}
              </div>
              <button
                type="button"
                className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-neutral-900"
              >
                <Search className="size-3" /> Find other matches
              </button>
            </div>
          ) : null}
          <div className="space-y-1.5">
            <SectionLabel>Reasoning</SectionLabel>
            <EvidenceList signals={detail.evidence} />
          </div>
        </>
      ) : null}

      {/* Action footer */}
      {actions.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-3">
          {actions.map((action, idx) => {
            const label = isPosted
              ? POSTED_LABEL[action as PostedAction]
              : PENDING_LABEL[action as PendingAction];
            const isPrimary = idx === 0;
            return (
              <Button
                key={action}
                size="sm"
                variant={isPrimary ? "default" : "outline"}
                className="h-7 px-3 text-[11px]"
              >
                {label}
              </Button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
