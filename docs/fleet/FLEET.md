# antzoo fleet program

**Status: ACTIVE.** This is the operating document for the experiment fleet. Commit at `docs/fleet/FLEET.md`. The implementation-era docs (`docs/debug-surface/BRIEF.md`, `DISPATCH.md`) are complete and historical; the workers' technical manual is `docs/debug-surface/DEBUG.md`.

## Mission

Use a pool of autonomous workers (up to 15 concurrent, ~100 dispatches/day) to run headless experiments against the antzoo simulation and return structured reports. Every claim reduces to `(seed, config, tick, observable)`. The operator reads reports and verdicts, never code. Worker confusion is a defect in this document or in DEBUG.md — the fix is always a doc patch plus redispatch, never per-worker coaching.

## Established baseline (Wave 0, 50k tick budget)

- Accepted baseline batches (W0-A, W0-A2, W0-A3; seeds 1337-1456, n=120): player 94 victories / 24 collapses / 2 still running at tick 50000; player win rate 78.3%, SE 0.0376. Decisive endings dominate, but "running" at 50k is now repeat-observed.
- Anchor and ledger subsets (W0-C, W0-C2, W0-C3; seeds 1337-1351, n=15): player 12 victories / 3 collapses. The original anchor seeds 1337-1341 remain player 3 victories / 2 collapses.
- Mortality: starvation dominates both factions. Across accepted n=40 baseline batches, median starvation deaths/run range from player 168.5-183 and rival 136-142.5. Spider and combat remain noise.
- Starvation obituaries: across accepted n=40 baseline batches, player starvation median deliveries is 3 and rival starvation median deliveries is 0. Player median starvation age is roughly 9.70k-9.83k ticks; rival median starvation age is roughly 8.12k-9.51k ticks.
- Population: accepted n=40 baseline batches have player peak median 198-202.5 and rival peak median 165-166; final population medians are player 40-48 and rival 0.
- Scenario patching: W0-B-rerun patches `ant.drainPerSec` from default 1.2 to 1.5 for seeds 1337-1346. Patched final hashes differ from baseline for all 10 seeds, and repeated patched runs match per-seed final hashes exactly.
- Flow counters: W0-C/W0-C2/W0-C3 show `foodDelivered` is not conserved by `queenConsumed + broodConsumed + nestFood`; W0-C2/W0-C3 raw tables have 60/60 nonzero differences. `drainTotal` exceeds `snackEnergyGained` at rollup scale.
- Throughput/capacity: W0 reports show median ticks/sec in the ~188-238 range where reported, with inconsistent wall clocks and some report omissions. Use actual reported wall clock per worker/cell until capacity is remeasured cleanly.

Open hypotheses for wave 1: (H1) early nearest-food distance per faction predicts the winner ("terrain luck"); (H2) the founding cohort dies as a synchronized wave near tick 10k and survival depends on brood banked before it; (H3) workforce composition (worker share) is the live causal lever behind the rival's zero-delivery starvation. Trace probes before broader decision-trace waves: seed 1401's `running` state at tick 50000, and the flow-counter semantic mismatch.

## Units and known wrinkles (workers: read before interpreting)

- `tick`, `birthTick`, obituary `age` are **ticks** (60 = 1 sim-second). Obituary `ticksInMode`, `ticksSinceLastDelivery`, `ticksSinceFoodPerceived` are **sim-seconds** despite their names.
- `hashesAllMatch: false` in `cross_seed_rollup` is expected — different seeds differ by design. It is meaningful only within a `seed_summary` (replicates of one seed).
- Hashes identify `(state, config)`: any tuning patch changes the hash. Never compare hashes across configs.
- `ticksPerSecond` and `ticksPerSecondQuartiles` are performance telemetry, not simulation state. Repeated commands can match final hashes and gameplay outcomes while timing fields differ; determinism claims should compare per-seed final hashes and non-performance fields, not byte-identical full rollups.
- Baseline runs typically terminate in victory/gameOver before the tick budget; `finalTick` < requested ticks is normal, not an error.

## Worker contract

Workers receive one instruction packet, have full repo access, and run experiments via the headless CLI. Workers **never modify code, tests, or docs other than adding their report**. Deliverable: a PR adding exactly one file, `docs/fleet/reports/<wave>/<cell-id>.md`. PR comments from the operator should be unnecessary; if one is needed, the packet was defective.

Environment expectations: Node 20+, `npm ci`, then commands per DEBUG.md. If the environment cannot complete the assigned seed count within limits, run as many seeds as fit, report the actual n, and say so prominently.

## Report schema (one file per cell)

```markdown
# Cell <cell-id> — <one-line description>
- command: <exact command(s) run, copy-pasteable>
- config: <every patched tuning key with absolute value AND the default it replaced>
- seeds: <list>  n=<count>
- runtime: <wall clock>

## Results (verbatim)
<cross_seed_rollup line>
<seed_summary lines in a collapsed appendix or attached as-is>

## Reading
- win_rate: x/n (player), with note if any run hit the tick budget still "running"
- vs baseline: deathsByCause medians, obituary medians (deliveries, ticksSinceFoodPerceived), peak/final population — only the deltas that matter
- anomalies: each as (seed, tick, field, observed, expected)

## Verdict
<one sentence answering the cell's question>
Confidence: <high/medium/low> — <why, in one clause>
```

