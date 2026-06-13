# antzoo fleet program

**Status: ACTIVE.** This is the operating document for the experiment fleet. Commit at `docs/fleet/FLEET.md`. The implementation-era docs (`docs/debug-surface/BRIEF.md`, `DISPATCH.md`) are complete and historical; the workers' technical manual is `docs/debug-surface/DEBUG.md`.

## Mission

Use a pool of autonomous workers (up to 15 concurrent, ~100 dispatches/day) to run headless experiments against the antzoo simulation and return structured reports. Every claim reduces to `(seed, config, tick, observable)`. The operator reads reports and verdicts, never code. Worker confusion is a defect in this document or in DEBUG.md — the fix is always a doc patch plus redispatch, never per-worker coaching.

## Established baseline (Wave 0 + promoted Wave 1/Wave 2 facts, 50k tick budget)

- Accepted combined baseline (W0-A, W0-A2, W0-A3; seeds 1337-1456, n=120): player 94 victories / 24 collapses / 2 running, 78.3% win rate, SE 0.038. Decisive endings dominate, but `running` at 50k is a real outcome (2/120). W1-Z1 confirms at least one running case is an unwinnable zero-population stalemate.
- Ledger subsets (W0-C, W0-C2, W0-C3; seeds 1337-1351, n=15): player 12 victories / 3 collapses. These support flow-counter analysis but do not replace the combined baseline above.
- Mortality: starvation dominates both factions. Across accepted n=40 baseline batches, median starvation deaths/run range from player 168.5-183 and rival 136-142.5. Spider and combat remain noise.
- Starvation obituaries: across accepted n=40 baseline batches, player starvation median deliveries is 3 and rival starvation median deliveries is 0 in every accepted batch. Player median starvation age is roughly 9.70k-9.83k ticks; rival median starvation age is roughly 8.12k-9.51k ticks.
- Population: accepted n=40 baseline batches have player peak median 198-202.5 and rival peak median 165-166; final population medians are player 40-48 and rival 0.
- Scenario patching: W0-B-rerun patches `ant.drainPerSec` from default 1.2 to 1.5 for seeds 1337-1346. Patched final hashes differ from baseline for all 10 seeds, and repeated patched runs match per-seed final hashes exactly.
- Flow counters: W0-C/W0-C2/W0-C3 show `foodDelivered` is not conserved by `queenConsumed + broodConsumed + nestFood`; W0-C2/W0-C3 raw tables have 60/60 nonzero differences. Drain/snack ratios are roughly 5-6x for player and 12-14x for rival at rollup scale.
- Corrected nest-food ledger from W1-L1: for the audited probes, `startFood + foodDelivered - broodConsumed - refills * 0.5 - nestFood = 0`. `queenConsumed` currently reads 0 in those probes, so queen-consumption semantics remain a counter gap rather than a conserved ledger term.
- Drain response is non-linear. In accepted n=20 Wave 1 drain cells, 0.75× default drain (`ant.drainPerSec = 0.9`) produced 8/20 player wins plus one running outcome, while 1.25× default drain (`ant.drainPerSec = 1.5`) produced 20/20 player wins. Lower drain is not automatically safer.
- W2-M1 supports the drain mechanism as primarily economic/starvation rather than combat-driven. On seeds 2000-2004, `ant.drainPerSec = 0.9` produced 1/5 player wins while `ant.drainPerSec = 1.5` produced 5/5 player wins; combat deaths stayed single-digit and the meaningful movement was in starvation, brood, nest food, final population, and decisiveness.
- Caste composition is an interaction, not a one-axis worker-gap rule. Accepted Wave 2 cells found 70/60 worker shares at 14/20 player wins, 70/80 at 5/12 partial, 90/60 at 19/20, and 90/80 at 10/20. Absolute player capacity, rival capacity, and inter-faction gap all matter.
- Terrain matters, but tick-600 nearest-food distance alone is too weak to carry H1. In accepted W2-T1b-a/b second-half baseline seeds 2025-2049, player wins had median nearest-distance delta 62.49 and rival wins had median delta 71.35; the two huge negative deltas split outcomes (`seed=2028` rival win at -932.60, `seed=2038` player win at -915.36).
- Founding-wave depth is a live risk signal, not a hard scalar threshold. W1-F1 suggested a boundary between drops of 76 and 87, but accepted W2-F2a/b evidence had collapses at depths 87, 124, 127, 131, and 149, while victories survived depths up to 143. Depth must be paired with recovery, brood bank, terrain/food access, and rival pressure.
- Seed 1401 is a confirmed stalemate mechanism, not merely a slow game. W1-Z1 shows player population reaches zero at tick 47400 and remains zero through tick 60000 while `terminal` stays false. In `src/sim.ts`, the zero-population check is nested under `terminalTimer > 0`; once a faction has zero ants without entering that timer path, neither faction can ever win.
- Throughput/capacity: W0 reports show median ticks/sec in the ~188-238 range where reported, with inconsistent wall clocks and some report omissions. Use actual reported wall clock per worker/cell until capacity is remeasured cleanly.

