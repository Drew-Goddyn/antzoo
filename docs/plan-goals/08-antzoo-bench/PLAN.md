# Antzoo Bench Plan

Operator artifact: this plan is intentionally stored in the Antzoo repo under `docs/plan-goals/` for portability. It should be committed with the roadmap execution docs.

This goal is not complete when the agent is convinced. It is complete when the repo contains the evidence that would convince a skeptical future reader.

## [GOAL]

Package Antzoo as a deterministic agent benchmark v0 by defining a fixed harness, seed suites, scoring rules, replay verification, and reference baselines that reward real play understanding without drifting away from the game.

## [STOP CONDITION]

This goal is complete when all of the following are true:

- The browser shepherd milestone and proof receipts are complete, or this goal records why a benchmark subset is being created first.
- A benchmark document exists, likely `docs/bench/ANTZOO-BENCH-V0.md`, defining:
  - task objective
  - allowed observations and tools
  - forbidden shortcuts
  - seed suites and held-out policy
  - scoring metrics and non-metric guardrails
  - replay verification with final hash and intervention log
  - reference baselines: unattended, scripted rescue, and at least one agent/shepherd protocol result if available
- A runnable harness or documented command path exists for executing benchmark games and verifying replay determinism.
- At least one reference run can be reproduced locally with identical final hash.
- The benchmark explicitly says it measures performance in Antzoo's deterministic toy ecology, not claims about real ants.
- `npm test`, `npm run typecheck`, and `git diff --check` pass for any harness/script changes.
- The final report explains how the benchmark remains aligned with actual play, not only score optimization.
- `GOAL_OUTCOME.md` exists in this bundle with status `COMPLETE`, `BLOCKED`, `PARTIAL`, or `ABORTED`, and it names claims still unsafe.

## Shared Plan Bundle

Work from the current Git repository root, determined by `git rev-parse --show-toplevel`.

- Bundle root: `docs/plan-goals/08-antzoo-bench`
- Source of truth: `docs/plan-goals/08-antzoo-bench/PLAN.md`
- Launcher: `docs/plan-goals/08-antzoo-bench/LAUNCHER.txt`
- Progress ledger: `docs/plan-goals/08-antzoo-bench/progress.jsonl`
- Goal outcome: `docs/plan-goals/08-antzoo-bench/GOAL_OUTCOME.md`
- Evidence directory: `docs/plan-goals/08-antzoo-bench/evidence/`
- Notes directory: `docs/plan-goals/08-antzoo-bench/notes/`

Append execution events to `progress.jsonl`. Do not rewrite prior lines.

## progress.jsonl Schema

Each line must be valid JSON with the keys `ts`, `status`, `goal`, `summary`, `files`, `commands`, `evidence`, `claims`, and `remaining`. Use the canonical schema in `docs/plan-goals/README.md`. Do not use `complete` status until `GOAL_OUTCOME.md` exists.

## Runtime Policy

The default executor is sequential Codex `/goal`. Historical words such as fleet, worker, or dispatch mean runtime-neutral bounded evidence loops, not a dependency on Jules or any standing worker organization. Subagents or separate Codex threads may only be used for bounded review, verification, browser/play observation, or non-overlapping benchmark experiments.

## Ground Truth To Verify First

- Read `docs/roadmap.md`, `docs/debug-surface/DEBUG.md`, `docs/fleet/FLEET.md`, `docs/proof/RECEIPTS.md` if present, and `docs/fleet/browser/MILESTONE-1.md` if present.
- Inspect `scripts/run.ts`, browser bridge contracts, and scenario support.
- Confirm current default baseline, Wave 3 accepted config, and any seed ranges already burned or reserved.
- Decide whether v0 is headless-only, browser-only, or mixed. The roadmap's stronger claim is browser-play understanding, so prefer mixed if implementation cost is manageable.

## Constraints

- Do not let the benchmark reward hidden source inspection, tuning patches, or reset loops unless those are separate explicit tracks.
- Do not compare agents on seeds that were used for tuning or plan iteration.
- Do not claim external biological validity.
- Keep benchmark docs and harness small enough that an outside runner can reproduce them.
- Preserve replayability: same seed, config, intervention log, and build should reproduce final hash.
- Do not widen scope silently. If scope must change, update this `PLAN.md` first with the reason, risk, allowed files, required validation, and rollback or revert strategy.

## Protected Files

Forbidden unless `PLAN.md` is updated first with rationale and validation:

- broad gameplay/balance changes
- unrelated `src/**`
- unrelated `scripts/**`
- unrelated `scenarios/**`
- historical `docs/fleet/reports/**`
- generated run output outside this goal's `evidence/`

Allowed by default:

- benchmark docs under `docs/bench/**`
- minimal benchmark harness or scenario files required by the accepted v0 scope
- `docs/plan-goals/08-antzoo-bench/**`

## No Orchestration Rabbit Hole

Do not build dashboards, schedulers, worker registries, leaderboards, hosted services, or fleet-management systems. Benchmark v0 is a reproducible local harness and evidence contract.

## Knowledge-Spending Requirement

This goal must preserve alignment with playable Antzoo: benchmark tasks must trace back to actual game understanding, constrained interventions, replay verification, and reference baselines. A score sheet alone is not a benchmark if it drifts away from the game.

## Stages

1. Scope:
   - Define benchmark task and allowed surfaces.
   - Select seed suites and held-out rules.
2. Harness:
   - Add or document the minimum runner needed.
   - Record intervention logs in a replayable format.
3. References:
   - Run unattended and scripted baselines.
   - Include browser shepherd reference if available.
4. Verification:
   - Re-run at least one reference game and match final hash.
   - Run validation commands.
5. Documentation:
   - Publish benchmark doc and methodology caveats.
6. Outcome:
   - Write `GOAL_OUTCOME.md` using the template in `docs/plan-goals/templates/GOAL_OUTCOME.md`.

## Verification

Required before final if scripts changed:

```sh
npm test
npm run typecheck
git diff --check
```

For docs-only benchmark framing, `git diff --check` is still required.

## Stop Behavior

When this goal is complete, stop. Write `GOAL_OUTCOME.md` and include the next-goal recommendation or pause/review recommendation.

## Final Report

Report:

- Benchmark document and harness paths.
- Seed suites and held-out policy.
- Reference run results and replay hash evidence.
- Validation commands and results.
- Caveats that prevent overclaiming.
- `GOAL_OUTCOME.md` status and path.
