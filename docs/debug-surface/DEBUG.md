# antzoo debug surface

This document is the machine-facing orientation for the antzoo debug surface. Fields named `tick`, `birthTick`, or `age` are simulation ticks. The fixed simulation step is 60 ticks per simulated second. Obituary duration fields with historical `ticks*` names are documented in the event table below and use simulated seconds.

## Headless runs

Run the simulation without the browser:

```sh
npm run sim -- --seed 1337 --ticks 50000 --sample-every 600 --out runs/baseline-1337.jsonl
```

The CLI sets `TUNING.seed.value` before calling `createWorld()`. It does not change `createWorld()`'s signature. Batch mode resets mutable `TUNING` from `DEFAULTS` before each replicate, then applies scenario setup and the selected seed, so scenario timeline patches cannot leak across seeds. The browser loop caps catch-up work at `TUNING.time.maxStepsPerFrame`; the headless loop intentionally does not inherit that cap and steps as fast as Node can run.

Options:

| Option | Meaning |
| --- | --- |
| `--seed N` | Set `TUNING.seed.value` before world construction. |
| `--seeds A,B,C` | Batch mode. Run the same configuration once for each listed seed, or `--replicates` times for each seed. Emits one `seed_summary` record per seed and one final `cross_seed_rollup` record. Cannot be combined with `--seed`. |
| `--replicates N` | Batch mode. Repeat each seed N times. Replicates intentionally reuse the exact seed; `hashesAllMatch` in the seed summary is the deterministic-replication check. |
| `--ticks N` | Number of fixed 1/60 simulation steps to execute. |
| `--sample-every N` | Emit a complete snapshot every N ticks. |
| `--hash-every N` | Emit a hash-only record every N ticks. |
| `--events full` | Retain the unbounded event log during the run and emit `event` records before the final summary. |
| `--scenario PATH` | Load a JSON scenario, apply its seed/tuning before world creation, and execute timeline actions at their ticks. |
| `--trace-ids A,B` | Trace the listed stable ant debug ids. |
| `--trace-arm beyondR:N` | Trace the next N ants that cross beyond one third of the world diagonal from their own nest. May be repeated with other arms. |
| `--trace-arm nan_respawn` | Trace ants that hit the non-finite respawn path. |
| `--trace-window START:END` | Capture trace rows only for ticks in the inclusive window. Arming can happen outside the window. |
| `--out PATH` | Write JSONL to a file instead of stdout. |
| `--stress-ants N` | Before timing, call `stressSpawn` until live ant count reaches N. This is a stimulus/setup action and consumes gameplay RNG. |

Every JSONL record has a `type` field. Single-run mode emits `snapshot`, `hash`, `event`, `trace`, `stimulus`, `scenario_snapshot`, and final `summary` records. Batch mode is summary-only and emits `seed_summary` records followed by one `cross_seed_rollup` record.

Single-run `snapshot` and `scenario_snapshot` records include `intervalFlow`, the per-faction delta since the previous emitted snapshot record. These counters are debug-only and hash-excluded:

| Flow counter | Meaning |
| --- | --- |
| `foodDelivered` | Carried food delivered to that faction's nest. |
| `queenConsumed` | Food consumed by queen feeding. This is currently always `0` because the present gameplay only tracks queen hunger and does not decrement nest food for queen feeding. |
| `broodConsumed` | Nest food consumed by brood progress. |
| `snackEnergyGained` | Actual ant energy gained from `TUNING.ant.snackOnPickup`, after capping at max energy. |
| `drainTotal` | Total ant energy drain applied by the per-tick drain term. |

The final `summary` record includes `seed`, `replicate`, global `outcome`, per-faction `factionOutcomes`, `finalTick`, `finalHash`, `peakPopulation`, `peakPopulationByFaction`, `finalPopulationByFaction`, `deathsByCause`, `obituaryAggregates`, `flowTotals`, and `ticksPerSecond`.

Timing fields (`ticksPerSecond`, `ticksPerSecondQuartiles`, `perf.ticksPerSecond`, and wall-clock report runtime) are nondeterministic performance telemetry. Determinism comparisons must use final hashes and outcome fields only, never timing fields or byte-identical full records.

Numeric determinism claims are currently V8 claims: the local gates verify Node
and Chrome behavior, and both use V8. JavaScript-engine Math behavior such as
`Math.sin`, `Math.cos`, and `Math.pow` is not IEEE-pinned across engines, so do
not claim cross-engine bit reproducibility unless that engine has been
explicitly verified.

