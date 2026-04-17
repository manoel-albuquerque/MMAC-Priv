"use client";

import { LaneBadge } from "@/components/primitives/LaneBadge";
import { LANES, LANE_ORDER } from "@/lib/lanes";

export default function LaneShowcase() {
  return (
    <main className="mx-auto max-w-4xl px-10 py-14">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">LaneBadge</h1>
      <p className="mb-10 text-sm text-muted-foreground">
        Semantic color contract for the five lanes. These colors are non-negotiable — every
        downstream component inherits them.
      </p>

      <section className="mb-12">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Small (sm) · default
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          {LANE_ORDER.map((lane) => (
            <LaneBadge key={lane} lane={lane} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Medium (md)
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          {LANE_ORDER.map((lane) => (
            <LaneBadge key={lane} lane={lane} size="md" />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Interactive (click target — Policy Adjustment flow attaches here)
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          {LANE_ORDER.map((lane) => (
            <LaneBadge
              key={lane}
              lane={lane}
              interactive
              onClick={() => alert(`lane clicked: ${lane}`)}
            />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Without icon
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          {LANE_ORDER.map((lane) => (
            <LaneBadge key={lane} lane={lane} showIcon={false} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Lane descriptions (shown on hover)
        </h2>
        <dl className="space-y-3 text-sm">
          {LANE_ORDER.map((lane) => (
            <div key={lane} className="flex items-start gap-4">
              <dt className="shrink-0">
                <LaneBadge lane={lane} size="md" />
              </dt>
              <dd className="text-muted-foreground">{LANES[lane].description}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
