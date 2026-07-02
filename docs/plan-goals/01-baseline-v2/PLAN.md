# Baseline V2 Closeout Plan

Operator artifact: this plan is intentionally stored in the Antzoo repo under `docs/plan-goals/` for portability. It should be committed with the roadmap execution docs.

## [GOAL]

Close the W1-Z1 fix record and publish a post-fix baseline v2 for default Antzoo behavior by updating only documentation and evidence files, with all behavioral claims backed by per-seed outcomes, final hashes, and passing required gates.

## [STOP CONDITION]

This goal is complete when all of the following are true:

- `docs/fleet/FLEET.md` no longer says the W1-Z1 terminal-state fix is "AUTHORIZED pending"; it records the actual fix and links or cites the evidence.
- `docs/fleet/FLEET.md` contains a clearly labeled `baseline v2 (post-W1-Z1-fix)` for seeds `1337-1456`, 50k ticks, baseline config, with win/collapse/running counts and per-seed evidence available.
- The two historical `running` seeds are identified. If the baseline v2 changes any other seed outcome or hash unexpectedly, the report says so prominently instead of smoothing it over.
- The W1-Z1 gate evidence is recorded in a durable doc such as `docs/fleet/findings/w1z1-fix-gates.md`, including seed 1337 unchanged evidence, seed 1401 termination evidence, and the 120-seed baseline rerun evidence.
- `docs/debug-surface/DEBUG.md` includes the V8-only numeric determinism caveat from `docs/roadmap.md`: JS engine Math behavior is not IEEE-pinned across engines, so current determinism is verified on V8 Node/Chrome.
- No `src/`, `scripts/`, `scenarios/`, generated output, or gameplay/tuning files are changed by this goal.
- `npm test` passes, or the final report explains the exact failure and why the docs should not be considered complete.

## Shared Plan Bundle

- Bundle root: `/Users/Drew/projects/antzoo/docs/plan-goals/01-baseline-v2`
- Source of truth: `/Users/Drew/projects/antzoo/docs/plan-goals/01-baseline-v2/PLAN.md`
- Launcher: `/Users/Drew/projects/antzoo/docs/plan-goals/01-baseline-v2/LAUNCHER.txt`
- Progress ledger: `/Users/Drew/projects/antzoo/docs/plan-goals/01-baseline-v2/progress.jsonl`
- Evidence directory: `/Users/Drew/projects/antzoo/docs/plan-goals/01-baseline-v2/evidence/`
- Notes directory: `/Users/Drew/projects/antzoo/docs/plan-goals/01-baseline-v2/notes/`

Append execution events to `progress.jsonl`. Do not rewrite prior lines.

## Ground Truth To Verify First

- Run `git status --short --branch` and record branch/dirty state.
- Read `AGENTS.md`, `docs/roadmap.md`, `docs/fleet/FLEET.md`, `docs/debug-surface/DEBUG.md`, `docs/fleet/findings/wave1.md`, and `docs/fleet/findings/wave2.md`.
- Confirm current history still contains fix commit `a21a91b Fix W1-Z1 zero-population terminal state`, or record the current equivalent.
- Confirm `scripts/run.ts` still supports comma-list `--seeds`; do not assume range syntax. Use shell expansion to create `1337,1338,...,1456` if helpful.
- Confirm whether `docs/fleet/findings/w1z1-fix-gates.md` already exists before creating it.

## Constraints

- Documentation and evidence only.
- Do not edit generated output, `node_modules/`, or raw historical fleet reports.
- Do not change tests or gates to fit the evidence.
- Timing fields are not determinism evidence.
- If a full 120-seed run cannot finish, write an honest partial report and keep the goal incomplete.

## Stages

1. Baseline rerun:
   - Run default-config seeds `1337-1456` for 50k ticks.
   - Suggested command shape:
     - `SEEDS=$(seq -s, 1337 1456)`
     - `npm run sim -- --seeds "$SEEDS" --ticks 50000 --out docs/plan-goals/01-baseline-v2/evidence/baseline-v2-1337-1456.jsonl`
   - Record command, wall clock, outcome counts, and evidence path.
2. Gate record:
   - Record the W1-Z1 fix evidence, including seed 1337 and seed 1401.
   - If before-fix evidence must be read from history or existing reports, cite the source and do not imply it was rerun locally.
3. Docs update:
   - Update `FLEET.md` and `DEBUG.md` with only the verified changes.
   - Keep older baseline facts visible when they remain useful, but label stale numbers clearly.
4. Verification:
   - Run `npm test`.
   - Run `git diff --check`.
   - Append results and evidence paths to `progress.jsonl`.

## Verification

Required before final:

```sh
npm test
git diff --check
```

If the baseline run is too large for the session, do not fake completion. Append a `BLOCKED` event with the partial seed count and the exact next command.

## Final Report

Report:

- Files changed.
- Exact seed range, config, tick budget, and output counts.
- Whether only the previously running seeds changed outcome.
- `npm test` and `git diff --check` results.
- Any remaining uncertainty or blocker.
