# Living Product Plan

Operator artifact: this plan is intentionally stored in the Antzoo repo under `docs/plan-goals/` for portability. It should be committed with the roadmap execution docs.

This goal is not complete when the agent is convinced. It is complete when the repo contains the evidence that would convince a skeptical future reader.

## [GOAL]

Turn Antzoo from a trusted simulation into a small living product by shipping player-facing readability, replay, and story features that expose existing simulation evidence without compromising determinism or replacing human taste with metrics.

## [STOP CONDITION]

This goal is complete when all of the following are true:

- The accepted Wave 3 agency baseline and rival-viability direction are known, or the final report narrows scope to UI-only features that do not depend on them.
- A release candidate includes at least three player-facing improvements from the roadmap:
  - seed-sharing or daily-colony URL flow
  - colony chronicle or obituary surfacing from existing event data
  - recovery-arc or brood-bank legibility in the HUD
  - before/after screenshot or replay affordance for notable runs
- Each feature uses existing deterministic state/events where possible. Any new debug observable needed by a feature ships with tests or documented verification.
- No player-facing change is accepted without human play sign-off from Drew.
- `npm run build`, `npm test`, and `git diff --check` pass.
- Browser screenshots or screen recordings show the feature working at desktop and a narrow/mobile viewport if the UI is responsive.
- The final report states which roadmap product promise is now true and which remains future work.
- `GOAL_OUTCOME.md` exists in this bundle with status `COMPLETE`, `BLOCKED`, `PARTIAL`, or `ABORTED`, and it names claims still unsafe.

## Shared Plan Bundle

Work from the current Git repository root, determined by `git rev-parse --show-toplevel`.

- Bundle root: `docs/plan-goals/07-living-product`
- Source of truth: `docs/plan-goals/07-living-product/PLAN.md`
- Launcher: `docs/plan-goals/07-living-product/LAUNCHER.txt`
- Progress ledger: `docs/plan-goals/07-living-product/progress.jsonl`
- Goal outcome: `docs/plan-goals/07-living-product/GOAL_OUTCOME.md`
- Evidence directory: `docs/plan-goals/07-living-product/evidence/`
- Notes directory: `docs/plan-goals/07-living-product/notes/`

Append execution events to `progress.jsonl`. Do not rewrite prior lines.

## progress.jsonl Schema

Each line must be valid JSON with the keys `ts`, `status`, `goal`, `summary`, `files`, `commands`, `evidence`, `claims`, and `remaining`. Use the canonical schema in `docs/plan-goals/README.md`. Do not use `complete` status until `GOAL_OUTCOME.md` exists.

## Runtime Policy

The default executor is sequential Codex `/goal`. Historical words such as fleet, worker, or dispatch mean runtime-neutral bounded evidence loops, not a dependency on Jules or any standing worker organization. Subagents or separate Codex threads may only be used for bounded review, verification, browser/play observation, or non-overlapping UI/test work.

## Ground Truth To Verify First

- Read `AGENTS.md`, `docs/roadmap.md`, `docs/debug-surface/DEBUG.md`, `src/App.tsx`, `src/render.ts`, `src/debug/events.ts`, `src/debug/snapshot.ts`, and `src/types.ts`.
- Start the app locally and inspect the current HUD, URL params, bridge, and event surfaces before designing UI.
- Verify whether current URL params already support `seed`, `paused`, and scenario.
- Identify existing event data for deaths, deliveries, seasons, and victory/game-over before adding new event types.

## Constraints

- This is product work, not a marketing landing page.
- Do not make broad gameplay/balance changes under a UI/product goal.
- Do not split RNG streams or change cosmetic RNG behavior unless explicitly authorized by a simulation plan.
- Keep UI dense, readable, and faithful to the existing app. Do not add decorative cards or explanatory marketing copy.
- Human taste is a gate. A metric win with worse charm is a failed product change.
- Do not widen scope silently. If scope must change, update this `PLAN.md` first with the reason, risk, allowed files, required validation, and rollback or revert strategy.

## Protected Files

Forbidden unless `PLAN.md` is updated first with rationale and validation:

- broad gameplay/balance changes
- unrelated `scripts/**`
- unrelated `scenarios/**`
- `package-lock.json`
- historical `docs/fleet/reports/**`
- generated run output outside this goal's `evidence/`

Allowed by default:

- targeted UI/debug/event files needed by the selected product slice
- documentation for the release slice
- `docs/plan-goals/07-living-product/**`

## No Orchestration Rabbit Hole

Do not build dashboards, schedulers, worker registries, telemetry backends, account systems, or fleet-management systems. Ship a small player-facing product slice.

## Knowledge-Spending Requirement

This goal must close the loop `repo finding -> player-facing intervention -> verification -> human-visible effect`. Docs, reports, or UI plumbing alone do not count as game improvement unless a player can see and use the resulting feature.

## Stages

1. Product selection:
   - Pick the smallest coherent release slice of at least three roadmap improvements.
   - Record why those features belong together.
2. Implementation:
   - Make scoped UI/debug changes.
   - Keep any new observables deterministic and testable.
3. Browser QA:
   - Run the app.
   - Capture screenshots at desktop and narrow/mobile viewport.
   - Check text fit and no incoherent overlap.
4. Play sign-off:
   - Record Drew's play acceptance or rejection.
5. Verification:
   - Run full validation.
6. Outcome:
   - Write `GOAL_OUTCOME.md` using the template in `docs/plan-goals/templates/GOAL_OUTCOME.md`.

## Verification

Required before final:

```sh
npm run build
npm test
git diff --check
```

Run `npm run dev -- --port 5173` for browser QA and capture evidence.

## Stop Behavior

When this goal is complete, stop. Do not begin goal 08. Write `GOAL_OUTCOME.md` and include the next-goal recommendation.

## Final Report

Report:

- Product slice chosen.
- Files changed.
- Screenshots/evidence paths.
- Human play sign-off status.
- Validation results.
- Remaining roadmap product items.
- `GOAL_OUTCOME.md` status and path.
