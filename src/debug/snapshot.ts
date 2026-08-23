import { getSeasonState } from "../sim";
import { AntMode, type Grid, type World } from "../types";
import { TUNING } from "../tuning";
import { getDebugState, type DeathCause, type DebugFlowCounters, type WorldDebugState } from "./events";

export const DEBUG_SCHEMA_VERSION = 1;

type FactionName = "player" | "rival";
type CauseCounts = {
  starvation: number;
  spider: number;
  combat: number;
  terminal_cull: number;
};

type NullableStats = {
  min: number | null;
  mean: number | null;
  p10: number | null;
  p50: number | null;
};

type FieldSummary = {
  sum: number;
  max: number;
  activeCells: number;
};

type EcologyGrid = Grid & {
  moisture: Float32Array;
  moistureEvapExp: Float32Array;
  pherFoodByFaction: [Float32Array, Float32Array];
  pherHomeByFaction: [Float32Array, Float32Array];
  activeFoodByFaction: [Int32Array, Int32Array];
  activeFoodListedByFaction: [Uint8Array, Uint8Array];
  activeFoodCountByFaction: Uint32Array;
  activeHomeByFaction: [Int32Array, Int32Array];
  activeHomeListedByFaction: [Uint8Array, Uint8Array];
  activeHomeCountByFaction: Uint32Array;
  diffuseFoodByFaction: [Float32Array, Float32Array];
  diffuseHomeByFaction: [Float32Array, Float32Array];
  lureAmt: Float32Array;
  activeLure: Int32Array;
  activeLureListed: Uint8Array;
  activeLureCount: number;
  evapFoodLocal: Float32Array;
  evapLureLocal: Float32Array;
  evapHomeLocal: Float32Array;
  evapDangerLocal: Float32Array;
  evapFoodBase: number;
  evapHomeBase: number;
  evapDangerBase: number;
  lureEvapBase: number;
};

type DebugAntStore = World["ants"] & {
  caste: Uint8Array;
  faction: Uint8Array;
};

type DebugSpider = World["spider"] & {
  hp: number;
};

type DebugSpatial = World["spatial"] & {
  factionMask: Uint8Array;
};

type EcologyWorld = World & {
  bushes: { x: number; y: number; cell: number; stock: number; regrowTimer: number }[];
  carcass: {
    active: boolean;
    x: number;
    y: number;
    age: number;
    amount: number;
    nextSpawn: number;
    spoiled: boolean;
    toast: number;
  };
  digCooldown: number;
  carcassDropCooldown: number;
  rainTimer: number;
  rainDuration: number;
  rainToast: number;
  rainCheckTimer: number;
  contestedTimer: number;
  peakPopulation: number;
  broodProgress: number;
  broodWork: number;
  queenHunger: number;
  terminalTimer: number;
  terminalStartAnts: number;
  terminalCull: number;
  gameOver: boolean;
  victory: boolean;
  victoryYear: number;
  combatMarks: Uint8Array;
  rival: {
    nestX: number;
    nestY: number;
    nestFood: number;
    broodProgress: number;
    broodWork: number;
    queenHunger: number;
    terminalTimer: number;
    terminalStartAnts: number;
    terminalCull: number;
    gameOver: boolean;
    nestPulse: number;
    nestPulseVel: number;
    totalDelivered: number;
    totalDeaths: number;
    peakPopulation: number;
  };
  grid: EcologyGrid;
};

