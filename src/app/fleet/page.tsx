import { AppShell } from "@/components/shell/AppShell";
import { AgentFleetPage } from "@/components/fleet/AgentFleetPage";

export default function FleetRoute() {
  return (
    <AppShell>
      <AgentFleetPage />
    </AppShell>
  );
}
