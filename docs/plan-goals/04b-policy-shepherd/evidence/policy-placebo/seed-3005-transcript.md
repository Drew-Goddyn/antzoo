# Browser Policy Transcript - seed 3005

- seed: 3005
- URL: http://127.0.0.1:5173/?seed=3005&paused=1
- protocol: docs/plan-goals/04b-policy-shepherd/PLAN.md
- mode: fixed-policy-placebo
- held-out check: not in 4000-4049 or 4050-4099
- budget: caste policy 1; food/lure/boulder 0 in this diagnostic
- policy tick: 6000

## Starting State

| Tick | Hash | Player pop | Rival pop | Player nest food | Rival nest food | Nearest food player/rival | Notes |
|---:|---|---:|---:|---:|---:|---:|---|
| 0 | 87420bb20d563efe | 150 | 150 | 30 | 30 | 181.11/141.68 | browser bridge snapshot |

## Prediction And Action Ledger

| Before tick | Step | Observation | Shepherd prediction | Persistence prediction | Planned action | Screenshot | After tick | Result | Shepherd score | Persistence score |
|---:|---:|---|---|---|---|---|---:|---|---|---|
| 0 | 1200 | P pop 150 (flat), R pop 150, P food 30, P/R delivered 0/0, nearest P/R 181.11/141.68, P starvation 0, R starvation 0 | before the policy decision, player remains non-terminal and population direction remains flat over the next 1200 ticks | population direction remains flat and terminal phase remains running | none |  | 1200 | P pop 150->161, P food 30->5, P delivered 0->64, phase running->running | partial | miss |
| 1200 | 1200 | P pop 161 (up), R pop 159, P food 5, P/R delivered 64/37, nearest P/R 198.31/152.97, P starvation 0, R starvation 0 | before the policy decision, player remains non-terminal and population direction remains up over the next 1200 ticks | population direction remains up and terminal phase remains running | none |  | 2400 | P pop 161->172, P food 5->1, P delivered 64->178, phase running->running | hit | hit |
| 2400 | 1200 | P pop 172 (up), R pop 159, P food 1, P/R delivered 178/86, nearest P/R 215.03/160.82, P starvation 0, R starvation 0 | before the policy decision, player remains non-terminal and population direction remains up over the next 1200 ticks | population direction remains up and terminal phase remains running | none |  | 3600 | P pop 172->185, P food 1->0, P delivered 178->326, phase running->running | hit | hit |
| 3600 | 1200 | P pop 185 (up), R pop 163, P food 0, P/R delivered 326/134, nearest P/R 238.19/150.33, P starvation 0, R starvation 0 | before the policy decision, player remains non-terminal and population direction remains up over the next 1200 ticks | population direction remains up and terminal phase remains running | none |  | 4800 | P pop 185->196, P food 0->0.5, P delivered 326->438, phase running->running | hit | hit |
| 4800 | 1200 | P pop 196 (up), R pop 164, P food 0.5, P/R delivered 438/196, nearest P/R 181.11/167.26, P starvation 0, R starvation 0 | before the policy decision, player remains non-terminal and population direction remains up over the next 1200 ticks | population direction remains up and terminal phase remains running | none |  | 6000 | P pop 196->172, P food 0.5->0.5, P delivered 438->486, phase running->running | partial | miss |
| 6000 | 1200 | P pop 172 (down), R pop 144, P food 0.5, P/R delivered 486/327, nearest P/R 181.11/11.66, P starvation 27, R starvation 30 | Worker surge at tick 6000 should keep player non-terminal and show a player food-delivery increase in the next 1200 ticks; final interpretation will compare paired food, starvation, population, and outcome. | without state-aware policy understanding, player population direction remains down and terminal phase remains running | Worker surge 90/5/5: Fixed placebo: predeclared non-state-contingent action; same Worker surge values at tick 6000 for every seed, chosen before per-seed state inspection | docs/plan-goals/04b-policy-shepherd/evidence/policy-placebo/seed-3005/tick-6000-policy-before.png; docs/plan-goals/04b-policy-shepherd/evidence/policy-placebo/seed-3005/tick-6000-policy-after.png | 7200 | P pop 172->172, P food 0.5->0, P delivered 486->539, phase running->running | hit | miss |
| 7200 | 1200 | P pop 172 (flat), R pop 143, P food 0, P/R delivered 539/351, nearest P/R 204.35/199.62, P starvation 32, R starvation 33 | before the policy decision, player remains non-terminal and population direction remains flat over the next 1200 ticks | population direction remains flat and terminal phase remains running | none |  | 8400 | P pop 172->166, P food 0->0, P delivered 539->593, phase running->running | partial | miss |
| 8400 | 1200 | P pop 166 (down), R pop 133, P food 0, P/R delivered 593/365, nearest P/R 193.08/11.66, P starvation 42, R starvation 43 | before the policy decision, player remains non-terminal and population direction remains down over the next 1200 ticks | population direction remains down and terminal phase remains running | none |  | 9600 | P pop 166->138, P food 0->0.5, P delivered 593->629, phase running->running | hit | hit |
| 9600 | 1200 | P pop 138 (down), R pop 127, P food 0.5, P/R delivered 629/422, nearest P/R 215.03/54.92, P starvation 72, R starvation 53 | before the policy decision, player remains non-terminal and population direction remains down over the next 1200 ticks | population direction remains down and terminal phase remains running | none |  | 10800 | P pop 138->115, P food 0.5->0, P delivered 629->671, phase running->running | hit | hit |
| 10800 | 1200 | P pop 115 (down), R pop 106, P food 0, P/R delivered 671/468, nearest P/R 209.61/199.62, P starvation 99, R starvation 76 | before the policy decision, player remains non-terminal and population direction remains down over the next 1200 ticks | population direction remains down and terminal phase remains running | none |  | 12000 | P pop 115->103, P food 0->0.5, P delivered 671->706, phase running->running | hit | hit |
| 12000 | 1200 | P pop 103 (down), R pop 87, P food 0.5, P/R delivered 706/469, nearest P/R 209.61/107.81, P starvation 112, R starvation 95 | before the policy decision, player remains non-terminal and population direction remains down over the next 1200 ticks | population direction remains down and terminal phase remains running | none |  | 13200 | P pop 103->92, P food 0.5->0, P delivered 706->737, phase running->running | hit | hit |
| 13200 | 1200 | P pop 92 (down), R pop 82, P food 0, P/R delivered 737/474, nearest P/R 245.6/107.81, P starvation 124, R starvation 100 | before the policy decision, player remains non-terminal and population direction remains down over the next 1200 ticks | population direction remains down and terminal phase remains running | none |  | 14400 | P pop 92->84, P food 0->0, P delivered 737->766, phase running->running | hit | hit |
| 14400 | 1200 | P pop 84 (down), R pop 42, P food 0, P/R delivered 766/482, nearest P/R 198.31/31.11, P starvation 134, R starvation 125 | before the policy decision, player remains non-terminal and population direction remains down over the next 1200 ticks | population direction remains down and terminal phase remains running | none |  | 15312 | P pop 84->73, P food 0->0, P delivered 766->777, phase running->ended | miss | miss |

## Policy Intervention

| Tick | Before values | After values | Option | State rationale | Expected effect | Screenshot before | Screenshot after | Hash before | Hash after next step |
|---:|---|---|---|---|---|---|---|---|---|
| 6000 | 80/10/10 | 90/5/5 | Worker surge | same Worker surge values at tick 6000 for every seed, chosen before per-seed state inspection | increase player food-economy resilience by biasing future caste policy toward workers | docs/plan-goals/04b-policy-shepherd/evidence/policy-placebo/seed-3005/tick-6000-policy-before.png | docs/plan-goals/04b-policy-shepherd/evidence/policy-placebo/seed-3005/tick-6000-policy-after.png | e6a198c098d7164c | 5806b48d0690a9b5 |

## Terminal Summary

| Outcome | Final tick | Final hash | Player final pop | Rival final pop | Food delivered P/R | Starvation deaths P/R | Replay |
|---|---:|---|---:|---:|---:|---:|---|
| victory | 15312 | 4a02f9240bee6620 | 73 | 0 | 777/488 | 145/131 | not replayed |
