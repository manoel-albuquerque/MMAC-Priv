"use client";

import { AnimatePresence, motion } from "framer-motion";
import { formatDistanceToNow, parseISO } from "date-fns";
import {
  AlertTriangle,
  ChevronDown,
  CircleHelp,
  FileWarning,
  Gauge,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { useAppState } from "@/state/AppStateContext";
import { useData } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import type {
  ExceptionType,
  PendingQueueItem,
  ResolutionOption,
  RiskTier,
  WorkflowId,
} from "@/data/types";
import { getPreviewComponent } from "./previews/registry";
import { DelegatePopover, DelegatedAvatar } from "./DelegatePopover";
import { useUiFocus } from "@/hooks/useUiFocus";
import { CONNECTOR_META } from "@/lib/connector-meta";

// 5a + 5b: a single queue row. Renders collapsed by default (~72px) and
// smoothly expands in place when the user clicks. Animation via framer-motion
// `height: auto`; the layout prop keeps the outer list smooth during expand.

type QueueRowProps = {
  item: PendingQueueItem;
  expanded: boolean;
  onToggle: () => void;
};

// Icon + colour per exception type. Colours per spec §5a.
const EXCEPTION_ICON: Record<ExceptionType, ComponentType<{ className?: string }>> = {
  "below-confidence-threshold": Gauge,
  "no-policy-match": FileWarning,
  "material-flag": AlertTriangle,
  "controller-sign-off-required": ShieldAlert,
  "verification-flag": CircleHelp,
};

// Picks a colour token for the icon based on risk/exception per spec rules.
function iconColor(item: PendingQueueItem): string {
  if (item.riskTier === "material") return "text-lane-rose-600 bg-lane-rose-50 ring-lane-rose-200";
  if (item.exceptionType === "verification-flag")
    return "text-lane-rose-600 bg-lane-rose-50 ring-lane-rose-200";
  if (item.exceptionType === "no-policy-match")
    return "text-lane-violet-600 bg-lane-violet-50 ring-lane-violet-200";
  if (item.workflowId === "ap")
    return "text-lane-sky-600 bg-lane-sky-50 ring-lane-sky-200";
  return "text-lane-amber-700 bg-lane-amber-50 ring-lane-amber-200";
}

function RiskChip({ tier }: { tier: RiskTier }) {
  return (
    <span
      className={cn(
        "inline-flex h-[18px] items-center rounded-full px-1.5 text-[9px] font-semibold uppercase tracking-wider ring-1 ring-inset",
        tier === "material"
          ? "bg-lane-rose-50 text-lane-rose-800 ring-lane-rose-200"
          : "bg-neutral-100 text-neutral-700 ring-neutral-200",
      )}
    >
      {tier}
    </span>
  );
}

function UrgencyChip({ urgency }: { urgency: PendingQueueItem["urgency"] }) {
  if (urgency === "normal") return null;
  const cls =
    urgency === "high"
      ? "bg-lane-amber-50 text-lane-amber-800 ring-lane-amber-200"
      : "bg-neutral-100 text-neutral-700 ring-neutral-200";
  return (
    <span
      className={cn(
        "inline-flex h-[18px] items-center rounded-full px-1.5 text-[9px] font-semibold uppercase tracking-wider ring-1 ring-inset",
        cls,
      )}
    >
      {urgency}
    </span>
  );
}

function formatAmount(n?: number): string {
  if (n == null) return "";
  return `$${n.toLocaleString("en-US")}`;
}

function timeAgo(iso: string): string {
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: false });
  } catch {
    return iso;
  }
}

// Workflow id → display name. Kept tiny so we don't need to thread the whole
// workflow list through every row.
const WORKFLOW_NAMES: Record<WorkflowId, string> = {
  "connector-health": "Connector Health",
  "bank-rec": "Bank Rec",
  ar: "Accounts Receivable",
  ap: "Accounts Payable",
  "advanced-adjustments": "Advanced Adjustments",
  "rev-rec": "Rev Rec",
  "fixed-assets": "Fixed Assets",
  "prepaids-amortization": "Prepaids",
  allocations: "Allocations",
  "financial-statement-substantiation": "FSS",
  "flux-variance": "Flux & Variance",
};

const QUICK_ACTIONS: Array<{
  key: ResolutionOption;
  label: string;
  variant: "default" | "outline" | "ghost";
}> = [
  { key: "confirm", label: "Confirm", variant: "default" },
  { key: "override", label: "Override", variant: "outline" },
  { key: "delegate", label: "Delegate", variant: "ghost" },
];

