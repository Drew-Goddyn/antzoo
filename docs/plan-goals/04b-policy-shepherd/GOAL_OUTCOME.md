# Goal outcome - 04b-policy-shepherd

Status: COMPLETE

## One-sentence result

Goal 04B ran the policy-aware browser diagnostic on seeds `3005-3009`; visible slider control and replay worked, but policy-aware play did not beat unattended, perturbation placebo/null, or fixed policy placebo.

## Files changed

| File | Why changed | Evidence |
|---|---|---|
| `docs/plan-goals/04b-policy-shepherd/PLAN.md` | Added the 04B protocol, seed policy, arms, predeclared policy menu, fixed placebo, validation, and claim standard. | `docs/plan-goals/04b-policy-shepherd/evidence/policy-menu.md` |
| `docs/plan-goals/04b-policy-shepherd/LAUNCHER.txt` | Added a pasteable launcher for the 04B bundle. | This outcome file |
| `docs/plan-goals/04b-policy-shepherd/progress.jsonl` | Recorded execution checkpoints. | `docs/plan-goals/04b-policy-shepherd/evidence/validation/progress-jsonl-parse.txt` |
| `docs/plan-goals/04b-policy-shepherd/evidence/current-state.md` | Captured initial repo-contract findings and prior evidence. | This outcome file |
| `docs/plan-goals/04b-policy-shepherd/evidence/policy-menu.md` | Recorded the predeclared menu and decision rule. | `docs/plan-goals/04b-policy-shepherd/evidence/pilot-report.md` |
| `docs/plan-goals/04b-policy-shepherd/evidence/fixed-policy-placebo.md` | Recorded the predeclared fixed Worker surge placebo. | `docs/plan-goals/04b-policy-shepherd/evidence/policy-placebo/fixed-policy-summary.json` |
| `docs/plan-goals/04b-policy-shepherd/evidence/run-browser-policy-pilot.cjs` | Added the evidence driver for visible-slider browser policy arms and replay. | `docs/plan-goals/04b-policy-shepherd/evidence/browser-policy-run-output.txt` |
| `docs/plan-goals/04b-policy-shepherd/evidence/**` | Stored raw CLI outputs, browser screenshots, transcripts, summaries, replay note, report, and validation logs. | `docs/plan-goals/04b-policy-shepherd/evidence/pilot-report.md` |
| `docs/plan-goals/04b-policy-shepherd/GOAL_OUTCOME.md` | Recorded final status, claims, validation, and next step. | This file |

## Evidence artifacts

| Artifact | What it proves | Limitations |
|---|---|---|
| `evidence/browser-gate/playwright-smoke-output.txt` | Browser bridge smoke gate passed with tick `5000`, hash `632028e9736dd465`, event array, death object, and schema version `1`. | Smoke test only. |
| `evidence/raw/` | Unattended and perturbation placebo/null evidence for seeds `3005-3009`. | Headless comparison arms. |
| `evidence/policy-placebo/` | Fixed Worker surge `90/5/5` was applied through visible sliders at tick `6000` on all seeds. | Non-state-contingent by design. |
| `evidence/policy-aware/` | Browser state was observed, predictions were written, and visible policy actions were applied at tick `6000`. | Every policy-aware choice selected Worker surge, matching fixed policy. |
| `evidence/replay/replay-verification.md` | Seed `3005` replay with the same visible policy values and tick matched final hash `4a02f9240bee6620`. | One-seed replay; not agency proof. |
| `evidence/analysis-summary.json` | Machine-readable paired comparisons, mechanism deltas, prediction scores, and replay result. | Derived summary. |
| `evidence/pilot-report.md` | Human-readable synthesis with required tables, safe claims, and unsafe claims. | Small diagnostic, not held-out validation. |
| `evidence/validation/git-diff-check.txt` | `git diff --check` passed. | Whitespace/diff gate only. |
| `evidence/validation/git-diff-cached-check.txt` | `git diff --cached --check` passed after staging the new bundle. | Commit-scope whitespace/diff gate only. |
| `evidence/validation/progress-jsonl-parse.txt` | `progress.jsonl` parsed as JSONL with required keys. | Schema presence check only. |

