"use client";

import { RevRecSchedule } from "@/components/accounting/rev-rec/RevRecSchedule";

// Dev-only visual check for the Rev Rec Schedule Component in isolation.
export default function RevRecSchedulePreview() {
  return (
    <main className="mx-auto max-w-5xl px-10 py-14">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Rev Rec Schedule</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Visual check for the schedule component in isolation. Used inline inside the pending-queue
        row (Beacon Aerospace contract) and inside the Rev Rec evidence panel.
      </p>

      <h2 className="mb-3 mt-8 text-sm font-medium uppercase tracking-wider text-muted-foreground">
        Panel mode (evidence panel — more breathing room)
      </h2>
      <div className="rounded-md border border-neutral-200 bg-neutral-50 p-5">
        <RevRecSchedule
          mode="panel"
          onApproveSchedule={() => alert("approve schedule")}
          onApproveClassification={() => alert("approve classification")}
          onReject={() => alert("reject")}
          onViewEvidence={() => alert("view evidence")}
        />
      </div>

      <h2 className="mb-3 mt-12 text-sm font-medium uppercase tracking-wider text-muted-foreground">
        Inline mode (expanded queue row — scrolls within row boundary)
      </h2>
      <div
        className="rounded-md border border-neutral-200 bg-white p-4"
        style={{ maxHeight: 700, overflowY: "auto" }}
      >
        <RevRecSchedule
          mode="inline"
          onApproveSchedule={() => alert("approve schedule")}
          onApproveClassification={() => alert("approve classification")}
          onReject={() => alert("reject")}
          onViewEvidence={() => alert("view evidence")}
        />
      </div>
    </main>
  );
}
