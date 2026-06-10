import { AntMode, type World } from "../types";
import { TUNING } from "../tuning";

export type DeathCause = "starvation" | "spider" | "combat" | "terminal_cull";
export type FactionDebugCounts = [number, number];

export type DebugEvent =
  | {
      type: "death";
      tick: number;
      faction: number;
      cause: DeathCause;
      id: number;
      birthTick: number;
      age: number;
      deliveries: number;
      distanceTraveled: number;
      ticksInMode: [number, number, number];
      ticksSinceLastDelivery: number;
      ticksSinceFoodPerceived: number;
    }
  | { type: "nan_respawn"; tick: number; faction: number; id: number; x: number; y: number }
  | { type: "season_change"; tick: number; season: number; label: string; year: number }
  | { type: "rain_start"; tick: number }
  | { type: "rain_end"; tick: number }
  | { type: "carcass_spawn"; tick: number; x: number; y: number; amount: number }
  | { type: "carcass_spoiled"; tick: number; x: number; y: number; amount: number }
  | { type: "spider_spawn"; tick: number; x: number; y: number; hp: number }
  | { type: "spider_kill"; tick: number; x: number; y: number; victimId: number; victimFaction: number }
  | { type: "spider_squashed"; tick: number; x: number; y: number; rewardFaction: number }
  | { type: "brood_hatch"; tick: number; faction: number; caste: number }
  | { type: "terminal_start"; tick: number; faction: number }
  | { type: "terminal_end"; tick: number; faction: number }
  | { type: "game_over"; tick: number; faction: number; yearsSurvived: number }
  | { type: "victory"; tick: number; faction: number; yearsSurvived: number };

export interface AntDebugStore {
  id: Uint32Array;
  birthTick: Uint32Array;
  distanceTraveled: Float32Array;
  ticksInMode: Float32Array;
  deliveries: Uint32Array;
  ticksSinceLastDelivery: Float32Array;
  ticksSinceFoodPerceived: Float32Array;
}

export interface WorldDebugState {
  schemaVersion: 1;
  nextAntId: number;
  ants: AntDebugStore;
  events: Array<DebugEvent | null>;
  eventCursor: number;
  eventCount: number;
  captureAllEvents: boolean;
  allEvents: DebugEvent[];
  deathsByCause: Record<DeathCause, FactionDebugCounts>;
  nanRespawns: FactionDebugCounts;
  spawns: FactionDebugCounts;
  lastSeason: number;
}

type DebugWorld = World & {
  __antzooDebug?: WorldDebugState;
};

function factionIndex(faction: number): 0 | 1 {
  return faction === TUNING.factions.rival ? 1 : 0;
}

function emptyCauseCounts(): Record<DeathCause, FactionDebugCounts> {
  return {
    starvation: [0, 0],
    spider: [0, 0],
    combat: [0, 0],
    terminal_cull: [0, 0],
  };
}

export function initDebugState(world: World, initialSeason: number): WorldDebugState {
  const capacity = world.ants.capacity;
  const debug: WorldDebugState = {
    schemaVersion: 1,
    nextAntId: 1,
    ants: {
      id: new Uint32Array(capacity),
      birthTick: new Uint32Array(capacity),
      distanceTraveled: new Float32Array(capacity),
      ticksInMode: new Float32Array(capacity * 3),
      deliveries: new Uint32Array(capacity),
      ticksSinceLastDelivery: new Float32Array(capacity),
      ticksSinceFoodPerceived: new Float32Array(capacity),
    },
    events: new Array<DebugEvent | null>(2048).fill(null),
    eventCursor: 0,
    eventCount: 0,
    captureAllEvents: false,
    allEvents: [],
    deathsByCause: emptyCauseCounts(),
    nanRespawns: [0, 0],
    spawns: [0, 0],
    lastSeason: initialSeason,
  };
  (world as DebugWorld).__antzooDebug = debug;
  return debug;
}

export function getDebugState(world: World): WorldDebugState | undefined {
  return (world as DebugWorld).__antzooDebug;
}

function requireDebugState(world: World): WorldDebugState {
  const debug = getDebugState(world);
  if (!debug) return initDebugState(world, 0);
  return debug;
}

export function setDebugEventCapture(world: World, mode: "ring" | "full"): void {
  const debug = requireDebugState(world);
  debug.captureAllEvents = mode === "full";
  if (mode === "full") debug.allEvents.length = 0;
}

export function getDebugEvents(world: World, sinceTick?: number): DebugEvent[] {
  const debug = getDebugState(world);
  if (!debug) return [];
  const source = debug.captureAllEvents ? debug.allEvents : ringEvents(debug);
  return sinceTick === undefined ? source.slice() : source.filter((event) => event.tick >= sinceTick);
}

function ringEvents(debug: WorldDebugState): DebugEvent[] {
  const count = Math.min(debug.eventCount, debug.events.length);
  const events: DebugEvent[] = [];
  for (let i = 0; i < count; i += 1) {
    const index = (debug.eventCursor - count + i + debug.events.length) % debug.events.length;
    const event = debug.events[index];
    if (event) events.push(event);
  }
  return events;
}

