# Baseline V2 Closeout Plan

Operator artifact: this plan is intentionally stored in the Antzoo repo under `docs/plan-goals/` for portability. It should be committed with the roadmap execution docs.

This goal is not complete when the agent is convinced. It is complete when the repo contains the evidence that would convince a skeptical future reader.

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
- `GOAL_OUTCOME.md` exists in this bundle with status `COMPLETE`, `BLOCKED`, `PARTIAL`, or `ABORTED`, and it names claims still unsafe.

## Definition Of Done Gate Matrix

This goal is complete only when all required gates below are satisfied or explicitly `BLOCKED` with exact remaining evidence.

| Gate | Required? | Evidence artifact | Completion rule |
|---|---:|---|---|
| Current repo fact scan | Yes | `evidence/current-state.md` | Records current W1-Z1 fix status, FLEET.md status text, DEBUG.md caveat status, and relevant commits/files inspected. |
| W1-Z1 seed 1337 parity | Yes | `evidence/w1-z1-gates.md` or command log | Shows seed 1337 final hash unchanged before/after fix, or cites already durable evidence if present. |
| W1-Z1 seed 1401 termination | Yes | `evidence/w1-z1-gates.md` or command log | Shows seed 1401 now terminates and records tick/outcome. |
| Post-fix baseline v2 rerun | Yes | `evidence/baseline-v2/` | Runs or locates durable 120-seed post-fix evidence and records outcome changes vs previous baseline. |
| FLEET.md updated | Yes | diff plus `GOAL_OUTCOME.md` | Established baseline and W1-Z1 status accurately reflect current repo. |
| DEBUG.md V8 caveat | Yes | diff plus `GOAL_OUTCOME.md` | Adds JS-engine/V8 determinism caveat without overstating cross-engine reproducibility. |
| npm test | Yes | `evidence/npm-test.log` | Passes. |
| git diff --check | Yes | `evidence/git-diff-check.log` | Passes. |
| progress.jsonl valid | Yes | parse command/output | Every line is parseable JSON using the schema in `docs/plan-goals/README.md`. |
| GOAL_OUTCOME.md | Yes | `GOAL_OUTCOME.md` | Summarizes what changed, what is now safe to claim, and what remains unsafe. |

## Shared Plan Bundle

Work from the current Git repository root, determined by `git rev-parse --show-toplevel`.

- Bundle root: `docs/plan-goals/01-baseline-v2`
- Source of truth: `docs/plan-goals/01-baseline-v2/PLAN.md`
- Launcher: `docs/plan-goals/01-baseline-v2/LAUNCHER.txt`
- Progress ledger: `docs/plan-goals/01-baseline-v2/progress.jsonl`
- Goal outcome: `docs/plan-goals/01-baseline-v2/GOAL_OUTCOME.md`
- Evidence directory: `docs/plan-goals/01-baseline-v2/evidence/`
- Notes directory: `docs/plan-goals/01-baseline-v2/notes/`

Append execution events to `progress.jsonl` using the schema in `docs/plan-goals/README.md`. Do not rewrite prior lines.

## progress.jsonl Schema

Each line must be valid JSON with the keys `ts`, `status`, `goal`, `summary`, `files`, `commands`, `evidence`, `claims`, and `remaining`. Use the canonical schema in `docs/plan-goals/README.md`. Do not use `complete` status until `GOAL_OUTCOME.md` exists.

## Runtime Policy

The default executor is sequential Codex `/goal`. Historical words such as fleet, worker, or dispatch mean bounded evidence loops, not a dependency on Jules or any standing worker organization. Subagents or separate Codex threads may only be used for bounded read-heavy review or verification. Do not build orchestration infrastructure for this goal.

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
- Do not widen scope silently. If scope must change, update this `PLAN.md` first with the reason, risk, allowed files, required validation, and rollback or revert strategy.

## Protected Files

This goal is documentation/evidence closeout only.

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
- `docs/debug-surface/DEBUG.md`
- `docs/plan-goals/01-baseline-v2/**`
- new evidence artifacts under `docs/plan-goals/01-baseline-v2/evidence/**`

## False Completion Traps

Do not count any of these as completion:

- Updating `FLEET.md` to say baseline v2 exists without durable seed-level or rollup evidence.
- Claiming the W1-Z1 fix is closed because source code changed, without gate evidence.
- Treating the old n=120 baseline as post-fix baseline v2.
- Relying on prose in historical reports when command output or hashes are required.
- Running only `npm test` and calling the baseline complete.
- Recording a summary without enough seed/config/hash/outcome detail for future replication.
- Hiding an expensive or timed-out run by summarizing partial results as complete.

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
5. Outcome:
   - Write `GOAL_OUTCOME.md` using the template in `docs/plan-goals/README.md`.
   - Include a recommendation for whether to proceed to goal 02, repair goal 01, run a reviewer audit, or pause for human inspection.

## Verification

Required before final:

```sh
npm test
git diff --check
```

If the baseline run is too large for the session, do not fake completion. Append a `BLOCKED` event with the partial seed count and the exact next command.

## Stop Behavior

When this goal is complete, stop. Do not begin goal 02. Write `GOAL_OUTCOME.md` and include the next-goal recommendation.

## Final Report

Report:

- Files changed.
- Exact seed range, config, tick budget, and output counts.
- Whether only the previously running seeds changed outcome.
- `npm test` and `git diff --check` results.
- Any remaining uncertainty or blocker.
- `GOAL_OUTCOME.md` status and path.
