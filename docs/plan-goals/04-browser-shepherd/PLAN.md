# Browser Shepherd Plan

Operator artifact: this plan is intentionally stored in the Antzoo repo under `docs/plan-goals/` for portability. It should be committed with the roadmap execution docs.

This goal is not complete when the agent is convinced. It is complete when the repo contains the evidence that would convince a skeptical future reader.

## [GOAL]

Prove that an agent can play Antzoo through the browser bridge rather than only batch-running headless experiments, using a constrained intervention budget, falsifiable predictions, replayable evidence, placebo-calibrated paired analysis, and outcome comparison against baseline v2.

## [STOP CONDITION]

This goal is complete when all of the following are true:

- Goal 01 baseline v2 is complete before any pilot result is compared against an unattended baseline.
- `docs/fleet/browser/MILESTONE-1.md` exists and is executable by a fresh agent using only that file plus `docs/debug-surface/DEBUG.md`.
- The milestone spec defines the "One Colony, One Shepherd" protocol:
  - connect at `?seed=<S>&paused=1`
  - allowed tools: `getSnapshot`, `getEvents`, `step` in <=1200-tick chunks, `applyTool`, and screenshots
  - intervention budget: 5 food, 2 lures, 1 boulder
  - optional player-facing caste policy may be budgeted only if the milestone explicitly authorizes a UI-control action; it must not use `patchTuning`
  - forbidden: `patchTuning`, `resetWorld`, reading `src/` during the run, and unbudgeted tools
  - one falsifiable prediction before each `step`
  - one-page report schema with interventions, prediction hits/misses, causal narrative, final outcome, and final hash
- A worked transcript skeleton is included.
- A pilot plan and, if executed by this goal, a pilot run use paired seeds and a placebo/null arm. The pilot must compare shepherded play against unattended and a non-helpful perturbation/null on the same seeds before claiming agency.
- Success is not a tiny unpaired win-rate improvement. A success claim requires paired flips, mechanism deltas, prediction accuracy above a persistence baseline, and evidence that state-contingent interventions beat perturbation luck.
- Held-out seeds `4000-4049` are forbidden unless this plan is updated first with candidate-selection rules, an explicit null/placebo comparison, and the exact one-time held-out spending protocol.
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
- Do not spend held-out seeds `4000-4049` during exploratory browser shepherd work. Held-out use requires a named candidate, paired null/placebo plan, and explicit plan update before execution.
- Do not claim agency from raw win-rate movement alone. Every intervention claim needs paired flips, mechanism deltas, and a placebo/null comparison when the intervention perturbs trajectory.
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

## State-Contingent Agency

State-contingent agency means the shepherd observes current game state, writes a falsifiable prediction, chooses a budgeted action because of that observed state, and then improves paired outcomes or mechanisms beyond both unattended play and a placebo/null perturbation. The evidence must show the action was responsive to the state, not just scheduled stimulation.

Perturbation luck means a fixed, irrelevant, or non-state-contingent stimulus changes the deterministic trajectory and flips outcomes without proving that the shepherd understood or improved the colony's condition. Perturbation luck does not count as browser-shepherd success.

## Caste Policy Decision

`docs/fleet/browser/MILESTONE-1.md` must explicitly decide whether player-facing caste policy is inside the intervention budget before any pilot run.

If caste policy is allowed, it must be framed as a player-facing UI control: for example, one budgeted caste-ratio adjustment through visible browser controls, recorded with the chosen values, tick, screenshot, and state rationale. It is not a hidden tuning patch and must not use `patchTuning`.

If caste policy is not allowed, the outcome must say Goal 04 tested only the weaker food/lure/boulder agency surface. A failure in that mode would not refute policy-level agency, because prior fleet evidence says caste policy is high-leverage and the UI exposes caste ratios.

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
   - Choose paired pilot seeds that do not touch held-out seeds `4000-4049` unless this plan has first been updated with candidate selection and null-comparison rules.
   - For each seed, preserve unattended, placebo/null, and shepherded comparison paths when feasible.
   - Run shepherded games under the protocol.
   - Re-execute one game with the same intervention ticks and verify the final hash.
4. Synthesis:
   - Compare shepherded win rate to baseline v2 as context only.
   - Report paired flips, mechanism deltas, and placebo/null comparison before any intervention claim.
   - Compare prediction accuracy to a persistence baseline.
   - Separate state-contingent agency from perturbation luck.
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