Rejection criteria (operator side): prose claims without verbatim rollup lines; patched keys without recorded defaults; claims missing (seed, tick) citations; missing n.

## Dispatch template

Before sending a dispatch, replace every angle-bracket placeholder. Wave slugs are lowercase `wave<number>` (`wave0`, `wave1`, ...). Never send a worker a prompt containing `<CELL-ID>`, `<wave>`, or any other unresolved placeholder.

```
Read docs/fleet/FLEET.md and docs/debug-surface/DEBUG.md in full. You are
running cell <CELL-ID> from the wave manifest in FLEET.md. Execute exactly
that cell: its config, its seeds, its tick budget. Produce a PR adding only
docs/fleet/reports/<wave>/<CELL-ID>.md, following the report schema in
FLEET.md exactly. Do not modify any other file. If a tuning key named in the
manifest does not exist verbatim, locate the real key in src/tuning.ts that
implements the stated intent, use it, and record both the key and its default
in your report. Every claim cites (seed, tick, field). If anything blocks
you, write the report anyway with what you have and a BLOCKED section.
```

## Wave 0 — calibration (3 cells, dispatch concurrently)

| Cell | Question | Spec |
|---|---|---|
| W0-A | True baseline win rate | Baseline config, seeds 1337–1376 (n=40), 50k ticks. Report win rate ±SE, outcome/terminal patterns, whether the 5-seed anchors above replicate. |
| W0-B | Does the sweep mechanism work? | Verify `--seeds` composes with `--scenario` and `patchTuning`: run seeds 1337–1346 with a scenario patching `ant.drainPerSec` to 1.25× default. Confirm tuning applied (hash differs from baseline per seed; report the patched/default values), rollup well-formed, and replicate determinism by showing repeated patched runs have identical per-seed final hashes and non-performance outcome fields. Timing fields may differ. |
| W0-C | Do the flow counters reconcile? | Seeds 1337–1341, `--sample-every 600`. From snapshots: does cumulative foodDelivered ≈ queenConsumed + broodConsumed (+ nestFood residual ~0)? Does drainTotal vs snackEnergyGained show the deficit? Report the ledger at 3 ticks per seed. Also report wall-clock per run (fleet capacity planning). |

Wave 0 is also worker calibration: completion rate, report-schema compliance, and runtime are findings about the fleet itself.

## Wave 1 — the science (dispatch after wave 0 reports are read; ~12 cells)

Tick budget 50k, n=20 seeds per cell (fresh range 2000–2019) unless stated. Baseline comparison values: use the accepted Wave 0 baseline above (94/120 player wins, 24 collapses, 2 running, SE 0.0376), plus the per-report rollup medians in `docs/fleet/findings/wave0.md` when a cell needs detailed mortality or population comparisons.

| Cell | Question | Spec |
|---|---|---|
| W1-D1..D6 | Collapse boundary vs energy drain | `ant.drainPerSec` at 0.75×, 0.9×, 1.0×, 1.1×, 1.25×, 1.5× default (one cell each). Output: win rate, starvation share, median starvation age per level. |
| W1-T1 | Terrain luck (H1) | Baseline config, seeds 2000–2049 (n=50), `--sample-every 600`. Join per-seed outcome against tick-600 `food.nearestDistanceByFaction`. Report the relationship (table + direction + rough effect size); no code changes — analysis in the report. |
| W1-C1..C3 | Caste composition (H3) | Worker share at low / default / high (locate the ratio keys in `TUNING.caste`; record keys + defaults). Watch rival and player starvation `medianDeliveries` and win rate move. |
| W1-F1 | Founding cohort wave (H2) | Baseline, seeds 2000–2009, `--sample-every 300`. Population time series 6k–14k ticks per seed: is there a synchronized die-off? Report wave timing, depth, and whether depth correlates with outcome. |

## Synthesis procedure (operator)

1. Merge report PRs (markdown-only; safe to merge unread, then read the reports).
2. Reject any report failing the rejection criteria — redispatch the cell with the same packet; if a second worker fails the same way, the schema or manifest is defective: patch FLEET.md.
3. One synthesis pass per wave (a fresh agent session pointed at `docs/fleet/reports/<wave>/`, or the operator's own read): confirmed findings, killed hypotheses, anomalies worth a trace probe, next-wave candidates. Write to `docs/fleet/findings/<wave>.md`.
4. Promote durable facts into the "Established baseline" section above. Promote recurring worker friction into DEBUG.md or harness change requests.

## Program metrics (per wave, three numbers)

- Clarification/PR-comment rounds per dispatch (target 0 — each one is a compiled-judgment defect).
- Report acceptance rate on first submission.
- Novel findings per cell (vs duplicates/noise).

## Out of scope until the boundary map exists

Browser-based legibility testing (the bridge is ready; the program is deferred), decision-trace waves (second-line probes, triggered by anomalies from wave 1, not scheduled speculatively), and any gameplay or balance changes — this program measures; it does not yet tune.
