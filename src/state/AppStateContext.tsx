"use client";

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { seedData } from "@/data/seed";
import type { ActivePanel, Lane, ResolutionOption, WorkflowId } from "@/data/types";
import { appReducer } from "./reducer";
import type { AppState } from "./types";

type AppStateContextValue = {
  state: AppState;
  openPanel: (panel: Exclude<ActivePanel, null>) => void;
  closePanel: () => void;
  resolveItem: (id: string, resolution: ResolutionOption) => void;
  changeWorkflowLane: (workflowId: WorkflowId, newLane: Lane) => void;
  executeReversal: (graphId: string, selectedNodeIds: string[]) => void;
  delegateItem: (id: string, teamMemberId: string) => void;
  unassignDelegation: (id: string) => void;
  acquireFocus: () => void;
  releaseFocus: () => void;
  // P8 alive system controls
  popFeedQueue: () => void;
  tickPeriodHealth: (delta: number) => void;
  setPaused: (paused: boolean) => void;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

const initialState: AppState = {
  ...seedData,
  activePanel: null,
  pausedAlive: false,
  focusedUiCount: 0,
};

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      openPanel: (panel) => dispatch({ type: "OPEN_PANEL", panel }),
      closePanel: () => dispatch({ type: "CLOSE_PANEL" }),
      resolveItem: (id, resolution) =>
        dispatch({ type: "RESOLVE_ITEM", id, resolution }),
      changeWorkflowLane: (workflowId, newLane) =>
        dispatch({ type: "CHANGE_WORKFLOW_LANE", workflowId, newLane }),
      executeReversal: (graphId, selectedNodeIds) =>
        dispatch({ type: "EXECUTE_REVERSAL", graphId, selectedNodeIds }),
      delegateItem: (id, teamMemberId) =>
        dispatch({ type: "DELEGATE_ITEM", id, teamMemberId }),
      unassignDelegation: (id) =>
        dispatch({ type: "UNASSIGN_DELEGATION", id }),
      acquireFocus: () => dispatch({ type: "ACQUIRE_FOCUS" }),
      releaseFocus: () => dispatch({ type: "RELEASE_FOCUS" }),
      popFeedQueue: () => dispatch({ type: "POP_FEED_QUEUE" }),
      tickPeriodHealth: (delta) =>
        dispatch({ type: "TICK_PERIOD_HEALTH", delta }),
      setPaused: (paused) => dispatch({ type: "SET_PAUSED", paused }),
    }),
    [state],
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used inside <AppStateProvider>");
  }
  return ctx;
}