export function recordDebugEvent(world: World, event: DebugEvent): void {
  const debug = requireDebugState(world);
  debug.events[debug.eventCursor] = event;
  debug.eventCursor = (debug.eventCursor + 1) % debug.events.length;
  debug.eventCount += 1;
  if (debug.captureAllEvents) debug.allEvents.push(event);
}

export function copyDebugAntSlot(world: World, from: number, to: number): void {
  const debug = requireDebugState(world).ants;
  debug.id[to] = debug.id[from];
  debug.birthTick[to] = debug.birthTick[from];
  debug.distanceTraveled[to] = debug.distanceTraveled[from];
  debug.deliveries[to] = debug.deliveries[from];
  debug.ticksSinceLastDelivery[to] = debug.ticksSinceLastDelivery[from];
  debug.ticksSinceFoodPerceived[to] = debug.ticksSinceFoodPerceived[from];
  const fromBase = from * 3;
  const toBase = to * 3;
  debug.ticksInMode[toBase] = debug.ticksInMode[fromBase];
  debug.ticksInMode[toBase + 1] = debug.ticksInMode[fromBase + 1];
  debug.ticksInMode[toBase + 2] = debug.ticksInMode[fromBase + 2];
}

export function resetDebugAntSlot(world: World, index: number): void {
  const debug = requireDebugState(world).ants;
  debug.id[index] = 0;
  debug.birthTick[index] = 0;
  debug.distanceTraveled[index] = 0;
  debug.deliveries[index] = 0;
  debug.ticksSinceLastDelivery[index] = 0;
  debug.ticksSinceFoodPerceived[index] = 0;
  const base = index * 3;
  debug.ticksInMode[base] = 0;
  debug.ticksInMode[base + 1] = 0;
  debug.ticksInMode[base + 2] = 0;
}

export function assignDebugAntSlot(world: World, index: number, faction: number): void {
  const state = requireDebugState(world);
  resetDebugAntSlot(world, index);
  state.ants.id[index] = state.nextAntId;
  state.nextAntId += 1;
  state.ants.birthTick[index] = world.stepCount;
  state.spawns[factionIndex(faction)] += 1;
}

export function recordDebugAntTick(world: World, index: number, previousX: number, previousY: number, previousMode: number, dt: number, delivered: boolean, perceivedFood: boolean): void {
  const debug = requireDebugState(world).ants;
  const dx = world.ants.x[index] - previousX;
  const dy = world.ants.y[index] - previousY;
  debug.distanceTraveled[index] += Math.hypot(dx, dy);
  const mode = previousMode === AntMode.Seek ? AntMode.Seek : previousMode === AntMode.Carry ? AntMode.Carry : AntMode.Wander;
  debug.ticksInMode[index * 3 + mode] += dt;
  if (delivered) {
    debug.deliveries[index] += 1;
    debug.ticksSinceLastDelivery[index] = 0;
  } else {
    debug.ticksSinceLastDelivery[index] += dt;
  }
  debug.ticksSinceFoodPerceived[index] = perceivedFood ? 0 : debug.ticksSinceFoodPerceived[index] + dt;
}

export function recordDebugDeath(world: World, index: number, faction: number, cause: DeathCause): void {
  const state = requireDebugState(world);
  const factionSlot = factionIndex(faction);
  state.deathsByCause[cause][factionSlot] += 1;
  const ants = state.ants;
  const base = index * 3;
  recordDebugEvent(world, {
    type: "death",
    tick: world.stepCount,
    faction,
    cause,
    id: ants.id[index],
    birthTick: ants.birthTick[index],
    age: world.stepCount - ants.birthTick[index],
    deliveries: ants.deliveries[index],
    distanceTraveled: ants.distanceTraveled[index],
    ticksInMode: [ants.ticksInMode[base], ants.ticksInMode[base + 1], ants.ticksInMode[base + 2]],
    ticksSinceLastDelivery: ants.ticksSinceLastDelivery[index],
    ticksSinceFoodPerceived: ants.ticksSinceFoodPerceived[index],
  });
}

export function recordDebugNanRespawn(world: World, index: number, faction: number): void {
  const state = requireDebugState(world);
  state.nanRespawns[factionIndex(faction)] += 1;
  recordDebugEvent(world, {
    type: "nan_respawn",
    tick: world.stepCount,
    faction,
    id: state.ants.id[index],
    x: world.ants.x[index],
    y: world.ants.y[index],
  });
}

export function recordDebugSeasonChange(world: World, season: number, label: string, year: number): void {
  const debug = requireDebugState(world);
  if (debug.lastSeason === season) return;
  debug.lastSeason = season;
  recordDebugEvent(world, { type: "season_change", tick: world.stepCount, season, label, year });
}

export function assertDebugAntIdsUnique(world: World): void {
  const debug = getDebugState(world);
  if (!debug) throw new Error("debug state missing");
  const seen = new Set<number>();
  for (let i = 0; i < world.ants.count; i += 1) {
    const id = debug.ants.id[i];
    if (id === 0) throw new Error(`ant ${i} has missing debug id`);
    if (seen.has(id)) throw new Error(`duplicate debug ant id ${id}`);
    seen.add(id);
  }
}
