import type { PendingQueueItem } from "./types";

// Six items in the queue at 2026-04-16 10:42 AM — per spec §Pending Queue Items.
// Each carries a full investigation context so no item hits the controller
// as "unexplained data." Each references an EvidenceChain (see evidence.ts).
export const pendingQueue: PendingQueueItem[] = [
  // 1. Bank rec, below-confidence-threshold, immaterial.
  // The bread-and-butter "clear recommendation, controller confirms" case.
  {
    id: "p-001",
    workflowId: "bank-rec",
    exceptionType: "below-confidence-threshold",
    riskTier: "immaterial",
    urgency: "normal",
    title: "$12,400 wire from Acme Corp · match suggested",
    amount: 12400,
    counterparty: "Acme Corp",
    flaggedBy: ["Bank Rec Agent"],
    timestamp: "2026-04-15T11:47:18",
    agentSuggestion: {
      action: "Match to AP invoice INV-2041",
      confidenceScore: 91,
      reasoning:
        "Amount matches within 0% tolerance. Vendor name normalizes cleanly (\"ACME CORP WIRE\" → \"Acme Corp\"). Same vendor matched within 2% tolerance 8 of the last 8 months. Confidence below the 95% threshold because the memo line referenced \"APRL\" rather than an invoice number.",
      alternativeConsidered:
        "INV-2038 ($12,400, same party, earlier period) — rejected on period check (outside the cutoff window).",
    },
    investigationContext: {
      priorPeriodTreatment:
        "Acme Corp payments to AP trade matched within 2% tolerance in 8 of 8 prior months.",
      sourceDocuments: [
        {
          source: "Wire confirmation",
          detail: "Inbound wire · Apr 15 · 11:45 AM · $12,400 · ref \"APRL\"",
          extractedAt: "2026-04-15T11:46:02",
          connector: "svb-op",
        },
        {
          source: "No remittance email",
          detail:
            "No message from any Acme Corp sender in the 48h window around the wire.",
          extractedAt: "2026-04-15T11:47:00",
          connector: "gmail",
        },
        {
          source: "Salesforce account",
          detail:
            "Two Closed-Won opportunities totaling $12,400 — can't disambiguate invoice from CRM alone.",
          extractedAt: "2026-04-15T11:47:08",
          connector: "salesforce",
        },
      ],
      exceptionRationale:
        "Confidence 91% — below the 95% auto-post threshold configured for Bank Rec. Agent recommends confirmation.",
    },
    resolutionOptions: ["confirm", "override", "delegate", "request-more-context"],
    evidenceRef: "e-bankrec-acme",
  },

  // 2. Advanced adjustment, no-policy-match, immaterial. Shared-counterparty case.
  {
    id: "p-002",
    workflowId: "advanced-adjustments",
    exceptionType: "no-policy-match",
    riskTier: "immaterial",
    urgency: "normal",
    title: "$3,200 refund from Vendor K · shared counterparty (customer + vendor)",
    amount: 3200,
    counterparty: "Vendor K",
    flaggedBy: ["Advanced Adjustments Agent"],
    timestamp: "2026-04-16T09:15:11",
    agentSuggestion: {
      action:
        "Two paths available — (a) handle this instance manually, or (b) create a policy rule for AP/AR netting with shared counterparties",
      confidenceScore: 82,
      reasoning:
        "Vendor K has both an open AR balance ($3,200) and a received refund ($3,200). No existing Policy Engine rule governs AP/AR netting with shared counterparties for this entity.",
      alternativeConsidered:
        "Post as standalone refund — rejected because it leaves the mirrored AR balance open.",
    },
    investigationContext: {
      priorPeriodTreatment:
        "No prior instances of shared-counterparty netting in the last 12 months for this entity.",
      sourceDocuments: [
        {
          source: "Refund received",
          detail: "$3,200 ACH credit from Vendor K on Apr 16 · memo \"refund / credit\".",
          extractedAt: "2026-04-16T09:13:04",
          connector: "svb-op",
        },
        {
          source: "Refund notice",
          detail:
            "Email from billing@vendor-k.com mentions the refund is a \"duplicate shipment credit\" — doesn't specify which side of the relationship.",
          extractedAt: "2026-04-16T09:13:08",
          connector: "gmail",
        },
        {
          source: "Shared counterparty",
          detail:
            "Salesforce shows Vendor K as a customer account with an open $3,200 AR invoice dated Apr 12.",
          extractedAt: "2026-04-16T09:13:11",
          connector: "salesforce",
        },
      ],
      exceptionRationale:
        "No policy rule covers netting when the counterparty exists on both sides. Agent asks controller to either handle this instance or define the rule.",
    },
    resolutionOptions: ["confirm", "override", "delegate", "request-more-context"],
    evidenceRef: "e-advadj-vendork",
  },

  // 3. Rev rec, controller-sign-off-required, material. The content-dense centerpiece.
  {
    id: "p-003",
    workflowId: "rev-rec",
    exceptionType: "controller-sign-off-required",
    riskTier: "material",
    urgency: "normal",
    title: "Beacon Aerospace · $180K SaaS contract · 24 mo · 2 performance obligations",
    amount: 180000,
    counterparty: "Beacon Aerospace",
    flaggedBy: ["Rev Rec Agent"],
    timestamp: "2026-04-14T10:12:48",
    agentSuggestion: {
      action:
        "Classify as multi-element arrangement under ASC 606 · Allocate $168K to subscription PO, $12K to implementation PO · Post first recognition entry for April 2026",
      confidenceScore: 94,
      reasoning:
        "Contract explicitly prices two distinct deliverables — a 24-month SaaS subscription ($7K/mo) and a one-time 3-month implementation project ($12K). Both meet ASC 606 distinct-obligation criteria. Allocated via relative standalone selling prices from CRM historical data.",
      alternativeConsidered:
        "Single combined obligation recognized over 24 months — rejected because implementation is capable of being distinct and is distinct in the contract context.",
    },
    investigationContext: {
      priorPeriodTreatment:
        "14 single-obligation subscription contracts posted this period under policy RR-01 (auto-execute). This is the first multi-element contract this period.",
      sourceDocuments: [
        {
          source: "Signed MSA",
          detail:
            "DocuSign envelope BEA-SaaS-180K · Beacon Aerospace MSA · signed Apr 12 · 24-mo subscription + fixed-fee implementation.",
          extractedAt: "2026-04-13T14:22:11",
          connector: "docusign",
        },
        {
          source: "Signed contract copy",
          detail:
            "Beacon_MSA_2026.pdf in Legal > Signed Contracts — same hash as the DocuSign envelope.",
          extractedAt: "2026-04-13T14:22:18",
          connector: "google-drive",
        },
        {
          source: "CRM · Opportunity BEA-SAAS-24",
          detail:
            "Closed-Won · $180K TCV · line items: subscription $7,000/mo · implementation $12,000 flat · 18 comparable deals inform SSP range.",
          extractedAt: "2026-04-13T14:22:33",
          connector: "salesforce",
        },
        {
          source: "Deal announcement",
          detail:
            "#deals-finance Slack thread notes \"controller sign-off required on implementation allocation\" on Apr 12.",
          extractedAt: "2026-04-13T14:22:40",
          connector: "slack",
        },
      ],
      exceptionRationale:
        "Policy RR-02 requires controller sign-off on new multi-element arrangements regardless of confidence level.",
    },
    resolutionOptions: ["confirm", "override", "delegate", "request-more-context"],
    evidenceRef: "e-revrec-beacon",
  },

  // 4. Bank rec, material-flag, material. Unknown payee, no confident match.
  {
    id: "p-004",
    workflowId: "bank-rec",
    exceptionType: "material-flag",
    riskTier: "material",
    urgency: "high",
    title: "$78,500 outbound wire · unknown payee · no confident match",
    amount: 78500,
    counterparty: undefined,
    flaggedBy: ["Bank Rec Agent"],
    timestamp: "2026-04-15T15:22:50",
    agentSuggestion: null,
    investigationContext: {
      priorPeriodTreatment: "No prior outbound wire to this beneficiary name or amount in 12 months.",
      sourceDocuments: [
        {
          source: "Outbound wire",
          detail:
            "Apr 15 · 3:18 PM · $78,500 · beneficiary \"GENERAL PAYMENT\" · memo blank · no prior sends to this account.",
          extractedAt: "2026-04-15T15:19:44",
          connector: "svb-op",
        },
        {
          source: "No approval email",
          detail:
            "No thread in Gmail matches the amount, beneficiary, or likely keywords in the 7 days before the wire.",
          extractedAt: "2026-04-15T15:20:10",
          connector: "gmail",
        },
        {
          source: "No purchase order",
          detail:
            "No PO document in Finance > Purchase Orders matches the amount or the beneficiary string.",
          extractedAt: "2026-04-15T15:20:40",
          connector: "google-drive",
        },
      ],
      exceptionRationale:
        "Amount above the $50K material threshold. No confident match candidate. Manual review of source documents required.",
    },
    resolutionOptions: ["override", "delegate", "request-more-context"],
    evidenceRef: "e-bankrec-unknown",
  },

  // 5. Allocations (verification-flag), immaterial. Leads into the reversal graph.
  // The spec recommends routing the reversal-graph demo through this item.
  {
    id: "p-005",
    workflowId: "allocations",
    exceptionType: "verification-flag",
    riskTier: "immaterial",
    urgency: "normal",
    title:
      "Prior-period prepaid amortization · contract revised · verification agent suggests revert",
    amount: 4200,
    counterparty: "Aon Insurance",
    flaggedBy: ["Verification Agent", "Prepaids Agent"],
    timestamp: "2026-04-16T07:38:24",
    agentSuggestion: {
      action:
        "Revert the February amortization and rebuild the schedule from the revised contract terms (new coverage dates shift amortization start by 18 days)",
      confidenceScore: 88,
      reasoning:
        "Aon insurance policy was revised on Mar 29 (later ETL sync pulled the new PDF). Amortization schedule posted Feb 1 no longer reflects the revised coverage period. Re-amortizing shifts $4,200 of Feb-recognized expense into Mar and Apr.",
      alternativeConsidered:
        "Catch-up entry in April only — rejected because it leaves the February books with a material-threshold-exceeding misstatement for the prepaid balance account.",
    },
    investigationContext: {
      priorPeriodTreatment:
        "Aon Insurance quarterly policy posted auto-execute under policy PR-01 on Feb 1 ($84,000 total · 12-month amortization · $7,000/mo).",
      sourceDocuments: [
        {
          source: "Revised policy PDF",
          detail:
            "Aon_Policy_2026_rev.pdf in Finance > Insurance > Aon · revised Mar 29 · coverage period shifted by 18 days.",
          extractedAt: "2026-04-16T06:42:00",
          connector: "google-drive",
        },
        {
          source: "Vendor notice",
          detail:
            "Email from policy-admin@aon.com confirming the revision and attaching the updated schedule.",
          extractedAt: "2026-04-16T06:42:18",
          connector: "gmail",
        },
      ],
      exceptionRationale:
        "Verification agent cross-checked the current prepaid amortization schedule against the contract terms in the ETL-refreshed PDF and found a mismatch. Flagged for revert.",
    },
    resolutionOptions: ["revert", "mark-reviewed", "delegate"],
    evidenceRef: "e-verify-prepaid",
  },

  // 6. AP, ask-clarification lane, immaterial. New vendor.
  {
    id: "p-006",
    workflowId: "ap",
    exceptionType: "no-policy-match",
    riskTier: "immaterial",
    urgency: "low",
    title: "New vendor · Stellar Logistics LLC · $4,200 invoice · awaiting classification",
    amount: 4200,
    counterparty: "Stellar Logistics LLC",
    flaggedBy: ["AP Agent"],
    timestamp: "2026-04-16T10:08:44",
    agentSuggestion: {
      action: "Classify under \"Shipping and Freight\" (account 5410) based on vendor-name pattern",
      confidenceScore: 65,
      reasoning:
        "Vendor name contains \"Logistics\" which correlates with shipping/freight vendors in the historical vendor master. No historical coding exists for this exact vendor. No policy rule specifies a default for new Logistics-named vendors.",
      alternativeConsidered:
        "Route as uncoded bill awaiting manual classification — rejected because the vendor-name signal is strong enough to offer a starting point.",
    },
    investigationContext: {
      priorPeriodTreatment: "First invoice from Stellar Logistics LLC — no prior history.",
      sourceDocuments: [
        {
          source: "Vendor invoice",
          detail:
            "Email from ap@stellarlogistics.com with invoice #SL-0042 attached · $4,200 · freight services · Apr 14.",
          extractedAt: "2026-04-16T10:07:02",
          connector: "gmail",
        },
      ],
      exceptionRationale:
        "No vendor history, no prior coding, no policy match. Agent asks the controller to confirm the classification before posting.",
    },
    resolutionOptions: ["confirm", "override", "delegate"],
    evidenceRef: "e-ap-stellar",
  },
];