export interface WorldSnapshot {
  meta: {
    tick: number;
    simTime: number;
    seed: number;
    hash: string;
    schemaVersion: number;
  };
  factions: Record<FactionName, {
    population: {
      total: number;
      byCaste: { worker: number; soldier: number; nurse: number };
      byMode: { Wander: number; Seek: number; Carry: number };
    };
    nestFood: number;
    broodProgress: number;
    queenHunger: number;
    terminal: boolean;
    gameOver: boolean;
    totalDeaths: number;
    deathsByCause: CauseCounts | null;
    totalDelivered: number;
    nanRespawns: number | null;
    energy: NullableStats;
    dispersion: {
      meanDistance: number | null;
      p90Distance: number | null;
      countBeyondR: number;
      radius: number;
    };
    age: { p50: number; max: number } | null;
    deliveriesPerAnt: { mean: number; p50: number } | null;
    neverDeliveredShare: number | null;
    flow: DebugFlowCounters | null;
  }>;
  fields: {
    player: { pherFood: FieldSummary; pherHome: FieldSummary };
    rival: { pherFood: FieldSummary; pherHome: FieldSummary };
    shared: { pherDanger: FieldSummary; lure: FieldSummary; moisture: FieldSummary };
  };
  food: {
    totalOnMap: number;
    activeCellCount: number;
    nearestDistanceByFaction: Record<FactionName, number | null>;
  };
  bushes: {
    count: number;
    totalStock: number;
    countRegrowing: number;
  };
  carcass: {
    active: boolean;
    amount: number;
    spoiled: boolean;
    age: number;
  };
  actors: {
    spider: { active: boolean; hp: number; x: number; y: number };
    corpseCount: number;
    obstacleCount: number;
  };
  season: ReturnType<typeof getSeasonState>;
  perf: { ticksPerSecond: number | null };
}

function ecologyWorld(world: World): EcologyWorld {
  return world as EcologyWorld;
}

function debugAnts(world: World): DebugAntStore {
  return world.ants as DebugAntStore;
}

function debugGrid(world: World): EcologyGrid {
  return world.grid as EcologyGrid;
}

function debugSpider(world: World): DebugSpider {
  return world.spider as DebugSpider;
}

function debugSpatial(world: World): DebugSpatial {
  return world.spatial as DebugSpatial;
}

function factionIndex(faction: number): 0 | 1 {
  return faction === TUNING.factions.rival ? 1 : 0;
}

function factionName(faction: number): FactionName {
  return faction === TUNING.factions.rival ? "rival" : "player";
}

function factionNest(world: EcologyWorld, faction: number): { x: number; y: number; food: number } {
  if (faction === TUNING.factions.rival) {
    return { x: world.rival.nestX, y: world.rival.nestY, food: world.rival.nestFood };
  }
  return { x: world.nestX, y: world.nestY, food: world.nestFood };
}

function quantile(sorted: number[], q: number): number | null {
  if (sorted.length === 0) return null;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * q)));
  return sorted[index];
}

function numberStats(values: number[]): NullableStats {
  if (values.length === 0) return { min: null, mean: null, p10: null, p50: null };
  values.sort((a, b) => a - b);
  let sum = 0;
  for (const value of values) sum += value;
  return {
    min: values[0],
    mean: sum / values.length,
    p10: quantile(values, 0.1),
    p50: quantile(values, 0.5),
  };
}

function fieldSummary(field: Float32Array, epsilon: number = TUNING.pher.activeEpsilon): FieldSummary {
  let sum = 0;
  let max = 0;
  let activeCells = 0;
  for (let i = 0; i < field.length; i += 1) {
    const value = field[i];
    sum += value;
    if (value > max) max = value;
    if (value > epsilon) activeCells += 1;
  }
  return { sum, max, activeCells };
}

const DEATH_CAUSES: DeathCause[] = ["starvation", "spider", "combat", "terminal_cull"];

function deathsByCause(debug: WorldDebugState, faction: number): CauseCounts {
  const slot = factionIndex(faction);
  return {
    starvation: debug.deathsByCause.starvation[slot],
    spider: debug.deathsByCause.spider[slot],
    combat: debug.deathsByCause.combat[slot],
    terminal_cull: debug.deathsByCause.terminal_cull[slot],
  };
}

function liveAntDebugStats(world: EcologyWorld, faction: number, debug: WorldDebugState | undefined) {
  if (!debug) {
    return {
      age: null,
      deliveriesPerAnt: null,
      neverDeliveredShare: null,
    };
  }
  const ants = debugAnts(world);
  const ages: number[] = [];
  const deliveries: number[] = [];
  let neverDelivered = 0;
  for (let i = 0; i < ants.count; i += 1) {
    if (ants.faction[i] !== faction) continue;
    const delivered = debug.ants.deliveries[i];
    ages.push(world.stepCount - debug.ants.birthTick[i]);
    deliveries.push(delivered);
    if (delivered === 0) neverDelivered += 1;
  }
  ages.sort((a, b) => a - b);
  deliveries.sort((a, b) => a - b);
  let deliverySum = 0;
  for (const value of deliveries) deliverySum += value;
  return {
    age: ages.length > 0 ? { p50: quantile(ages, 0.5) ?? 0, max: ages[ages.length - 1] } : { p50: 0, max: 0 },
    deliveriesPerAnt: deliveries.length > 0 ? { mean: deliverySum / deliveries.length, p50: quantile(deliveries, 0.5) ?? 0 } : { mean: 0, p50: 0 },
    neverDeliveredShare: deliveries.length > 0 ? neverDelivered / deliveries.length : 0,
  };
}

