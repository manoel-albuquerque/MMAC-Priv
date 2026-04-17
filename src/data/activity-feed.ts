import type { ActivityEntry } from "./types";

// Fixed set of 30 enriched transactions that cycle via the treadmill (see
// reducer POP_FEED_QUEUE). The oldest entry is rotated to the top with a
// refreshed timestamp on every tick — no new entries are minted at runtime.
//
// Distribution:
//   15 · bank-rec (mix of matched money-in, matched money-out, categorized,
//        and one needs-help that ties to the pending queue)
//    6 · ar   (cash applied to invoices)
//    5 · ap   (bill drafts / payments)
//    2 · rev-rec
//    1 · advanced-adjustments
//    1 · allocations
//
// Three entries (a-0037, a-0038, a-0039) are referenced from the pending
// queue seed — their ids are preserved so the Pending Review pane stays
// wired.
//
// Cast of counterparties (consistent across prototype):
//   Customers: Acme Corp, Beacon Aerospace, Continental Robotics,
//              Deltamark Engineering, Excelis Medical
//   Vendors:   Stellar Logistics, Redline Materials, Northpoint Steel,
//              Meridian Supplies Co, Pacific Coating, Vertex Industrial,
//              Kepler Machining, Aon Insurance, Adobe, Rippling, WeWork

