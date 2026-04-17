import { WorkflowStrip } from "@/components/workflow-cards/WorkflowStrip";

// Horizontal strip where Workflow Health Cards land (P3).
// Outer container owns the height + border; the strip itself handles layout
// (flex row, horizontal scroll if the 11 cards overflow at 1920px).
export function WorkflowStripSlot() {
  return (
    <div className="h-[180px] border-b border-neutral-200 bg-neutral-50">
      <WorkflowStrip />
    </div>
  );
}
