# Antzoo Plan Goals

These are in-repo operator artifacts for executing `docs/roadmap.md` over many Codex sessions. They intentionally live under `docs/plan-goals/` instead of the default external `.codex-plan-goals` bundle because the user asked for portability and durability inside the Antzoo repo.

Created from `/Users/Drew/projects/antzoo` on 2026-07-02. Repo snapshot at planning time:

- Canonical checkout: `/Users/Drew/projects/antzoo`
- Branch: `main`
- HEAD: `1609f7e14ea1f02bbc7d3bb8d8b973bcc1f1a253`
- Remote: `https://github.com/drew-goddyn/antzoo.git`
- Status before these artifacts: `docs/roadmap.md` and `.claude/` were untracked; treat them as user-authored unless current git history proves otherwise.

## Protocol

- Each numbered directory is a durable plan-goal bundle.
- `PLAN.md` is the source of truth for that goal.
- `LAUNCHER.txt` is a pasteable `/goal` launcher. Keep it short; do not turn it into a second plan.
- `progress.jsonl` is append-only execution state. Each line must be one valid JSON object.
- `GOAL_OUTCOME.md` is the required final outcome artifact for each goal. A goal is not complete until this exists with status `COMPLETE`, `BLOCKED`, `PARTIAL`, or `ABORTED`.
- Store bulky logs, screenshots, run outputs, and raw proof under that goal's `evidence/` directory when creating evidence.
- Store scratch reasoning under that goal's `notes/` directory when it needs to survive context compaction.
- Append corrective events instead of rewriting, deleting, or summarizing previous `progress.jsonl` lines.
- A child dispatch that stops at "PR open" is not the same thing as this parent plan-goal being complete. Dependent plan-goals should wait until the required artifact is merged into the current working branch, or until Drew explicitly authorizes continuing from an unmerged branch/commit.
- Distinguish fleet workers from repo builders. Existing fleet worker cells may still be one-report-file tasks, but these plan-goals are broader repo-builder handoffs and may edit the files named by their own `PLAN.md`.

## Execution Contract For All Plan-Goals

A plan-goal is complete only when the repo contains durable evidence that a future agent or human can inspect without trusting the completing agent's prose.

For every goal:

1. Treat that goal's `PLAN.md` as the source of truth.
2. Verify current repo facts before editing.
3. Append progress to `progress.jsonl` after each meaningful checkpoint.
4. Store command outputs, derived summaries, diffs, scripts, and review artifacts under that goal's `evidence/` directory unless the plan explicitly names another durable location.
5. Do not mark a gate complete unless the exact evidence artifact exists.
6. Do not rewrite historical reports unless the plan explicitly allows it.
7. Do not widen scope silently. If scope must change, update `PLAN.md` first with the reason, risk, allowed files, required validation, and rollback or revert strategy.
8. Prefer `BLOCKED` with exact remaining evidence over partial, guessed, or synthesized completion.
9. End every goal with `GOAL_OUTCOME.md` containing status, files changed, commands run, evidence artifacts created, claims now safe to make, claims still unsafe, reviewer checklist, and next recommended goal.
10. A future reviewer must be able to answer: what changed, how was it verified, and what remains unproven?

## progress.jsonl Schema

Each line must be valid JSON with this shape:

```json
{"ts":"2026-07-02T06:54:25-07:00","status":"started|checkpoint|decision|evidence|blocked|complete","goal":"01-baseline-v2","summary":"short human-readable update","files":["paths touched or inspected"],"commands":["commands run, if any"],"evidence":["evidence artifact paths"],"claims":["claims this entry supports"],"remaining":["known remaining work or uncertainty"]}
```

Do not use `complete` status until `GOAL_OUTCOME.md` exists.

## GOAL_OUTCOME.md Template

Each goal must write `GOAL_OUTCOME.md` in its own bundle before stopping:

