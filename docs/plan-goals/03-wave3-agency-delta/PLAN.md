# Wave 3 Agency Delta Plan

Operator artifact: this plan is intentionally stored in the Antzoo repo under `docs/plan-goals/` for portability. It should be committed with the roadmap execution docs.

This goal is not complete when the agent is convinced. It is complete when the repo contains the evidence that would convince a skeptical future reader.

## [GOAL]

Make player agency matter in Antzoo by shipping the first evidence-backed Wave 3 tuning intervention: unattended default play becomes riskier, a competent rescue protocol reliably improves outcomes, determinism gates pass, and human play sign-off confirms the new game feels better rather than merely different.

## [STOP CONDITION]

This goal is complete when all of the following are true:

- Goal 01 baseline v2 and goal 02 Wave 3 manifest are complete, or the final report explains why a safe subset was done without them.
- `scenarios/rescue-protocol.json` exists and is a stimulus-only scenario with 2 food drops plus 1 lure near the player nest during the trough window of ticks `6000-14000`.
- Baseline agency pilot evidence exists for seeds `3000-3009`: unattended vs rescue at default config, per-seed outcome/finalTick/finalHash table, and replay determinism evidence for the rescue scenario.
- Candidate tuning evidence exists on tuning seeds `3000-3049`, split into cells of <=20 seeds, for authorized configs from `FLEET.md`.
- Held-out seeds `4000-4049` are touched exactly once and only by the final candidate config.
- The accepted final candidate meets these held-out targets unless the goal ends honestly blocked:
  - unattended win rate between 55% and 65%
  - scripted-rescue win rate >=85%
  - median finalTick within +/-20% of baseline v2
  - `running` outcomes <= baseline v2
  - rival final-population median >0 in unattended final-candidate runs
  - same-config replication reports `hashesAllMatch: true`
- Any tuning change records all changed keys and defaults, including full companion ratio keys for caste/rival ratios.
- Candidate configs are evaluated through scenario/CLI patching before changing default tuning. Default tuning values are changed only after the final candidate passes held-out validation and human play sign-off.
- `npm test` passes after any tuning, simulation, debug, snapshot, trace, or CLI change.
- Drew's human play sign-off is recorded for old vs new builds: 3 sessions each, including good intervention, deliberate neglect, and last-second rescue.
- `GOAL_OUTCOME.md` exists in this bundle with status `COMPLETE`, `BLOCKED`, `PARTIAL`, or `ABORTED`, and it names claims still unsafe.

## Shared Plan Bundle

- Bundle root: `/Users/Drew/projects/antzoo/docs/plan-goals/03-wave3-agency-delta`
- Source of truth: `/Users/Drew/projects/antzoo/docs/plan-goals/03-wave3-agency-delta/PLAN.md`
- Launcher: `/Users/Drew/projects/antzoo/docs/plan-goals/03-wave3-agency-delta/LAUNCHER.txt`
- Progress ledger: `/Users/Drew/projects/antzoo/docs/plan-goals/03-wave3-agency-delta/progress.jsonl`
- Goal outcome: `/Users/Drew/projects/antzoo/docs/plan-goals/03-wave3-agency-delta/GOAL_OUTCOME.md`
- Evidence directory: `/Users/Drew/projects/antzoo/docs/plan-goals/03-wave3-agency-delta/evidence/`
- Notes directory: `/Users/Drew/projects/antzoo/docs/plan-goals/03-wave3-agency-delta/notes/`

Append execution events to `progress.jsonl`. Do not rewrite prior lines.

## progress.jsonl Schema

Each line must be valid JSON with the keys `ts`, `status`, `goal`, `summary`, `files`, `commands`, `evidence`, `claims`, and `remaining`. Use the canonical schema in `docs/plan-goals/README.md`. Do not use `complete` status until `GOAL_OUTCOME.md` exists.

## Runtime Policy

The default executor is sequential Codex `/goal`. Historical words such as fleet, worker, or dispatch mean runtime-neutral bounded evidence loops, not a dependency on Jules or any standing worker organization. Subagents or separate Codex threads may only be used for bounded read-heavy review, verification, browser/play observation, or non-overlapping experiment cells.

## Ground Truth To Verify First

