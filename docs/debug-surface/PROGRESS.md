# antzoo debug surface progress

Command outputs are recorded verbatim under each stage before the next stage begins.

## Stage 1 — Instrument core

### Ambiguities / conservative calls

- The BRIEF names primary grid fields in the hash domain, but active/listed/diffuse grid bookkeeping affects future evaporation/diffusion behavior. I included it in the hash and covered it with `T0 grid.bookkeeping`.
- The BRIEF asks for throughput "at 1,200 ants (`stressSpawn`)". I interpreted that as 1,200 total live ants, so `--stress-ants 1200` calls `stressSpawn` only for the missing count after world creation.
- The runner reports actual advanced simulation ticks/sec. If the world reaches victory/game over before the requested tick budget, the final tick is the terminal `world.stepCount`.

### Gate 1 — T0, T1, T2

Command:

```sh
npm test
```

Output:

```text

> antzoo@1.0.0 test
> tsx scripts/test-debug.ts

PASS T0 rng
PASS T0 time
PASS T0 stepCount
PASS T0 ants.x
PASS T0 ants.y
PASS T0 ants.heading
PASS T0 ants.energy
PASS T0 ants.stepsSincePickup
PASS T0 ants.timerA
PASS T0 ants.timerB
PASS T0 ants.mode
PASS T0 ants.carrying
PASS T0 ants.flags
PASS T0 ants.caste
PASS T0 ants.faction
PASS T0 spatial
PASS T0 grid.pherFood.player
PASS T0 grid.pherFood.rival
PASS T0 grid.pherHome.player
PASS T0 grid.pherHome.rival
PASS T0 grid.pherDanger
PASS T0 grid.lure
PASS T0 grid.moisture
PASS T0 grid.foodAmt
PASS T0 grid.bookkeeping
PASS T0 nestFood.player
PASS T0 nestFood.rival
PASS T0 queen/brood.player
PASS T0 queen/brood.rival
PASS T0 rival struct
PASS T0 spider
PASS T0 bushes
PASS T0 carcass
PASS T0 corpses
PASS T0 obstacles
PASS T0 combatMarks
PASS T0 debug-only field
PASS T1 same seed hashes at 1k/10k/50k
PASS T1 different seeds diverge by 1k
PASS T2 sample-every 100 vs no sampling final hash
```

### Gate 2 — Headless Throughput

Command:

```sh
npm run sim -- --seed 1337 --ticks 50000
```

Output:

```text

> antzoo@1.0.0 sim
> tsx scripts/run.ts --seed 1337 --ticks 50000

{"type":"summary","outcome":"victory","finalTick":33235,"finalHash":"23e9d299385713f9","peakPopulation":354,"ticksPerSecond":949.5291338308674}
```

Default throughput is ~15.8x real time (949.53 / 60), so the BRIEF's under-10x profiling condition does not apply.

Command:

```sh
npm run sim -- --seed 1337 --ticks 50000 --stress-ants 1200
```

Output:

```text

> antzoo@1.0.0 sim
> tsx scripts/run.ts --seed 1337 --ticks 50000 --stress-ants 1200

{"type":"summary","outcome":"gameOver","finalTick":15594,"finalHash":"36ab424a76d914d6","peakPopulation":1200,"ticksPerSecond":350.889104984984}
```

### Gate 3 — Typecheck And Build

Command:

```sh
npm run typecheck
```

Output:

```text

> antzoo@1.0.0 typecheck
> tsc --noEmit

```

Command:

```sh
npm run build
```

Output:

```text

> antzoo@1.0.0 build
> tsc --noEmit && vite build

vite v6.4.3 building for production...
transforming...
✓ 745 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                               0.34 kB │ gzip:   0.25 kB
dist/assets/CanvasPool-DEBfNSXF.js            0.78 kB │ gzip:   0.43 kB
dist/assets/Filter-BrsdLZJS.js                0.90 kB │ gzip:   0.48 kB
dist/assets/BufferResource-kZGHOHep.js       10.61 kB │ gzip:   2.80 kB
dist/assets/webworkerAll-ChN7hEVq.js         15.93 kB │ gzip:   5.07 kB
dist/assets/CanvasRenderer-ERinHEny.js       18.03 kB │ gzip:   6.02 kB
dist/assets/BitmapFont-CGKRCKd5.js           34.48 kB │ gzip:  11.75 kB
dist/assets/WebGPURenderer-G-GU18zU.js       39.14 kB │ gzip:  10.95 kB
dist/assets/browserAll-Dl_qxgAd.js           43.26 kB │ gzip:  11.36 kB
dist/assets/RenderTargetSystem-B-jdbT0I.js   47.11 kB │ gzip:  12.97 kB
dist/assets/WebGLRenderer-lCHYy4nJ.js        68.88 kB │ gzip:  18.92 kB
dist/assets/index-X5TqYsL_.js               589.02 kB │ gzip: 181.46 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 2.26s
```

### Gate 4 — Protected Source Diff Stat

Command:

```sh
git diff --stat -- src/sim.ts src/App.tsx src/render.ts src/types.ts src/tuning.ts
```

Output:

```text
```

## Stage 2 — Events, identity, obituaries

### Ambiguities / conservative calls

- The Stage 2 file list does not mention `scripts/run.ts`, but D3 explicitly requires unbounded headless capture via `--events full`; I edited `scripts/run.ts` for that CLI flag.
- Appendix B lists more event types than the Stage 2 gates exercise. I hooked the rare/discrete event types now rather than leaving partially documented event coverage.
- ID uniqueness is checked every 100 ticks during the 50k run and at the final tick. This catches persistent copy/reset mistakes without adding a full Set scan to every simulation tick.

### Gate 1 — Parity Vs Final Stage 1 Commit

Stage 1 commit: `a8f462a51c795998cdc5af5dfe4b23e4e5600cb6`

Current Stage 2 command:

```sh
./node_modules/.bin/tsx -e 'import { createWorld, stepWorld } from "./src/sim"; import { hashWorldState } from "./src/debug/snapshot"; import { TUNING } from "./src/tuning"; TUNING.seed.value = 1337; const world = createWorld(); const checkpoints = new Set([1000, 10000, 50000]); for (let tick = 1; tick <= 50000; tick += 1) { stepWorld(world, 1 / TUNING.time.stepHz); if (checkpoints.has(tick)) console.log(`${tick}\t${hashWorldState(world)}`); }'
```

Output:

```text
1000	897635155d16b44d
10000	206a4c9c844b2de8
50000	23e9d299385713f9
```

Stage 1 temp-worktree command:

```sh
tmpdir=$(mktemp -d /tmp/antzoo-stage1-XXXXXX) && git worktree add --detach "$tmpdir" a8f462a51c795998cdc5af5dfe4b23e4e5600cb6 >/tmp/antzoo-worktree-add.log && (cd "$tmpdir" && /Users/drewgoddyn/projects/antzoo/node_modules/.bin/tsx -e 'import { createWorld, stepWorld } from "./src/sim"; import { hashWorldState } from "./src/debug/snapshot"; import { TUNING } from "./src/tuning"; TUNING.seed.value = 1337; const world = createWorld(); const checkpoints = new Set([1000, 10000, 50000]); for (let tick = 1; tick <= 50000; tick += 1) { stepWorld(world, 1 / TUNING.time.stepHz); if (checkpoints.has(tick)) console.log(`${tick}\t${hashWorldState(world)}`); }'); code=$?; git worktree remove "$tmpdir" >/tmp/antzoo-worktree-remove.log; exit $code
```

Output:

```text
Preparing worktree (detached HEAD a8f462a)
1000	897635155d16b44d
10000	206a4c9c844b2de8
50000	23e9d299385713f9
```

Parity table:

| Tick | Stage 1 hash | Stage 2 hash | Match |
| ---: | --- | --- | --- |
| 1000 | `897635155d16b44d` | `897635155d16b44d` | yes |
| 10000 | `206a4c9c844b2de8` | `206a4c9c844b2de8` | yes |
| 50000 | `23e9d299385713f9` | `23e9d299385713f9` | yes |

### Gate 2 — T0, T1, T2, T3

Command:

```sh
npm test
```

Output:

```text

> antzoo@1.0.0 test
> tsx scripts/test-debug.ts

PASS T0 rng
PASS T0 time
PASS T0 stepCount
PASS T0 ants.x
PASS T0 ants.y
PASS T0 ants.heading
PASS T0 ants.energy
PASS T0 ants.stepsSincePickup
PASS T0 ants.timerA
PASS T0 ants.timerB
PASS T0 ants.mode
PASS T0 ants.carrying
PASS T0 ants.flags
PASS T0 ants.caste
PASS T0 ants.faction
PASS T0 spatial
PASS T0 grid.pherFood.player
PASS T0 grid.pherFood.rival
PASS T0 grid.pherHome.player
PASS T0 grid.pherHome.rival
PASS T0 grid.pherDanger
PASS T0 grid.lure
PASS T0 grid.moisture
PASS T0 grid.foodAmt
PASS T0 grid.bookkeeping
PASS T0 nestFood.player
PASS T0 nestFood.rival
PASS T0 queen/brood.player
PASS T0 queen/brood.rival
PASS T0 rival struct
PASS T0 spider
PASS T0 bushes
PASS T0 carcass
PASS T0 corpses
PASS T0 obstacles
PASS T0 combatMarks
PASS T0 debug-only field
PASS T0 debug ant id
PASS T0 debug ant birthTick
PASS T0 debug ant distanceTraveled
PASS T0 debug ant ticksInMode
PASS T0 debug ant deliveries
PASS T0 debug ant ticksSinceLastDelivery
PASS T0 debug ant ticksSinceFoodPerceived
PASS T1 same seed hashes at 1k/10k/50k
PASS T1 different seeds diverge by 1k
PASS T2 sample-every 100 vs no sampling final hash
PASS T3 death accounting - top causes: starvation=347, spider=21, terminal_cull=10
PASS T3 id uniqueness over 50k
```

