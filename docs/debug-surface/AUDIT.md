# antzoo debug surface audit

Audited current working tree at `21e3127` (`Stage 4 - Targeted decision traces`) plus pre-existing local remediation edits. I made no changes to `src/` or `scripts/`. New probe code is under `scratch/debug-surface-audit/`.

## Findings

No soundness findings. I did not find a gameplay state mutation missed by the current hash, same-seed nondeterminism, or instrumentation side effect.

## 1. Hash-hole attempts beyond T0

Repro command:

```sh
./node_modules/.bin/tsx scratch/debug-surface-audit/current-probes.ts
```

Observed:

```text
HASH_SENSITIVITY_BEYOND_T0
spider.edge	DETECTED	632028e9736dd465	d1962954c92d1e10
rival.nestPulseVel	DETECTED	632028e9736dd465	f0a48a8c4bc86da4
rainDuration	DETECTED	632028e9736dd465	2dcb62abd77e2ccb
grid.pherFood alias same=true
grid.pherFood alias	DETECTED	632028e9736dd465	8d0a6329d9df4469
ants.capacity	DETECTED	632028e9736dd465	2d44a9b480eec2f0
EXCLUDED_STATE_CONTROLS
carcass.toast	mutation:UNCHANGED	future:MATCH	13d49d6c7b301900	13d49d6c7b301900
particleCursor	mutation:UNCHANGED	future:MATCH	13d49d6c7b301900	13d49d6c7b301900
ants.freeCount	mutation:UNCHANGED	future:MATCH	13d49d6c7b301900	13d49d6c7b301900
debug.nextAntId	mutation:UNCHANGED	future:MATCH	13d49d6c7b301900	13d49d6c7b301900
```

Expected: gameplay-affecting fields should change the hash; excluded cosmetic/debug/inert bookkeeping should either remain hash-invisible and future-equivalent, or be counted as a bug. Observed matches expected. The legacy `grid.pherFood` alias is the player faction array, so it is covered through `grid.pherFoodByFaction[0]`.

Tuning hole regression repro:

```sh
./node_modules/.bin/tsx -e 'import { createWorld, stepWorld } from "./src/sim"; import { hashWorldState } from "./src/debug/snapshot"; import { applyTuningPatch } from "./src/debug/scenario"; import { TUNING } from "./src/tuning"; TUNING.seed.value = 1337; const a = createWorld(); const b = createWorld(); for (let i = 0; i < 5000; i += 1) { stepWorld(a, 1 / TUNING.time.stepHz); stepWorld(b, 1 / TUNING.time.stepHz); } const beforeA = hashWorldState(a); const beforeB = hashWorldState(b); applyTuningPatch("ant.drainPerSec", TUNING.ant.drainPerSec + 0.1); const afterA = hashWorldState(a); const afterB = hashWorldState(b); console.log(`before_same\t${beforeA === beforeB ? "yes" : "no"}\t${beforeA}\t${beforeB}`); console.log(`after_tuning_same_between_worlds\t${afterA === afterB ? "yes" : "no"}\t${afterA}\t${afterB}`); console.log(`tuning_changed_hash\t${beforeA !== afterA ? "yes" : "no"}`);'
```

Observed:

```text
before_same	yes	632028e9736dd465	632028e9736dd465
after_tuning_same_between_worlds	yes	ec542375c325ecc1	ec542375c325ecc1
tuning_changed_hash	yes
```

Expected: changing gameplay-affecting tuning changes the hash immediately. Observed matches expected.

## 2. Nondeterminism attempts

Headless repro:

```sh
./node_modules/.bin/tsx scratch/debug-surface-audit/probes.ts determinism
```

Observed:

```text
DETERMINISM_HEADLESS
run1=1000:873d5ca92b5e2d15,5000:632028e9736dd465,10000:f3a0258093e285b0,20000:a77b2856f9e8a95e,33235:5101d7c52c007c01
run2=1000:873d5ca92b5e2d15,5000:632028e9736dd465,10000:f3a0258093e285b0,20000:a77b2856f9e8a95e,33235:5101d7c52c007c01
match=true
```

Browser repro:

```sh
node scratch/debug-surface-audit/browser-probe.cjs
node scratch/debug-surface-audit/browser-probe.cjs
```

Observed both times:

```json
{
  "version": "debug-surface-stage4",
  "snapshotTick": 33235,
  "hashes": [
    { "tick": 1000, "hash": "873d5ca92b5e2d15" },
    { "tick": 5000, "hash": "632028e9736dd465" },
    { "tick": 10000, "hash": "f3a0258093e285b0" },
    { "tick": 33235, "hash": "5101d7c52c007c01" }
  ],
  "events": 505
}
```

Expected: same seed and scenario produce identical hash series; browser bridge hashes match headless. Observed matches expected.

## 3. Instrumentation side-effect attempts

Repro command:

```sh
./node_modules/.bin/tsx scratch/debug-surface-audit/probes.ts instrumentation
```

Observed:

```text
INSTRUMENTATION_PURITY
1000:873d5ca92b5e2d15:873d5ca92b5e2d15:MATCH
2500:93a4563fc3e318d7:93a4563fc3e318d7:MATCH
5000:632028e9736dd465:632028e9736dd465:MATCH
event_count=78
trace_count=5000
```

This probe stepped a baseline world beside an observed world with tracing armed, full event capture enabled, repeated `snapshotWorld`, `getDebugEvents`, `getDebugTrace`, and synthetic debug event writes. Expected: observer/debug calls do not change gameplay hashes. Observed matches expected.

Debug-only exclusion repro:

```sh
./node_modules/.bin/tsx scratch/debug-surface-audit/probes.ts debug-exclusion
```

