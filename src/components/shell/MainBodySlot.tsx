"use client";

import { useAppState } from "@/state/AppStateContext";
import { getPanelComponent } from "@/components/panels";
import { ActivityFeed } from "@/components/activity-feed/ActivityFeed";
import { PendingQueue } from "@/components/queue/PendingQueue";

export function MainBodySlot() {
  const { state } = useAppState();
  const PanelComponent = getPanelComponent(state.activePanel);

  return (
    <div className="relative flex min-h-0 flex-1 gap-4 overflow-hidden">
      {/* Left zone — Activity Feed (P4) */}
      <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-3">
          <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Activity
          </span>
        </div>
        <ActivityFeed />
      </section>

      {/* Right zone — Pending Queue (P5). Detail panels overlay this zone. */}
      <PendingQueue />

      {PanelComponent ? <PanelComponent /> : null}
    </div>
  );
}