Open hypotheses after wave 2: (H1) terrain still matters, but nearest-food distance needs richer early-delivery, food-cluster, obstruction, and pathing features; (H2) founding-wave collapse is a multi-factor recovery problem, with trough depth as one risk signal; (H3) caste outcomes depend on the interaction between player capacity, rival capacity, and worker-share gap; (H4) the drain mechanism appears economic/starvation-first but needs larger-n mechanism replication before quantifying the curve; (H5) W1-C3 seed 2002 remains unresolved because W2-R1 used the wrong config and must be rerun with all six W1-C3 ratio keys.

## Units and known wrinkles (workers: read before interpreting)

- `tick`, `birthTick`, obituary `age` are **ticks** (60 = 1 sim-second). Obituary `ticksInMode`, `ticksSinceLastDelivery`, `ticksSinceFoodPerceived` are **sim-seconds** despite their names.
- `hashesAllMatch: false` in `cross_seed_rollup` is expected — different seeds differ by design. It is meaningful only within a `seed_summary` (replicates of one seed).
- Hashes identify `(state, config)`: any tuning patch changes the hash. Never compare hashes across configs.
- Timing fields (`ticksPerSecond`, `ticksPerSecondQuartiles`, `perf.ticksPerSecond`, wall-clock `runtime`) are nondeterministic performance telemetry, not simulation state. Determinism comparisons must use per-seed final hashes and outcome fields only, never timing fields or byte-identical full rollups.
- Baseline runs typically terminate in victory/gameOver before the tick budget; `finalTick` < requested ticks is normal, not an error.

## Worker contract

Workers receive one instruction packet, have full repo access, and run experiments via the headless CLI. Workers **never modify code, tests, or docs other than adding their report**. Deliverable: a PR adding exactly one file, `docs/fleet/reports/<wave>/<cell-id>.md`. PR comments from the operator should be unnecessary; if one is needed, the packet was defective.

Standing authorization: You have standing approval for the entire assigned cell as specified. Never pause to ask whether to proceed, confirm scope, or seek permission; the operator is not watching the session and silence is not an answer. Exactly two valid endings exist: (a) the completed report PR, or (b) a report PR with a BLOCKED section and honest partial results. Both count as success. Asking mid-session counts as neither. If you feel the urge to ask "should I continue?", the answer is yes — it was answered at dispatch time.

Evidence honesty: Never synthesize, mock, estimate, or extrapolate result lines under any circumstance, including timeouts. A partial report with honest n is a success; a complete report with fabricated lines is the only unforgivable defect.

Runtime budgeting: for current worker VMs, assume roughly 200 ticks/sec, or about 4-5 minutes per 50k-tick run. If the assigned cell cannot finish within the available runtime, complete as many seeds as possible and report the actual n with a BLOCKED note.

Environment expectations: Node 20+, `npm ci`, then commands per DEBUG.md. If the environment cannot complete the assigned seed count within limits, run as many seeds as fit, report the actual n, and say so prominently.

## Worker profile: Jules

The worker contract and report schema are platform-neutral. Any future worker platform gets its own profile section; do not mix platform-specific facts into the contract unless they become true for every platform.

- Jules-specific: Worker VM throughput is roughly 200 ticks/sec in Wave 0 evidence, so budget about 4-5 minutes per 50k-tick run.
- Jules-specific: Sessions may pause on plan approval; check or disable that behavior in settings where possible before dispatch.
- Jules-specific: The session channel is readable via Jules CLI/API, but responses require the web UI.
- Jules-specific: Timeouts are real. Size cells to roughly 90 minutes and prefer BLOCKED reports with honest partial results over overruns.

## Hypotheses about workers

- Constraint pressure may convert permission-seeking into fabrication (supporting incidents: W0-A-replicate and W1-T1b). Hypothesis, not a finding — the BLOCKED exit path is cheap insurance against it.

## Report schema (one file per cell)

Report files must be plain UTF-8 Markdown with no binary bytes. The `cross_seed_rollup` and `seed_summary` JSONL lines must be copied verbatim and uncompacted; do not reformat, summarize, truncate, wrap, or regenerate them.