- Read `AGENTS.md`, `docs/roadmap.md`, `docs/fleet/FLEET.md`, `docs/debug-surface/DEBUG.md`, `src/tuning.ts`, `src/debug/scenario.ts`, and `scripts/run.ts`.
- Verify `FLEET.md` contains the Wave 3 manifest from goal 02. If not, stop and complete goal 02 first unless explicitly instructed otherwise.
- Confirm scenario action semantics: actions execute when `world.stepCount` reaches `at`, before the next simulation step.
- Confirm current player nest coordinates and whether the scenario can use fixed coordinates safely. If positions must be derived from nest coordinates, record the source and derivation.
- Inspect caste ratio semantics before any candidate config. Do not patch only `rival.workerRatio` for a "75% rival workers" target; specify all three rival ratio keys.

## Constraints

- Do not change `src/sim.ts` for this goal unless the Wave 3 manifest is updated to authorize a sim change. The intended first intervention is tuning/scenario/report work.
- Do not use seeds `4000-4049` for exploration, debugging, pilot cells, or second candidates.
- If the final candidate fails held-out validation and a second candidate is explicitly authorized, use fresh held-out seeds `4050-4099`; do not retune against `4000-4049`.
- Do not silently iterate on held-out failure. If held-out misses by >15 points from tuning evidence, report overfitting and mint fresh validation seeds only after recording the failure.
- Do not optimize away charm: visual trough drama, trail bloom, rival activity, and HUD foreshadowing are non-target guardrails.
- Hash changes across tuning configs are expected; compare hashes only within same seed/config replicates.
- Rescue scenarios must use only `applyTool` actions for the two food drops and one lure, plus optional `snapshot` actions. Do not use `patchTuning`, `stressSpawn`, `dropCarcass`, or assertions inside the rescue scenario.
- Do not widen scope silently. If scope must change, update this `PLAN.md` first with the reason, risk, allowed files, required validation, and rollback or revert strategy.

## Protected Files

Forbidden unless `PLAN.md` is updated first with rationale and validation:

- broad `src/**` changes unrelated to the authorized tuning/scenario work
- `scripts/**`
- `package.json`
- `package-lock.json`
- historical `docs/fleet/reports/**`
- generated run output outside this goal's `evidence/`

Allowed by default:

- `scenarios/rescue-protocol.json`
- Wave 3 reports/artifacts explicitly authorized by `docs/fleet/FLEET.md`
- accepted final tuning/default changes only after held-out validation and human play sign-off
- `docs/plan-goals/03-wave3-agency-delta/**`

## No Orchestration Rabbit Hole

Do not build dashboards, schedulers, worker registries, fleet-management systems, or subagent coordination infrastructure. Use bounded runs and evidence artifacts, not a platform project.

## Knowledge-Spending Requirement

This goal must close the loop `repo finding -> proposed intervention -> controlled change -> verification -> human-visible effect`. Docs, reports, or measurement-only cells do not count as game improvement unless they lead to an accepted tuning/default change or an honest `BLOCKED` outcome explaining why no candidate can be shipped.

## Stages

1. Rescue protocol:
   - Add the scenario and verify stimulus-only behavior.
   - Replay the same scenario twice and compare hash series or final hash for the same seed/config.
   - Record exact coordinates, tick timings, and the player-nest coordinate derivation.
2. Baseline pilot:
   - Run seeds `3000-3009`, unattended vs rescue at default config.
   - Record agency delta, final hashes, finalTick, and any running outcomes.
3. Candidate tuning:
   - Run authorized cells from `FLEET.md`, never >20 seeds per cell.
   - Candidate configs should include rival pressure, drain, and combined variants as authorized.
4. Final held-out validation:
   - Choose one candidate before touching held-out seeds.
   - Run seeds `4000-4049` once.
   - Record pass/fail against target bands.
5. Human play sign-off:
   - Start the app with `npm run dev -- --port 5173`.
   - Record six play sessions as required by the stop condition.
6. Verification:
   - Run `npm test`.
   - Run `git diff --check`.
7. Outcome:
   - Write `GOAL_OUTCOME.md` using the template in `docs/plan-goals/templates/GOAL_OUTCOME.md`.

## Verification

Required before final if any tuning or simulation-facing file changed:

```sh
npm test
git diff --check
```

Use `npm run typecheck` or `npm run build` if the implementation touches TypeScript outside scenario/report docs.

## Stop Behavior

When this goal is complete, stop. Do not begin goal 04 or goal 06. Write `GOAL_OUTCOME.md` and include the next-goal recommendation.

## Final Report

Report:

- Files changed.
- Exact configs, seeds, tick budgets, and outcomes.
- Rescue scenario coordinates and why they are valid.
- Tuning and held-out result tables.
- Human play sign-off summary.
- `npm test` and `git diff --check` results.
- Any target missed and whether the goal is blocked rather than complete.
- `GOAL_OUTCOME.md` status and path.