Batch `seed_summary` and `cross_seed_rollup` records include:

| Path | Meaning |
| --- | --- |
| `outcomeCounts` | Global outcome counts across included runs. |
| `factionOutcomeCounts` | Per-faction counts of `running`, `gameOver`, and `victory`. |
| `deathsByCauseMedians` | Median per-run death count by cause and faction. |
| `obituaryAggregateMedians` | Median of included runs' obituary medians by cause and faction, with `count` summed across included runs. |
| `populationQuartiles.peak` | Per-faction quartiles for peak population. |
| `populationQuartiles.final` | Per-faction quartiles for final population. |
| `flowTotals` | Per-faction cumulative sums of the hash-excluded debug flow counters across all included runs. In `seed_summary` this means all replicates for one seed; in `cross_seed_rollup` this means all included seeds and replicates. |
| `flowDeficitRatios.<faction>.drainTotalToSnackEnergyGained` | `flowTotals.<faction>.drainTotal / flowTotals.<faction>.snackEnergyGained`, or `null` when no snack energy was gained. Values above `1` mean drain exceeded snack energy gained. |
| `flowDeficitRatios.<faction>.foodDeliveredToQueenBroodConsumed` | `flowTotals.<faction>.foodDelivered / (flowTotals.<faction>.queenConsumed + flowTotals.<faction>.broodConsumed)`, or `null` when neither queen nor brood consumed food. Values below `1` mean recorded consumption exceeded delivered food. |
| `finalHashes` / `hashesAllMatch` | Replication determinism evidence for the included runs. |

## Test gates

`npm test` runs the full local debug-surface gate: T0 hash sensitivity and purity, T1 determinism at 1k/10k/50k ticks, T2 sampling purity through 50k ticks, T3 death accounting/id uniqueness through 50k ticks, T5 trace purity, and T6 paused-presentation purity.

CI uses:

```sh
npm test -- --fast
```

Fast mode preserves the same invariants but caps the long T1/T2/T3 runs at 10k ticks so every push can afford to run the gate. Use plain `npm test` before accepting local debug-surface changes.

## Snapshot schema

`snapshotWorld(world)` returns schema version `1`.

| Path | Units / meaning |
| --- | --- |
| `meta.tick` | Simulation tick, equal to `world.stepCount`. |
| `meta.simTime` | Simulated seconds. |
| `meta.seed` | Current `TUNING.seed.value` used for construction by the CLI. |
| `meta.hash` | `hashWorldState(world)` over gameplay state only. |
| `meta.schemaVersion` | Snapshot schema version. |
| `factions.player`, `factions.rival` | Per-faction colony summaries. |
| `population.total` | Live ants for that faction. |
| `population.byCaste` | Live worker/soldier/nurse counts. |
| `population.byMode` | Live Wander/Seek/Carry counts. |
| `nestFood` | Food units stored at that faction's nest. |
| `broodProgress` | Current brood progress toward hatch. |
| `queenHunger` | Seconds of unfed queen hunger. |
| `terminal` | Whether terminal cascade is active. |
| `gameOver` | Whether that faction has lost. |
| `totalDeaths` | Cumulative deaths for that faction. |
| `deathsByCause` | Cumulative `{starvation, spider, combat, terminal_cull}` counts. |
| `totalDelivered` | Cumulative deliveries for that faction. |
| `nanRespawns` | Cumulative non-finite ant respawns for that faction. |
| `energy` | `min`, `mean`, `p10`, `p50` live-ant energy units; `null` stats when no ants are alive. |
| `dispersion.meanDistance` | Mean live-ant distance from own nest, world units. |
| `dispersion.p90Distance` | P90 live-ant distance from own nest, world units. |
| `dispersion.countBeyondR` | Live ants farther than `dispersion.radius`. |
| `dispersion.radius` | Default radius: one third of the world diagonal. |
| `age` | Live ant age in ticks: `{p50, max}`. |
| `deliveriesPerAnt` | Live ant delivery distribution: `{mean, p50}`. |
| `neverDeliveredShare` | Fraction of live ants with zero deliveries. |
| `flow` | Cumulative debug flow counters for that faction. These are hash-excluded; CLI snapshot records also include per-interval deltas as `intervalFlow`. |
| `fields.player.pherFood`, `fields.player.pherHome` | Player pheromone field summaries: `sum`, `max`, `activeCells`. |
| `fields.rival.pherFood`, `fields.rival.pherHome` | Rival pheromone field summaries. |
| `fields.shared.pherDanger`, `fields.shared.lure`, `fields.shared.moisture` | Shared field summaries. |
| `food.totalOnMap` | Sum of `grid.foodAmt`. |
| `food.activeCellCount` | Cells with food above simulation epsilon. |
| `food.nearestDistanceByFaction` | Distance from each nest to nearest food cell, or `null`. |
| `bushes.count` | Berry bush count. |
| `bushes.totalStock` | Sum of bush stock. |
| `bushes.countRegrowing` | Bushes below stock cap. |
| `carcass` | Active flag, amount, spoilage, and age in seconds. |
| `actors.spider` | Spider active flag, hp, and world position. |
| `actors.corpseCount` | Live corpse records. |
| `actors.obstacleCount` | Obstacle records. |
| `season` | Pass-through of `getSeasonState(world)`. |
| `perf.ticksPerSecond` | Headless throughput when supplied by the runner; otherwise `null`. |

