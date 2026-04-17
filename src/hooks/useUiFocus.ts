"use client";

import { useEffect, useRef } from "react";
import { useAppState } from "@/state/AppStateContext";

// Ref-counted focus lock. Pass `active` (typically an `expanded` or `open`
// boolean); while active, the activity-feed treadmill pauses so the user
// can read. Safe to call from many components at once — the reducer keeps
// a counter and only resumes when the last one releases.
//
// Uses refs for the acquire/release functions because they're recreated on
// every state change in the app-state context, and including them in the
// deps array would cause an infinite acquire→state→new-fn→acquire loop.
export function useUiFocus(active: boolean): void {
  const { acquireFocus, releaseFocus } = useAppState();
  const acquireRef = useRef(acquireFocus);
  const releaseRef = useRef(releaseFocus);
  acquireRef.current = acquireFocus;
  releaseRef.current = releaseFocus;

  useEffect(() => {
    if (!active) return;
    acquireRef.current();
    return () => releaseRef.current();
  }, [active]);
}