### Gate 3 — ID Uniqueness

Covered by `PASS T3 id uniqueness over 50k` in the `npm test` output above.

### Gate 4 — Typecheck And Build

Command:

```sh
npm run typecheck
```

Output:

```text

> antzoo@1.0.0 typecheck
> tsc --noEmit

```

Command:

```sh
npm run build
```

Output:

```text

> antzoo@1.0.0 build
> tsc --noEmit && vite build

vite v6.4.3 building for production...
transforming...
✓ 746 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                               0.34 kB │ gzip:   0.25 kB
dist/assets/CanvasPool-Cu3zCvEM.js            0.78 kB │ gzip:   0.43 kB
dist/assets/Filter-BRc_UHmK.js                0.90 kB │ gzip:   0.47 kB
dist/assets/BufferResource-Cfr1I0EN.js       10.61 kB │ gzip:   2.80 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
dist/assets/webworkerAll-DDWffsZ9.js         15.93 kB │ gzip:   5.07 kB
dist/assets/CanvasRenderer-O4BvRtf4.js       18.03 kB │ gzip:   6.02 kB
dist/assets/BitmapFont-9wzum0I2.js           34.48 kB │ gzip:  11.75 kB
dist/assets/WebGPURenderer-BWhAVRwz.js       39.14 kB │ gzip:  10.95 kB
dist/assets/browserAll-ia_xT_hB.js           43.26 kB │ gzip:  11.36 kB
dist/assets/RenderTargetSystem-CFcQl21v.js   47.11 kB │ gzip:  12.97 kB
dist/assets/WebGLRenderer-DtPYecu4.js        68.88 kB │ gzip:  18.91 kB
dist/assets/index-BtwFTakN.js               593.28 kB │ gzip: 182.71 kB
✓ built in 1.87s
```

## Stage 3 — Browser bridge and scenarios

### Ambiguities / conservative calls

- Scenario actions scheduled at tick `N` are applied when `world.stepCount >= N` before the next simulation step. This keeps scripted stimuli deterministic and ensures an action at tick 0 can affect the first advanced step.
- The Playwright gate was run against the dev server with real Playwright and Chrome. The Codex in-app Browser rendered the app but its read-only evaluation context could not observe `window.__antzoo`, so I treated that as a tooling limitation and did not change application code around it.
- Scenario seed setup uses `patchTuning("seed.value", value)` before `createWorld`. A CLI `--seed` argument overrides the scenario seed only when explicitly provided.

### Gate 1 — T4 Scenario Replay

Command:

```sh
tmp1=$(mktemp /tmp/antzoo-food-probe-1-XXXXXX.jsonl); tmp2=$(mktemp /tmp/antzoo-food-probe-2-XXXXXX.jsonl); npm run sim -- --scenario scenarios/food-distance-probe.json --hash-every 3000 | rg '^\{' > "$tmp1" && npm run sim -- --scenario scenarios/food-distance-probe.json --hash-every 3000 | rg '^\{' > "$tmp2" && node -e 'const fs = require("fs"); const [a,b] = process.argv.slice(1).map((path) => fs.readFileSync(path, "utf8").trim().split(/\n/).map(JSON.parse)); const hashes = (rows) => rows.filter((row) => row.type === "hash").map((row) => [row.tick, row.hash]); const stimuli = (rows) => rows.filter((row) => row.type === "stimulus").map((row) => `${row.tick}:${row.action.type}:${row.action.tool ?? ""}:${row.action.x ?? ""}:${row.action.y ?? ""}`); console.log("tick\trun1_hash\trun2_hash\tmatch"); const h1 = hashes(a); const h2 = hashes(b); for (let i = 0; i < h1.length; i += 1) console.log(`${h1[i][0]}\t${h1[i][1]}\t${h2[i]?.[1]}\t${h1[i][1] === h2[i]?.[1] ? "yes" : "no"}`); const s1 = stimuli(a); const s2 = stimuli(b); console.log(`stimuli_run1\t${s1.join(",")}`); console.log(`stimuli_run2\t${s2.join(",")}`); console.log(`stimuli_match\t${JSON.stringify(s1) === JSON.stringify(s2) ? "yes" : "no"}`); console.log(`final_hash_match\t${a.at(-1).finalHash === b.at(-1).finalHash ? "yes" : "no"}`);' "$tmp1" "$tmp2"; rm "$tmp1" "$tmp2"
```

Output:

```text
tick	run1_hash	run2_hash	match
3000	da632f9e9efff3ea	da632f9e9efff3ea	yes
6000	66aa53e7c0ecbb67	66aa53e7c0ecbb67	yes
9000	387251a51e3097c1	387251a51e3097c1	yes
12000	31bee59bea75a3bb	31bee59bea75a3bb	yes
stimuli_run1	600:applyTool:food:2300:1150,3600:applyTool:food:2800:1150,9000:applyTool:food:3300:1150
stimuli_run2	600:applyTool:food:2300:1150,3600:applyTool:food:2800:1150,9000:applyTool:food:3300:1150
stimuli_match	yes
final_hash_match	yes
```

### Gate 2 — Playwright Bridge Snippet

Dev server command:

```sh
npm run dev -- --port 5173
```

Playwright command:

```sh
pw_node_modules=$(find /Users/drewgoddyn/.npm/_npx -path '*/node_modules/@playwright/test/index.js' -print | tail -1 | sed 's#/node_modules/@playwright/test/index.js#/node_modules#'); echo "$pw_node_modules"; NODE_PATH="$pw_node_modules" node -e 'const { chromium } = require("playwright"); (async () => { const browser = await chromium.launch({ channel: "chrome", headless: true }); const page = await browser.newPage(); await page.goto("http://127.0.0.1:5173/?seed=1337&paused=1", { waitUntil: "domcontentloaded" }); const result = await page.evaluate(() => { const api = window.__antzoo; if (!api) throw new Error("window.__antzoo missing"); api.pause(); api.step(5000); const snapshot = api.getSnapshot(); return { version: api.version, tick: snapshot.meta.tick, hash: api.getHash(), population: snapshot.factions.player.population.total, hasEventsArray: Array.isArray(api.getEvents()), deathsByCauseIsObject: typeof snapshot.factions.player.deathsByCause === "object" && snapshot.factions.player.deathsByCause !== null, schemaVersion: snapshot.meta.schemaVersion }; }); console.log(JSON.stringify(result, null, 2)); await browser.close(); })().catch((error) => { console.error(error); process.exit(1); });'
```

Output:

```text
/Users/drewgoddyn/.npm/_npx/420ff84f11983ee5/node_modules
{
  "version": "debug-surface-stage3",
  "tick": 5000,
  "hash": "e0c44a8d3303a5dd",
  "population": 190,
  "hasEventsArray": true,
  "deathsByCauseIsObject": true,
  "schemaVersion": 1
}
```

### Gate 3 — Parity Vs Final Stage 2 Commit

Stage 2 commit: `ae0c6f1137a9d3b32004fcadeecd27056e7542a4`

Current Stage 3 command:

```sh
./node_modules/.bin/tsx -e 'import { createWorld, stepWorld } from "./src/sim"; import { hashWorldState } from "./src/debug/snapshot"; import { applyTuningPatch } from "./src/debug/scenario"; import { TUNING } from "./src/tuning"; applyTuningPatch("seed.value", 1337); const world = createWorld(); const checkpoints = new Set([1000, 10000, 50000]); for (let tick = 1; tick <= 50000; tick += 1) { stepWorld(world, 1 / TUNING.time.stepHz); if (checkpoints.has(tick)) console.log(`${tick}\t${hashWorldState(world)}`); }'
```

Output:

```text
1000	897635155d16b44d
10000	206a4c9c844b2de8
50000	23e9d299385713f9
```

Stage 2 temp-worktree command:

```sh
tmpdir=$(mktemp -d /tmp/antzoo-stage2-XXXXXX) && git worktree add --detach "$tmpdir" ae0c6f1137a9d3b32004fcadeecd27056e7542a4 >/tmp/antzoo-worktree-add.log && (cd "$tmpdir" && /Users/drewgoddyn/projects/antzoo/node_modules/.bin/tsx -e 'import { createWorld, stepWorld } from "./src/sim"; import { hashWorldState } from "./src/debug/snapshot"; import { TUNING } from "./src/tuning"; TUNING.seed.value = 1337; const world = createWorld(); const checkpoints = new Set([1000, 10000, 50000]); for (let tick = 1; tick <= 50000; tick += 1) { stepWorld(world, 1 / TUNING.time.stepHz); if (checkpoints.has(tick)) console.log(`${tick}\t${hashWorldState(world)}`); }'); code=$?; git worktree remove "$tmpdir" >/tmp/antzoo-worktree-remove.log; exit $code
```