## Hash domain

`hashWorldState(world)` hashes gameplay state and gameplay-affecting tuning only. It excludes camera, HUD, telemetry/perf timing, presentation-only render settings, particles, and debug-only structures. It includes:

- A deterministic digest of active tuning that can affect simulation futures or programmatic inputs, including `ant.*`, `pher.*`, `ecology.*`, `seasons.*` gameplay fields, `war.*` geography and soldier fields, tools/input knobs, particle/fx knobs that run inside `stepWorld`, seed, world/grid/spatial sizes, and caste/faction constants. Presentation-only tuning such as `ui.*`, `controls.*`, `camera.*`, `minimap.*`, `colors.*`, spider draw/toast fields, seasonal tint/rain-streak/toast fields, skirmish toast/window fields, browser render chrome, and the camera-trauma controls listed below is excluded.
- `world.rng`, dimensions, `time`, `frame`, `stepCount`, `spawnTimer`, nest pulse, rain and cooldown scalars, and `contestedTimer` (the contested-ground scent refresh).
- Live ant arrays sliced to `ants.count`: `x`, `y`, `heading`, `energy`, `stepsSincePickup`, `timerA`, `timerB`, `mode`, `carrying`, `flags`, runtime `caste`, and runtime `faction`.
- Spatial hash arrays and faction masks that can affect programmatic interactions between steps.
- Grid dimensions plus food/home pheromones for both factions, danger pheromone, lure, moisture, food amount, evaporation fields, active/listed/diffuse bookkeeping, and food bookkeeping.
- Player and rival nest position, nest food, brood, queen, terminal, delivery/death, peak population, and rival pulse state.
- Spider state including hp.
- Bushes, carcass, corpses, obstacles, and combat marks.

The hash intentionally includes `world.rng`; this fingerprints the entire draw history.

### Camera trauma is outside the hash

Camera shake is Presentation (`CONTEXT.md`), so neither it nor anything whose only
effect is shake belongs to World state. Excluded: `world.trauma`,
`world.deathWindowTimer`, `world.deathWindowCount`, and the tuning leaves
`war.skirmishTrauma`, `war.skirmishTraumaMax`, `fx.shakeDecay`, `sim.traumaBurst`,
`sim.deathsBurstWindowSec`, `sim.deathsBurstCount`, `spider.squashTrauma`.

Trauma decays on the frame clock via `advancePresentation(world, dt)`, called from
the browser frame loop — never from the renderer, and never from `stepWorld`. This
is what keeps a paused world still: T6 in the gate holds `tick` and `simTime` fixed
across 600 presentation frames and asserts the hash does not move. Presentation that
advances in real time must stay out of the hash for that property to hold.

## Events

The browser path always keeps a fixed-size debug event ring. Headless runs can retain every event with `--events full`; these records are emitted as JSONL before the summary. Event recording appends debug-only data, never calls `nextRand`, and never writes gameplay state.

Event records:

| Type | Fields |
| --- | --- |
| `death` | `tick`, `birthTick`, and `age` are simulation ticks. `distanceTraveled` is world units. `ticksInMode`, `ticksSinceLastDelivery`, and `ticksSinceFoodPerceived` are simulated seconds despite their historical names. Other fields: `faction`, `cause`, `id`, `deliveries`. |
| `nan_respawn` | `tick`, `faction`, `id`, prior `x`, prior `y`. Respawn behavior is unchanged. |
| `season_change` | `tick`, `season`, `label`, `year`. |
| `rain_start`, `rain_end` | `tick`. |
| `carcass_spawn` | `tick`, `x`, `y`, `amount`. |
| `carcass_spoiled` | `tick`, `x`, `y`, `amount`. |
| `spider_spawn` | `tick`, `x`, `y`, `hp`. |
| `spider_kill` | `tick`, `x`, `y`, `victimId`, `victimFaction`. |
| `spider_squashed` | `tick`, `x`, `y`, `rewardFaction`. |
| `brood_hatch` | `tick`, `faction`, `caste`. |
| `terminal_start`, `terminal_end` | `tick`, `faction`. |
| `game_over` | `tick`, `faction`, `yearsSurvived`. |
| `victory` | `tick`, winner `faction`, `yearsSurvived`. |

