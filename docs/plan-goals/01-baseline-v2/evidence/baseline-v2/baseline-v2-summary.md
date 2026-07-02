# Baseline v2 evidence summary

Command: `npm run sim -- --seeds 1337,...,1456 --ticks 50000 --out docs/plan-goals/01-baseline-v2/evidence/baseline-v2/baseline-v2-1337-1456.jsonl`

Runtime: `real 3408.63`, `user 2933.48`, `sys 69.20` from `docs/plan-goals/01-baseline-v2/evidence/logs/baseline-v2-1337-1456.log`.

Config: baseline defaults; no scenario and no tuning patch.

Tick budget: 50000 per seed.

## Rollup

- Runs: 120
- Player outcomes: 94 victories / 25 collapses / 1 running.
- Win rate: 78.3%.
- Current running seed: 1355.
- Player peak population median: 199; rival peak population median: 165.
- Player final population median: 45; rival final population median: 0.
- Starvation death medians: player 174; rival 140.5.
- Starvation median deliveries: player 3; rival 0.

## Historical-batch comparison

| Batch | Seeds | Old player outcomes | Baseline v2 player outcomes | Hash changes | Current running seeds |
|---|---|---:|---:|---:|---|
| W0-A | 1337-1376 | 32 victory / 7 collapse / 1 running | 32 victory / 7 collapse / 1 running | 1 | 1355 |
| W0-A2 | 1377-1416 | 30 victory / 9 collapse / 1 running | 30 victory / 10 collapse / 0 running | 1 | none |
| W0-A3 | 1417-1456 | 32 victory / 8 collapse / 0 running | 32 victory / 8 collapse / 0 running | 3 | none |

## Hash differences vs Wave 0 rollups

| Seed | Old hash | Baseline v2 hash | Baseline v2 outcome | Source |
|---:|---|---|---|---|
| 1369 | `44a96d9b6417d4eb` | `5a944ffad6cc8f42` | victory | docs/fleet/reports/wave0/W0-A.md |
| 1401 | `92a7fee2c50fca16` | `5fce66f46805aff8` | gameOver | docs/fleet/reports/wave0/W0-A2.md |
| 1417 | `66e9d31468620814` | `79dfbac0c2061d18` | victory | docs/fleet/reports/wave0/W0-A3.md |
| 1453 | `b629cb0ad70085ae` | `0d250bb967e9fdad` | gameOver | docs/fleet/reports/wave0/W0-A3.md |
| 1455 | `787f1546827b14d2` | `f535c12f7a3f6013` | victory | docs/fleet/reports/wave0/W0-A3.md |

The expected closeout gate was stricter than the result: five final hashes differ from Wave 0 rollups. Only seed 1401 changes the historical batch-level outcome count; the other hash changes must be treated as real baseline-v2 differences unless a separate audit proves otherwise.

## Per-seed evidence

- Raw baseline v2 JSONL: `docs/plan-goals/01-baseline-v2/evidence/baseline-v2/baseline-v2-1337-1456.jsonl`.
- Per-seed diff CSV: `docs/plan-goals/01-baseline-v2/evidence/baseline-v2/baseline-v2-per-seed-diff.csv`.