## Commands run

| Command | Result | Artifact/log |
|---|---|---|
| `git rev-parse --show-toplevel` | Passed; repo root was `/Users/Drew/projects/antzoo`. | terminal output |
| `git status --short --branch` | Passed; branch started clean at `main...origin/main`. | terminal output |
| `git pull --ff-only` | Passed; already up to date. | terminal output |
| `npm run sim -- --seeds 3005,3006,3007,3008,3009 --ticks 50000 --out .../unattended-3005-3009.jsonl` | Passed. | `evidence/raw/unattended-3005-3009.jsonl` |
| `npm run sim -- --seeds 3005,3006,3007,3008,3009 --ticks 50000 --scenario scenarios/placebo-perturbation.json --out .../perturbation-placebo-3005-3009.jsonl` | Passed. | `evidence/raw/perturbation-placebo-3005-3009.jsonl` |
| Single-seed `npm run sim` commands for unattended and perturbation placebo/null seeds `3005-3009` | Passed. | `evidence/raw/single-runs/` |
| `npm run dev -- --port 5173` | Passed; dev server served the browser bridge. | terminal output |
| Playwright bridge smoke gate from `docs/debug-surface/DEBUG.md` | Passed. | `evidence/browser-gate/playwright-smoke-output.txt` |
| `node docs/plan-goals/04b-policy-shepherd/evidence/run-browser-policy-pilot.cjs` | Passed; produced fixed policy, policy-aware, screenshots, transcripts, summaries, and replay. | `evidence/browser-policy-run-output.txt` |
| Analysis-summary Node command | Passed. | `evidence/analysis-summary.json` |
| `git diff --check` | Passed. | `evidence/validation/git-diff-check.txt` |
| `git diff --cached --check` | Passed after staging the 04B bundle. | `evidence/validation/git-diff-cached-check.txt` |
| Progress JSONL parse command | Passed. | `evidence/validation/progress-jsonl-parse.txt` |

`npm test` was not run because no source, scenario, package, debug-surface, CLI, simulation, tuning, or generated runtime files outside the 04B bundle were changed.

## Claims now safe to make

- Visible browser Worker/Soldier/Nurse caste-policy sliders can be operated by automation through the UI, with before/after screenshots.
- The browser bridge smoke gate passed locally for this goal.
- Policy-aware and fixed-policy browser runs were collected on exploratory seeds `3005-3009`; no held-out seeds were touched.
- Seed `3005` visible-policy replay matched final hash `4a02f9240bee6620`.
- On this pilot, unattended was `5/5`, perturbation placebo/null was `4/5`, fixed policy placebo was `3/5`, and policy-aware shepherd was `3/5`.
- Policy-aware did not beat fixed policy placebo; all policy-aware final hashes matched fixed-policy final hashes seed-for-seed.

## Claims still unsafe

- State-contingent policy agency is not proven.
- Policy-aware shepherding did not beat unattended play, perturbation placebo/null, or fixed policy placebo.
- The Worker surge policy is not validated as a beneficial default or player recommendation.
- Prediction accuracy is not agency evidence here because fixed policy produced the same scores and outcomes.
- Held-out performance remains unknown; seeds `4000-4049` and `4050-4099` remain untouched.
- Default tuning should not change from this evidence.

## Deviations from PLAN.md

- None from the 04B protocol. The diagnostic completed, but the agency-success claim failed the predeclared standard.

## Reviewer checklist

- [x] PLAN.md definition of done satisfied
- [x] progress.jsonl parseable
- [x] evidence artifacts present
- [x] no forbidden files changed
- [x] tests/gates actually ran
- [x] no historical reports rewritten unless authorized
- [x] docs now match repo state
- [x] remaining uncertainty named

## Recommended next goal

Pause before Goal 05. If continuing policy work, use a redesigned diagnostic that forces a meaningful state-contingent branch against a strong fixed-policy placebo before spending any held-out seeds.
