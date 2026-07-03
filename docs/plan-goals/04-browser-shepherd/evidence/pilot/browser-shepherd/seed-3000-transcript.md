# Browser Shepherd Transcript - seed 3000

- seed: 3000
- URL: http://127.0.0.1:5173/?seed=3000&paused=1
- protocol: docs/fleet/browser/MILESTONE-1.md
- mode: policy-aware shepherd
- caste-policy slot: unused in this pilot run
- held-out check: not in 4000-4049
- budget: food 5, lure 2, boulder 1, caste policy 1

## Starting State

| Tick | Hash | Player pop | Rival pop | Player nest food | Rival nest food | Nearest food player/rival | Notes |
|---:|---|---:|---:|---:|---:|---:|---|
| 0 | 6a707182776b858a | 150 | 150 | 30 | 30 | 164.05/2.83 | browser bridge snapshot |

## Prediction And Action Ledger

| Before tick | Step | Observation | Shepherd prediction | Persistence prediction | Planned action | Screenshot | After tick | Result | Shepherd score | Persistence score | Budget left |
|---:|---:|---|---|---|---|---|---:|---|---|---|---|
| 0 | 1200 | P pop 150, R pop 150, P food 30, nearest P/R 164.05/2.83, P/R delivered 0/0 | lure action should keep player non-terminal and produce a player food-delivery increase or nest-food recovery signal within 1200 ticks | population direction remains flat and terminal status remains running | lure at 2048,1032: player pathing disadvantage: playerDelivered=0, rivalDelivered=0, nearestFood=164.05/2.83 | docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd/seed-3000/tick-0-lure.png | 1200 | P pop 150->158, P food 30->32, P delivered 0->92, phase running->running | hit | miss | food 5, lure 1, boulder 1, policy 1 |
| 1200 | 1200 | P pop 158, R pop 166, P food 32, nearest P/R 172.05/1084.98, P/R delivered 92/101 | stable chunk: player remains non-terminal and population direction stays up | population direction remains up and terminal status remains running | none |  | 2400 | P pop 158->167, P food 32->32, P delivered 92->191, phase running->running | hit | hit | food 5, lure 1, boulder 1, policy 1 |
| 2400 | 1200 | P pop 167, R pop 165, P food 32, nearest P/R 173.16/1084.98, P/R delivered 191/101 | stable chunk: player remains non-terminal and population direction stays up | population direction remains up and terminal status remains running | none |  | 3600 | P pop 167->177, P food 32->59.5, P delivered 191->349, phase running->running | hit | hit | food 5, lure 1, boulder 1, policy 1 |
| 3600 | 1200 | P pop 177, R pop 165, P food 59.5, nearest P/R 180.04/138.36, P/R delivered 349/111 | stable chunk: player remains non-terminal and population direction stays up | population direction remains up and terminal status remains running | none |  | 4800 | P pop 177->188, P food 59.5->66, P delivered 349->475, phase running->running | hit | hit | food 5, lure 1, boulder 1, policy 1 |
| 4800 | 1200 | P pop 188, R pop 165, P food 66, nearest P/R 165.22/154.32, P/R delivered 475/155 | stable chunk: player remains non-terminal and population direction stays up | population direction remains up and terminal status remains running | none |  | 6000 | P pop 188->159, P food 66->75, P delivered 475->622, phase running->running | partial | miss | food 5, lure 1, boulder 1, policy 1 |
| 6000 | 1200 | P pop 159, R pop 102, P food 75, nearest P/R 172.05/70.26, P/R delivered 622/197 | stable chunk: player remains non-terminal and population direction stays down | population direction remains down and terminal status remains running | none |  | 7200 | P pop 159->163, P food 75->67, P delivered 622->742, phase running->running | partial | miss | food 5, lure 1, boulder 1, policy 1 |
| 7200 | 1200 | P pop 163, R pop 102, P food 67, nearest P/R 180.04/70.26, P/R delivered 742/230 | stable chunk: player remains non-terminal and population direction stays up | population direction remains up and terminal status remains running | none |  | 8400 | P pop 163->172, P food 67->44, P delivered 742->827, phase running->running | hit | hit | food 5, lure 1, boulder 1, policy 1 |
| 8400 | 1200 | P pop 172, R pop 102, P food 44, nearest P/R 180.04/70.26, P/R delivered 827/247 | stable chunk: player remains non-terminal and population direction stays up | population direction remains up and terminal status remains running | none |  | 9600 | P pop 172->182, P food 44->9.5, P delivered 827->900, phase running->running | hit | hit | food 5, lure 1, boulder 1, policy 1 |
| 9600 | 1200 | P pop 182, R pop 98, P food 9.5, nearest P/R 180.04/70.26, P/R delivered 900/255 | food action should keep player non-terminal and produce a player food-delivery increase or nest-food recovery signal within 1200 ticks | population direction remains up and terminal status remains running | food at 1928,1152: player stress: nestFood=9.5, nearestFood=180.04, pop=182, rivalPop=98 | docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd/seed-3000/tick-9600-food.png | 10800 | P pop 182->178, P food 9.5->0.5, P delivered 900->979, phase running->running | hit | miss | food 4, lure 1, boulder 1, policy 1 |
| 10800 | 1200 | P pop 178, R pop 80, P food 0.5, nearest P/R 100.08/70.26, P/R delivered 979/260 | food action should keep player non-terminal and produce a player food-delivery increase or nest-food recovery signal within 1200 ticks | population direction remains down and terminal status remains running | food at 2168,1152: player stress: nestFood=0.5, nearestFood=100.08, pop=178, rivalPop=80 | docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd/seed-3000/tick-10800-food.png | 12000 | P pop 178->165, P food 0.5->4.5, P delivered 979->1080, phase running->running | hit | hit | food 3, lure 1, boulder 1, policy 1 |
| 12000 | 1200 | P pop 165, R pop 59, P food 4.5, nearest P/R 108.66/70.26, P/R delivered 1080/263 | food action should keep player non-terminal and produce a player food-delivery increase or nest-food recovery signal within 1200 ticks | population direction remains down and terminal status remains running | food at 2048,1032: player stress: nestFood=4.5, nearestFood=108.66, pop=165, rivalPop=59 | docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd/seed-3000/tick-12000-food.png | 13200 | P pop 165->161, P food 4.5->1, P delivered 1080->1195, phase running->running | hit | hit | food 2, lure 1, boulder 1, policy 1 |
| 13200 | 1200 | P pop 161, R pop 1, P food 1, nearest P/R 100.08/70.26, P/R delivered 1195/264 | food action should keep player non-terminal and produce a player food-delivery increase or nest-food recovery signal within 1200 ticks | population direction remains down and terminal status remains running | food at 2048,1272: player stress: nestFood=1, nearestFood=100.08, pop=161, rivalPop=1 | docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd/seed-3000/tick-13200-food.png | 13215 | P pop 161->161, P food 1->1, P delivered 1195->1195, phase running->ended | miss | miss | food 1, lure 1, boulder 1, policy 1 |

