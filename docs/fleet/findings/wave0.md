# Wave 0 findings

Source reports:

- `docs/fleet/reports/wave0/W0-A.md`
- `docs/fleet/reports/wave0/W0-B.md`
- `docs/fleet/reports/wave0/W0-C.md`

## Operator acceptance

| Cell | Decision | Reason |
|---|---|---|
| W0-A | Accepted for synthesis, with report-quality caveats | Provides `n=40` and a verbatim `cross_seed_rollup`. The report omits the requested win-rate SE and does not attach actual `seed_summary` lines, so it should improve on redispatch patterns, but the expanded baseline rollup is usable. |
| W0-B | Rejected; redispatch before trusting patched-scenario waves | Records the patched/default `ant.drainPerSec` values and a rollup, but the core determinism claim says the same command was rerun with identical output without including the second verbatim rollup. That is a prose claim without the evidence needed for the cell question. |
| W0-C | Accepted | Provides `n=5`, a verbatim `cross_seed_rollup`, seed summaries, and seed/tick/field anomalies for the sampled ledger checks. |

First-submission acceptance rate: 2/3 cells accepted for synthesis, 1/3 rejected for redispatch.

## Confirmed findings

- Expanded baseline win rate is 32/40 player wins, SE 0.063, from W0-A seeds 1337-1376 at a 50k tick budget.
- The old 5-seed anchor replicates inside W0-C: seeds 1337-1341 produce player 3 wins / 2 collapses, player starvation median 175, rival starvation median 154, and rival median starvation deliveries 0.
- Starvation remains the dominant mortality signal. In W0-A, median starvation deaths are player 168.5 and rival 136; spider and combat medians remain near noise levels.
- Rival delivery failure remains durable: in W0-A, rival starvation obituary median deliveries is 0 across the 40-seed rollup.
- One W0-A run remained `running` at tick 50000. The previous baseline claim that `running` at 50k had never been observed is now false.
- The naive flow ledger does not reconcile in W0-C. At sampled ticks 600, 1200, and 1800 across seeds 1337-1341, `foodDelivered` diverges from `queenConsumed + broodConsumed + nestFood`, and `drainTotal` is consistently much larger than `snackEnergyGained`.

## Killed or weakened assumptions

- Killed: all baseline runs end decisively before the 50k tick budget.
- Weakened: the old throughput/capacity anchor. W0 reports show median ticks/sec in the ~188-238 range, while reported wall clocks are inconsistent across cells. Use actual worker wall-clock observations until runner capacity is remeasured cleanly.
- Not yet confirmed: patched-scenario sweep determinism. W0-B is promising but rejected because the report does not include the duplicate rollup needed to prove the claim.

## Anomalies worth a trace probe

- W0-A reports one `running` game at tick 50000 but does not identify the seed. Redispatch or rerun should recover the seed before using it as a case study.
- W0-C ledger mismatch should get a focused trace probe before interpreting it as a simulation bug. The first probe should compare the semantic units of `foodDelivered`, `queenConsumed`, `broodConsumed`, `nestFood`, `snackEnergyGained`, and `drainTotal` for one seed over ticks 600, 1200, and 1800.
- W0-C reported needing sampled snapshots but the final report only gives derived ledger anomalies, not raw snapshot lines. Future ledger cells should require a compact table of observed components per sampled tick.

## Next-wave candidates

- Redispatch W0-B with the same cell packet, but require two verbatim `cross_seed_rollup` lines from identical commands and an explicit per-seed baseline-hash comparison table.
- Dispatch baseline-only science cells first if needed (`W1-T1`, `W1-F1`), but hold patched tuning sweeps (`W1-D*`, `W1-C*`) until W0-B is accepted.
- Add a one-seed flow trace probe for W0-C before scheduling broader decision-trace waves.

## Program metrics

- Clarification/PR-comment rounds per dispatch: 0 operator PR review rounds. Each PR only has the automatic Jules intro comment.
- Report acceptance rate on first submission: 2/3.
- Novel findings per accepted cell: W0-A produced the expanded baseline and the first observed 50k `running` outcome; W0-C produced the flow-ledger mismatch. W0-B is not counted until redispatched.
