# antzoo debug surface — staged implementation brief

## How this document is used

This file is committed at `docs/debug-surface/BRIEF.md`. The work is executed as **one autonomous run** that implements four stages **strictly in order (1 → 2 → 3 → 4)**. Stages are internal checkpoints, not separate dispatches: each stage ends with its acceptance gates **actually executed** and their command outputs recorded verbatim in `docs/debug-surface/PROGRESS.md` before the next stage begins. Each stage is one or more commits with the stage name in the message.

**No human will review this code.** The only police are: the gates in this document, and a post-run adversarial audit performed by a different agent (written to `docs/debug-surface/AUDIT.md`). Consequently the gates are non-negotiable: **if a gate fails, fix the code — never weaken the gate, the test, or the hash.** If anything in this brief is ambiguous, choose the conservative interpretation, note the ambiguity in PROGRESS.md, and continue.

## Mission

Build the observability and reproducibility layer that turns antzoo from a toy you watch into an instrument you can run experiments on. The consumers are **autonomous agents** (a fleet of headless playtest workers and their manager), not humans squinting at pixels. Every claim a worker makes must reduce to `(seed, scenario, tick, observable)`.

This is a debug surface only. **Zero gameplay behavior changes** — proven mechanically by state-hash parity, not asserted.

## Codebase orientation

Verified facts. Re-verify what you depend on; do not spend time rediscovering.

- **Stack:** Vite + React 19 + PixiJS 8 + TypeScript.
  - `src/sim.ts` (~2,700 lines) — the entire simulation. No DOM/pixi runtime deps: imports only type-erased types from `src/types.ts` and `TUNING` from `src/tuning.ts`. **Runs in bare Node as-is.**
  - `src/render.ts` — rendering only; consumes no RNG.
  - `src/App.tsx` — React shell, fixed-timestep accumulator loop, HUD, tuning sliders, input.
  - `src/tuning.ts` — mutable `TUNING` (runtime sliders patch it) + deep-frozen `DEFAULTS`.
- **Determinism already exists.** Single LCG `nextRand(world)` (sim.ts ~line 208), state in `world.rng`, seeded from `TUNING.seed.value` (1337). Zero `Math.random` under `src/`. Fixed-dt step: `stepWorld(world, 1/TUNING.time.stepHz)` at 60 Hz. Same seed + same inputs ⇒ same run.
- **Existing observability:** `Telemetry` ring buffers, `makeHudSnapshot`, `getSeasonState`, `getColonyStatus` (player faction only — rival state is exposed nowhere), `stressSpawn`, debug overlay flag, runtime tuning sliders.
- **Existing programmatic inputs:** `applyTool(world, tool, x, y)` (food/boulder/wash/lure/dig), `dropCarcass`, `stressSpawn`, direct `TUNING` mutation.
- **Interacting systems** (why causality is illegible from the screen): two factions with per-faction pheromone fields and combat; three castes; queen hunger → terminal cascade culling; brood; seasons modulating drain/speed/regrowth/carcass odds; rain → moisture grid → local evaporation; berry bushes; carcass windfalls with spoilage; spider with HP; lures; corpses emitting danger pheromone.

### Landmines (all stages must respect these)

