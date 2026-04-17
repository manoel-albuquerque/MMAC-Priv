"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/state/AppStateContext";

export function PanelPlaceholder() {
  const { state, closePanel } = useAppState();
  const panel = state.activePanel;
  if (!panel) return null;

  const label =
    panel.type === "evidence"
      ? `Evidence chain · ${panel.id}`
      : panel.type === "reversal"
      ? `Reversal graph · ${panel.id}`
      : panel.type === "policy"
      ? `Policy adjustment · ${panel.workflowId}`
      : `Workflow drill-in · ${panel.workflowId}`;

  const phase =
    panel.type === "evidence"
      ? "P5 (Evidence Panel)"
      : panel.type === "reversal"
      ? "P7 (Reversal Graph)"
      : panel.type === "policy"
      ? "P6 (Policy Adjustment)"
      : "P3 (Workflow Drill-In)";

  return (
    <aside className="absolute inset-y-0 right-0 w-[640px] border-l border-neutral-200 bg-white shadow-lg">
      <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
        <span className="text-sm font-semibold text-neutral-900">{label}</span>
        <Button size="icon" variant="ghost" onClick={closePanel} aria-label="Close panel">
          <X className="size-4" />
        </Button>
      </div>
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div>
          <p className="text-sm font-medium text-neutral-900">
            Panel placeholder
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Real panel lands in {phase}.
          </p>
        </div>
      </div>
    </aside>
  );
}
