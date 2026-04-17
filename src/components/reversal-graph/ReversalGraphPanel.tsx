"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData } from "@/hooks/useData";
import { useAppState } from "@/state/AppStateContext";
import { DetectionSignals } from "./DetectionSignals";
import { GraphCanvas } from "./GraphCanvas";
import { RevertControls } from "./RevertControls";
import { ResolvedSummary } from "./ResolvedSummary";
import { RevertingCascade } from "./RevertingCascade";

type PanelState = "A" | "B" | "C";

// Self-sufficient panel: reads the active panel id from app state so the
// dispatcher contract doesn't need to change. Other agents (P5/P6) edit
// the same dispatcher in parallel — we keep our wiring minimal.
export function ReversalGraphPanel() {
  const { state, closePanel, executeReversal } = useAppState();
  const data = useData();

  const graphId =
    state.activePanel?.type === "reversal" ? state.activePanel.id : null;
  const graph = graphId ? data.reversalGraphs[graphId] : null;

  const [panelState, setPanelState] = useState<PanelState>("A");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    // Default: every downstream node checked. Hydrates once; `graph` can
    // shift as app state updates but the checkboxes represent user intent.
    return new Set();
  });

  // When the graph id changes (or first loads), reset selection to "all checked".
  useEffect(() => {
    if (!graph) return;
    setSelectedIds(new Set(graph.downstreamNodes.map((n) => n.id)));
    setPanelState("A");
  }, [graph?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // State B → C transition is now driven by the cascade animation's onComplete.
  const handleCascadeComplete = () => {
    if (graph) executeReversal(graph.id, Array.from(selectedIds));
    setPanelState("C");
  };

  const handleToggle = (nodeId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const handleExecute = () => {
    setPanelState("B");
  };

  const resolvedCounts = useMemo(() => {
    if (!graph) return { reversed: 0, reclassified: 0 };
    // Demo heuristic: everything selected is "reversed", but we frame one as
    // "reclassified" to match the spec copy ("4 entries reversed · 1 reclassified").
    const reversed = Math.max(0, selectedIds.size - 1);
    const reclassified = selectedIds.size > 0 ? 1 : 0;
    return { reversed, reclassified };
  }, [graph, selectedIds]);

  return (
    <aside className="absolute inset-y-0 right-0 z-30 w-[900px] overflow-y-auto border-l border-neutral-200 bg-white shadow-lg">
      {/* Accent strip */}
      <div
        className={
          panelState === "C"
            ? "h-1 w-full bg-gradient-to-r from-emerald-400 to-emerald-600"
            : "h-1 w-full bg-gradient-to-r from-rose-500 via-rose-400 to-amber-400"
        }
      />

      {/* Header */}
      <div className="flex items-start justify-between border-b border-neutral-200 px-6 py-4">
        <div className="pr-4">
          {panelState === "C" ? (
            <>
              <div className="text-lg font-semibold text-emerald-900">
                Misclassification resolved · $200K · April 9, 2026
              </div>
              <div className="mt-1 text-sm text-neutral-600">
                All downstream effects unwound. Original error, detection
                signals, and resolution chain preserved.
              </div>
            </>
          ) : (
            <>
              <div className="text-lg font-semibold text-rose-900">
                Misclassification detected · $200K · April 9, 2026
              </div>
              <div className="mt-1 text-sm text-neutral-600">
                Outbound wire of $200K classified as loan repayment. Likely
                vendor payment to Stellar Logistics — Invoice #4872.
              </div>
            </>
          )}
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={closePanel}
          aria-label="Close panel"
        >
          <X className="size-4" />
        </Button>
      </div>

      {!graph ? (
        <div className="flex h-64 items-center justify-center text-sm text-neutral-500">
          No reversal graph loaded.
        </div>
      ) : panelState === "A" ? (
        <StateA
          graph={graph}
          selectedIds={selectedIds}
          onToggle={handleToggle}
          onExecute={handleExecute}
        />
      ) : panelState === "B" ? (
        <div className="space-y-6 px-6 py-5">
          <RevertingCascade graph={graph} onComplete={handleCascadeComplete} />
        </div>
      ) : (
        <StateC
          graph={graph}
          selectedIds={selectedIds}
          onClose={closePanel}
          reversedCount={resolvedCounts.reversed}
          reclassifiedCount={resolvedCounts.reclassified}
        />
      )}
    </aside>
  );
}

// --- State A ---------------------------------------------------------------

function StateA({
  graph,
  selectedIds,
  onToggle,
  onExecute,
}: {
  graph: NonNullable<ReturnType<typeof useData>["reversalGraphs"][string]>;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onExecute: () => void;
}) {
  return (
    <div className="space-y-6 px-6 py-5">
      <section>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
          Detection signals
        </h3>
        <DetectionSignals signals={graph.detectionSignals} />
      </section>

      <section>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
          Causal tree
        </h3>
        <GraphCanvas
          graph={graph}
          selectedIds={selectedIds}
          onToggle={onToggle}
          mode="diagnostic"
        />
      </section>

      <section>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
          Revert controls
        </h3>
        <RevertControls
          graph={graph}
          selectedIds={selectedIds}
          onExecute={onExecute}
        />
      </section>
    </div>
  );
}

// --- State C ---------------------------------------------------------------

function StateC({
  graph,
  selectedIds,
  onClose,
  reversedCount,
  reclassifiedCount,
}: {
  graph: NonNullable<ReturnType<typeof useData>["reversalGraphs"][string]>;
  selectedIds: Set<string>;
  onClose: () => void;
  reversedCount: number;
  reclassifiedCount: number;
}) {
  return (
    <div className="space-y-6 px-6 py-5">
      <ResolvedSummary
        reversedCount={reversedCount}
        reclassifiedCount={reclassifiedCount}
        durationSeconds={90}
        auditHash="#7b2e-c491-..."
      />

      <section>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
          Resolution chain
        </h3>
        <GraphCanvas
          graph={graph}
          selectedIds={selectedIds}
          onToggle={() => {
            /* noop in resolved state */
          }}
          mode="resolved"
        />
      </section>

      <Button
        size="lg"
        className="w-full py-6 text-base font-semibold"
        onClick={onClose}
      >
        Return to Command Center
      </Button>
    </div>
  );
}
