# Policy-Aware Browser Shepherd Pilot - Goal 04B

## Protocol

- plan: `docs/plan-goals/04b-policy-shepherd/PLAN.md`
- browser milestone: `docs/fleet/browser/MILESTONE-1.md`
- seeds: `3005-3009`
- held-out seeds used: none
- held-out ranges avoided: `4000-4049`, `4050-4099`
- browser bridge gate: `docs/plan-goals/04b-policy-shepherd/evidence/browser-gate/playwright-smoke-output.txt`
- policy driver: `docs/plan-goals/04b-policy-shepherd/evidence/run-browser-policy-pilot.cjs`
- analysis summary: `docs/plan-goals/04b-policy-shepherd/evidence/analysis-summary.json`

During individual browser policy runs, the driver used `getSnapshot`, `getEvents`, `getHash`, `pause`, `step(n <= 1200)`, screenshots, and visible Worker/Soldier/Nurse sliders. It did not call `patchTuning`, `resetWorld`, hidden tuning APIs, or source reads during individual runs.

## Arm Definitions

| Arm | Surface | Definition |
|---|---|---|
| Unattended | headless CLI | Default config, no intervention. |
| Perturbation placebo/null | headless CLI | Committed `scenarios/placebo-perturbation.json`: off-nest food/lure/food at ticks 6000/9000/12000. |
| Fixed policy placebo | browser visible UI | At tick 6000, set Worker/Soldier/Nurse sliders to `90/5/5` for every seed. This was predeclared before seed-state inspection. |
| Policy-aware shepherd | browser visible UI | At tick 6000, observe state, choose one predeclared menu option, and set visible sliders. |

The fixed policy placebo used Worker surge because prior repo evidence identifies high player worker share as the strongest known non-state-contingent caste-policy direction. This makes it a stringent placebo.

## Per-Seed Outcome Table

| Seed | Arm | Outcome | Final tick | Final hash | Player final pop | Rival final pop | Player food delivered | Rival food delivered | Player starvation deaths | Rival starvation deaths |
|---:|---|---|---:|---|---:|---:|---:|---:|---:|---:|
| 3005 | unattended | victory | 17801 | a674e5f8f3590e6c | 50 | 0 | 805 | 419 | 168 | 155 |
| 3005 | perturbation placebo/null | gameOver | 26425 | 75db395f0084b4fb | 0 | 23 | 931 | 667 | 211 | 160 |
| 3005 | fixed policy placebo | victory | 15312 | 4a02f9240bee6620 | 73 | 0 | 777 | 488 | 145 | 131 |
| 3005 | policy-aware shepherd | victory | 15312 | 4a02f9240bee6620 | 73 | 0 | 777 | 488 | 145 | 131 |
| 3006 | unattended | victory | 13910 | 816ec1f1ecc58f35 | 116 | 0 | 1029 | 283 | 122 | 104 |
| 3006 | perturbation placebo/null | victory | 13910 | 58db7ccac9edc7b2 | 115 | 0 | 1020 | 283 | 122 | 104 |
| 3006 | fixed policy placebo | gameOver | 30508 | c515f48b1bb6bdc7 | 0 | 13 | 1251 | 839 | 243 | 136 |
| 3006 | policy-aware shepherd | gameOver | 30508 | c515f48b1bb6bdc7 | 0 | 13 | 1251 | 839 | 243 | 136 |
| 3007 | unattended | victory | 6105 | 8bc2a90b7305a337 | 160 | 0 | 598 | 121 | 25 | 64 |
| 3007 | perturbation placebo/null | victory | 6105 | cbefcb3c536c21e4 | 160 | 0 | 598 | 121 | 25 | 64 |
| 3007 | fixed policy placebo | victory | 6105 | 6fd56b35b87bc5fd | 160 | 0 | 598 | 121 | 25 | 64 |
| 3007 | policy-aware shepherd | victory | 6105 | 6fd56b35b87bc5fd | 160 | 0 | 598 | 121 | 25 | 64 |
| 3008 | unattended | victory | 13347 | e32d2a900c735a34 | 87 | 0 | 965 | 274 | 145 | 101 |
| 3008 | perturbation placebo/null | victory | 13347 | 1b6911e4ee040f10 | 87 | 0 | 958 | 274 | 145 | 101 |
| 3008 | fixed policy placebo | gameOver | 27569 | eece39e1e2b1e611 | 0 | 21 | 1310 | 635 | 245 | 150 |
| 3008 | policy-aware shepherd | gameOver | 27569 | eece39e1e2b1e611 | 0 | 21 | 1310 | 635 | 245 | 150 |
| 3009 | unattended | victory | 14432 | a4eaa4cb2e7cf65f | 124 | 0 | 1215 | 334 | 135 | 102 |
| 3009 | perturbation placebo/null | victory | 14432 | ca4a0b9d61c308f9 | 124 | 0 | 1212 | 334 | 135 | 102 |
| 3009 | fixed policy placebo | victory | 23414 | dec4f83288fa8a6e | 71 | 0 | 1609 | 531 | 214 | 149 |
| 3009 | policy-aware shepherd | victory | 23414 | dec4f83288fa8a6e | 71 | 0 | 1609 | 531 | 214 | 149 |