function factionSnapshot(world: EcologyWorld, faction: number, debug: WorldDebugState | undefined) {
  const ants = debugAnts(world);
  const nest = factionNest(world, faction);
  const energies: number[] = [];
  const distances: number[] = [];
  const radius = Math.hypot(world.width, world.height) / 3;
  const byCaste = { worker: 0, soldier: 0, nurse: 0 };
  const byMode = { Wander: 0, Seek: 0, Carry: 0 };
  let countBeyondR = 0;
  for (let i = 0; i < ants.count; i += 1) {
    if (ants.faction[i] !== faction) continue;
    if (ants.caste[i] === TUNING.caste.soldier) byCaste.soldier += 1;
    else if (ants.caste[i] === TUNING.caste.nurse) byCaste.nurse += 1;
    else byCaste.worker += 1;
    if (ants.mode[i] === AntMode.Seek) byMode.Seek += 1;
    else if (ants.mode[i] === AntMode.Carry) byMode.Carry += 1;
    else byMode.Wander += 1;
    energies.push(ants.energy[i]);
    const distance = Math.hypot(ants.x[i] - nest.x, ants.y[i] - nest.y);
    distances.push(distance);
    if (distance > radius) countBeyondR += 1;
  }
  distances.sort((a, b) => a - b);
  const total = byCaste.worker + byCaste.soldier + byCaste.nurse;
  let distanceSum = 0;
  for (const distance of distances) distanceSum += distance;
  const terminal = faction === TUNING.factions.rival ? world.rival.terminalTimer > 0 : world.terminalTimer > 0;
  const gameOver = faction === TUNING.factions.rival ? world.rival.gameOver : world.gameOver;
  const broodProgress = faction === TUNING.factions.rival ? world.rival.broodProgress : world.broodProgress;
  const queenHunger = faction === TUNING.factions.rival ? world.rival.queenHunger : world.queenHunger;
  const totalDeaths = faction === TUNING.factions.rival ? world.rival.totalDeaths : world.totalDeaths;
  const totalDelivered = faction === TUNING.factions.rival ? world.rival.totalDelivered : world.totalDelivered;
  const debugStats = liveAntDebugStats(world, faction, debug);
  return {
    population: { total, byCaste, byMode },
    nestFood: nest.food,
    broodProgress,
    queenHunger,
    terminal,
    gameOver,
    totalDeaths,
    deathsByCause: debug ? deathsByCause(debug, faction) : null,
    totalDelivered,
    nanRespawns: debug ? debug.nanRespawns[factionIndex(faction)] : null,
    energy: numberStats(energies),
    dispersion: {
      meanDistance: distances.length > 0 ? distanceSum / distances.length : null,
      p90Distance: quantile(distances, 0.9),
      countBeyondR,
      radius,
    },
    age: debugStats.age,
    deliveriesPerAnt: debugStats.deliveriesPerAnt,
    neverDeliveredShare: debugStats.neverDeliveredShare,
    flow: debug ? { ...debug.flow[factionIndex(faction)] } : null,
  };
}

function nearestFoodDistance(world: EcologyWorld, faction: number): number | null {
  const grid = world.grid;
  const nest = factionNest(world, faction);
  let nearest = Number.POSITIVE_INFINITY;
  for (let i = 0; i < grid.size; i += 1) {
    if (grid.foodAmt[i] <= TUNING.sim.minTurnEpsilon) continue;
    const x = (i % grid.cols + 0.5) * grid.cell;
    const y = (Math.floor(i / grid.cols) + 0.5) * grid.cell;
    const distance = Math.hypot(x - nest.x, y - nest.y);
    if (distance < nearest) nearest = distance;
  }
  return Number.isFinite(nearest) ? nearest : null;
}

