"use client";

import { useEffect, useRef } from "react";
import { useAppState } from "@/state/AppStateContext";

// The Alive System — a single effect-only component that drives the
// "this is running, not mocked" behavior:
//   1. Activity feed timer: pop a queued entry every 15-20 seconds (randomized)
//   2. Period health tick: +0.1-0.2% every 30-45 seconds
//
// Both pause when a detail panel is open (per spec §Alive System) so the
// controller isn't distracted during drill-in, and they pause when the
// user manually toggles pausedAlive via the keyboard shortcut.
//
// Keyboard shortcuts:
//   Space or P : toggle pause
//   1 : focus pending queue (smooth scroll right zone into view — no-op here;
//       shell ensures it's always visible at 1920×1080, but we keep the hook
//       so demo scripts can reference it)
//   2 : open Rev Rec evidence panel
//   3 : open Reversal Graph diagnostic
//   4 : jump straight to Reversal Graph execution (opens panel — user hits
//       Execute themselves)

const FEED_MIN_MS = 15_000;
const FEED_MAX_MS = 20_000;
const HEALTH_MIN_MS = 30_000;
const HEALTH_MAX_MS = 45_000;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function AliveSystem() {
  const { state, popFeedQueue, tickPeriodHealth, setPaused, openPanel } =
    useAppState();

  // Refs used so the interval callbacks always see the latest pause state
  // without re-scheduling the timer on every render.
  const pausedRef = useRef(state.pausedAlive);
  const panelOpenRef = useRef(state.activePanel !== null);
  const focusedRef = useRef(state.focusedUiCount > 0);

  useEffect(() => {
    pausedRef.current = state.pausedAlive;
  }, [state.pausedAlive]);
  useEffect(() => {
    panelOpenRef.current = state.activePanel !== null;
  }, [state.activePanel]);
  useEffect(() => {
    focusedRef.current = state.focusedUiCount > 0;
  }, [state.focusedUiCount]);

  // ---- Feed treadmill: self-rescheduling with randomized interval ----
  // Reducer rotates the oldest activity entry to the top with a fresh
  // timestamp — feed feels alive without growing. Pauses on manual pause,
  // open panel, or any focused-UI holder (expanded rows, popovers, etc).
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        const skip =
          pausedRef.current || panelOpenRef.current || focusedRef.current;
        if (!skip) popFeedQueue();
        schedule();
      }, randomBetween(FEED_MIN_MS, FEED_MAX_MS));
    };
    schedule();
    return () => clearTimeout(timer);
  }, [popFeedQueue]);

  // ---- Period health tick ----
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        if (!pausedRef.current) {
          const delta = 0.1 + Math.random() * 0.1;
          tickPeriodHealth(delta);
        }
        schedule();
      }, randomBetween(HEALTH_MIN_MS, HEALTH_MAX_MS));
    };
    schedule();
    return () => clearTimeout(timer);
  }, [tickPeriodHealth]);

  // ---- Keyboard shortcuts ----
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore if the user is typing into a form element.
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }
      switch (e.key) {
        case " ":
        case "p":
        case "P": {
          e.preventDefault();
          setPaused(!pausedRef.current);
          break;
        }
        case "2": {
          openPanel({ type: "evidence", id: "e-revrec-beacon" });
          break;
        }
        case "3":
        case "4": {
          openPanel({ type: "reversal", id: "rg-stellar-200k" });
          break;
        }
        // "1" (Pending Queue focus) is a no-op at 1920×1080 since the queue
        // is always visible. Left as a spec-named shortcut in case the layout
        // ever tabs or stacks.
        default:
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openPanel, setPaused]);

  return null;
}
