import type { PeriodState } from "./types";

// Snapshot at April 16, 2026 · 10:42 AM.
// The spec pins this moment — the demo opens here.
export const period: PeriodState = {
  entityName: "Meridian Manufacturing",
  period: "April 2026",
  currentSimulatedDate: "2026-04-16T10:42:00",
  healthPercent: 55,
  transactionsProcessedThisPeriod: 1_847,
  transactionsProcessedToday: 23,
  exceptionsResolvedThisPeriod: 19,
  materialMisstatements: 0,
  autoPostRate: 0.91,
};
