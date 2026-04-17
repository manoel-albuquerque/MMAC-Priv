"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LaneBadge } from "@/components/primitives/LaneBadge";
import { useAppState } from "@/state/AppStateContext";
import { useWorkflow } from "@/hooks/useData";
import { policyAccuracy } from "@/data/policy-accuracy";
import { LANES } from "@/lib/lanes";
import type { WorkflowId } from "@/data/types";
import { AccuracyDashboard } from "./AccuracyDashboard";
import { ImpactSimulator } from "./ImpactSimulator";
import { ThresholdEditor } from "./ThresholdEditor";

type PolicyAdjustmentPanelProps = {
  // Prop-optional: if the parent dispatcher doesn't pass it, fall back to
  // reading it from activePanel. Keeps the component self-sufficient per the
  // coordination note — P5 is also editing panels/index.ts in parallel.
  workflowId?: WorkflowId;
};

// Demo target lane for the approved policy change. Always "auto-execute" per spec.
const TARGET_LANE = "auto-execute" as const;

// Fake policy id for the confirmation card. Keeps the demo concrete without
// threading a full policy registry through state.
const POLICY_ID = "POL-REV-REC-001";

export function PolicyAdjustmentPanel({ workflowId }: PolicyAdjustmentPanelProps) {
  const { state, closePanel, changeWorkflowLane } = useAppState();

  // Self-sufficient: read from activePanel if prop isn't threaded through.
  const resolvedId: WorkflowId | undefined =
    workflowId ??
    (state.activePanel?.type === "policy" ? state.activePanel.workflowId : undefined);

  const workflow = useWorkflow(resolvedId as WorkflowId);
  const accuracy = resolvedId ? policyAccuracy[resolvedId] : undefined;

  const [threshold, setThreshold] = useState<number>(
    accuracy?.suggestedChange.thresholdValue ?? 0,
  );
  const [confirmed, setConfirmed] = useState(false);

  // Auto-close 2 seconds after confirmation.
  useEffect(() => {
    if (!confirmed) return;
    const t = setTimeout(() => {
      closePanel();
    }, 2000);
    return () => clearTimeout(t);
  }, [confirmed, closePanel]);

  if (!resolvedId || !workflow || !accuracy) return null;

  const currentLaneMeta = LANES[workflow.lane];

  const handleApprove = () => {
    changeWorkflowLane(resolvedId, TARGET_LANE);
    setConfirmed(true);
  };

  return (
    <aside className="absolute inset-y-0 right-0 z-20 w-[640px] overflow-y-auto border-l border-neutral-200 bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
        <span className="text-sm font-semibold text-neutral-900">
          Adjust policy — {workflow.name}
        </span>
        <Button
          size="icon"
          variant="ghost"
          onClick={closePanel}
          aria-label="Close panel"
        >
          <X className="size-4" />
        </Button>
      </div>

      {confirmed ? (
        <ConfirmationBody
          workflowName={workflow.name}
          onClose={closePanel}
        />
      ) : (
        <div className="px-6 py-5 space-y-6">
          {/* Current lane summary */}
          <section>
            <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
              Current policy
            </h3>
            <div className="flex items-center gap-3">
              <LaneBadge lane={workflow.lane} size="md" />
              <p className="text-sm text-neutral-700">{currentLaneMeta.description}</p>
            </div>
          </section>

          {/* Accuracy dashboard */}
          <AccuracyDashboard accuracy={accuracy} />

          {/* Proposal */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
              Proposed change
            </h3>
            <p className="text-sm leading-relaxed text-neutral-700">
              {accuracy.suggestedChange.description}
            </p>

            <ThresholdEditor
              label={accuracy.suggestedChange.thresholdLabel}
              value={threshold}
              unit={accuracy.suggestedChange.thresholdUnit}
              onChange={setThreshold}
            />

            <ImpactSimulator accuracy={accuracy} />
          </section>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <Button
              onClick={handleApprove}
              className="h-10 w-full rounded-md bg-neutral-900 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Update policy
            </Button>
            <div className="flex justify-start">
              <Button
                variant="ghost"
                size="sm"
                onClick={closePanel}
                className="text-neutral-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function ConfirmationBody({
  workflowName,
  onClose,
}: {
  workflowName: string;
  onClose: () => void;
}) {
  // "Effective April 16, 2026" is a fixed demo date per spec.
  const effective = "April 16, 2026";
  const nextVersion = "v3"; // policyId.v+1 — demo default

  return (
    <div className="px-6 py-5 space-y-5">
      <div className="rounded-md border border-lane-emerald-200 bg-lane-emerald-50 p-4 text-lane-emerald-900">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-lane-emerald-600" />
          <div className="space-y-2 text-sm leading-relaxed">
            <p className="font-semibold">
              Policy {POLICY_ID}.{nextVersion} updated · {workflowName} · Effective {effective}
            </p>
            <p>
              Versioned policy document{" "}
              <a
                href="#"
                className="inline-flex items-center gap-1 font-medium underline underline-offset-2 hover:text-lane-emerald-700"
              >
                {POLICY_ID}.{nextVersion}
                <ExternalLink className="size-3" />
              </a>{" "}
              generated.
            </p>
            <p className="text-lane-emerald-800">
              Workflow card lane badge updates immediately.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="text-neutral-700"
        >
          Close
        </Button>
      </div>
    </div>
  );
}
