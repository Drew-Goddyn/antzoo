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