Spawns and deliveries are counters, not event records. Per-ant debug state is copied in `copyAntSlot` and reset in `addAnt`/`removeAnt` so swap-remove compaction does not desynchronize identities.

`summary.obituaryAggregates` rolls death obituaries up by faction and cause. Each cause has `{count, medianAge, medianDeliveries, medianTicksSinceFoodPerceived}`. `medianAge` is in simulation ticks. `medianTicksSinceFoodPerceived` uses the historical field name from death events and is measured in simulated seconds.

## Decision traces

Decision tracing is opt-in. It is debug-only, excluded from `hashWorldState`, never calls `nextRand`, and does not write gameplay state. When no trace is armed, the ant hot path checks only whether tracing is enabled.

CLI examples:

```sh
npm run sim -- --scenario scenarios/baseline-1337.json --trace-ids 386 --trace-window 31339:31398
npm run sim -- --seed 1337 --ticks 50000 --trace-arm beyondR:5
npm run sim -- --seed 1337 --ticks 50000 --trace-arm nan_respawn
```

The first two commands are demonstrative for the committed baseline: id `386` emits the final 60 ticks before a starvation death, and `beyondR:5` emits rows for the next five ants crossing the default dispersion radius. `nan_respawn` is an incident arm; a normal finite baseline may emit zero trace rows for it.

Headless trace rows are emitted as JSONL records:

```json
{
  "type": "trace",
  "trace": {
    "type": "tick",
    "tick": 30001,
    "id": 412,
    "x": 2010.5,
    "y": 1140.25,
    "heading": -1.1,
    "mode": 1,
    "energy": 42.75,
    "carrying": 0,
    "timerA": 0,
    "timerB": 0,
    "sensors": [],
    "transitions": [],
    "interactions": []
  }
}
```

Trace tick fields:

| Path | Meaning |
| --- | --- |
| `tick`, `id` | Simulation tick and stable ant debug id. |
| `x`, `y`, `heading` | Ant position and heading at the start of the traced tick. |
| `mode` | Numeric `AntMode`: 0 Wander, 1 Seek, 2 Carry. |
| `energy`, `carrying`, `timerA`, `timerB` | Ant state at the start of the traced tick. |
| `sensors[]` | Steering sensor sample for the tick. `field` is `food` or `home`; `center`, `left`, `right` are the primary pheromone field values already read by steering; `threshold` is `TUNING.sim.sensorThreshold`; `*Above` fields compare each value to that threshold. |
| `transitions[]` | Mode transition records `{from, to, reason}`. Reasons are `saw_trail`, `saw_food`, `timer_expired`, `recruited`, `delivered`, `gave_up`. Timer expiry can have the same `from` and `to` because it records timer state crossing zero. |
| `interactions[]` | Discrete interactions observed for the ant: `pickup`, `delivery`, `combat`, `spider`, `starvation`, `nan_respawn`. |

`--trace-window START:END` is inclusive. `getTrace(id)` in the browser returns the per-id ring buffer; headless output keeps the full trace stream for the run.

## Browser bridge

The browser installs `window.__antzoo` in development and production builds. All coordinates are world coordinates.

