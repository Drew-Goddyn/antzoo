# Wave 0 findings

Source reports:

- `docs/fleet/reports/wave0/W0-A.md`
- `docs/fleet/reports/wave0/W0-B.md`
- `docs/fleet/reports/wave0/W0-C.md`
- `docs/fleet/reports/wave0/W0-A2.md`
- `docs/fleet/reports/wave0/W0-A3.md`
- `docs/fleet/reports/wave0/W0-A-replicate.md`
- `docs/fleet/reports/wave0/W0-B-rerun.md`
- `docs/fleet/reports/wave0/W0-C2.md`
- `docs/fleet/reports/wave0/W0-C3.md`

GitHub verification via `gh`: report PRs #5 through #13 are merged; #8 through #13 are the extension-batch PRs. `gh pr list --state open --limit 100` returned `[]`, so no report PRs remain open.

## Operator acceptance

| Report | Decision | Reason |
|---|---|---|
| W0-A | Accepted for synthesis, with report-quality caveats | Provides `n=40` and a parseable `cross_seed_rollup`. It omits the requested SE and elides actual `seed_summary` lines, so use it for rollup-level baseline facts only. |
| W0-B | Rejected; superseded by W0-B-rerun | Records patched/default `ant.drainPerSec` and one rollup, but the determinism claim is prose-only because the second run's rollup is absent. |
| W0-C | Accepted | Provides `n=5`, a rollup, seed summaries, and seed/tick/field ledger anomalies for seeds 1337-1341. |
| W0-A2 | Accepted for rollup-level synthesis, with report-quality caveats | Provides `n=40`, a parseable rollup, SE, and a cited running anomaly. The seed-summary appendix contains NUL bytes, so do not use the appendix for seed-level extraction. |
| W0-A3 | Accepted | Provides `n=40`, a rollup, seed summaries, SE, and baseline comparisons for fresh seeds 1417-1456. |
| W0-A-replicate | Rejected; redispatch only if same-seed baseline determinism still matters | The report says the full run timed out and that mocked seed summaries were used to fulfill the schema. Synthetic evidence cannot be accepted. A redispatch must report actual completed runs, actual `n`, and no mock summaries. |
| W0-B-rerun | Accepted for synthesis, with determinism-scope caveat | Provides patched/default `ant.drainPerSec`, `n=10`, two rollups, and a per-seed baseline vs patched hash table. The repeated runs match on final hashes and simulation outcomes; `ticksPerSecondQuartiles` differs, so do not call the full rollup byte-identical. |
| W0-C2 | Accepted for ledger synthesis, with report-quality caveats | Provides `n=5`, seed summaries, and a raw ledger table for seeds 1342-1346. The top-level rollup is compacted and omits top-level timing, so do not use it for capacity measurement. |
| W0-C3 | Accepted | Provides `n=5`, a full rollup, seed summaries, and a raw ledger table for seeds 1347-1351. |

Extension-batch acceptance: 5/6 accepted for at least one synthesis use; W0-A-replicate rejected. Cumulative Wave 0 report acceptance: 7/9 reports accepted, 2/9 rejected. Distinct cell coverage is now complete: W0-A baseline accepted, W0-B patched sweep accepted on rerun, and W0-C ledger accepted across three seed ranges.

## Aggregate method

Baseline aggregate uses the first `cross_seed_rollup` from accepted W0-A, W0-A2, and W0-A3 only. W0-A-replicate is excluded because it admits mock evidence. The combined win rate is computed from summed player `factionOutcomeCounts`: `p = player victories / runs`; `SE = sqrt(p * (1 - p) / n)`. Medians are not recomputed from raw runs; where medians are summarized below, they are the range of each accepted report's rollup median so another operator can audit the exact source.

| Report | Seeds | Player outcomes | Player win rate | Player/rival starvation death medians | Player/rival peak pop medians | Median ticks/sec |
|---|---:|---:|---:|---:|---:|---:|
| W0-A | 1337-1376 | 32 victory / 7 collapse / 1 running | 80.0% | 168.5 / 136 | 202.5 / 165 | 188.49 |
| W0-A2 | 1377-1416 | 30 victory / 9 collapse / 1 running | 75.0% | 174.5 / 142.5 | 199 / 166 | 199.45 |
| W0-A3 | 1417-1456 | 32 victory / 8 collapse / 0 running | 80.0% | 183 / 137.5 | 198 / 165.5 | 196.47 |
| Combined | 1337-1456 | 94 victory / 24 collapse / 2 running | 78.3%, SE 0.0376 | report-median range 168.5-183 / 136-142.5 | report-median range 198-202.5 / 165-166 | report-median range 188.49-199.45 |

Ledger aggregate uses the raw tables in W0-C2 and W0-C3 for seeds 1342-1351: 10 seeds x 3 ticks x 2 factions = 60 rows. Every row has nonzero `foodDelivered - (queenConsumed + broodConsumed + nestFood)`: 34 positive deficits, 26 negative deficits, 0 exact matches. Player rows are 21 positive / 9 negative / 0 exact; rival rows are 13 positive / 17 negative / 0 exact. W0-C adds anomaly rows for seeds 1337-1341 and supports the same conclusion, but it does not provide a full raw table, so it is not included in the 60-row count.

## Confirmed findings