function foodSnapshot(world: EcologyWorld) {
  const grid = world.grid;
  let totalOnMap = 0;
  let activeCellCount = 0;
  for (let i = 0; i < grid.size; i += 1) {
    const amount = grid.foodAmt[i];
    totalOnMap += amount;
    if (amount > TUNING.sim.minTurnEpsilon) activeCellCount += 1;
  }
  return {
    totalOnMap,
    activeCellCount,
    nearestDistanceByFaction: {
      player: nearestFoodDistance(world, TUNING.factions.player),
      rival: nearestFoodDistance(world, TUNING.factions.rival),
    },
  };
}

export function snapshotWorld(world: World, options: { ticksPerSecond?: number } = {}): WorldSnapshot {
  const ecology = ecologyWorld(world);
  const grid = debugGrid(world);
  const spider = debugSpider(world);
  const debug = getDebugState(world);
  let totalStock = 0;
  let countRegrowing = 0;
  for (const bush of ecology.bushes) {
    totalStock += bush.stock;
    if (bush.stock < TUNING.ecology.bushCap) countRegrowing += 1;
  }
  return {
    meta: {
      tick: world.stepCount,
      simTime: world.time,
      seed: TUNING.seed.value,
      hash: hashWorldState(world),
      schemaVersion: DEBUG_SCHEMA_VERSION,
    },
    factions: {
      player: factionSnapshot(ecology, TUNING.factions.player, debug),
      rival: factionSnapshot(ecology, TUNING.factions.rival, debug),
    },
    fields: {
      player: {
        pherFood: fieldSummary(grid.pherFoodByFaction[0]),
        pherHome: fieldSummary(grid.pherHomeByFaction[0]),
      },
      rival: {
        pherFood: fieldSummary(grid.pherFoodByFaction[1]),
        pherHome: fieldSummary(grid.pherHomeByFaction[1]),
      },
      shared: {
        pherDanger: fieldSummary(grid.pherDanger),
        lure: fieldSummary(grid.lureAmt),
        moisture: fieldSummary(grid.moisture, 0),
      },
    },
    food: foodSnapshot(ecology),
    bushes: {
      count: ecology.bushes.length,
      totalStock,
      countRegrowing,
    },
    carcass: {
      active: ecology.carcass.active,
      amount: ecology.carcass.amount,
      spoiled: ecology.carcass.spoiled,
      age: ecology.carcass.age,
    },
    actors: {
      spider: { active: spider.active, hp: spider.hp, x: spider.x, y: spider.y },
      corpseCount: world.corpses.length,
      obstacleCount: world.obstacles.length,
    },
    season: getSeasonState(world),
    perf: { ticksPerSecond: options.ticksPerSecond ?? null },
  };
}

class StableHasher {
  private h1 = 0x811c9dc5;
  private h2 = 0x9e3779b9;
  private readonly buffer = new ArrayBuffer(8);
  private readonly view = new DataView(this.buffer);

  tag(name: string): void {
    this.u32(0xfeedface);
    this.u32(name.length);
    for (let i = 0; i < name.length; i += 1) this.u32(name.charCodeAt(i));
  }

  bool(value: boolean): void {
    this.u32(value ? 1 : 0);
  }

  u32(value: number): void {
    let v = value >>> 0;
    this.h1 ^= v & 0xff;
    this.h1 = Math.imul(this.h1, 0x01000193) >>> 0;
    this.h1 ^= (v >>> 8) & 0xff;
    this.h1 = Math.imul(this.h1, 0x01000193) >>> 0;
    this.h1 ^= (v >>> 16) & 0xff;
    this.h1 = Math.imul(this.h1, 0x01000193) >>> 0;
    this.h1 ^= (v >>> 24) & 0xff;
    this.h1 = Math.imul(this.h1, 0x01000193) >>> 0;

    v = (value ^ 0xa5a5a5a5) >>> 0;
    this.h2 ^= v & 0xff;
    this.h2 = Math.imul(this.h2, 0x85ebca6b) >>> 0;
    this.h2 ^= (v >>> 8) & 0xff;
    this.h2 = Math.imul(this.h2, 0x85ebca6b) >>> 0;
    this.h2 ^= (v >>> 16) & 0xff;
    this.h2 = Math.imul(this.h2, 0x85ebca6b) >>> 0;
    this.h2 ^= (v >>> 24) & 0xff;
    this.h2 = Math.imul(this.h2, 0x85ebca6b) >>> 0;
  }

