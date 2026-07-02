# Placebo Perturbation Calibration

- Seeds: 3000-3019
- Config: default tuning
- Scenario: `scenarios/placebo-perturbation.json`
- Command pattern: `npm run sim -- --seed <seed> --ticks 50000 --scenario scenarios/placebo-perturbation.json --out docs/plan-goals/03-wave3-agency-delta/evidence/placebo/raw/<seed>.jsonl`
- Scenario shape: same rescue action types and ticks: food at 6000, lure at 9000, food at 12000; coordinates moved to bottom-left off-nest area.

## Rollup

| Arm | n | Player wins | Player collapses | Running | Win rate | Median finalTick | Median player final pop | Median rival final pop | Median player deliveries | Median rival deliveries |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| unattended | 20 | 14 | 6 | 0 | 70.0% | 20990.5 | 44 | 0 | 943 | 490.5 |
| placebo | 20 | 14 | 6 | 0 | 70.0% | 21558.5 | 32.5 | 0 | 985.5 | 558 |
| rescue | 20 | 15 | 5 | 0 | 75.0% | 22175 | 32.5 | 0 | 1102 | 453.5 |

## Placebo vs Unattended Flip Table

| Seed | unattended | placebo | Flip | dFood P/R | dPeak P/R | dStarve P/R | dFinalPop P/R | dFinalTick |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 3000 | victory | victory | unchanged win | 9/-1 | 0/0 | 0/-1 | 2/0 | 146 |
| 3001 | gameOver | victory | loss->win | -101/47 | 0/0 | 0/-15 | 18/-6 | -6444 |
| 3002 | gameOver | victory | loss->win | -3/-146 | 0/0 | -50/-11 | 55/-1 | -4328 |
| 3003 | victory | victory | unchanged win | -5/-3 | 0/0 | 2/3 | -2/0 | -75 |
| 3004 | gameOver | victory | loss->win | 91/167 | 0/0 | 20/18 | 4/-7 | 4065 |
| 3005 | victory | gameOver | win->loss | 126/248 | 0/0 | 43/5 | -50/23 | 8624 |
| 3006 | victory | victory | unchanged win | -9/0 | 0/0 | 0/0 | -1/0 | 0 |
| 3007 | victory | victory | unchanged win | 0/0 | 0/0 | 0/0 | 0/0 | 0 |
| 3008 | victory | victory | unchanged win | -7/0 | 0/0 | 0/0 | 0/0 | 0 |
| 3009 | victory | victory | unchanged win | -3/0 | 0/0 | 0/0 | 0/0 | 0 |
| 3010 | victory | victory | unchanged win | 0/0 | 0/0 | 0/0 | 0/0 | 0 |
| 3011 | victory | gameOver | win->loss | 79/93 | 0/0 | 41/26 | -42/5 | 12974 |
| 3012 | victory | victory | unchanged win | 1/-9 | 0/0 | -2/2 | 5/0 | -102 |
| 3013 | victory | victory | unchanged win | -6/-38 | 0/0 | -3/4 | 3/0 | -71 |
| 3014 | gameOver | gameOver | unchanged loss | 39/-21 | 0/0 | -9/-24 | 0/22 | 8084 |
| 3015 | victory | gameOver | win->loss | 22/2 | 0/0 | 34/10 | -30/11 | 1840 |
| 3016 | gameOver | gameOver | unchanged loss | -51/-126 | 0/0 | 6/11 | 0/-13 | -3520 |
| 3017 | victory | victory | unchanged win | 0/0 | 0/0 | 0/0 | 0/0 | 0 |
| 3018 | gameOver | gameOver | unchanged loss | 0/0 | 0/0 | 0/0 | 0/0 | 0 |
| 3019 | victory | victory | unchanged win | 2/1 | 0/0 | 7/9 | -21/0 | 1851 |

Flip count: loss->win 3, win->loss 3, unchanged wins 11, unchanged losses 3.

