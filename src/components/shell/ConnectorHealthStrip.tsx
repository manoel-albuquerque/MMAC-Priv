"use client";

import { format, parseISO } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useData } from "@/hooks/useData";
import { cn } from "@/lib/utils";
import type { Connector } from "@/data/types";

const STATUS_CLASS: Record<Connector["status"], string> = {
  active: "bg-lane-emerald-500",
  degraded: "bg-lane-amber-500",
  disconnected: "bg-lane-rose-500",
};

export function ConnectorHealthStrip() {
  const { connectors } = useData();
  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex flex-col items-end gap-1">
        <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
          Connectors
        </span>
        <div className="flex items-center gap-1.5">
          {connectors.map((c) => (
            <Tooltip key={c.id}>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    "size-2 rounded-full ring-2 ring-white",
                    STATUS_CLASS[c.status],
                  )}
                  aria-label={`${c.name}: ${c.status}`}
                />
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <div className="font-medium">{c.name}</div>
                <div className="text-muted-foreground">
                  {c.type} · {c.status}
                </div>
                <div className="text-muted-foreground">
                  Last sync {format(parseISO(c.lastSyncAt), "MMM d, h:mm a")}
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
