# Current state receipt

Timestamp: 2026-07-02T12:32:48-07:00

## Repository

- Active repository root established with `git rev-parse --show-toplevel`: `/Users/drewgoddyn/projects/antzoo`.
- Branch before edits: `main`, tracking `origin/main`.
- HEAD after `git pull --ff-only`: `8ef9742388bc1ca7e438e224e6d21e8f9f701427`.
- `git pull --ff-only` result: already up to date.
- Working tree was clean before goal 02 edits.

## Required plan files

- `docs/plan-goals/README.md` exists and says each goal's `PLAN.md` is the source of truth.
- `docs/plan-goals/02-fleet-spending-era/PLAN.md` exists.
- `docs/plan-goals/templates/GOAL_OUTCOME.md` exists.

## Goal 01 dependency

- `docs/plan-goals/01-baseline-v2/GOAL_OUTCOME.md` exists with `Status: COMPLETE`.
- Baseline v2 evidence records seeds 1337-1456 at the 50k tick budget: player 94 victories / 25 collapses / 1 running.
- The remaining running seed is 1355.
- The W1-Z1 fix is recorded as landed: seed 1401 terminates at tick 46872 after the fix.
- The unsafe hash claim remains named: seeds 1369, 1401, 1417, 1453, and 1455 differ from historical Wave 0 rollup hashes.

## Source contracts inspected for the manifest

- `src/tuning.ts` default player caste weights: `caste.workerRatio=80`, `caste.soldierRatio=10`, `caste.nurseRatio=10`.
- `src/tuning.ts` default rival caste weights: `rival.workerRatio=60`, `rival.soldierRatio=20`, `rival.nurseRatio=20`.
- `src/sim.ts` chooses caste by adding worker, soldier, and nurse weights for the faction and drawing against the total, so ratio configs are relative weights and companion keys must be specified.
- `scripts/run.ts` accepts comma-list `--seeds`, rejects mixing `--seed` and `--seeds`, loads `--scenario`, resets mutable tuning from `DEFAULTS` before each run, applies scenario setup, then applies the seed override for batch runs.

## Scope guard

Allowed default write set for goal 02:

- `docs/fleet/FLEET.md`
- `docs/plan-goals/02-fleet-spending-era/**`

Goal 02 did not need simulation, tuning, scenario, package, generated-output, or historical report edits.