Output:

```text
Preparing worktree (detached HEAD ae0c6f1)
1000	897635155d16b44d
10000	206a4c9c844b2de8
50000	23e9d299385713f9
```

Parity table:

| Tick | Stage 2 hash | Stage 3 hash | Match |
| ---: | --- | --- | --- |
| 1000 | `897635155d16b44d` | `897635155d16b44d` | yes |
| 10000 | `206a4c9c844b2de8` | `206a4c9c844b2de8` | yes |
| 50000 | `23e9d299385713f9` | `23e9d299385713f9` | yes |

### Gate 4 — Typecheck And Build

Command:

```sh
npm run typecheck
```

Output:

```text

> antzoo@1.0.0 typecheck
> tsc --noEmit

```

Command:

```sh
npm run build
```

Output:

```text

> antzoo@1.0.0 build
> tsc --noEmit && vite build

vite v6.4.3 building for production...
transforming...
✓ 748 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                               0.34 kB │ gzip:   0.25 kB
dist/assets/CanvasPool-CoZzeznv.js            0.78 kB │ gzip:   0.43 kB
dist/assets/Filter-64hp_r40.js                0.90 kB │ gzip:   0.48 kB
dist/assets/BufferResource-CoCWbMIV.js       10.61 kB │ gzip:   2.80 kB
dist/assets/webworkerAll-DqN55L5a.js         15.93 kB │ gzip:   5.07 kB
dist/assets/CanvasRenderer-Dtoala20.js       18.03 kB │ gzip:   6.02 kB
dist/assets/BitmapFont-Do1fdRvO.js           34.48 kB │ gzip:  11.74 kB
dist/assets/WebGPURenderer-BsZcDnEW.js       39.14 kB │ gzip:  10.95 kB
dist/assets/browserAll-w9uG0bcy.js           43.26 kB │ gzip:  11.36 kB
dist/assets/RenderTargetSystem-CZG5L7f8.js   47.11 kB │ gzip:  12.97 kB
dist/assets/WebGLRenderer-t_jCaSb7.js        68.88 kB │ gzip:  18.91 kB
dist/assets/index-DsKo8wDF.js               610.11 kB │ gzip: 187.79 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 6.50s
```

## Stage 4 — Targeted decision traces

### Ambiguities / conservative calls

- `--trace-arm beyondR:N` is interpreted as "trace the next N ants crossing the default dispersion radius"; the radius is the same one-third world diagonal used by snapshots unless the bridge config supplies `beyondRadius`.
- The BRIEF says "one JSONL stream per traced ant headless." The CLI keeps the runner's single JSONL output stream and emits one `trace` record per traced ant tick with the stable `id` on every row, so downstream workers can split by id without managing multiple output files.
- `timer_expired` is included in `transitions[]` even when `from` and `to` are the same mode, because the existing timer expiry does not always cause a mode change.
- The retrospective target was selected literally as the first starvation death after tick 30000. That ant's final 60 ticks had empty `sensors[]` because it did not execute worker steering in that window; I did not cherry-pick a richer-looking death.

### Gate 1 — Traced-run Parity

Command:

```sh
tmp_untraced=$(mktemp /tmp/antzoo-untraced-XXXXXX.jsonl); tmp_traced=$(mktemp /tmp/antzoo-traced-XXXXXX.jsonl); npm run sim -- --seed 1337 --ticks 50000 --hash-every 10000 | rg '^\{' > "$tmp_untraced" && npm run sim -- --seed 1337 --ticks 50000 --hash-every 10000 --trace-ids 1 --trace-window 1:5 | rg '^\{' > "$tmp_traced" && node -e 'const fs = require("fs"); const [a,b] = process.argv.slice(1).map((path) => fs.readFileSync(path, "utf8").trim().split(/\n/).map(JSON.parse)); const hashes = (rows) => rows.filter((row) => row.type === "hash").map((row) => [row.tick, row.hash]); const h1 = hashes(a); const h2 = hashes(b); console.log("tick\tuntraced_hash\ttraced_hash\tmatch"); for (let i = 0; i < h1.length; i += 1) console.log(`${h1[i][0]}\t${h1[i][1]}\t${h2[i]?.[1]}\t${h1[i][1] === h2[i]?.[1] ? "yes" : "no"}`); const s1 = a.find((row) => row.type === "summary"); const s2 = b.find((row) => row.type === "summary"); console.log(`trace_rows\t${b.filter((row) => row.type === "trace").length}`); console.log(`final_untraced\t${s1.finalHash}`); console.log(`final_traced\t${s2.finalHash}`); console.log(`final_match\t${s1.finalHash === s2.finalHash ? "yes" : "no"}`);' "$tmp_untraced" "$tmp_traced"; code=$?; rm "$tmp_untraced" "$tmp_traced"; exit $code
```

Output:

```text
tick	untraced_hash	traced_hash	match
10000	206a4c9c844b2de8	206a4c9c844b2de8	yes
20000	f4812ee284bb3e36	f4812ee284bb3e36	yes
30000	c3aacd70ee76a780	c3aacd70ee76a780	yes
trace_rows	5
final_untraced	23e9d299385713f9
final_traced	23e9d299385713f9
final_match	yes
```

### Gate 2 — Retrospective Targeting Demo

Selection command:

```sh
tmp=$(mktemp /tmp/antzoo-baseline-events-XXXXXX.jsonl); npm run sim -- --scenario scenarios/baseline-1337.json --events full | rg '^\{' > "$tmp"; echo "rows=$(wc -l < "$tmp")"; node -e 'const fs = require("fs"); const rows = fs.readFileSync(process.argv[1], "utf8").trim().split(/\n/).filter(Boolean).map(JSON.parse); const event = rows.find((row) => row.type === "event" && row.event.type === "death" && row.event.cause === "starvation" && row.event.tick > 30000); if (!event) { console.log("no post-30000 starvation death"); process.exit(2); } console.log(JSON.stringify(event));' "$tmp"; code=$?; rm "$tmp"; exit $code
```

Output:

```text
rows=     506
{"type":"event","event":{"type":"death","tick":31398,"faction":0,"cause":"starvation","id":386,"birthTick":24174,"age":7224,"deliveries":0,"distanceTraveled":5668.51953125,"ticksInMode":[120.41123962402344,0,0],"ticksSinceLastDelivery":120.41123962402344,"ticksSinceFoodPerceived":120.41123962402344}}
```

Trace command:

```sh
npm run sim -- --scenario scenarios/baseline-1337.json --trace-ids 386 --trace-window 31339:31398 | rg '^\{' | node -e 'const fs = require("fs"); const rows = fs.readFileSync(0, "utf8").trim().split(/\n/).filter(Boolean).map(JSON.parse); const traces = rows.filter((row) => row.type === "trace").slice(-60); console.log("selected_starvation_death id=386 tick=31398 window=31339:31398"); for (const row of traces) console.log(JSON.stringify(row)); const summary = rows.find((row) => row.type === "summary"); console.log(JSON.stringify({type:"trace_demo_summary", traceRows: traces.length, finalHash: summary.finalHash, finalTick: summary.finalTick, outcome: summary.outcome}));'
```

Output:

```text
selected_starvation_death id=386 tick=31398 window=31339:31398
{"type":"trace","trace":{"type":"tick","tick":31339,"id":386,"x":1986.1141357421875,"y":1227.3671875,"heading":0.6649394631385803,"mode":0,"energy":1.1842942237854004,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31340,"id":386,"x":1986.826171875,"y":1227.917724609375,"heading":0.6581935286521912,"mode":0,"energy":1.1642942428588867,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31341,"id":386,"x":1987.4898681640625,"y":1228.525634765625,"heading":0.7415268421173096,"mode":0,"energy":1.144294261932373,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31342,"id":386,"x":1988.1905517578125,"y":1229.0904541015625,"heading":0.6783939003944397,"mode":0,"energy":1.1242942810058594,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31343,"id":386,"x":1988.8707275390625,"y":1229.6798095703125,"heading":0.7140030264854431,"mode":0,"energy":1.1042943000793457,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31344,"id":386,"x":1989.5511474609375,"y":1230.268798828125,"heading":0.7135092616081238,"mode":0,"energy":1.084294319152832,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31345,"id":386,"x":1990.2783203125,"y":1230.7991943359375,"heading":0.6301759481430054,"mode":0,"energy":1.0642943382263184,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31346,"id":386,"x":1991.047119140625,"y":1231.2672119140625,"heading":0.546842634677887,"mode":0,"energy":1.0442943572998047,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31347,"id":386,"x":1991.7742919921875,"y":1231.797607421875,"heading":0.6301759481430054,"mode":0,"energy":1.024294376373291,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31348,"id":386,"x":1992.5430908203125,"y":1232.265625,"heading":0.546842634677887,"mode":0,"energy":1.0042943954467773,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31349,"id":386,"x":1993.270263671875,"y":1232.7960205078125,"heading":0.6301759481430054,"mode":0,"energy":0.9842944145202637,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31350,"id":386,"x":1994.0390625,"y":1233.2640380859375,"heading":0.546842634677887,"mode":0,"energy":0.96429443359375,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31351,"id":386,"x":1994.835693359375,"y":1233.682861328125,"heading":0.4840053617954254,"mode":0,"energy":0.9442944526672363,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31352,"id":386,"x":1995.617431640625,"y":1234.1287841796875,"heading":0.51838618516922,"mode":0,"energy":0.9242944717407227,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31353,"id":386,"x":1996.359375,"y":1234.63818359375,"heading":0.6017194986343384,"mode":0,"energy":0.904294490814209,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31354,"id":386,"x":1997.14111328125,"y":1235.0841064453125,"heading":0.51838618516922,"mode":0,"energy":0.8842945098876953,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31355,"id":386,"x":1997.916259765625,"y":1235.5413818359375,"heading":0.5329781770706177,"mode":0,"energy":0.8642945289611816,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31356,"id":386,"x":1998.658203125,"y":1236.05078125,"heading":0.6017099022865295,"mode":0,"energy":0.844294548034668,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31357,"id":386,"x":1999.4197998046875,"y":1236.5302734375,"heading":0.5618636608123779,"mode":0,"energy":0.8242945671081543,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31358,"id":386,"x":2000.21875,"y":1236.9447021484375,"heading":0.47853031754493713,"mode":0,"energy":0.8042945861816406,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31359,"id":386,"x":2000.9803466796875,"y":1237.4241943359375,"heading":0.5618636608123779,"mode":0,"energy":0.784294605255127,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31360,"id":386,"x":2001.779296875,"y":1237.838623046875,"heading":0.47853031754493713,"mode":0,"energy":0.7642946243286133,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31361,"id":386,"x":2002.6099853515625,"y":1238.18505859375,"heading":0.39519697427749634,"mode":0,"energy":0.7442946434020996,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31362,"id":386,"x":2003.43896484375,"y":1238.535400390625,"heading":0.39984753727912903,"mode":0,"energy":0.7242946624755859,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31363,"id":386,"x":2004.2801513671875,"y":1238.855224609375,"heading":0.36335086822509766,"mode":0,"energy":0.7042946815490723,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31364,"id":386,"x":2005.091796875,"y":1239.2440185546875,"heading":0.44668421149253845,"mode":0,"energy":0.6842947006225586,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31365,"id":386,"x":2005.923583984375,"y":1239.587646484375,"heading":0.3918065130710602,"mode":0,"energy":0.6642947196960449,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31366,"id":386,"x":2006.7734375,"y":1239.8837890625,"heading":0.3352445662021637,"mode":0,"energy":0.6442947387695312,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31367,"id":386,"x":2007.6314697265625,"y":1240.155517578125,"heading":0.3066392242908478,"mode":0,"energy":0.6242947578430176,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31368,"id":386,"x":2008.46923828125,"y":1240.4844970703125,"heading":0.37415581941604614,"mode":0,"energy":0.6042947769165039,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31369,"id":386,"x":2009.3026123046875,"y":1240.8243408203125,"heading":0.38722485303878784,"mode":0,"energy":0.5842947959899902,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31370,"id":386,"x":2010.135986328125,"y":1241.1641845703125,"heading":0.3872387111186981,"mode":0,"energy":0.5642948150634766,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31371,"id":386,"x":2010.9381103515625,"y":1241.572265625,"heading":0.4705720543861389,"mode":0,"energy":0.5442948341369629,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31372,"id":386,"x":2011.7244873046875,"y":1242.010009765625,"heading":0.5078954696655273,"mode":0,"energy":0.5242948532104492,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31373,"id":386,"x":2012.5445556640625,"y":1242.3807373046875,"heading":0.42456212639808655,"mode":0,"energy":0.5042948722839355,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31374,"id":386,"x":2013.33447265625,"y":1242.8121337890625,"heading":0.49981415271759033,"mode":0,"energy":0.4842948615550995,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31375,"id":386,"x":2014.1575927734375,"y":1243.17626953125,"heading":0.41648080945014954,"mode":0,"energy":0.4642948508262634,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31376,"id":386,"x":2014.9510498046875,"y":1243.60107421875,"heading":0.4914942681789398,"mode":0,"energy":0.44429484009742737,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31377,"id":386,"x":2015.7657470703125,"y":1243.9833984375,"heading":0.4387858510017395,"mode":0,"energy":0.4242948293685913,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31378,"id":386,"x":2016.6094970703125,"y":1244.296630859375,"heading":0.3554525077342987,"mode":0,"energy":0.40429481863975525,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31379,"id":386,"x":2017.4764404296875,"y":1244.53857421875,"heading":0.2721191644668579,"mode":0,"energy":0.3842948079109192,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31380,"id":386,"x":2018.343017578125,"y":1244.78173828125,"heading":0.2736062705516815,"mode":0,"energy":0.36429479718208313,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31381,"id":386,"x":2019.2252197265625,"y":1244.9600830078125,"heading":0.19942593574523926,"mode":0,"energy":0.34429478645324707,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31382,"id":386,"x":2020.0894775390625,"y":1245.211181640625,"heading":0.28275927901268005,"mode":0,"energy":0.324294775724411,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31383,"id":386,"x":2020.9298095703125,"y":1245.5333251953125,"heading":0.36609262228012085,"mode":0,"energy":0.30429476499557495,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31384,"id":386,"x":2021.7515869140625,"y":1245.900146484375,"heading":0.4198516011238098,"mode":0,"energy":0.2842947542667389,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31385,"id":386,"x":2022.60107421875,"y":1246.1973876953125,"heading":0.336518257856369,"mode":0,"energy":0.26429474353790283,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31386,"id":386,"x":2023.472412109375,"y":1246.4228515625,"heading":0.2531849145889282,"mode":0,"energy":0.24429474771022797,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31387,"id":386,"x":2024.35107421875,"y":1246.61767578125,"heading":0.21823441982269287,"mode":0,"energy":0.2242947518825531,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31388,"id":386,"x":2025.21044921875,"y":1246.885009765625,"heading":0.30156776309013367,"mode":0,"energy":0.20429475605487823,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31389,"id":386,"x":2026.0770263671875,"y":1247.1279296875,"heading":0.2732391059398651,"mode":0,"energy":0.18429476022720337,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31390,"id":386,"x":2026.9603271484375,"y":1247.3006591796875,"heading":0.19305412471294403,"mode":0,"energy":0.1642947643995285,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31391,"id":386,"x":2027.8548583984375,"y":1247.399169921875,"heading":0.10972078889608383,"mode":0,"energy":0.14429476857185364,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31392,"id":386,"x":2028.7381591796875,"y":1247.5718994140625,"heading":0.19305412471294403,"mode":0,"energy":0.12429476529359818,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31393,"id":386,"x":2029.6297607421875,"y":1247.6947021484375,"heading":0.13682270050048828,"mode":0,"energy":0.10429476201534271,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31394,"id":386,"x":2030.5198974609375,"y":1247.827880859375,"heading":0.1485474854707718,"mode":0,"energy":0.08429475873708725,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31395,"id":386,"x":2031.395751953125,"y":1248.03466796875,"heading":0.2318808138370514,"mode":0,"energy":0.06429475545883179,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31396,"id":386,"x":2032.285888671875,"y":1248.1678466796875,"heading":0.1485474854707718,"mode":0,"energy":0.04429475590586662,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31397,"id":386,"x":2033.18115234375,"y":1248.2598876953125,"heading":0.1024879515171051,"mode":0,"energy":0.02429475635290146,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[]}}
{"type":"trace","trace":{"type":"tick","tick":31398,"id":386,"x":2034.0753173828125,"y":1248.3621826171875,"heading":0.11392668634653091,"mode":0,"energy":0.004294756334275007,"carrying":0,"timerA":0,"timerB":0,"sensors":[],"transitions":[],"interactions":[{"kind":"starvation","cause":"starvation","faction":0}]}}
{"type":"trace_demo_summary","traceRows":60,"finalHash":"23e9d299385713f9","finalTick":33235,"outcome":"victory"}
```

### Gate 3 — Throughput Regression Vs Stage 1

Stage 1 default throughput: `949.5291338308674` ticks/sec. Stage 1 1200-ant throughput: `350.889104984984` ticks/sec.

Default command:

```sh
npm run sim -- --seed 1337 --ticks 50000
```

Output:

```text

> antzoo@1.0.0 sim
> tsx scripts/run.ts --seed 1337 --ticks 50000

{"type":"summary","outcome":"victory","finalTick":33235,"finalHash":"23e9d299385713f9","peakPopulation":354,"ticksPerSecond":1054.2531234786475}
```

Stress command:

```sh
npm run sim -- --seed 1337 --ticks 50000 --stress-ants 1200
```

Output:

```text

> antzoo@1.0.0 sim
> tsx scripts/run.ts --seed 1337 --ticks 50000 --stress-ants 1200

{"type":"summary","outcome":"gameOver","finalTick":15594,"finalHash":"36ab424a76d914d6","peakPopulation":1200,"ticksPerSecond":383.5867987394844}
```

Regression report:

| Config | Stage 1 ticks/sec | Stage 4 untraced ticks/sec | Change |
| --- | ---: | ---: | ---: |
| default | 949.5291338308674 | 1054.2531234786475 | +11.03% |
| 1200 ants | 350.889104984984 | 383.5867987394844 | +9.32% |

Untraced overhead is under 5%; this run measured faster than Stage 1.

### Gate 4 — Parity Vs Final Stage 3 Commit

Stage 3 commit: `0908a08cf1f724aa84a8d5bdac58bf466aecbb20`

Current Stage 4 command:

```sh
./node_modules/.bin/tsx -e 'import { createWorld, stepWorld } from "./src/sim"; import { hashWorldState } from "./src/debug/snapshot"; import { applyTuningPatch } from "./src/debug/scenario"; import { TUNING } from "./src/tuning"; applyTuningPatch("seed.value", 1337); const world = createWorld(); const checkpoints = new Set([1000, 10000, 50000]); for (let tick = 1; tick <= 50000; tick += 1) { stepWorld(world, 1 / TUNING.time.stepHz); if (checkpoints.has(tick)) console.log(`${tick}\t${hashWorldState(world)}`); }'
```

Output:

```text
1000	897635155d16b44d
10000	206a4c9c844b2de8
50000	23e9d299385713f9
```

Stage 3 temp-worktree command:

```sh
tmpdir=$(mktemp -d /tmp/antzoo-stage3-XXXXXX) && git worktree add --detach "$tmpdir" 0908a08cf1f724aa84a8d5bdac58bf466aecbb20 >/tmp/antzoo-worktree-add.log && (cd "$tmpdir" && /Users/drewgoddyn/projects/antzoo/node_modules/.bin/tsx -e 'import { createWorld, stepWorld } from "./src/sim"; import { hashWorldState } from "./src/debug/snapshot"; import { applyTuningPatch } from "./src/debug/scenario"; import { TUNING } from "./src/tuning"; applyTuningPatch("seed.value", 1337); const world = createWorld(); const checkpoints = new Set([1000, 10000, 50000]); for (let tick = 1; tick <= 50000; tick += 1) { stepWorld(world, 1 / TUNING.time.stepHz); if (checkpoints.has(tick)) console.log(`${tick}\t${hashWorldState(world)}`); }'); code=$?; git worktree remove "$tmpdir" >/tmp/antzoo-worktree-remove.log; exit $code
```

Output:

```text
Preparing worktree (detached HEAD 0908a08)
1000	897635155d16b44d
10000	206a4c9c844b2de8
50000	23e9d299385713f9
```

Parity table:

| Tick | Stage 3 hash | Stage 4 hash | Match |
| ---: | --- | --- | --- |
| 1000 | `897635155d16b44d` | `897635155d16b44d` | yes |
| 10000 | `206a4c9c844b2de8` | `206a4c9c844b2de8` | yes |
| 50000 | `23e9d299385713f9` | `23e9d299385713f9` | yes |

### Gate 5 — Tests, Typecheck, And Build

Command:

```sh
npm test
```

Output:

```text

> antzoo@1.0.0 test
> tsx scripts/test-debug.ts

PASS T0 rng
PASS T0 time
PASS T0 stepCount
PASS T0 ants.x
PASS T0 ants.y
PASS T0 ants.heading
PASS T0 ants.energy
PASS T0 ants.stepsSincePickup
PASS T0 ants.timerA
PASS T0 ants.timerB
PASS T0 ants.mode
PASS T0 ants.carrying
PASS T0 ants.flags
PASS T0 ants.caste
PASS T0 ants.faction
PASS T0 spatial
PASS T0 grid.pherFood.player
PASS T0 grid.pherFood.rival
PASS T0 grid.pherHome.player
PASS T0 grid.pherHome.rival
PASS T0 grid.pherDanger
PASS T0 grid.lure
PASS T0 grid.moisture
PASS T0 grid.foodAmt
PASS T0 grid.bookkeeping
PASS T0 nestFood.player
PASS T0 nestFood.rival
PASS T0 queen/brood.player
PASS T0 queen/brood.rival
PASS T0 rival struct
PASS T0 spider
PASS T0 bushes
PASS T0 carcass
PASS T0 corpses
PASS T0 obstacles
PASS T0 combatMarks
PASS T0 debug-only field
PASS T0 debug ant id
PASS T0 debug ant birthTick
PASS T0 debug ant distanceTraveled
PASS T0 debug ant ticksInMode
PASS T0 debug ant deliveries
PASS T0 debug ant ticksSinceLastDelivery
PASS T0 debug ant ticksSinceFoodPerceived
PASS T0 debug trace active
PASS T0 debug trace beyondR
PASS T0 debug trace record
PASS T1 same seed hashes at 1k/10k/50k
PASS T1 different seeds diverge by 1k
PASS T2 sample-every 100 vs no sampling final hash
PASS T3 death accounting - top causes: starvation=347, spider=21, terminal_cull=10
PASS T3 id uniqueness over 50k
PASS T5 traced run matches untraced hash
PASS T5 trace rows captured - rows=4096
```

Command:

```sh
npm run typecheck
```

Output:

```text

> antzoo@1.0.0 typecheck
> tsc --noEmit

```

Command:

```sh
npm run build
```

Output:

```text

> antzoo@1.0.0 build
> tsc --noEmit && vite build

vite v6.4.3 building for production...
transforming...
✓ 748 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                               0.34 kB │ gzip:   0.25 kB
dist/assets/CanvasPool-DLNx4bdG.js            0.78 kB │ gzip:   0.43 kB
dist/assets/Filter-Z1tDTyCG.js                0.90 kB │ gzip:   0.47 kB
dist/assets/BufferResource-BioPunpx.js       10.61 kB │ gzip:   2.80 kB
dist/assets/webworkerAll-BKHdk-Ld.js         15.93 kB │ gzip:   5.07 kB
dist/assets/CanvasRenderer-BzxM-Wxj.js       18.03 kB │ gzip:   6.01 kB
dist/assets/BitmapFont-BuHyeAw1.js           34.48 kB │ gzip:  11.75 kB
dist/assets/WebGPURenderer-CngroGzR.js       39.14 kB │ gzip:  10.95 kB
dist/assets/browserAll-B9INjlm-.js           43.26 kB │ gzip:  11.36 kB
dist/assets/RenderTargetSystem-BO95vEyu.js   47.11 kB │ gzip:  12.97 kB
dist/assets/WebGLRenderer-BZnvlcFf.js        68.88 kB │ gzip:  18.91 kB
dist/assets/index-DuVAKsg2.js               615.18 kB │ gzip: 189.36 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 2.10s
```

## Remediation

### Findings Addressed

- F1: `hashWorldState(world)` now includes a deterministic digest of gameplay-affecting tuning. Presentation-only tuning remains excluded.
- F2: `DEBUG.md` now states that `tick`, `birthTick`, and `age` are ticks, while obituary `ticksInMode`, `ticksSinceLastDelivery`, and `ticksSinceFoodPerceived` are simulated seconds despite their historical names.
- F3: `DEBUG.md` now includes a complete Playwright gate command, and `playwright-core` is a dev dependency so the command can import the browser API from this repo.
- F4: `DEBUG.md` now uses demonstrative trace examples for the committed baseline and explicitly labels `nan_respawn` as an incident arm that may emit zero rows on a finite run.

### F1 - Tuning Hash Reproduction

Command:

```sh
./node_modules/.bin/tsx -e 'import { createWorld, stepWorld } from "./src/sim"; import { hashWorldState } from "./src/debug/snapshot"; import { applyTuningPatch } from "./src/debug/scenario"; import { TUNING } from "./src/tuning"; TUNING.seed.value = 1337; const a = createWorld(); const b = createWorld(); for (let i = 0; i < 5000; i += 1) { stepWorld(a, 1 / TUNING.time.stepHz); stepWorld(b, 1 / TUNING.time.stepHz); } const beforeA = hashWorldState(a); const beforeB = hashWorldState(b); applyTuningPatch("ant.drainPerSec", TUNING.ant.drainPerSec + 0.1); const afterA = hashWorldState(a); const afterB = hashWorldState(b); console.log(`before_same\t${beforeA === beforeB ? "yes" : "no"}\t${beforeA}\t${beforeB}`); console.log(`after_tuning_same_between_worlds\t${afterA === afterB ? "yes" : "no"}\t${afterA}\t${afterB}`); console.log(`tuning_changed_hash\t${beforeA !== afterA ? "yes" : "no"}`);'
```

Output:

```text
before_same	yes	632028e9736dd465	632028e9736dd465
after_tuning_same_between_worlds	yes	ec542375c325ecc1	ec542375c325ecc1
tuning_changed_hash	yes
```

### Test Gate - T0, T1, T2, T3, T5

Command:

```sh
npm test
```

Output:

```text

> antzoo@1.0.0 test
> tsx scripts/test-debug.ts

PASS T0 rng
PASS T0 time
PASS T0 stepCount
PASS T0 ants.x
PASS T0 ants.y
PASS T0 ants.heading
PASS T0 ants.energy
PASS T0 ants.stepsSincePickup
PASS T0 ants.timerA
PASS T0 ants.timerB
PASS T0 ants.mode
PASS T0 ants.carrying
PASS T0 ants.flags
PASS T0 ants.caste
PASS T0 ants.faction
PASS T0 spatial
PASS T0 grid.pherFood.player
PASS T0 grid.pherFood.rival
PASS T0 grid.pherHome.player
PASS T0 grid.pherHome.rival
PASS T0 grid.pherDanger
PASS T0 grid.lure
PASS T0 grid.moisture
PASS T0 grid.foodAmt
PASS T0 grid.bookkeeping
PASS T0 nestFood.player
PASS T0 nestFood.rival
PASS T0 queen/brood.player
PASS T0 queen/brood.rival
PASS T0 rival struct
PASS T0 spider
PASS T0 bushes
PASS T0 carcass
PASS T0 corpses
PASS T0 obstacles
PASS T0 combatMarks
PASS T0 tuning ant.drainPerSec
PASS T0 tuning ui.hudHz
PASS T0 debug-only field
PASS T0 debug ant id
PASS T0 debug ant birthTick
PASS T0 debug ant distanceTraveled
PASS T0 debug ant ticksInMode
PASS T0 debug ant deliveries
PASS T0 debug ant ticksSinceLastDelivery
PASS T0 debug ant ticksSinceFoodPerceived
PASS T0 debug trace active
PASS T0 debug trace beyondR
PASS T0 debug trace record
PASS T1 same seed hashes at 1k/10k/50k
PASS T1 different seeds diverge by 1k
PASS T2 sample-every 100 vs no sampling final hash
PASS T3 death accounting - top causes: starvation=347, spider=21, terminal_cull=10
PASS T3 id uniqueness over 50k
PASS T5 traced run matches untraced hash
PASS T5 trace rows captured - rows=4096
```

### F2 - Obituary Unit Evidence

Command:

```sh
npm run sim -- --seed 1337 --ticks 50000 --events full | rg '^\{"type":"event"|^\{"type":"summary"' | node -e 'const fs=require("fs"); const rows=fs.readFileSync(0,"utf8").trim().split(/\n/).filter(Boolean).map(JSON.parse); const death=rows.find(r=>r.type==="event" && r.event.type==="death" && r.event.age>0); const e=death.event; const modeSum=e.ticksInMode.reduce((a,b)=>a+b,0); console.log(JSON.stringify({id:e.id, tick:e.tick, ageTicks:e.age, modeSeconds:modeSum, ticksSinceLastDeliverySeconds:e.ticksSinceLastDelivery, ticksSinceFoodPerceivedSeconds:e.ticksSinceFoodPerceived, ageSeconds:e.age/60}, null, 2));'
```

Output:

```json
{
  "id": 242,
  "tick": 3526,
  "ageTicks": 3526,
  "modeSeconds": 58.76611328125,
  "ticksSinceLastDeliverySeconds": 58.76594161987305,
  "ticksSinceFoodPerceivedSeconds": 0,
  "ageSeconds": 58.766666666666666
}
```

### F3 - Playwright Browser Gate

Dev server command:

```sh
npm run dev -- --port 5173
```

Output:

```text

> antzoo@1.0.0 dev
> vite --host 127.0.0.1 --port 5173

2:33:15 PM [vite] (client) Re-optimizing dependencies because lockfile has changed

  VITE v6.4.3  ready in 176 ms

  Local:   http://127.0.0.1:5173/
```

Playwright command:

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

Output:

```json
{
  "version": "debug-surface-stage4",
  "tick": 5000,
  "hash": "632028e9736dd465",
  "population": 190,
  "hasEventsArray": true,
  "deathsByCauseIsObject": true,
  "schemaVersion": 1
}
```

### F4 - Trace Examples

Command:

```sh
npm run sim -- --scenario scenarios/baseline-1337.json --trace-ids 386 --trace-window 31339:31398 | rg '^\{"type":"trace"|^\{"type":"summary"' | node -e 'const fs=require("fs"); const rows=fs.readFileSync(0,"utf8").trim().split(/\n/).filter(Boolean).map(JSON.parse); console.log(JSON.stringify({traceRows: rows.filter(r=>r.type==="trace").length, ids:[...new Set(rows.filter(r=>r.type==="trace").map(r=>r.trace.id))], firstTick: rows.find(r=>r.type==="trace")?.trace.tick, lastTick: rows.filter(r=>r.type==="trace").at(-1)?.trace.tick, summary: rows.find(r=>r.type==="summary")}, null, 2));'
```

Output:

```json
{
  "traceRows": 60,
  "ids": [
    386
  ],
  "firstTick": 31339,
  "lastTick": 31398,
  "summary": {
    "type": "summary",
    "outcome": "victory",
    "finalTick": 33235,
    "finalHash": "5101d7c52c007c01",
    "peakPopulation": 354,
    "ticksPerSecond": 1086.9836834265689
  }
}
```

Command:

```sh
npm run sim -- --seed 1337 --ticks 50000 --trace-arm beyondR:5 | rg '^\{"type":"trace"|^\{"type":"summary"' | node -e 'const fs=require("fs"); const text=fs.readFileSync(0,"utf8").trim(); const rows=text?text.split(/\n/).filter(Boolean).map(JSON.parse):[]; console.log(JSON.stringify({traceRows: rows.filter(r=>r.type==="trace").length, ids:[...new Set(rows.filter(r=>r.type==="trace").map(r=>r.trace.id))], summary: rows.find(r=>r.type==="summary")}, null, 2));'
```

Output:

```json
{
  "traceRows": 28442,
  "ids": [
    188,
    113,
    57,
    76,
    179
  ],
  "summary": {
    "type": "summary",
    "outcome": "victory",
    "finalTick": 33235,
    "finalHash": "5101d7c52c007c01",
    "peakPopulation": 354,
    "ticksPerSecond": 1082.666296650255
  }
}
```

Command:

```sh
npm run sim -- --seed 1337 --ticks 50000 --trace-arm nan_respawn | rg '^\{"type":"trace"|^\{"type":"summary"' | node -e 'const fs=require("fs"); const text=fs.readFileSync(0,"utf8").trim(); const rows=text?text.split(/\n/).filter(Boolean).map(JSON.parse):[]; console.log(JSON.stringify({traceRows: rows.filter(r=>r.type==="trace").length, ids:[...new Set(rows.filter(r=>r.type==="trace").map(r=>r.trace.id))], summary: rows.find(r=>r.type==="summary")}, null, 2));'
```

Output:

```json
{
  "traceRows": 0,
  "ids": [],
  "summary": {
    "type": "summary",
    "outcome": "victory",
    "finalTick": 33235,
    "finalHash": "5101d7c52c007c01",
    "peakPopulation": 354,
    "ticksPerSecond": 1079.8299195584787
  }
}
```

### Scenario Replay Gate

Command:

```sh
tmp1=$(mktemp /tmp/antzoo-remed-food-probe-1-XXXXXX.jsonl); tmp2=$(mktemp /tmp/antzoo-remed-food-probe-2-XXXXXX.jsonl); npm run sim -- --scenario scenarios/food-distance-probe.json --hash-every 3000 | rg '^\{' > "$tmp1" && npm run sim -- --scenario scenarios/food-distance-probe.json --hash-every 3000 | rg '^\{' > "$tmp2" && node -e 'const fs = require("fs"); const [a,b] = process.argv.slice(1).map((path) => fs.readFileSync(path, "utf8").trim().split(/\n/).map(JSON.parse)); const hashes = (rows) => rows.filter((row) => row.type === "hash").map((row) => [row.tick, row.hash]); const stimuli = (rows) => rows.filter((row) => row.type === "stimulus").map((row) => `${row.tick}:${row.action.do}:${row.action.tool ?? ""}:${row.action.x ?? ""}:${row.action.y ?? ""}`); console.log("tick\trun1_hash\trun2_hash\tmatch"); const h1 = hashes(a); const h2 = hashes(b); for (let i = 0; i < h1.length; i += 1) console.log(`${h1[i][0]}\t${h1[i][1]}\t${h2[i]?.[1]}\t${h1[i][1] === h2[i]?.[1] ? "yes" : "no"}`); const s1 = stimuli(a); const s2 = stimuli(b); console.log(`stimuli_run1\t${s1.join(",")}`); console.log(`stimuli_run2\t${s2.join(",")}`); console.log(`stimuli_match\t${JSON.stringify(s1) === JSON.stringify(s2) ? "yes" : "no"}`); console.log(`final_hash_match\t${a.at(-1).finalHash === b.at(-1).finalHash ? "yes" : "no"}`);' "$tmp1" "$tmp2"; code=$?; rm "$tmp1" "$tmp2"; exit $code
```

Output:

```text
tick	run1_hash	run2_hash	match
3000	1d17eb0a3c502152	1d17eb0a3c502152	yes
6000	9a6972c3715b1c9f	9a6972c3715b1c9f	yes
9000	8c0f100995d8b509	8c0f100995d8b509	yes
12000	12dd610706bfe653	12dd610706bfe653	yes
stimuli_run1	600:applyTool:food:2300:1150,3600:applyTool:food:2800:1150,9000:applyTool:food:3300:1150
stimuli_run2	600:applyTool:food:2300:1150,3600:applyTool:food:2800:1150,9000:applyTool:food:3300:1150
stimuli_match	yes
final_hash_match	yes
```

