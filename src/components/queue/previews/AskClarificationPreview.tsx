"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/state/AppStateContext";
import { cn } from "@/lib/utils";
import type { PreviewProps } from "./registry";

// 5b · Ask-for-clarification preview: the agent has a strongest-guess and asks
// the controller to confirm, change, or skip. The controller sees the agent's
// question and the suggested classification inline, picks one of the offered
// options, and commits without leaving the queue.

const CLASSIFICATION_OPTIONS: Array<{ account: string; label: string }> = [
  { account: "5410", label: "Shipping and Freight (5410)" },
  { account: "5420", label: "Freight-in (5420)" },
  { account: "6100", label: "General Operating (6100)" },
  { account: "other", label: "Other — specify" },
];

export function AskClarificationPreview({ item }: PreviewProps) {
  const { resolveItem } = useAppState();
  const [selected, setSelected] = useState<string>(CLASSIFICATION_OPTIONS[0].account);

  const question = item.agentSuggestion?.reasoning ?? item.investigationContext.exceptionRationale;

  return (
    <div className="space-y-3">
      {/* Agent's question */}
      <div className="rounded-md border border-lane-sky-200 bg-lane-sky-50/50 p-3">
        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-lane-sky-800">
          <HelpCircle className="size-3" /> Agent asks
        </div>
        <p className="text-[11.5px] leading-relaxed text-neutral-800">{question}</p>
      </div>

      {/* Classification options */}
      <div className="rounded-md border border-neutral-200 bg-white p-3">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          Classify as
        </div>
        <div className="space-y-1.5">
          {CLASSIFICATION_OPTIONS.map((opt) => {
            const active = selected === opt.account;
            return (
              <label
                key={opt.account}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-[11.5px] ring-1 ring-inset",
                  active
                    ? "bg-lane-sky-50 text-neutral-900 ring-lane-sky-300"
                    : "bg-white text-neutral-700 ring-neutral-200 hover:bg-neutral-50",
                )}
              >
                <input
                  type="radio"
                  name={`classify-${item.id}`}
                  value={opt.account}
                  checked={active}
                  onChange={() => setSelected(opt.account)}
                  className="size-3 accent-lane-sky-600"
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Button
            size="sm"
            className="h-7 px-3 text-[11px]"
            onClick={() => resolveItem(item.id, "confirm")}
          >
            Confirm
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-3 text-[11px]"
            onClick={() => resolveItem(item.id, "override")}
          >
            Change
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-3 text-[11px]"
            onClick={() => resolveItem(item.id, "delegate")}
          >
            Skip
          </Button>
        </div>
      </div>
    </div>
  );
}
