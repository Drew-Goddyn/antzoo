# Goal outcome - 03-wave3-agency-delta

Status: BLOCKED

## One-sentence result

The reusable rescue scenario and first Wave 3 agency evidence loop are complete, but no authorized candidate created a shippable agency improvement, so held-out seeds were not touched and default tuning was not changed.

## Files changed

| File | Why changed | Evidence |
|---|---|---|
| `scenarios/rescue-protocol.json` | Adds the stimulus-only rescue protocol from the Wave 3 manifest: food at tick 6000, lure at tick 9000, food at tick 12000 near the player nest. | `docs/plan-goals/03-wave3-agency-delta/evidence/rescue-determinism.md` |
| `docs/plan-goals/03-wave3-agency-delta/progress.jsonl` | Append-only execution ledger for Goal 03. | `docs/plan-goals/03-wave3-agency-delta/evidence/progress-jsonl-parse.txt` |
| `docs/plan-goals/03-wave3-agency-delta/evidence/current-state.md` | Records live repo root, branch, prerequisite outcomes, scenario coordinate derivation, and authorized candidate defaults. | This file and required source/doc reads. |
| `docs/plan-goals/03-wave3-agency-delta/evidence/scenarios/**` | Scenario-patched candidate configs used to test tuning without changing defaults. | Candidate summaries and raw per-seed artifacts. |
| `docs/plan-goals/03-wave3-agency-delta/evidence/raw/**` | Raw per-seed CLI outputs for default, rival-pressure, drain-pressure, and combined candidate cells. | Summary markdown, JSON, and CSV artifacts. |
| `docs/plan-goals/03-wave3-agency-delta/evidence/*summary*` and `*-per-seed.csv` | Human-readable and machine-readable rollups for the agency cells. | `candidate-synthesis.md` |
| `docs/plan-goals/03-wave3-agency-delta/evidence/candidate-synthesis.md` | Records the no-final-candidate decision and held-out safeguard. | This outcome file. |
| `docs/plan-goals/03-wave3-agency-delta/evidence/npm-test.txt` | Captures the full debug-surface gate output. | `npm test` passed. |
| `docs/plan-goals/03-wave3-agency-delta/evidence/git-diff-check.txt` | Captures the whitespace gate result. | `git diff --check` passed. |
| `docs/plan-goals/03-wave3-agency-delta/evidence/fresh-verifier.md` | Captures the independent fresh-context verification pass. | Fresh verifier found no blocking issues. |

## Evidence artifacts

| Artifact | What it proves | Limitations |
|---|---|---|
| `evidence/current-state.md` | Goal 01 and 02 prerequisites were complete; Wave 3 manifest, seed hygiene, rescue coordinates, and candidate defaults were verified from the live repo. | Snapshot at Goal 03 start. |
| `evidence/rescue-determinism.md` | Rescue scenario replayed deterministically for seed 3000 at default config: same hash series, same final tick, same final hash. | One-seed replay proof, local V8 Node. |
| `evidence/w3-a0-summary.md` and `w3-a0-per-seed.csv` | Default-config agency anchor: seeds 3000-3019, unattended 14/20 wins, rescue 15/20 wins. Includes required 3000-3009 pilot table. | Tuning slice only; not held-out. |
| `evidence/w3-r75-summary.md` and `w3-r75-per-seed.csv` | Stronger-rival candidate: unattended 11/20 wins, rescue 9/20 wins. | Tuning slice only; rejected before held-out. |
| `evidence/w3-d110-summary.md` and `w3-d110-per-seed.csv` | Drain-pressure candidate: unattended 17/20 wins, rescue 16/20 wins, one rescue running outcome. | Tuning slice only; rejected before held-out. |
| `evidence/w3-r75-d110-summary.md` and `w3-r75-d110-per-seed.csv` | Combined candidate: unattended 16/20 wins, rescue 14/20 wins. | Tuning slice only; rejected before held-out. |
| `evidence/candidate-synthesis.md` | No final candidate selected; held-out seeds 4000-4049 remained untouched; default tuning remained unchanged. | Blocks shipping rather than validating a replacement candidate. |
| `evidence/npm-test.txt` | Full debug-surface gate passed after the scenario and evidence changes. | Local V8/Node environment only. |
| `evidence/progress-jsonl-parse.txt` | Goal 03 progress ledger parsed with required keys. | Schema/key check only. |
| `evidence/git-diff-check.txt` | Whitespace diff gate passed. | Whitespace gate only. |
| `evidence/fresh-verifier.md` | Fresh-context verifier checked the diff, criteria, seed hygiene, protected files, gates, and blocked outcome. | Read-only verification; it did not rerun every single-seed simulation cell. |

