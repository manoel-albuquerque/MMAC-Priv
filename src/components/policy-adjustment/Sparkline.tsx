"use client";

import { cn } from "@/lib/utils";

type SparklineProps = {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
};

// Hand-rolled 3-point sparkline. No chart lib. ~80x24 by default.
// Normalizes values into the available box with a small vertical pad so the
// line never hugs the top/bottom edge. If all values are equal, draws a flat
// line through the middle.
export function Sparkline({
  values,
  width = 80,
  height = 24,
  className,
}: SparklineProps) {
  if (values.length === 0) return null;

  const pad = 3;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = values.length === 1 ? width / 2 : pad + (i * innerW) / (values.length - 1);
    const y = max === min ? height / 2 : pad + innerH - ((v - min) / range) * innerH;
    return { x, y };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn("overflow-visible text-lane-emerald-500", className)}
      aria-hidden="true"
    >
      <path
        d={pathD}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={1.75}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}
