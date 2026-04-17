"use client";

import { useData } from "@/hooks/useData";
import { EvidencePanel } from "../EvidencePanel";

// 5d · Advanced Adjustment evidence instance. Targets `e-advadj-vendork` — the
// Vendor K shared-counterparty case. Uses `pending` footer mode.

export function AdvancedAdjustmentEvidence() {
  const { evidenceChains } = useData();
  const chain = evidenceChains["e-advadj-vendork"];
  if (!chain) return null;
  return <EvidencePanel evidence={chain} footerMode="pending" />;
}