### Traced-Run Parity Gate

Command:

```sh
tmp_untraced=$(mktemp /tmp/antzoo-remed-untraced-XXXXXX.jsonl); tmp_traced=$(mktemp /tmp/antzoo-remed-traced-XXXXXX.jsonl); npm run sim -- --seed 1337 --ticks 50000 --hash-every 10000 | rg '^\{' > "$tmp_untraced" && npm run sim -- --seed 1337 --ticks 50000 --hash-every 10000 --trace-ids 1 --trace-window 1:5 | rg '^\{' > "$tmp_traced" && node -e 'const fs = require("fs"); const [a,b] = process.argv.slice(1).map((path) => fs.readFileSync(path, "utf8").trim().split(/\n/).map(JSON.parse)); const hashes = (rows) => rows.filter((row) => row.type === "hash").map((row) => [row.tick, row.hash]); const h1 = hashes(a); const h2 = hashes(b); console.log("tick\tuntraced_hash\ttraced_hash\tmatch"); for (let i = 0; i < h1.length; i += 1) console.log(`${h1[i][0]}\t${h1[i][1]}\t${h2[i]?.[1]}\t${h1[i][1] === h2[i]?.[1] ? "yes" : "no"}`); const s1 = a.find((row) => row.type === "summary"); const s2 = b.find((row) => row.type === "summary"); console.log(`trace_rows\t${b.filter((row) => row.type === "trace").length}`); console.log(`final_untraced\t${s1.finalHash}`); console.log(`final_traced\t${s2.finalHash}`); console.log(`final_match\t${s1.finalHash === s2.finalHash ? "yes" : "no"}`);' "$tmp_untraced" "$tmp_traced"; code=$?; rm "$tmp_untraced" "$tmp_traced"; exit $code
```

Output:

```text
tick	untraced_hash	traced_hash	match
10000	f3a0258093e285b0	f3a0258093e285b0	yes
20000	a77b2856f9e8a95e	a77b2856f9e8a95e	yes
30000	1aaad77433d11398	1aaad77433d11398	yes
trace_rows	5
final_untraced	5101d7c52c007c01
final_traced	5101d7c52c007c01
final_match	yes
```

### Typecheck And Build

Command:

```sh
npm run typecheck
```

Output:

```text

> antzoo@1.0.0 typecheck
> tsc --noEmit

```

Command:

```sh
npm run build
```

Output:

```text

> antzoo@1.0.0 build
> tsc --noEmit && vite build

vite v6.4.3 building for production...
transforming...
✓ 748 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                               0.34 kB │ gzip:   0.25 kB
dist/assets/CanvasPool-BAJh6kCN.js            0.78 kB │ gzip:   0.43 kB
dist/assets/Filter-DIXPRB-p.js                0.90 kB │ gzip:   0.48 kB
dist/assets/BufferResource-ycL7o52C.js       10.61 kB │ gzip:   2.80 kB
dist/assets/webworkerAll-Dh8k7ReG.js         15.93 kB │ gzip:   5.07 kB
dist/assets/CanvasRenderer-DSqUZBNP.js       18.03 kB │ gzip:   6.01 kB
dist/assets/BitmapFont-mnoY0HNJ.js           34.48 kB │ gzip:  11.75 kB
dist/assets/WebGPURenderer-BreTx7C3.js       39.14 kB │ gzip:  10.95 kB
dist/assets/browserAll-B_mqonX_.js           43.26 kB │ gzip:  11.36 kB
dist/assets/RenderTargetSystem-Bk9SDqUD.js   47.11 kB │ gzip:  12.97 kB
dist/assets/WebGLRenderer-Bt8V9CCS.js        68.88 kB │ gzip:  18.92 kB
dist/assets/index-Mn7I1hqi.js               616.43 kB │ gzip: 189.78 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 1.75s
```

## Fleet ergonomics

### Gate 1 - Summary interval flows and obituary rollups

Command:

```sh
npm run sim -- --seed 1337 --ticks 12000 --sample-every 6000 | rg '^\{' | node -e 'const fs = require("fs"); const rows = fs.readFileSync(0, "utf8").trim().split(/\n/).filter(Boolean).map(JSON.parse); for (const row of rows) { if (row.type === "snapshot") console.log(JSON.stringify({type: row.type, tick: row.snapshot.meta.tick, intervalFlow: row.intervalFlow})); if (row.type === "summary") console.log(JSON.stringify({type: row.type, seed: row.seed, finalTick: row.finalTick, finalHash: row.finalHash, flowTotals: row.flowTotals, playerStarvationObituary: row.obituaryAggregates.player.starvation, rivalStarvationObituary: row.obituaryAggregates.rival.starvation})); }'
```

Output:

```text
{"type":"snapshot","tick":6000,"intervalFlow":{"player":{"foodDelivered":424,"queenConsumed":0,"broodConsumed":211,"snackEnergyGained":4122.630657672882,"drainTotal":20639.42000035767},"rival":{"foodDelivered":179,"queenConsumed":0,"broodConsumed":77,"snackEnergyGained":1392.6122517585754,"drainTotal":18748.120000316387}}}
{"type":"snapshot","tick":12000,"intervalFlow":{"player":{"foodDelivered":169,"queenConsumed":0,"broodConsumed":50,"snackEnergyGained":2027.3415369987488,"drainTotal":16079.899999632245},"rival":{"foodDelivered":259,"queenConsumed":0,"broodConsumed":60,"snackEnergyGained":1325.2581105232239,"drainTotal":12812.680000279674}}}
{"type":"summary","seed":1337,"finalTick":12000,"finalHash":"7e2023a63ede5c52","flowTotals":{"player":{"foodDelivered":593,"queenConsumed":0,"broodConsumed":261,"snackEnergyGained":6149.972194671631,"drainTotal":36719.319999989915},"rival":{"foodDelivered":438,"queenConsumed":0,"broodConsumed":137,"snackEnergyGained":2717.8703622817993,"drainTotal":31560.80000059606}},"playerStarvationObituary":{"count":108,"medianAge":7946,"medianDeliveries":1,"medianTicksSinceFoodPerceived":75.17657852172852},"rivalStarvationObituary":{"count":72,"medianAge":5001,"medianDeliveries":0,"medianTicksSinceFoodPerceived":49.3327522277832}}
```

### Gate 2 - Batch seeds and replicates

Command:

```sh
npm run sim -- --seeds 1337,7331 --replicates 2 --ticks 10000 | rg '^\{' | node -e 'const fs = require("fs"); const rows = fs.readFileSync(0, "utf8").trim().split(/\n/).filter(Boolean).map(JSON.parse); for (const row of rows) console.log(JSON.stringify({type: row.type, seed: row.seed, runs: row.runs, hashesAllMatch: row.hashesAllMatch, factionOutcomeCounts: row.factionOutcomeCounts, deathsByCauseMedians: row.deathsByCauseMedians, populationQuartiles: row.populationQuartiles}));'
```

Output:

```text
{"type":"seed_summary","seed":1337,"runs":2,"hashesAllMatch":true,"factionOutcomeCounts":{"player":{"running":2,"gameOver":0,"victory":0},"rival":{"running":2,"gameOver":0,"victory":0}},"deathsByCauseMedians":{"player":{"starvation":81,"spider":0,"combat":1,"terminal_cull":0},"rival":{"starvation":64,"spider":0,"combat":1,"terminal_cull":0}},"populationQuartiles":{"peak":{"player":{"count":2,"min":190,"q1":190,"median":190,"q3":190,"max":190},"rival":{"count":2,"min":164,"q1":164,"median":164,"q3":164,"max":164}},"final":{"player":{"count":2,"min":117,"q1":117,"median":117,"q3":117,"max":117},"rival":{"count":2,"min":105,"q1":105,"median":105,"q3":105,"max":105}}}}
{"type":"seed_summary","seed":7331,"runs":2,"hashesAllMatch":true,"factionOutcomeCounts":{"player":{"running":2,"gameOver":0,"victory":0},"rival":{"running":2,"gameOver":0,"victory":0}},"deathsByCauseMedians":{"player":{"starvation":49,"spider":0,"combat":1,"terminal_cull":0},"rival":{"starvation":60,"spider":3,"combat":0,"terminal_cull":0}},"populationQuartiles":{"peak":{"player":{"count":2,"min":205,"q1":205,"median":205,"q3":205,"max":205},"rival":{"count":2,"min":169,"q1":169,"median":169,"q3":169,"max":169}},"final":{"player":{"count":2,"min":189,"q1":189,"median":189,"q3":189,"max":189},"rival":{"count":2,"min":112,"q1":112,"median":112,"q3":112,"max":112}}}}
{"type":"cross_seed_rollup","runs":4,"hashesAllMatch":false,"factionOutcomeCounts":{"player":{"running":4,"gameOver":0,"victory":0},"rival":{"running":4,"gameOver":0,"victory":0}},"deathsByCauseMedians":{"player":{"starvation":65,"spider":0,"combat":1,"terminal_cull":0},"rival":{"starvation":62,"spider":1.5,"combat":0.5,"terminal_cull":0}},"populationQuartiles":{"peak":{"player":{"count":4,"min":190,"q1":190,"median":197.5,"q3":205,"max":205},"rival":{"count":4,"min":164,"q1":164,"median":166.5,"q3":169,"max":169}},"final":{"player":{"count":4,"min":117,"q1":117,"median":153,"q3":189,"max":189},"rival":{"count":4,"min":105,"q1":105,"median":108.5,"q3":112,"max":112}}}}
```