export function QueueRow({ item, expanded, onToggle }: QueueRowProps) {
  const { resolveItem, openPanel, unassignDelegation } = useAppState();
  useUiFocus(expanded);
  const { evidenceChains } = useData();
  const Icon = EXCEPTION_ICON[item.exceptionType];
  const iconCls = iconColor(item);
  const chain = item.evidenceRef ? evidenceChains[item.evidenceRef] : undefined;
  const PreviewComponent = getPreviewComponent(item);

  const suggestionPreview = item.agentSuggestion
    ? `Suggested · ${item.agentSuggestion.action.split("·")[0].trim()} · ${item.agentSuggestion.confidenceScore}% confidence`
    : "No confident match — manual review";

  const topSignals = (chain?.sourcesGathered.slice(0, 3) ?? []).map((s) => ({
    source: s.sourceLabel,
    detail: s.detail,
    connector: undefined as
      | import("@/data/types").ConnectorId
      | undefined,
  }));
  const fallbackSignals = item.investigationContext.sourceDocuments
    .slice(0, 3)
    .map((s) => ({
      source: s.source,
      detail: s.detail,
      connector: s.connector,
    }));
  const signals = topSignals.length > 0 ? topSignals : fallbackSignals;

  const policy = chain?.agentReasoning.policyCited ?? null;

  const resolveSet = new Set(item.resolutionOptions);

  return (
    <motion.div
      layout
      className={cn(
        "group relative bg-white transition-colors",
        expanded ? "bg-white" : "hover:bg-neutral-50",
      )}
    >
      {/* Collapsed header row — acts as toggle. Uses div+role instead of
          <button> so interactive children (quick-action Buttons, LaneBadge with
          tooltip trigger) don't nest button elements. */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        className="flex w-full cursor-pointer items-start gap-3 px-5 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
        aria-expanded={expanded}
      >
        {/* Icon */}
        <span
          className={cn(
            "mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full ring-1 ring-inset",
            iconCls,
          )}
        >
          <Icon className="size-4" />
        </span>

        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex min-w-0 items-center gap-2">
            <span className="block min-w-0 flex-1 truncate text-[13px] font-semibold text-neutral-900">
              {item.title}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-500">
            <span className="font-medium text-neutral-700">
              {WORKFLOW_NAMES[item.workflowId]}
            </span>
            {item.counterparty ? (
              <>
                <span className="text-neutral-300">·</span>
                <span>{item.counterparty}</span>
              </>
            ) : null}
            <span className="text-neutral-300">·</span>
            <span>{timeAgo(item.timestamp)} ago</span>
            <span className="text-neutral-300">·</span>
            <RiskChip tier={item.riskTier} />
            {item.urgency !== "normal" ? <UrgencyChip urgency={item.urgency} /> : null}
          </div>

          {/* Agent suggestion preview line */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <Sparkles className="size-3 text-neutral-400" />
            <span
              className={cn(
                "truncate",
                item.agentSuggestion ? "text-neutral-700" : "text-neutral-500 italic",
              )}
            >
              {suggestionPreview}
            </span>
          </div>

          {/* Delegated indicator — replaces quick actions when assigned */}
          {item.delegatedTo ? (
            <div
              className="mt-1 flex items-center gap-1.5 text-[11px]"
              onClick={(e) => e.stopPropagation()}
            >
              <DelegatedAvatar teamMemberId={item.delegatedTo.teamMemberId} />
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="text-[11.5px] font-medium text-neutral-900">
                  Delegated to {item.delegatedTo.name}
                </span>
                <span className="text-[10px] text-neutral-500">
                  {item.delegatedTo.role} ·{" "}
                  {item.delegatedTo.status.replace("-", " ")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => unassignDelegation(item.id)}
                className="ml-auto rounded px-1.5 py-0.5 text-[10.5px] font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
              >
                Unassign
              </button>
            </div>
          ) : null}
        </div>

        {/* Quick-action cluster. Confirm/Override reveal on hover; Delegate
            is always visible so the popover trigger stays measurable while
            the menu is open (otherwise Radix snaps content to 0,0 when
            group-hover is lost on click). Hidden entirely once delegated. */}
        {!expanded && !item.delegatedTo ? (
          <div
            className="mr-1 flex shrink-0 items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="hidden items-center gap-1 group-hover:flex">
              {QUICK_ACTIONS.filter(
                (a) => resolveSet.has(a.key) && a.key !== "delegate",
              ).map((a) => (
                <Button
                  key={a.key}
                  size="sm"
                  variant={a.variant}
                  className="h-7 px-2 text-[11px]"
                  onClick={() => resolveItem(item.id, a.key)}
                >
                  {a.label}
                </Button>
              ))}
            </div>
            {resolveSet.has("delegate") ? (
              <DelegatePopover itemId={item.id}>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-[11px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  Delegate
                </Button>
              </DelegatePopover>
            ) : null}
          </div>
        ) : null}

        {/* Expand chevron */}
        <ChevronDown
          className={cn(
            "mt-1 size-4 shrink-0 text-neutral-400 transition-transform",
            expanded && "rotate-180",
          )}
        />
      </div>

      {/* Expanded panel — animated height */}
      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-neutral-200 bg-neutral-50 px-5 py-4">
              {/* Proposed action */}
              {item.agentSuggestion ? (
                <div>
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                    Proposed action
                  </div>
                  <p className="text-[12.5px] leading-relaxed text-neutral-800">
                    {item.agentSuggestion.action}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                    No proposed action
                  </div>
                  <p className="text-[12.5px] leading-relaxed text-neutral-700">
                    {item.investigationContext.exceptionRationale}
                  </p>
                </div>
              )}

              {/* Top signals */}
              {signals.length > 0 ? (
                <div>
                  <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                    Supporting signals
                  </div>
                  <ul className="space-y-1">
                    {signals.map((s, idx) => {
                      const meta = s.connector
                        ? CONNECTOR_META[s.connector]
                        : null;
                      const Icon = meta?.icon;
                      return (
                        <li
                          key={`${item.id}-signal-${idx}`}
                          className="flex items-start gap-2 rounded-md bg-white px-2.5 py-1.5 text-[11.5px] ring-1 ring-neutral-200"
                        >
                          {Icon ? (
                            <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-lane-sky-50 text-lane-sky-700 ring-1 ring-inset ring-lane-sky-200">
                              <Icon className="size-3" />
                            </span>
                          ) : (
                            <span className="mt-1 inline-block size-1 shrink-0 rounded-full bg-neutral-400" />
                          )}
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-neutral-800">
                                {s.source}
                              </span>
                              {meta ? (
                                <span className="rounded bg-neutral-100 px-1.5 py-0 text-[10px] font-medium text-neutral-600">
                                  {meta.label}
                                </span>
                              ) : null}
                            </div>
                            <span className="truncate text-neutral-600">
                              {s.detail}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}

              {/* Policy cited */}
              {policy ? (
                <div className="rounded-md bg-white px-2.5 py-2 ring-1 ring-neutral-200">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center rounded bg-lane-violet-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-lane-violet-800 ring-1 ring-inset ring-lane-violet-200">
                      {policy.id}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                      Policy cited
                    </span>
                  </div>
                  <p className="mt-1 text-[11.5px] italic leading-relaxed text-neutral-700">
                    &ldquo;{policy.summary}&rdquo;
                  </p>
                </div>
              ) : null}

              {/* Workflow-specific preview */}
              <div>
                <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  Preview
                </div>
                <PreviewComponent item={item} evidenceChain={chain} />
              </div>

              {/* Action footer */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {resolveSet.has("confirm") ? (
                  <Button
                    size="sm"
                    onClick={() => resolveItem(item.id, "confirm")}
                    className="h-7 px-3 text-[11px]"
                  >
                    Confirm &amp; post
                  </Button>
                ) : null}
                {resolveSet.has("override") ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolveItem(item.id, "override")}
                    className="h-7 px-3 text-[11px]"
                  >
                    Override
                  </Button>
                ) : null}
                {resolveSet.has("revert") ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolveItem(item.id, "revert")}
                    className="h-7 px-3 text-[11px]"
                  >
                    Revert
                  </Button>
                ) : null}
                {resolveSet.has("mark-reviewed") ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolveItem(item.id, "mark-reviewed")}
                    className="h-7 px-3 text-[11px]"
                  >
                    Mark reviewed
                  </Button>
                ) : null}
                {resolveSet.has("delegate") && !item.delegatedTo ? (
                  <DelegatePopover itemId={item.id}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-3 text-[11px]"
                    >
                      Delegate
                    </Button>
                  </DelegatePopover>
                ) : null}
                {item.evidenceRef ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      openPanel({ type: "evidence", id: item.evidenceRef! })
                    }
                    className="ml-auto h-7 px-3 text-[11px] text-neutral-700"
                  >
                    View full evidence →
                  </Button>
                ) : null}
              </div>

              {/* Footer helper: amount if present but not already in title */}
              {item.amount != null && !item.title.includes(formatAmount(item.amount)) ? (
                <div className="text-[10px] text-neutral-400">
                  Amount · {formatAmount(item.amount)}
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
