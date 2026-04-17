"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/state/AppStateContext";
import { useData } from "@/hooks/useData";
import { EvidencePanel } from "../EvidencePanel";

// 5d · Fallback for evidence panels opened with an id we don't have a bespoke
// wrapper for. If the id resolves in the evidence-chain map, we render the
// generic panel. If not, we render a minimal "nothing to show" shell so the
// close button still works.

export function GenericEvidenceFallback() {
  const { state, closePanel } = useAppState();
  const { evidenceChains } = useData();

  const panel = state.activePanel;
  const id = panel && panel.type === "evidence" ? panel.id : null;
  const chain = id ? evidenceChains[id] : undefined;

  if (chain) {
    return <EvidencePanel evidence={chain} />;
  }

  return (
    <aside className="absolute inset-y-0 right-0 z-10 flex w-[720px] flex-col border-l border-neutral-200 bg-white shadow-lg">
      <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
        <span className="text-sm font-semibold text-neutral-900">
          Evidence chain · {id ?? "(missing)"}
        </span>
        <Button size="icon" variant="ghost" onClick={closePanel} aria-label="Close panel">
          <X className="size-4" />
        </Button>
      </div>
      <div className="flex flex-1 items-center justify-center p-8 text-center">
        <div>
          <p className="text-sm font-medium text-neutral-900">
            No evidence chain found for this reference.
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Expected chain id <code>{id}</code> is not present in seed data.
          </p>
        </div>
      </div>
    </aside>
  );
}
