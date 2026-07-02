# Goal outcome - 01-baseline-v2

Status: COMPLETE

## One-sentence result

The W1-Z1 terminal-state fix record is closed, baseline v2 is now the current default baseline, and the docs state both the verified fix and the remaining unsafe hash claim.

## Files changed

| File | Why changed | Evidence |
|---|---|---|
| `docs/fleet/FLEET.md` | Makes baseline v2 current, removes the stale pending-fix language, records the landed W1-Z1 fix, and calls out the five hash differences from Wave 0. | `docs/fleet/findings/w1z1-fix-gates.md`; `docs/plan-goals/01-baseline-v2/evidence/baseline-v2/baseline-v2-summary.md` |
| `docs/debug-surface/DEBUG.md` | Adds the V8 / JavaScript-engine determinism caveat without claiming cross-engine bit reproducibility. | `docs/debug-surface/DEBUG.md` |
| `docs/fleet/findings/w1z1-fix-gates.md` | Durable fleet-facing gate record for seed 1337 parity, seed 1401 termination, and baseline v2. | `docs/plan-goals/01-baseline-v2/evidence/w1-z1-gates.md` |
| `docs/plan-goals/01-baseline-v2/progress.jsonl` | Append-only execution ledger. | `docs/plan-goals/01-baseline-v2/evidence/progress-jsonl-parse.log` |
| `docs/plan-goals/01-baseline-v2/evidence/**` | Durable raw logs, summaries, gate output, and validation receipts. | See evidence table below. |

## Evidence artifacts

| Artifact | What it proves | Limitations |
|---|---|---|
| `evidence/current-state.md` | Live repo root, branch, HEAD, plan presence, and pre-closeout doc status. | Snapshot at goal start. |
| `evidence/baseline-v2/baseline-v2-1337-1456.jsonl` | Raw 120-seed baseline v2 output for seeds 1337-1456 at 50k ticks. | Batch summaries do not include per-seed terminal tick. |
| `evidence/baseline-v2/baseline-v2-summary.md` | Counts, running seed, population/mortality medians, and Wave 0 hash comparison. | Derived from raw JSONL plus historical report rollups. |
| `evidence/baseline-v2/baseline-v2-per-seed-diff.csv` | Per-seed old hash/current hash/current outcome comparison. | W0-A lacks old seed summaries, so old seed-level outcome for that range is not fully recoverable. |
| `docs/fleet/findings/w1z1-fix-gates.md` | Fleet-facing W1-Z1 closeout gates. | Records the surprise hash differences rather than resolving their mechanism. |
| `evidence/w1-z1-seed-1401-after-fix-60000.jsonl` | Seed 1401 now terminates at tick 46872. | Focused one-seed post-fix run. |
| `evidence/npm-test.log` | Full debug-surface gate passed. | Local V8/Node environment only. |
| `evidence/git-diff-check.log` | Whitespace diff gate passed. | Corrected wrapper run; first wrapper attempt is preserved separately. |
| `evidence/progress-jsonl-parse.log` | Progress ledger was parseable at the gate checkpoint. | Must be rerun after this outcome file is written. |
| `evidence/fresh-verifier.md` | Fresh-context verifier passed the diff, criteria, and invariant checks. | Verifier was read-only and did not rerun the expensive simulation gates. |

## Commands run

| Command | Result | Artifact/log |
|---|---|---|
| `git rev-parse --show-toplevel` | Established active repo root. | `evidence/current-state.md` |
| `git status --short --branch` | Clean `main` before goal edits; later used to inspect changed files. | `evidence/current-state.md` |
| `git pull --ff-only` | Fast-forwarded `main` to `a4235e10a0a05beb2009392b6d103bdf7de0cc24`. | `evidence/current-state.md` |
| `npm run sim -- --seeds 1337,...,1456 --ticks 50000 --out ...baseline-v2-1337-1456.jsonl` | Passed; 120 seed summaries plus one rollup. | `evidence/baseline-v2/baseline-v2-1337-1456.jsonl`; `evidence/logs/baseline-v2-1337-1456.log` |
| `npm run sim -- --seed 1401 --ticks 60000 --sample-every 600 --out ...w1-z1-seed-1401-after-fix-60000.jsonl` | Passed; seed 1401 terminated at tick 46872. | `evidence/w1-z1-seed-1401-after-fix-60000.jsonl`; `evidence/logs/w1-z1-seed-1401-after-fix-60000.log` |
| `npm test` | Passed. | `evidence/npm-test.log` |
| `git diff --check` | Passed on corrected wrapper run. | `evidence/git-diff-check.log` |
| `node` progress parser | Passed at checkpoint. | `evidence/progress-jsonl-parse.log` |

## Claims now safe to make

- Baseline v2 is the current default-config comparison baseline: seeds 1337-1456, 50k ticks, player 94 victories / 25 collapses / 1 running.
- Seed 1355 is the remaining 50k-budget running seed in baseline v2; it ends with player population 1 and rival population 57.
- Seed 1337 is unchanged by the W1-Z1 fix at the 50k tick budget: player victory, final hash `5101d7c52c007c01`.
- Seed 1401 no longer persists as the W1-Z1 zero-population stalemate; it terminates at tick 46872 with player `gameOver` and rival `victory`.
- `docs/fleet/FLEET.md` no longer describes the W1-Z1 fix as pending.
- Current determinism claims are V8 Node/Chrome claims, not cross-engine JavaScript claims.
- `npm test` passed and `git diff --check` passed.

## Claims still unsafe

- It is unsafe to claim the W1-Z1 fix changed only the two historically running seeds' final hashes. Five final hashes differ from Wave 0 rollups: seeds 1369, 1401, 1417, 1453, and 1455.
- It is unsafe to claim every non-1401 hash difference is explained. The closeout records them as baseline-v2 differences; it does not diagnose their mechanism.
- It is unsafe to claim cross-engine bit reproducibility outside V8 Node/Chrome.
- It is unsafe to claim baseline v2 has no running outcomes; seed 1355 is still running at the 50k tick budget.

## Deviations from PLAN.md

- The checked-in PLAN.md still contains stale absolute bundle paths, but execution used the repo-relative paths required by the launcher request and the plan-goal portability contract.
- The first baseline command attempt used a seed-list form that left a trailing comma and was interrupted before output; the corrected command used an exact comma join and completed.
- The first `git diff --check` wrapper used `status` as a zsh variable name and failed after the check invocation; the corrected wrapper passed and its log is the gate artifact.
- No scope-expanding file edits were made; no protected `src/`, `scripts/`, `scenarios/`, package, generated output, or historical report files were modified.

## Reviewer checklist

- [x] PLAN.md definition of done satisfied
- [x] progress.jsonl parseable at gate checkpoint
- [x] evidence artifacts present
- [x] no forbidden files changed
- [x] tests/gates actually ran
- [x] no historical reports rewritten unless authorized
- [x] docs now match repo state
- [x] remaining uncertainty named
- [x] fresh-context verifier completed

## Recommended next goal

Run a reviewer audit of goal 01 if desired, then proceed to `docs/plan-goals/02-fleet-spending-era/PLAN.md`.