```markdown
# Cell <cell-id> — <one-line description>
- command: <exact command(s) run, copy-pasteable>
- config: <every patched tuning key with absolute value AND the default it replaced>
- seeds: <list>  n=<count>
- runtime: <wall clock>

## Results (verbatim)
<cross_seed_rollup line copied verbatim and uncompacted>
<all seed_summary lines copied verbatim and uncompacted>

## Reading
- win_rate: x/n (player), with note if any run hit the tick budget still "running"
- vs baseline: deathsByCause medians, obituary medians (deliveries, ticksSinceFoodPerceived), peak/final population — only the deltas that matter
- anomalies: each as (seed, tick, field, observed, expected)

## Verdict
<one sentence answering the cell's question>
Confidence: <high/medium/low> — <why, in one clause>
```

Rejection criteria (operator side): prose claims without verbatim rollup lines; compacted or regenerated result JSONL; binary bytes; patched keys without recorded defaults; claims missing (seed, tick) citations; missing n.

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
| W0-A | True baseline win rate | Baseline config, seeds 1337–1376 (n=40), 50k ticks. Report win rate ±SE, outcome/terminal patterns, and whether legacy seeds 1337-1341 replicate the historical 5-seed anchor. |
| W0-B | Does the sweep mechanism work? | Verify `--seeds` composes with `--scenario` and `patchTuning`: run seeds 1337–1346 with a scenario patching `ant.drainPerSec` to 1.25× default. Confirm tuning applied (hash differs from baseline per seed; report the patched/default values), rollup well-formed, and replicate determinism by showing repeated patched runs have identical per-seed final hashes and non-performance outcome fields. Timing fields may differ. |
| W0-C | Do the flow counters reconcile? | Seeds 1337–1341, `--sample-every 600`. From snapshots: does cumulative foodDelivered ≈ queenConsumed + broodConsumed (+ nestFood residual ~0)? Does drainTotal vs snackEnergyGained show the deficit? Report the ledger at 3 ticks per seed. Also report wall-clock per run (fleet capacity planning). |

Wave 0 is also worker calibration: completion rate, report-schema compliance, and runtime are findings about the fleet itself.

## Wave 1 — the science (complete; findings in `docs/fleet/findings/wave1.md`)

Tick budget 50k unless stated. For W1-D* and W1-C* cells, use n=20 fresh seeds 2000-2019 unless their dispatch says otherwise.

Dispatch comparison baseline: seeds 1337-1456, n=120, player 94 victories / 24 collapses / 2 running, 78.3% win rate, SE 0.038. Use the per-report rollup medians in `docs/fleet/findings/wave0.md` when a cell needs detailed mortality, population, or flow comparisons.

| Cell | Question | Spec |
|---|---|---|
| W1-D1..D6 | Collapse boundary vs energy drain | `ant.drainPerSec` at 0.75×, 0.9×, 1.0×, 1.1×, 1.25×, 1.5× default (one cell each). Output: win rate, starvation share, median starvation age per level. |
| W1-T1a | Terrain luck (H1), first half | Baseline config, seeds 2000-2024 (n=25), `--sample-every 600`. Join per-seed outcome against tick-600 `food.nearestDistanceByFaction`. Report the relationship (table + direction + rough effect size); no code changes — analysis in the report. |
| W1-T1b | Terrain luck (H1), second half | Baseline config, seeds 2025-2049 (n=25), `--sample-every 600`. Same spec as W1-T1a. |
| W1-C1..C3 | Caste composition (H3) | Worker share at low / default / high (locate the ratio keys in `TUNING.caste`; record keys + defaults). Watch rival and player starvation `medianDeliveries` and win rate move. |
| W1-F1 | Founding cohort wave (H2) | Baseline, seeds 2000–2009, `--sample-every 300`. Population time series 6k–14k ticks per seed: is there a synchronized die-off? Report wave timing, depth, and whether depth correlates with outcome. |
| W1-Z1 | Running/zombie state probe | Rerun baseline seed 1401 to 60k ticks with `--sample-every 600`. Over the final 20k ticks, report population, queenHunger, terminal flags, brood, and nestFood for both factions. Answer whether a zero-population faction can persist indefinitely without `gameOver`, and identify by reading `src/sim.ts` (no code changes) which condition fails to fire. |
| W1-L1 | Ledger semantics | By reading `src/sim.ts`, enumerate every mutation site of `nestFood` and every flow counter. Then reconcile seed 1344 tick 1800 (player) and seed 1351 tick 1200 (rival) exactly, explaining each counter's true meaning. Report a corrected ledger definition suitable for FLEET.md; no code changes. |

## Wave 2 — mechanism and boundary map

Tick budget 50k unless stated. No dispatch cell may exceed 20 seeds; split larger designs into sub-cells and synthesize across the sub-cells after acceptance. The replication spot-check in the synthesis procedure applies to every accepted Wave 2 report.

