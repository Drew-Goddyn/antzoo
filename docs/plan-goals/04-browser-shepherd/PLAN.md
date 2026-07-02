# Browser Shepherd Plan

Operator artifact: this plan is intentionally stored in the Antzoo repo under `docs/plan-goals/` for portability. It should be committed with the roadmap execution docs.

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

## Shared Plan Bundle

- Bundle root: `/Users/Drew/projects/antzoo/docs/plan-goals/04-browser-shepherd`
- Source of truth: `/Users/Drew/projects/antzoo/docs/plan-goals/04-browser-shepherd/PLAN.md`
- Launcher: `/Users/Drew/projects/antzoo/docs/plan-goals/04-browser-shepherd/LAUNCHER.txt`
- Progress ledger: `/Users/Drew/projects/antzoo/docs/plan-goals/04-browser-shepherd/progress.jsonl`
- Evidence directory: `/Users/Drew/projects/antzoo/docs/plan-goals/04-browser-shepherd/evidence/`
- Notes directory: `/Users/Drew/projects/antzoo/docs/plan-goals/04-browser-shepherd/notes/`

Append execution events to `progress.jsonl`. Do not rewrite prior lines.

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

## Final Report

Report:

- Spec path and key protocol limits.
- Browser gate result.
- Pilot seeds and outcomes.
- Prediction accuracy method and result.
- Replay hash reproduction result.
- Any restrictions that made the pilot impossible.
