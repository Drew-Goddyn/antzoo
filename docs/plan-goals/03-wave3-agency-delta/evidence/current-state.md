# Goal 03 Current State

Recorded: 2026-07-02T13:32:13-07:00

## Repository

- Repo root: `/Users/drewgoddyn/projects/antzoo`
- Branch/status before Goal 03 edits: `## main...origin/main`
- HEAD after required fast-forward pull: `1f87d90c9ad095b7144133b70a5b92521ad5b8b4`
- Remote: `https://github.com/Drew-Goddyn/antzoo.git`

## Required Inputs Verified

- `docs/plan-goals/README.md` exists and requires repo-relative plan-goal execution, append-only progress, evidence artifacts, and a final `GOAL_OUTCOME.md`.
- `docs/plan-goals/03-wave3-agency-delta/PLAN.md` exists and is the source of truth for this goal.
- `docs/plan-goals/templates/GOAL_OUTCOME.md` exists and is the final outcome template.
- Goal 01 outcome is `COMPLETE`; baseline v2 is the current comparison baseline.
- Goal 02 outcome is `COMPLETE`; the Wave 3 manifest is present in `docs/fleet/FLEET.md`.

## Wave 3 Contract Facts

- Player nest derivation in the manifest is `(TUNING.world.w * 0.5, TUNING.world.h * 0.5) = (2048, 1152)`.
- Rescue scenario coordinates from the manifest are:
  - food at tick 6000 to `(1928, 1152)`
  - lure at tick 9000 to `(2048, 1032)`
  - food at tick 12000 to `(2168, 1152)`
- Scenario actions execute when `world.stepCount` reaches `at`, before the next simulation step.
- The reusable rescue scenario is stimulus-only: it uses three `applyTool` actions and no tuning patches, stress spawns, carcass drops, or assertions.
- Candidate tuning must use CLI/scenario patching before any default tuning change.
- Burned seeds `1337-1456` and `2000-2119` are not available for Wave 3 tuning.
- Tuning seeds are `3000-3049`; no cell may use more than 20 seeds.
- Held-out seeds `4000-4049` are reserved for exactly one final candidate and must not be touched before candidate selection.

## Defaults And Authorized Candidate Keys

- Default `ant.drainPerSec`: `1.2`
- Authorized drain-pressure candidate: `ant.drainPerSec = 1.32`
- Default rival caste ratios: `workerRatio = 60`, `soldierRatio = 20`, `nurseRatio = 20`
- Authorized stronger-rival tuple: `workerRatio = 75`, `soldierRatio = 12.5`, `nurseRatio = 12.5`
- Player caste ratios remain default `80 / 10 / 10` for authorized Wave 3 candidate cells.

## Commands Used For This Checkpoint

- `git rev-parse --show-toplevel`
- `git status --short --branch`
- `git pull --ff-only`
- required file existence checks for the plan-goal README, Goal 03 plan, and outcome template
- full reads of the required plan, fleet, debug, roadmap, tuning, scenario, and CLI files