| Cell | Question | Spec |
|---|---|---|
| W2-M1 | Drain mechanism | Seeds 2000-2004 at `ant.drainPerSec = 0.9` and `ant.drainPerSec = 1.5`, `--sample-every 300`. Report population, brood, nestFood, combat-death-share, and danger-field time series. Verdict: does the drain response look like an economic regime shift, a military/combat regime shift, or both? |
| W2-X1 | Caste 2x2 de-confound: low gap, lower level | Player worker share 70 / rival worker share 60; soldiers and nurses split each faction's remaining share evenly. Seeds 2100-2119 (n=20). Report win rate, starvation-delivery medians, starvation deaths, peak/final population, and whether the inter-faction gap or absolute worker level better explains outcome. |
| W2-X2 | Caste 2x2 de-confound: rival high | Player worker share 70 / rival worker share 80; soldiers and nurses split each faction's remaining share evenly. Seeds 2100-2119 (n=20). Same outputs as W2-X1. |
| W2-X3 | Caste 2x2 de-confound: player high | Player worker share 90 / rival worker share 60; soldiers and nurses split each faction's remaining share evenly. Seeds 2100-2119 (n=20). Same outputs as W2-X1. |
| W2-X4 | Caste 2x2 de-confound: higher level, same gap | Player worker share 90 / rival worker share 80; soldiers and nurses split each faction's remaining share evenly. Seeds 2100-2119 (n=20). Same outputs as W2-X1. |
| W2-T1b-a | Terrain luck (H1), second half part A | Baseline config, seeds 2025-2036 (n=12), `--sample-every 600`. Same analysis as W1-T1a: join per-seed outcome against tick-600 `food.nearestDistanceByFaction`. Verbatim JSONL is required; regenerated or synthetic-looking rollups are rejection. |
| W2-T1b-b | Terrain luck (H1), second half part B | Baseline config, seeds 2037-2049 (n=13), `--sample-every 600`. Same outputs and rejection standard as W2-T1b-a. |
| W2-F2a | Founding-wave threshold, first half | Baseline config, seeds 2050-2069 (n=20), `--sample-every 300`. Model peak tick, trough tick, trough depth, brood bank, and outcome; locate the survival/collapse boundary between observed depths 76 and 87. |
| W2-F2b | Founding-wave threshold, second half | Baseline config, seeds 2070-2089 (n=20), `--sample-every 300`. Same outputs as W2-F2a. |
| W2-R1 | High-worker running trace | Re-run W1-C3 seed 2002 with the same player 90 / rival 80 worker-share config to 60000 ticks, `--sample-every 600`. The W1-C3 report had player 13 / rival 89 at the 50k budget. Answer whether this is the same zero-pop stalemate class as seed 1401 or merely slow. |

## Authorized build dispatches

- W1-Z1 terminal-state fix is AUTHORIZED pending a build dispatch. Required gates: seed 1337 final hash identical before/after; seed 1401 terminates with before/after evidence at ticks 47400-60000; 120-seed baseline rerun changes outcome only on the two previously running seeds, with all other final hashes identical.

## Synthesis procedure (operator)

1. Before dispatching a wave, enforce the cell-size ceiling: no cell above 20 seeds. Split larger designs into named sub-cells, each with its own one-file report.
2. Merge report PRs (markdown-only; safe to merge unread, then read the reports).
3. Reject any report failing the rejection criteria — redispatch the cell with the same packet; if a second worker fails the same way, the schema or manifest is defective: patch FLEET.md.
4. Before accepting a report into synthesis, re-run one randomly chosen seed from that report with the reported config and compare the final hash. Record the seed, command/config, reported final hash, and observed final hash in the findings doc. A hash mismatch is fabrication and rejects the report. Ignore nondeterministic timing telemetry.
5. One synthesis pass per wave (a fresh agent session pointed at `docs/fleet/reports/<wave>/`, or the operator's own read): confirmed findings, killed hypotheses, anomalies worth a trace probe, next-wave candidates. Write to `docs/fleet/findings/<wave>.md`.
6. Promote durable facts into the "Established baseline" section above. Promote recurring worker friction into DEBUG.md or harness change requests.

## Program metrics (per wave)

- Judgment rounds per dispatch: operator supplied a decision or fact missing from the packet, through any channel. Target 0; each one is a compiled-judgment defect.
- Ceremony rounds per dispatch: proceed/ack-only interactions, through any channel. Target 0; each one is dispatch friction, not scientific work.
- Audit source: PR-channel data is auditable via `gh`; session-channel data is auditable read-only via the Jules CLI/API, with an operator tally as fallback. Each wave's findings doc must include a one-line tally for both counters and the channel each was measured on.
- Report acceptance rate on first submission.
- Novel findings per cell (vs duplicates/noise).

## Out of scope until the boundary map exists

Browser-based legibility testing (the bridge is ready; the program is deferred), broad decision-trace waves beyond the specific W2 probes, and gameplay or balance changes other than the authorized W1-Z1 terminal-state fix — this program measures; it does not tune without explicit authorization.
