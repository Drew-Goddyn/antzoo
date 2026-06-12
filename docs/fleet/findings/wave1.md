# Wave 1 findings

Source reports:

- `docs/fleet/reports/wave1/W1-D1.md`
- `docs/fleet/reports/wave1/W1-D2.md`
- `docs/fleet/reports/wave1/W1-D3.md`
- `docs/fleet/reports/wave1/W1-D4.md`
- `docs/fleet/reports/wave1/W1-D5.md`
- `docs/fleet/reports/wave1/W1-D6.md`
- `docs/fleet/reports/wave1/W1-T1a.md`
- `docs/fleet/reports/wave1/W1-C1.md`
- `docs/fleet/reports/wave1/W1-C2.md`
- `docs/fleet/reports/wave1/W1-C3.md`
- `docs/fleet/reports/wave1/W1-F1.md`
- `docs/fleet/reports/wave1/W1-Z1.md`
- `docs/fleet/reports/wave1/W1-L1.md`

Excluded from scientific synthesis: W1-T1b PR #16 was rejected and closed; it contained only partial `n=5` evidence and a synthetic-looking `cross_seed_rollup`, so it is process evidence only. Obsolete W1-D5 PR #26 was closed and superseded by merged PR #28.

GitHub verification via `gh`: report PRs #14, #15, #17-#25, #27, and #28 are merged. PR #16 and PR #26 are closed unmerged. `gh pr list --state open --limit 100` returned `[]`, so no Wave 1 report PRs remain open.

## Operator acceptance

| Report | Decision | Reason |
|---|---|---|
| W1-D1 | Accepted | Provides `n=20`, a parseable rollup, patched/default `ant.drainPerSec`, and a cited running anomaly at `(seed 2000, tick 50000, population, player 18, rival 72)`. |
| W1-D2 | Accepted | Provides `n=20`, patched/default `ant.drainPerSec`, rollup, seed summaries, and drain-level reading. |
| W1-D3 | Accepted as honest partial | Provides `n=3` with `BLOCKED`; useful as low-confidence default-drain evidence only, not as a full boundary cell. |
| W1-D4 | Accepted | Provides `n=20`, patched/default `ant.drainPerSec`, rollup, seed summaries, and no reported anomalies. |
| W1-D5 | Accepted | Merged PR #28 provides the superseding single-file report with `n=20`, patched/default `ant.drainPerSec`, and no running outcomes. |
| W1-D6 | Accepted as honest partial | Provides `n=3` with `BLOCKED`; useful as low-confidence high-drain evidence only. Any session failure/recovery oddity is worker reliability evidence, not simulation evidence. |
| W1-T1a | Accepted | Provides baseline `n=25`, tick-600 nearest-food distance table, and outcome join for seeds 2000-2024. |
| W1-T1b | Rejected; excluded | PR #16 has only partial `n=5` and a synthetic-looking rollup. Do not use it for H1 evidence. |
| W1-C1 | Accepted | Provides `n=20`, low-worker patched/default caste ratios, rollup, and starvation-delivery metrics. |
| W1-C2 | Accepted | Provides `n=20`, default caste ratios, rollup, and serves as the caste-control cell on seeds 2000-2019. |
| W1-C3 | Accepted | Provides `n=20`, high-worker patched/default caste ratios, rollup, and one running seed `(seed 2002)`. |
| W1-F1 | Accepted | Provides baseline `n=10`, rollup, and per-seed founding-wave timing/depth observations for seeds 2000-2009. |
| W1-Z1 | Accepted | Provides seed 1401 to tick 60000 with final `running` state plus source-code reading for the zero-population terminal condition. |
| W1-L1 | Accepted | Provides source-code reading plus two ledger probe seeds and exact corrected-ledger arithmetic. |

Final Wave 1 scientific coverage is 13 accepted reports across 14 planned cells. The missing half is W1-T1b, so terrain-luck conclusions are first-half only.

## Aggregate method

All aggregate tables below use the accepted reports' first `cross_seed_rollup` or, for W1-Z1, the single `summary` line. Medians are not recomputed from raw seed summaries. W1-D3 and W1-D6 are included in tables but marked partial because `n=3` is not comparable to the `n=20` drain cells.

Baseline comparisons use Wave 0's accepted combined baseline: seeds 1337-1456, `n=120`, player 94 victories / 24 collapses / 2 running, 78.3% win rate, SE 0.038. Fresh Wave 1 baseline-like reports overlap seeds, so they are not pooled as independent replications: W1-C2 covers seeds 2000-2019, W1-T1a covers 2000-2024, W1-F1 covers 2000-2009, and W1-D3 is only seeds 2000-2002.

For W1-Z1 and W1-L1, the synthesis also sanity-checks the named code paths in `src/sim.ts` and constants in `src/tuning.ts`; those checks validate the report interpretation but do not add new simulation observations.

### Drain boundary cells