Outcome counts:

| Arm | Player wins | Player collapses | Running |
|---|---:|---:|---:|
| Unattended | 5 | 0 | 0 |
| Perturbation placebo/null | 4 | 1 | 0 |
| Fixed policy placebo | 3 | 2 | 0 |
| Policy-aware shepherd | 3 | 2 | 0 |

## Paired Flip Tables

### Policy-Aware Shepherd vs Unattended

| Seed | Unattended | Policy-aware shepherd | Flip |
|---:|---|---|---|
| 3005 | victory | victory | unchanged win |
| 3006 | victory | gameOver | win->loss |
| 3007 | victory | victory | unchanged win |
| 3008 | victory | gameOver | win->loss |
| 3009 | victory | victory | unchanged win |

Flip count: loss->win 0, win->loss 2, unchanged wins 3, unchanged losses 0.

### Policy-Aware Shepherd vs Perturbation Placebo/Null

| Seed | Perturbation placebo/null | Policy-aware shepherd | Flip |
|---:|---|---|---|
| 3005 | gameOver | victory | loss->win |
| 3006 | victory | gameOver | win->loss |
| 3007 | victory | victory | unchanged win |
| 3008 | victory | gameOver | win->loss |
| 3009 | victory | victory | unchanged win |

Flip count: loss->win 1, win->loss 2, unchanged wins 2, unchanged losses 0.

### Policy-Aware Shepherd vs Fixed Policy Placebo

| Seed | Fixed policy placebo | Policy-aware shepherd | Flip |
|---:|---|---|---|
| 3005 | victory | victory | unchanged win |
| 3006 | gameOver | gameOver | unchanged loss |
| 3007 | victory | victory | unchanged win |
| 3008 | gameOver | gameOver | unchanged loss |
| 3009 | victory | victory | unchanged win |

Flip count: loss->win 0, win->loss 0, unchanged wins 3, unchanged losses 2.

## Mechanism Deltas

Paired medians are computed as `policy-aware shepherd - comparator`.

| Comparison | dFood P/R | dFinalPop P/R | dStarvationDeaths P/R | dFinalTick | Reading |
|---|---:|---:|---:|---:|---|
| Policy-aware - unattended | +222 / +197 | -53 / 0 | +79 / +32 | +8982 | Policy-aware delivered more food but produced worse paired outcomes on two seeds, lower final player population, and more player starvation. |
| Policy-aware - perturbation placebo/null | +231 / +197 | -53 / 0 | +79 / +32 | +8982 | Policy-aware beat perturbation only on seed 3005 and lost two perturbation wins; mechanism movement is not a clean rescue signal. |
| Policy-aware - fixed policy placebo | 0 / 0 | 0 / 0 | 0 / 0 | 0 | Policy-aware was identical to fixed policy for every paired metric and final hash. |

## Prediction Accuracy

The policy driver wrote predictions before every `step(...)` call and scored them after stepping. This is a mechanical pilot score, not a standalone agency proof.

| Predictor | Hits | Partials | Misses | Accuracy rule |
|---|---:|---:|---:|---|
| Policy-aware shepherd | 68 | 15 | 5 | Strict hit rate 68/88 = 77.3%; hit-or-partial rate 83/88 = 94.3%. |
| Persistence baseline | 65 | 0 | 23 | Persistence hit rate 65/88 = 73.9%. |
| Fixed policy placebo driver | 68 | 15 | 5 | Same scores as policy-aware because the same visible action occurred on the same states. |

Prediction accuracy is not enough to claim agency because the policy-aware arm did not beat fixed policy or unattended outcomes.

## Policy-Decision Analysis

Predeclared policy menu: Worker surge `90/5/5`, Balanced/default `80/10/10`, Nurse recovery `70/5/25`, Soldier buffer `70/25/5`.