Observed:

```text
DEBUG_EXCLUSION_CONTROL
hash_after_debug_state_mutation: MATCH 632028e9736dd465 632028e9736dd465
```

## 4. Fresh death accounting

Repro command:

```sh
./node_modules/.bin/tsx scratch/debug-surface-audit/probes.ts death-accounting
```

Observed:

```text
DEATH_ACCOUNTING
player: totalDeaths=202 deathsByCauseSum=202 causes={"starvation":180,"spider":21,"combat":1,"terminal_cull":0}
rival: totalDeaths=178 deathsByCauseSum=178 causes={"starvation":167,"spider":0,"combat":1,"terminal_cull":10}
```

Expected: `deathsByCause` sums equal `totalDeaths` for each faction on a fresh 50k-tick run. Observed matches expected.

## 5. PROGRESS gate reruns

Test gate repro:

```sh
npm test
```

Observed:

```text
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

Typecheck/build gate repro:

```sh
npm run typecheck
npm run build
```

Observed:

```text
> antzoo@1.0.0 typecheck
> tsc --noEmit

> antzoo@1.0.0 build
> tsc --noEmit && vite build

✓ 748 modules transformed.
dist/assets/index-Mn7I1hqi.js               616.43 kB │ gzip: 189.78 kB
(!) Some chunks are larger than 500 kB after minification.
✓ built in 1.88s
```

Expected: both gates remain green. Observed matches expected.

I also reran the Stage 3 food-distance scenario replay:

```sh
tmp1=$(mktemp /tmp/antzoo-audit-food-probe-1-XXXXXX.jsonl); tmp2=$(mktemp /tmp/antzoo-audit-food-probe-2-XXXXXX.jsonl); npm run sim -- --scenario scenarios/food-distance-probe.json --hash-every 3000 | rg '^\{' > "$tmp1" && npm run sim -- --scenario scenarios/food-distance-probe.json --hash-every 3000 | rg '^\{' > "$tmp2" && node -e 'const fs = require("fs"); const [a,b] = process.argv.slice(1).map((path) => fs.readFileSync(path, "utf8").trim().split(/\n/).map(JSON.parse)); const hashes = (rows) => rows.filter((row) => row.type === "hash").map((row) => [row.tick, row.hash]); const stimuli = (rows) => rows.filter((row) => row.type === "stimulus").map((row) => `${row.tick}:${row.action.do}:${row.action.tool ?? ""}:${row.action.x ?? ""}:${row.action.y ?? ""}`); console.log("tick\trun1_hash\trun2_hash\tmatch"); const h1 = hashes(a); const h2 = hashes(b); for (let i = 0; i < h1.length; i += 1) console.log(`${h1[i][0]}\t${h1[i][1]}\t${h2[i]?.[1]}\t${h1[i][1] === h2[i]?.[1] ? "yes" : "no"}`); const s1 = stimuli(a); const s2 = stimuli(b); console.log(`stimuli_run1\t${s1.join(",")}`); console.log(`stimuli_run2\t${s2.join(",")}`); console.log(`stimuli_match\t${JSON.stringify(s1) === JSON.stringify(s2) ? "yes" : "no"}`); console.log(`final_hash_match\t${a.at(-1).finalHash === b.at(-1).finalHash ? "yes" : "no"}`);' "$tmp1" "$tmp2"; code=$?; rm "$tmp1" "$tmp2"; exit $code
```

Observed:

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

The deterministic behavior reproduces. The literal old Stage 3 hash strings in `PROGRESS.md` do not, because later remediation intentionally changed the hash domain to include gameplay-affecting tuning. I did not count that as a debug-surface failure.

## 6. DEBUG.md literal-follow pass

Exact headless command:

```sh
npm run sim -- --seed 1337 --ticks 50000 --sample-every 600 --out runs/baseline-1337.jsonl
```

Observed from the generated JSONL final line:

```json
{
  "rows": 56,
  "firstType": "snapshot",
  "summary": {
    "type": "summary",
    "outcome": "victory",
    "finalTick": 33235,
    "finalHash": "5101d7c52c007c01",
    "peakPopulation": 354,
    "ticksPerSecond": 1040.9353462598726
  }
}
```

Expected: runner creates the output path and emits snapshots plus final summary. Observed matches expected. I removed the temporary `runs/baseline-1337.jsonl` artifact after reading it.

Exact Playwright gate commands from DEBUG:

```sh
npm run dev -- --port 5173
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

Observed:

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

Expected: bridge exists, can step while paused, snapshot shape is usable. Observed matches expected.

Trace examples from DEBUG:

```sh
npm run sim -- --scenario scenarios/baseline-1337.json --trace-ids 386 --trace-window 31339:31398 | rg '^\{"type":"trace"|^\{"type":"summary"'
npm run sim -- --seed 1337 --ticks 50000 --trace-arm beyondR:5 | rg '^\{"type":"trace"|^\{"type":"summary"'
```

Observed summaries:

```json
{ "traceRows": 60, "ids": [386], "firstTick": 31339, "lastTick": 31398, "finalHash": "5101d7c52c007c01", "finalTick": 33235, "outcome": "victory" }
{ "traceRows": 28442, "ids": [188, 113, 57, 76, 179], "idCount": 5, "finalHash": "5101d7c52c007c01", "finalTick": 33235, "outcome": "victory" }
```

Expected: documented trace examples emit trace rows; `nan_respawn` may emit zero rows on a finite baseline as documented. Observed matches expected.

Wrong, ambiguous, or incomplete places in `DEBUG.md`: none found in this pass.

VERDICT: SOUND
