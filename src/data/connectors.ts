import type { Connector } from "./types";

// Third-party connectors only — anything IES-native (GL, AP sub-ledger,
// AR sub-ledger) isn't a "connector" since it's the system of record.
// Ten connectors total: 9 active, 1 degraded (Gusto Payroll — 4h since last
// sync). The degraded one makes the Connector Health card amber.
export const connectors: Connector[] = [
  {
    id: "svb-op",
    name: "Silicon Valley Bank — Operating",
    type: "bank-feed",
    status: "active",
    lastSyncAt: "2026-04-16T10:40:00",
    coverageThrough: "2026-04-16",
  },
  {
    id: "svb-payroll",
    name: "Silicon Valley Bank — Payroll",
    type: "bank-feed",
    status: "active",
    lastSyncAt: "2026-04-16T10:38:00",
    coverageThrough: "2026-04-16",
  },
  {
    id: "stripe",
    name: "Stripe",
    type: "payment-processor",
    status: "active",
    lastSyncAt: "2026-04-16T10:41:00",
    coverageThrough: "2026-04-16",
  },
  {
    id: "expensify",
    name: "Expensify",
    type: "expense-tool",
    status: "active",
    lastSyncAt: "2026-04-16T10:30:00",
    coverageThrough: "2026-04-16",
  },
  {
    id: "gusto",
    name: "Gusto Payroll",
    type: "payroll",
    status: "degraded",
    lastSyncAt: "2026-04-16T06:42:00",
    coverageThrough: "2026-04-16",
  },
  {
    id: "google-drive",
    name: "Google Drive",
    type: "cloud-storage",
    status: "active",
    lastSyncAt: "2026-04-16T10:35:00",
    coverageThrough: "2026-04-16",
  },
  {
    id: "gmail",
    name: "Gmail",
    type: "email",
    status: "active",
    lastSyncAt: "2026-04-16T10:41:00",
    coverageThrough: "2026-04-16",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    type: "crm",
    status: "active",
    lastSyncAt: "2026-04-16T10:37:00",
    coverageThrough: "2026-04-16",
  },
  {
    id: "docusign",
    name: "DocuSign",
    type: "esignature",
    status: "active",
    lastSyncAt: "2026-04-16T10:33:00",
    coverageThrough: "2026-04-16",
  },
  {
    id: "slack",
    name: "Slack",
    type: "chat",
    status: "active",
    lastSyncAt: "2026-04-16T10:40:00",
    coverageThrough: "2026-04-16",
  },
];