  f64(value: number): void {
    this.view.setFloat64(0, value, true);
    this.u32(this.view.getUint32(0, true));
    this.u32(this.view.getUint32(4, true));
  }

  typed(name: string, array: ArrayBufferView, elements: number): void {
    this.tag(name);
    this.u32(elements);
    const byteLength = elements * bytesPerElement(array);
    if (array.byteOffset % 4 === 0) {
      const wordLength = Math.floor(byteLength / 4);
      const words = new Uint32Array(array.buffer, array.byteOffset, wordLength);
      for (let i = 0; i < words.length; i += 1) this.u32(words[i]);
      const bytes = new Uint8Array(array.buffer, array.byteOffset + wordLength * 4, byteLength - wordLength * 4);
      let tail = 0;
      for (let i = 0; i < bytes.length; i += 1) tail |= bytes[i] << (i * 8);
      if (bytes.length > 0) this.u32(tail);
      return;
    }
    const bytes = new Uint8Array(array.buffer, array.byteOffset, byteLength);
    for (let i = 0; i < bytes.length; i += 4) {
      this.u32((bytes[i] ?? 0) | ((bytes[i + 1] ?? 0) << 8) | ((bytes[i + 2] ?? 0) << 16) | ((bytes[i + 3] ?? 0) << 24));
    }
  }

  result(): string {
    return `${this.h1.toString(16).padStart(8, "0")}${this.h2.toString(16).padStart(8, "0")}`;
  }
}

function bytesPerElement(array: ArrayBufferView): number {
  return "BYTES_PER_ELEMENT" in array ? Number(array.BYTES_PER_ELEMENT) : 1;
}

function scalar(hash: StableHasher, name: string, value: number): void {
  hash.tag(name);
  hash.f64(value);
}

function boolScalar(hash: StableHasher, name: string, value: boolean): void {
  hash.tag(name);
  hash.bool(value);
}

const PRESENTATION_TUNING_ROOTS = new Set(["ui", "controls", "camera", "minimap", "colors"]);
const HASHED_RENDER_TUNING = new Set(["particleCanvasPadding", "particleDrag", "particleGravity"]);

function shouldTraverseTuningPath(path: string[]): boolean {
  return path.length === 0 || !PRESENTATION_TUNING_ROOTS.has(path[0]);
}

function shouldHashTuningLeaf(path: string[]): boolean {
  const [root, leaf] = path;
  if (root === "render") return HASHED_RENDER_TUNING.has(leaf);
  if (root === "spider" && (leaf.startsWith("draw") || leaf.startsWith("toast"))) return false;
  if (root === "seasons" && (leaf.endsWith("Tint") || leaf.startsWith("rainStreak") || leaf.startsWith("rainToast"))) return false;
  if (root === "ecology" && leaf === "carcassToastSec") return false;
  if (root === "war" && (leaf.startsWith("skirmishToast") || leaf.startsWith("skirmishWindow"))) return false;
  if (root === "sim" && leaf === "fpsEma") return false;
  return true;
}

function hashString(hash: StableHasher, value: string): void {
  hash.u32(value.length);
  for (let i = 0; i < value.length; i += 1) hash.u32(value.charCodeAt(i));
}

