# Fleet Spending Era Plan

Operator artifact: this plan is intentionally stored in the Antzoo repo under `docs/plan-goals/` for portability. It should be committed with the roadmap execution docs.

This goal is not complete when the agent is convinced. It is complete when the repo contains the evidence that would convince a skeptical future reader.

## [GOAL]

Update Antzoo's fleet operating contract from measurement-only mode into evidence-backed intervention mode by revising `docs/fleet/FLEET.md` for report format v2, Wave 3 authorization, seed hygiene, and spending-era guardrails without changing simulation code.

## [STOP CONDITION]

This goal is complete when all of the following are true:

- Goal 01 baseline v2 is merged or locally present on the current working branch. If not, this goal may draft wording but must not authorize new experiment cells against stale baseline numbers.
- `docs/fleet/FLEET.md` preserves the existing laws and accepted findings while removing stale "W1-Z1 pending" language after goal 01 is complete.
- The report schema is updated to format v2: concise report, exact command, config with default and new values, seeds/n, per-seed table with outcome/finalTick/finalHash/wave metrics, reading, verdict, raw JSONL artifacts with SHA-256, and replication spot-check unchanged.
- A "Wave 3 - The God Matters" manifest exists in `FLEET.md` with an authorized intervention frame, cell-size ceiling of 20 seeds, tuning seeds `3000-3049`, held-out seeds `4000-4049` reserved for final candidate only, and burned seed ranges `1337-1456` and `2000-2119`.
- The manifest states that candidate tuning runs use scenario/CLI patching first. Default tuning values change only after final held-out acceptance and human play sign-off.
- The manifest explicitly says that any caste-ratio config must specify all companion ratio keys, not only `workerRatio`. If a rival worker target is 75%, the manifest must record the full rival ratio tuple and why that tuple was chosen.
- The rescue protocol and candidate cells are specified clearly enough that a bounded evidence runner can run them without asking permission.
- No `src/`, `scripts/`, `scenarios/`, generated output, or fleet report files are changed by this goal.
- `git diff --check` passes.
- `GOAL_OUTCOME.md` exists in this bundle with status `COMPLETE`, `BLOCKED`, `PARTIAL`, or `ABORTED`, and it names claims still unsafe.

## Shared Plan Bundle

Work from the current Git repository root, determined by `git rev-parse --show-toplevel`.

- Bundle root: `docs/plan-goals/02-fleet-spending-era`
- Source of truth: `docs/plan-goals/02-fleet-spending-era/PLAN.md`
- Launcher: `docs/plan-goals/02-fleet-spending-era/LAUNCHER.txt`
- Progress ledger: `docs/plan-goals/02-fleet-spending-era/progress.jsonl`
- Goal outcome: `docs/plan-goals/02-fleet-spending-era/GOAL_OUTCOME.md`
- Evidence directory: `docs/plan-goals/02-fleet-spending-era/evidence/`
- Notes directory: `docs/plan-goals/02-fleet-spending-era/notes/`

Append execution events to `progress.jsonl`. Do not rewrite prior lines.

## progress.jsonl Schema

Each line must be valid JSON with the keys `ts`, `status`, `goal`, `summary`, `files`, `commands`, `evidence`, `claims`, and `remaining`. Use the canonical schema in `docs/plan-goals/README.md`. Do not use `complete` status until `GOAL_OUTCOME.md` exists.

## Runtime Policy

The default executor is sequential Codex `/goal`. Historical words such as fleet, worker, or dispatch mean runtime-neutral bounded evidence loops, not a dependency on Jules or any standing worker organization. Subagents or separate Codex threads may only be used for bounded read-heavy review or verification.

## Ground Truth To Verify First

- Confirm goal 01 is complete or explicitly record why this goal is starting before it. Preferred dependency is goal 01 first.
- Read `docs/fleet/FLEET.md`, `docs/debug-surface/DEBUG.md`, `docs/roadmap.md`, `docs/fleet/findings/wave1.md`, and `docs/fleet/findings/wave2.md`.
- Inspect `src/tuning.ts` and `src/sim.ts` caste-selection semantics before writing Wave 3 config names. Current planning evidence says player ratios live under `caste.*`, rival ratios under `rival.*`, and `chooseCaste` treats the three keys as relative weights.
- Verify `scripts/run.ts` still accepts scenario JSON and comma-list seeds as described in `DEBUG.md`.

## Constraints

- Docs-only.
- Do not reformat all of `FLEET.md`; keep the diff reviewable.
- Do not bury the held-out seed rule. It must be visible in the manifest.
- Do not weaken the evidence-honesty contract.
- Do not let report format v2 remove the fabrication tripwire; the replacement tripwire is per-seed final hashes plus mandatory replication spot-check.
- Explicitly separate bounded evidence-loop cells from repo-builder goals. Existing report cells can still be one-report-file tasks, but the spending-era builder goals may edit authorized repo files.
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

- `docs/fleet/FLEET.md`
- `docs/plan-goals/02-fleet-spending-era/**`

## No Orchestration Rabbit Hole

Do not build dashboards, schedulers, worker registries, fleet-management systems, or subagent coordination infrastructure. This goal is a docs contract update for runtime-neutral evidence loops.

## Knowledge-Spending Requirement

This goal is complete only if the updated fleet contract routes future work toward finding-driven interventions. Docs and report schema changes are useful here only because they make the next controlled game change auditable; they do not count as game improvement by themselves.

## Stages

1. Contract cleanup:
   - Update stale W1-Z1 status if goal 01 evidence is already present.
   - Keep old accepted findings but relabel stale baseline facts where needed.
2. Report v2:
   - Replace the verbatim-JSONL-in-report requirement with concise report plus raw gzipped artifacts and SHA-256 listing.
   - Preserve replication spot-check and rejection criteria.
3. Wave 3 manifest:
   - Add baseline/rescue/candidate cells.
   - Enforce <=20 seeds per cell.
   - Record tuning and held-out seed ranges.
   - Record all ratio keys for any caste/rival config.
4. Verification:
   - Read back the manifest as a bounded evidence runner would.
   - Run `git diff --check`.
5. Outcome:
   - Write `GOAL_OUTCOME.md` using the template in `docs/plan-goals/templates/GOAL_OUTCOME.md`.

## Verification

Required before final:

```sh
git diff --check
```

No simulation run is required unless the builder changes non-doc files, which this goal should not do.

## Stop Behavior

When this goal is complete, stop. Do not begin goal 03. Write `GOAL_OUTCOME.md` and include the next-goal recommendation.

## Final Report

Report:

- `FLEET.md` sections changed.
- Exact Wave 3 seed ranges and held-out protection language.
- The chosen full rival ratio tuple for the 75% worker target, or the manifest language requiring the next builder to choose it explicitly.
- `git diff --check` result.
- Any dependency from goal 01 that remains incomplete.
- `GOAL_OUTCOME.md` status and path.
