"use client";

import { useData } from "@/hooks/useData";
import { EvidencePanel } from "../EvidencePanel";

// 5d · Bank Rec instance of the evidence panel. Targets `e-bankrec-acme` — the
// Acme Corp $12,400 wire match. Thin wrapper: grabs the chain and hands it to
// the generic renderer. Footer mode is `pending` because the action hasn't
// posted yet.

export function BankRecEvidence() {
  const { evidenceChains } = useData();
  const chain = evidenceChains["e-bankrec-acme"];
  if (!chain) return null;
  return <EvidencePanel evidence={chain} footerMode="pending" />;
}