| Report | `ant.drainPerSec` | Seeds | Player outcomes | Player win rate | Starvation death medians P/R | Starvation median age P/R | Starvation median deliveries P/R | Final pop median P/R |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| W1-D1 | 0.9, 0.75x default | 2000-2019, n=20 | 8 victory / 11 collapse / 1 running | 40.0% | 206 / 146 | 12964 / 12799.75 | 4 / 1 | 0 / 27 |
| W1-D2 | 1.08, 0.9x default | 2000-2019, n=20 | 14 / 6 / 0 | 70.0% | 186 / 134.5 | 11002 / 10648 | 4 / 0 | 38.5 / 0 |
| W1-D3 | 1.2, default | 2000-2002, n=3 partial | 2 / 1 / 0 | 66.7% | 209 / 151 | 10000 / 13502 | 4 / 0 | 14 / 0 |
| W1-D4 | 1.32, 1.1x default | 2000-2019, n=20 | 16 / 4 / 0 | 80.0% | 169 / 139 | 9090.5 / 8775.75 | 3 / 0 | 42 / 0 |
| W1-D5 | 1.5, 1.25x default | 2000-2019, n=20 | 20 / 0 / 0 | 100.0% | 133 / 134 | 7870 / 5536.75 | 2 / 0 | 96.5 / 0 |
| W1-D6 | 1.8, 1.5x default | 2000-2002, n=3 partial | 3 / 0 / 0 | 100.0% | 117 / 145 | 6269 / 3834 | 2 / 0 | 93 / 0 |

### Caste-composition cells

| Report | Ratios P/R, worker-soldier-nurse | Seeds | Player outcomes | Player win rate | Starvation death medians P/R | Starvation median deliveries P/R | Peak pop median P/R | Final pop median P/R |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| W1-C1 | 60-20-20 / 40-30-30 | 2000-2019, n=20 | 17 victory / 3 collapse / 0 running | 85.0% | 95.5 / 91 | 0 / 0 | 189.5 / 162 | 99 / 0 |
| W1-C2 | 80-10-10 / 60-20-20 | 2000-2019, n=20 | 15 / 5 / 0 | 75.0% | 194 / 140 | 3.25 / 0 | 202 / 166 | 49.5 / 0 |
| W1-C3 | 90-5-5 / 80-10-10 | 2000-2019, n=20 | 14 / 5 / 1 | 70.0% plus one running | 230.5 / 169.5 | 3.5 / 1 | 185 / 169.5 | 17 / 0 |

## Confirmed findings

- The drain sweep is non-linear. Lowering `ant.drainPerSec` below default hurt the player in accepted `n=20` cells: W1-D1 at 0.9 produced 8/20 player wins and one running outcome, while W1-D2 at 1.08 produced 14/20. Raising drain to 1.32 was baseline-like at 16/20, and 1.5 produced 20/20 player wins. W1-D6 at 1.8 also showed 3/3 player wins, but it is only `n=3`.
- Starvation remains the dominant mortality channel, but the timing and count shift sharply with drain. Player starvation death medians move from 206 at W1-D1 to 133 at W1-D5, while player starvation median age drops from 12964 ticks to 7870 ticks. W1-D6 pushes the partial sample even younger at 6269 ticks.
- High drain appears to collapse the rival earlier while leaving the player with more final survivors. W1-D5 reports final population medians player 96.5 / rival 0 and player 20/20 wins; W1-D1 reports player 0 / rival 27 and only 8/20 player wins, plus `(seed 2000, tick 50000)` still running with player 18 and rival 72.
- H3 is confirmed as a workforce-composition lever, but not as a simple "more workers wins" rule. High worker share in W1-C3 moves rival starvation median deliveries from 0 to 1 and raises rival peak population to 169.5, but player win rate is 14/20 with one running seed. Low worker share in W1-C1 drives both factions' starvation median deliveries to 0 and lowers starvation death medians, yet the player still wins 17/20 because the rival is hit harder.
- Terrain luck H1 is supported but not closed. In W1-T1a, rival-win seeds 2000, 2008, 2010, 2014, and 2016 have tick-600 distance deltas `(player nearest food - rival nearest food)` averaging 84.74, median 93.3. Player-win seeds average 12.36 with median 50.9, heavily affected by seed 2004's `-919.3` outlier. Large positive delta is a warning sign, but not sufficient by itself: player wins also include high positive deltas such as seeds 2001, 2002, 2003, and 2023.
- The founding cohort wave is real in W1-F1. Every seed 2000-2009 peaks between ticks 6000 and 8700 and bottoms between ticks 12000 and 13800. The two deepest drops, seed 2000 depth 90 and seed 2008 depth 87, are exactly the two player collapses in that sample.
- The seed-1401 zombie state is confirmed. W1-Z1 shows seed 1401 remains `running` through tick 60000 with player population 0 and rival population 76. The table shows player population first reaches 0 at tick 47400, while player `terminal` remains false and player `nestFood` remains 7.5 through tick 60000.
- The code explanation for the zombie state matches the source. In `src/sim.ts`, `countFactionAnts(world, factionValue) <= 0` is checked only inside `if (terminalTimer > 0)` in `updateQueenState`. If a faction reaches zero ants while `nestFood > 0`, the terminal cascade is never started.
- The flow ledger is now explained. W1-L1 identifies uncounted nest refills and spider trophy food as the missing terms. For `(seed 1344, tick 1800, player)`, `30 startFood + 237 foodDelivered - 102 broodConsumed - 40.5 nestFood = 124.5`, exactly 249 refills at `TUNING.ant.refillCost = 0.5`. For `(seed 1351, tick 1200, rival)`, the reported row reconciles to 103 refills by the same formula.

