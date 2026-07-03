# Browser Policy Transcript - seed 3007

- seed: 3007
- URL: http://127.0.0.1:5173/?seed=3007&paused=1
- protocol: docs/plan-goals/04b-policy-shepherd/PLAN.md
- mode: fixed-policy-placebo
- held-out check: not in 4000-4049 or 4050-4099
- budget: caste policy 1; food/lure/boulder 0 in this diagnostic
- policy tick: 6000

## Starting State

| Tick | Hash | Player pop | Rival pop | Player nest food | Rival nest food | Nearest food player/rival | Notes |
|---:|---|---:|---:|---:|---:|---:|---|
| 0 | 7db8479e70077cb2 | 150 | 150 | 30 | 30 | 176.82/42.8 | browser bridge snapshot |

## Prediction And Action Ledger

| Before tick | Step | Observation | Shepherd prediction | Persistence prediction | Planned action | Screenshot | After tick | Result | Shepherd score | Persistence score |
|---:|---:|---|---|---|---|---|---:|---|---|---|
| 0 | 1200 | P pop 150 (flat), R pop 150, P food 30, P/R delivered 0/0, nearest P/R 176.82/42.8, P starvation 0, R starvation 0 | before the policy decision, player remains non-terminal and population direction remains flat over the next 1200 ticks | population direction remains flat and terminal phase remains running | none |  | 1200 | P pop 150->157, P food 30->37, P delivered 0->84, phase running->running | partial | miss |
| 1200 | 1200 | P pop 157 (up), R pop 164, P food 37, P/R delivered 84/87, nearest P/R 192.08/113.88, P starvation 0, R starvation 0 | before the policy decision, player remains non-terminal and population direction remains up over the next 1200 ticks | population direction remains up and terminal phase remains running | none |  | 2400 | P pop 157->164, P food 37->84, P delivered 84->255, phase running->running | hit | hit |
| 2400 | 1200 | P pop 164 (up), R pop 166, P food 84, P/R delivered 255/102, nearest P/R 188.04/1106.15, P starvation 0, R starvation 0 | before the policy decision, player remains non-terminal and population direction remains up over the next 1200 ticks | population direction remains up and terminal phase remains running | none |  | 3600 | P pop 164->170, P food 84->136.5, P delivered 255->437, phase running->running | hit | hit |
| 3600 | 1200 | P pop 170 (up), R pop 166, P food 136.5, P/R delivered 437/109, nearest P/R 192.08/74.24, P starvation 0, R starvation 0 | before the policy decision, player remains non-terminal and population direction remains up over the next 1200 ticks | population direction remains up and terminal phase remains running | none |  | 4800 | P pop 170->177, P food 136.5->145, P delivered 437->527, phase running->running | hit | hit |
| 4800 | 1200 | P pop 177 (up), R pop 166, P food 145, P/R delivered 527/120, nearest P/R 183.22/74.24, P starvation 0, R starvation 0 | before the policy decision, player remains non-terminal and population direction remains up over the next 1200 ticks | population direction remains up and terminal phase remains running | none |  | 6000 | P pop 177->159, P food 145->137, P delivered 527->594, phase running->running | partial | miss |
| 6000 | 1200 | P pop 159 (down), R pop 10, P food 137, P/R delivered 594/121, nearest P/R 195.06/74.24, P starvation 25, R starvation 64 | Worker surge at tick 6000 should keep player non-terminal and show a player food-delivery increase in the next 1200 ticks; final interpretation will compare paired food, starvation, population, and outcome. | without state-aware policy understanding, player population direction remains down and terminal phase remains running | Worker surge 90/5/5: Fixed placebo: predeclared non-state-contingent action; same Worker surge values at tick 6000 for every seed, chosen before per-seed state inspection | docs/plan-goals/04b-policy-shepherd/evidence/policy-placebo/seed-3007/tick-6000-policy-before.png; docs/plan-goals/04b-policy-shepherd/evidence/policy-placebo/seed-3007/tick-6000-policy-after.png | 6105 | P pop 159->160, P food 137->135, P delivered 594->598, phase running->ended | miss | miss |

## Policy Intervention

| Tick | Before values | After values | Option | State rationale | Expected effect | Screenshot before | Screenshot after | Hash before | Hash after next step |
|---:|---|---|---|---|---|---|---|---|---|
| 6000 | 80/10/10 | 90/5/5 | Worker surge | same Worker surge values at tick 6000 for every seed, chosen before per-seed state inspection | increase player food-economy resilience by biasing future caste policy toward workers | docs/plan-goals/04b-policy-shepherd/evidence/policy-placebo/seed-3007/tick-6000-policy-before.png | docs/plan-goals/04b-policy-shepherd/evidence/policy-placebo/seed-3007/tick-6000-policy-after.png | 5261c813c76eb62f | 6fd56b35b87bc5fd |

## Terminal Summary

| Outcome | Final tick | Final hash | Player final pop | Rival final pop | Food delivered P/R | Starvation deaths P/R | Replay |
|---|---:|---|---:|---:|---:|---:|---|
| victory | 6105 | 6fd56b35b87bc5fd | 160 | 0 | 598/121 | 25/64 | not replayed |