- Baseline outcome rate is stable over three accepted 40-seed batches. Across seeds 1337-1456 at a 50k tick budget, player outcomes are 94 victories / 24 collapses / 2 still running, for a 78.3% win rate with SE 0.0376.
- The original 5-seed anchor remains consistent inside the ledger cells. W0-C seeds 1337-1341 produce player 3 victories / 2 collapses; W0-C2 seeds 1342-1346 produce 4 / 1; W0-C3 seeds 1347-1351 produce 5 / 0. Across those 15 ledger seeds, player outcomes are 12 victories / 3 collapses.
- Starvation is the dominant mortality signal. Accepted baseline-batch starvation death medians range from player 168.5-183 and rival 136-142.5 per run; spider and combat medians remain near 0-1 in the n=40 baseline rollups.
- Rival delivery failure is durable. In W0-A, W0-A2, and W0-A3, rival starvation obituary median deliveries is 0. Player starvation obituary median deliveries is 3 in all three accepted baseline rollups.
- Population scale is stable. Accepted baseline-batch peak population medians range from player 198-202.5 and rival 165-166; final population medians range from player 40-48 and rival 0.
- `running` at tick 50000 is real, not a one-off typo. W0-A reports one running run in seeds 1337-1376; W0-A2 reports one running run and cites seed 1401 at tick 50000 with player population 0 and rival population 76; W0-A3 reports none.
- The patched sweep mechanism works after redispatch. W0-B-rerun patches `ant.drainPerSec` from default 1.2 to 1.5 for seeds 1337-1346. Every patched final hash differs from the same seed's baseline hash, and the two patched runs match per-seed final hashes exactly.
- The naive flow ledger is not a conservation equation. W0-C, W0-C2, and W0-C3 all show `foodDelivered` diverging from `queenConsumed + broodConsumed + nestFood` at sampled ticks 600, 1200, and 1800; W0-C2 and W0-C3 show 60/60 raw rows with nonzero differences.
- `drainTotal` consistently exceeds `snackEnergyGained` at rollup scale. Examples: W0-C player ratio 6.13 and rival 14.03; W0-C2 player 5.33 and rival 12.45; W0-C3 player 5.05 and rival 14.22.

## Killed or weakened assumptions

- Killed: all baseline runs end decisively before the 50k tick budget. Accepted baseline reports show 2 running outcomes across 120 seeds.
- Killed: `foodDelivered ~= queenConsumed + broodConsumed + nestFood` as a closed ledger. The observed differences switch sign by seed, faction, and tick, so the counters are measuring related but non-conserved quantities.
- Clarified: deterministic reruns should compare gameplay outputs such as per-seed final hashes and non-performance outcome fields. `ticksPerSecondQuartiles` changes between identical W0-B-rerun commands, so a byte-identical full `cross_seed_rollup` is the wrong acceptance target when timing fields are present.
- Superseded: the original W0-B rejection no longer blocks patched tuning waves. W0-B-rerun provides the missing duplicate-rollup and per-seed hash evidence.
- Weakened: throughput/capacity planning remains noisy. Accepted reports show median ticks/sec roughly 188-238 where reported, while worker wall clocks and rollup timing fields are inconsistent or missing in some reports.

## Anomalies worth a trace probe

- Running terminal inconsistency: W0-A2 cites `(seed 1401, tick 50000, population, player 0, rival 76)` while the global outcome remains `running`. Probe seed 1401 first. The W0-A running seed remains unidentified because W0-A lacks seed summaries.
- Flow semantics: pick one player-positive and one rival-negative ledger row from W0-C2/W0-C3 and trace the underlying components. Good starting rows are `(seed 1344, tick 1800, player foodDelivered 237, expected 142.5)` from W0-C2 and `(seed 1351, tick 1200, rival foodDelivered 10, expected 55)` from W0-C3.
- Report hygiene: W0-A2's NUL bytes and W0-C2's compacted rollup are single-report problems, not yet recurring fleet friction. Do not patch the worker packet for them unless they recur.

## Next-wave candidates

- Dispatch `W1-T1` terrain luck on fresh seeds 2000-2049, with the W0 combined baseline pasted into the packet: 94/120 player wins, 24 collapses, 2 running, SE 0.0376.
- Dispatch `W1-F1` founding cohort wave on seeds 2000-2009. Include the durable obituary baseline: player starvation median deliveries 3 and rival starvation median deliveries 0 across all accepted n=40 baseline batches.
- Unblock patched tuning sweeps (`W1-D*`, `W1-C*`) now that W0-B-rerun accepts scenario patching and per-seed deterministic hashes.
- Add a focused trace probe for seed 1401 at tick 50000 before treating running outcomes as normal end states.
- Add a focused flow-semantics trace probe before scheduling broader decision-trace waves. The probe should explain what each counter counts rather than trying to force a conservation equation.

## Program metrics

- Clarification/PR-comment rounds per dispatch: 0 operator review rounds verified with `gh`. PRs #5-#13 have only the automatic Jules intro comment and no reviews.
- Report acceptance rate: original first submission 2/3; extension batch 5/6; cumulative Wave 0 reports 7/9 accepted.
- Novel findings per accepted cell: W0-A produced the 120-seed baseline and the repeated 50k `running` outcome; W0-B-rerun validated scenario patching and deterministic final hashes while exposing the timing-field caveat; W0-C/C2/C3 established that the flow counters are not a closed ledger.
