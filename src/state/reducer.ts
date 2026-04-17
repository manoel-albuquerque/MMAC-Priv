import type { AppAction, AppState } from "./types";
import type { ActivityEntry } from "@/data/types";
import { teamRoster } from "@/data/team";

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "OPEN_PANEL":
      return { ...state, activePanel: action.panel };
    case "CLOSE_PANEL":
      return { ...state, activePanel: null };

    case "APPEND_ACTIVITY":
      // P8 wires the alive-system timer. Until then, RESOLVE/EXECUTE actions
      // use this directly to prepend their own activity entry.
      return {
        ...state,
        activityFeed: [action.entry, ...state.activityFeed],
        period: {
          ...state.period,
          transactionsProcessedToday:
            state.period.transactionsProcessedToday + 1,
        },
      };

    case "TICK_PERIOD_HEALTH":
      // Wired for real in P8. Safe to call now — caps at 100.
      return {
        ...state,
        period: {
          ...state.period,
          healthPercent: Math.min(100, state.period.healthPercent + action.delta),
        },
      };

    case "RESOLVE_ITEM": {
      const item = state.pendingQueue.find((i) => i.id === action.id);
      if (!item) return state;

      const now = new Date().toISOString();
      const outcome =
        action.resolution === "confirm"
          ? "controller-confirmed"
          : action.resolution === "override"
          ? "controller-overridden"
          : action.resolution === "revert"
          ? "reversed"
          : "controller-confirmed";

      const resolutionEntry: ActivityEntry = {
        id: `ctrl-${action.id}-${Date.now()}`,
        timestamp: now,
        workflowId: item.workflowId,
        agentName: "Controller",
        lane: "draft-confirm",
        action: `Controller · ${action.resolution} · ${item.title}`,
        outcome,
        amount: item.amount,
        counterparty: item.counterparty,
        evidenceRef: item.evidenceRef,
      };

      return {
        ...state,
        pendingQueue: state.pendingQueue.filter((i) => i.id !== action.id),
        activityFeed: [resolutionEntry, ...state.activityFeed],
        workflows: state.workflows.map((w) =>
          w.id === item.workflowId
            ? {
                ...w,
                pendingQueueCount: Math.max(0, w.pendingQueueCount - 1),
                verificationFlags:
                  item.exceptionType === "verification-flag"
                    ? Math.max(0, w.verificationFlags - 1)
                    : w.verificationFlags,
              }
            : w,
        ),
        period: {
          ...state.period,
          exceptionsResolvedThisPeriod:
            state.period.exceptionsResolvedThisPeriod + 1,
        },
      };
    }

    case "CHANGE_WORKFLOW_LANE":
      return {
        ...state,
        workflows: state.workflows.map((w) =>
          w.id === action.workflowId ? { ...w, lane: action.newLane } : w,
        ),
      };

    case "EXECUTE_REVERSAL": {
      const graph = state.reversalGraphs[action.graphId];
      if (!graph) return state;

      const now = new Date().toISOString();
      const reversalEntry: ActivityEntry = {
        id: `reverse-${action.graphId}-${Date.now()}`,
        timestamp: now,
        // Reversal graph demo ties to allocations workflow (pending item p-005).
        workflowId: "allocations",
        agentName: "Verification Agent + Controller",
        lane: "escalate-stop",
        action: `Reversal executed · ${action.selectedNodeIds.length} downstream effects unwound · $${graph.rootAction.amount.toLocaleString()}`,
        outcome: "reversed",
        amount: graph.rootAction.amount,
        evidenceRef: action.graphId,
      };

      // Also resolve the pending queue item tied to the graph (p-005 in v1).
      const pendingItemId = "p-005";
      return {
        ...state,
        pendingQueue: state.pendingQueue.filter((i) => i.id !== pendingItemId),
        activityFeed: [reversalEntry, ...state.activityFeed],
        workflows: state.workflows.map((w) =>
          w.id === "allocations"
            ? {
                ...w,
                pendingQueueCount: Math.max(0, w.pendingQueueCount - 1),
                verificationFlags: Math.max(0, w.verificationFlags - 1),
              }
            : w,
        ),
        period: {
          ...state.period,
          exceptionsResolvedThisPeriod:
            state.period.exceptionsResolvedThisPeriod + 1,
        },
      };
    }

    case "DELEGATE_ITEM": {
      const member = teamRoster.find((m) => m.id === action.teamMemberId);
      if (!member) return state;
      return {
        ...state,
        pendingQueue: state.pendingQueue.map((i) =>
          i.id === action.id
            ? {
                ...i,
                delegatedTo: {
                  teamMemberId: member.id,
                  name: member.name,
                  role: member.role,
                  delegatedAt: new Date().toISOString(),
                  status: "in-progress",
                },
              }
            : i,
        ),
      };
    }

    case "ACQUIRE_FOCUS":
      return { ...state, focusedUiCount: state.focusedUiCount + 1 };

    case "RELEASE_FOCUS":
      return {
        ...state,
        focusedUiCount: Math.max(0, state.focusedUiCount - 1),
      };

    case "UNASSIGN_DELEGATION": {
      return {
        ...state,
        pendingQueue: state.pendingQueue.map((i) =>
          i.id === action.id ? { ...i, delegatedTo: undefined } : i,
        ),
      };
    }

    case "POP_FEED_QUEUE": {
      // Treadmill: pop the oldest entry off the bottom of activityFeed,
      // refresh its timestamp to "now", and push it back on top. Same 30
      // transactions cycle forever — timestamps drift, feed feels alive, no
      // bloat. If auto-posted, advance the workflow's period progress.
      if (state.activityFeed.length === 0) return state;

      const oldest = state.activityFeed[state.activityFeed.length - 1];
      const rest = state.activityFeed.slice(0, -1);

      const refreshed: ActivityEntry = {
        ...oldest,
        timestamp: new Date().toISOString(),
      };

      const shouldAdvanceProgress =
        refreshed.outcome === "auto-posted" &&
        refreshed.workflowId !== "connector-health";

      return {
        ...state,
        activityFeed: [refreshed, ...rest],
        period: {
          ...state.period,
          transactionsProcessedToday:
            state.period.transactionsProcessedToday + 1,
          transactionsProcessedThisPeriod:
            state.period.transactionsProcessedThisPeriod + 1,
        },
        workflows: shouldAdvanceProgress
          ? state.workflows.map((w) =>
              w.id === refreshed.workflowId
                ? {
                    ...w,
                    periodProgress: {
                      ...w.periodProgress,
                      completed: Math.min(
                        w.periodProgress.total,
                        w.periodProgress.completed + 1,
                      ),
                    },
                  }
                : w,
            )
          : state.workflows,
      };
    }

    case "SET_PAUSED":
      return { ...state, pausedAlive: action.paused };

    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
