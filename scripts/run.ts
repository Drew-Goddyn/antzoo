import { createWriteStream, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createWorld, stepWorld, stressSpawn } from "../src/sim";
import { snapshotWorld, hashWorldState } from "../src/debug/snapshot";
import { getDebugEvents, setDebugEventCapture } from "../src/debug/events";
import { TUNING } from "../src/tuning";

interface RunOptions {
  seed: number;
  ticks: number;
  sampleEvery: number;
  hashEvery: number;
  out: string | null;
  stressAnts: number;
  events: "none" | "full";
}

function readNumber(args: string[], index: number, name: string): number {
  const value = args[index + 1];
  if (value === undefined) throw new Error(`Missing value for ${name}`);
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid number for ${name}: ${value}`);
  return parsed;
}

function parseArgs(argv: string[]): RunOptions {
  const options: RunOptions = {
    seed: TUNING.seed.value,
    ticks: 50000,
    sampleEvery: 0,
    hashEvery: 0,
    out: null,
    stressAnts: 0,
    events: "none",
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--seed") {
      options.seed = readNumber(argv, i, arg);
      i += 1;
    } else if (arg === "--ticks") {
      options.ticks = readNumber(argv, i, arg);
      i += 1;
    } else if (arg === "--sample-every") {
      options.sampleEvery = readNumber(argv, i, arg);
      i += 1;
    } else if (arg === "--hash-every") {
      options.hashEvery = readNumber(argv, i, arg);
      i += 1;
    } else if (arg === "--out") {
      const value = argv[i + 1];
      if (value === undefined) throw new Error("Missing value for --out");
      options.out = value;
      i += 1;
    } else if (arg === "--stress-ants") {
      options.stressAnts = readNumber(argv, i, arg);
      i += 1;
    } else if (arg === "--events") {
      const value = argv[i + 1];
      if (value !== "full" && value !== "none") throw new Error("--events must be full or none");
      options.events = value;
      i += 1;
    } else if (arg === "--help" || arg === "-h") {
      console.log("Usage: npm run sim -- --seed 1337 --ticks 50000 --sample-every 600 --hash-every 1000 --events full --out runs/x.jsonl --stress-ants 1200");
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  options.ticks = Math.max(0, Math.floor(options.ticks));
  options.sampleEvery = Math.max(0, Math.floor(options.sampleEvery));
  options.hashEvery = Math.max(0, Math.floor(options.hashEvery));
  options.stressAnts = Math.max(0, Math.floor(options.stressAnts));
  return options;
}

function outcomeFor(world: ReturnType<typeof createWorld>): "running" | "gameOver" | "victory" {
  const ecology = world as typeof world & { gameOver?: boolean; victory?: boolean };
  if (ecology.victory) return "victory";
  if (ecology.gameOver) return "gameOver";
  return "running";
}

function peakPopulation(world: ReturnType<typeof createWorld>): number {
  const ecology = world as typeof world & { peakPopulation?: number; rival?: { peakPopulation?: number } };
  return Math.max(ecology.peakPopulation ?? world.ants.count, ecology.rival?.peakPopulation ?? 0);
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  TUNING.seed.value = options.seed;
  const world = createWorld();
  if (options.events === "full") setDebugEventCapture(world, "full");
  if (options.stressAnts > world.ants.count) stressSpawn(world, options.stressAnts - world.ants.count);
  if (options.out !== null) mkdirSync(dirname(options.out), { recursive: true });
  const stream = options.out === null ? process.stdout : createWriteStream(options.out);
  const writeLine = (value: unknown) => stream.write(`${JSON.stringify(value)}\n`);
  const start = performance.now();
  let peak = world.ants.count;
  for (let tick = 1; tick <= options.ticks && outcomeFor(world) === "running"; tick += 1) {
    stepWorld(world, 1 / TUNING.time.stepHz);
    if (world.ants.count > peak) peak = world.ants.count;
    if (options.hashEvery > 0 && world.stepCount % options.hashEvery === 0) {
      writeLine({ type: "hash", tick: world.stepCount, hash: hashWorldState(world) });
    }
    if (options.sampleEvery > 0 && world.stepCount % options.sampleEvery === 0) {
      const elapsed = (performance.now() - start) / TUNING.time.msPerSec;
      writeLine({ type: "snapshot", snapshot: snapshotWorld(world, { ticksPerSecond: world.stepCount / Math.max(elapsed, 0.001) }) });
    }
  }
  const elapsed = (performance.now() - start) / TUNING.time.msPerSec;
  if (options.events === "full") {
    for (const event of getDebugEvents(world)) writeLine({ type: "event", event });
  }
  writeLine({
    type: "summary",
    outcome: outcomeFor(world),
    finalTick: world.stepCount,
    finalHash: hashWorldState(world),
    peakPopulation: Math.max(peak, peakPopulation(world)),
    ticksPerSecond: world.stepCount / Math.max(elapsed, 0.001),
  });
  if (options.out !== null) await new Promise<void>((resolve) => stream.end(resolve));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
