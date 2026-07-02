# antzoo fleet program

**Status: ACTIVE - knowledge-spending era.** This is the operating document for the experiment fleet. Commit at `docs/fleet/FLEET.md`. The implementation-era docs (`docs/debug-surface/BRIEF.md`, `DISPATCH.md`) are complete and historical; the workers' technical manual is `docs/debug-surface/DEBUG.md`.

## Mission

Use bounded evidence loops to make Antzoo more playable and more knowable. The current loop is: repo finding -> proposed intervention -> controlled change -> verification -> human-visible effect. Every claim reduces to `(seed, config, tick, observable)`. The operator reads reports and verdicts, never code. Worker confusion is a defect in this document or in DEBUG.md - the fix is always a doc patch plus redispatch, never per-worker coaching.

Measurement-era work accumulates findings: a report, synthesis, or baseline audit that changes what the repo believes. Knowledge-spending-era work spends findings: it proposes a concrete intervention, changes only the authorized surface, verifies the change against controlled evidence, and names what a player or viewer should feel or see. Docs and reports alone do not count as game improvement; they are useful only when they make the next controlled game change auditable.

Runtime terms are platform-neutral. "Fleet", "worker", and "dispatch" mean a bounded evidence-loop cell with a task, command, evidence artifact, honest BLOCKED path, and verifier spot-check. Jules/fleet.ms are historical implementations, not dependencies. Do not create orchestration infrastructure, dashboards, schedulers, worker registries, or fleet-management software.

## Established baseline (baseline v2 + promoted Wave 1/Wave 2 facts, 50k tick budget)

- Current baseline v2 (post-W1-Z1-fix; seeds 1337-1456, n=120, 50k ticks): player 94 victories / 25 collapses / 1 running, 78.3% win rate. Use this for current default-config comparisons. Evidence: `docs/plan-goals/01-baseline-v2/evidence/baseline-v2/baseline-v2-1337-1456.jsonl` and `docs/plan-goals/01-baseline-v2/evidence/baseline-v2/baseline-v2-summary.md`.
- Historical Wave 0 combined baseline (W0-A, W0-A2, W0-A3; same seeds, n=120) was player 94 victories / 24 collapses / 2 running. It is now historical, not the current comparison baseline.
- Baseline v2 leaves one 50k-budget running seed: seed 1355, with player population 1, rival population 57, and final hash `bd357fd9cfd137d9`. This is not the seed-1401 zero-population stalemate class.
- The W1-Z1 fix did not produce a byte-for-byte final-hash match for every non-running Wave 0 seed. Final hashes differ for seeds 1369, 1401, 1417, 1453, and 1455. Only seed 1401 changes the historical batch-level outcome count. Treat these as real baseline-v2 differences unless a later audit proves a historical-report artifact.
- Ledger subsets (W0-C, W0-C2, W0-C3; seeds 1337-1351, n=15): player 12 victories / 3 collapses. These support flow-counter analysis but do not replace the combined baseline above.
- Baseline v2 mortality: starvation still dominates both factions. Median starvation deaths/run are player 174 and rival 140.5; spider and combat remain noise.
- Baseline v2 starvation obituaries: player starvation median deliveries is 3 and rival starvation median deliveries is 0. Player starvation median age is 9,774 ticks; rival starvation median age is 9,305.75 ticks.
- Baseline v2 population: player peak median is 199 and rival peak median is 165; final population medians are player 45 and rival 0.
- Scenario patching: W0-B-rerun patches `ant.drainPerSec` from default 1.2 to 1.5 for seeds 1337-1346. Patched final hashes differ from baseline for all 10 seeds, and repeated patched runs match per-seed final hashes exactly.
- Flow counters: W0-C/W0-C2/W0-C3 show `foodDelivered` is not conserved by `queenConsumed + broodConsumed + nestFood`; W0-C2/W0-C3 raw tables have 60/60 nonzero differences. Drain/snack ratios are roughly 5-6x for player and 12-14x for rival at rollup scale.
- Corrected nest-food ledger from W1-L1: for the audited probes, `startFood + foodDelivered - broodConsumed - refills * 0.5 - nestFood = 0`. `queenConsumed` currently reads 0 in those probes, so queen-consumption semantics remain a counter gap rather than a conserved ledger term.
- Drain response is non-linear. In accepted n=20 Wave 1 drain cells, 0.75× default drain (`ant.drainPerSec = 0.9`) produced 8/20 player wins plus one running outcome, while 1.25× default drain (`ant.drainPerSec = 1.5`) produced 20/20 player wins. Lower drain is not automatically safer.
- W2-M1 supports the drain mechanism as primarily economic/starvation rather than combat-driven. On seeds 2000-2004, `ant.drainPerSec = 0.9` produced 1/5 player wins while `ant.drainPerSec = 1.5` produced 5/5 player wins; combat deaths stayed single-digit and the meaningful movement was in starvation, brood, nest food, final population, and decisiveness.
- Caste composition is an interaction, not a one-axis worker-gap rule. Accepted Wave 2 cells found 70/60 worker shares at 14/20 player wins, 70/80 at 5/12 partial, 90/60 at 19/20, and 90/80 at 10/20. Absolute player capacity, rival capacity, and inter-faction gap all matter.
- Terrain matters, but tick-600 nearest-food distance alone is too weak to carry H1. In accepted W2-T1b-a/b second-half baseline seeds 2025-2049, player wins had median nearest-distance delta 62.49 and rival wins had median delta 71.35; the two huge negative deltas split outcomes (`seed=2028` rival win at -932.60, `seed=2038` player win at -915.36).
- Founding-wave depth is a live risk signal, not a hard scalar threshold. W1-F1 suggested a boundary between drops of 76 and 87, but accepted W2-F2a/b evidence had collapses at depths 87, 124, 127, 131, and 149, while victories survived depths up to 143. Depth must be paired with recovery, brood bank, terrain/food access, and rival pressure.
- Seed 1401 was a confirmed stalemate mechanism, not merely a slow game. W1-Z1 showed player population reaching zero at tick 47400 and remaining zero through tick 60000 while `terminal` stayed false. The landed W1-Z1 fix now makes the same seed terminate at tick 46872 with player `gameOver` and rival `victory`. Evidence: `docs/fleet/findings/w1z1-fix-gates.md`.
- Throughput/capacity: W0 reports show median ticks/sec in the ~188-238 range where reported, with inconsistent wall clocks and some report omissions. Use actual reported wall clock per worker/cell until capacity is remeasured cleanly.

