# Browser Milestone 1 - One Colony, One Shepherd

Status: COMPLETE PROTOCOL

This milestone defines the first browser-legible Antzoo play protocol. It is not a dashboard, scheduler, worker registry, or automation platform. It is a bounded single-colony proof loop for one agent operating through the browser bridge with prediction-first evidence.

## Objective

Show whether a shepherd can improve paired Antzoo outcomes or mechanisms by reading current browser state and spending a constrained player-facing intervention budget. The protocol distinguishes state-contingent shepherding from trajectory perturbation luck.

State-contingent agency means:

1. Observe current browser state.
2. Write a falsifiable prediction before stepping.
3. Choose a budgeted action because of that observed state.
4. Compare the outcome and mechanism delta against unattended and placebo/null arms on the same seed.

Raw win-rate movement alone is not success.

## Caste Policy Decision

Mode B is authorized: policy-aware shepherd.

The current browser UI exposes a player-facing tuning drawer with a visible "Caste ratio policy" section and Worker, Soldier, and Nurse sliders. A shepherd may spend exactly one caste-policy action per shepherded run, but only by operating those visible browser controls. The action must record the tick, before values, after values, screenshot path, state rationale, and expected effect.

Forbidden policy shortcut: `window.__antzoo.patchTuning(...)`.

If a run does not spend the caste-policy action, report the unused policy slot. If a future run cannot operate the visible sliders in that environment, it must downgrade to tools-only for that run and state that the run tests only the weaker food/lure/boulder surface.

## Required Setup

Start from the repository root:

```sh
npm run dev -- --port 5173
```

Open the browser at:

```text
http://127.0.0.1:5173/?seed=<S>&paused=1
```

Use only the browser bridge and visible browser UI described in `docs/debug-surface/DEBUG.md`.

## Allowed APIs And Surfaces

Allowed bridge calls:

- `getSnapshot()`
- `getEvents(sinceTick?)`
- `getHash()`
- `pause()`
- `step(nTicks)` with `nTicks <= 1200`
- `applyTool(tool, x, y)` for budgeted `food`, `lure`, and `boulder` only

Allowed non-bridge surfaces:

- Browser screenshots.
- Visible browser controls for pause/play and speed when needed for orientation.
- Visible tuning drawer controls for exactly one caste-policy action per shepherded run.

Allowed observation sources during an individual shepherd run:

- Current snapshot returned by `getSnapshot()`.
- Current or recent debug events returned by `getEvents(...)`.
- Screenshots and visible UI state.
- The transcript already written for that run.

## Forbidden APIs And Shortcuts

Forbidden during individual shepherd runs:

- Reading `src/**`.
- `patchTuning(...)`.
- `resetWorld(...)`.
- `stressSpawn(...)`.
- `dropCarcass(...)`.
- `applyTool("wash", ...)`.
- `applyTool("dig", ...)`.
- More than 1200 ticks per `step(...)`.
- Unlimited stepping.
- Retroactive predictions.
- Hidden tuning changes.
- Held-out seeds `4000-4049`.

## Intervention Budget

Per shepherded run:

| Intervention | Budget | Notes |
|---|---:|---|
| Food | 5 | `applyTool("food", x, y)` only. |
| Lure | 2 | `applyTool("lure", x, y)` only. |
| Boulder | 1 | `applyTool("boulder", x, y)` only. |
| Caste policy | 1 | Optional Mode B action through visible Worker/Soldier/Nurse sliders only. |

Budgets are maximum spends except the caste-policy slot, which is exactly one authorized slot and may remain unused. Every spent action must have a state rationale and expected effect written before the next step.

## Prediction-Before-Step Rule

Before every `step(...)` call, append a transcript row containing:

- Current tick.
- Requested step length, no more than 1200 ticks.
- Observed state summary.
- Falsifiable prediction for the next observation.
- Persistence-baseline prediction for the same interval.
- Planned action before the step, or `none`.

After the step, append:

- New tick.
- Observed result.
- Prediction score: hit, partial, or miss.
- Persistence-baseline score.
- Any action actually spent.
- Current final hash if terminal or at pilot cutoff.

The persistence baseline should predict that the latest visible trend continues without shepherd understanding. Examples: "winner/loser status remains unchanged", "player population trend direction persists", "nearest-food advantage remains with the same faction", or "no terminal state appears in the next chunk." Use the same scoring rubric for shepherd and persistence predictions.

## Transcript Skeleton

Use one Markdown transcript per shepherded seed:

```md
# Browser Shepherd Transcript - seed <S>

- seed: <S>
- URL: http://127.0.0.1:5173/?seed=<S>&paused=1
- protocol: docs/fleet/browser/MILESTONE-1.md
- mode: policy-aware shepherd
- held-out check: not in 4000-4049
- budget: food 5, lure 2, boulder 1, caste policy 1

## Starting State

| Tick | Hash | Player pop | Rival pop | Player nest food | Rival nest food | Nearest food player/rival | Notes |
|---:|---|---:|---:|---:|---:|---:|---|

## Prediction And Action Ledger

| Before tick | Step | Observation | Shepherd prediction | Persistence prediction | Planned action | Screenshot | After tick | Result | Shepherd score | Persistence score | Budget left |
|---:|---:|---|---|---|---|---|---:|---|---|---|---|

## Interventions

| Tick | Type | Coordinates or values | State rationale | Expected effect | Screenshot | Hash before | Hash after |
|---:|---|---|---|---|---|---|---|

## Terminal Summary

| Outcome | Final tick | Final hash | Player final pop | Rival final pop | Food delivered P/R | Starvation deaths P/R | Notes |
|---|---:|---|---:|---:|---:|---:|---|
```

Screenshots must be saved whenever they influence an action or verify a visible caste-policy change.

## Report Schema

Each pilot writes one concise report:

```md
# Browser Shepherd Pilot - <date or slug>

## Protocol

- milestone: docs/fleet/browser/MILESTONE-1.md
- seeds: <list>
- arms: unattended, placebo/null, shepherded
- held-out seeds used: none
- bridge gate artifact: <path>

## Per-Seed Outcome Table

| Seed | Arm | Outcome | Final tick | Final hash | Player final pop | Rival final pop | Player food delivered | Rival food delivered | Player starvation deaths | Rival starvation deaths |
|---:|---|---|---:|---|---:|---:|---:|---:|---:|---:|

## Paired Flip Table

| Seed | Unattended | Placebo/null | Shepherded | Shepherd vs unattended | Shepherd vs placebo/null |
|---:|---|---|---|---|---|

## Mechanism Deltas

| Comparison | dFood P/R | dFinalPop P/R | dStarvationDeaths P/R | dFinalTick | Reading |
|---|---:|---:|---:|---:|---|

## Prediction Accuracy

| Predictor | Hits | Partials | Misses | Accuracy rule |
|---|---:|---:|---:|---|

## Replay Verification

| Seed | Intervention ticks | First final hash | Replay final hash | Match |
|---:|---|---|---|---|

## Verdict

State what is safe to claim, what remains unsafe, and whether observed movement is distinguishable from perturbation luck.
```

## Paired Arms

Run the same seed in all feasible arms:

1. Unattended: no intervention.
2. Placebo/null: fixed, predeclared non-state-contingent perturbation or true null.
3. Shepherded: this protocol with state-contingent predictions and budgeted actions.

For food/lure/boulder placebo, prefer the committed `scenarios/placebo-perturbation.json` coordinates unless the pilot report predeclares another non-helpful perturbation. If the shepherd spends the caste-policy slot, the report must predeclare and run a matched non-state-contingent policy placebo or clearly mark policy-level agency as unproven.

## Mechanism-Delta Requirement

Any intervention claim must include paired mechanism deltas, not only outcome counts:

- player and rival final population;
- player and rival food delivered;
- player and rival starvation deaths;
- final tick;
- paired flips against unattended and placebo/null;
- prediction accuracy against persistence baseline.

Tiny unpaired improvements are not agency evidence.

## Replay Verification

For at least one shepherded seed, replay the same seed with the same intervention ticks, tools, coordinates, and visible policy values. The replay passes only when final hash matches the original shepherded final hash. If replay tooling cannot operate the visible policy controls deterministically, report that limitation and do not claim replay-proven policy agency.

## Pilot Seed Policy

Use non-held-out exploratory seeds only. Preferred small pilot seeds are `3000-3004`. Do not use `4000-4049`.

If runtime is limited, one to five paired seeds is acceptable for browser-legibility proof, but the report must call the result pilot-only and unsafe for final agency claims.

## Completion Gate

Milestone 1 is satisfied only when:

- This file exists.
- The browser bridge smoke test from `docs/debug-surface/DEBUG.md` passes or a documented equivalent is saved.
- A pilot report exists, or `GOAL_OUTCOME.md` records exact blocking environment details.
- The report includes paired unattended, placebo/null, and shepherded evidence where feasible.
- At least one shepherded replay verifies the same final hash, or the exact missing replay capability is documented.
- `git diff --check` passes.
