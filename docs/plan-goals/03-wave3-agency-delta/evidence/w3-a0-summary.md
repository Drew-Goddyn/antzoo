# W3-A0 Default Agency Anchor

- Seeds: 3000-3019
- Config: default tuning
- Unattended command pattern: `npm run sim -- --seed <seed> --ticks 50000 --out ...`
- Rescue command pattern: `npm run sim -- --seed <seed> --ticks 50000 --scenario scenarios/rescue-protocol.json --out ...`
- Cell size: 20 seeds per arm
- Pilot subset required by PLAN.md: seeds 3000-3009, included in this cell

## Rollup

| Arm | n | Player wins | Player collapses | Running | Win rate | Median finalTick | Median player final pop | Median rival final pop | Median player deliveries | Median rival deliveries |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| unattended | 20 | 14 | 6 | 0 | 70.0% | 20990.5 | 44 | 0 | 943 | 490.5 |
| rescue | 20 | 15 | 5 | 0 | 75.0% | 22175 | 32.5 | 0 | 1102 | 453.5 |

AgencyDelta: 5.0%

## Pilot Subset 3000-3009

| Seed | Arm | Outcome | Final tick | Final hash | Player final pop | Rival final pop |
|---:|---|---|---:|---|---:|---:|
| 3000 | unattended | victory | 21604 | d23ef9c4671c8168 | 73 | 0 |
| 3001 | unattended | gameOver | 27580 | db3f81b6408bb3ae | 0 | 6 |
| 3002 | unattended | gameOver | 25695 | bad5bf5b50ced40f | 0 | 1 |
| 3003 | unattended | victory | 16618 | ce9275c58075cba1 | 60 | 0 |
| 3004 | unattended | gameOver | 23018 | 30241325d35d908d | 0 | 7 |
| 3005 | unattended | victory | 17801 | a674e5f8f3590e6c | 50 | 0 |
| 3006 | unattended | victory | 13910 | 816ec1f1ecc58f35 | 116 | 0 |
| 3007 | unattended | victory | 6105 | 8bc2a90b7305a337 | 160 | 0 |
| 3008 | unattended | victory | 13347 | e32d2a900c735a34 | 87 | 0 |
| 3009 | unattended | victory | 14432 | a4eaa4cb2e7cf65f | 124 | 0 |
| 3000 | rescue | victory | 14969 | 739dff72fea1fc42 | 131 | 0 |
| 3001 | rescue | gameOver | 20893 | d7b595a2b03b6312 | 0 | 15 |
| 3002 | rescue | victory | 26204 | e53878b9384c94d9 | 19 | 0 |
| 3003 | rescue | victory | 21588 | 7fcc1b905a00f298 | 41 | 0 |
| 3004 | rescue | victory | 30389 | 903b7abfafb7cceb | 12 | 0 |
| 3005 | rescue | gameOver | 28554 | d8d2b84f748c5297 | 0 | 20 |
| 3006 | rescue | victory | 21987 | 4a2f656bfb31979b | 57 | 0 |
| 3007 | rescue | victory | 6105 | 967629967f98adaa | 160 | 0 |
| 3008 | rescue | victory | 12331 | 10e9d13e829d89be | 124 | 0 |
| 3009 | rescue | victory | 17117 | b2b2d8984d6b78c4 | 126 | 0 |

## Full Per-Seed Table

See `docs/plan-goals/03-wave3-agency-delta/evidence/w3-a0-per-seed.csv` and `docs/plan-goals/03-wave3-agency-delta/evidence/w3-a0-summary.json`.

## Raw Artifacts

- docs/plan-goals/03-wave3-agency-delta/evidence/raw/w3-a0/default-unattended/
- docs/plan-goals/03-wave3-agency-delta/evidence/raw/w3-a0/default-rescue/
