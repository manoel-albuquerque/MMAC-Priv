import type { AppData } from "./types";
import { period } from "./period";
import { workflows } from "./workflows";
import { connectors } from "./connectors";
import { historicalActivity, queuedActivity } from "./activity-feed";
import { pendingQueue } from "./pending-queue";
import { evidenceChains } from "./evidence";
import { reversalGraphs } from "./reversal-graphs";

// The real seed. Wire replaces stubData in AppStateContext.
// Activity feed sorts newest-first; queue holds future-append entries
// the alive system pops in P8.
export const seedData: AppData = {
  period,
  workflows,
  connectors,
  activityFeed: [...historicalActivity].sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp),
  ),
  feedQueue: queuedActivity,
  pendingQueue,
  evidenceChains,
  reversalGraphs,
};
