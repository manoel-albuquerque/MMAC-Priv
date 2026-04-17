"use client";

import { useAppState } from "@/state/AppStateContext";
import { RevRecSchedule } from "@/components/accounting/rev-rec/RevRecSchedule";
import type { PreviewProps } from "./registry";

// Rev Rec preview: the single content-dense moment that proves the agent
// does accounting judgment. Renders the full RevRecSchedule inline within the
// expanded queue row. The row itself scrolls within its boundary (~600-700px).

export function RevRecPreviewStub({ item }: PreviewProps) {
  const { openPanel, resolveItem } = useAppState();
  return (
    <RevRecSchedule
      mode="inline"
      onApproveSchedule={() => resolveItem(item.id, "confirm")}
      onApproveClassification={() => resolveItem(item.id, "confirm")}
      onReject={() => resolveItem(item.id, "override")}
      onViewEvidence={() =>
        item.evidenceRef
          ? openPanel({ type: "evidence", id: item.evidenceRef })
          : undefined
      }
    />
  );
}