| Method | Contract |
| --- | --- |
| `getSnapshot()` | Return `snapshotWorld(world)`. |
| `getEvents(sinceTick?)` | Return debug events from the ring buffer, filtered to `tick >= sinceTick` when supplied. |
| `getHash()` | Return `hashWorldState(world)`. |
| `pause()` / `resume()` | Toggle `world.paused`. |
| `setSpeed(n)` | Set browser simulation speed. |
| `step(nTicks)` | Synchronously step exactly `nTicks` fixed ticks, even while paused; restores the previous paused state afterward. |
| `applyTool(tool, x, y)` | Apply a tool at world coordinates. Supported strings include `food`, `boulder`, `wash`, `lure`, and `dig`. |
| `dropCarcass(x, y)` | Drop a carcass at world coordinates, returning whether it landed. |
| `stressSpawn(n)` | Call `stressSpawn(world, n)`. This is a stimulus and consumes gameplay RNG. |
| `getTuning(path)` | Read a dotted `TUNING` path. |
| `patchTuning(path, value)` | Write a dotted `TUNING` path. |
| `resetWorld({seed})` | Recreate the world, preserving current UI speed/tool/debug/pause state and optionally overriding seed. |
| `configureTrace(config)` | Arm decision tracing. Accepts `{ids, arms, windowStart, windowEnd, beyondRadius, beyondCount, nanRespawn, clear}`. `arms` accepts `beyondR:N` and `nan_respawn`, matching the CLI. |
| `clearTrace()` | Clear trace configuration, rings, and active per-ant trace flags. |
| `getTrace(id)` | Return the browser ring buffer for a traced ant id. |
| `version` | Bridge version string. |

Boot URL params:

| Param | Effect |
| --- | --- |
| `seed` | Sets `TUNING.seed.value` before `createWorld()`. |
| `speed` | Sets initial browser speed. |
| `paused=1` | Starts paused. |
| `scenario` | Base64-encoded scenario JSON. Its seed/tuning are applied before `createWorld()`, then its timeline executes as the world advances. |

Playwright gate:

Terminal 1:

```sh
npm run dev -- --port 5173
```

Terminal 2:

```sh
node - <<'JS'
const { chromium } = require("playwright-core");

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:5173/?seed=1337&paused=1", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(window.__antzoo));
  const result = await page.evaluate(() => {
    const api = window.__antzoo;
    if (!api) throw new Error("window.__antzoo missing");
    api.pause();
    api.step(5000);
    const snapshot = api.getSnapshot();
    return {
      version: api.version,
      tick: snapshot.meta.tick,
      hash: api.getHash(),
      population: snapshot.factions.player.population.total,
      hasEventsArray: Array.isArray(api.getEvents()),
      deathsByCauseIsObject: typeof snapshot.factions.player.deathsByCause === "object" && snapshot.factions.player.deathsByCause !== null,
      schemaVersion: snapshot.meta.schemaVersion
    };
  });
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
JS
```

The repo includes `playwright-core` as a dev dependency and uses the local Chrome channel for this gate. The evaluated browser body is:

```js
const result = await page.evaluate(() => {
  const api = window.__antzoo;
  if (!api) throw new Error("window.__antzoo missing");
  api.pause();
  api.step(5000);
  const snapshot = api.getSnapshot();
  return {
    version: api.version,
    tick: snapshot.meta.tick,
    hash: api.getHash(),
    population: snapshot.factions.player.population.total,
    hasEventsArray: Array.isArray(api.getEvents()),
    deathsByCauseIsObject: typeof snapshot.factions.player.deathsByCause === "object" && snapshot.factions.player.deathsByCause !== null,
    schemaVersion: snapshot.meta.schemaVersion
  };
});
console.log(JSON.stringify(result, null, 2));
```

## Scenarios

Scenarios are stimulus timelines. They contain no assertions; downstream agents analyze emitted snapshots, events, hashes, and summaries.

```json
{
  "name": "food-distance-probe",
  "seed": 1337,
  "ticks": 12000,
  "tuning": { "ants.start": 150 },
  "timeline": [
    { "at": 600, "do": "applyTool", "tool": "food", "x": 2300, "y": 1150 },
    { "at": 600, "do": "snapshot" },
    { "at": 9000, "do": "applyTool", "tool": "food", "x": 3000, "y": 1150 }
  ]
}
```

Actions execute when `world.stepCount` reaches `at`, before the next simulation step. Supported actions are `applyTool`, `dropCarcass`, `stressSpawn`, `patchTuning`, and `snapshot`. The CLI and browser bridge use the same scenario executor.

## Caveats

- Cosmetic FX currently consumes the gameplay RNG stream because particle spawning calls `nextRand`. Replays are deterministic within a build, but cosmetic changes can shift downstream gameplay RNG across versions. The RNG streams must not be split.
- Browser execution is capped by `TUNING.time.maxStepsPerFrame`; headless execution is uncapped.
- Numeric state contains `Float32Array` values. Hashing uses the stored bytes for typed arrays, so Float32 quantization is part of the reproducibility contract.
- Cross-engine numeric behavior is not part of the current reproducibility contract. The verified surfaces are V8 Node and V8 Chrome unless another engine is named with its own evidence.
