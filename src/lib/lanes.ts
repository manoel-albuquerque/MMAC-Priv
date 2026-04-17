import type { Lane, LaneMeta } from "@/data/types";

// Spec §Lane Definitions. Colors are semantic and non-negotiable.
// Icons are Lucide names consumed by LaneBadge.
export const LANES: Record<Lane, LaneMeta> = {
  "auto-execute": {
    label: "Auto-execute",
    shortLabel: "Auto",
    description: "Agent performs the action without review, within guardrails",
    color: "lane-emerald",
    icon: "Zap",
  },
  "draft-confirm": {
    label: "Draft + confirm",
    shortLabel: "Draft",
    description: "Agent prepares the action and pauses for approval",
    color: "lane-amber",
    icon: "FileCheck",
  },
  "ask-clarification": {
    label: "Ask for clarification",
    shortLabel: "Ask",
    description:
      "Agent asks targeted questions to resolve ambiguity, then proceeds",
    color: "lane-sky",
    icon: "MessageCircleQuestion",
  },
  "create-task": {
    label: "Create task + continue",
    shortLabel: "Task",
    description:
      "Agent creates a task for controller or collaborator and continues elsewhere",
    color: "lane-violet",
    icon: "ListTodo",
  },
  "escalate-stop": {
    label: "Escalate / stop",
    shortLabel: "Escalate",
    description: "Agent stops and escalates when risk or policy requires",
    color: "lane-rose",
    icon: "AlertOctagon",
  },
};

export const LANE_ORDER: Lane[] = [
  "auto-execute",
  "draft-confirm",
  "ask-clarification",
  "create-task",
  "escalate-stop",
];