function hashTuningValue(hash: StableHasher, path: string[], value: unknown): void {
  if (!shouldTraverseTuningPath(path)) return;
  if (Array.isArray(value)) {
    hash.tag(`tuning.${path.join(".")}`);
    hash.tag("array");
    hash.u32(value.length);
    for (let i = 0; i < value.length; i += 1) hashTuningValue(hash, [...path, String(i)], value[i]);
    return;
  }
  if (value && typeof value === "object") {
    const object = value as Record<string, unknown>;
    const keys = Object.keys(object).sort();
    hash.tag(`tuning.${path.join(".")}`);
    hash.tag("object");
    hash.u32(keys.length);
    for (const key of keys) hashTuningValue(hash, [...path, key], object[key]);
    return;
  }
  if (!shouldHashTuningLeaf(path)) return;
  hash.tag(`tuning.${path.join(".")}`);
  if (typeof value === "number") {
    hash.tag("number");
    hash.f64(value);
  } else if (typeof value === "boolean") {
    hash.tag("boolean");
    hash.bool(value);
  } else if (typeof value === "string") {
    hash.tag("string");
    hashString(hash, value);
  } else if (value === null || value === undefined) {
    hash.tag(String(value));
  } else {
    throw new Error(`Unsupported tuning hash value at ${path.join(".")}: ${typeof value}`);
  }
}

function hashTuning(hash: StableHasher): void {
  hash.tag("tuning");
  hashTuningValue(hash, [], TUNING);
}

function hashAnts(hash: StableHasher, world: World): void {
  const ants = debugAnts(world);
  hash.tag("ants");
  hash.u32(ants.count);
  hash.u32(ants.capacity);
  hash.typed("ants.x", ants.x, ants.count);
  hash.typed("ants.y", ants.y, ants.count);
  hash.typed("ants.heading", ants.heading, ants.count);
  hash.typed("ants.energy", ants.energy, ants.count);
  hash.typed("ants.stepsSincePickup", ants.stepsSincePickup, ants.count);
  hash.typed("ants.timerA", ants.timerA, ants.count);
  hash.typed("ants.timerB", ants.timerB, ants.count);
  hash.typed("ants.mode", ants.mode, ants.count);
  hash.typed("ants.carrying", ants.carrying, ants.count);
  hash.typed("ants.flags", ants.flags, ants.count);
  hash.typed("ants.caste", ants.caste, ants.count);
  hash.typed("ants.faction", ants.faction, ants.count);
}

function hashSpatial(hash: StableHasher, world: World): void {
  const spatial = debugSpatial(world);
  hash.tag("spatial");
  hash.u32(spatial.cell);
  hash.u32(spatial.cols);
  hash.u32(spatial.rows);
  hash.typed("spatial.heads", spatial.heads, spatial.heads.length);
  hash.typed("spatial.next", spatial.next, world.ants.count);
  hash.typed("spatial.wanderHeads", spatial.wanderHeads, spatial.wanderHeads.length);
  hash.typed("spatial.wanderNext", spatial.wanderNext, world.ants.count);
  hash.typed("spatial.wanderCounts", spatial.wanderCounts, spatial.wanderCounts.length);
  hash.typed("spatial.factionMask", spatial.factionMask, spatial.factionMask.length);
}