1. **Deaths have no cause attribution.** Four kill sites, four distinct causes: starvation (`energy <= 0`, ~line 1646), spider kill (~1805), faction combat via `combatMarks` (~1884), terminal cull `removeOneFactionAnt` (~1998). `recordAntDeath` records faction only.
2. **Non-finite ants are silently healed.** `respawnNonFiniteAnt` (~1479) teleports NaN/Inf ants to their nest with a single `console.warn` per page load. Becomes a counted event in Stage 2. Do not change the respawn behavior.
3. **Cosmetic FX consumes the gameplay RNG stream.** `spawnParticle` draws `nextRand` 3× per particle. Deterministic within a build, but cosmetic changes shift all downstream gameplay RNG. **Do not split RNG streams — that changes behavior and is forbidden.** Document in DEBUG.md as a cross-version replay caveat. Headless must keep running the particle system (it's inside `stepWorld`).
4. **Ant slots are swap-remove compacted.** `removeAnt` copies the last slot into the freed index via `copyAntSlot` (~line 610). Array index is NOT a stable identity, and **every per-ant debug array added in Stage 2/4 must be copied in `copyAntSlot` and reset in `addAnt`/`removeAnt`, or it desyncs silently.**
5. **The browser loop caps at ~8× real time** (`TUNING.time.maxStepsPerFrame: 8`). Headless must not inherit this cap.

## Global ground rules

1. **Observational layer only.** No gameplay deltas, ever. Each stage that touches existing files proves it via hash parity against the final commit of the previous stage.
2. **Instrumentation must not consume RNG or mutate gameplay state.** Debug structures hang off `World` but are excluded from the state hash.
3. **No refactors.** Insert hooks at named sites; do not restructure `sim.ts`. No new runtime deps. Dev deps: `tsx` (or `vite-node`) only. Don't break `npm run build` or the Pages workflow.
4. **Machine consumers first.** Stable JSON schemas; every field documented in `DEBUG.md`; assume the reader of DEBUG.md is another agent receiving it as its only orientation.
5. **Gates are executed, not asserted.** Every gate's command output is recorded verbatim in `docs/debug-surface/PROGRESS.md` under a heading for its stage, before the next stage starts. A parity mismatch means your hooks changed behavior: fix the hooks, never the hash.

---

## Stage 1 — Instrument core (purely additive)

**Files: new files only. Do not modify `src/sim.ts`, `src/App.tsx`, `src/render.ts`, `src/types.ts`, or `src/tuning.ts`** (a `package.json` script entry and dev-dep are the only permitted edits to existing files).

### D1 — `src/debug/snapshot.ts`

- `snapshotWorld(world): WorldSnapshot` — read-only structured summary per Appendix A. Fields that require Stage 2 data (`deathsByCause`, `nanRespawns`, obituary stats) are emitted as `null` in Stage 1; the schema is complete from day one.
- `hashWorldState(world): string` — fast stable hash (FNV-1a-style, hand-rolled fine) over **gameplay state only**: `world.rng`, `time`, `stepCount`; all `AntStore` arrays sliced to `ants.count` (including the caste/faction arrays sim.ts grafts on); grid fields (both factions' food/home pheromones, danger, lure, moisture, `foodAmt`); nest food (both factions); brood/queen/terminal scalars (both factions); rival struct; spider incl. hp; bushes; carcass; corpses; obstacles. Excluded: camera, HUD, perf, debug-only structures. `world.rng` is always included — it fingerprints the entire draw history. When in doubt, include.

### D2 — `scripts/run.ts` headless CLI

```
npm run sim -- --seed 1337 --ticks 50000 --sample-every 600 --out runs/x.jsonl
```

- Builds a world (`createWorld`), overrides the seed (set `TUNING.seed.value` before construction; document the mechanism; do not change `createWorld`'s signature), steps `stepWorld(world, 1/60)` in a tight loop, no step cap.
- Emits JSONL: snapshot every `--sample-every` ticks; final `summary` line: outcome (`running`/`gameOver`/`victory`), final tick, final hash, peak population, wall-clock ticks/sec. `--hash-every N` emits hash-only lines.
- Scenario support arrives in Stage 3; design the run loop so a timeline executor can slot in.

### Stage 1 tests (wired to `npm test`, plain `tsx` scripts)

- **T0 — Hash sensitivity sweep.** For every state category the hash domain claims to cover (rng, time, each `AntStore` array, each grid field, nest food both factions, queen/brood/rival/spider/bushes/carcass/corpses/obstacles): run to tick 5,000, programmatically perturb exactly one value in that category by a minimal amount, and assert the hash changes. Then perturb a debug-only field and assert the hash does NOT change. Output one PASS/FAIL line per category. Any undetected perturbation is a hash-domain bug; fix the hash, never the test.
- **T1 — Determinism.** Same seed twice ⇒ identical hashes at ticks 1k/10k/50k; different seeds diverge by 1k.
- **T2 — Purity.** Run with `--sample-every 100` vs no sampling ⇒ identical final hash.

### Also in Stage 1

- `docs/debug-surface/DEBUG.md` skeleton: how to run headless, full snapshot schema with units (be explicit: 60 ticks = 1 sim-second), hash domain definition, Caveats section seeded with landmines #3 and #5 and Float32 quantization.

### Gates (record outputs in PROGRESS.md)

1. T0, T1, T2 green — full per-category T0 output included.
2. Headless ticks/sec at default config and at 1,200 ants (`stressSpawn`). No target; if under ~10× real time at default, profile and explain.
3. `npm run typecheck` and `npm run build` clean.
4. `git diff --stat` for the stage shows zero edits to the five protected source files.

---

## Stage 2 — Events, identity, obituaries (first sim.ts edits)

**Files: `src/sim.ts` (hook insertions only), `src/debug/*`, tests, DEBUG.md.** Begins only after Stage 1's gates are recorded green.

### D3 — Event log with cause attribution

Fixed-size ring buffer on a debug struct hung off `World` (always on), plus unbounded capture in headless (`--events full`). High-frequency happenings (spawns, deliveries) are cumulative counters surfaced in snapshots; discrete/rare happenings are log events. Recording must not allocate per-tick in the browser path and must never call `nextRand`.

Event types per Appendix B. The four death sites each pass a cause (`"starvation" | "spider" | "combat" | "terminal_cull"`) — thread it through `recordAntDeath` or a wrapper. `respawnNonFiniteAnt` emits `nan_respawn` and increments a counter.

### D7 — Ant identity + obituaries

- Debug-only per-ant arrays: `id` (Uint32, monotonic from a debug counter assigned in `addAnt`), `birthTick`, `distanceTraveled`, `ticksInMode[3]`, `deliveries`, `ticksSinceLastDelivery`, `ticksSinceFoodPerceived`.
- **All of them copied in `copyAntSlot`, reset in `addAnt`/`removeAnt`** (landmine #4). Add a debug assertion mode validating id uniqueness across live ants.
- All excluded from the hash. ID assignment is deterministic ⇒ IDs are stable across same-seed runs.
- The `death` event becomes an obituary: cause fields plus id, birthTick, age, deliveries, distanceTraveled, mode-time split, ticksSinceLastDelivery, ticksSinceFoodPerceived.
- Snapshot fills in the Stage-1 `null`s: `deathsByCause`, `nanRespawns`, plus per-faction age distribution {p50, max}, deliveries-per-ant {mean, p50}, share of living ants that have never delivered.

### Gates (record outputs in PROGRESS.md)

1. **Parity:** hashes at ticks 1k/10k/50k, seed 1337, identical between the final Stage 1 commit and the end of Stage 2. Presented as a table. This is the headline gate.
2. T0–T2 still green (extend T0 to assert the new per-ant debug arrays do NOT affect the hash); new **T3 — death accounting**: 50k-tick baseline, per-faction `deathsByCause` sums equal `totalDeaths`; name the three most lethal causes.
3. ID-uniqueness assertion passes over a 50k-tick run.
4. typecheck/build clean.

---

## Stage 3 — Browser bridge + scenarios

**Files: `src/App.tsx`, `src/debug/*`, `scripts/run.ts` (scenario executor), `scenarios/*`, tests, DEBUG.md.** Begins only after Stage 2's gates are recorded green.

### D4 — `window.__antzoo`

Installed from App.tsx after world creation; present in production builds (reproducibility beats lockdown for a toy). API, each method documented in DEBUG.md:

- `getSnapshot()`, `getEvents(sinceTick?)`, `getHash()`
- `pause()`, `resume()`, `setSpeed(n)`, `step(nTicks)` (synchronous, while paused)
- `applyTool(tool, x, y)` in **world coordinates**, `dropCarcass(x, y)`, `stressSpawn(n)`
- `getTuning(path)`, `patchTuning(path, value)`, `resetWorld({seed})`
- `version`

URL params on boot: `?seed=`, `?speed=`, `?paused=1`, `?scenario=<base64 JSON>`.

### D5 — Scenario format + three examples

JSON timeline per Appendix C — **stimulus only, no assertions**; analysis happens downstream. CLI and bridge execute scenarios with identical semantics. Ship:

1. `scenarios/baseline-1337.json` — no stimuli, 50k ticks. The reference run.
2. `scenarios/food-distance-probe.json` — food drops at increasing distances from the player nest.
3. `scenarios/winter-reserve-stress.json` — reduced bush regrowth via `patchTuning`, through a year boundary.

### Gates (record outputs in PROGRESS.md)

1. **T4 — scenario replay:** `food-distance-probe` run twice headless ⇒ identical hash series; the JSONL shows stimuli landing at the specified ticks.
2. Playwright snippet from DEBUG.md (launch dev server, open with `?seed=&paused=1`, `step(5000)`, pull snapshot, check shape) executed; output recorded.
3. Parity table vs the final Stage 2 commit (App.tsx changes must not alter the world; if a snapshot/bridge call perturbs the run, this catches it).
4. typecheck/build clean.

---

## Stage 4 — Targeted decision traces (opt-in)

**Files: `src/sim.ts` (steering/mode hooks), `src/debug/*`, CLI flags, tests, DEBUG.md.** Begins only after Stage 3's gates are recorded green. This is the only stage touching the hot path; the prior stages' hash and throughput numbers police it.

### D8 — Decision traces

- Arm via CLI/bridge: `--trace-ids 412,517`, `--trace-arm beyondR:5` (next 5 ants crossing the dispersion radius), `--trace-arm nan_respawn`, `--trace-window 30000:41300`.
- Per traced ant per tick: tick, id, x, y, heading, mode, energy, carrying, timerA/timerB; the sensor samples taken (field sampled, left/center/right values, threshold result); mode transitions with reason enum (`saw_trail`, `saw_food`, `timer_expired`, `recruited`, `delivered`, `gave_up`); pickup/delivery/combat/spider interactions.
- Untraced hot path pays one cheap flag check per ant. Capture is read-only, consumes no RNG, excluded from the hash.
- Output: one JSONL stream per traced ant headless; ring buffer via `__antzoo.getTrace(id)` in browser.

### Gates (record outputs in PROGRESS.md)

1. **Traced-run parity:** a run with tracing armed produces hashes identical to the same run untraced.
2. **Retrospective targeting demo:** run baseline-1337; pick the first starvation death after tick 30k from the event log; re-run with that ID traced; record the final 60 ticks of its decision trace.
3. Throughput regression vs Stage 1 numbers reported; untraced overhead under ~5% or explained.
4. Parity table vs the final Stage 3 commit; typecheck/build clean.

---

## Appendix A — Snapshot spec (minimum fields)

- `meta`: tick, simTime, seed, hash, schemaVersion
- `factions[2]` (player, rival):
  - `population`: total, by caste, by mode (Wander/Seek/Carry)
  - `nestFood`, `broodProgress`, `queenHunger`, `terminal`, `gameOver`
  - `totalDeaths`, `deathsByCause` (cumulative; null until Stage 2), `totalDelivered`, `nanRespawns` (null until Stage 2)
  - `energy`: min / mean / p10 / p50
  - `dispersion`: mean distance from own nest, p90 distance, `countBeyondR` for configurable R (default ~⅓ world diagonal) — the "ants wandering the outskirts" metric
  - Stage 2+: age {p50, max}, deliveriesPerAnt {mean, p50}, neverDeliveredShare
- `fields` per faction: `pherFood`, `pherHome` each {sum, max, activeCells}; shared: `pherDanger`, `lure`, `moisture` likewise
- `food`: total on map, active cell count, distance from each nest to nearest food cell; `bushes`: count, total stock, count regrowing; `carcass`: {active, amount, spoiled, age}
- `actors`: spider {active, hp, x, y}, corpse count, obstacle count
- `season`: pass-through of `getSeasonState`
- `perf` (headless): ticks/sec so far

## Appendix B — Event types

`death` (obituary from Stage 2), `nan_respawn`, `season_change` {tick, season, year}, `rain_start`/`rain_end`, `carcass_spawn`/`carcass_spoiled` {tick, x, y, amount}, `spider_spawn`/`spider_kill`/`spider_squashed`, `brood_hatch` {tick, faction, caste}, `terminal_start`/`terminal_end` {tick, faction}, `game_over`/`victory` {tick, faction, yearsSurvived}. Spawns and deliveries are counters, not events.

## Appendix C — Scenario format

```json
{
  "name": "food-distance-probe",
  "seed": 1337,
  "tuning": { "ants.start": 150 },
  "timeline": [
    { "at": 600,  "do": "applyTool", "tool": "food", "x": 2300, "y": 1150 },
    { "at": 600,  "do": "snapshot" },
    { "at": 9000, "do": "applyTool", "tool": "food", "x": 3000, "y": 1150 }
  ]
}
```

Actions: `applyTool`, `dropCarcass`, `stressSpawn`, `patchTuning`, `snapshot`. Ticks are sim ticks (60/sim-second). Identical semantics in CLI and bridge.
