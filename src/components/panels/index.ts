// The activePanel dispatcher — named in spec §Extensibility as one of the
// three "map of the system" files. P1 ships a single placeholder registered
// for every panel type. Later phases replace individual entries with real
// components (EvidencePanel, ReversalGraph, PolicyAdjustment, WorkflowDrillIn)
// without touching the shell.
//
// P5 wires the `evidence` panel type to the concrete instance components
// keyed by id; unknown ids fall through to the generic fallback.

import type { ComponentType } from "react";
import type { ActivePanel } from "@/data/types";
import { PanelPlaceholder } from "./PanelPlaceholder";
import { WorkflowDrillPanel } from "./WorkflowDrillPanel";
import { PolicyAdjustmentPanel } from "@/components/policy-adjustment/PolicyAdjustmentPanel";
import { ReversalGraphPanel } from "@/components/reversal-graph/ReversalGraphPanel";
import { BankRecEvidence } from "@/components/evidence/instances/BankRecEvidence";
import { AdvancedAdjustmentEvidence } from "@/components/evidence/instances/AdvancedAdjustmentEvidence";
import { RevRecEvidence } from "@/components/evidence/instances/RevRecEvidence";
import { GenericEvidenceFallback } from "@/components/evidence/instances/GenericEvidenceFallback";

// Evidence panel instances, keyed by evidence chain id. P5 ships three
// bespoke wrappers (BankRec, Advanced Adjustment, Rev Rec). Any unknown id
// routes through `GenericEvidenceFallback`, which reads the chain from state
// and renders the generic EvidencePanel (or a "no data" shell if missing).
const EVIDENCE_INSTANCES: Record<string, ComponentType> = {
  "e-bankrec-acme": BankRecEvidence,
  "e-advadj-vendork": AdvancedAdjustmentEvidence,
  "e-revrec-beacon": RevRecEvidence,
};

export function getPanelComponent(panel: ActivePanel): ComponentType | null {
  if (!panel) return null;
  switch (panel.type) {
    case "evidence":
      return EVIDENCE_INSTANCES[panel.id] ?? GenericEvidenceFallback;
    case "reversal":
      return ReversalGraphPanel;
    case "policy":
      return PolicyAdjustmentPanel;
    case "workflow-drill":
      return WorkflowDrillPanel;
  }
}

export { PanelPlaceholder };