Open hypotheses after wave 2: (H1) terrain still matters, but nearest-food distance needs richer early-delivery, food-cluster, obstruction, and pathing features; (H2) founding-wave collapse is a multi-factor recovery problem, with trough depth as one risk signal; (H3) caste outcomes depend on the interaction between player capacity, rival capacity, and worker-share gap; (H4) the drain mechanism appears economic/starvation-first but needs larger-n mechanism replication before quantifying the curve; (H5) W1-C3 seed 2002 remains unresolved because W2-R1 used the wrong config and must be rerun with all six W1-C3 ratio keys.

## Units and known wrinkles (workers: read before interpreting)

- `tick`, `birthTick`, obituary `age` are **ticks** (60 = 1 sim-second). Obituary `ticksInMode`, `ticksSinceLastDelivery`, `ticksSinceFoodPerceived` are **sim-seconds** despite their names.
- `hashesAllMatch: false` in `cross_seed_rollup` is expected — different seeds differ by design. It is meaningful only within a `seed_summary` (replicates of one seed).
- Hashes identify `(state, config)`: any tuning patch changes the hash. Never compare hashes across configs.
- Timing fields (`ticksPerSecond`, `ticksPerSecondQuartiles`, `perf.ticksPerSecond`, wall-clock `runtime`) are nondeterministic performance telemetry, not simulation state. Determinism comparisons must use per-seed final hashes and outcome fields only, never timing fields or byte-identical full rollups.
- Baseline runs typically terminate in victory/gameOver before the tick budget; `finalTick` < requested ticks is normal, not an error.

## Worker contract

Workers receive one instruction packet, have full repo access, and run experiments via the headless CLI. A report cell **never modifies code, tests, scenarios, tuning, historical reports, or docs other than adding its report and its raw artifacts**. Deliverable: a PR adding `docs/fleet/reports/<wave>/<cell-id>.md` plus any raw result files required by the report schema under `docs/fleet/artifacts/<wave>/<cell-id>/`. PR comments from the operator should be unnecessary; if one is needed, the packet was defective.

Repo-builder goals are different from report cells. They may edit authorized repo files only when a checked-in plan or manifest names the allowed files, the validation gates, and the rollback or BLOCKED path. A report cell can recommend an intervention; it cannot spend the knowledge by changing the game.

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

## Report schema v2 (one concise report plus raw artifacts)

Report files must be plain UTF-8 Markdown with no binary bytes. Keep the report to two readable pages when possible. Raw result JSONL belongs in gzip-compressed artifacts under `docs/fleet/artifacts/<wave>/<cell-id>/`; list every artifact's SHA-256 in the report. The fabrication tripwire is the per-seed final-hash table plus the mandatory replication spot-check, not large pasted JSONL blocks. One small `cross_seed_rollup` line may be copied into the report when it clarifies the reading; `seed_summary` lines should live in the raw artifacts.

