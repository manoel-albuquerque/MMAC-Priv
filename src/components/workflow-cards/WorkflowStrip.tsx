"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useData } from "@/hooks/useData";
import { cn } from "@/lib/utils";
import { WorkflowCard } from "./WorkflowCard";

// Paginated strip of 11 workflow health cards. Shows 5 per page with arrow
// navigation on either side — fits the 1920px shell without feeling crowded.
const PAGE_SIZE = 5;

export function WorkflowStrip() {
  const { workflows } = useData();
  const [page, setPage] = useState(0);

  const pageCount = Math.ceil(workflows.length / PAGE_SIZE);
  const canPrev = page > 0;
  const canNext = page < pageCount - 1;

  const visible = workflows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="flex h-full items-center gap-2 px-3 py-3">
      <button
        type="button"
        onClick={() => canPrev && setPage((p) => p - 1)}
        disabled={!canPrev}
        aria-label="Previous page"
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600",
          "transition-all hover:border-neutral-300 hover:text-neutral-900 hover:shadow-sm",
          "disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-neutral-200 disabled:hover:shadow-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300",
        )}
      >
        <ChevronLeft className="size-4" />
      </button>

      <div className="flex flex-1 items-center gap-3">
        {visible.map((workflow) => (
          <WorkflowCard key={workflow.id} workflow={workflow} />
        ))}
      </div>

      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => canNext && setPage((p) => p + 1)}
          disabled={!canNext}
          aria-label="Next page"
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600",
            "transition-all hover:border-neutral-300 hover:text-neutral-900 hover:shadow-sm",
            "disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-neutral-200 disabled:hover:shadow-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300",
          )}
        >
          <ChevronRight className="size-4" />
        </button>
        <div className="text-[10px] tabular-nums text-neutral-400">
          {page + 1} / {pageCount}
        </div>
      </div>
    </div>
  );
}
