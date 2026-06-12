# antzoo fleet program

**Status: ACTIVE.** This is the operating document for the experiment fleet. Commit at `docs/fleet/FLEET.md`. The implementation-era docs (`docs/debug-surface/BRIEF.md`, `DISPATCH.md`) are complete and historical; the workers' technical manual is `docs/debug-surface/DEBUG.md`.

## Mission

Use a pool of autonomous workers (up to 15 concurrent, ~100 dispatches/day) to run headless experiments against the antzoo simulation and return structured reports. Every claim reduces to `(seed, config, tick, observable)`. The operator reads reports and verdicts, never code. Worker confusion is a defect in this document or in DEBUG.md — the fix is always a doc patch plus redispatch, never per-worker coaching.

## Established baseline (Wave 0, 50k tick budget)

- Accepted combined baseline (W0-A, W0-A2, W0-A3; seeds 1337-1456, n=120): player 94 victories / 24 collapses / 2 running, 78.3% win rate, SE 0.038. Decisive endings dominate, but `running` at 50k is a real outcome (2/120) and is under investigation as a possible unwinnable zombie state in W1-Z1.
- Ledger subsets (W0-C, W0-C2, W0-C3; seeds 1337-1351, n=15): player 12 victories / 3 collapses. These support flow-counter analysis but do not replace the combined baseline above.
- Mortality: starvation dominates both factions. Across accepted n=40 baseline batches, median starvation deaths/run range from player 168.5-183 and rival 136-142.5. Spider and combat remain noise.
- Starvation obituaries: across accepted n=40 baseline batches, player starvation median deliveries is 3 and rival starvation median deliveries is 0 in every accepted batch. Player median starvation age is roughly 9.70k-9.83k ticks; rival median starvation age is roughly 8.12k-9.51k ticks.
- Population: accepted n=40 baseline batches have player peak median 198-202.5 and rival peak median 165-166; final population medians are player 40-48 and rival 0.
- Scenario patching: W0-B-rerun patches `ant.drainPerSec` from default 1.2 to 1.5 for seeds 1337-1346. Patched final hashes differ from baseline for all 10 seeds, and repeated patched runs match per-seed final hashes exactly.
- Flow counters: W0-C/W0-C2/W0-C3 show `foodDelivered` is not conserved by `queenConsumed + broodConsumed + nestFood`; W0-C2/W0-C3 raw tables have 60/60 nonzero differences. Drain/snack ratios are roughly 5-6x for player and 12-14x for rival at rollup scale.
- Throughput/capacity: W0 reports show median ticks/sec in the ~188-238 range where reported, with inconsistent wall clocks and some report omissions. Use actual reported wall clock per worker/cell until capacity is remeasured cleanly.

Open hypotheses for wave 1: (H1) early nearest-food distance per faction predicts the winner ("terrain luck"); (H2) the founding cohort dies as a synchronized wave near tick 10k and survival depends on brood banked before it; (H3) workforce composition (worker share) is the live causal lever behind the rival's zero-delivery starvation. Trace probes before broader decision-trace waves: seed 1401's `running` state at tick 50000, and the flow-counter semantic mismatch.

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

- Constraint pressure may convert permission-seeking into fabrication (one supporting incident: W0-A-replicate). Hypothesis, not a finding — the BLOCKED exit path is cheap insurance against it.

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

## Wave 1 — the science (dispatch after wave 0 reports are read; ~14 cells)

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

## Synthesis procedure (operator)

1. Merge report PRs (markdown-only; safe to merge unread, then read the reports).
2. Reject any report failing the rejection criteria — redispatch the cell with the same packet; if a second worker fails the same way, the schema or manifest is defective: patch FLEET.md.
3. One synthesis pass per wave (a fresh agent session pointed at `docs/fleet/reports/<wave>/`, or the operator's own read): confirmed findings, killed hypotheses, anomalies worth a trace probe, next-wave candidates. Write to `docs/fleet/findings/<wave>.md`.
4. Promote durable facts into the "Established baseline" section above. Promote recurring worker friction into DEBUG.md or harness change requests.

## Program metrics (per wave)

- Judgment rounds per dispatch: operator supplied a decision or fact missing from the packet, through any channel. Target 0; each one is a compiled-judgment defect.
- Ceremony rounds per dispatch: proceed/ack-only interactions, through any channel. Target 0; each one is dispatch friction, not scientific work.
- Audit source: PR-channel data is auditable via `gh`; session-channel data is auditable read-only via the Jules CLI/API, with an operator tally as fallback. Each wave's findings doc must include a one-line tally for both counters and the channel each was measured on.
- Report acceptance rate on first submission.
- Novel findings per cell (vs duplicates/noise).

## Out of scope until the boundary map exists

Browser-based legibility testing (the bridge is ready; the program is deferred), decision-trace waves (second-line probes, triggered by anomalies from wave 1, not scheduled speculatively), and any gameplay or balance changes — this program measures; it does not yet tune.
