# Rival Viability Plan

Operator artifact: this plan is intentionally stored in the Antzoo repo under `docs/plan-goals/` for portability. It should be committed with the roadmap execution docs.

This goal is not complete when the agent is convinced. It is complete when the repo contains the evidence that would convince a skeptical future reader.

## [GOAL]

Make the rival colony a real contested presence by diagnosing why accepted evidence shows rival starvation deliveries and final population collapse, then shipping the smallest evidence-backed behavior or tuning intervention that makes rival trails, deliveries, and survival visible without breaking determinism or player agency.

## [STOP CONDITION]

This goal is complete when all of the following are true:

- Wave 3 is complete or explicitly declared blocked, so this goal is not confounded with the first agency-delta intervention.
- A rival-economy diagnosis report identifies the causal failure mode for median rival starvation deliveries of 0 using traces/snapshots on named seeds, not speculation.
- The intervention is authorized in `docs/fleet/FLEET.md` before implementation if it changes simulation behavior.
- The accepted intervention yields, on a fresh validation seed range:
  - rival final-population median >0
  - rival starvation median deliveries >0, or a documented alternative rival-competence metric if deliveries are the wrong observable
  - contested-game share reported as runs where both factions have >0 population at the decision window or final decision point named by the report
  - player agency target from Wave 3 not regressed outside its accepted band unless the final report explicitly asks for a new balance direction
- Browser/play evidence shows rival trails or food pressure visibly bloom in at least one before/after comparison.
- Any `src/`, tuning, debug, snapshot, trace, or CLI changes pass full `npm test`.
- A fresh baseline is scheduled or completed if sim-code changes alter default behavior.
- `GOAL_OUTCOME.md` exists in this bundle with status `COMPLETE`, `BLOCKED`, `PARTIAL`, or `ABORTED`, and it names claims still unsafe.

## Shared Plan Bundle

- Bundle root: `/Users/Drew/projects/antzoo/docs/plan-goals/06-rival-viability`
- Source of truth: `/Users/Drew/projects/antzoo/docs/plan-goals/06-rival-viability/PLAN.md`
- Launcher: `/Users/Drew/projects/antzoo/docs/plan-goals/06-rival-viability/LAUNCHER.txt`
- Progress ledger: `/Users/Drew/projects/antzoo/docs/plan-goals/06-rival-viability/progress.jsonl`
- Goal outcome: `/Users/Drew/projects/antzoo/docs/plan-goals/06-rival-viability/GOAL_OUTCOME.md`
- Evidence directory: `/Users/Drew/projects/antzoo/docs/plan-goals/06-rival-viability/evidence/`
- Notes directory: `/Users/Drew/projects/antzoo/docs/plan-goals/06-rival-viability/notes/`

Append execution events to `progress.jsonl`. Do not rewrite prior lines.

## progress.jsonl Schema

Each line must be valid JSON with the keys `ts`, `status`, `goal`, `summary`, `files`, `commands`, `evidence`, `claims`, and `remaining`. Use the canonical schema in `docs/plan-goals/README.md`. Do not use `complete` status until `GOAL_OUTCOME.md` exists.

## Runtime Policy

The default executor is sequential Codex `/goal`. Historical words such as fleet, worker, or dispatch mean runtime-neutral bounded evidence loops, not a dependency on Jules or any standing worker organization. Subagents or separate Codex threads may only be used for bounded review, verification, browser/play observation, or non-overlapping experiments.

## Ground Truth To Verify First

- Read `docs/roadmap.md`, `docs/fleet/FLEET.md`, `docs/fleet/findings/wave1.md`, `docs/fleet/findings/wave2.md`, `docs/debug-surface/DEBUG.md`, `src/sim.ts`, `src/tuning.ts`, and `src/debug/snapshot.ts`.
- Confirm the latest accepted baseline and Wave 3 outcome. Do not use pre-fix baseline numbers as current truth.
- Identify the existing observables for rival deliveries, pheromone fields, population, starvation obituaries, and food access.
- Confirm whether the rival behavior issue is foraging, food placement, caste mix, nest economy, pathing, or competition pressure before editing.

## Constraints

- Do not add new mechanics before explaining the hollow-rival failure in current mechanics.
- Do not optimize only for rival survival if it makes the player irrelevant again.
- Any new observable required by the fix ships in the same change.
- Instrumentation must be additive, hash-excluded where debug-only, and RNG-free.
- Avoid broad refactors of `src/sim.ts`; keep the fix scoped to the diagnosed cause.
- Do not widen scope silently. If scope must change, update this `PLAN.md` first with the reason, risk, allowed files, required validation, and rollback or revert strategy.

## Protected Files

Forbidden unless `PLAN.md` is updated first with rationale and validation:

- broad `src/**` changes unrelated to the diagnosed rival failure
- unrelated `scripts/**`
- unrelated `scenarios/**`
- `package.json`
- `package-lock.json`
- historical `docs/fleet/reports/**`
- generated run output outside this goal's `evidence/`

Allowed by default:

- targeted `src/**` or tuning changes authorized by the rival intervention manifest
- same-change observables needed by the fix
- `docs/fleet/FLEET.md`
- `docs/plan-goals/06-rival-viability/**`

## Stages

1. Diagnosis:
   - Trace named seeds from accepted findings and Wave 3 evidence.
   - Record seed/config/tick/observable for the rival failure.
2. Authorization:
   - Patch `FLEET.md` with an intervention manifest before behavior changes if needed.
3. Implementation:
   - Make the smallest behavior/tuning/observable change that addresses the diagnosis.
4. Validation:
   - Run targeted seeds and fresh validation seeds.
   - Capture before/after screenshots or browser observations.
5. Regression:
   - Run `npm test`.
   - Run `npm run typecheck` if TypeScript changed outside tests.
   - Schedule or complete a new baseline if sim-code changed default behavior.
6. Outcome:
   - Write `GOAL_OUTCOME.md` using the template in `docs/plan-goals/templates/GOAL_OUTCOME.md`.

## Verification

Required before final after behavior changes:

```sh
npm test
npm run typecheck
git diff --check
```

Also run any targeted sim commands named by the intervention manifest.

## Stop Behavior

When this goal is complete, stop. Do not begin goal 07 or goal 08. Write `GOAL_OUTCOME.md` and include the next-goal recommendation.

## Final Report

Report:

- Diagnosed cause with seed/config/tick/observable citations.
- Files changed and why.
- Before/after rival metrics.
- Player agency non-regression.
- Browser/play evidence.
- Validation commands and results.
- Whether a new baseline is complete or the next required goal.
- `GOAL_OUTCOME.md` status and path.