| Seed | Tick | Observed state | Chosen option | Why chosen | Mechanism reading |
|---:|---:|---|---|---|---|
| 3005 | 6000 | P pop 172 down, R pop 144, P food 0.5, P/R delivered 486/327, nearest P/R 181.11/11.66 | Worker surge | Rule 1: player nest food <= 3 and food access worse than rival. | Won and improved vs perturbation loss, but fixed policy made the same change with the same hash. |
| 3006 | 6000 | P pop 194 down, R pop 132, P food 1, P/R delivered 632/207, nearest P/R 170.18/146.67 | Worker surge | Rule 1: player nest food <= 3. | Collapsed where unattended and perturbation won; food delivered rose but starvation and final population worsened. |
| 3007 | 6000 | P pop 159 down, R pop 10, P food 137, P/R delivered 594/121, nearest P/R 195.06/74.24 | Worker surge | Rule 1: player nearest-food distance was more than 120 world units worse than rival. | Outcome and visible metrics matched the already-near-terminal win; fixed policy was identical. |
| 3008 | 6000 | P pop 193 down, R pop 99, P food 0.5, P/R delivered 700/185, nearest P/R 197.99/45.34 | Worker surge | Rule 1: player nest food <= 3 and food access worse than rival. | Collapsed where unattended and perturbation won; more delivered food coincided with more starvation and zero final player pop. |
| 3009 | 6000 | P pop 204 down, R pop 116, P food 2, P/R delivered 717/198, nearest P/R 203.1/102.96 | Worker surge | Rule 1: player nest food <= 3. | Won, but with lower final pop and more starvation than unattended/perturbation; fixed policy was identical. |

Important diagnostic result: the state-aware decision rule selected Worker surge for all five seeds. Because the predeclared fixed policy placebo was also Worker surge at the same tick, the policy-aware and fixed-policy arms were equivalent in this pilot. The final hashes match seed-for-seed.

## Replay Verification

| Seed | Intervention tick | Visible policy values | First final tick/hash | Replay final tick/hash | Match |
|---:|---:|---|---|---|---|
| 3005 | 6000 | 90/5/5 | 15312 / 4a02f9240bee6620 | 15312 / 4a02f9240bee6620 | yes |

Replay proves the visible policy action can be reproduced deterministically for this seed. It does not prove state-contingent policy agency because the policy-aware action was identical to fixed policy.

## Evidence Artifacts

| Artifact | What it proves | Limitation |
|---|---|---|
| `evidence/browser-gate/playwright-smoke-output.txt` | Browser bridge gate passed at tick 5000 with hash `632028e9736dd465`. | Smoke gate only. |
| `evidence/raw/unattended-3005-3009.jsonl` and `evidence/raw/single-runs/` | Unattended comparison arm for all seeds. | Headless, not browser UI. |
| `evidence/raw/perturbation-placebo-3005-3009.jsonl` and `evidence/raw/single-runs/` | Perturbation placebo/null comparison arm for all seeds. | Headless, not browser UI. |
| `evidence/policy-placebo/` | Fixed Worker surge was applied through visible sliders at tick 6000 on every seed. | Non-state-contingent by design. |
| `evidence/policy-aware/` | State was observed, a menu option was chosen, and visible sliders were changed at tick 6000 on every seed. | All choices matched fixed Worker surge, so no state-contingent contrast emerged. |
| `evidence/replay/replay-verification.md` | Seed 3005 visible policy replay matched the original final hash. | Replays only one seed. |
| `evidence/analysis-summary.json` | Machine-readable paired tables, mechanism deltas, prediction scores, and replay result. | Derived from the raw artifacts above. |

## Verdict

Goal 04B completed the diagnostic but did not prove state-contingent policy agency.

Safe claims:

- Visible browser caste-policy controls can be operated by automation through the UI, with before/after screenshots.
- A visible policy replay can be deterministic; seed 3005 replay matched final hash `4a02f9240bee6620`.
- On seeds `3005-3009`, Worker surge at tick 6000 was harmful relative to unattended play: policy-aware/fixed policy fell to `3/5` wins while unattended was `5/5`.
- The policy-aware decision rule collapsed to the same Worker surge action as the fixed-policy placebo for all five seeds.

Unsafe claims:

- State-contingent policy agency is not proven.
- Policy-aware shepherding did not beat unattended play, perturbation placebo/null, or fixed policy placebo.
- Prediction accuracy does not establish agency here.
- Default tuning must not change from this evidence.
- Held-out performance remains unknown because no held-out seeds were touched.
