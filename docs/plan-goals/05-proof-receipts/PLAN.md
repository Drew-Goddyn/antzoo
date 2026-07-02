# Proof Receipts Plan

Operator artifact: this plan is intentionally stored in the Antzoo repo under `docs/plan-goals/` for portability. It should be committed with the roadmap execution docs.

This goal is not complete when the agent is convinced. It is complete when the repo contains the evidence that would convince a skeptical future reader.

## [GOAL]

Create Antzoo's canonical proof artifact by writing concise receipts for the repo's trust claims and adding an executable `npm run proof` gate that replays representative deterministic evidence locally.

## [STOP CONDITION]

This goal is complete when all of the following are true:

- Goal 01 baseline v2 evidence is complete before this proof is finalized. Drafting is allowed earlier, but proof claims must not cite stale baseline status as current truth.
- `docs/proof/RECEIPTS.md` exists, is short enough to review, and cites source files for every historical claim.
- `RECEIPTS.md` covers:
  - the W1-Z1 zombie-state story and fix evidence
  - the W0-A-replicate fabrication catch and rejection record
  - the W2-X3 seed 2109 replication chain with hash `1607b728381ea540`
- `scripts/proof.ts` exists and is wired as `npm run proof` in `package.json`.
- `npm run proof` reruns:
  - seed 1337 and asserts final hash `5101d7c52c007c01` at tick 33235, or records the currently verified replacement if baseline v2 changed the proof contract
  - seed 1401 and asserts termination before 60k ticks
  - W2-X3 seed 2109 under its exact six-key config and asserts hash `1607b728381ea540`
- README has a section titled "Why you can trust this repo's claims" linking the proof doc and command.
- `npm run proof`, `npm test`, `npm run typecheck`, and `git diff --check` pass.
- No `src/` simulation changes are made.
- Determinism claims are scoped to same build/config and V8 Node/Chrome unless the proof script verifies additional engines.
- `GOAL_OUTCOME.md` exists in this bundle with status `COMPLETE`, `BLOCKED`, `PARTIAL`, or `ABORTED`, and it names claims still unsafe.

## Shared Plan Bundle

- Bundle root: `/Users/Drew/projects/antzoo/docs/plan-goals/05-proof-receipts`
- Source of truth: `/Users/Drew/projects/antzoo/docs/plan-goals/05-proof-receipts/PLAN.md`
- Launcher: `/Users/Drew/projects/antzoo/docs/plan-goals/05-proof-receipts/LAUNCHER.txt`
- Progress ledger: `/Users/Drew/projects/antzoo/docs/plan-goals/05-proof-receipts/progress.jsonl`
- Goal outcome: `/Users/Drew/projects/antzoo/docs/plan-goals/05-proof-receipts/GOAL_OUTCOME.md`
- Evidence directory: `/Users/Drew/projects/antzoo/docs/plan-goals/05-proof-receipts/evidence/`
- Notes directory: `/Users/Drew/projects/antzoo/docs/plan-goals/05-proof-receipts/notes/`

Append execution events to `progress.jsonl`. Do not rewrite prior lines.

## progress.jsonl Schema

Each line must be valid JSON with the keys `ts`, `status`, `goal`, `summary`, `files`, `commands`, `evidence`, `claims`, and `remaining`. Use the canonical schema in `docs/plan-goals/README.md`. Do not use `complete` status until `GOAL_OUTCOME.md` exists.

## Runtime Policy

The default executor is sequential Codex `/goal`. Historical words such as fleet, worker, or dispatch mean runtime-neutral bounded evidence loops, not a dependency on Jules or any standing worker organization. Subagents or separate Codex threads may only be used for bounded read-heavy review or verification.

## Ground Truth To Verify First

- Read `docs/debug-surface/AUDIT.md`, `docs/debug-surface/DEBUG.md`, `docs/fleet/findings/wave0.md`, `docs/fleet/findings/wave1.md`, `docs/fleet/findings/wave2.md`, and `docs/fleet/reports/wave0/W0-A-replicate.md`.
- Confirm `package.json` scripts before editing.
- Inspect `scripts/run.ts` for reusable helpers before writing `scripts/proof.ts`; avoid duplicating large logic if direct imports are reasonable.
- Verify exact W2-X3 config from `docs/fleet/findings/wave2.md`: player `90/5/5`, rival `60/20/20`.
- Confirm whether a `README.md` exists. If not, create the smallest appropriate README section.

## Constraints

- No simulation behavior changes.
- Do not overquote historical reports. Cite and summarize.
- If an asserted hash no longer matches because a valid prior goal changed the proof contract, stop and update this PLAN or record a blocker. Do not silently rewrite the proof to fit current output.
- Proof hashes are not cross-version absolutes; record the commit/build context for the assertions.
- Keep proof output direct: PASS/FAIL lines and enough context for failure triage.
- Do not widen scope silently. If scope must change, update this `PLAN.md` first with the reason, risk, allowed files, required validation, and rollback or revert strategy.

## Protected Files

Forbidden unless `PLAN.md` is updated first with rationale and validation:

- `src/**`
- unrelated `scripts/**`
- `scenarios/**`
- historical `docs/fleet/reports/**`
- generated run output outside this goal's `evidence/`

Allowed by default:

- `docs/proof/RECEIPTS.md`
- `scripts/proof.ts`
- `package.json`
- `README.md`
- `docs/plan-goals/05-proof-receipts/**`

## Stages

1. Source extraction:
   - Gather exact source citations and commands.
   - Record any stale or missing receipt source as an uncertainty.
2. Proof doc:
   - Write `docs/proof/RECEIPTS.md`.
   - Keep it concise and source-cited.
3. Proof script:
   - Add `scripts/proof.ts`.
   - Add `npm run proof`.
   - Ensure failures exit nonzero.
4. README:
   - Add the trust section and links.
5. Verification:
   - Run required commands.
   - Save verbatim proof output in evidence.
6. Outcome:
   - Write `GOAL_OUTCOME.md` using the template in `docs/plan-goals/templates/GOAL_OUTCOME.md`.

## Verification

Required before final:

```sh
npm run proof
npm test
npm run typecheck
git diff --check
```

## Stop Behavior

When this goal is complete, stop. Do not begin goal 08. Write `GOAL_OUTCOME.md` and include the next-goal recommendation.

## Final Report

Report:

- Files changed.
- Proof claims covered.
- `npm run proof` output summary.
- Full validation results.
- Any claim that could not be sourced or rerun.
- `GOAL_OUTCOME.md` status and path.
