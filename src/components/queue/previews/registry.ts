// 5b: registry that maps a (workflowId, exceptionType) tuple to an inline
// preview component. Verification-flag items take priority regardless of
// workflow (they always use the generic VerificationFlagPreview). Rev Rec is
// a stubbed placeholder until the Rev Rec Schedule Component lands.

import type { ComponentType } from "react";
import type { EvidenceChain, PendingQueueItem } from "@/data/types";
import { BankRecPreview } from "./BankRecPreview";
import { AdvancedAdjustmentPreview } from "./AdvancedAdjustmentPreview";
import { VerificationFlagPreview } from "./VerificationFlagPreview";
import { AskClarificationPreview } from "./AskClarificationPreview";
import { RevRecPreviewStub } from "./RevRecPreviewStub";

export type PreviewProps = {
  item: PendingQueueItem;
  evidenceChain?: EvidenceChain;
};

export type PreviewComponent = ComponentType<PreviewProps>;

export function getPreviewComponent(item: PendingQueueItem): PreviewComponent {
  // Verification flag wins regardless of originating workflow — it's a
  // cross-cutting concern and needs the "revert / investigate / accept" flow.
  if (item.exceptionType === "verification-flag") {
    return VerificationFlagPreview;
  }

  switch (item.workflowId) {
    case "rev-rec":
      return RevRecPreviewStub;
    case "bank-rec":
      return BankRecPreview;
    case "advanced-adjustments":
      return AdvancedAdjustmentPreview;
    case "ap":
      return AskClarificationPreview;
    default:
      return BankRecPreview;
  }
}
