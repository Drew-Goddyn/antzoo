# W1-Z1 terminal-state fix gates

This closes the W1-Z1 terminal-state fix record against post-fix code at
`a4235e10a0a05beb2009392b6d103bdf7de0cc24`, which contains fix commit
`a21a91b Fix W1-Z1 zero-population terminal state`.

## Fix record

The fix adds a zero-population terminal check for a faction that still has nest
food and is not already in the terminal cascade. That is the state W1-Z1 showed
for seed 1401: the player had no ants left, retained nest food, and never
entered `gameOver`.

Source patch:

```diff
+  if (terminalTimer <= 0 && nestFood(world, factionValue) > TUNING.sim.minTurnEpsilon && countFactionAnts(world, factionValue) <= 0) {
+    beginTerminalCascade(world, factionValue);
+    finishQueenCascade(world, factionValue);
+    return;
+  }
```

## Gate 1 - seed 1337 unchanged

Seed 1337 remains unchanged at the 50k tick baseline budget.

| Evidence | Outcome | Final hash |
|---|---|---|
| Pre-fix Wave 0 baseline, `docs/fleet/reports/wave0/W0-A.md` | player victory | `5101d7c52c007c01` |
| Post-fix baseline v2, `docs/plan-goals/01-baseline-v2/evidence/baseline-v2/baseline-v2-1337-1456.jsonl` | player victory | `5101d7c52c007c01` |

Claim now safe: the W1-Z1 fix did not alter seed 1337's final state or
outcome at the 50k tick baseline budget.

## Gate 2 - seed 1401 now terminates

Pre-fix W1-Z1 evidence:

- Command: `npm run sim -- --seed 1401 --ticks 60000 --sample-every 600`
- Source: `docs/fleet/reports/wave1/W1-Z1.md`
- Final summary: outcome `running`, final tick `60000`, final hash
  `b27dd578a444b62c`, player population `0`, rival population `76`.
- Final-window snapshots: player population first reached `0` at tick `47400`
  and stayed `0` through tick `60000`; player `terminal` stayed `false`.

Post-fix evidence:

- Command: `npm run sim -- --seed 1401 --ticks 60000 --sample-every 600 --out docs/plan-goals/01-baseline-v2/evidence/w1-z1-seed-1401-after-fix-60000.jsonl`
- Log: `docs/plan-goals/01-baseline-v2/evidence/logs/w1-z1-seed-1401-after-fix-60000.log`
- Final summary: outcome `gameOver`, final tick `46872`, final hash
  `5fce66f46805aff8`, player outcome `gameOver`, rival outcome `victory`,
  player population `0`, rival population `59`.
- Last emitted snapshot before termination: tick `46800`, player population
  `1`, player `terminal=false`, player `gameOver=false`, player nest food
  `7.5`; the run terminated 72 ticks later when the last player ant died.

Claim now safe: the zero-population stalemate class demonstrated by seed 1401
no longer persists through the 60k tick W1-Z1 probe.

## Gate 3 - post-fix baseline v2

Post-fix baseline v2 command:

```sh
npm run sim -- --seeds 1337,1338,...,1456 --ticks 50000 --out docs/plan-goals/01-baseline-v2/evidence/baseline-v2/baseline-v2-1337-1456.jsonl
```

Runtime from command log: `real 3408.63`, `user 2933.48`, `sys 69.20`.

Rollup:

| Baseline | Seeds | Tick budget | Player outcomes | Win rate | Running seeds |
|---|---|---:|---:|---:|---|
| Wave 0 combined | 1337-1456 | 50000 | 94 victories / 24 collapses / 2 running | 78.3% | W0-A running seed not named in old report; W0-A2 seed 1401 |
| Baseline v2 (post-W1-Z1-fix) | 1337-1456 | 50000 | 94 victories / 25 collapses / 1 running | 78.3% | 1355 |

The remaining running seed is not the W1-Z1 zero-population case:
baseline v2 seed 1355 ends the 50k budget with player population `1`, rival
population `57`, and final hash `bd357fd9cfd137d9`.

Hash comparison against Wave 0 rollups:

| Seed | Wave 0 hash | Baseline v2 hash | Baseline v2 outcome |
|---:|---|---|---|
| 1369 | `44a96d9b6417d4eb` | `5a944ffad6cc8f42` | player victory |
| 1401 | `92a7fee2c50fca16` | `5fce66f46805aff8` | player collapse / rival victory |
| 1417 | `66e9d31468620814` | `79dfbac0c2061d18` | player victory |
| 1453 | `b629cb0ad70085ae` | `0d250bb967e9fdad` | player collapse / rival victory |
| 1455 | `787f1546827b14d2` | `f535c12f7a3f6013` | player victory |

Claim now safe: baseline v2 is 94 player victories, 25 player collapses, and
1 running outcome over seeds 1337-1456 at the 50k tick baseline budget.

Claim still unsafe: the stricter planned gate, "only the two previously running
seeds changed hash," is not true on this run. Five final hashes differ from
Wave 0 rollups. Only seed 1401 changes the historical batch-level outcome
count, but the other four hash changes remain real baseline-v2 differences
unless a later audit proves a historical-report artifact.
