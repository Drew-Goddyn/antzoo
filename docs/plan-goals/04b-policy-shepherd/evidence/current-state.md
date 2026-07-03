# Current State - Goal 04B

## Repo Checks

- Repo root was determined with `git rev-parse --show-toplevel`.
- Branch status before edits was `main...origin/main`.
- `git pull --ff-only` reported the branch was already up to date.

## Contract Read

The following current repo contracts and prior evidence were inspected before writing the 04B protocol:

- `docs/plan-goals/README.md`
- `docs/fleet/browser/MILESTONE-1.md`
- `docs/plan-goals/04-browser-shepherd/PLAN.md`
- `docs/plan-goals/04-browser-shepherd/GOAL_OUTCOME.md`
- `docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd-pilot-report.md`
- `docs/plan-goals/03-wave3-agency-delta/evidence/synthesis-addendum.md`
- `docs/plan-goals/03-wave3-agency-delta/evidence/placebo/placebo-summary.md`
- `docs/fleet/FLEET.md`
- `docs/debug-surface/DEBUG.md`
- `package.json`
- `docs/plan-goals/04-browser-shepherd/evidence/ui-inspection/tuning-drawer-dom.txt`

## Relevant Findings

- Goal 04 proved browser-bridge feasibility but did not test caste-policy agency. Its shepherded arm went `4/5`, while perturbation placebo/null went `5/5` on seeds `3000-3004`.
- Goal 04 UI evidence shows visible Worker, Soldier, and Nurse sliders in the live tuning drawer.
- `docs/fleet/FLEET.md` requires paired placebo/null comparison and mechanism deltas before any intervention claim.
- `docs/debug-surface/DEBUG.md` allows browser bridge `getSnapshot`, `getEvents`, `getHash`, `pause`, and `step`, and documents `patchTuning` as a bridge method. Goal 04B forbids `patchTuning`.
- `docs/fleet/browser/MILESTONE-1.md` caps browser `step` calls at `1200` ticks and authorizes exactly one visible caste-policy action through UI controls.
- `package.json` provides `npm run dev -- --port 5173`, `npm run sim`, `npm test`, and `playwright-core`.

## Pilot Direction

Goal 04B will use seeds `3005-3009`, which are exploratory Wave 3 seeds and not held-out. The policy arms will isolate the visible caste-policy action and avoid food/lure/boulder shepherd tools so policy effects are not mixed with tool subsidies.
