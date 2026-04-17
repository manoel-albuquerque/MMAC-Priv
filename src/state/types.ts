import type {
  ActivePanel,
  ActivityEntry,
  AppData,
  Lane,
  ResolutionOption,
  WorkflowId,
} from "@/data/types";

export type AppState = AppData & {
  activePanel: ActivePanel;
  // Alive system (P8). When true, timers skip their tick. The shell toggles
  // automatically when a detail panel is open so animations don't distract
  // during drill-in; keyboard shortcut (Space / P) toggles manually.
  pausedAlive: boolean;
  // Ref-counted focus — increments when anything expands/opens that should
  // hold the user's attention (activity row expand, queue row expand, open
  // popovers, etc). Treadmill pauses while > 0.
  focusedUiCount: number;
};

export type AppAction =
  | { type: "OPEN_PANEL"; panel: Exclude<ActivePanel, null> }
  | { type: "CLOSE_PANEL" }
  | { type: "APPEND_ACTIVITY"; entry: ActivityEntry }
  | { type: "TICK_PERIOD_HEALTH"; delta: number }
  | {
      type: "RESOLVE_ITEM";
      id: string;
      resolution: ResolutionOption;
    }
  | { type: "CHANGE_WORKFLOW_LANE"; workflowId: WorkflowId; newLane: Lane }
  | { type: "EXECUTE_REVERSAL"; graphId: string; selectedNodeIds: string[] }
  | { type: "DELEGATE_ITEM"; id: string; teamMemberId: string }
  | { type: "UNASSIGN_DELEGATION"; id: string }
  | { type: "ACQUIRE_FOCUS" }
  | { type: "RELEASE_FOCUS" }
  // P8 alive system:
  | { type: "POP_FEED_QUEUE" }
  | { type: "SET_PAUSED"; paused: boolean };