## Commands run

| Command | Result | Artifact/log |
|---|---|---|
| `git rev-parse --show-toplevel` | Established active repo root. | `evidence/current-state.md` |
| `git status --short --branch` | Started clean on `main`; branch synced with origin after pull. | `evidence/current-state.md` |
| `git pull --ff-only` | Fast-forwarded `main` to `1f87d90c9ad095b7144133b70a5b92521ad5b8b4`. | `evidence/current-state.md` |
| Required plan/doc/source inspections | Confirmed Goal 01/02 prerequisites, Wave 3 manifest, scenario timing, nest coordinate derivation, tuning defaults, and CLI scenario patching. | `evidence/current-state.md` |
| `npm run sim -- --seed 3000 --ticks 50000 --scenario scenarios/rescue-protocol.json --hash-every 1000 --out ...rescue-determinism-run1.jsonl` | Passed. | `evidence/rescue-determinism-run1.jsonl` |
| `npm run sim -- --seed 3000 --ticks 50000 --scenario scenarios/rescue-protocol.json --hash-every 1000 --out ...rescue-determinism-run2.jsonl` | Passed and matched run 1. | `evidence/rescue-determinism-run2.jsonl`; `evidence/rescue-determinism.md` |
| `npm run sim -- --seed <3000-3019> --ticks 50000 ...` for W3-A0, W3-R75, W3-D110, and W3-R75-D110 unattended/rescue arms | Passed for all 160 single-seed runs. | `evidence/raw/**`; summary markdown/JSON/CSV artifacts |
| `npm test` | Passed. | `evidence/npm-test.txt` |
| `node` progress parser | Passed. | `evidence/progress-jsonl-parse.txt` |
| `git diff --check` | Passed. | `evidence/git-diff-check.txt` |
| Fresh-context verifier | Passed with no blocking findings. | `evidence/fresh-verifier.md` |

## Claims now safe to make

- The rescue scenario is stimulus-only and matches the Wave 3 manifest coordinates and timings.
- Rescue scenario replay determinism holds for seed 3000 at default config on local V8 Node.
- Default tuning on seeds 3000-3019 has only a 5-point rescue lift: unattended 14/20 wins, rescue 15/20 wins.
- Stronger rival pressure alone reaches the unattended risk band at 11/20 wins, but rescue drops to 9/20 wins and is not viable.
- The small drain-pressure candidate and the combined candidate do not produce a positive agency delta on the tuning slice.
- No final candidate was selected.
- Held-out seeds 4000-4049 were not touched.
- Default tuning was not changed.
- Full `npm test` passed.
- `git diff --check` passed.
- A fresh-context verifier found no blocking issues.

## Claims still unsafe

- It is unsafe to claim Antzoo has a shippable Wave 3 agency-delta tuning change.
- It is unsafe to claim held-out validation, because held-out seeds were intentionally not used.
- It is unsafe to claim Drew's human play sign-off, because no candidate reached that gate and no sign-off was provided.
- It is unsafe to change default tuning from this evidence.

## Deviations from PLAN.md

- The plan intended final held-out validation if a candidate was selected. No candidate met the tuning-slice evidence bar, so held-out validation was deliberately skipped to protect seeds 4000-4049.
- The plan intended human play sign-off if a candidate reached final acceptance. No candidate reached that stage, so no play-signoff packet was created and no default tuning changed.

## Reviewer checklist

- [x] PLAN.md blocked-outcome path satisfied
- [x] progress.jsonl parseable
- [x] evidence artifacts present
- [x] no forbidden files changed
- [x] tests/gates actually ran
- [x] no historical reports rewritten unless authorized
- [x] docs now match repo state
- [x] remaining uncertainty named
- [x] fresh-context verifier completed

## Recommended next goal

Pause for review before Goal 04. A future Goal 03 follow-up should redesign the intervention rather than burn held-out seeds on the failed pressure candidates.
