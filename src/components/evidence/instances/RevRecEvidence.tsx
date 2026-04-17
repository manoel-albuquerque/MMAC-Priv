"use client";

import { useData } from "@/hooks/useData";
import { useAppState } from "@/state/AppStateContext";
import { EvidencePanel } from "../EvidencePanel";
import { RevRecSchedule } from "@/components/accounting/rev-rec/RevRecSchedule";

// 5d · Rev Rec evidence instance. Targets `e-revrec-beacon` — the Beacon
// Aerospace $180K multi-element MSA. The generic EvidencePanel wraps the
// RevRecSchedule, which becomes the primary content of this panel.

export function RevRecEvidence() {
  const { evidenceChains } = useData();
  const { closePanel } = useAppState();
  const chain = evidenceChains["e-revrec-beacon"];
  if (!chain) return null;
  return (
    <EvidencePanel
      evidence={chain}
      footerMode="pending"
      scheduleSlot={
        <section>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            Rev Rec schedule
          </div>
          <RevRecSchedule
            mode="panel"
            onApproveSchedule={closePanel}
            onApproveClassification={closePanel}
            onReject={closePanel}
          />
        </section>
      }
    />
  );
}
