import { createWorld, stepWorld } from "../src/sim";
import { hashWorldState, snapshotWorld } from "../src/debug/snapshot";
import { TUNING } from "../src/tuning";

type TestResult = { name: string; pass: boolean; detail?: string };
type MutableWorld = ReturnType<typeof createWorld> & Record<string, any>;

const checkpoints = [1000, 10000, 50000];

function makeWorld(seed = 1337): MutableWorld {
  TUNING.seed.value = seed;
  return createWorld() as MutableWorld;
}

function runTicks(world: MutableWorld, ticks: number): void {
  for (let i = 0; i < ticks; i += 1) stepWorld(world, 1 / TUNING.time.stepHz);
}

function atTick(seed: number, ticks: number): MutableWorld {
  const world = makeWorld(seed);
  runTicks(world, ticks);
  return world;
}

function changesHash(name: string, base: MutableWorld, before: string, mutate: (world: MutableWorld) => void): TestResult {
  const world = structuredClone(base) as MutableWorld;
  mutate(world);
  const after = hashWorldState(world);
  return { name, pass: before !== after, detail: before === after ? "hash did not change" : undefined };
}

function preservesHash(name: string, base: MutableWorld, before: string, mutate: (world: MutableWorld) => void): TestResult {
  const world = structuredClone(base) as MutableWorld;
  mutate(world);
  const after = hashWorldState(world);
  return { name, pass: before === after, detail: before !== after ? `${before} -> ${after}` : undefined };
}

function firstLiveIndex(world: MutableWorld): number {
  if (world.ants.count <= 0) throw new Error("No live ants available for hash sensitivity test");
  return 0;
}

function testT0(): TestResult[] {
  const base = atTick(1337, 5000);
  const before = hashWorldState(base);
  const tests: TestResult[] = [];
  tests.push(changesHash("T0 rng", base, before, (world) => { world.rng += 1; }));
  tests.push(changesHash("T0 time", base, before, (world) => { world.time += 1 / TUNING.time.stepHz; }));
  tests.push(changesHash("T0 stepCount", base, before, (world) => { world.stepCount += 1; }));
  tests.push(changesHash("T0 ants.x", base, before, (world) => { world.ants.x[firstLiveIndex(world)] += 0.25; }));
  tests.push(changesHash("T0 ants.y", base, before, (world) => { world.ants.y[firstLiveIndex(world)] += 0.25; }));
  tests.push(changesHash("T0 ants.heading", base, before, (world) => { world.ants.heading[firstLiveIndex(world)] += 0.001; }));
  tests.push(changesHash("T0 ants.energy", base, before, (world) => { world.ants.energy[firstLiveIndex(world)] += 0.001; }));
  tests.push(changesHash("T0 ants.stepsSincePickup", base, before, (world) => { world.ants.stepsSincePickup[firstLiveIndex(world)] += 0.001; }));
  tests.push(changesHash("T0 ants.timerA", base, before, (world) => { world.ants.timerA[firstLiveIndex(world)] += 0.001; }));
  tests.push(changesHash("T0 ants.timerB", base, before, (world) => { world.ants.timerB[firstLiveIndex(world)] += 0.001; }));
  tests.push(changesHash("T0 ants.mode", base, before, (world) => { world.ants.mode[firstLiveIndex(world)] = (world.ants.mode[firstLiveIndex(world)] + 1) % 3; }));
  tests.push(changesHash("T0 ants.carrying", base, before, (world) => { world.ants.carrying[firstLiveIndex(world)] = world.ants.carrying[firstLiveIndex(world)] === 0 ? 1 : 0; }));
  tests.push(changesHash("T0 ants.flags", base, before, (world) => { world.ants.flags[firstLiveIndex(world)] ^= 1; }));
  tests.push(changesHash("T0 ants.caste", base, before, (world) => { world.ants.caste[firstLiveIndex(world)] = (world.ants.caste[firstLiveIndex(world)] + 1) % 3; }));
  tests.push(changesHash("T0 ants.faction", base, before, (world) => { world.ants.faction[firstLiveIndex(world)] = world.ants.faction[firstLiveIndex(world)] === 0 ? 1 : 0; }));
  tests.push(changesHash("T0 spatial", base, before, (world) => { world.spatial.heads[0] += 1; }));
  tests.push(changesHash("T0 grid.pherFood.player", base, before, (world) => { world.grid.pherFoodByFaction[0][0] += 0.001; }));
  tests.push(changesHash("T0 grid.pherFood.rival", base, before, (world) => { world.grid.pherFoodByFaction[1][0] += 0.001; }));
  tests.push(changesHash("T0 grid.pherHome.player", base, before, (world) => { world.grid.pherHomeByFaction[0][0] += 0.001; }));
  tests.push(changesHash("T0 grid.pherHome.rival", base, before, (world) => { world.grid.pherHomeByFaction[1][0] += 0.001; }));
  tests.push(changesHash("T0 grid.pherDanger", base, before, (world) => { world.grid.pherDanger[0] += 0.001; }));
  tests.push(changesHash("T0 grid.lure", base, before, (world) => { world.grid.lureAmt[0] += 0.001; }));
  tests.push(changesHash("T0 grid.moisture", base, before, (world) => { world.grid.moisture[0] += 0.001; }));
  tests.push(changesHash("T0 grid.foodAmt", base, before, (world) => { world.grid.foodAmt[0] += 0.001; }));
  tests.push(changesHash("T0 grid.bookkeeping", base, before, (world) => { world.grid.activeFoodCountByFaction[0] += 1; }));
  tests.push(changesHash("T0 nestFood.player", base, before, (world) => { world.nestFood += 0.001; }));
  tests.push(changesHash("T0 nestFood.rival", base, before, (world) => { world.rival.nestFood += 0.001; }));
  tests.push(changesHash("T0 queen/brood.player", base, before, (world) => { world.queenHunger += 0.001; }));
  tests.push(changesHash("T0 queen/brood.rival", base, before, (world) => { world.rival.broodProgress += 0.001; }));
  tests.push(changesHash("T0 rival struct", base, before, (world) => { world.rival.dripTimer += 0.001; }));
  tests.push(changesHash("T0 spider", base, before, (world) => { world.spider.hp += 0.001; }));
  tests.push(changesHash("T0 bushes", base, before, (world) => { world.bushes[0].stock += 0.001; }));
  tests.push(changesHash("T0 carcass", base, before, (world) => { world.carcass.nextSpawn += 0.001; }));
  tests.push(changesHash("T0 corpses", base, before, (world) => { world.corpses.push({ x: 1, y: 1, decay: 1, maxDecay: 1 }); }));
  tests.push(changesHash("T0 obstacles", base, before, (world) => { world.obstacles[0].r += 0.001; }));
  tests.push(changesHash("T0 combatMarks", base, before, (world) => { world.combatMarks[0] = 1; }));
  tests.push(preservesHash("T0 debug-only field", base, before, (world) => { world.__debugOnlyProbe = { value: 1 }; }));
  return tests;
}

