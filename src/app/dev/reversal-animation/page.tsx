"use client";

import { useState } from "react";
import { RevertingCascade } from "@/components/reversal-graph/RevertingCascade";
import { useData } from "@/hooks/useData";
import { Button } from "@/components/ui/button";

// Dev-only preview of the reversal cascade animation.
// Replays the animation by key-cycling the component.
export default function ReversalAnimationPreview() {
  const { reversalGraphs } = useData();
  const [replayKey, setReplayKey] = useState(0);
  const [done, setDone] = useState(false);

  const graph = reversalGraphs["rg-stellar-200k"];
  if (!graph) return <div className="p-10">Graph not seeded</div>;

  return (
    <main className="mx-auto max-w-5xl px-10 py-14">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Reversal cascade animation
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The State B animation in isolation. Invests disproportionately in
            the edges-to-root unwind per spec §Polish Expectations.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setDone(false);
            setReplayKey((k) => k + 1);
          }}
        >
          {done ? "Replay" : "Reset"}
        </Button>
      </div>

      <div className="rounded-md border border-neutral-200 bg-white p-6">
        {done ? (
          <div className="rounded-md bg-lane-emerald-50 p-6 text-center text-lane-emerald-900">
            <div className="text-base font-semibold">Cascade complete</div>
            <div className="mt-1 text-sm">
              4 entries reversed · 1 reclassified · resolved in 12 seconds
            </div>
          </div>
        ) : (
          <RevertingCascade
            key={replayKey}
            graph={graph}
            onComplete={() => setDone(true)}
          />
        )}
      </div>
    </main>
  );
}
