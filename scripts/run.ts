import { createWriteStream, mkdirSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { createWorld, stepWorld, stressSpawn } from "../src/sim";
import { snapshotWorld, hashWorldState } from "../src/debug/snapshot";
import { configureDebugTrace, getDebugEvents, getDebugFlowCounters, getDebugObituaryAggregates, getDebugTrace, setDebugEventCapture, type DeathCause, type DebugFlowCounters, type FactionName, type ObituaryAggregate } from "../src/debug/events";
import { applyScenarioSetup, createScenarioExecutor, parseScenario, type Scenario, type ScenarioRecord } from "../src/debug/scenario";
import { DEFAULTS, TUNING } from "../src/tuning";

type Outcome = "running" | "gameOver" | "victory";
type FactionMap<T> = Record<FactionName, T>;
type CauseCounts = Record<DeathCause, number>;
type DeathCauseMedians = FactionMap<Record<DeathCause, number | null>>;
type FlowDeficitRatios = FactionMap<{
  drainTotalToSnackEnergyGained: number | null;
  foodDeliveredToQueenBroodConsumed: number | null;
}>;

interface RunOptions {
  seed: number;
  seeds: number[] | null;
  replicates: number;
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

interface RunSummary {
  type: "summary";
  seed: number;
  replicate: number;
  outcome: Outcome;
  factionOutcomes: FactionMap<Outcome>;
  finalTick: number;
  finalHash: string;
  peakPopulation: number;
  peakPopulationByFaction: FactionMap<number>;
  finalPopulationByFaction: FactionMap<number>;
  deathsByCause: FactionMap<CauseCounts>;
  obituaryAggregates: FactionMap<Record<DeathCause, ObituaryAggregate>>;
  flowTotals: FactionMap<DebugFlowCounters>;
  ticksPerSecond: number;
}

interface Quartiles {
  count: number;
  min: number | null;
  q1: number | null;
  median: number | null;
  q3: number | null;
  max: number | null;
}

const FACTIONS: FactionName[] = ["player", "rival"];
const DEATH_CAUSES: DeathCause[] = ["starvation", "spider", "combat", "terminal_cull"];

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

function readSeedList(args: string[], index: number): number[] {
  const value = args[index + 1];
  if (value === undefined) throw new Error("Missing value for --seeds");
  const seeds = value.split(",").map((part) => {
    const seed = Number(part.trim());
    if (!Number.isFinite(seed) || seed < 0) throw new Error(`Invalid seed in --seeds: ${part}`);
    return Math.floor(seed);
  });
  if (seeds.length === 0) throw new Error("--seeds must include at least one seed");
  return seeds;
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
    seeds: null,
    replicates: 1,
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
      options.seed = Math.floor(readNumber(argv, i, arg));
      options.seedExplicit = true;
      i += 1;
    } else if (arg === "--seeds") {
      options.seeds = readSeedList(argv, i);
      i += 1;
    } else if (arg === "--replicates") {
      options.replicates = Math.floor(readNumber(argv, i, arg));
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
      console.log("Batch: npm run sim -- --seeds 1337,7331 --replicates 3 --ticks 10000");
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (options.seedExplicit && options.seeds) throw new Error("Use either --seed or --seeds, not both");
  if (options.replicates < 1) throw new Error("--replicates must be at least 1");
  options.ticks = Math.max(0, Math.floor(options.ticks));
  options.sampleEvery = Math.max(0, Math.floor(options.sampleEvery));
  options.hashEvery = Math.max(0, Math.floor(options.hashEvery));
  options.stressAnts = Math.max(0, Math.floor(options.stressAnts));
  return options;
}

function cloneValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(cloneValue);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) out[key] = cloneValue(nested);
    return out;
  }
  return value;
}

function resetTuningObject(target: Record<string, unknown>, source: Record<string, unknown>): void {
  for (const key of Object.keys(target)) {
    if (!(key in source)) delete target[key];
  }
  for (const [key, value] of Object.entries(source)) {
    const current = target[key];
    if (current && typeof current === "object" && !Array.isArray(current) && value && typeof value === "object" && !Array.isArray(value)) {
      resetTuningObject(current as Record<string, unknown>, value as Record<string, unknown>);
    } else {
      target[key] = cloneValue(value);
    }
  }
}

function resetTuning(): void {
  resetTuningObject(TUNING as unknown as Record<string, unknown>, DEFAULTS as unknown as Record<string, unknown>);
}

function outcomeFor(world: ReturnType<typeof createWorld>): Outcome {
  const ecology = world as typeof world & { gameOver?: boolean; victory?: boolean };
  if (ecology.victory) return "victory";
  if (ecology.gameOver) return "gameOver";
  return "running";
}