### Gate 3 - CI fast gate

Command:

```sh
npm test -- --fast
```

Output:

```text

> antzoo@1.0.0 test
> tsx scripts/test-debug.ts --fast

PASS T0 rng
PASS T0 time
PASS T0 stepCount
PASS T0 ants.x
PASS T0 ants.y
PASS T0 ants.heading
PASS T0 ants.energy
PASS T0 ants.stepsSincePickup
PASS T0 ants.timerA
PASS T0 ants.timerB
PASS T0 ants.mode
PASS T0 ants.carrying
PASS T0 ants.flags
PASS T0 ants.caste
PASS T0 ants.faction
PASS T0 spatial
PASS T0 grid.pherFood.player
PASS T0 grid.pherFood.rival
PASS T0 grid.pherHome.player
PASS T0 grid.pherHome.rival
PASS T0 grid.pherDanger
PASS T0 grid.lure
PASS T0 grid.moisture
PASS T0 grid.foodAmt
PASS T0 grid.bookkeeping
PASS T0 nestFood.player
PASS T0 nestFood.rival
PASS T0 queen/brood.player
PASS T0 queen/brood.rival
PASS T0 rival struct
PASS T0 spider
PASS T0 bushes
PASS T0 carcass
PASS T0 corpses
PASS T0 obstacles
PASS T0 combatMarks
PASS T0 tuning ant.drainPerSec
PASS T0 tuning ui.hudHz
PASS T0 debug-only field
PASS T0 debug ant id
PASS T0 debug ant birthTick
PASS T0 debug ant distanceTraveled
PASS T0 debug ant ticksInMode
PASS T0 debug ant deliveries
PASS T0 debug ant ticksSinceLastDelivery
PASS T0 debug ant ticksSinceFoodPerceived
PASS T0 debug trace active
PASS T0 debug trace beyondR
PASS T0 debug trace record
PASS T0 debug flow foodDelivered
PASS T0 debug flow queenConsumed
PASS T0 debug flow broodConsumed
PASS T0 debug flow snackEnergyGained
PASS T0 debug flow drainTotal
PASS T0 debug obituary aggregates
PASS T1 same seed hashes at 1k/10k
PASS T1 different seeds diverge by 1k
PASS T2 sample-every 100 vs no sampling final hash
PASS T3 death accounting - top causes: starvation=145, combat=2, spider=0
PASS T3 id uniqueness over 10k
PASS T5 traced run matches untraced hash
PASS T5 trace rows captured - rows=4096
```

### Gate 4 - Full local test gate

Command:

```sh
npm test
```

Output:

```text

> antzoo@1.0.0 test
> tsx scripts/test-debug.ts

PASS T0 rng
PASS T0 time
PASS T0 stepCount
PASS T0 ants.x
PASS T0 ants.y
PASS T0 ants.heading
PASS T0 ants.energy
PASS T0 ants.stepsSincePickup
PASS T0 ants.timerA
PASS T0 ants.timerB
PASS T0 ants.mode
PASS T0 ants.carrying
PASS T0 ants.flags
PASS T0 ants.caste
PASS T0 ants.faction
PASS T0 spatial
PASS T0 grid.pherFood.player
PASS T0 grid.pherFood.rival
PASS T0 grid.pherHome.player
PASS T0 grid.pherHome.rival
PASS T0 grid.pherDanger
PASS T0 grid.lure
PASS T0 grid.moisture
PASS T0 grid.foodAmt
PASS T0 grid.bookkeeping
PASS T0 nestFood.player
PASS T0 nestFood.rival
PASS T0 queen/brood.player
PASS T0 queen/brood.rival
PASS T0 rival struct
PASS T0 spider
PASS T0 bushes
PASS T0 carcass
PASS T0 corpses
PASS T0 obstacles
PASS T0 combatMarks
PASS T0 tuning ant.drainPerSec
PASS T0 tuning ui.hudHz
PASS T0 debug-only field
PASS T0 debug ant id
PASS T0 debug ant birthTick
PASS T0 debug ant distanceTraveled
PASS T0 debug ant ticksInMode
PASS T0 debug ant deliveries
PASS T0 debug ant ticksSinceLastDelivery
PASS T0 debug ant ticksSinceFoodPerceived
PASS T0 debug trace active
PASS T0 debug trace beyondR
PASS T0 debug trace record
PASS T0 debug flow foodDelivered
PASS T0 debug flow queenConsumed
PASS T0 debug flow broodConsumed
PASS T0 debug flow snackEnergyGained
PASS T0 debug flow drainTotal
PASS T0 debug obituary aggregates
PASS T1 same seed hashes at 1k/10k/50k
PASS T1 different seeds diverge by 1k
PASS T2 sample-every 100 vs no sampling final hash
PASS T3 death accounting - top causes: starvation=347, spider=21, terminal_cull=10
PASS T3 id uniqueness over 50k
PASS T5 traced run matches untraced hash
PASS T5 trace rows captured - rows=4096
```

### Gate 5 - Typecheck and build

Command:

```sh
npm run typecheck
```

Output:

```text

> antzoo@1.0.0 typecheck
> tsc --noEmit

```

Command:

```sh
npm run build
```

Output:

```text

> antzoo@1.0.0 build
> tsc --noEmit && vite build

vite v6.4.3 building for production...
transforming...
✓ 748 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                               0.34 kB │ gzip:   0.25 kB
dist/assets/CanvasPool-B1kldNEn.js            0.78 kB │ gzip:   0.43 kB
dist/assets/Filter-BfNtvaR3.js                0.90 kB │ gzip:   0.47 kB
dist/assets/BufferResource-BoE5UwAh.js       10.61 kB │ gzip:   2.80 kB
dist/assets/webworkerAll-DOatwnnN.js         15.93 kB │ gzip:   5.07 kB
dist/assets/CanvasRenderer-BFe1bqgw.js       18.03 kB │ gzip:   6.02 kB
dist/assets/BitmapFont-Dgig1cQ2.js           34.48 kB │ gzip:  11.74 kB
dist/assets/WebGPURenderer-2hSoBJvd.js       39.14 kB │ gzip:  10.95 kB
dist/assets/browserAll-DATsUlb7.js           43.26 kB │ gzip:  11.36 kB
dist/assets/RenderTargetSystem-Bia39qJG.js   47.11 kB │ gzip:  12.97 kB
dist/assets/WebGLRenderer-FaXEUdoI.js        68.88 kB │ gzip:  18.91 kB
dist/assets/index-cpbQg8sy.js               617.22 kB │ gzip: 189.98 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 2.46s
```

### Gate 6 - Parity vs pre-fleet HEAD

Command:

```sh
current=$(./node_modules/.bin/tsx -e 'import { createWorld, stepWorld } from "./src/sim"; import { hashWorldState } from "./src/debug/snapshot"; import { TUNING } from "./src/tuning"; TUNING.seed.value = 1337; const world = createWorld(); const checkpoints = new Set([1000, 10000, 50000]); for (let tick = 1; tick <= 50000; tick += 1) { stepWorld(world, 1 / TUNING.time.stepHz); if (checkpoints.has(tick)) console.log(`${tick}\t${hashWorldState(world)}`); }') && tmpdir=$(mktemp -d /tmp/antzoo-parity-head-XXXXXX) && git worktree add --detach "$tmpdir" HEAD >/tmp/antzoo-parity-worktree-add.log && base=$(cd "$tmpdir" && /Users/drewgoddyn/projects/antzoo/node_modules/.bin/tsx -e 'import { createWorld, stepWorld } from "./src/sim"; import { hashWorldState } from "./src/debug/snapshot"; import { TUNING } from "./src/tuning"; TUNING.seed.value = 1337; const world = createWorld(); const checkpoints = new Set([1000, 10000, 50000]); for (let tick = 1; tick <= 50000; tick += 1) { stepWorld(world, 1 / TUNING.time.stepHz); if (checkpoints.has(tick)) console.log(`${tick}\t${hashWorldState(world)}`); }') && git worktree remove "$tmpdir" >/tmp/antzoo-parity-worktree-remove.log && node -e 'const [base,current] = process.argv.slice(1).map((text) => new Map(text.trim().split(/\n/).map((line) => line.split(/\t/)))); console.log("tick\tbase_hash\tcurrent_hash\tmatch"); for (const tick of ["1000","10000","50000"]) console.log(`${tick}\t${base.get(tick)}\t${current.get(tick)}\t${base.get(tick) === current.get(tick) ? "yes" : "no"}`);' "$base" "$current"
```

Output:

```text
Preparing worktree (detached HEAD 3cc5db5)
tick	base_hash	current_hash	match
1000	873d5ca92b5e2d15	873d5ca92b5e2d15	yes
10000	f3a0258093e285b0	f3a0258093e285b0	yes
50000	5101d7c52c007c01	5101d7c52c007c01	yes
```
