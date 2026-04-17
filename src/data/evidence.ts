import type { EvidenceChain } from "./types";

// Evidence chains keyed by id. Every activity entry and pending item with an
// evidenceRef resolves here. Three instances are fully detailed (bank rec,
// advanced adjustment, rev rec) — those three back the Evidence Panel renders
// in P5. The rest carry minimum-fidelity data to keep links from dangling;
// they'd be filled out later if those routes become drill-in targets.

export const evidenceChains: Record<string, EvidenceChain> = {
  // ---- FULL: Bank rec — Acme Corp $12,400 (pending item p-001) ----
  "e-bankrec-acme": {
    id: "e-bankrec-acme",
    actionId: "p-001",
    timestamp: "2026-04-15T11:47:18",
    agentName: "Bank Rec Agent",
    agentVersion: "v2.3.1",
    summary: {
      transactionIdentity: "Bank transaction · Apr 15 · $12,400 · Acme Corp",
      actionTaken: "Routed to pending · suggested match to INV-2041",
      lane: "auto-execute",
      confidenceScore: 91,
    },
    sourcesGathered: [
      {
        sourceType: "bank-feed",
        sourceLabel: "Silicon Valley Bank — Operating",
        detail: "Wire confirmation · Apr 15 · 11:45 AM · $12,400 · ref APRL",
        extractedAt: "2026-04-15T11:46:02",
        confidenceContribution: "high",
      },
      {
        sourceType: "ap-subledger",
        sourceLabel: "AP Sub-ledger",
        detail: "INV-2041 · open · Acme Corp · $12,400 · due Apr 18",
        extractedAt: "2026-04-15T11:47:14",
        confidenceContribution: "high",
      },
      {
        sourceType: "email",
        sourceLabel: "Vendor email · ap@acmecorp.com",
        detail: "Payment remittance · \"INV 2041 paid via wire · confirmation APRL-8821\" · Apr 15",
        extractedAt: "2026-04-15T11:46:44",
        confidenceContribution: "medium",
      },
      {
        sourceType: "gl",
        sourceLabel: "IES GL · prior-period treatment",
        detail: "Acme Corp AP matched within 2% tolerance 8 of last 8 months",
        extractedAt: "2026-04-15T11:47:16",
        confidenceContribution: "medium",
      },
    ],
    normalizationApplied: [
      {
        field: "vendor name",
        from: "ACME CORP WIRE",
        to: "Acme Corp",
        rule: "Vendor name normalization map · entry #214",
      },
    ],
    agentReasoning: {
      policyCited: {
        id: "BR-04",
        summary:
          "Recurring vendor payments matched within 2% tolerance and a consistent prior-period pattern auto-reconcile at 95%+ confidence.",
      },
      confidenceBreakdown: [
        { signal: "Amount exact match", weight: 40, score: 40 },
        { signal: "Vendor name normalization", weight: 25, score: 25 },
        { signal: "Prior-period pattern (8 of 8)", weight: 15, score: 15 },
        { signal: "Vendor email correlation", weight: 10, score: 8 },
        { signal: "Invoice number in bank memo", weight: 10, score: 3 },
      ],
      alternativesConsidered: [
        {
          option: "INV-2038 ($12,400 · same party · earlier period)",
          confidence: 42,
          rejected: "Outside the cutoff window — prior period.",
        },
        {
          option: "Apply to customer credit memo",
          confidence: 8,
          rejected: "Acme Corp has no open credit memo.",
        },
      ],
      exceptionTriggersEvaluated: [
        { trigger: "Material flag ($50K+)", triggered: false },
        { trigger: "Policy conflict", triggered: false },
        { trigger: "Connector freshness", triggered: false },
        { trigger: "Auto-post threshold (95%)", triggered: true },
      ],
    },
    output: {
      journalEntries: [
        { account: "AP Trade", amount: 12400, debit: true, class: "Operations" },
        { account: "Cash — SVB Operating", amount: 12400, debit: false, class: "Operations" },
      ],
      glPostingTimestamp: "",
      notifiedUsers: [],
    },
    immutableHash: "#a3f1-d284-7c92-11ef",
  },

  // ---- FULL: Advanced Adjustment — Vendor K shared counterparty (pending item p-002) ----
  "e-advadj-vendork": {
    id: "e-advadj-vendork",
    actionId: "p-002",
    timestamp: "2026-04-16T09:15:11",
    agentName: "Advanced Adjustments Agent",
    agentVersion: "v1.4.0",
    summary: {
      transactionIdentity: "Shared-counterparty condition · Vendor K · $3,200 refund + $3,200 open AR",
      actionTaken: "Routed to pending · policy gap detected · awaiting policy decision",
      lane: "draft-confirm",
      confidenceScore: 82,
    },
    sourcesGathered: [
      {
        sourceType: "ap-subledger",
        sourceLabel: "AP Sub-ledger",
        detail: "Vendor K · received refund $3,200 · Apr 16",
        extractedAt: "2026-04-16T09:13:04",
        confidenceContribution: "high",
      },
      {
        sourceType: "ar-subledger",
        sourceLabel: "AR Sub-ledger",
        detail: "Vendor K (as customer) · open AR $3,200 · Apr 12 invoice · INV-2043",
        extractedAt: "2026-04-16T09:13:11",
        confidenceContribution: "high",
      },
      {
        sourceType: "gl",
        sourceLabel: "IES GL · prior-period treatment",
        detail: "No prior instances of shared-counterparty netting in the last 12 months",
        extractedAt: "2026-04-16T09:13:55",
        confidenceContribution: "low",
      },
    ],
    normalizationApplied: [
      {
        field: "counterparty identity",
        from: "Vendor K (AP) · Vendor K (AR)",
        to: "Matched counterparty · single entity",
        rule: "Shared counterparty detection · tax ID match",
      },
    ],
    agentReasoning: {
      policyCited: null,
      confidenceBreakdown: [
        { signal: "Amount exact match", weight: 30, score: 30 },
        { signal: "Counterparty identity match", weight: 30, score: 30 },
        { signal: "Timing (refund within AR window)", weight: 20, score: 15 },
        { signal: "Policy rule coverage", weight: 20, score: 7 },
      ],
      alternativesConsidered: [
        {
          option: "Post refund as standalone AP transaction (leave AR open)",
          confidence: 40,
          rejected:
            "Leaves AR balance open · misstates both sub-ledgers · economically not what happened.",
        },
        {
          option: "Route without suggestion",
          confidence: 30,
          rejected: "Strong signal present · withholding it wastes controller time.",
        },
      ],
      exceptionTriggersEvaluated: [
        { trigger: "Material flag", triggered: false },
        { trigger: "Policy conflict", triggered: false },
        { trigger: "Policy gap", triggered: true },
      ],
    },
    output: {
      journalEntries: [
        { account: "AP Trade — Vendor K", amount: 3200, debit: true },
        { account: "AR Trade — Vendor K", amount: 3200, debit: false },
      ],
      glPostingTimestamp: "",
      notifiedUsers: [],
    },
    immutableHash: "#b84e-1c09-fa31-21ef",
  },

  // ---- FULL: Rev Rec — Beacon Aerospace $180K multi-element (pending item p-003) ----
  "e-revrec-beacon": {
    id: "e-revrec-beacon",
    actionId: "p-003",
    timestamp: "2026-04-14T10:12:48",
    agentName: "Rev Rec Agent",
    agentVersion: "v3.1.0",
    summary: {
      transactionIdentity: "Beacon Aerospace · MSA #45219 · $180K · 24 mo · 2 POs",
      actionTaken:
        "Classified as multi-element · allocated $168K subscription / $12K implementation · schedule staged · awaiting sign-off (policy RR-02)",
      lane: "draft-confirm",
      confidenceScore: 94,
    },
    sourcesGathered: [
      {
        sourceType: "contract-pdf",
        sourceLabel: "Beacon Aerospace MSA (email attachment)",
        detail: "Signed Apr 12 · 24-month subscription + fixed-fee implementation · full contract text",
        extractedAt: "2026-04-13T14:22:11",
        confidenceContribution: "high",
      },
      {
        sourceType: "crm",
        sourceLabel: "CRM · Deal #45219",
        detail: "Closed-won Apr 12 · list ASP captured at signature",
        extractedAt: "2026-04-13T14:22:33",
        confidenceContribution: "high",
      },
      {
        sourceType: "crm",
        sourceLabel: "CRM · historical SSPs for tier-3 subscriptions",
        detail: "$6,800-$7,200/mo range across 18 comparable 24-mo deals",
        extractedAt: "2026-04-13T14:22:35",
        confidenceContribution: "high",
      },
      {
        sourceType: "email",
        sourceLabel: "AE signature confirmation",
        detail: "\"Beacon deal signed · implementation starts May 1 · three-month ramp\"",
        extractedAt: "2026-04-13T14:25:40",
        confidenceContribution: "medium",
      },
    ],
    normalizationApplied: [
      {
        field: "deliverables breakdown",
        from: "Contract prose",
        to: "Two discrete POs · distinct in contract and capable of being distinct",
        rule: "ASC 606 distinct-obligation classifier",
      },
    ],
    agentReasoning: {
      policyCited: {
        id: "RR-02",
        summary:
          "Controller approval required for new multi-element arrangements prior to posting the first recognition entry.",
      },
      confidenceBreakdown: [
        { signal: "Distinct-obligation criteria satisfied", weight: 35, score: 35 },
        { signal: "Price allocation (relative SSPs)", weight: 25, score: 24 },
        { signal: "Historical SSP data availability", weight: 20, score: 19 },
        { signal: "Contract language clarity", weight: 20, score: 16 },
      ],
      alternativesConsidered: [
        {
          option: "Single combined obligation over 24 months",
          confidence: 20,
          rejected:
            "Implementation is capable of being distinct and is distinct in the contract context under ASC 606.",
        },
        {
          option: "Implementation as cost of obtaining the contract",
          confidence: 10,
          rejected: "Implementation is a performance deliverable, not a pre-contract cost.",
        },
      ],
      exceptionTriggersEvaluated: [
        { trigger: "Material flag ($50K+)", triggered: true },
        { trigger: "Multi-element arrangement", triggered: true },
        { trigger: "Policy RR-02 controller sign-off", triggered: true },
      ],
    },
    output: {
      // First recognition entry — posted on approval.
      journalEntries: [
        { account: "Deferred Revenue — Subscription", amount: 7000, debit: true },
        { account: "Subscription Revenue", amount: 7000, debit: false },
        { account: "Deferred Revenue — Implementation", amount: 4000, debit: true },
        { account: "Implementation Revenue", amount: 4000, debit: false },
      ],
      glPostingTimestamp: "",
      notifiedUsers: [],
    },
    immutableHash: "#c9a2-3e47-8d11-4fef",
  },

  // ---- SUPPORTING: unknown wire (minimum-fidelity) ----
  "e-bankrec-unknown": {
    id: "e-bankrec-unknown",
    actionId: "p-004",
    timestamp: "2026-04-15T15:22:50",
    agentName: "Bank Rec Agent",
    agentVersion: "v2.3.1",
    summary: {
      transactionIdentity: "Outbound wire · Apr 15 · $78,500 · unknown payee",
      actionTaken: "Routed to pending · material-flag · no confident match",
      lane: "auto-execute",
      confidenceScore: 0,
    },
    sourcesGathered: [
      {
        sourceType: "bank-feed",
        sourceLabel: "Silicon Valley Bank — Operating",
        detail:
          "Outbound wire · Apr 15 · 3:18 PM · $78,500 · beneficiary \"GENERAL PAYMENT\" · memo blank",
        extractedAt: "2026-04-15T15:19:44",
        confidenceContribution: "high",
      },
      {
        sourceType: "ap-subledger",
        sourceLabel: "AP Sub-ledger",
        detail: "No open invoice matches the amount or beneficiary",
        extractedAt: "2026-04-15T15:21:02",
        confidenceContribution: "high",
      },
    ],
    normalizationApplied: [],
    agentReasoning: {
      policyCited: null,
      confidenceBreakdown: [
        { signal: "Amount match candidates", weight: 50, score: 0 },
        { signal: "Beneficiary name match", weight: 30, score: 0 },
        { signal: "Memo signals", weight: 20, score: 0 },
      ],
      alternativesConsidered: [],
      exceptionTriggersEvaluated: [
        { trigger: "Material flag ($50K+)", triggered: true },
      ],
    },
    output: {
      journalEntries: [],
      glPostingTimestamp: "",
      notifiedUsers: [],
    },
    immutableHash: "#d71c-8a04-2bc5-33ef",
  },

  // ---- SUPPORTING: prepaid verification flag (minimum-fidelity) ----
  "e-verify-prepaid": {
    id: "e-verify-prepaid",
    actionId: "p-005",
    timestamp: "2026-04-16T07:38:24",
    agentName: "Verification Agent",
    agentVersion: "v1.2.3",
    summary: {
      transactionIdentity: "Aon Insurance prepaid amortization · February entry",
      actionTaken: "Flagged · contract revision invalidates schedule · suggest revert",
      lane: "escalate-stop",
      confidenceScore: 88,
    },
    sourcesGathered: [
      {
        sourceType: "contract-pdf",
        sourceLabel: "Aon policy (vendor portal, late sync)",
        detail: "Policy revised Mar 29 · coverage period shifted by 18 days",
        extractedAt: "2026-04-16T06:42:00",
        confidenceContribution: "high",
      },
      {
        sourceType: "gl",
        sourceLabel: "GL · prepaid insurance",
        detail: "$70,000 current balance · originally $84,000 · discrepancy from revised coverage",
        extractedAt: "2026-04-16T07:37:44",
        confidenceContribution: "high",
      },
    ],
    normalizationApplied: [],
    agentReasoning: {
      policyCited: {
        id: "VA-01",
        summary: "Verification agent flags prior-period entries when underlying source changes.",
      },
      confidenceBreakdown: [
        { signal: "Contract source change detected", weight: 50, score: 48 },
        { signal: "Schedule arithmetic mismatch", weight: 50, score: 40 },
      ],
      alternativesConsidered: [
        {
          option: "Catch-up entry in April only",
          confidence: 35,
          rejected: "Leaves February books misstated on the prepaid balance account.",
        },
      ],
      exceptionTriggersEvaluated: [
        { trigger: "Prior-period source change", triggered: true },
      ],
    },
    output: {
      journalEntries: [],
      glPostingTimestamp: "",
      notifiedUsers: [],
    },
    immutableHash: "#e05b-4fa1-9d22-11ef",
  },

  // ---- SUPPORTING: Stellar Logistics AP (minimum-fidelity) ----
  "e-ap-stellar": {
    id: "e-ap-stellar",
    actionId: "p-006",
    timestamp: "2026-04-16T10:08:44",
    agentName: "AP Agent",
    agentVersion: "v2.1.4",
    summary: {
      transactionIdentity: "Stellar Logistics LLC · first invoice · $4,200",
      actionTaken: "Routed to pending · requesting classification",
      lane: "ask-clarification",
      confidenceScore: 65,
    },
    sourcesGathered: [
      {
        sourceType: "email",
        sourceLabel: "AP email inbox",
        detail: "Stellar Logistics invoice #SL-0042 · $4,200 · freight services · Apr 14",
        extractedAt: "2026-04-16T10:07:02",
        confidenceContribution: "medium",
      },
    ],
    normalizationApplied: [],
    agentReasoning: {
      policyCited: null,
      confidenceBreakdown: [
        { signal: "Vendor-name pattern (Logistics → freight)", weight: 65, score: 65 },
        { signal: "Historical vendor coding", weight: 35, score: 0 },
      ],
      alternativesConsidered: [],
      exceptionTriggersEvaluated: [
        { trigger: "New vendor", triggered: true },
        { trigger: "No policy match", triggered: true },
      ],
    },
    output: {
      journalEntries: [],
      glPostingTimestamp: "",
      notifiedUsers: [],
    },
    immutableHash: "#f10a-9274-6e88-22ef",
  },

  // ---- SUPPORTING: Prepaid amortization batch (Apr 1) — referenced from feed entry a-0001 ----
  "e-prepaid-apr-0401": {
    id: "e-prepaid-apr-0401",
    actionId: "a-0001",
    timestamp: "2026-04-01T08:02:14",
    agentName: "Prepaids Agent",
    agentVersion: "v1.8.2",
    summary: {
      transactionIdentity: "April 2026 monthly amortization batch · 18 schedules",
      actionTaken: "Auto-posted · $41,820 total · individual entries linked",
      lane: "auto-execute",
      confidenceScore: 99,
    },
    sourcesGathered: [
      {
        sourceType: "gl",
        sourceLabel: "Active prepaid schedules",
        detail: "18 schedules · Aon, Adobe, WeWork, ADT, Rippling, various software",
        extractedAt: "2026-04-01T08:01:11",
        confidenceContribution: "high",
      },
    ],
    normalizationApplied: [],
    agentReasoning: {
      policyCited: {
        id: "PR-01",
        summary: "Recurring prepaid amortization auto-posts at 98%+ calibrated confidence.",
      },
      confidenceBreakdown: [
        { signal: "Schedule arithmetic validated", weight: 100, score: 99 },
      ],
      alternativesConsidered: [],
      exceptionTriggersEvaluated: [
        { trigger: "Schedule mismatch", triggered: false },
        { trigger: "New schedule first posting", triggered: false },
      ],
    },
    output: {
      journalEntries: [
        { account: "Insurance expense", amount: 7000, debit: true },
        { account: "Prepaid insurance", amount: 7000, debit: false },
      ],
      glPostingTimestamp: "2026-04-01T08:02:14",
      notifiedUsers: [],
    },
    immutableHash: "#ab01-9f24-d4c8-01ef",
  },

  // ---- SUPPORTING: root misclassification for the reversal graph ----
  "e-reversal-root": {
    id: "e-reversal-root",
    actionId: "a-0027",
    timestamp: "2026-04-09T11:47:31",
    agentName: "Bank Rec Agent",
    agentVersion: "v2.3.1",
    summary: {
      transactionIdentity: "Outbound wire · Apr 9 · $200,000",
      actionTaken: "Classified as loan repayment · auto-posted (confidence 78%)",
      lane: "auto-execute",
      confidenceScore: 78,
    },
    sourcesGathered: [
      {
        sourceType: "bank-feed",
        sourceLabel: "Silicon Valley Bank — Operating",
        detail: "Outbound wire · Apr 9 · 11:42 AM · $200,000 · beneficiary \"STELLAR LOG PMT\"",
        extractedAt: "2026-04-09T11:44:00",
        confidenceContribution: "high",
      },
      {
        sourceType: "gl",
        sourceLabel: "Loan repayment schedule",
        detail: "April principal payment due · $200,000 scheduled",
        extractedAt: "2026-04-09T11:44:14",
        confidenceContribution: "medium",
      },
    ],
    normalizationApplied: [
      {
        field: "beneficiary",
        from: "STELLAR LOG PMT",
        to: "(unmapped)",
        rule: "Vendor name normalization map — no entry",
      },
    ],
    agentReasoning: {
      policyCited: {
        id: "BR-12",
        summary: "Scheduled loan repayments auto-match to the scheduled amount on the scheduled date.",
      },
      confidenceBreakdown: [
        { signal: "Amount matches scheduled loan payment", weight: 60, score: 55 },
        { signal: "Timing matches scheduled date", weight: 30, score: 25 },
        { signal: "Beneficiary mapping", weight: 10, score: -2 },
      ],
      alternativesConsidered: [
        {
          option: "Map beneficiary STELLAR LOG PMT → Stellar Logistics · apply to AP",
          confidence: 35,
          rejected:
            "No Stellar Logistics vendor exists in the vendor master at the time of decision.",
        },
      ],
      exceptionTriggersEvaluated: [
        { trigger: "Material flag ($50K+)", triggered: true },
        { trigger: "Confidence below auto-post threshold", triggered: true },
        { trigger: "Policy BR-12 scheduled-repayment override", triggered: true },
      ],
    },
    output: {
      journalEntries: [
        { account: "Notes Payable", amount: 200000, debit: true },
        { account: "Cash — SVB Operating", amount: 200000, debit: false },
      ],
      glPostingTimestamp: "2026-04-09T11:47:31",
      notifiedUsers: [],
    },
    immutableHash: "#11ee-2c91-bb42-44ef",
  },
};
