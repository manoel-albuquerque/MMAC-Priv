"use client";

import { useEffect, useState } from "react";
import { AliveSystem } from "@/components/alive/AliveSystem";
import { LeftNav } from "./LeftNav";
import { FleetSidebar } from "./FleetSidebar";
import { PeriodHeader } from "./PeriodHeader";
import { HeaderMetrics } from "./HeaderMetrics";
import { MainBodySlot } from "./MainBodySlot";
import { PausedIndicator } from "./PausedIndicator";

// Internal design canvas is 1920×1080. We scale the whole thing with a CSS
// transform so the layout looks pixel-identical on any viewport — only the
// scale factor changes. Keeps the bento proportions intact on laptops, 4K
// monitors, and everything in between.
const DESIGN_W = 1920;
const DESIGN_H = 1080;

function useFitScale() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const compute = () => {
      const s = Math.min(
        window.innerWidth / DESIGN_W,
        window.innerHeight / DESIGN_H,
      );
      setScale(s);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return scale;
}

export function AppShell({ children }: { children?: React.ReactNode }) {
  const scale = useFitScale();

  return (
    <div className="flex h-screen w-screen items-center justify-center overflow-hidden bg-neutral-100">
      <div
        style={{
          width: DESIGN_W * scale,
          height: DESIGN_H * scale,
        }}
      >
        <div
          style={{
            width: DESIGN_W,
            height: DESIGN_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
          className="relative flex gap-4 overflow-hidden bg-neutral-100 p-4 shadow-sm"
        >
          <AliveSystem />

          <LeftNav />

          <div className="relative flex flex-1 flex-col gap-4 overflow-hidden">
            <PeriodHeader />
            {children ?? (
              <>
                <HeaderMetrics />
                <MainBodySlot />
              </>
            )}
          </div>

          <FleetSidebar />

          <PausedIndicator />
        </div>
      </div>
    </div>
  );
}