export const historicalActivity: ActivityEntry[] = [
  // ============================================================
  // BANK REC (15)
  // ============================================================
  {
    id: "a-0001",
    timestamp: "2026-04-01T08:14:02",
    workflowId: "bank-rec",
    agentName: "Bank Rec Agent",
    lane: "auto-execute",
    action: "Match posted · Acme Corp wire · INV-2018 · $18,200",
    outcome: "auto-posted",
    confidenceScore: 98,
    policyCited: "BR-04",
    amount: 18200,
    counterparty: "Acme Corp",
    transactionDetail: {
      nature: "money-in",
      state: "matched",
      matchable: true,
      humanSummary:
        "Acme Corp paid $18,200 by wire — matched to invoice INV-2018 for Q1 panel assemblies.",
      match: {
        kind: "invoice",
        recordId: "INV-2018",
        recordLabel: "Invoice INV-2018",
        counterparty: "Acme Corp",
        amount: 18200,
        date: "2026-03-18",
        openBalance: 0,
        note: "Q1 panel assemblies · net-30",
      },
      evidence: [
        {
          label: "Wire cleared",
          detail: "Inbound wire of $18,200 from Acme Corp, ref line \"Acme Q1 panels\".",
          connector: "svb-op",
        },
        {
          label: "Remittance email",
          detail:
            "Remittance advice from ap@acme-corp.com on Apr 1 07:58 references INV-2018 explicitly.",
          connector: "gmail",
        },
        {
          label: "Amount match",
          detail: "Wire amount matches invoice open balance exactly.",
        },
      ],
      postedActions: ["unmatch", "recategorize", "revert", "exclude"],
      pendingActions: [],
    },
  },
  {
    id: "a-0002",
    timestamp: "2026-04-02T07:55:21",
    workflowId: "bank-rec",
    agentName: "Bank Rec Agent",
    lane: "auto-execute",
    action: "Match posted · Deltamark Engineering · INV-2020 · $9,850",
    outcome: "auto-posted",
    confidenceScore: 97,
    policyCited: "BR-04",
    amount: 9850,
    counterparty: "Deltamark Engineering",
    transactionDetail: {
      nature: "money-in",
      state: "matched",
      matchable: true,
      humanSummary:
        "Deltamark Engineering paid $9,850 — matched to invoice INV-2020 for February prototyping services.",
      match: {
        kind: "invoice",
        recordId: "INV-2020",
        recordLabel: "Invoice INV-2020",
        counterparty: "Deltamark Engineering",
        amount: 9850,
        date: "2026-03-09",
        openBalance: 0,
        note: "February prototyping · net-30",
      },
      evidence: [
        {
          label: "Amount match",
          detail: "ACH credit $9,850 matches invoice balance exactly.",
        },
        {
          label: "Originator",
          detail:
            "ACH originator ID matches Deltamark's established remitter profile.",
        },
      ],
      postedActions: ["unmatch", "recategorize", "revert", "exclude"],
      pendingActions: [],
    },
  },
  {
    id: "a-0003",
    timestamp: "2026-04-02T08:42:11",
    workflowId: "bank-rec",
    agentName: "Bank Rec Agent",
    lane: "auto-execute",
    action: "Match posted · Northpoint Steel (AP) · bill #NS-4418 · $14,200",
    outcome: "auto-posted",
    confidenceScore: 96,
    policyCited: "BR-04",
    amount: 14200,
    counterparty: "Northpoint Steel",
    transactionDetail: {
      nature: "money-out",
      state: "matched",
      matchable: true,
      humanSummary:
        "Paid Northpoint Steel $14,200 by ACH — matched to bill NS-4418 for raw steel delivery.",
      match: {
        kind: "bill",
        recordId: "NS-4418",
        recordLabel: "Bill NS-4418",
        counterparty: "Northpoint Steel",
        amount: 14200,
        date: "2026-03-21",
        openBalance: 0,
        note: "Raw steel · PO-2044 · net-30",
      },
      evidence: [
        {
          label: "ACH debit",
          detail: "$14,200 outbound ACH to Northpoint Steel's verified routing.",
          connector: "svb-op",
        },
        {
          label: "PO tie-out",
          detail:
            "Purchase order PO-2044.pdf referenced by bill NS-4418 — receiving doc signed Mar 25.",
          connector: "google-drive",
        },
        {
          label: "Vendor invoice",
          detail:
            "Scanned invoice NS-4418 uploaded via ap@northpoint-steel.com matches line items on PO-2044.",
          connector: "gmail",
        },
      ],
      postedActions: ["unmatch", "recategorize", "revert", "exclude"],
      pendingActions: [],
    },
  },
  {
    id: "a-0004",
    timestamp: "2026-04-03T09:03:24",
    workflowId: "bank-rec",
    agentName: "Bank Rec Agent",
    lane: "auto-execute",
    action: "Match posted · Vertex Industrial (AP) · bill #VI-0981 · $11,560",
    outcome: "auto-posted",
    confidenceScore: 95,
    policyCited: "BR-04",
    amount: 11560,
    counterparty: "Vertex Industrial",
    transactionDetail: {
      nature: "money-out",
      state: "matched",
      matchable: true,
      humanSummary:
        "Paid Vertex Industrial $11,560 — matched to bill VI-0981 for precision machining services.",
      match: {
        kind: "bill",
        recordId: "VI-0981",
        recordLabel: "Bill VI-0981",
        counterparty: "Vertex Industrial",
        amount: 11560,
        date: "2026-03-24",
        openBalance: 0,
        note: "Precision machining · PO-2051",
      },
      evidence: [
        {
          label: "Amount match",
          detail: "ACH debit matches bill balance exactly.",
        },
        {
          label: "Vendor history",
          detail:
            "Vertex has 11 prior auto-matched payments with this originator ID.",
        },
      ],
      postedActions: ["unmatch", "recategorize", "revert", "exclude"],
      pendingActions: [],
    },
  },
  {
    id: "a-0005",
    timestamp: "2026-04-04T09:02:00",
    workflowId: "bank-rec",
    agentName: "Bank Rec Agent",
    lane: "auto-execute",
    action: "Stripe settlement batch · $18,441 (104 transactions)",
    outcome: "auto-posted",
    confidenceScore: 99,
    policyCited: "BR-07",
    amount: 18441,
    transactionDetail: {
      nature: "money-in",
      state: "categorized",
      matchable: false,
      humanSummary:
        "Stripe settlement deposit of $18,441 — posted as net payment processor settlement covering 104 underlying charges.",
      categorization: {
        account: "Cash · Operating Checking",
        dimensions: {},
        memo: "Stripe net settlement · 104 charges · gross $19,284 less fees $843",
        splits: [
          {
            account: "Cash · Operating Checking",
            side: "DR",
            amount: 18441,
            basis: "Net deposit from Stripe settlement",
          },
          {
            account: "Merchant Processing Fees",
            side: "DR",
            amount: 843,
            basis: "Stripe processing fees · Apr 3 batch",
            department: "S&M",
            location: "HQ",
            dimensions: { revenueStream: "Online Sales" },
          },
          {
            account: "Sales Revenue",
            side: "CR",
            amount: 19284,
            basis: "Gross Stripe sales · 104 charges",
            department: "S&M",
            location: "HQ",
            dimensions: {
              segment: "SMB",
              revenueStream: "Online Sales",
            },
          },
        ],
      },
      evidence: [
        {
          label: "Settlement file",
          detail:
            "Settlement file stripe-settle-2026-04-03.json lists 104 charges totaling $19,284 with fees $843.",
          connector: "stripe",
        },
        {
          label: "Bank deposit",
          detail:
            "$18,441 ACH credit from Stripe cleared in the operating account — matches gross minus fees within $1.",
          connector: "svb-op",
        },
        {
          label: "Rule match",
          detail:
            "Prior period rule BR-07 auto-categorizes Stripe settlements to the same account and class.",
        },
      ],
      postedActions: ["recategorize", "revert", "exclude"],
      pendingActions: [],
    },
  },
  {
    id: "a-0006",
    timestamp: "2026-04-06T09:47:33",
    workflowId: "bank-rec",
    agentName: "Bank Rec Agent",
    lane: "auto-execute",
    action: "Bank fee · monthly service charge · $35.00",
    outcome: "auto-posted",
    confidenceScore: 99,
    policyCited: "BR-09",
    amount: 35,
    transactionDetail: {
      nature: "money-out",
      state: "categorized",
      matchable: false,
      humanSummary:
        "Chase charged $35 for the April monthly service fee — categorized as a bank service charge.",
      categorization: {
        account: "Bank Service Charges",
        dimensions: {},
        memo: "Chase · Operating Checking · April 2026",
        splits: [
          {
            account: "Bank Service Charges",
            side: "DR",
            amount: 35,
            basis: "Monthly service fee · April",
            department: "Finance",
            location: "HQ",
            dimensions: { costCenter: "CC-120" },
          },
          {
            account: "Cash · Operating Checking",
            side: "CR",
            amount: 35,
            basis: "Auto-debited by Chase",
          },
        ],
      },
      evidence: [
        {
          label: "Recurring pattern",
          detail:
            "$35 charge posts on the 6th of each month from the same bank descriptor — 12-month streak.",
        },
        {
          label: "Policy BR-09",
          detail:
            "Bank service charges auto-categorize when amount matches the monthly fee pattern.",
        },
      ],
      postedActions: ["recategorize", "revert", "exclude"],
      pendingActions: [],
    },
  },
  {
    id: "a-0007",
    timestamp: "2026-04-07T08:22:15",
    workflowId: "bank-rec",
    agentName: "Bank Rec Agent",
    lane: "auto-execute",
    action: "Match posted · Beacon Aerospace · INV-2024 · $101,200",
    outcome: "auto-posted",
    confidenceScore: 98,
    policyCited: "BR-04",
    amount: 101200,
    counterparty: "Beacon Aerospace",
    transactionDetail: {
      nature: "money-in",
      state: "matched",
      matchable: true,
      humanSummary:
        "Beacon Aerospace paid $101,200 by wire — matched to invoice INV-2024 for Q1 avionics deliverable.",
      match: {
        kind: "invoice",
        recordId: "INV-2024",
        recordLabel: "Invoice INV-2024",
        counterparty: "Beacon Aerospace",
        amount: 101200,
        date: "2026-03-12",
        openBalance: 0,
        note: "Q1 avionics deliverable · milestone 3 of 4",
      },
      evidence: [
        {
          label: "Wire received",
          detail:
            "$101,200 wire in · memo \"Beacon PO-1189 milestone 3\" · sender ABA matches Beacon's historical origin.",
          connector: "svb-op",
        },
        {
          label: "Signed milestone acceptance",
          detail:
            "DocuSign envelope BEA-M3-ACPT completed by Beacon PM on Mar 28 confirms milestone 3 deliverable accepted.",
          connector: "docusign",
        },
        {
          label: "Remittance thread",
          detail:
            "Email chain with ap@beacon-aero.com referenced INV-2024 and the PO number one day before the wire.",
          connector: "gmail",
        },
      ],
      postedActions: ["unmatch", "recategorize", "revert", "exclude"],
      pendingActions: [],
    },
  },
  {
    id: "a-0008",
    timestamp: "2026-04-08T10:14:02",
    workflowId: "bank-rec",
    agentName: "Bank Rec Agent",
    lane: "auto-execute",
    action: "Match posted · Pacific Coating (AP) · bill #PC-3301 · $7,850",
    outcome: "auto-posted",
    confidenceScore: 94,
    policyCited: "BR-04",
    amount: 7850,
    counterparty: "Pacific Coating",
    transactionDetail: {
      nature: "money-out",
      state: "matched",
      matchable: true,
      humanSummary:
        "Paid Pacific Coating $7,850 — matched to bill PC-3301 for the March powder-coat run.",
      match: {
        kind: "bill",
        recordId: "PC-3301",
        recordLabel: "Bill PC-3301",
        counterparty: "Pacific Coating",
        amount: 7850,
        date: "2026-03-19",
        openBalance: 0,
        note: "Powder coat · March run · net-30",
      },
      evidence: [
        {
          label: "Amount match",
          detail: "ACH debit matches bill balance exactly.",
        },
        {
          label: "Vendor ID",
          detail:
            "Payment routed to Pacific Coating's verified ACH destination.",
        },
      ],
      postedActions: ["unmatch", "recategorize", "revert", "exclude"],
      pendingActions: [],
    },
  },
  {
    id: "a-0009",
    timestamp: "2026-04-09T07:38:14",
    workflowId: "bank-rec",
    agentName: "Bank Rec Agent",
    lane: "auto-execute",
    action: "Interest earned · $112.48",
    outcome: "auto-posted",
    confidenceScore: 99,
    policyCited: "BR-09",
    amount: 112,
    transactionDetail: {
      nature: "money-in",
      state: "categorized",
      matchable: false,
      humanSummary:
        "Chase deposited $112.48 in interest on the operating checking account — categorized as interest income.",
      categorization: {
        account: "Interest Income",
        dimensions: {},
        memo: "Chase · April interest · Operating Checking",
        splits: [
          {
            account: "Cash · Operating Checking",
            side: "DR",
            amount: 112,
            basis: "April interest earned",
          },
          {
            account: "Interest Income",
            side: "CR",
            amount: 112,
            basis: "Operating checking earnings",
            department: "Finance",
            location: "HQ",
          },
        ],
      },
      evidence: [
        {
          label: "Pattern",
          detail:
            "Bank descriptor \"INTEREST EARNED\" posts on the 9th of every month.",
        },
        {
          label: "Policy BR-09",
          detail: "Interest income auto-categorizes when descriptor matches.",
        },
      ],
      postedActions: ["recategorize", "revert", "exclude"],
      pendingActions: [],
    },
  },
  {
    id: "a-0010",
    timestamp: "2026-04-10T09:22:48",
    workflowId: "bank-rec",
    agentName: "Bank Rec Agent",
    lane: "auto-execute",
    action: "Match posted · Continental Robotics · INV-2023 · $55,200",
    outcome: "auto-posted",
    confidenceScore: 97,
    policyCited: "BR-04",
    amount: 55200,
    counterparty: "Continental Robotics",
    transactionDetail: {
      nature: "money-in",
      state: "matched",
      matchable: true,
      humanSummary:
        "Continental Robotics paid $55,200 — matched to invoice INV-2023 for Q1 automation services.",
      match: {
        kind: "invoice",
        recordId: "INV-2023",
        recordLabel: "Invoice INV-2023",
        counterparty: "Continental Robotics",
        amount: 55200,
        date: "2026-03-11",
        openBalance: 0,
        note: "Q1 automation services · net-30",
      },
      evidence: [
        {
          label: "Amount match",
          detail: "Wire amount matches invoice balance exactly.",
        },
        {
          label: "Memo",
          detail: "Wire memo references \"Continental Q1 services\".",
        },
      ],
      postedActions: ["unmatch", "recategorize", "revert", "exclude"],
      pendingActions: [],
    },
  },
  {
    id: "a-0011",
    timestamp: "2026-04-11T11:05:09",
    workflowId: "bank-rec",
    agentName: "Bank Rec Agent",
    lane: "auto-execute",
    action: "Payroll run · Rippling · $168,400",
    outcome: "auto-posted",
    confidenceScore: 99,
    policyCited: "BR-11",
    amount: 168400,
    counterparty: "Rippling",
    transactionDetail: {
      nature: "money-out",
      state: "categorized",
      matchable: false,
      humanSummary:
        "Rippling processed the bi-weekly payroll run of $168,400 — categorized to Payroll Wages.",
      categorization: {
        account: "Payroll Wages",
        dimensions: {},
        memo: "Rippling payroll · 47 employees · pay period Mar 30 – Apr 10",
        splits: [
          {
            account: "Payroll Wages",
            side: "DR",
            amount: 118400,
            basis: "Operations · pay period Mar 30 – Apr 10",
            department: "Operations",
            location: "Plant 1",
            dimensions: { costCenter: "CC-310" },
          },
          {
            account: "Payroll Wages",
            side: "DR",
            amount: 50000,
            basis: "G&A + S&M headcount · same period",
            department: "G&A",
            location: "HQ",
            dimensions: { costCenter: "CC-110" },
          },
          {
            account: "Cash · Payroll Account",
            side: "CR",
            amount: 168400,
            basis: "Funded via Rippling · 47 employees",
          },
        ],
      },
      evidence: [
        {
          label: "Rippling API",
          detail:
            "Rippling payroll run rip-2026-pp-07 confirms $168,400 total net pay for 47 employees.",
        },
        {
          label: "Pattern",
          detail:
            "Bi-weekly run clears on a Friday — same cadence as the last 26 runs.",
        },
        {
          label: "Policy BR-11",
          detail:
            "Payroll runs auto-categorize when Rippling originator ID matches.",
        },
      ],
      postedActions: ["recategorize", "revert", "exclude"],
      pendingActions: [],
    },
  },
  {
    id: "a-0012",
    timestamp: "2026-04-13T08:18:44",
    workflowId: "bank-rec",
    agentName: "Bank Rec Agent",
    lane: "auto-execute",
    action: "Match posted · Meridian Supplies Co · INV-2025 · $3,180",
    outcome: "auto-posted",
    confidenceScore: 98,
    policyCited: "BR-04",
    amount: 3180,
    counterparty: "Meridian Supplies Co",
    transactionDetail: {
      nature: "money-in",
      state: "matched",
      matchable: true,
      humanSummary:
        "Meridian Supplies paid $3,180 — matched to invoice INV-2025 for safety equipment resale.",
      match: {
        kind: "invoice",
        recordId: "INV-2025",
        recordLabel: "Invoice INV-2025",
        counterparty: "Meridian Supplies Co",
        amount: 3180,
        date: "2026-03-14",
        openBalance: 0,
        note: "Safety equipment · net-30",
      },
      evidence: [
        {
          label: "Amount match",
          detail: "ACH credit matches invoice balance exactly.",
        },
        {
          label: "Remittance",
          detail: "Remittance line references INV-2025 explicitly.",
        },
      ],
      postedActions: ["unmatch", "recategorize", "revert", "exclude"],
      pendingActions: [],
    },
  },
  {
    id: "a-0013",
    timestamp: "2026-04-14T09:41:22",
    workflowId: "bank-rec",
    agentName: "Bank Rec Agent",
    lane: "auto-execute",
    action: "Match posted · Kepler Machining (AP) · bill #KM-2210 · $22,340",
    outcome: "auto-posted",
    confidenceScore: 96,
    policyCited: "BR-04",
    amount: 22340,
    counterparty: "Kepler Machining",
    transactionDetail: {
      nature: "money-out",
      state: "matched",
      matchable: true,
      humanSummary:
        "Paid Kepler Machining $22,340 — matched to bill KM-2210 for the new CNC tool package.",
      match: {
        kind: "bill",
        recordId: "KM-2210",
        recordLabel: "Bill KM-2210",
        counterparty: "Kepler Machining",
        amount: 22340,
        date: "2026-03-28",
        openBalance: 0,
        note: "CNC tool package · PO-2063 · net-30",
      },
      evidence: [
        {
          label: "Amount match",
          detail: "ACH debit matches bill balance exactly.",
        },
        {
          label: "PO referenced",
          detail:
            "Bill KM-2210 references PO-2063 which was marked received on 2026-03-30.",
        },
      ],
      postedActions: ["unmatch", "recategorize", "revert", "exclude"],
      pendingActions: [],
    },
  },
  {
    id: "a-0037",
    timestamp: "2026-04-15T11:47:18",
    workflowId: "bank-rec",
    agentName: "Bank Rec Agent",
    lane: "auto-execute",
    action: "Routed to pending · Acme Corp wire · $12,400 · confidence 91%",
    outcome: "routed-to-pending",
    confidenceScore: 91,
    evidenceRef: "e-bankrec-acme",
    amount: 12400,
    counterparty: "Acme Corp",
    transactionDetail: {
      nature: "money-in",
      state: "needs-help",
      matchable: true,
      humanSummary:
        "Acme Corp sent $12,400 by wire — multiple possible invoices, confidence below auto-post threshold.",
      match: {
        kind: "invoice",
        recordId: "INV-2041",
        recordLabel: "Invoice INV-2041",
        counterparty: "Acme Corp",
        amount: 12400,
        date: "2026-04-08",
        openBalance: 12400,
        note: "Panel assemblies · Apr shipment · net-30",
      },
      matchAlternatives: [
        {
          kind: "invoice",
          recordId: "INV-2038",
          recordLabel: "Invoice INV-2038",
          counterparty: "Acme Corp",
          amount: 12400,
          date: "2026-03-30",
          openBalance: 12400,
          note: "Partial Q1 true-up — same amount, older",
        },
        {
          kind: "invoice",
          recordId: "INV-2044",
          recordLabel: "Invoice INV-2044",
          counterparty: "Acme Corp",
          amount: 6200,
          date: "2026-04-11",
          openBalance: 6200,
          note: "Possible combined payment (2× $6,200 = $12,400)",
        },
      ],
      evidence: [
        {
          label: "Wire received",
          detail:
            "$12,400 inbound · memo \"Acme Corp Q1\" · sender matches Acme's historical ABA.",
          connector: "svb-op",
        },
        {
          label: "No remittance email",
          detail:
            "No remittance advice from any Acme Corp email domain in the 48 hours around the wire.",
          connector: "gmail",
        },
        {
          label: "CRM activity",
          detail:
            "Salesforce shows two Closed-Won opportunities and one Partial-Payment stage — can't disambiguate invoice from CRM alone.",
          connector: "salesforce",
        },
        {
          label: "Payment history",
          detail:
            "Acme typically sends one wire per invoice, but has sent combined payments twice in the last 12 months.",
        },
      ],
      postedActions: [],
      pendingActions: [
        "confirm",
        "override",
        "change-to-categorize",
        "delegate",
      ],
    },
  },
  {
    id: "a-0038",
    timestamp: "2026-04-15T15:22:50",
    workflowId: "bank-rec",
    agentName: "Bank Rec Agent",
    lane: "auto-execute",
    action:
      "Routed to pending · outbound wire $78,500 · unknown payee · material-flag",
    outcome: "routed-to-pending",
    confidenceScore: 0,
    evidenceRef: "e-bankrec-unknown",
    amount: 78500,
    transactionDetail: {
      nature: "money-out",
      state: "needs-help",
      matchable: true,
      humanSummary:
        "Outbound wire of $78,500 cleared with no matching bill and an unfamiliar payee — flagged material for review.",
      evidence: [
        {
          label: "Outbound wire",
          detail:
            "$78,500 wire out · beneficiary \"Hawthorne Holdings LLC\" · no prior transactions to this account.",
          connector: "svb-op",
        },
        {
          label: "No invoice or PO",
          detail:
            "No matching bill in AP and no PO document found in Finance > Purchase Orders.",
          connector: "google-drive",
        },
        {
          label: "No approval email",
          detail:
            "No approval thread found in Gmail referencing this amount, this payee, or matching keywords.",
          connector: "gmail",
        },
        {
          label: "Threshold",
          detail:
            "Amount exceeds material threshold — manual confirmation required per policy.",
        },
      ],
      postedActions: [],
      pendingActions: [
        "confirm",
        "override",
        "change-to-categorize",
        "delegate",
      ],
    },
  },

  // ============================================================
  // AR (6)
  // ============================================================
  {
    id: "a-0014",
    timestamp: "2026-04-01T11:17:09",
    workflowId: "ar",
    agentName: "AR Agent",
    lane: "auto-execute",
    action: "Cash applied · Beacon Aerospace · INV-2011 · $67,400",
    outcome: "auto-posted",
    confidenceScore: 96,
    policyCited: "AR-03",
    amount: 67400,
    counterparty: "Beacon Aerospace",
    transactionDetail: {
      nature: "money-in",
      state: "matched",
      matchable: true,
      humanSummary:
        "Beacon Aerospace paid $67,400 — applied to invoice INV-2011 for the Q1 engineering services milestone.",
      match: {
        kind: "invoice",
        recordId: "INV-2011",
        recordLabel: "Invoice INV-2011",
        counterparty: "Beacon Aerospace",
        amount: 67400,
        date: "2026-03-03",
        openBalance: 0,
        note: "Q1 engineering milestone · net-30",
      },
      evidence: [
        {
          label: "Remittance email",
          detail:
            "Email from accounts-payable@beacon-aero.com with subject \"Payment for INV-2011\" matches the amount and reference.",
          connector: "gmail",
        },
        {
          label: "CRM opportunity",
          detail:
            "Salesforce opportunity BEA-Q1-ENG is Closed-Won and references the same Beacon account as INV-2011.",
          connector: "salesforce",
        },
        {
          label: "Amount match",
          detail: "Payment $67,400 matches invoice balance exactly.",
        },
      ],
      postedActions: ["unmatch", "recategorize", "revert", "exclude"],
      pendingActions: [],
    },
  },
  {
    id: "a-0015",
    timestamp: "2026-04-03T10:22:47",
    workflowId: "ar",
    agentName: "AR Agent",
    lane: "auto-execute",
    action: "Cash applied · Acme Corp · INV-2012 · $24,100",
    outcome: "auto-posted",
    confidenceScore: 97,
    policyCited: "AR-03",
    amount: 24100,
    counterparty: "Acme Corp",
    transactionDetail: {
      nature: "money-in",
      state: "matched",
      matchable: true,
      humanSummary:
        "Acme Corp paid $24,100 — applied to invoice INV-2012 for Q1 component assemblies.",
      match: {
        kind: "invoice",
        recordId: "INV-2012",
        recordLabel: "Invoice INV-2012",
        counterparty: "Acme Corp",
        amount: 24100,
        date: "2026-03-05",
        openBalance: 0,
        note: "Q1 component assemblies · net-30",
      },
      evidence: [
        {
          label: "Amount match",
          detail: "Payment matches invoice balance exactly.",
        },
        {
          label: "Remittance",
          detail: "Lockbox remittance file referenced INV-2012 explicitly.",
        },
      ],
      postedActions: ["unmatch", "recategorize", "revert", "exclude"],
      pendingActions: [],
    },
  },
  {
    id: "a-0016",
    timestamp: "2026-04-07T14:03:11",
    workflowId: "ar",
    agentName: "AR Agent",
    lane: "auto-execute",
    action: "Cash applied · Deltamark Engineering · INV-2013 · $17,600",
    outcome: "auto-posted",
    confidenceScore: 96,
    policyCited: "AR-03",
    amount: 17600,
    counterparty: "Deltamark Engineering",
    transactionDetail: {
      nature: "money-in",
      state: "matched",
      matchable: true,
      humanSummary:
        "Deltamark Engineering paid $17,600 — applied to invoice INV-2013 for process engineering work.",
      match: {
        kind: "invoice",
        recordId: "INV-2013",
        recordLabel: "Invoice INV-2013",
        counterparty: "Deltamark Engineering",
        amount: 17600,
        date: "2026-03-08",
        openBalance: 0,
        note: "Process engineering · hourly billing · net-30",
      },
      evidence: [
        {
          label: "Amount match",
          detail: "Payment matches invoice balance exactly.",
        },
        {
          label: "Customer pattern",
          detail:
            "Deltamark pays on day 30 every cycle — this payment landed day 30 exactly.",
        },
      ],
      postedActions: ["unmatch", "recategorize", "revert", "exclude"],
      pendingActions: [],
    },
  },
  {
    id: "a-0017",
    timestamp: "2026-04-10T11:24:18",
    workflowId: "ar",
    agentName: "AR Agent",
    lane: "auto-execute",
    action: "Cash applied · Excelis Medical · INV-2014 · $41,200",
    outcome: "auto-posted",
    confidenceScore: 95,
    policyCited: "AR-03",
    amount: 41200,
    counterparty: "Excelis Medical",
    transactionDetail: {
      nature: "money-in",
      state: "matched",
      matchable: true,
      humanSummary:
        "Excelis Medical paid $41,200 — applied to invoice INV-2014 for Q1 assembly services.",
      match: {
        kind: "invoice",
        recordId: "INV-2014",
        recordLabel: "Invoice INV-2014",
        counterparty: "Excelis Medical",
        amount: 41200,
        date: "2026-03-12",
        openBalance: 0,
        note: "Q1 assembly services · net-30",
      },
      evidence: [
        {
          label: "Amount match",
          detail: "Payment matches invoice balance exactly.",
        },
        {
          label: "Lockbox ref",
          detail: "Lockbox payment slip referenced INV-2014.",
        },
      ],
      postedActions: ["unmatch", "recategorize", "revert", "exclude"],
      pendingActions: [],
    },
  },
  {
    id: "a-0018",
    timestamp: "2026-04-14T10:47:03",
    workflowId: "ar",
    agentName: "AR Agent",
    lane: "auto-execute",
    action: "Cash applied · Continental Robotics · INV-2015 · $33,800",
    outcome: "auto-posted",
    confidenceScore: 97,
    policyCited: "AR-03",
    amount: 33800,
    counterparty: "Continental Robotics",
    transactionDetail: {
      nature: "money-in",
      state: "matched",
      matchable: true,
      humanSummary:
        "Continental Robotics paid $33,800 — applied to invoice INV-2015 for March automation retainer.",
      match: {
        kind: "invoice",
        recordId: "INV-2015",
        recordLabel: "Invoice INV-2015",
        counterparty: "Continental Robotics",
        amount: 33800,
        date: "2026-03-15",
        openBalance: 0,
        note: "Automation retainer · monthly · net-30",
      },
      evidence: [
        {
          label: "Amount match",
          detail: "Payment matches invoice balance exactly.",
        },
        {
          label: "Recurring",
          detail:
            "Same amount, same day-of-month for the last 6 consecutive months.",
        },
      ],
      postedActions: ["unmatch", "recategorize", "revert", "exclude"],
      pendingActions: [],
    },
  },
  {
    id: "a-0019",
    timestamp: "2026-04-16T09:12:42",
    workflowId: "ar",
    agentName: "AR Agent",
    lane: "draft-confirm",
    action: "Partial payment · Meridian Supplies · $1,500 of $3,180 · INV-2016",
    outcome: "controller-confirmed",
    confidenceScore: 88,
    policyCited: "AR-04",
    amount: 1500,
    counterparty: "Meridian Supplies Co",
    transactionDetail: {
      nature: "money-in",
      state: "matched",
      matchable: true,
      humanSummary:
        "Meridian Supplies paid $1,500 — applied as a partial payment against invoice INV-2016; $1,680 remains open.",
      match: {
        kind: "invoice",
        recordId: "INV-2016",
        recordLabel: "Invoice INV-2016",
        counterparty: "Meridian Supplies Co",
        amount: 3180,
        date: "2026-03-17",
        openBalance: 1680,
        note: "Partial payment applied · remainder due",
      },
      evidence: [
        {
          label: "Partial pattern",
          detail:
            "Meridian has historically split larger invoices into two tranches.",
        },
        {
          label: "Remittance",
          detail: "Check memo line references INV-2016 partial.",
        },
      ],
      postedActions: ["unmatch", "recategorize", "revert", "exclude"],
      pendingActions: [],
    },
  },

  // ============================================================
  // AP (5)
  // ============================================================
  {
    id: "a-0020",
    timestamp: "2026-04-01T10:02:58",
    workflowId: "ap",
    agentName: "AP Agent",
    lane: "draft-confirm",
    action: "Draft bill · Redline Materials · raw steel order · $28,400",
    outcome: "controller-confirmed",
    confidenceScore: 93,
    policyCited: "AP-02",
    amount: 28400,
    counterparty: "Redline Materials",
    transactionDetail: {
      nature: "money-out",
      state: "categorized",
      matchable: false,
      humanSummary:
        "AP drafted a bill from Redline Materials for $28,400 against PO-2039 — raw steel for the Q2 run.",
      categorization: {
        account: "Raw Materials Inventory",
        dimensions: {},
        memo: "Redline Materials · raw steel · PO-2039",
        splits: [
          {
            account: "Raw Materials Inventory",
            side: "DR",
            amount: 28400,
            basis: "Steel received against PO-2039",
            department: "Operations",
            project: "PRJ-Q2-2026",
            location: "Plant 1",
            dimensions: { costCenter: "CC-310" },
          },
          {
            account: "Accounts Payable · Redline Materials",
            side: "CR",
            amount: 28400,
            basis: "Bill drafted · net-30",
          },
        ],
      },
      evidence: [
        {
          label: "Purchase order",
          detail:
            "PO-2039.pdf from Operations folder shows steel quantities and unit prices matching Redline invoice within 1%.",
          connector: "google-drive",
        },
        {
          label: "Vendor invoice",
          detail:
            "Scanned invoice RM-2026-04 attached to email from billing@redline-materials.com on Apr 1.",
          connector: "gmail",
        },
        {
          label: "Vendor history",
          detail: "Redline has 23 prior bills in the same account/class pair.",
        },
      ],
      postedActions: ["recategorize", "revert", "exclude"],
      pendingActions: [],
    },
  },
  {
    id: "a-0021",
    timestamp: "2026-04-02T09:18:44",
    workflowId: "prepaids-amortization",
    agentName: "Prepaids Agent",
    lane: "auto-execute",
    action:
      "Prepaid schedule created · Adobe annual renewal · $28,080 · month 1 of 12 recognized",
    outcome: "auto-posted",
    confidenceScore: 99,
    policyCited: "PR-01",
    amount: 2340,
    counterparty: "Adobe",
    transactionDetail: {
      nature: "internal",
      state: "categorized",
      matchable: false,
      humanSummary:
        "Adobe Creative Cloud annual renewal of $28,080 was paid up front — April's $2,340 posted to software expense and the remaining $25,740 moved to prepaid expenses with an 11-month amortization schedule.",
      categorization: {
        account: "Software Subscription Expense",
        dimensions: {},
        memo: "Adobe Creative Cloud · 12-seat annual renewal",
        splits: [
          {
            account: "Software Subscription Expense",
            side: "DR",
            amount: 2340,
            basis: "April recognition · month 1 of 12",
            department: "G&A",
            location: "HQ",
            dimensions: { costCenter: "CC-110" },
          },
          {
            account: "Prepaid Expenses",
            side: "DR",
            amount: 25740,
            basis: "11 months remaining · auto-amortize",
          },
          {
            account: "Cash · Operating Checking",
            side: "CR",
            amount: 28080,
            basis: "Paid via wire · Apr 2",
          },
        ],
        schedule: {
          term: "12 months · Apr 2026 – Mar 2027",
          perPeriod: 2340,
          totalAmount: 28080,
          monthsRecognized: 1,
          monthsRemaining: 11,
          nextRunDate: "2026-05-02",
        },
      },
      evidence: [
        {
          label: "Annual invoice",
          detail:
            "Invoice ADB-2026-A01 received from billing@adobe.com on Apr 2 07:04 — $28,080 for 12 months of service.",
          connector: "gmail",
        },
        {
          label: "Contract on file",
          detail:
            "Adobe_MSA_2026.pdf in Finance > Contracts confirms the 12-month service window Apr 2026 – Mar 2027.",
          connector: "google-drive",
        },
        {
          label: "Policy PR-01",
          detail:
            "Prepaid expenses with clear service-period terms auto-post on the amortization schedule — no controller review required.",
        },
      ],
      postedActions: ["recategorize", "revert", "exclude"],
      pendingActions: [],
    },
  },
  {
    id: "a-0022",
    timestamp: "2026-04-06T08:55:12",
    workflowId: "ap",
    agentName: "AP Agent",
    lane: "draft-confirm",
    action: "Draft bill · Aon Insurance · quarterly premium · $12,600",
    outcome: "controller-confirmed",
    confidenceScore: 98,
    policyCited: "AP-11",
    amount: 12600,
    counterparty: "Aon Insurance",
    transactionDetail: {
      nature: "money-out",
      state: "categorized",
      matchable: false,
      humanSummary:
        "Aon issued the quarterly $12,600 commercial insurance premium — categorized to Insurance Expense (will amortize monthly).",
      categorization: {
        account: "Prepaid Insurance",
        dimensions: {},
        memo: "Aon Insurance · commercial property & GL · Q2 premium",
        splits: [
          {
            account: "Prepaid Insurance",
            side: "DR",
            amount: 12600,
            basis: "3-month coverage · Apr – Jun 2026",
          },
          {
            account: "Accounts Payable · Aon Insurance",
            side: "CR",
            amount: 12600,
            basis: "Bill drafted · net-30",
          },
        ],
      },
      evidence: [
        {
          label: "Recurring",
          detail: "Aon posts quarterly premiums — current amount matches prior Q.",
        },
        {
          label: "Policy AP-11",
          detail:
            "Insurance premiums route to Prepaid Insurance for amortization.",
        },
      ],
      postedActions: ["recategorize", "revert", "exclude"],
      pendingActions: [],
    },
  },
  {
    id: "a-0023",
    timestamp: "2026-04-07T13:15:33",
    workflowId: "ap",
    agentName: "AP Agent",
    lane: "draft-confirm",
    action: "Draft bill · Rippling payroll platform · $4,820/mo",
    outcome: "controller-confirmed",
    confidenceScore: 98,
    policyCited: "AP-11",
    amount: 4820,
    counterparty: "Rippling",
    transactionDetail: {
      nature: "money-out",
      state: "categorized",
      matchable: false,
      humanSummary:
        "Rippling charged $4,820 for the April payroll platform fee — categorized as a recurring SaaS expense.",
      categorization: {
        account: "Payroll Platform Fees",
        dimensions: {},
        memo: "Rippling · April 2026 · platform fee",
        splits: [
          {
            account: "Payroll Platform Fees",
            side: "DR",
            amount: 4820,
            basis: "April platform fee",
            department: "G&A",
            location: "HQ",
            dimensions: { costCenter: "CC-140" },
          },
          {
            account: "Accounts Payable · Rippling",
            side: "CR",
            amount: 4820,
            basis: "Bill drafted · net-15",
          },
        ],
      },
      evidence: [
        {
          label: "Vendor invoice",
          detail:
            "Invoice RPL-2026-04 from billing@rippling.com — $4,820 for the April platform fee.",
          connector: "gmail",
        },
        {
          label: "Recurring vendor",
          detail:
            "Rippling posts at $4,820 on the 7th of each month — 11-month pattern.",
        },
        {
          label: "Policy AP-11",
          detail:
            "Recurring software expenses categorized to Payroll Platform Fees when vendor matches Rippling.",
        },
      ],
      postedActions: ["recategorize", "revert", "exclude"],
      pendingActions: [],
    },
  },
  {
    id: "a-0024",
    timestamp: "2026-04-13T14:42:08",
    workflowId: "ap",
    agentName: "AP Agent",
    lane: "draft-confirm",
    action: "Draft bill · Stellar Logistics · freight · $4,200",
    outcome: "routed-to-pending",
    confidenceScore: 84,
    policyCited: "AP-02",
    amount: 4200,
    counterparty: "Stellar Logistics",
    transactionDetail: {
      nature: "money-out",
      state: "needs-help",
      matchable: false,
      humanSummary:
        "Stellar Logistics sent a $4,200 freight invoice — this is a new vendor, suggested category below threshold for auto-post.",
      categorization: {
        account: "Shipping and Freight",
        dimensions: {},
        memo: "Stellar Logistics · freight · no prior history",
        splits: [
          {
            account: "Shipping and Freight",
            side: "DR",
            amount: 4200,
            basis: "Proposed · freight · April",
            department: "Operations",
            location: "Plant 1",
            dimensions: { costCenter: "CC-310" },
          },
          {
            account: "Accounts Payable · Stellar Logistics",
            side: "CR",
            amount: 4200,
            basis: "Proposed · new vendor · net-30",
          },
        ],
      },
      evidence: [
        {
          label: "Vendor invoice",
          detail:
            "Email from ap@stellarlogistics.com with invoice SL-0042 attached — $4,200 for April freight.",
          connector: "gmail",
        },
        {
          label: "New vendor",
          detail:
            "No prior bills from Stellar Logistics in the last 24 months.",
        },
        {
          label: "Category inference",
          detail:
            "Invoice line items reference \"freight\" — closest historical match is Shipping and Freight account.",
        },
        {
          label: "Below threshold",
          detail:
            "New-vendor first-bill rule routes to pending for controller confirmation.",
        },
      ],
      postedActions: [],
      pendingActions: [
        "confirm",
        "override",
        "change-to-match",
        "delegate",
      ],
    },
  },

  // ============================================================
  // REV REC (2)
  // ============================================================
  {
    id: "a-0025",
    timestamp: "2026-04-06T11:34:21",
    workflowId: "rev-rec",
    agentName: "Rev Rec Agent",
    lane: "draft-confirm",
    action: "Monthly recognition · 14 subscription contracts · $89,400",
    outcome: "controller-confirmed",
    confidenceScore: 96,
    policyCited: "RR-01",
    amount: 89400,
    transactionDetail: {
      nature: "internal",
      state: "categorized",
      matchable: false,
      humanSummary:
        "Recognized $89,400 of April revenue across 14 active subscription contracts per ASC 606 monthly schedule.",
      categorization: {
        account: "Subscription Revenue",
        dimensions: {},
        memo: "April recognition · 14 ARR contracts",
        splits: [
          {
            account: "Deferred Revenue",
            side: "DR",
            amount: 89400,
            basis: "Release from deferred per schedule",
          },
          {
            account: "Subscription Revenue",
            side: "CR",
            amount: 89400,
            basis: "Straight-line monthly · 14 contracts",
            department: "S&M",
            location: "HQ",
            dimensions: {
              segment: "Strategic Accounts",
              revenueStream: "Subscription",
            },
          },
        ],
        schedule: {
          term: "Ongoing · straight-line monthly · 14 active contracts",
          perPeriod: 89400,
          totalAmount: 89400 * 12,
          monthsRecognized: 1,
          monthsRemaining: 11,
          nextRunDate: "2026-05-06",
        },
      },
      evidence: [
        {
          label: "Contract set",
          detail:
            "14 Closed-Won subscription opportunities in Salesforce match the active contracts eligible for April recognition.",
          connector: "salesforce",
        },
        {
          label: "No amendments",
          detail:
            "No signed amendments for these contracts in DocuSign since the prior period.",
          connector: "docusign",
        },
        {
          label: "Policy RR-01",
          detail:
            "Monthly recognition auto-posts for contracts without modification events this period.",
        },
      ],
      postedActions: ["recategorize", "revert", "exclude"],
      pendingActions: [],
    },
  },
  {
    id: "a-0039",
    timestamp: "2026-04-14T10:12:48",
    workflowId: "rev-rec",
    agentName: "Rev Rec Agent",
    lane: "draft-confirm",
    action:
      "Contract extracted · Beacon Aerospace · SaaS + implementation · $180K",
    outcome: "routed-to-pending",
    confidenceScore: 82,
    evidenceRef: "e-revrec-beacon",
    amount: 180000,
    counterparty: "Beacon Aerospace",
    transactionDetail: {
      nature: "internal",
      state: "needs-help",
      matchable: false,
      humanSummary:
        "Agent extracted a new $180K TCV Beacon contract with bundled SaaS + implementation services — multi-element split requires controller review.",
      evidence: [
        {
          label: "Signed contract",
          detail:
            "DocuSign envelope BEA-SaaS-180K completed Apr 11 — 24-month SaaS + upfront implementation bundled in a single order form.",
          connector: "docusign",
        },
        {
          label: "CRM opportunity",
          detail:
            "Salesforce opportunity BEA-SAAS-24 shows Closed-Won at $180K TCV with the same line items as the signed contract.",
          connector: "salesforce",
        },
        {
          label: "Approval chatter",
          detail:
            "#deals-finance Slack thread from sales leadership mentions \"needs controller sign-off on implementation allocation\".",
          connector: "slack",
        },
        {
          label: "Policy RR-03",
          detail:
            "Multi-element arrangements over $100K route to controller per revenue recognition policy.",
        },
      ],
      postedActions: [],
      pendingActions: [
        "confirm",
        "override",
        "change-to-categorize",
        "delegate",
      ],
    },
  },

  // ============================================================
  // ADVANCED ADJUSTMENTS (1)
  // ============================================================
  {
    id: "a-0040",
    timestamp: "2026-04-16T09:15:11",
    workflowId: "advanced-adjustments",
    agentName: "Advanced Adjustments Agent",
    lane: "draft-confirm",
    action:
      "Policy gap · Vendor K · $3,200 refund · shared counterparty (customer + vendor)",
    outcome: "routed-to-pending",
    confidenceScore: 0,
    evidenceRef: "e-adj-vendork",
    amount: 3200,
    counterparty: "Vendor K",
    transactionDetail: {
      nature: "money-in",
      state: "needs-help",
      matchable: true,
      humanSummary:
        "Vendor K sent a $3,200 refund — the same entity is both customer and vendor; two valid accounting paths exist.",
      evidence: [
        {
          label: "Refund received",
          detail:
            "$3,200 ACH credit from Vendor K with memo \"refund / credit\".",
          connector: "svb-op",
        },
        {
          label: "Refund notice",
          detail:
            "Email from billing@vendor-k.com on Apr 15 mentions the refund relates to a \"duplicate shipment credit\" — doesn't specify which side of the relationship.",
          connector: "gmail",
        },
        {
          label: "Dual relationship",
          detail:
            "Vendor K is both a Salesforce account with an open AR invoice and an AP vendor with an open credit memo — refund could offset either.",
          connector: "salesforce",
        },
        {
          label: "Policy gap",
          detail:
            "Advanced Adjustments policy doesn't cover shared counterparty refunds — routed to controller.",
        },
      ],
      postedActions: [],
      pendingActions: [
        "confirm",
        "override",
        "change-to-match",
        "delegate",
      ],
    },
  },

  // ============================================================
  // ALLOCATIONS (1)
  // ============================================================
  {
    id: "a-0041",
    timestamp: "2026-04-16T07:38:24",
    workflowId: "allocations",
    agentName: "Verification Agent",
    lane: "escalate-stop",
    action:
      "Verification flag · prior-period prepaid amortization · contract revised",
    outcome: "flagged-for-attention",
    confidenceScore: 0,
    evidenceRef: "e-alloc-prepaid",
    amount: 24000,
    counterparty: "Aon Insurance",
    transactionDetail: {
      nature: "internal",
      state: "needs-help",
      matchable: false,
      humanSummary:
        "February prepaid amortization no longer matches the revised Aon contract — suggests revert and rebuild from updated terms.",
      evidence: [
        {
          label: "Contract revised",
          detail:
            "Aon amended coverage dates on 2026-04-14; original amortization schedule is now incorrect.",
        },
        {
          label: "Variance",
          detail:
            "Current schedule differs from the correct schedule by $1,840 through April.",
        },
        {
          label: "Policy AL-04",
          detail:
            "Prior-period amortization errors escalate to controller for revert-or-catch-up decision.",
        },
      ],
      postedActions: [],
      pendingActions: [
        "confirm",
        "override",
        "change-to-categorize",
        "delegate",
      ],
    },
  },
];

// Retained for compatibility with the treadmill reducer — no longer used to
// append new entries. The reducer rotates the existing activity feed instead.
export const queuedActivity: ActivityEntry[] = [];
