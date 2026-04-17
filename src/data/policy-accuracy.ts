import type { WorkflowId } from "./types";

// Backing data for the Policy Adjustment panel's accuracy dashboard.
// Seeded for the three workflows the demo touches; others get a generic fallback.

export type PolicyAccuracy = {
  workflowId: WorkflowId;
  totalProcessedLastCycle: number;
  segments: Array<{
    label: string; // "Single-obligation contracts" / "Multi-element contracts"
    processed: number;
    accurate: number;
    accuracyPercent: number; // 0-100
  }>;
  trendPercentByCycle: number[]; // small 3-cycle sparkline, most recent last
  suggestedChange: {
    description: string;
    thresholdLabel: string;
    thresholdValue: number;
    thresholdUnit: "dollars" | "percent";
    // Impact simulator: "11 of 14 items would have auto-posted this period"
    simulatedAutoPostCount: number;
    simulatedAutoPostTotal: number;
    exampleItems: Array<{
      description: string;
      amount: number;
      counterparty?: string;
    }>;
  };
};

export const policyAccuracy: Record<WorkflowId, PolicyAccuracy> = {
  "rev-rec": {
    workflowId: "rev-rec",
    totalProcessedLastCycle: 47,
    segments: [
      {
        label: "Single-obligation contracts",
        processed: 33,
        accurate: 33,
        accuracyPercent: 100,
      },
      {
        label: "Multi-element contracts",
        processed: 14,
        accurate: 13,
        accuracyPercent: 93,
      },
    ],
    trendPercentByCycle: [91, 95, 97],
    suggestedChange: {
      description:
        "Move single-obligation contracts ≤$150K to Auto-execute. Multi-element contracts remain in Draft + confirm.",
      thresholdLabel: "Auto-execute threshold (single-obligation only)",
      thresholdValue: 150000,
      thresholdUnit: "dollars",
      simulatedAutoPostCount: 11,
      simulatedAutoPostTotal: 412000,
      exampleItems: [
        { description: "Q2 renewal", amount: 42000, counterparty: "Vertex Industrial" },
        { description: "Annual SaaS subscription", amount: 72000, counterparty: "Continental Robotics" },
        { description: "Expansion add-on", amount: 28000, counterparty: "Deltamark Engineering" },
        { description: "Multi-year renewal", amount: 148000, counterparty: "Excelis Medical" },
        { description: "Tier-2 subscription", amount: 36000, counterparty: "Meridian Supplies Co" },
      ],
    },
  },

  "bank-rec": {
    workflowId: "bank-rec",
    totalProcessedLastCycle: 912,
    segments: [
      {
        label: "Matches above 95% confidence",
        processed: 847,
        accurate: 845,
        accuracyPercent: 99.8,
      },
      {
        label: "Matches 80-95% confidence",
        processed: 52,
        accurate: 49,
        accuracyPercent: 94.2,
      },
    ],
    trendPercentByCycle: [98.9, 99.1, 99.4],
    suggestedChange: {
      description: "Lower auto-post threshold from 95% to 92% for recurring vendor patterns.",
      thresholdLabel: "Auto-post confidence threshold",
      thresholdValue: 92,
      thresholdUnit: "percent",
      simulatedAutoPostCount: 34,
      simulatedAutoPostTotal: 182400,
      exampleItems: [
        { description: "Acme Corp wire match", amount: 12400, counterparty: "Acme Corp" },
        { description: "Northpoint Steel AP match", amount: 14200, counterparty: "Northpoint Steel" },
        { description: "Pacific Coating AP match", amount: 7850, counterparty: "Pacific Coating" },
      ],
    },
  },

  ap: {
    workflowId: "ap",
    totalProcessedLastCycle: 224,
    segments: [
      { label: "Known vendors", processed: 212, accurate: 211, accuracyPercent: 99.5 },
      { label: "New vendors", processed: 12, accurate: 9, accuracyPercent: 75 },
    ],
    trendPercentByCycle: [96, 97, 97.8],
    suggestedChange: {
      description: "Auto-post AP bills for known vendors with 3+ clean prior cycles.",
      thresholdLabel: "Clean prior cycles required",
      thresholdValue: 3,
      thresholdUnit: "percent",
      simulatedAutoPostCount: 188,
      simulatedAutoPostTotal: 1_624_000,
      exampleItems: [
        { description: "Recurring SaaS", amount: 4820, counterparty: "Rippling" },
        { description: "Monthly rent", amount: 18400, counterparty: "WeWork" },
        { description: "Quarterly insurance", amount: 12600, counterparty: "Aon Insurance" },
      ],
    },
  },

  // Fallbacks for workflows not yet demoed. Numbers are reasonable placeholders.
  "connector-health": genericAccuracy("connector-health"),
  ar: genericAccuracy("ar"),
  "advanced-adjustments": genericAccuracy("advanced-adjustments"),
  "fixed-assets": genericAccuracy("fixed-assets"),
  "prepaids-amortization": genericAccuracy("prepaids-amortization"),
  allocations: genericAccuracy("allocations"),
  "financial-statement-substantiation": genericAccuracy("financial-statement-substantiation"),
  "flux-variance": genericAccuracy("flux-variance"),
};

function genericAccuracy(id: WorkflowId): PolicyAccuracy {
  return {
    workflowId: id,
    totalProcessedLastCycle: 50,
    segments: [
      { label: "All", processed: 50, accurate: 47, accuracyPercent: 94 },
    ],
    trendPercentByCycle: [92, 93, 94],
    suggestedChange: {
      description: "Consider raising autonomy after two more clean cycles.",
      thresholdLabel: "Autonomy threshold",
      thresholdValue: 95,
      thresholdUnit: "percent",
      simulatedAutoPostCount: 5,
      simulatedAutoPostTotal: 22000,
      exampleItems: [],
    },
  };
}
