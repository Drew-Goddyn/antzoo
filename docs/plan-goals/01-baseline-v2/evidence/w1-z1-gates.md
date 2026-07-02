# W1-Z1 gate evidence

Fleet-facing gate record: `docs/fleet/findings/w1z1-fix-gates.md`.

Raw evidence used:

- `docs/fleet/reports/wave0/W0-A.md`
- `docs/fleet/reports/wave0/W0-A2.md`
- `docs/fleet/reports/wave0/W0-A3.md`
- `docs/fleet/reports/wave1/W1-Z1.md`
- `docs/plan-goals/01-baseline-v2/evidence/baseline-v2/baseline-v2-1337-1456.jsonl`
- `docs/plan-goals/01-baseline-v2/evidence/baseline-v2/baseline-v2-summary.md`
- `docs/plan-goals/01-baseline-v2/evidence/baseline-v2/baseline-v2-per-seed-diff.csv`
- `docs/plan-goals/01-baseline-v2/evidence/w1-z1-seed-1401-after-fix-60000.jsonl`
- `docs/plan-goals/01-baseline-v2/evidence/logs/w1-z1-seed-1401-after-fix-60000.log`

Summary:

- Seed 1337 is unchanged at the 50k tick baseline budget: player victory,
  final hash `5101d7c52c007c01` before and after the W1-Z1 fix.
- Seed 1401 no longer remains running through the 60k tick W1-Z1 probe:
  post-fix outcome is player `gameOver` / rival `victory` at tick `46872`,
  final hash `5fce66f46805aff8`.
- Baseline v2 over seeds 1337-1456 at 50k ticks is 94 player victories,
  25 player collapses, and 1 running outcome.
- The remaining running seed is 1355, with player population `1`, rival
  population `57`, and final hash `bd357fd9cfd137d9` at the 50k tick budget.
- Five final hashes differ from the historical Wave 0 rollups: seeds 1369,
  1401, 1417, 1453, and 1455. Only seed 1401 changes the historical
  batch-level outcome count.