## Killed or weakened assumptions

- Killed: "lower energy drain should make the player safer." W1-D1 at 0.75x default is the worst accepted drain cell for player outcome.
- Killed: drain has a monotonic starvation-count interpretation. Higher drain makes ants starve younger, but W1-D5 lowers total player starvation deaths and improves final player population.
- Weakened: H1 as a completed terrain-luck result. W1-T1a supports the direction, but W1-T1b is rejected/missing and high positive tick-600 deltas are not sufficient to force rival wins.
- Weakened: "more workers fixes starvation." W1-C3 increases rival deliveries before starvation, but also increases starvation death medians and does not improve player win rate.
- Killed: a `running` outcome means both factions still have viable populations. W1-Z1 proves a zero-population faction can persist as `running`.
- Killed: `foodDelivered - broodConsumed - queenConsumed` should reconcile `nestFood`. Correct accounting must include start food, spider trophy food, and uncounted ant refills.

## Anomalies worth a trace probe

- W1-D1 is the sharpest surprise. Trace a low-drain collapse and the running case: `(W1-D1 seed 2000, tick 50000, player population 18, rival population 72)`. Watch population cap pressure, brood production, nest refill drain, and food-field depletion.
- Complete the partial drain cells if the drain boundary matters quantitatively. W1-D3 and W1-D6 are accepted as honest partials, but `n=3` is not enough to locate the curve around default or 1.5x default.
- Redispatch W1-T1b only if H1 is still needed for a Wave 1 terrain conclusion. The redispatch should accept honest partials but must require actual emitted JSONL lines and no regenerated rollup.
- Trace W1-C3 seed 2002, the high-worker running seed. It is a different running pattern than Z1: the report's seed summary has player 13 and rival 89 at the tick budget, not a zero-population player.
- Promote W1-L1's corrected ledger definition into FLEET.md or the debug docs before more flow-counter waves. The useful next counters are `nestRefillConsumed` and `spiderTrophyFood`, or an explicit note that the current counters are not a conservation ledger.
- After any future terminal-condition fix, rerun seed 1401 to 60000 ticks and require a before/after claim at `(seed 1401, tick 47400-60000, player population, terminal, nestFood, outcome)`.

## Next-wave candidates

- A focused drain mechanism wave: compare W1-D1 and W1-D5 with snapshots every 300-600 ticks on the same seeds, especially seed 2000, and report population, brood, nestFood, refill estimates, and nearest-food distance.
- A completed terrain wave: rerun W1-T1b or run a full combined H1 batch with a real parser that emits tick-600 features and final outcomes from one reproducible command path.
- A founding-wave threshold wave: extend W1-F1 beyond 10 seeds and model peak tick, trough tick, depth, and outcome. Use seeds around the observed boundary: depths near 66-76 survived, 87-90 collapsed.
- A terminal-state bug probe: keep this as measurement unless gameplay fixes are explicitly authorized, but the minimal acceptance test is seed 1401 with player zero-pop no longer persisting indefinitely.
- A ledger-instrumentation wave: add counters only if instrumentation work is authorized; otherwise continue using W1-L1's corrected equation manually.

## Program metrics

- Judgment rounds: 0 observed. PR-channel judgment rounds are 0, verified via `gh` on Wave 1 PRs #14-#28; PR #16's rejection explicitly says judgment rounds += 0. Session-channel judgment rounds are 0 by operator tally.
- Ceremony/repair touchpoints: 2 session-channel ceremony asks by operator tally (W1-D3 asked whether to continue; original W1-D5 session 2580447229263071482 asked whether to open a PR). One PR-channel repair touchpoint occurred on W1-D5 PR #26 to remove extra committed files and obey the one-report-file contract. These are dispatch friction, not scientific evidence.
- Report acceptance rate: final scientific corpus is 13 accepted reports / 14 planned cells. First-submission cell acceptance was 12/14: W1-T1b rejected, and W1-D5's first PR #26 was superseded by #28. PR-level report acceptance was 13/15 across Wave 1 report PRs (#14-#28).
- Worker reliability/friction: W1-D3 and W1-D6 completed honest partial `n=3` reports; W1-T1b failed evidence quality with partial `n=5` and synthetic-looking rollup; W1-D5 #26 needed repair and was later superseded. Treat the W1-D6 session failure/recovery oddity as worker reliability friction only.
- Novel findings per accepted family: W1-D* found the non-linear drain boundary; W1-C* confirmed workforce composition affects delivery/starvation semantics without a simple win-rate rule; W1-T1a gave first-half terrain support; W1-F1 confirmed the founding cohort wave; W1-Z1 proved the zero-population running state; W1-L1 corrected flow-counter semantics.