```markdown
# Cell <cell-id> - <one-line description>

- command: <exact command(s) run, copy-pasteable>
- seeds: <list>  n=<count>
- runtime: <wall clock>

## Config

| Key | Default | Value used | Why |
|---|---:|---:|---|
| <tuning key> | <default> | <new or default> | <one phrase> |

For any caste-ratio config, list all companion ratio keys for that faction. Do not report only `workerRatio`; ratios are relative weights.

## Artifacts

| Artifact | SHA-256 | Contents |
|---|---|---|
| docs/fleet/artifacts/<wave>/<cell-id>/<name>.jsonl.gz | <sha256> | raw CLI JSONL for <condition> |

## Per-seed results

| Seed | Condition | Outcome | Final tick | Final hash | Wave metrics |
|---:|---|---|---:|---|---|
| <seed> | <unattended/rescue/config> | <player victory/collapse/running> | <tick> | <hash> | <cell-specific values> |

## Reading

- win_rate: x/n (player), with note if any run hit the tick budget still "running"
- vs baseline v2: only the deaths, obituary, peak/final population, flow, or wave-specific deltas that matter
- anomalies: each as (seed, tick, field, observed, expected)
- spending implication: what intervention this supports, rejects, or leaves ambiguous

## Verdict

<one sentence answering the cell's question>
Confidence: <high/medium/low> - <why, in one clause>
```

Rejection criteria (operator side): prose claims without per-seed final hashes; missing or mismatched raw artifact SHA-256; compacted, regenerated, or synthetic-looking result data; binary bytes in the report; patched keys without recorded defaults; caste configs missing companion ratio keys; claims missing `(seed, tick, field)` citations; missing n.

## Dispatch template

Before sending a dispatch, replace every angle-bracket placeholder. Wave slugs are lowercase `wave<number>` (`wave0`, `wave1`, ...). Never send a worker a prompt containing `<CELL-ID>`, `<wave>`, or any other unresolved placeholder.

