"use client";

import {
  AlertOctagon,
  FileCheck,
  ListTodo,
  MessageCircleQuestion,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LANES } from "@/lib/lanes";
import { cn } from "@/lib/utils";
import type { Lane, LaneColor } from "@/data/types";

const ICON_MAP: Record<string, LucideIcon> = {
  Zap,
  FileCheck,
  MessageCircleQuestion,
  ListTodo,
  AlertOctagon,
};

// Color → tailwind classes. Uses the scales declared in tailwind.config.ts.
// Keeping this explicit beats template-literal class-building (which tailwind
// JIT can't see) and gives us exact design control per shade.
const SURFACE_BY_COLOR: Record<LaneColor, string> = {
  "lane-emerald": "bg-lane-emerald-50 text-lane-emerald-800 ring-lane-emerald-200",
  "lane-amber": "bg-lane-amber-50 text-lane-amber-800 ring-lane-amber-200",
  "lane-sky": "bg-lane-sky-50 text-lane-sky-800 ring-lane-sky-200",
  "lane-violet": "bg-lane-violet-50 text-lane-violet-800 ring-lane-violet-200",
  "lane-rose": "bg-lane-rose-50 text-lane-rose-800 ring-lane-rose-200",
};

const DOT_BY_COLOR: Record<LaneColor, string> = {
  "lane-emerald": "bg-lane-emerald-500",
  "lane-amber": "bg-lane-amber-500",
  "lane-sky": "bg-lane-sky-500",
  "lane-violet": "bg-lane-violet-500",
  "lane-rose": "bg-lane-rose-500",
};

type LaneBadgeProps = {
  lane: Lane;
  size?: "sm" | "md";
  showIcon?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
};

export function LaneBadge({
  lane,
  size = "sm",
  showIcon = true,
  interactive = false,
  onClick,
  className,
}: LaneBadgeProps) {
  const meta = LANES[lane];
  const Icon = ICON_MAP[meta.icon];

  const base = cn(
    "inline-flex items-center gap-1.5 rounded-full font-medium uppercase",
    "ring-1 ring-inset",
    SURFACE_BY_COLOR[meta.color],
    size === "sm"
      ? "h-[18px] px-1.5 text-[10px] tracking-wide gap-1"
      : "h-5 px-2 text-[11px] tracking-wider",
    interactive &&
      "cursor-pointer transition-shadow hover:ring-2 focus-visible:outline-none focus-visible:ring-2",
    className,
  );

  const content = (
    <span className={base} onClick={interactive ? onClick : undefined} role={interactive ? "button" : undefined} tabIndex={interactive ? 0 : undefined}>
      <span className={cn(size === "sm" ? "size-1" : "size-1.5", "rounded-full", DOT_BY_COLOR[meta.color])} />
      <span>{meta.label}</span>
      {showIcon && Icon ? <Icon className={size === "sm" ? "size-2.5" : "size-3"} /> : null}
    </span>
  );

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs text-xs">
          {meta.description}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
