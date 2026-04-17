"use client";

import { useAppState } from "@/state/AppStateContext";
import type { AppData, WorkflowCard, WorkflowId } from "@/data/types";

// The one data-loading seam. Components never import from @/data/* directly —
// they go through this hook. When a real backend is added later, swap the
// implementation here without touching components.
export function useData(): AppData {
  const { state } = useAppState();
  return {
    period: state.period,
    workflows: state.workflows,
    activityFeed: state.activityFeed,
    feedQueue: state.feedQueue,
    pendingQueue: state.pendingQueue,
    connectors: state.connectors,
    evidenceChains: state.evidenceChains,
    reversalGraphs: state.reversalGraphs,
  };
}

// Common selector: find a workflow card by id.
// Used by every Wave 2 phase that renders workflow-specific content.
export function useWorkflow(id: WorkflowId): WorkflowCard | undefined {
  const { workflows } = useData();
  return workflows.find((w) => w.id === id);
}
