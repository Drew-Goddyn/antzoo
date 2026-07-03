# Browser Shepherd Pilot - 2026-07-02

## Protocol

- milestone: `docs/fleet/browser/MILESTONE-1.md`
- seeds: `3000-3004`
- arms: unattended, placebo/null, shepherded
- held-out seeds used: none
- browser gate artifact: `docs/plan-goals/04-browser-shepherd/evidence/browser-gate/playwright-smoke-output.txt`
- browser shepherd driver: `docs/plan-goals/04-browser-shepherd/evidence/pilot/run-browser-shepherd-pilot.cjs`
- browser shepherd summary: `docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd/browser-shepherd-summary.json`
- caste policy: authorized by the milestone but unused in this pilot, so this pilot tests only the weaker food/lure tool surface.

The shepherded arm used `window.__antzoo.getSnapshot`, `getEvents`, `getHash`, `step` in chunks of no more than 1200 ticks, `applyTool` for food/lure only, screenshots, and transcript files. It did not use held-out seeds `4000-4049`.

## Per-Seed Outcome Table

| Seed | Arm | Outcome | Final tick | Final hash | Player final pop | Rival final pop | Player food delivered | Rival food delivered | Player starvation deaths | Rival starvation deaths |
|---:|---|---|---:|---|---:|---:|---:|---:|---:|---:|
| 3000 | unattended | victory | 21604 | d23ef9c4671c8168 | 73 | 0 | 1412 | 475 | 191 | 167 |
| 3000 | placebo | victory | 21750 | cefbc0417d26cf8d | 75 | 0 | 1421 | 474 | 191 | 166 |
| 3000 | shepherd | victory | 13215 | 101fdfb349427467 | 161 | 0 | 1195 | 264 | 105 | 104 |
| 3001 | unattended | gameOver | 27580 | db3f81b6408bb3ae | 0 | 6 | 1135 | 532 | 208 | 159 |
| 3001 | placebo | victory | 21136 | da52f2944454762c | 18 | 0 | 1034 | 579 | 208 | 144 |
| 3001 | shepherd | victory | 24023 | dd94e786e64e024e | 14 | 0 | 1432 | 712 | 251 | 134 |
| 3002 | unattended | gameOver | 25695 | bad5bf5b50ced40f | 0 | 1 | 1106 | 683 | 240 | 151 |
| 3002 | placebo | victory | 21367 | 85bde2280b15b514 | 55 | 0 | 1103 | 537 | 190 | 140 |
| 3002 | shepherd | victory | 13188 | 5fa601cbb7befa33 | 185 | 0 | 1275 | 265 | 79 | 105 |
| 3003 | unattended | victory | 16618 | ce9275c58075cba1 | 60 | 0 | 778 | 374 | 156 | 119 |
| 3003 | placebo | victory | 16543 | 62d87b2f4f90e53f | 58 | 0 | 773 | 371 | 158 | 122 |
| 3003 | shepherd | victory | 22213 | 67f0060d5ccd4aed | 12 | 0 | 1260 | 519 | 207 | 147 |
| 3004 | unattended | gameOver | 23018 | 30241325d35d908d | 0 | 7 | 920 | 475 | 187 | 123 |
| 3004 | placebo | victory | 27083 | 40ed54afaad7ce23 | 4 | 0 | 1011 | 642 | 207 | 141 |
| 3004 | shepherd | gameOver | 24847 | 3c3f41841086abbc | 0 | 51 | 1281 | 793 | 204 | 130 |

## Paired Flip Table

| Seed | Unattended | Placebo/null | Shepherded | Shepherd vs unattended | Shepherd vs placebo/null |
|---:|---|---|---|---|---|
| 3000 | victory | victory | victory | unchanged win | unchanged win |
| 3001 | gameOver | victory | victory | loss->win | unchanged win |
| 3002 | gameOver | victory | victory | loss->win | unchanged win |
| 3003 | victory | victory | victory | unchanged win | unchanged win |
| 3004 | gameOver | victory | gameOver | unchanged loss | win->loss |

Flip count vs unattended: loss->win 2, win->loss 0, unchanged wins 2, unchanged losses 1.

Flip count vs placebo/null: loss->win 0, win->loss 1, unchanged wins 4, unchanged losses 0.

## Mechanism Deltas

Median paired deltas are computed as second arm minus first arm.

| Comparison | dFood P/R | dFinalPop P/R | dStarvationDeaths P/R | dFinalTick | Reading |
|---|---:|---:|---:|---:|---|
| Shepherd - unattended | +297 / +145 | +14 / 0 | +17 / -25 | -3557 | Shepherd improved paired outcomes over unattended on two collapse seeds, but the mechanism is mixed and includes higher median player starvation deaths. |
| Shepherd - placebo/null | +270 / +133 | -4 / 0 | -3 / -11 | -2236 | Shepherd did not beat placebo/null on paired outcomes; placebo won all five seeds while shepherd lost seed 3004. |

## Prediction Accuracy

| Predictor | Hits | Partials | Misses | Accuracy rule |
|---|---:|---:|---:|---|
| Shepherd | 66 | 13 | 5 | Strict hit rate 66/84 = 78.6%; hit-or-partial rate 79/84 = 94.0%. |
| Persistence baseline | 56 | 0 | 28 | Persistence hit rate 56/84 = 66.7%. |

The shepherd predictor beat the persistence baseline on this mechanical scoring rule, but the accuracy result is not enough to claim agency because paired outcome performance did not beat placebo/null.

## Replay Verification

| Seed | Intervention ticks | First final hash | Replay final hash | Match |
|---:|---|---|---|---|
| 3000 | `0:lure@2048,1032`; `9600:food@1928,1152`; `10800:food@2168,1152`; `12000:food@2048,1032`; `13200:food@2048,1272` | 101fdfb349427467 | 101fdfb349427467 | yes |

## Verdict

Safe claim: Antzoo can be played through the browser bridge under a constrained, prediction-first protocol, with screenshots, transcripts, paired arms, and replayable final-hash evidence.

Unsafe claim: this pilot does not establish state-contingent agency beyond perturbation luck. The placebo/null arm went 5/5 while the shepherded arm went 4/5 and lost one seed that placebo won. The caste-policy slot was unused, so policy-level agency remains untested by this pilot.
