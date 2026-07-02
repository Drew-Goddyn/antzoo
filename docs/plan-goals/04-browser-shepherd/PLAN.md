# Browser Shepherd Plan

Operator artifact: this plan is intentionally stored in the Antzoo repo under `docs/plan-goals/` for portability. It should be committed with the roadmap execution docs.

This goal is not complete when the agent is convinced. It is complete when the repo contains the evidence that would convince a skeptical future reader.

## [GOAL]

Prove that an agent can play Antzoo through the browser bridge rather than only batch-running headless experiments, using a constrained intervention budget, falsifiable predictions, replayable evidence, and outcome comparison against baseline v2.

## [STOP CONDITION]

This goal is complete when all of the following are true:

- Goal 01 baseline v2 is complete before any pilot result is compared against an unattended baseline.
- `docs/fleet/browser/MILESTONE-1.md` exists and is executable by a fresh agent using only that file plus `docs/debug-surface/DEBUG.md`.
- The milestone spec defines the "One Colony, One Shepherd" protocol:
  - connect at `?seed=<S>&paused=1`
  - allowed tools: `getSnapshot`, `getEvents`, `step` in <=1200-tick chunks, `applyTool`, and screenshots
  - intervention budget: 5 food, 2 lures, 1 boulder
  - forbidden: `patchTuning`, `resetWorld`, reading `src/` during the run, and unbudgeted tools
  - one falsifiable prediction before each `step`
  - one-page report schema with interventions, prediction hits/misses, causal narrative, final outcome, and final hash
- A worked transcript skeleton is included.
- A pilot run on 10 held-out seeds exists after baseline v2 is known, showing shepherded win rate > unattended baseline v2, prediction accuracy > a persistence baseline, and one replay reproducing the same final hash.
- Browser bridge smoke test passes using the `DEBUG.md` Playwright gate or equivalent.
- No simulation or tuning changes are made unless a later explicit plan authorizes them.
- `GOAL_OUTCOME.md` exists in this bundle with status `COMPLETE`, `BLOCKED`, `PARTIAL`, or `ABORTED`, and it names claims still unsafe.

## Shared Plan Bundle

Work from the current Git repository root, determined by `git rev-parse --show-toplevel`.

- Bundle root: `docs/plan-goals/04-browser-shepherd`
- Source of truth: `docs/plan-goals/04-browser-shepherd/PLAN.md`
- Launcher: `docs/plan-goals/04-browser-shepherd/LAUNCHER.txt`
- Progress ledger: `docs/plan-goals/04-browser-shepherd/progress.jsonl`
- Goal outcome: `docs/plan-goals/04-browser-shepherd/GOAL_OUTCOME.md`
- Evidence directory: `docs/plan-goals/04-browser-shepherd/evidence/`
- Notes directory: `docs/plan-goals/04-browser-shepherd/notes/`

Append execution events to `progress.jsonl`. Do not rewrite prior lines.

## progress.jsonl Schema

Each line must be valid JSON with the keys `ts`, `status`, `goal`, `summary`, `files`, `commands`, `evidence`, `claims`, and `remaining`. Use the canonical schema in `docs/plan-goals/README.md`. Do not use `complete` status until `GOAL_OUTCOME.md` exists.

## Runtime Policy

The default executor is sequential Codex `/goal`. Historical words such as fleet, worker, or dispatch mean runtime-neutral bounded evidence loops, not a dependency on Jules or any standing worker organization. Subagents or separate Codex threads may only be used for bounded review, verification, or browser/play observation.

## Ground Truth To Verify First

- Read `docs/debug-surface/DEBUG.md`, especially Browser bridge and Playwright gate.
- Read `docs/fleet/FLEET.md` and confirm baseline v2 status.
- Inspect `package.json` for current dev command and Playwright dependency.
- Start local app with `npm run dev -- --port 5173` when running browser gates.
- Verify local Chrome channel is available if using `playwright-core` with `channel: "chrome"`.

## Constraints

- Spec work is docs-only.
- Pilot work may create reports/evidence but must not read `src/` during individual shepherd runs.
- Do not let the agent use `patchTuning`, `resetWorld`, hidden source inspection, or unlimited stepping as a shortcut.
- Predictions must be written before stepping, then scored after. Do not score predictions retroactively.
- Screenshots are evidence, not decoration. Save paths and ticks when used.
- Do not widen scope silently. If scope must change, update this `PLAN.md` first with the reason, risk, allowed files, required validation, and rollback or revert strategy.

## Protected Files

Forbidden unless `PLAN.md` is updated first with rationale and validation:

- `src/**`
- `scripts/**`
- `scenarios/**`
- `package.json`
- `package-lock.json`
- historical `docs/fleet/reports/**`
- generated run output outside this goal's `evidence/`

Allowed by default:

- `docs/fleet/browser/MILESTONE-1.md`
- browser shepherd reports/artifacts explicitly authorized by the milestone spec
- `docs/plan-goals/04-browser-shepherd/**`

## No Orchestration Rabbit Hole

Do not build dashboards, schedulers, worker registries, fleet-management systems, or a browser automation platform. This goal proves one constrained browser-legibility protocol.

## Knowledge-Spending Requirement

This goal must connect the browser bridge to real play understanding: constrained observation, prediction, intervention, replay verification, and comparison against baseline. A spec alone is not game improvement; it only completes this goal if paired with the required pilot or an honest `BLOCKED` outcome naming missing evidence.

## Stages

1. Protocol spec:
   - Write `docs/fleet/browser/MILESTONE-1.md`.
   - Include allowed/forbidden APIs, budget, prediction ledger, report schema, and transcript skeleton.
2. Browser gate:
   - Run the `DEBUG.md` Playwright smoke test.
   - Save output in this goal's evidence directory.
3. Pilot:
   - Choose 10 seeds not already burned by Wave 3 tuning or held-out validation.
   - Run shepherded games under the protocol.
   - Re-execute one game with the same intervention ticks and verify the final hash.
4. Synthesis:
   - Compare shepherded win rate to baseline v2.
   - Compare prediction accuracy to a persistence baseline.
5. Verification:
   - Run `git diff --check`.
   - Run `npm test` only if implementation touches debug/browser bridge code.
6. Outcome:
   - Write `GOAL_OUTCOME.md` using the template in `docs/plan-goals/templates/GOAL_OUTCOME.md`.

## Verification

Required before final:

```sh
git diff --check
```

Required for pilot/browser proof:

```sh
npm run dev -- --port 5173
```

Then run the Playwright browser bridge check from `docs/debug-surface/DEBUG.md`.

## Stop Behavior

When this goal is complete, stop. Do not begin goal 05 or goal 08. Write `GOAL_OUTCOME.md` and include the next-goal recommendation.

## Final Report

Report:

- Spec path and key protocol limits.
- Browser gate result.
- Pilot seeds and outcomes.
- Prediction accuracy method and result.
- Replay hash reproduction result.
- Any restrictions that made the pilot impossible.
- `GOAL_OUTCOME.md` status and path.
