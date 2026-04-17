import { cn } from "@/lib/utils";

// Small, dependency-free progress primitive used by WorkflowCard.
// Renders a 1-row track + fill and the textual readout "X / Y (Z%)"
// below, using tabular-nums so the digits don't dance on re-render.
type ProgressBarProps = {
  completed: number;
  total: number;
  className?: string;
};

export function ProgressBar({ completed, total, className }: ProgressBarProps) {
  const safeTotal = total > 0 ? total : 0;
  const rawPercent = safeTotal === 0 ? 0 : (completed / safeTotal) * 100;
  const percent = Math.max(0, Math.min(100, rawPercent));
  const percentLabel = Math.round(percent);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div
        className="h-1 w-full overflow-hidden rounded-full bg-neutral-100"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeTotal}
        aria-valuenow={completed}
      >
        <div
          className="h-full rounded-full bg-neutral-800 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="text-[11px] tabular-nums text-neutral-500">
        <span className="font-medium text-neutral-700">
          {completed.toLocaleString()}
        </span>
        <span> / {safeTotal.toLocaleString()} </span>
        <span>({percentLabel}%)</span>
      </div>
    </div>
  );
}