```
Read docs/fleet/FLEET.md and docs/debug-surface/DEBUG.md in full. You are
running cell <CELL-ID> from the wave manifest in FLEET.md. Execute exactly
that cell: its config, its seeds, its tick budget. Produce a PR adding only
docs/fleet/reports/<wave>/<CELL-ID>.md and raw artifacts under
docs/fleet/artifacts/<wave>/<CELL-ID>/, following report schema v2 in
FLEET.md exactly. Do not modify any other file. If a tuning key named in the
manifest does not exist verbatim, locate the real key in src/tuning.ts that
implements the stated intent, use it, and record both the key and its default
in your report. If a caste ratio changes, record all companion ratio keys.
Every claim cites (seed, tick, field). If anything blocks you, write the
report anyway with what you have and a BLOCKED section.
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

Historical Wave 1 dispatch comparison baseline (pre-W1-Z1-fix): seeds 1337-1456, n=120, player 94 victories / 24 collapses / 2 running, 78.3% win rate, SE 0.038. It is historical context only; current comparisons use baseline v2 above. Use the per-report rollup medians in `docs/fleet/findings/wave0.md` only when a historical Wave 1 cell needs detailed mortality, population, or flow comparisons.

| Cell | Question | Spec |
|---|---|---|
| W1-D1..D6 | Collapse boundary vs energy drain | `ant.drainPerSec` at 0.75×, 0.9×, 1.0×, 1.1×, 1.25×, 1.5× default (one cell each). Output: win rate, starvation share, median starvation age per level. |
| W1-T1a | Terrain luck (H1), first half | Baseline config, seeds 2000-2024 (n=25), `--sample-every 600`. Join per-seed outcome against tick-600 `food.nearestDistanceByFaction`. Report the relationship (table + direction + rough effect size); no code changes — analysis in the report. |
| W1-T1b | Terrain luck (H1), second half | Baseline config, seeds 2025-2049 (n=25), `--sample-every 600`. Same spec as W1-T1a. |
| W1-C1..C3 | Caste composition (H3) | Worker share at low / default / high (locate the ratio keys in `TUNING.caste`; record keys + defaults). Watch rival and player starvation `medianDeliveries` and win rate move. |
| W1-F1 | Founding cohort wave (H2) | Baseline, seeds 2000–2009, `--sample-every 300`. Population time series 6k–14k ticks per seed: is there a synchronized die-off? Report wave timing, depth, and whether depth correlates with outcome. |
| W1-Z1 | Running/zombie state probe | Rerun baseline seed 1401 to 60k ticks with `--sample-every 600`. Over the final 20k ticks, report population, queenHunger, terminal flags, brood, and nestFood for both factions. Answer whether a zero-population faction can persist indefinitely without `gameOver`, and identify by reading `src/sim.ts` (no code changes) which condition fails to fire. |
| W1-L1 | Ledger semantics | By reading `src/sim.ts`, enumerate every mutation site of `nestFood` and every flow counter. Then reconcile seed 1344 tick 1800 (player) and seed 1351 tick 1200 (rival) exactly, explaining each counter's true meaning. Report a corrected ledger definition suitable for FLEET.md; no code changes. |

## Wave 2 — mechanism and boundary map (complete; findings in `docs/fleet/findings/wave2.md`)

Historical dispatch manifest below. Tick budget 50k unless stated. No dispatch cell may exceed 20 seeds; split larger designs into sub-cells and synthesize across the sub-cells after acceptance. The replication spot-check in the synthesis procedure applies to every accepted Wave 2 report.

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

## Wave 3 - The God Matters (authorized spending-era manifest)

Wave 3 spends the Wave 1/Wave 2 findings on the first agency intervention. The goal is not "more reports"; the goal is a controlled tuning candidate that makes neglect riskier, makes competent rescue matter, preserves determinism, and produces a human-visible effect.

Target metric: `AgencyDelta = WinRate(scripted rescue protocol) - WinRate(unattended)`. A final candidate is acceptable only if held-out evidence shows unattended player wins in the 55-65% band, scripted-rescue player wins at least 85%, median `finalTick` within 20% of baseline v2, `running` outcomes no worse than baseline v2, and unattended rival final-population median above 0. Human play sign-off is required before changing default tuning values.

Intervention-claim rule: no intervention claim counts unless it beats a placebo or null perturbation on paired per-seed analysis, with mechanism deltas reported. Raw win-rate deltas alone are insufficient in a chaotic deterministic simulation. Future intervention cells must report paired flips, mechanism deltas, and a placebo/null comparison whenever the intervention itself perturbs trajectory; headline win rate is only one column in the synthesis, not the synthesis.

Seed ledger:

| Range | Status | Rule |
|---|---|---|
| 1337-1456 | Burned by Wave 0 and baseline v2 | Historical proof and baseline comparison only. |
| 2000-2119 | Burned by Wave 1/Wave 2 | Replication, diagnostics, and historical proof only. |
| 3000-3049 | Wave 3 tuning | Use for candidate discovery and confirmation; no cell may use more than 20 seeds. |
| 4000-4049 | Wave 3 held-out | Final candidate only, touched exactly once, split into sub-cells of at most 20 seeds. |
| 4050-4099 | Fallback held-out | Use only if a second final candidate is explicitly authorized after recording the first held-out result. |

Rescue protocol: use a stimulus-only scenario with no tuning changes and no assertions. The current player nest is derived from source as `(TUNING.world.w * 0.5, TUNING.world.h * 0.5) = (2048, 1152)`. The rescue arm applies `food` at tick 6000 to `(1928, 1152)`, `lure` at tick 9000 to `(2048, 1032)`, and `food` at tick 12000 to `(2168, 1152)`. These coordinates are near the player nest during the documented founding trough window. The unattended arm runs the same seed/config with no scenario. Goal 03 may commit the reusable scenario file; until then, runners may supply an equivalent temporary scenario and must record it in the report artifact.

Candidate tuning uses scenario/CLI patching first. Default tuning values may change only after final held-out acceptance, `npm test`, and Drew's play sign-off. Candidate cells must report both unattended and rescue arms with the same seeds and config.

| Cell | Purpose | Seeds | Config | Required wave metrics |
|---|---|---|---|---|
| W3-A0 | Baseline agency anchor | 3000-3019 | Default config | AgencyDelta, outcome, finalTick, finalHash, player/rival final population, player/rival peak population, starvation deaths, starvation median deliveries, and any running seed. |
| W3-R75 | Stronger rival candidate | 3000-3019 | `rival.workerRatio` 60 -> 75, `rival.soldierRatio` 20 -> 12.5, `rival.nurseRatio` 20 -> 12.5; player ratios remain default 80/10/10. The 75/12.5/12.5 tuple preserves total relative weight 100 and splits the non-worker remainder evenly to isolate rival worker capacity. | Same as W3-A0, plus rival deliveries and whether the rival visibly remains contested rather than hollow. |
| W3-D110 | Drain-pressure candidate | 3000-3019 | `ant.drainPerSec` 1.2 -> 1.32 | Same as W3-A0, plus starvation timing and whether rescue still reverses the trough. |
| W3-R75-D110 | Combined candidate | 3000-3019 | W3-R75 tuple plus `ant.drainPerSec` 1.32 | Same as W3-A0, plus whether combined pressure becomes punishing rather than dramatic. |
| W3-CF1 / W3-CF2 | Confirmation for at most two candidates chosen after first synthesis | 3020-3039 | Exact selected candidate config(s), unchanged | Same metrics as the selected candidate; this is confirmation, not redesign. |
| W3-TB | Optional tie-break only if synthesis records an ambiguity | 3040-3049 | One exact config named by synthesis | Minimal decisive metrics named by synthesis; do not use this as a hidden iteration loop. |
| W3-HO-A / W3-HO-B / W3-HO-C | Final held-out acceptance | 4000-4019, 4020-4039, 4040-4049 | One final candidate only | Same metrics as candidate cells, plus acceptance/failure call against the target bands. |

Caste-ratio guardrail: any future caste-ratio config must specify every ratio key for the affected faction, not just `workerRatio`. W2-R1 was rejected because "same worker-share config" left companion ratios ambiguous. For a rival 75% worker target, the authorized tuple is `rival.workerRatio=75`, `rival.soldierRatio=12.5`, `rival.nurseRatio=12.5` unless a later manifest update records a different full tuple and why.

Failure criteria: no config hits both unattended and rescue target bands; held-out results deviate by more than 15 percentage points from tuning evidence; rescue becomes the only viable path to victory with unattended wins below 40%; running outcomes increase above baseline v2; or the visual play read says the change is less charming even if the metric moves. Stop and synthesize the failure rather than iterating silently.

## Build dispatch history

- W1-Z1 terminal-state fix is landed and closed out. Gate evidence: seed 1337 remains unchanged at final hash `5101d7c52c007c01`; seed 1401 now terminates at tick 46872 instead of running through 60000; baseline v2 is recorded for seeds 1337-1456. The stricter planned hash gate did not fully hold: five final hashes differ from Wave 0 rollups, while only seed 1401 changes the historical batch-level outcome count. Evidence: `docs/fleet/findings/w1z1-fix-gates.md`.

## Synthesis procedure (operator)

1. Before dispatching a wave, enforce the cell-size ceiling: no cell above 20 seeds. Split larger designs into named sub-cells, each with its own concise report and raw artifacts.
2. Merge report PRs only when they are report/artifact changes matching the manifest. Repo-builder goals use their own checked-in plan and gates.
3. Reject any report failing the rejection criteria — redispatch the cell with the same packet; if a second worker fails the same way, the schema or manifest is defective: patch FLEET.md.
4. Before accepting a report into synthesis, re-run one randomly chosen seed from that report with the reported config and compare the final hash. Record the seed, command/config, reported final hash, and observed final hash in the findings doc. A hash mismatch is fabrication and rejects the report. Ignore nondeterministic timing telemetry.
5. One synthesis pass per wave (a fresh agent session pointed at `docs/fleet/reports/<wave>/` and `docs/fleet/artifacts/<wave>/`, or the operator's own read): confirmed findings, killed hypotheses, anomalies worth a trace probe, and the next proposed intervention or an honest stop. Write to `docs/fleet/findings/<wave>.md`.
6. Promote durable facts into the "Established baseline" section above. Promote recurring worker friction into DEBUG.md or harness change requests. Promote game changes only after controlled verification and human-visible effect, not merely because a report exists.
7. Mark the synthesized wave section complete and link its findings doc; leave its manifest table as the historical dispatch record.

## Program metrics (per wave)

- Judgment rounds per dispatch: operator supplied a decision or fact missing from the packet, through any channel. Target 0; each one is a compiled-judgment defect.
- Ceremony rounds per dispatch: proceed/ack-only interactions, through any channel. Target 0; each one is dispatch friction, not scientific work.
- Audit source: PR-channel data is auditable via `gh`; session-channel data is auditable read-only via the Jules CLI/API, with an operator tally as fallback. Each wave's findings doc must include a one-line tally for both counters and the channel each was measured on.
- Report acceptance rate on first submission.
- Novel findings per cell (vs duplicates/noise).

## Out of scope without written authorization

Browser-based legibility testing, proof-receipt packaging, rival-viability fixes, and living-product UI work are separate plan-goals. Wave 3 authorizes candidate tuning evidence only; it does not authorize default tuning changes until final held-out evidence, required gates, and human play sign-off exist.
