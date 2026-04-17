"use client";

import { cn } from "@/lib/utils";

type ThresholdEditorProps = {
  label: string;
  value: number;
  unit: "dollars" | "percent";
  onChange: (next: number) => void;
  className?: string;
};

// Labeled numeric input with "$" prefix for dollars or "%" suffix for percent.
// Plain styled <input type="number"> — no shadcn Input primitive in the UI kit.
export function ThresholdEditor({
  label,
  value,
  unit,
  onChange,
  className,
}: ThresholdEditorProps) {
  const isDollars = unit === "dollars";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
        {label}
      </label>
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 h-10",
          "focus-within:border-neutral-500 focus-within:ring-1 focus-within:ring-neutral-400",
        )}
      >
        {isDollars ? (
          <span className="text-sm font-medium text-neutral-500">$</span>
        ) : null}
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const n = e.target.value === "" ? 0 : Number(e.target.value);
            if (!Number.isNaN(n)) onChange(n);
          }}
          className={cn(
            "flex-1 bg-transparent text-sm font-medium tabular-nums text-neutral-900",
            "outline-none placeholder:text-neutral-400",
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          )}
        />
        {!isDollars ? (
          <span className="text-sm font-medium text-neutral-500">%</span>
        ) : null}
      </div>
    </div>
  );
}