function hashSeries(seed: number): string[] {
  const world = makeWorld(seed);
  const hashes: string[] = [];
  let nextCheckpoint = 0;
  for (let tick = 1; tick <= checkpoints[checkpoints.length - 1]; tick += 1) {
    stepWorld(world, 1 / TUNING.time.stepHz);
    if (tick === checkpoints[nextCheckpoint]) {
      hashes.push(hashWorldState(world));
      nextCheckpoint += 1;
    }
  }
  return hashes;
}

function testT1(): TestResult[] {
  const a = hashSeries(1337);
  const b = hashSeries(1337);
  const c = hashSeries(7331);
  return [
    { name: "T1 same seed hashes at 1k/10k/50k", pass: a.join("|") === b.join("|"), detail: `${a.join(",")} vs ${b.join(",")}` },
    { name: "T1 different seeds diverge by 1k", pass: a[0] !== c[0], detail: `${a[0]} vs ${c[0]}` },
  ];
}

function finalHash(seed: number, sampleEvery: number): string {
  const world = makeWorld(seed);
  for (let tick = 1; tick <= 50000; tick += 1) {
    stepWorld(world, 1 / TUNING.time.stepHz);
    if (sampleEvery > 0 && tick % sampleEvery === 0) snapshotWorld(world);
  }
  return hashWorldState(world);
}

function testT2(): TestResult[] {
  const sampled = finalHash(1337, 100);
  const unsampled = finalHash(1337, 0);
  return [{ name: "T2 sample-every 100 vs no sampling final hash", pass: sampled === unsampled, detail: `${sampled} vs ${unsampled}` }];
}

function printResult(result: TestResult): void {
  console.log(`${result.pass ? "PASS" : "FAIL"} ${result.name}${result.pass || !result.detail ? "" : ` - ${result.detail}`}`);
}

let failed = false;
for (const result of testT0()) {
  printResult(result);
  if (!result.pass) failed = true;
}
for (const result of testT1()) {
  printResult(result);
  if (!result.pass) failed = true;
}
for (const result of testT2()) {
  printResult(result);
  if (!result.pass) failed = true;
}
if (failed) process.exit(1);
