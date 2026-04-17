// Data contracts for the IES Controller Command Center prototype.
// Shape matches spec §Data Model. Seed lives in src/data/*.ts files and is
// accessed only via useData() — components never import data files directly.

export type Lane =
  | "auto-execute"
  | "draft-confirm"
  | "ask-clarification"
  | "create-task"
  | "escalate-stop";

export type HealthIndicator = "healthy" | "attention" | "blocked";

export type LaneColor =
  | "lane-emerald"
  | "lane-amber"
  | "lane-sky"
  | "lane-violet"
  | "lane-rose";

export type LaneMeta = {
  label: string;
  shortLabel: string;
  description: string;
  color: LaneColor;
  icon: string; // Lucide icon name
};

// ---- Period ----

export type PeriodState = {
  entityName: string;
  period: string;
  currentSimulatedDate: string; // ISO date
  healthPercent: number; // 0-100
  transactionsProcessedThisPeriod: number;
  transactionsProcessedToday: number;
  exceptionsResolvedThisPeriod: number;
  materialMisstatements: number;
  autoPostRate: number; // 0-1
};

// ---- Workflows ----

export type WorkflowId =
  | "connector-health"
  | "bank-rec"
  | "ar"
  | "ap"
  | "advanced-adjustments"
  | "rev-rec"
  | "fixed-assets"
  | "prepaids-amortization"
  | "allocations"
  | "financial-statement-substantiation"
  | "flux-variance";

export type WorkflowCard = {
  id: WorkflowId;
  name: string;
  description: string;
  lane: Lane;
  agentBehavior: string;
  periodProgress: {
    completed: number;
    total: number;
    unit: "transactions" | "schedule items" | "entries";
  };
  pendingQueueCount: number;
  verificationFlags: number;
  healthIndicator: HealthIndicator;
};

// ---- Activity feed ----

export type ActivityOutcome =
  | "auto-posted"
  | "routed-to-pending"
  | "flagged-for-attention"
  | "controller-confirmed"
  | "controller-overridden"
  | "reversed";

export type ActivityEntry = {
  id: string;
  timestamp: string;
  workflowId: WorkflowId;
  agentName: string;
  lane: Lane;
  action: string;
  outcome: ActivityOutcome;
  confidenceScore?: number;
  policyCited?: string;
  evidenceRef?: string;
  amount?: number;
  counterparty?: string;
  transactionDetail?: TransactionDetail;
};

// ---- Transaction detail (v3 expandable rows) ----
//
// A single transaction is in one of three states from the agent's POV:
//   matched     — agent matched it to an existing invoice/bill/payment.
//   categorized — agent posted it as a new GL entry with account + dimensions.
//                 Used for bank fees, interest, payroll — anything without a
//                 counter-party record to match to.
//   needs-help  — low confidence / ambiguous. UI shows two candidate paths.
//
// `matchable: false` hard-locks the txn into categorized state (no match UI).

export type TransactionNature = "money-in" | "money-out" | "internal";

export type TransactionState = "matched" | "categorized" | "needs-help";

export type MatchRecordKind =
  | "invoice"
  | "bill"
  | "payment"
  | "credit-memo"
  | "expense";

export type MatchRecord = {
  kind: MatchRecordKind;
  recordId: string;
  recordLabel: string; // e.g. "Invoice 01-1056"
  counterparty: string;
  amount: number;
  date: string; // ISO
  openBalance?: number;
  note?: string; // short context — "office supplies", "net-30"
};

// Journal-entry line. Every categorization posts at least two lines
// (balanced DR/CR). First-class coding slots are the columns an accountant
// expects on every GL: Department, Project, Location. The three generic
// dimension slots are free-form so demo customers can map them to whatever
// taxonomy they need (here: Cost Center / Segment / Revenue Stream).
export type CategorizationSplit = {
  account: string; // chart-of-accounts name
  side: "DR" | "CR";
  amount: number;
  basis?: string; // short subline under the account — "April recognition"
  department?: string;
  project?: string;
  location?: string;
  dimensions?: {
    costCenter?: string;
    segment?: string;
    revenueStream?: string;
  };
};

export type AmortizationSchedule = {
  term: string; // human — "12 months · Apr 2026 – Mar 2027"
  perPeriod: number; // amount recognized each period
  totalAmount: number;
  monthsRecognized: number;
  monthsRemaining: number;
  nextRunDate?: string; // ISO
};

export type CategorizationDetail = {
  account: string; // primary account — chart-of-accounts name only
  dimensions: Record<string, string>; // generic, three-slot display
  memo?: string;
  // When the agent posts across multiple accounts (e.g. expense + prepaid
  // asset), list every split. When present, renders instead of the single
  // `account` line.
  splits?: CategorizationSplit[];
  schedule?: AmortizationSchedule;
};

export type EvidenceSignal = {
  label: string; // short tag — "Amount match", "Counterparty history"
  detail: string; // one sentence
  connector?: ConnectorId; // source system when the signal comes from a 3P
};

export type PostedAction =
  | "unmatch"
  | "recategorize"
  | "revert"
  | "split"
  | "exclude";

export type PendingAction =
  | "confirm"
  | "override"
  | "change-to-categorize"
  | "change-to-match"
  | "delegate";

export type TransactionDetail = {
  nature: TransactionNature;
  state: TransactionState;
  matchable: boolean;
  humanSummary: string; // one human sentence — what this txn IS
  match?: MatchRecord;
  matchAlternatives?: MatchRecord[];
  categorization?: CategorizationDetail;
  evidence: EvidenceSignal[];
  postedActions: PostedAction[];
  pendingActions: PendingAction[];
};

