"use client";

import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { useData } from "@/hooks/useData";
import { cn } from "@/lib/utils";
import { LANE_ORDER, LANES } from "@/lib/lanes";
import type { Lane } from "@/data/types";
import { AgentCard } from "./AgentCard";

type LaneFilter = "all" | Lane;

export function AgentFleetPage() {
  const { workflows: allWorkflows } = useData();
  // Connector Health lives in the top-bar Connectors metric card, not here.
  const workflows = allWorkflows.filter((w) => w.id !== "connector-health");
  const [filter, setFilter] = useState<LaneFilter>("all");
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = workflows.filter((w) => {
    const laneMatches = filter === "all" || w.lane === filter;
    const queryMatches =
      normalizedQuery.length === 0 ||
      w.name.toLowerCase().includes(normalizedQuery) ||
      w.description.toLowerCase().includes(normalizedQuery);
    return laneMatches && queryMatches;
  });

  const totalByLane = LANE_ORDER.reduce<Record<Lane, number>>(
    (acc, lane) => {
      acc[lane] = workflows.filter((w) => w.lane === lane).length;
      return acc;
    },
    {
      "auto-execute": 0,
      "draft-confirm": 0,
      "ask-clarification": 0,
      "create-task": 0,
      "escalate-stop": 0,
    },
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-neutral-50">
      {/* Page header */}
      <div className="flex items-center justify-between gap-6 border-b border-neutral-200 bg-white px-8 py-6">
        <div className="flex flex-col">
          <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Agent Fleet
          </span>
          <h1 className="text-xl font-semibold text-neutral-900">
            Your Close Agent Team
          </h1>
          <p className="mt-1 max-w-xl text-[13px] text-neutral-500">
            Eleven agents run the close. Configure lane policy, confidence
            thresholds, and escalation rules per agent.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search agents"
              className={cn(
                "h-9 w-64 rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300",
              )}
            />
          </div>
          <button
            type="button"
            disabled
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-neutral-900 px-3 text-sm font-medium text-white shadow-sm disabled:opacity-60"
            title="Agent creation is not part of the demo"
          >
            <Plus className="size-4" />
            New agent
          </button>
        </div>
      </div>

      {/* Lane filter chips */}
      <div className="flex items-center gap-2 border-b border-neutral-200 bg-white px-8 py-3">
        <LaneChip
          label="All"
          count={workflows.length}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        {LANE_ORDER.map((lane) => (
          <LaneChip
            key={lane}
            label={LANES[lane].label}
            count={totalByLane[lane]}
            active={filter === lane}
            onClick={() => setFilter(lane)}
            laneColor={LANES[lane].color}
          />
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((workflow) => (
            <AgentCard key={workflow.id} workflow={workflow} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white text-sm text-neutral-500">
            No agents match these filters.
          </div>
        )}
      </div>
    </div>
  );
}

function LaneChip({
  label,
  count,
  active,
  onClick,
  laneColor,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  laneColor?: string;
}) {
  const dotClass = laneColor
    ? {
        "lane-emerald": "bg-lane-emerald-500",
        "lane-amber": "bg-lane-amber-500",
        "lane-sky": "bg-lane-sky-500",
        "lane-violet": "bg-lane-violet-500",
        "lane-rose": "bg-lane-rose-500",
      }[laneColor]
    : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium transition-all",
        active
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300",
      )}
    >
      {dotClass && <span className={cn("size-1.5 rounded-full", dotClass)} />}
      <span>{label}</span>
      <span
        className={cn(
          "tabular-nums",
          active ? "text-neutral-300" : "text-neutral-400",
        )}
      >
        {count}
      </span>
    </button>
  );
}
