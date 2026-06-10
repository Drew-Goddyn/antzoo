import { createWriteStream, mkdirSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { createWorld, stepWorld, stressSpawn } from "../src/sim";
import { snapshotWorld, hashWorldState } from "../src/debug/snapshot";
import { configureDebugTrace, getDebugEvents, getDebugTrace, setDebugEventCapture } from "../src/debug/events";
import { applyScenarioSetup, createScenarioExecutor, parseScenario, type Scenario, type ScenarioRecord } from "../src/debug/scenario";
import { TUNING } from "../src/tuning";

interface RunOptions {
  seed: number;
  ticks: number;
  sampleEvery: number;
  hashEvery: number;
  out: string | null;
  stressAnts: number;
  events: "none" | "full";
  scenarioPath: string | null;
  traceIds: number[];
  traceArms: string[];
  traceWindow: [number, number] | null;
  seedExplicit: boolean;
  ticksExplicit: boolean;
}

function readNumber(args: string[], index: number, name: string): number {
  const value = args[index + 1];
  if (value === undefined) throw new Error(`Missing value for ${name}`);
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid number for ${name}: ${value}`);
  return parsed;
}

function readNumberList(args: string[], index: number, name: string): number[] {
  const value = args[index + 1];
  if (value === undefined) throw new Error(`Missing value for ${name}`);
  return value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((part) => Number.isFinite(part) && part > 0)
    .map((part) => Math.floor(part));
}

function readTraceWindow(args: string[], index: number): [number, number] {
  const value = args[index + 1];
  if (value === undefined) throw new Error("Missing value for --trace-window");
  const [rawStart, rawEnd] = value.split(":");
  const start = Number(rawStart);
  const end = Number(rawEnd);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start) throw new Error(`Invalid --trace-window: ${value}`);
  return [Math.floor(start), Math.floor(end)];
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
    scenarioPath: null,
    traceIds: [],
    traceArms: [],
    traceWindow: null,
    seedExplicit: false,
    ticksExplicit: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--seed") {
      options.seed = readNumber(argv, i, arg);
      options.seedExplicit = true;
      i += 1;
    } else if (arg === "--ticks") {
      options.ticks = readNumber(argv, i, arg);
      options.ticksExplicit = true;
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
    } else if (arg === "--scenario") {
      const value = argv[i + 1];
      if (value === undefined) throw new Error("Missing value for --scenario");
      options.scenarioPath = value;
      i += 1;
    } else if (arg === "--trace-ids") {
      options.traceIds = readNumberList(argv, i, arg);
      i += 1;
    } else if (arg === "--trace-arm") {
      const value = argv[i + 1];
      if (value === undefined) throw new Error("Missing value for --trace-arm");
      options.traceArms.push(value);
      i += 1;
    } else if (arg === "--trace-window") {
      options.traceWindow = readTraceWindow(argv, i);
      i += 1;
    } else if (arg === "--help" || arg === "-h") {
      console.log("Usage: npm run sim -- --seed 1337 --ticks 50000 --sample-every 600 --hash-every 1000 --events full --trace-ids 412,517 --trace-arm beyondR:5 --trace-window 30000:41300 --out runs/x.jsonl --stress-ants 1200");
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
  const scenario: Scenario | null = options.scenarioPath ? parseScenario(JSON.parse(readFileSync(options.scenarioPath, "utf8"))) : null;
  if (scenario) {
    applyScenarioSetup(scenario);
    if (!options.ticksExplicit && scenario.ticks !== undefined) options.ticks = scenario.ticks;
  }
  if (options.seedExplicit || !scenario?.seed) TUNING.seed.value = options.seed;
  const world = createWorld();
  const scenarioExecutor = scenario ? createScenarioExecutor(scenario) : null;
  if (options.events === "full") setDebugEventCapture(world, "full");
  if (options.traceIds.length > 0 || options.traceArms.length > 0) {
    configureDebugTrace(world, {
      ids: options.traceIds,
      arms: options.traceArms,
      windowStart: options.traceWindow?.[0],
      windowEnd: options.traceWindow?.[1],
    });
  }
  if (options.stressAnts > world.ants.count) stressSpawn(world, options.stressAnts - world.ants.count);
  if (options.out !== null) mkdirSync(dirname(options.out), { recursive: true });
  const stream = options.out === null ? process.stdout : createWriteStream(options.out);
  const writeLine = (value: unknown) => stream.write(`${JSON.stringify(value)}\n`);
  const writeScenarioRecord = (record: ScenarioRecord) => {
    if (record.type === "scenario_snapshot") writeLine({ ...record, snapshot: snapshotWorld(world) });
    else writeLine(record);
  };
  const start = performance.now();
  let peak = world.ants.count;
  for (let tick = 1; tick <= options.ticks && outcomeFor(world) === "running"; tick += 1) {
    scenarioExecutor?.runDue(world, writeScenarioRecord);
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
  scenarioExecutor?.runDue(world, writeScenarioRecord);
  const elapsed = (performance.now() - start) / TUNING.time.msPerSec;
  if (options.events === "full") {
    for (const event of getDebugEvents(world)) writeLine({ type: "event", event });
  }
  for (const trace of getDebugTrace(world)) writeLine({ type: "trace", trace });
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
