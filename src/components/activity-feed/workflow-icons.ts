import type { LucideIcon } from "lucide-react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Cable,
  Calendar,
  Cog,
  FileCheck2,
  GitMerge,
  Landmark,
  PieChart,
  TrendingUp,
  Waves,
} from "lucide-react";

import type { WorkflowId } from "@/data/types";

// Maps every WorkflowId to a Lucide icon. Icons render at size-3.5
// (14px) with text-neutral-600 in ActivityRow; keep the map pure so
// it stays a plain lookup at call sites.
export const WORKFLOW_ICONS: Record<WorkflowId, LucideIcon> = {
  "connector-health": Cable,
  "bank-rec": Landmark,
  ar: ArrowDownCircle,
  ap: ArrowUpCircle,
  "advanced-adjustments": GitMerge,
  "rev-rec": TrendingUp,
  "fixed-assets": Cog,
  "prepaids-amortization": Calendar,
  allocations: PieChart,
  "financial-statement-substantiation": FileCheck2,
  "flux-variance": Waves,
};
