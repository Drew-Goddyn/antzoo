# Browser Shepherd Transcript - seed 3002

- seed: 3002
- URL: http://127.0.0.1:5173/?seed=3002&paused=1
- protocol: docs/fleet/browser/MILESTONE-1.md
- mode: policy-aware shepherd
- caste-policy slot: unused in this pilot run
- held-out check: not in 4000-4049
- budget: food 5, lure 2, boulder 1, caste policy 1

## Starting State

| Tick | Hash | Player pop | Rival pop | Player nest food | Rival nest food | Nearest food player/rival | Notes |
|---:|---|---:|---:|---:|---:|---:|---|
| 0 | de991534f49aad04 | 150 | 150 | 30 | 30 | 195.06/130.51 | browser bridge snapshot |

## Prediction And Action Ledger

| Before tick | Step | Observation | Shepherd prediction | Persistence prediction | Planned action | Screenshot | After tick | Result | Shepherd score | Persistence score | Budget left |
|---:|---:|---|---|---|---|---|---:|---|---|---|---|
| 0 | 1200 | P pop 150, R pop 150, P food 30, nearest P/R 195.06/130.51, P/R delivered 0/0 | stable chunk: player remains non-terminal and population direction stays flat | population direction remains flat and terminal status remains running | none |  | 1200 | P pop 150->160, P food 30->10, P delivered 0->68, phase running->running | partial | miss | food 5, lure 2, boulder 1, policy 1 |
| 1200 | 1200 | P pop 160, R pop 158, P food 10, nearest P/R 195.06/135.56, P/R delivered 68/20 | food action should keep player non-terminal and produce a player food-delivery increase or nest-food recovery signal within 1200 ticks | population direction remains up and terminal status remains running | food at 1928,1152: player stress: nestFood=10, nearestFood=195.06, pop=160, rivalPop=158 | docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd/seed-3002/tick-1200-food.png | 2400 | P pop 160->172, P food 10->22, P delivered 68->219, phase running->running | hit | hit | food 4, lure 2, boulder 1, policy 1 |
| 2400 | 1200 | P pop 172, R pop 157, P food 22, nearest P/R 100.08/149.37, P/R delivered 219/64 | stable chunk: player remains non-terminal and population direction stays up | population direction remains up and terminal status remains running | none |  | 3600 | P pop 172->186, P food 22->53.5, P delivered 219->431, phase running->running | hit | hit | food 4, lure 2, boulder 1, policy 1 |
| 3600 | 1200 | P pop 186, R pop 161, P food 53.5, nearest P/R 140.06/149.26, P/R delivered 431/120 | stable chunk: player remains non-terminal and population direction stays up | population direction remains up and terminal status remains running | none |  | 4800 | P pop 186->199, P food 53.5->27, P delivered 431->541, phase running->running | hit | hit | food 4, lure 2, boulder 1, policy 1 |
| 4800 | 1200 | P pop 199, R pop 161, P food 27, nearest P/R 202.15/164.56, P/R delivered 541/166 | stable chunk: player remains non-terminal and population direction stays up | population direction remains up and terminal status remains running | none |  | 6000 | P pop 199->188, P food 27->0.5, P delivered 541->644, phase running->running | partial | miss | food 4, lure 2, boulder 1, policy 1 |
| 6000 | 1200 | P pop 188, R pop 122, P food 0.5, nearest P/R 223.79/97.53, P/R delivered 644/201 | food action should keep player non-terminal and produce a player food-delivery increase or nest-food recovery signal within 1200 ticks | population direction remains down and terminal status remains running | food at 2168,1152: player stress: nestFood=0.5, nearestFood=223.79, pop=188, rivalPop=122 | docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd/seed-3002/tick-6000-food.png | 7200 | P pop 188->197, P food 0.5->0.5, P delivered 644->781, phase running->running | hit | miss | food 3, lure 2, boulder 1, policy 1 |
| 7200 | 1200 | P pop 197, R pop 121, P food 0.5, nearest P/R 140.06/97.53, P/R delivered 781/214 | food action should keep player non-terminal and produce a player food-delivery increase or nest-food recovery signal within 1200 ticks | population direction remains up and terminal status remains running | food at 2048,1032: player stress: nestFood=0.5, nearestFood=140.06, pop=197, rivalPop=121 | docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd/seed-3002/tick-7200-food.png | 8400 | P pop 197->199, P food 0.5->1.5, P delivered 781->895, phase running->running | hit | hit | food 2, lure 2, boulder 1, policy 1 |
| 8400 | 1200 | P pop 199, R pop 108, P food 1.5, nearest P/R 125.6/82.02, P/R delivered 895/221 | food action should keep player non-terminal and produce a player food-delivery increase or nest-food recovery signal within 1200 ticks | population direction remains up and terminal status remains running | food at 2048,1272: player stress: nestFood=1.5, nearestFood=125.6, pop=199, rivalPop=108 | docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd/seed-3002/tick-8400-food.png | 9600 | P pop 199->197, P food 1.5->2, P delivered 895->1014, phase running->running | hit | miss | food 1, lure 2, boulder 1, policy 1 |
| 9600 | 1200 | P pop 197, R pop 90, P food 2, nearest P/R 117.71/82.02, P/R delivered 1014/228 | food action should keep player non-terminal and produce a player food-delivery increase or nest-food recovery signal within 1200 ticks | population direction remains down and terminal status remains running | food at 1868,1092: player stress: nestFood=2, nearestFood=117.71, pop=197, rivalPop=90 | docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd/seed-3002/tick-9600-food.png | 10800 | P pop 197->191, P food 2->0.5, P delivered 1014->1127, phase running->running | hit | hit | food 0, lure 2, boulder 1, policy 1 |
| 10800 | 1200 | P pop 191, R pop 73, P food 0.5, nearest P/R 174.63/82.22, P/R delivered 1127/241 | without spending budget this chunk, player stress should persist: player remains non-terminal but population direction stays down | population direction remains down and terminal status remains running | none |  | 12000 | P pop 191->188, P food 0.5->0.5, P delivered 1127->1226, phase running->running | hit | hit | food 0, lure 2, boulder 1, policy 1 |
| 12000 | 1200 | P pop 188, R pop 41, P food 0.5, nearest P/R 200.88/74.03, P/R delivered 1226/256 | lure action should keep player non-terminal and produce a player food-delivery increase or nest-food recovery signal within 1200 ticks | population direction remains down and terminal status remains running | lure at 2048,1032: player pathing disadvantage: playerDelivered=1226, rivalDelivered=256, nearestFood=200.88/74.03 | docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd/seed-3002/tick-12000-lure.png | 13188 | P pop 188->185, P food 0.5->0, P delivered 1226->1275, phase running->ended | miss | miss | food 0, lure 1, boulder 1, policy 1 |

