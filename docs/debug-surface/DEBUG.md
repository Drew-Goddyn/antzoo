# antzoo debug surface

This document is the machine-facing orientation for the antzoo debug surface. All tick values are simulation ticks. The fixed simulation step is 60 ticks per simulated second.

## Headless runs

Run the simulation without the browser:

```sh
npm run sim -- --seed 1337 --ticks 50000 --sample-every 600 --out runs/baseline-1337.jsonl
```

The CLI sets `TUNING.seed.value` before calling `createWorld()`. It does not change `createWorld()`'s signature. The browser loop caps catch-up work at `TUNING.time.maxStepsPerFrame`; the headless loop intentionally does not inherit that cap and steps as fast as Node can run.

Options:

| Option | Meaning |
| --- | --- |
| `--seed N` | Set `TUNING.seed.value` before world construction. |
| `--ticks N` | Number of fixed 1/60 simulation steps to execute. |
| `--sample-every N` | Emit a complete snapshot every N ticks. |
| `--hash-every N` | Emit a hash-only record every N ticks. |
| `--events full` | Retain the unbounded event log during the run and emit `event` records before the final summary. |
| `--out PATH` | Write JSONL to a file instead of stdout. |
| `--stress-ants N` | Before timing, call `stressSpawn` until live ant count reaches N. This is a stimulus/setup action and consumes gameplay RNG. |

Every JSONL record has a `type` field. The runner emits `snapshot`, `hash`, `event`, and final `summary` records. The final summary includes `outcome`, `finalTick`, `finalHash`, `peakPopulation`, and `ticksPerSecond`.

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

`hashWorldState(world)` hashes gameplay state only and excludes camera, HUD, telemetry/perf timing, render state, particles, and debug-only structures. It includes:

- `world.rng`, dimensions, `time`, `frame`, `stepCount`, spawn/death timers, trauma, nest pulse, rain and cooldown scalars.
- Live ant arrays sliced to `ants.count`: `x`, `y`, `heading`, `energy`, `stepsSincePickup`, `timerA`, `timerB`, `mode`, `carrying`, `flags`, runtime `caste`, and runtime `faction`.
- Spatial hash arrays and faction masks that can affect programmatic interactions between steps.
- Grid dimensions plus food/home pheromones for both factions, danger pheromone, lure, moisture, food amount, evaporation fields, active/listed/diffuse bookkeeping, and food bookkeeping.
- Player and rival nest food, brood, queen, terminal, delivery/death, peak population, and rival drip/pulse state.
- Spider state including hp.
- Bushes, carcass, corpses, obstacles, and combat marks.

The hash intentionally includes `world.rng`; this fingerprints the entire draw history.

## Events

The browser path always keeps a fixed-size debug event ring. Headless runs can retain every event with `--events full`; these records are emitted as JSONL before the summary. Event recording appends debug-only data, never calls `nextRand`, and never writes gameplay state.

Event records:

| Type | Fields |
| --- | --- |
| `death` | `tick`, `faction`, `cause`, `id`, `birthTick`, `age`, `deliveries`, `distanceTraveled`, `ticksInMode`, `ticksSinceLastDelivery`, `ticksSinceFoodPerceived`. |
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

## Caveats

- Cosmetic FX currently consumes the gameplay RNG stream because particle spawning calls `nextRand`. Replays are deterministic within a build, but cosmetic changes can shift downstream gameplay RNG across versions. The RNG streams must not be split.
- Browser execution is capped by `TUNING.time.maxStepsPerFrame`; headless execution is uncapped.
- Numeric state contains `Float32Array` values. Hashing uses the stored bytes for typed arrays, so Float32 quantization is part of the reproducibility contract.
