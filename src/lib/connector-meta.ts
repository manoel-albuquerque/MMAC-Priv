import type { ComponentType, SVGProps } from "react";
import {
  Banknote,
  CreditCard,
  Receipt,
  Wallet,
  HardDrive,
  Mail,
  Users,
  FileSignature,
  MessageSquare,
} from "lucide-react";
import type { ConnectorId } from "@/data/types";

// Lookup for third-party connectors cited in evidence signals. Icon is a
// lucide component; label is the short display string.
type ConnectorMeta = {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const CONNECTOR_META: Record<ConnectorId, ConnectorMeta> = {
  "svb-op": { label: "SVB Operating", icon: Banknote },
  "svb-payroll": { label: "SVB Payroll", icon: Banknote },
  stripe: { label: "Stripe", icon: CreditCard },
  expensify: { label: "Expensify", icon: Receipt },
  gusto: { label: "Gusto", icon: Wallet },
  "google-drive": { label: "Google Drive", icon: HardDrive },
  gmail: { label: "Gmail", icon: Mail },
  salesforce: { label: "Salesforce", icon: Users },
  docusign: { label: "DocuSign", icon: FileSignature },
  slack: { label: "Slack", icon: MessageSquare },
};