function factionOutcomes(world: ReturnType<typeof createWorld>): FactionMap<Outcome> {
  const ecology = world as typeof world & { gameOver?: boolean; victory?: boolean };
  if (ecology.victory) return { player: "victory", rival: "gameOver" };
  if (ecology.gameOver) return { player: "gameOver", rival: "victory" };
  return { player: "running", rival: "running" };
}

function peakPopulation(world: ReturnType<typeof createWorld>): number {
  const ecology = world as typeof world & { peakPopulation?: number; rival?: { peakPopulation?: number } };
  return Math.max(ecology.peakPopulation ?? world.ants.count, ecology.rival?.peakPopulation ?? 0);
}

function peakPopulationByFaction(world: ReturnType<typeof createWorld>): FactionMap<number> {
  const ecology = world as typeof world & { peakPopulation?: number; rival?: { peakPopulation?: number } };
  return {
    player: ecology.peakPopulation ?? world.ants.count,
    rival: ecology.rival?.peakPopulation ?? 0,
  };
}

function zeroFlow(): DebugFlowCounters {
  return { foodDelivered: 0, queenConsumed: 0, broodConsumed: 0, snackEnergyGained: 0, drainTotal: 0 };
}

function addFlow(target: DebugFlowCounters, source: DebugFlowCounters): void {
  target.foodDelivered += source.foodDelivered;
  target.queenConsumed += source.queenConsumed;
  target.broodConsumed += source.broodConsumed;
  target.snackEnergyGained += source.snackEnergyGained;
  target.drainTotal += source.drainTotal;
}

function subtractFlow(current: FactionMap<DebugFlowCounters>, previous: FactionMap<DebugFlowCounters>): FactionMap<DebugFlowCounters> {
  const result = { player: zeroFlow(), rival: zeroFlow() };
  for (const faction of FACTIONS) {
    result[faction] = {
      foodDelivered: current[faction].foodDelivered - previous[faction].foodDelivered,
      queenConsumed: current[faction].queenConsumed - previous[faction].queenConsumed,
      broodConsumed: current[faction].broodConsumed - previous[faction].broodConsumed,
      snackEnergyGained: current[faction].snackEnergyGained - previous[faction].snackEnergyGained,
      drainTotal: current[faction].drainTotal - previous[faction].drainTotal,
    };
  }
  return result;
}

function deathsByCauseFromSnapshot(snapshot: ReturnType<typeof snapshotWorld>): FactionMap<CauseCounts> {
  return {
    player: snapshot.factions.player.deathsByCause ?? { starvation: 0, spider: 0, combat: 0, terminal_cull: 0 },
    rival: snapshot.factions.rival.deathsByCause ?? { starvation: 0, spider: 0, combat: 0, terminal_cull: 0 },
  };
}

function prepareRun(options: RunOptions, scenario: Scenario | null, seedOverride: number | null): { world: ReturnType<typeof createWorld>; ticks: number; scenarioExecutor: ReturnType<typeof createScenarioExecutor> | null; seed: number } {
  resetTuning();
  let ticks = options.ticks;
  if (scenario) {
    applyScenarioSetup(scenario);
    if (!options.ticksExplicit && scenario.ticks !== undefined) ticks = scenario.ticks;
  }
  if (seedOverride !== null) {
    TUNING.seed.value = seedOverride;
  } else if (options.seedExplicit || !scenario?.seed) {
    TUNING.seed.value = options.seed;
  }
  const world = createWorld();
  return {
    world,
    ticks,
    scenarioExecutor: scenario ? createScenarioExecutor(scenario) : null,
    seed: TUNING.seed.value,
  };
}

function emitSnapshot(writeLine: (value: unknown) => void, world: ReturnType<typeof createWorld>, startedAt: number, previousFlow: FactionMap<DebugFlowCounters>): FactionMap<DebugFlowCounters> {
  const elapsed = (performance.now() - startedAt) / TUNING.time.msPerSec;
  const flow = getDebugFlowCounters(world);
  writeLine({
    type: "snapshot",
    snapshot: snapshotWorld(world, { ticksPerSecond: world.stepCount / Math.max(elapsed, 0.001) }),
    intervalFlow: subtractFlow(flow, previousFlow),
  });
  return flow;
}

function buildRunSummary(world: ReturnType<typeof createWorld>, seed: number, replicate: number, startedAt: number): RunSummary {
  const elapsed = (performance.now() - startedAt) / TUNING.time.msPerSec;
  const snapshot = snapshotWorld(world);
  return {
    type: "summary",
    seed,
    replicate,
    outcome: outcomeFor(world),
    factionOutcomes: factionOutcomes(world),
    finalTick: world.stepCount,
    finalHash: hashWorldState(world),
    peakPopulation: peakPopulation(world),
    peakPopulationByFaction: peakPopulationByFaction(world),
    finalPopulationByFaction: {
      player: snapshot.factions.player.population.total,
      rival: snapshot.factions.rival.population.total,
    },
    deathsByCause: deathsByCauseFromSnapshot(snapshot),
    obituaryAggregates: getDebugObituaryAggregates(world),
    flowTotals: getDebugFlowCounters(world),
    ticksPerSecond: world.stepCount / Math.max(elapsed, 0.001),
  };
}