// ---- Pending queue ----

export type ExceptionType =
  | "below-confidence-threshold"
  | "no-policy-match"
  | "material-flag"
  | "controller-sign-off-required"
  | "verification-flag";

export type RiskTier = "material" | "immaterial";
export type Urgency = "high" | "normal" | "low";

export type ResolutionOption =
  | "confirm"
  | "override"
  | "delegate"
  | "request-more-context"
  | "revert"
  | "mark-reviewed";

export type DelegatedTo = {
  teamMemberId: string;
  name: string;
  role: string;
  delegatedAt: string; // ISO
  status: "in-progress" | "awaiting-info" | "completed";
};

export type PendingQueueItem = {
  id: string;
  workflowId: WorkflowId;
  exceptionType: ExceptionType;
  riskTier: RiskTier;
  urgency: Urgency;
  title: string;
  amount?: number;
  counterparty?: string;
  flaggedBy: string[];
  timestamp: string;
  agentSuggestion: {
    action: string;
    confidenceScore: number;
    reasoning: string;
    alternativeConsidered?: string;
  } | null;
  investigationContext: {
    priorPeriodTreatment?: string;
    sourceDocuments: Array<{
      source: string;
      detail: string;
      extractedAt: string;
      connector?: ConnectorId;
    }>;
    exceptionRationale: string;
  };
  resolutionOptions: ResolutionOption[];
  evidenceRef?: string;
  delegatedTo?: DelegatedTo;
};

// ---- Evidence chain ----

export type SourceType =
  | "bank-feed"
  | "gl"
  | "ap-subledger"
  | "ar-subledger"
  | "contract-pdf"
  | "email"
  | "crm"
  | "payment-processor"
  | "payroll"
  | "expense-tool";

export type EvidenceSource = {
  sourceType: SourceType;
  sourceLabel: string;
  detail: string;
  extractedAt: string;
  confidenceContribution: "high" | "medium" | "low";
};

export type EvidenceChain = {
  id: string;
  actionId: string;
  timestamp: string;
  agentName: string;
  agentVersion: string;
  summary: {
    transactionIdentity: string;
    actionTaken: string;
    lane: Lane;
    confidenceScore: number;
  };
  sourcesGathered: EvidenceSource[];
  normalizationApplied: Array<{
    field: string;
    from: string;
    to: string;
    rule: string;
  }>;
  agentReasoning: {
    policyCited: { id: string; summary: string } | null;
    confidenceBreakdown: Array<{
      signal: string;
      weight: number;
      score: number;
    }>;
    alternativesConsidered: Array<{
      option: string;
      confidence: number;
      rejected: string;
    }>;
    exceptionTriggersEvaluated: Array<{
      trigger: string;
      triggered: boolean;
    }>;
  };
  output: {
    journalEntries: Array<{
      account: string;
      amount: number;
      debit: boolean;
      class?: string;
    }>;
    glPostingTimestamp: string;
    notifiedUsers: string[];
  };
  immutableHash: string;
};

// ---- Reversal graph ----

export type ReversalNodeType =
  | "gl-balance"
  | "accrual"
  | "rollforward"
  | "aging"
  | "other";

export type ReversalUpstreamType =
  | "normalization"
  | "policy-rule"
  | "source-record";

export type ReversalGraph = {
  id: string;
  rootAction: {
    id: string;
    label: string;
    amount: number;
    timestamp: string;
    confidenceAtTime: number;
  };
  downstreamNodes: Array<{
    id: string;
    label: string;
    type: ReversalNodeType;
    impact: { account: string; amount: number };
    dependencyType: "triggered-by" | "dependent-on" | "updated-by";
    parentId: string;
    currentStatus: "posted" | "pending" | "already-reversed";
  }>;
  upstreamInputs: Array<{
    id: string;
    label: string;
    type: ReversalUpstreamType;
  }>;
  detectionSignals: Array<{
    agentName: string;
    signal: string;
    rationale: string;
  }>;
  netGlImpactOnRevert: {
    byAccount: Array<{ account: string; amount: number }>;
    totalMagnitude: number;
  };
};

// ---- Connectors ----

export type ConnectorType =
  | "bank-feed"
  | "payroll"
  | "expense-tool"
  | "payment-processor"
  | "cloud-storage"
  | "email"
  | "crm"
  | "esignature"
  | "chat";

// Short stable id for third-party connectors that can be cited as the source
// of an evidence signal. Keep aligned with the connectors seed.
export type ConnectorId =
  | "svb-op"
  | "svb-payroll"
  | "stripe"
  | "expensify"
  | "gusto"
  | "google-drive"
  | "gmail"
  | "salesforce"
  | "docusign"
  | "slack";

export type Connector = {
  id: string;
  name: string;
  type: ConnectorType;
  status: "active" | "degraded" | "disconnected";
  lastSyncAt: string;
  coverageThrough: string;
};

// ---- Active panel (app state) ----

export type ActivePanel =
  | null
  | { type: "evidence"; id: string }
  | { type: "reversal"; id: string }
  | { type: "policy"; workflowId: WorkflowId }
  | { type: "workflow-drill"; workflowId: WorkflowId };

// ---- Top-level data shape (what useData returns) ----

export type AppData = {
  period: PeriodState;
  workflows: WorkflowCard[];
  activityFeed: ActivityEntry[];
  feedQueue: ActivityEntry[];
  pendingQueue: PendingQueueItem[];
  connectors: Connector[];
  evidenceChains: Record<string, EvidenceChain>;
  reversalGraphs: Record<string, ReversalGraph>;
};