## Interventions

| Tick | Type | Coordinates or values | State rationale | Expected effect | Screenshot | Hash before | Hash after |
|---:|---|---|---|---|---|---|---|
| 1200 | food | 1928,1152 | player stress: nestFood=10, nearestFood=195.06, pop=160, rivalPop=158 | increase or preserve player delivery/nest-food recovery before the next observation | docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd/seed-3002/tick-1200-food.png | 46e5666ec2f2e082 | 895007bf7d9a448f |
| 6000 | food | 2168,1152 | player stress: nestFood=0.5, nearestFood=223.79, pop=188, rivalPop=122 | increase or preserve player delivery/nest-food recovery before the next observation | docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd/seed-3002/tick-6000-food.png | 282aa6855443b5fd | 66d4855eec4fd66e |
| 7200 | food | 2048,1032 | player stress: nestFood=0.5, nearestFood=140.06, pop=197, rivalPop=121 | increase or preserve player delivery/nest-food recovery before the next observation | docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd/seed-3002/tick-7200-food.png | 66d4855eec4fd66e | c609ce9ed71fd44e |
| 8400 | food | 2048,1272 | player stress: nestFood=1.5, nearestFood=125.6, pop=199, rivalPop=108 | increase or preserve player delivery/nest-food recovery before the next observation | docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd/seed-3002/tick-8400-food.png | c609ce9ed71fd44e | d529238ed38c31ce |
| 9600 | food | 1868,1092 | player stress: nestFood=2, nearestFood=117.71, pop=197, rivalPop=90 | increase or preserve player delivery/nest-food recovery before the next observation | docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd/seed-3002/tick-9600-food.png | d529238ed38c31ce | b6eb4e97f0cba103 |
| 12000 | lure | 2048,1032 | player pathing disadvantage: playerDelivered=1226, rivalDelivered=256, nearestFood=200.88/74.03 | improve player forager routing enough that delivered food rises before terminal collapse | docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd/seed-3002/tick-12000-lure.png | 652db5159fb3c729 | 5fa601cbb7befa33 |

## Terminal Summary

| Outcome | Final tick | Final hash | Player final pop | Rival final pop | Food delivered P/R | Starvation deaths P/R | Notes |
|---|---:|---|---:|---:|---:|---:|---|
| victory | 13188 | 5fa601cbb7befa33 | 185 | 0 | 1275/265 | 79/105 | replay not checked |