function runOnce(options: RunOptions, scenario: Scenario | null, seedOverride: number | null, replicate: number, writeLine: (value: unknown) => void, emitDetails: boolean): RunSummary {
  const { world, ticks, scenarioExecutor, seed } = prepareRun(options, scenario, seedOverride);
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
  let previousFlow = getDebugFlowCounters(world);
  const start = performance.now();
  let peak = world.ants.count;
  const writeScenarioRecord = (record: ScenarioRecord) => {
    if (!emitDetails) return;
    if (record.type === "scenario_snapshot") {
      const flow = getDebugFlowCounters(world);
      writeLine({ ...record, snapshot: snapshotWorld(world), intervalFlow: subtractFlow(flow, previousFlow) });
      previousFlow = flow;
    } else {
      writeLine(record);
    }
  };
  for (let tick = 1; tick <= ticks && outcomeFor(world) === "running"; tick += 1) {
    scenarioExecutor?.runDue(world, writeScenarioRecord);
    stepWorld(world, 1 / TUNING.time.stepHz);
    if (world.ants.count > peak) peak = world.ants.count;
    if (emitDetails && options.hashEvery > 0 && world.stepCount % options.hashEvery === 0) {
      writeLine({ type: "hash", tick: world.stepCount, hash: hashWorldState(world) });
    }
    if (emitDetails && options.sampleEvery > 0 && world.stepCount % options.sampleEvery === 0) {
      previousFlow = emitSnapshot(writeLine, world, start, previousFlow);
    }
  }
  scenarioExecutor?.runDue(world, writeScenarioRecord);
  if (emitDetails && options.events === "full") {
    for (const event of getDebugEvents(world)) writeLine({ type: "event", event });
  }
  if (emitDetails) {
    for (const trace of getDebugTrace(world)) writeLine({ type: "trace", trace });
  }
  const summary = buildRunSummary(world, seed, replicate, start);
  summary.peakPopulation = Math.max(peak, summary.peakPopulation);
  return summary;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function quantile(sorted: number[], q: number): number | null {
  if (sorted.length === 0) return null;
  const position = Math.min(sorted.length - 1, Math.max(0, (sorted.length - 1) * q));
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

function quartiles(values: number[]): Quartiles {
  if (values.length === 0) return { count: 0, min: null, q1: null, median: null, q3: null, max: null };
  const sorted = [...values].sort((a, b) => a - b);
  return {
    count: sorted.length,
    min: sorted[0],
    q1: quantile(sorted, 0.25),
    median: median(sorted),
    q3: quantile(sorted, 0.75),
    max: sorted[sorted.length - 1],
  };
}

function outcomeCounts(runs: RunSummary[]): Record<Outcome, number> {
  const counts = { running: 0, gameOver: 0, victory: 0 };
  for (const run of runs) counts[run.outcome] += 1;
  return counts;
}

function factionOutcomeCounts(runs: RunSummary[]): FactionMap<Record<Outcome, number>> {
  const result = {
    player: { running: 0, gameOver: 0, victory: 0 },
    rival: { running: 0, gameOver: 0, victory: 0 },
  };
  for (const run of runs) {
    for (const faction of FACTIONS) result[faction][run.factionOutcomes[faction]] += 1;
  }
  return result;
}

function deathsByCauseMedians(runs: RunSummary[]): DeathCauseMedians {
  const result: DeathCauseMedians = {
    player: { starvation: null, spider: null, combat: null, terminal_cull: null },
    rival: { starvation: null, spider: null, combat: null, terminal_cull: null },
  };
  for (const faction of FACTIONS) {
    for (const cause of DEATH_CAUSES) {
      result[faction][cause] = median(runs.map((run) => run.deathsByCause[faction][cause]));
    }
  }
  return result;
}

function obituaryAggregateMedians(runs: RunSummary[]): FactionMap<Record<DeathCause, ObituaryAggregate>> {
  const result = {
    player: {} as Record<DeathCause, ObituaryAggregate>,
    rival: {} as Record<DeathCause, ObituaryAggregate>,
  };
  for (const faction of FACTIONS) {
    for (const cause of DEATH_CAUSES) {
      const aggregates = runs.map((run) => run.obituaryAggregates[faction][cause]);
      result[faction][cause] = {
        count: aggregates.reduce((sum, aggregate) => sum + aggregate.count, 0),
        medianAge: median(aggregates.map((aggregate) => aggregate.medianAge).filter((value): value is number => value !== null)),
        medianDeliveries: median(aggregates.map((aggregate) => aggregate.medianDeliveries).filter((value): value is number => value !== null)),
        medianTicksSinceFoodPerceived: median(aggregates.map((aggregate) => aggregate.medianTicksSinceFoodPerceived).filter((value): value is number => value !== null)),
      };
    }
  }
  return result;
}

function populationQuartiles(runs: RunSummary[]) {
  return {
    peak: {
      player: quartiles(runs.map((run) => run.peakPopulationByFaction.player)),
      rival: quartiles(runs.map((run) => run.peakPopulationByFaction.rival)),
    },
    final: {
      player: quartiles(runs.map((run) => run.finalPopulationByFaction.player)),
      rival: quartiles(runs.map((run) => run.finalPopulationByFaction.rival)),
    },
  };
}

function safeRatio(numerator: number, denominator: number): number | null {
  return denominator > 0 ? numerator / denominator : null;
}

function flowTotals(runs: RunSummary[]): FactionMap<DebugFlowCounters> {
  const result = { player: zeroFlow(), rival: zeroFlow() };
  for (const run of runs) {
    for (const faction of FACTIONS) addFlow(result[faction], run.flowTotals[faction]);
  }
  return result;
}

function flowDeficitRatios(flow: FactionMap<DebugFlowCounters>): FlowDeficitRatios {
  return {
    player: {
      drainTotalToSnackEnergyGained: safeRatio(flow.player.drainTotal, flow.player.snackEnergyGained),
      foodDeliveredToQueenBroodConsumed: safeRatio(flow.player.foodDelivered, flow.player.queenConsumed + flow.player.broodConsumed),
    },
    rival: {
      drainTotalToSnackEnergyGained: safeRatio(flow.rival.drainTotal, flow.rival.snackEnergyGained),
      foodDeliveredToQueenBroodConsumed: safeRatio(flow.rival.foodDelivered, flow.rival.queenConsumed + flow.rival.broodConsumed),
    },
  };
}

function summarizeRuns(type: "seed_summary" | "cross_seed_rollup", runs: RunSummary[], seed?: number) {
  const cumulativeFlowTotals = flowTotals(runs);
  return {
    type,
    ...(seed === undefined ? {} : { seed }),
    runs: runs.length,
    replicates: seed === undefined ? undefined : runs.length,
    finalHashes: runs.map((run) => run.finalHash),
    hashesAllMatch: new Set(runs.map((run) => run.finalHash)).size <= 1,
    outcomeCounts: outcomeCounts(runs),
    factionOutcomeCounts: factionOutcomeCounts(runs),
    deathsByCauseMedians: deathsByCauseMedians(runs),
    obituaryAggregateMedians: obituaryAggregateMedians(runs),
    populationQuartiles: populationQuartiles(runs),
    flowTotals: cumulativeFlowTotals,
    flowDeficitRatios: flowDeficitRatios(cumulativeFlowTotals),
    ticksPerSecondQuartiles: quartiles(runs.map((run) => run.ticksPerSecond)),
  };
}

function seedsForBatch(options: RunOptions, scenario: Scenario | null): number[] {
  if (options.seeds) return options.seeds;
  if (options.seedExplicit) return [options.seed];
  if (scenario?.seed !== undefined) return [Math.floor(scenario.seed)];
  return [options.seed];
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const scenario: Scenario | null = options.scenarioPath ? parseScenario(JSON.parse(readFileSync(options.scenarioPath, "utf8"))) : null;
  if (options.out !== null) mkdirSync(dirname(options.out), { recursive: true });
  const stream = options.out === null ? process.stdout : createWriteStream(options.out);
  const writeLine = (value: unknown) => stream.write(`${JSON.stringify(value)}\n`);
  const batchMode = options.seeds !== null || options.replicates > 1;
  if (!batchMode) {
    writeLine(runOnce(options, scenario, null, 1, writeLine, true));
  } else {
    const allRuns: RunSummary[] = [];
    for (const seed of seedsForBatch(options, scenario)) {
      const seedRuns: RunSummary[] = [];
      for (let replicate = 1; replicate <= options.replicates; replicate += 1) {
        const summary = runOnce(options, scenario, seed, replicate, writeLine, false);
        seedRuns.push(summary);
        allRuns.push(summary);
      }
      writeLine(summarizeRuns("seed_summary", seedRuns, seed));
    }
    writeLine(summarizeRuns("cross_seed_rollup", allRuns));
  }
  if (options.out !== null) await new Promise<void>((resolve) => stream.end(resolve));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