```md
# Goal outcome - <goal id>

Status: COMPLETE | BLOCKED | PARTIAL | ABORTED

## One-sentence result

<What actually changed?>

## Files changed

| File | Why changed | Evidence |
|---|---|---|

## Evidence artifacts

| Artifact | What it proves | Limitations |
|---|---|---|

## Commands run

| Command | Result | Artifact/log |
|---|---|---|

## Claims now safe to make

- <Claim> - supported by <artifact>

## Claims still unsafe

- <Claim> - missing <evidence>

## Deviations from PLAN.md

- None
- Or: <what changed and why>

## Reviewer checklist

- [ ] PLAN.md definition of done satisfied
- [ ] progress.jsonl parseable
- [ ] evidence artifacts present
- [ ] no forbidden files changed
- [ ] tests/gates actually ran
- [ ] no historical reports rewritten unless authorized
- [ ] docs now match repo state
- [ ] remaining uncertainty named

## Recommended next goal

<next bundle or pause/review>
```

## Execution Order

1. `01-baseline-v2`: close the W1-Z1 paperwork gap and re-anchor the post-fix baseline.
2. `02-fleet-spending-era`: update the fleet operating contract for report v2 and Wave 3.
3. `03-wave3-agency-delta`: run the first evidence-backed tuning intervention so player agency matters.
4. `04-browser-shepherd`: prove an agent can play through the browser bridge with predictions and interventions.
5. `05-proof-receipts`: build the public proof artifact and executable `npm run proof` check.
6. `06-rival-viability`: turn the rival colony from hollow theater into a contested character.
7. `07-living-product`: ship player-facing systems that make the colony readable, replayable, and worth sharing.
8. `08-antzoo-bench`: package Antzoo as a deterministic agent benchmark and methodology artifact.

Only run independent goals in parallel when their write sets do not overlap. In particular, serialize goals that edit `docs/fleet/FLEET.md`.

Hard gates:

- Goals `02` through `08` must first verify whether goal `01` is complete. If it is not complete, they may only do preparatory work that does not depend on current baseline numbers.
- Goals that dispatch new fleet experiment cells must wait for goal `02`, because the old report schema still encourages report bloat.
- Goals that compare player agency or benchmark scores must cite `baseline v2`, not the pre-fix 78.3% baseline, unless they are explicitly doing historical analysis.

## Seed Ledger

At planning time, seed ranges mean:

| Range | Status | Rule |
|---|---|---|
| `1337-1456` | Burned by baseline and W1/W2 findings | Use for baseline v2 closeout and historical proof only. |
| `2000-2119` | Burned by Wave 1 and Wave 2 findings | Use for replication, diagnostics, and historical proof only. |
| `3000-3049` | Reserved for Wave 3 tuning | Split cells to respect the 20-seed ceiling. |
| `4000-4049` | Reserved held-out for Wave 3 final candidate | Touch exactly once, only after choosing the final candidate. |
| `4050-4099` | Reserved fallback held-out | Use only if a second final candidate is explicitly authorized after recording the first held-out result. |
| Other fresh ranges | Unassigned | Record before use to avoid accidental reuse. |

Candidate tuning should use scenario/CLI patching first. Change default tuning values only after the final candidate is accepted with held-out evidence and human play sign-off.

## Standing Constraints

- Preserve the deterministic, seed-driven simulation unless a plan explicitly authorizes a gameplay change.
- For behavioral claims, record seed, config, tick, and observable.
- Never compare hashes across different configs. Hashes identify `(state, config)`.
- Do not burn held-out seeds early. Wave 3 reserves seeds `4000-4049` for the final candidate only.
- Do not use timing fields as determinism evidence.
- Do not make cosmetic or FX changes casually; `docs/debug-surface/DEBUG.md` says particles currently consume gameplay RNG.
- State determinism claims as V8 Node/Chrome claims unless a plan has verified another engine.
- When changing simulation, tuning, debug snapshots, hashing, traces, or the headless CLI, run the full `npm test` before calling the work done.
- Human play sign-off is required before accepting player-facing balance or product changes.

## Launcher Inventory

Each launcher is also stored beside its plan:

- `01-baseline-v2/LAUNCHER.txt`
- `02-fleet-spending-era/LAUNCHER.txt`
- `03-wave3-agency-delta/LAUNCHER.txt`
- `04-browser-shepherd/LAUNCHER.txt`
- `05-proof-receipts/LAUNCHER.txt`
- `06-rival-viability/LAUNCHER.txt`
- `07-living-product/LAUNCHER.txt`
- `08-antzoo-bench/LAUNCHER.txt`
