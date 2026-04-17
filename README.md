# IES Controller Command Center — Prototype

Single-page React demo of the continuous-close controller workflow for Intuit IES. See `../MM Agentic Close/MM Agentic Close/prototype-build-spec-v2.md` for the full build spec.

## Run

```
pnpm install
pnpm dev
```

Open http://localhost:3000 in a browser at 1920×1080 (or near — the canvas is fixed-size and centers itself on larger displays).

## Demo keyboard shortcuts

| Key            | Action                                       |
| -------------- | -------------------------------------------- |
| `Space` or `P` | Pause/resume the alive system                |
| `2`            | Open the Rev Rec evidence panel (Beacon $180K) |
| `3` or `4`     | Open the Reversal Graph diagnostic state     |

Paused state shows a subtle "Paused" chip at the bottom of the canvas. The alive system also auto-pauses whenever a detail panel is open so animations don't distract during drill-ins.

## Demo routes

- `/` — the Command Center shell (main demo surface)
- `/dev/lanes` — the five lane badges in isolation (color contract review)
- `/dev/rev-rec` — Rev Rec Schedule Component in both inline and panel modes
- `/dev/reversal-animation` — the 12-second reversal cascade animation in isolation (with Replay)

## Demo moments worth showing

1. **Open cold.** Period Header shows "April 2026 · close running since April 1" at 55% health. Activity feed appends every 15-20 seconds. Period health ticks up ~every 30-45 seconds. The calm of mid-month.
2. **Click a workflow card lane badge** (e.g. Revenue Recognition's amber "Draft + confirm") → Policy Adjustment panel opens with accuracy dashboard + impact simulator.
3. **Click the expand chevron on the Beacon Aerospace rev rec pending item** → dense Rev Rec Schedule renders inline: 2 performance obligations, 24-month recognition waterfall, 3 proposed JE blocks.
4. **Click View Full Evidence** on the same row → full Evidence Panel with confidence gauge, source cards, evidence chain diagram, and the same Rev Rec schedule embedded.
5. **Click the verification-flagged allocation pending item → Revert** → Reversal Graph opens (or press `3`): 7-node causal tree, Surgical Revert button, 12-second cascade animation, resolved summary.

## Architecture pointers (the "map of the system")

- `src/data/types.ts` — data contract
- `src/components/panels/index.ts` — activePanel dispatcher (the extension seam)
- `src/hooks/useData.ts` — data seam (where a real backend would plug in)
- `src/state/reducer.ts` — action surface
- `src/lib/lanes.ts` — the five-lane constants (semantic colors are non-negotiable)
- `src/components/alive/AliveSystem.tsx` — timers + keyboard shortcuts
- `src/components/queue/previews/registry.ts` — expanded-row preview registry (workflow-keyed)

Components never import from `src/data/*` directly — always through `useData()`.

## Known limitations

- This is a prototype, not production code. Everything is hardcoded client-side JSON. There is no real matching logic — confidence scores, evidence chains, and reversal graphs are pre-computed in the seed data.
- Fixed 1920×1080 canvas. No responsive breakpoints. Centers in larger viewports; will scroll in smaller ones.
- No authentication, no permissions, no backend calls.
- No tests. This is a demo artifact.
- Build: `pnpm build` produces a static export (`pnpm start` serves it).

## Stack

Next.js 14 (App Router) · React 18 · TypeScript strict · Tailwind CSS · shadcn/ui (new-york style) · Framer Motion · Lucide icons · Inter via `next/font` · pnpm.