function hashGrid(hash: StableHasher, world: World): void {
  const grid = debugGrid(world);
  hash.tag("grid");
  hash.u32(grid.cell);
  hash.u32(grid.cols);
  hash.u32(grid.rows);
  hash.u32(grid.size);
  hash.typed("grid.pherFood.player", grid.pherFoodByFaction[0], grid.size);
  hash.typed("grid.pherFood.rival", grid.pherFoodByFaction[1], grid.size);
  hash.typed("grid.pherHome.player", grid.pherHomeByFaction[0], grid.size);
  hash.typed("grid.pherHome.rival", grid.pherHomeByFaction[1], grid.size);
  hash.typed("grid.pherDanger", grid.pherDanger, grid.size);
  hash.typed("grid.lureAmt", grid.lureAmt, grid.size);
  hash.typed("grid.moisture", grid.moisture, grid.size);
  hash.typed("grid.moistureEvapExp", grid.moistureEvapExp, grid.size);
  hash.typed("grid.foodAmt", grid.foodAmt, grid.size);
  hash.typed("grid.foodIndices", grid.foodIndices, grid.foodCount);
  hash.typed("grid.foodListed", grid.foodListed, grid.size);
  scalar(hash, "grid.foodCount", grid.foodCount);
  for (let faction = 0; faction < TUNING.factions.count; faction += 1) {
    hash.typed(`grid.activeFood.${faction}`, grid.activeFoodByFaction[factionIndex(faction)], grid.activeFoodCountByFaction[factionIndex(faction)]);
    hash.typed(`grid.activeFoodListed.${faction}`, grid.activeFoodListedByFaction[factionIndex(faction)], grid.size);
    hash.typed(`grid.activeHome.${faction}`, grid.activeHomeByFaction[factionIndex(faction)], grid.activeHomeCountByFaction[factionIndex(faction)]);
    hash.typed(`grid.activeHomeListed.${faction}`, grid.activeHomeListedByFaction[factionIndex(faction)], grid.size);
    scalar(hash, `grid.activeFoodCount.${faction}`, grid.activeFoodCountByFaction[factionIndex(faction)]);
    scalar(hash, `grid.activeHomeCount.${faction}`, grid.activeHomeCountByFaction[factionIndex(faction)]);
    hash.typed(`grid.diffuseFood.${faction}`, grid.diffuseFoodByFaction[factionIndex(faction)], grid.size);
    hash.typed(`grid.diffuseHome.${faction}`, grid.diffuseHomeByFaction[factionIndex(faction)], grid.size);
  }
  hash.typed("grid.activeLure", grid.activeLure, grid.activeLureCount);
  hash.typed("grid.activeLureListed", grid.activeLureListed, grid.size);
  scalar(hash, "grid.activeLureCount", grid.activeLureCount);
  hash.typed("grid.evapFoodLocal", grid.evapFoodLocal, grid.size);
  hash.typed("grid.evapLureLocal", grid.evapLureLocal, grid.size);
  hash.typed("grid.evapHomeLocal", grid.evapHomeLocal, grid.size);
  hash.typed("grid.evapDangerLocal", grid.evapDangerLocal, grid.size);
  scalar(hash, "grid.evapFoodBase", grid.evapFoodBase);
  scalar(hash, "grid.evapHomeBase", grid.evapHomeBase);
  scalar(hash, "grid.evapDangerBase", grid.evapDangerBase);
  scalar(hash, "grid.lureEvapBase", grid.lureEvapBase);
  hash.typed("grid.activeDanger", grid.activeDanger, grid.activeDangerCount);
  hash.typed("grid.activeDangerListed", grid.activeDangerListed, grid.size);
  scalar(hash, "grid.activeDangerCount", grid.activeDangerCount);
  hash.typed("grid.diffuseIndices", grid.diffuseIndices, grid.diffuseCount);
  hash.typed("grid.diffuseListed", grid.diffuseListed, grid.size);
  scalar(hash, "grid.diffuseCount", grid.diffuseCount);
  hash.typed("grid.diffuseFood", grid.diffuseFood, grid.size);
  hash.typed("grid.diffuseHome", grid.diffuseHome, grid.size);
  hash.typed("grid.diffuseDanger", grid.diffuseDanger, grid.size);
}

function hashActorLists(hash: StableHasher, world: EcologyWorld): void {
  hash.tag("obstacles");
  hash.u32(world.obstacles.length);
  for (const obstacle of world.obstacles) {
    hash.f64(obstacle.x);
    hash.f64(obstacle.y);
    hash.f64(obstacle.r);
    hash.f64(obstacle.seed);
  }
  hash.tag("corpses");
  hash.u32(world.corpses.length);
  for (const corpse of world.corpses) {
    hash.f64(corpse.x);
    hash.f64(corpse.y);
    hash.f64(corpse.decay);
    hash.f64(corpse.maxDecay);
  }
  hash.tag("bushes");
  hash.u32(world.bushes.length);
  for (const bush of world.bushes) {
    hash.f64(bush.x);
    hash.f64(bush.y);
    hash.f64(bush.cell);
    hash.f64(bush.stock);
    hash.f64(bush.regrowTimer);
  }
}

function hashSpider(hash: StableHasher, world: World): void {
  const spider = debugSpider(world);
  hash.tag("spider");
  hash.bool(spider.active);
  hash.f64(spider.x);
  hash.f64(spider.y);
  hash.f64(spider.heading);
  hash.f64(spider.age);
  hash.f64(spider.nextSpawn);
  hash.f64(spider.eatTimer);
  hash.f64(spider.edge);
  hash.f64(spider.hp);
}