Median paired deltas, placebo minus unattended: playerFoodDelivered 0, rivalFoodDelivered 0, playerPeakPop 0, rivalPeakPop 0, playerStarvationDeaths 0, rivalStarvationDeaths 0, playerFinalPop 0, rivalFinalPop 0, finalTick 0.

## Placebo vs Rescue Comparison

Rescue vs unattended flip count: loss->win 5, win->loss 4, unchanged wins 10, unchanged losses 1.

Placebo vs unattended flip count: loss->win 3, win->loss 3, unchanged wins 11, unchanged losses 3.

Rescue vs placebo flip count, with placebo as baseline: loss->win 5, win->loss 4, unchanged wins 10, unchanged losses 1.

Median paired deltas, rescue minus placebo: playerFoodDelivered 131.5, rivalFoodDelivered -49, playerPeakPop 0, rivalPeakPop 0, playerStarvationDeaths 1, rivalStarvationDeaths 1.5, playerFinalPop 5, rivalFinalPop 0, finalTick -121.5.

## Per-Seed Results

| Seed | Outcome | Final tick | Final hash | Player final pop | Rival final pop | Player food delivered | Rival food delivered |
|---:|---|---:|---|---:|---:|---:|---:|
| 3000 | victory | 21750 | cefbc0417d26cf8d | 75 | 0 | 1421 | 474 |
| 3001 | victory | 21136 | da52f2944454762c | 18 | 0 | 1034 | 579 |
| 3002 | victory | 21367 | 85bde2280b15b514 | 55 | 0 | 1103 | 537 |
| 3003 | victory | 16543 | 62d87b2f4f90e53f | 58 | 0 | 773 | 371 |
| 3004 | victory | 27083 | 40ed54afaad7ce23 | 4 | 0 | 1011 | 642 |
| 3005 | gameOver | 26425 | 75db395f0084b4fb | 0 | 23 | 931 | 667 |
| 3006 | victory | 13910 | 58db7ccac9edc7b2 | 115 | 0 | 1020 | 283 |
| 3007 | victory | 6105 | cbefcb3c536c21e4 | 160 | 0 | 598 | 121 |
| 3008 | victory | 13347 | 1b6911e4ee040f10 | 87 | 0 | 958 | 274 |
| 3009 | victory | 14432 | ca4a0b9d61c308f9 | 124 | 0 | 1212 | 334 |
| 3010 | victory | 25125 | 2ace5c4dee388b41 | 8 | 0 | 1064 | 688 |
| 3011 | gameOver | 34356 | eb16efa2290ae032 | 0 | 5 | 936 | 661 |
| 3012 | victory | 19736 | bb7c820ea3e58e46 | 51 | 0 | 1463 | 474 |
| 3013 | victory | 15111 | 7a9de13b759e5837 | 81 | 0 | 681 | 460 |
| 3014 | gameOver | 32161 | 21b8d451e917c0c1 | 0 | 32 | 960 | 725 |
| 3015 | gameOver | 27240 | dbe640f23b73734a | 0 | 11 | 1268 | 708 |
| 3016 | gameOver | 26207 | 90efbf851912e455 | 0 | 9 | 1739 | 649 |
| 3017 | victory | 19659 | 615a6eff4fd0cd5f | 47 | 0 | 824 | 584 |
| 3018 | gameOver | 24010 | 9064b31018a27fa8 | 0 | 5 | 885 | 620 |
| 3019 | victory | 22450 | ea7c916ee029f5f6 | 2 | 0 | 738 | 457 |

## Reading

The placebo result leaves the rescue effect ambiguous. Placebo produced 14/20 wins, rescue produced 15/20 wins, and unattended produced 14/20 wins on the same seeds. Placebo created a smaller but still real paired-flip pattern (loss->win 3, win->loss 3, unchanged wins 11, unchanged losses 3) without player-near assistance. Rescue delivered more median player food than placebo, but the paired outcome movement is still close enough to require placebo-calibrated analysis before claiming agency.
