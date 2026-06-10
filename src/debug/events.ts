import { AntMode, type World } from "../types";
import { TUNING } from "../tuning";

export type DeathCause = "starvation" | "spider" | "combat" | "terminal_cull";
export type FactionDebugCounts = [number, number];
export type TraceModeReason = "saw_trail" | "saw_food" | "timer_expired" | "recruited" | "delivered" | "gave_up";

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

export interface TraceSensorSample {
  field: "food" | "home";
  center: number;
  left: number;
  right: number;
  threshold: number;
  centerAbove: boolean;
  leftAbove: boolean;
  rightAbove: boolean;
}

export interface TraceModeTransition {
  from: AntMode;
  to: AntMode;
  reason: TraceModeReason;
}

export type TraceInteraction =
  | { kind: "pickup"; x: number; y: number; cell: number; amountAfter: number }
  | { kind: "delivery"; faction: number; nestFood: number }
  | { kind: "combat"; cause: "combat"; faction: number }
  | { kind: "spider"; cause: "spider"; faction: number; spiderX: number; spiderY: number }
  | { kind: "starvation"; cause: "starvation"; faction: number }
  | { kind: "nan_respawn"; faction: number; x: number; y: number };

export interface TraceTickRecord {
  type: "tick";
  tick: number;
  id: number;
  x: number;
  y: number;
  heading: number;
  mode: AntMode;
  energy: number;
  carrying: number;
  timerA: number;
  timerB: number;
  sensors: TraceSensorSample[];
  transitions: TraceModeTransition[];
  interactions: TraceInteraction[];
}

export interface DebugTraceConfig {
  ids?: readonly number[];
  arms?: readonly string[];
  windowStart?: number;
  windowEnd?: number;
  beyondRadius?: number;
  beyondCount?: number;
  nanRespawn?: boolean;
  clear?: boolean;
}

export interface AntDebugStore {
  id: Uint32Array;
  birthTick: Uint32Array;
  distanceTraveled: Float32Array;
  ticksInMode: Float32Array;
  deliveries: Uint32Array;
  ticksSinceLastDelivery: Float32Array;
  ticksSinceFoodPerceived: Float32Array;
  traceActive: Uint8Array;
  traceBeyondRWasBeyond: Uint8Array;
}

