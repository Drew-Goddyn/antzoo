# Goal outcome - 04-browser-shepherd

Status: COMPLETE

## One-sentence result

Goal 04 produced an executable browser-shepherd milestone, passed the browser bridge gate, and ran a paired five-seed browser pilot showing that browser shepherding is feasible but not proven better than placebo/null perturbation.

## Files changed

| File | Why changed | Evidence |
|---|---|---|
| `docs/fleet/browser/MILESTONE-1.md` | Added the "One Colony, One Shepherd" protocol, API limits, intervention budget, transcript/report schema, screenshot requirements, paired placebo/null requirement, replay requirement, and Mode B caste-policy decision. | `docs/plan-goals/04-browser-shepherd/evidence/ui-inspection/tuning-drawer-dom.txt` |
| `docs/plan-goals/04-browser-shepherd/progress.jsonl` | Appended execution checkpoints for mode decision, browser gate, pilot, and remaining unsafe claims. | Parsed during final verification. |
| `docs/plan-goals/04-browser-shepherd/evidence/browser-gate/playwright-smoke-output.txt` | Captured the `DEBUG.md` browser bridge smoke test result. | Shows tick 5000, hash `632028e9736dd465`, events array, death object, and schema version 1. |
| `docs/plan-goals/04-browser-shepherd/evidence/ui-inspection/*` | Saved DOM and screenshot evidence that the visible browser UI exposes caste-ratio sliders. | `tuning-drawer-dom.txt`, `tuning-drawer.png`. |
| `docs/plan-goals/04-browser-shepherd/evidence/pilot/*` | Stored headless comparison arms, browser shepherd driver, transcripts, screenshots, summaries, and pilot report. | `browser-shepherd-pilot-report.md`. |
| `docs/plan-goals/04-browser-shepherd/GOAL_OUTCOME.md` | Recorded final status, evidence, commands, safe claims, unsafe claims, and next recommendation. | This file. |

## Evidence artifacts

| Artifact | What it proves | Limitations |
|---|---|---|
| `docs/plan-goals/04-browser-shepherd/evidence/browser-gate/playwright-smoke-output.txt` | Browser bridge smoke gate passed with `window.__antzoo`, `step`, `getSnapshot`, `getHash`, and `getEvents`. | Smoke test only; not a pilot. |
| `docs/plan-goals/04-browser-shepherd/evidence/ui-inspection/tuning-drawer-dom.txt` | Visible UI exposes Worker, Soldier, and Nurse caste-ratio sliders. | The pilot did not spend the policy slot. |
| `docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd-pilot-report.md` | Paired five-seed pilot comparing unattended, placebo/null, and shepherded arms on seeds `3000-3004`. | Small exploratory pilot; not held-out validation. |
| `docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd/browser-shepherd-summary.json` | Browser shepherd outcomes, interventions, prediction scores, and replay result. | Driver scoring is mechanical and should not be treated as a full agency metric. |
| `docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd/seed-3000-transcript.md` | Example full prediction-before-step transcript with intervention screenshots and hash replay. | One transcript among five; see neighboring seed transcripts for the rest. |
| `docs/plan-goals/04-browser-shepherd/evidence/pilot/single-runs/*.jsonl` | Single-seed final ticks and summaries for unattended and placebo/null arms. | Headless comparison arms, not browser-play arms. |

## Commands run

| Command | Result | Artifact/log |
|---|---|---|
| `git rev-parse --show-toplevel` | Passed; repo root was `/Users/Drew/projects/antzoo`. | terminal output |
| `git status --short --branch` | Passed before edits; branch was `main...origin/main`. | terminal output |
| `git pull --ff-only` | Passed; already up to date. | terminal output |
| `npm run dev -- --port 5173` | Passed; Vite served `http://127.0.0.1:5173/`. | live dev server |
| `node` Playwright smoke gate from `docs/debug-surface/DEBUG.md` | Passed. | `docs/plan-goals/04-browser-shepherd/evidence/browser-gate/playwright-smoke-output.txt` |
| `npm run sim -- --seeds 3000,3001,3002,3003,3004 --ticks 50000 --out .../unattended-3000-3004.jsonl` | Passed; unattended was 2/5 player wins. | `docs/plan-goals/04-browser-shepherd/evidence/pilot/unattended-3000-3004.jsonl` |
| `npm run sim -- --seeds 3000,3001,3002,3003,3004 --ticks 50000 --scenario scenarios/placebo-perturbation.json --out .../placebo-3000-3004.jsonl` | Passed; placebo/null was 5/5 player wins. | `docs/plan-goals/04-browser-shepherd/evidence/pilot/placebo-3000-3004.jsonl` |
| `node docs/plan-goals/04-browser-shepherd/evidence/pilot/run-browser-shepherd-pilot.cjs` | Passed; shepherded arm was 4/5 player wins and replayed seed 3000 to the same final hash. | `docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd-run-output.txt` |
| Single-seed `npm run sim` summaries for unattended and placebo/null seeds `3000-3004` | Passed; supplied final ticks for the pilot report. | `docs/plan-goals/04-browser-shepherd/evidence/pilot/single-runs/*.jsonl` |

## Claims now safe to make

- Goal 01 baseline v2 exists in `docs/fleet/FLEET.md` and was available before Goal 04 comparisons.
- `docs/fleet/browser/MILESTONE-1.md` now defines the "One Colony, One Shepherd" protocol and can route a fresh agent using that file plus `docs/debug-surface/DEBUG.md`.
- The visible browser UI exposes player-facing caste-ratio sliders; Goal 04 therefore authorizes Mode B, but only through visible UI controls.
- The browser bridge smoke test passed locally with hash `632028e9736dd465` at tick 5000.
- A paired pilot on non-held-out seeds `3000-3004` ran unattended, placebo/null, and shepherded arms.
- The browser shepherd driver produced prediction-before-step transcripts, screenshots, final hashes, and a seed 3000 replay with matching final hash `101fdfb349427467`.
- Browser shepherding is feasible as a protocol and evidence workflow.

## Claims still unsafe

- State-contingent agency beyond perturbation luck is not proven. Placebo/null won 5/5 seeds while the shepherded arm won 4/5.
- Caste-policy agency is untested. The policy slot was authorized but unused in this pilot.
- Held-out performance is unknown. Seeds `4000-4049` were not used and must remain reserved.
- The mechanical prediction score is not a standalone agency metric.
- Default tuning should not change from this evidence.

## Deviations from PLAN.md

- The pilot used five seeds (`3000-3004`), not the launcher's aspirational 10-seed wording, because the checked-in `PLAN.md` and user prompt authorized a small non-held-out pilot and the goal was browser legibility, not final validation.
- The pilot did not spend the visible caste-policy slot. This keeps the pilot to food/lure evidence and leaves policy-level agency unsafe.

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

Pause for review before Goal 05. If proceeding, Goal 05 may cite the browser protocol and replay evidence, but must not claim state-contingent agency success from this pilot.