## Interventions

| Tick | Type | Coordinates or values | State rationale | Expected effect | Screenshot | Hash before | Hash after |
|---:|---|---|---|---|---|---|---|
| 0 | lure | 2048,1032 | player pathing disadvantage: playerDelivered=0, rivalDelivered=0, nearestFood=164.05/2.83 | improve player forager routing enough that delivered food rises before terminal collapse | docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd/seed-3000/tick-0-lure.png | 6a707182776b858a | 1d58430d26529ae1 |
| 9600 | food | 1928,1152 | player stress: nestFood=9.5, nearestFood=180.04, pop=182, rivalPop=98 | increase or preserve player delivery/nest-food recovery before the next observation | docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd/seed-3000/tick-9600-food.png | 1f1c29cef6d78bde | f79bd36fd739b15b |
| 10800 | food | 2168,1152 | player stress: nestFood=0.5, nearestFood=100.08, pop=178, rivalPop=80 | increase or preserve player delivery/nest-food recovery before the next observation | docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd/seed-3000/tick-10800-food.png | f79bd36fd739b15b | d74217476c7ab9ab |
| 12000 | food | 2048,1032 | player stress: nestFood=4.5, nearestFood=108.66, pop=165, rivalPop=59 | increase or preserve player delivery/nest-food recovery before the next observation | docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd/seed-3000/tick-12000-food.png | d74217476c7ab9ab | be75c1edfc418921 |
| 13200 | food | 2048,1272 | player stress: nestFood=1, nearestFood=100.08, pop=161, rivalPop=1 | increase or preserve player delivery/nest-food recovery before the next observation | docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd/seed-3000/tick-13200-food.png | be75c1edfc418921 | 101fdfb349427467 |

## Terminal Summary

| Outcome | Final tick | Final hash | Player final pop | Rival final pop | Food delivered P/R | Starvation deaths P/R | Notes |
|---|---:|---|---:|---:|---:|---:|---|
| victory | 13215 | 101fdfb349427467 | 161 | 0 | 1195/264 | 105/104 | replay matched |