interface DebugTraceState {
  enabled: boolean;
  tracedIds: Set<number>;
  ringById: Map<number, TraceTickRecord[]>;
  full: TraceTickRecord[];
  currentByIndex: Array<TraceTickRecord | undefined>;
  windowStart: number;
  windowEnd: number;
  armBeyondRRemaining: number;
  armBeyondRRadius: number;
  armNanRespawn: boolean;
  ringLimit: number;
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
  trace: DebugTraceState;
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

function createTraceState(capacity: number): DebugTraceState {
  return {
    enabled: false,
    tracedIds: new Set<number>(),
    ringById: new Map<number, TraceTickRecord[]>(),
    full: [],
    currentByIndex: new Array<TraceTickRecord | undefined>(capacity).fill(undefined),
    windowStart: 0,
    windowEnd: Number.POSITIVE_INFINITY,
    armBeyondRRemaining: 0,
    armBeyondRRadius: 0,
    armNanRespawn: false,
    ringLimit: 4096,
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
      traceActive: new Uint8Array(capacity),
      traceBeyondRWasBeyond: new Uint8Array(capacity),
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
    trace: createTraceState(capacity),
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
  debug.traceActive[to] = debug.traceActive[from];
  debug.traceBeyondRWasBeyond[to] = debug.traceBeyondRWasBeyond[from];
  const fromBase = from * 3;
  const toBase = to * 3;
  debug.ticksInMode[toBase] = debug.ticksInMode[fromBase];
  debug.ticksInMode[toBase + 1] = debug.ticksInMode[fromBase + 1];
  debug.ticksInMode[toBase + 2] = debug.ticksInMode[fromBase + 2];
  requireDebugState(world).trace.currentByIndex[to] = undefined;
}

export function resetDebugAntSlot(world: World, index: number): void {
  const debug = requireDebugState(world).ants;
  debug.id[index] = 0;
  debug.birthTick[index] = 0;
  debug.distanceTraveled[index] = 0;
  debug.deliveries[index] = 0;
  debug.ticksSinceLastDelivery[index] = 0;
  debug.ticksSinceFoodPerceived[index] = 0;
  debug.traceActive[index] = 0;
  debug.traceBeyondRWasBeyond[index] = 0;
  const base = index * 3;
  debug.ticksInMode[base] = 0;
  debug.ticksInMode[base + 1] = 0;
  debug.ticksInMode[base + 2] = 0;
  requireDebugState(world).trace.currentByIndex[index] = undefined;
}

export function assignDebugAntSlot(world: World, index: number, faction: number): void {
  const state = requireDebugState(world);
  resetDebugAntSlot(world, index);
  state.ants.id[index] = state.nextAntId;
  state.nextAntId += 1;
  state.ants.birthTick[index] = world.stepCount;
  if (state.trace.tracedIds.has(state.ants.id[index])) state.ants.traceActive[index] = 1;
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
  if (state.trace.armNanRespawn) activateTraceByIndex(state, index);
  recordTraceInteraction(world, index, { kind: "nan_respawn", faction, x: world.ants.x[index], y: world.ants.y[index] });
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

function activateTraceByIndex(state: WorldDebugState, index: number): boolean {
  const id = state.ants.id[index];
  if (id === 0) return false;
  state.trace.tracedIds.add(id);
  state.ants.traceActive[index] = 1;
  state.trace.enabled = true;
  return true;
}

function sanitizeTraceId(value: number): number | null {
  if (!Number.isFinite(value)) return null;
  const id = Math.floor(value);
  return id > 0 ? id : null;
}

function defaultBeyondRadius(world: World): number {
  return Math.hypot(world.width, world.height) / 3;
}

function applyTraceArm(world: World, state: WorldDebugState, arm: string): void {
  if (arm === "nan_respawn") {
    state.trace.armNanRespawn = true;
    state.trace.enabled = true;
    return;
  }
  if (arm.startsWith("beyondR:")) {
    const count = Number(arm.slice("beyondR:".length));
    if (!Number.isFinite(count) || count <= 0) throw new Error(`Invalid trace arm: ${arm}`);
    state.trace.armBeyondRRemaining += Math.floor(count);
    if (state.trace.armBeyondRRadius <= 0) state.trace.armBeyondRRadius = defaultBeyondRadius(world);
    state.trace.enabled = true;
    return;
  }
  throw new Error(`Unknown trace arm: ${arm}`);
}

export function clearDebugTrace(world: World): void {
  const state = requireDebugState(world);
  state.trace = createTraceState(world.ants.capacity);
  state.ants.traceActive.fill(0);
  state.ants.traceBeyondRWasBeyond.fill(0);
}

export function configureDebugTrace(world: World, config: DebugTraceConfig): void {
  const state = requireDebugState(world);
  if (config.clear) clearDebugTrace(world);
  const trace = state.trace;
  if (config.windowStart !== undefined) trace.windowStart = Math.max(0, Math.floor(config.windowStart));
  if (config.windowEnd !== undefined) trace.windowEnd = Math.max(trace.windowStart, Math.floor(config.windowEnd));
  if (config.beyondRadius !== undefined) trace.armBeyondRRadius = Math.max(0, config.beyondRadius);
  if (config.beyondCount !== undefined && config.beyondCount > 0) {
    trace.armBeyondRRemaining += Math.floor(config.beyondCount);
    if (trace.armBeyondRRadius <= 0) trace.armBeyondRRadius = defaultBeyondRadius(world);
    trace.enabled = true;
  }
  if (config.nanRespawn) {
    trace.armNanRespawn = true;
    trace.enabled = true;
  }
  for (const arm of config.arms ?? []) applyTraceArm(world, state, arm);
  for (const raw of config.ids ?? []) {
    const id = sanitizeTraceId(raw);
    if (id === null) continue;
    trace.tracedIds.add(id);
    trace.enabled = true;
  }
  for (let i = 0; i < world.ants.count; i += 1) {
    if (trace.tracedIds.has(state.ants.id[i])) state.ants.traceActive[i] = 1;
  }
}

export function getDebugTraceBeyondRadius(world: World): number {
  const trace = getDebugState(world)?.trace;
  if (!trace?.enabled || trace.armBeyondRRemaining <= 0) return 0;
  return trace.armBeyondRRadius > 0 ? trace.armBeyondRRadius : defaultBeyondRadius(world);
}

export function isDebugTraceEnabled(world: World): boolean {
  return getDebugState(world)?.trace.enabled === true;
}

export function updateDebugTraceBeyondArm(world: World, index: number, beyond: boolean): void {
  const state = getDebugState(world);
  if (!state?.trace.enabled || state.trace.armBeyondRRemaining <= 0) return;
  const wasBeyond = state.ants.traceBeyondRWasBeyond[index] !== 0;
  if (beyond && !wasBeyond && state.ants.traceActive[index] === 0 && activateTraceByIndex(state, index)) {
    state.trace.armBeyondRRemaining -= 1;
  }
  state.ants.traceBeyondRWasBeyond[index] = beyond ? 1 : 0;
}

function traceTickInWindow(trace: DebugTraceState, tick: number): boolean {
  return tick >= trace.windowStart && tick <= trace.windowEnd;
}

function ensureTraceRecord(world: World, index: number): TraceTickRecord | undefined {
  const state = getDebugState(world);
  if (!state?.trace.enabled || state.ants.traceActive[index] === 0 || !traceTickInWindow(state.trace, world.stepCount)) return undefined;
  const existing = state.trace.currentByIndex[index];
  if (existing) return existing;
  const ants = world.ants;
  const id = state.ants.id[index];
  if (id === 0) return undefined;
  const record: TraceTickRecord = {
    type: "tick",
    tick: world.stepCount,
    id,
    x: ants.x[index],
    y: ants.y[index],
    heading: ants.heading[index],
    mode: ants.mode[index],
    energy: ants.energy[index],
    carrying: ants.carrying[index],
    timerA: ants.timerA[index],
    timerB: ants.timerB[index],
    sensors: [],
    transitions: [],
    interactions: [],
  };
  state.trace.currentByIndex[index] = record;
  return record;
}

export function recordTraceTickStart(world: World, index: number): void {
  ensureTraceRecord(world, index);
}

export function recordTraceTickEnd(world: World, index: number): void {
  const state = getDebugState(world);
  if (!state?.trace.enabled) return;
  const record = state.trace.currentByIndex[index];
  if (!record) return;
  state.trace.full.push(record);
  const ring = state.trace.ringById.get(record.id) ?? [];
  ring.push(record);
  if (ring.length > state.trace.ringLimit) ring.shift();
  state.trace.ringById.set(record.id, ring);
  state.trace.currentByIndex[index] = undefined;
}

export function recordTraceSensor(world: World, index: number, sample: TraceSensorSample): void {
  const record = ensureTraceRecord(world, index);
  if (record) record.sensors.push(sample);
}

export function recordTraceModeTransition(world: World, index: number, from: AntMode, to: AntMode, reason: TraceModeReason): void {
  const record = ensureTraceRecord(world, index);
  if (record) record.transitions.push({ from, to, reason });
}

export function recordTraceInteraction(world: World, index: number, interaction: TraceInteraction): void {
  const record = ensureTraceRecord(world, index);
  if (record) record.interactions.push(interaction);
}

export function getDebugTrace(world: World, id?: number): TraceTickRecord[] {
  const trace = getDebugState(world)?.trace;
  if (!trace) return [];
  if (id !== undefined) return (trace.ringById.get(id) ?? []).slice();
  return trace.full.slice();
}
