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
