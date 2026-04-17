import type { WorkflowCard } from "./types";

// Eleven cards, matching PRD R1.3 exactly:
// 1. Connector Health
// 2. Bank Reconciliation
// 3. Accounts Receivable
// 4. Accounts Payable
// 5. Advanced Adjustments
// 6. Revenue Recognition
// 7. Fixed Assets
// 8. Prepaids and Amortization
// 9. Allocations
// 10. Financial Statement Substantiation
// 11. Flux and Variance Analysis
//
// Lane assignments, counts, and agent-behavior lines hold the demo story:
// Bank Rec hums along in auto-execute; Rev Rec waits for controller
// sign-off on a multi-element contract; Allocations has a verification flag.
export const workflows: WorkflowCard[] = [
  {
    id: "connector-health",
    name: "Connector Health",
    description: "Data source coverage and freshness",
    lane: "auto-execute",
    agentBehavior: "Monitoring 8 sources · Gusto Payroll degraded (4h since sync)",
    periodProgress: { completed: 7, total: 8, unit: "entries" },
    pendingQueueCount: 0,
    verificationFlags: 0,
    healthIndicator: "attention",
  },
  {
    id: "bank-rec",
    name: "Bank Reconciliation",
    description: "Cash, bank, payment processor reconciliation",
    lane: "auto-execute",
    agentBehavior: "Auto-posting bank matches above 95% · 6 exceptions in queue",
    periodProgress: { completed: 847, total: 912, unit: "transactions" },
    pendingQueueCount: 2,
    verificationFlags: 0,
    healthIndicator: "healthy",
  },
  {
    id: "ar",
    name: "Accounts Receivable",
    description: "Cash application, credits, aging tie-out",
    lane: "auto-execute",
    agentBehavior: "Applying customer payments · 92% coverage · 0 unapplied",
    periodProgress: { completed: 284, total: 309, unit: "transactions" },
    pendingQueueCount: 0,
    verificationFlags: 0,
    healthIndicator: "healthy",
  },
  {
    id: "ap",
    name: "Accounts Payable",
    description: "Vendor bills, payments, statement reconciliation",
    lane: "ask-clarification",
    agentBehavior: "Drafting entries · new vendor pattern (Stellar Logistics) awaiting classification",
    periodProgress: { completed: 196, total: 224, unit: "transactions" },
    pendingQueueCount: 1,
    verificationFlags: 0,
    healthIndicator: "attention",
  },
  {
    id: "advanced-adjustments",
    name: "Advanced Adjustments",
    description: "Policy-governed netting, reclasses, one-offs",
    lane: "draft-confirm",
    agentBehavior: "Detected shared-counterparty condition · 1 draft awaiting policy decision",
    periodProgress: { completed: 4, total: 5, unit: "entries" },
    pendingQueueCount: 1,
    verificationFlags: 0,
    healthIndicator: "healthy",
  },
  {
    id: "rev-rec",
    name: "Revenue Recognition",
    description: "Rev rec schedules, deferred revenue, contract rollforwards",
    lane: "draft-confirm",
    agentBehavior: "2 multi-element contracts awaiting controller sign-off",
    periodProgress: { completed: 17, total: 19, unit: "schedule items" },
    pendingQueueCount: 1,
    verificationFlags: 0,
    healthIndicator: "attention",
  },
  {
    id: "fixed-assets",
    name: "Fixed Assets",
    description: "Capex detection, asset register, depreciation",
    lane: "draft-confirm",
    agentBehavior: "Drafting depreciation schedule · 1 capex flag ($84K CNC machine)",
    periodProgress: { completed: 23, total: 24, unit: "schedule items" },
    pendingQueueCount: 0,
    verificationFlags: 0,
    healthIndicator: "healthy",
  },
  {
    id: "prepaids-amortization",
    name: "Prepaids & Amortization",
    description: "Prepaid schedules, amortization, accrual reversals",
    lane: "auto-execute",
    agentBehavior: "Auto-posting monthly amortization · 18 schedules active",
    periodProgress: { completed: 18, total: 18, unit: "schedule items" },
    pendingQueueCount: 0,
    verificationFlags: 0,
    healthIndicator: "healthy",
  },
  {
    id: "allocations",
    name: "Allocations",
    description: "Cost and revenue allocation across project, location, dimensions",
    lane: "create-task",
    agentBehavior: "3 allocations pending dimension data · 1 verification flag",
    periodProgress: { completed: 9, total: 12, unit: "entries" },
    pendingQueueCount: 1,
    verificationFlags: 1,
    healthIndicator: "attention",
  },
  {
    id: "financial-statement-substantiation",
    name: "Financial Statement Substantiation",
    description: "Balance sheet tie-outs, P&L reasonableness, correcting entries",
    lane: "draft-confirm",
    agentBehavior: "Tie-out package assembling · 3 accounts pending",
    periodProgress: { completed: 41, total: 48, unit: "schedule items" },
    pendingQueueCount: 0,
    verificationFlags: 0,
    healthIndicator: "healthy",
  },
  {
    id: "flux-variance",
    name: "Flux & Variance Analysis",
    description: "P&L and balance sheet variance commentary, close package",
    lane: "escalate-stop",
    agentBehavior: "Drafting narratives from transaction layer · routes to CFO at lock",
    periodProgress: { completed: 0, total: 1, unit: "entries" },
    pendingQueueCount: 0,
    verificationFlags: 0,
    healthIndicator: "healthy",
  },
];
