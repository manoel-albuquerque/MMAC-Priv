import type { ReversalGraph } from "./types";

// One graph seeded — the $200K Stellar Logistics misclassification.
// Layout (hand-positioned in P7):
//
//                  [ root: Apr 9 · Dr Notes Payable $200K · Cr Cash $200K ]
//                   │                     │                      │
//              branch 1             branch 2               branch 3
//         Notes Payable         Interest accrual          Invoice #4872
//          understated          on wrong balance          still open
//          $200K                 │                         │
//                                ▼                         ▼
//                          Interest expense          Accrued liability
//                          understated ~$300          persisting
//                                                    │
//                                                    ▼
//                                              Stellar Logistics
//                                              38 days outstanding
//
// Upstream inputs (below the root): normalization failure + policy evaluation.
// Detection signals (two agents independently caught it).
export const reversalGraphs: Record<string, ReversalGraph> = {
  "rg-stellar-200k": {
    id: "rg-stellar-200k",
    rootAction: {
      id: "a-0027",
      label:
        "Apr 9 · Outbound wire $200K · classified as loan repayment · Dr Notes Payable $200K · Cr Cash $200K",
      amount: 200000,
      timestamp: "2026-04-09T11:47:31",
      confidenceAtTime: 78,
    },
    downstreamNodes: [
      // Branch 1 — loan balance
      {
        id: "n-np-understated",
        label: "Notes Payable understated $200,000",
        type: "gl-balance",
        impact: { account: "Notes Payable", amount: 200000 },
        dependencyType: "triggered-by",
        parentId: "root",
        currentStatus: "posted",
      },
      // Branch 2 — interest cascade
      {
        id: "n-interest-accrual",
        label: "Interest accrual on wrong balance (compounds daily)",
        type: "accrual",
        impact: { account: "Interest Payable", amount: 300 },
        dependencyType: "dependent-on",
        parentId: "root",
        currentStatus: "posted",
      },
      {
        id: "n-interest-expense",
        label: "Interest expense understated ~$300 (7 days · compounding)",
        type: "gl-balance",
        impact: { account: "Interest Expense", amount: 300 },
        dependencyType: "dependent-on",
        parentId: "n-interest-accrual",
        currentStatus: "posted",
      },
      // Branch 3 — AP / aging
      {
        id: "n-invoice-open",
        label: "Invoice #4872 still open · Stellar Logistics · $200,000",
        type: "aging",
        impact: { account: "AP Trade — Stellar Logistics", amount: 200000 },
        dependencyType: "triggered-by",
        parentId: "root",
        currentStatus: "posted",
      },
      {
        id: "n-accrual-persisting",
        label: "Accrued liability persisting",
        type: "accrual",
        impact: { account: "Accrued Liabilities", amount: 200000 },
        dependencyType: "dependent-on",
        parentId: "n-invoice-open",
        currentStatus: "posted",
      },
      {
        id: "n-aging-overdue",
        label: "Stellar Logistics · 38 days outstanding (8 days past standard)",
        type: "rollforward",
        impact: { account: "AP Aging — Stellar Logistics", amount: 200000 },
        dependencyType: "updated-by",
        parentId: "n-accrual-persisting",
        currentStatus: "posted",
      },
    ],
    upstreamInputs: [
      {
        id: "u-normalization",
        label: "Vendor name normalization · STELLAR LOG PMT → (failed to map)",
        type: "normalization",
      },
      {
        id: "u-policy",
        label: "Policy BR-12 evaluated · fired on scheduled-repayment rule",
        type: "policy-rule",
      },
    ],
    detectionSignals: [
      {
        agentName: "AP Aging Agent",
        signal: "Stellar Logistics invoice #4872 ($200K) is 8 days overdue",
        rationale:
          "Vendor typically pays within 30 days. The April 9 outbound wire of the same amount matches · likely the payment that never posted to AP.",
      },
      {
        agentName: "Interest Reconciliation Agent",
        signal: "Bank interest charges exceed expected on reported loan balance",
        rationale:
          "Accrued interest on the loan account is ~$300 lower than billed. Suggests loan balance is overstated — which would happen if a non-loan payment was classified as a loan repayment.",
      },
    ],
    netGlImpactOnRevert: {
      byAccount: [
        { account: "Notes Payable", amount: 200000 }, // restored (add back)
        { account: "AP Trade — Stellar Logistics", amount: -200000 }, // paid (reduce)
        { account: "Interest Expense", amount: 300 }, // corrected
        { account: "Interest Payable", amount: -300 }, // corrected
      ],
      totalMagnitude: 200300,
    },
  },
};