function hashCarcass(hash: StableHasher, world: EcologyWorld): void {
  const carcass = world.carcass;
  hash.tag("carcass");
  hash.bool(carcass.active);
  hash.f64(carcass.x);
  hash.f64(carcass.y);
  hash.f64(carcass.age);
  hash.f64(carcass.amount);
  hash.f64(carcass.nextSpawn);
  hash.bool(carcass.spoiled);
}

function hashFactionScalars(hash: StableHasher, world: EcologyWorld): void {
  scalar(hash, "player.nestX", world.nestX);
  scalar(hash, "player.nestY", world.nestY);
  scalar(hash, "player.nestFood", world.nestFood);
  scalar(hash, "player.totalDeaths", world.totalDeaths);
  scalar(hash, "player.totalDelivered", world.totalDelivered);
  scalar(hash, "player.broodProgress", world.broodProgress);
  scalar(hash, "player.broodWork", world.broodWork);
  scalar(hash, "player.queenHunger", world.queenHunger);
  scalar(hash, "player.terminalTimer", world.terminalTimer);
  scalar(hash, "player.terminalStartAnts", world.terminalStartAnts);
  scalar(hash, "player.terminalCull", world.terminalCull);
  boolScalar(hash, "player.gameOver", world.gameOver);
  boolScalar(hash, "player.victory", world.victory);
  scalar(hash, "player.victoryYear", world.victoryYear);
  scalar(hash, "player.peakPopulation", world.peakPopulation);
  const rival = world.rival;
  scalar(hash, "rival.nestX", rival.nestX);
  scalar(hash, "rival.nestY", rival.nestY);
  scalar(hash, "rival.nestFood", rival.nestFood);
  scalar(hash, "rival.broodProgress", rival.broodProgress);
  scalar(hash, "rival.broodWork", rival.broodWork);
  scalar(hash, "rival.queenHunger", rival.queenHunger);
  scalar(hash, "rival.terminalTimer", rival.terminalTimer);
  scalar(hash, "rival.terminalStartAnts", rival.terminalStartAnts);
  scalar(hash, "rival.terminalCull", rival.terminalCull);
  boolScalar(hash, "rival.gameOver", rival.gameOver);
  scalar(hash, "rival.nestPulse", rival.nestPulse);
  scalar(hash, "rival.nestPulseVel", rival.nestPulseVel);
  scalar(hash, "rival.totalDelivered", rival.totalDelivered);
  scalar(hash, "rival.totalDeaths", rival.totalDeaths);
  scalar(hash, "rival.peakPopulation", rival.peakPopulation);
}

export function hashWorldState(world: World): string {
  const ecology = ecologyWorld(world);
  const hash = new StableHasher();
  hashTuning(hash);
  scalar(hash, "width", world.width);
  scalar(hash, "height", world.height);
  scalar(hash, "time", world.time);
  scalar(hash, "frame", world.frame);
  scalar(hash, "rng", world.rng);
  scalar(hash, "stepCount", world.stepCount);
  scalar(hash, "spawnTimer", world.spawnTimer);
  scalar(hash, "deathWindowTimer", world.deathWindowTimer);
  scalar(hash, "deathWindowCount", world.deathWindowCount);
  scalar(hash, "nestPulse", world.nestPulse);
  scalar(hash, "nestPulseVel", world.nestPulseVel);
  scalar(hash, "digCooldown", ecology.digCooldown);
  scalar(hash, "carcassDropCooldown", ecology.carcassDropCooldown);
  scalar(hash, "rainTimer", ecology.rainTimer);
  scalar(hash, "rainDuration", ecology.rainDuration);
  scalar(hash, "rainCheckTimer", ecology.rainCheckTimer);
  scalar(hash, "contestedTimer", ecology.contestedTimer);
  hashFactionScalars(hash, ecology);
  hashAnts(hash, world);
  hashSpatial(hash, world);
  hashGrid(hash, world);
  hashSpider(hash, world);
  hashCarcass(hash, ecology);
  hashActorLists(hash, ecology);
  hash.typed("combatMarks", ecology.combatMarks, world.ants.count);
  return hash.result();
}
