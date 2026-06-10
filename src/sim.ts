import { AntFlag, AntMode, FxParticle, Grid, HudSnapshot, Obstacle, ParticleKind, SpatialHash, Telemetry, Tool, World } from "./types";
import { TUNING } from "./tuning";
import { assignDebugAntSlot, copyDebugAntSlot, getDebugState, getDebugTraceBeyondRadius, initDebugState, isDebugTraceEnabled, recordDebugAntTick, recordDebugDeath, recordDebugEvent, recordDebugNanRespawn, recordDebugSeasonChange, recordTraceInteraction, recordTraceModeTransition, recordTraceSensor, recordTraceTickEnd, recordTraceTickStart, resetDebugAntSlot, updateDebugTraceBeyondArm, type DeathCause } from "./debug/events";

const TAU = TUNING.sim.tau;
const HALF = TUNING.sim.randomTurnHalf;
const STEP_DT = 1 / TUNING.time.stepHz;
const TOOL_LURE = "lure" as Tool;
const TOOL_DIG = "dig" as Tool;
const FACTION_PLAYER = TUNING.factions.player;
const FACTION_RIVAL = TUNING.factions.rival;
const FACTION_ALL = TUNING.factions.all;
let warnedNonFiniteAnt = false;

type QueryCallback = (index: number) => boolean | void;
type CasteAntStore = World["ants"] & { caste: Uint8Array };
type FactionAntStore = CasteAntStore & { faction: Uint8Array };
type CombatSpider = World["spider"] & { hp: number };
type FactionSpatialHash = SpatialHash & { factionMask: Uint8Array };
type FieldPair = [Float32Array, Float32Array];
type IndexPair = [Int32Array, Int32Array];
type ListedPair = [Uint8Array, Uint8Array];

type EcologyGrid = Grid & {
  moisture: Float32Array;
  moistureEvapExp: Float32Array;
  pherFoodByFaction: FieldPair;
  pherHomeByFaction: FieldPair;
  activeFoodByFaction: IndexPair;
  activeFoodListedByFaction: ListedPair;
  activeFoodCountByFaction: Uint32Array;
  activeHomeByFaction: IndexPair;
  activeHomeListedByFaction: ListedPair;
  activeHomeCountByFaction: Uint32Array;
  diffuseFoodByFaction: FieldPair;
  diffuseHomeByFaction: FieldPair;
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

interface BerryBush {
  x: number;
  y: number;
  cell: number;
  stock: number;
  regrowTimer: number;
}

interface CarcassWindfall {
  active: boolean;
  x: number;
  y: number;
  age: number;
  amount: number;
  nextSpawn: number;
  spoiled: boolean;
  toast: number;
}

interface RivalColony {
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
  dripTimer: number;
  nestPulse: number;
  nestPulseVel: number;
  totalDelivered: number;
  totalDeaths: number;
  peakPopulation: number;
}

export interface SeasonState {
  season: number;
  label: string;
  year: number;
  yearsSurvived: number;
  yearProgress: number;
  seasonProgress: number;
  timeToNext: number;
  rain: number;
  rainToast: number;
  peakPopulation: number;
  winterReserveHint: number;
  isWinter: boolean;
}

export interface ColonyStatus {
  workers: number;
  soldiers: number;
  nurses: number;
  broodProgress: number;
  broodRequired: number;
  queenHunger: number;
  queenHungerLimit: number;
  terminal: boolean;
  terminalProgress: number;
  gameOver: boolean;
  victory: boolean;
  victoryYear: number;
  yearsSurvived: number;
  peakPopulation: number;
  totalFoodGathered: number;
  totalDeaths: number;
}

type EcologyWorld = World & {
  bushes: BerryBush[];
  carcass: CarcassWindfall;
  digCooldown: number;
  carcassDropCooldown: number;
  rainTimer: number;
  rainDuration: number;
  rainToast: number;
  rainCheckTimer: number;
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
  rival: RivalColony;
  grid: EcologyGrid;
};

function ecologyWorld(world: World): EcologyWorld {
  return world as EcologyWorld;
}

function ecologyGrid(grid: Grid): EcologyGrid {
  return grid as EcologyGrid;
}

function casteAnts(ants: World["ants"]): CasteAntStore {
  return ants as CasteAntStore;
}

function factionAnts(ants: World["ants"]): FactionAntStore {
  return ants as FactionAntStore;
}

function combatSpider(world: World): CombatSpider {
  return world.spider as CombatSpider;
}

function factionSpatial(spatial: SpatialHash): FactionSpatialHash {
  return spatial as FactionSpatialHash;
}

function factionIndex(faction: number): 0 | 1 {
  return faction === FACTION_RIVAL ? 1 : 0;
}

function pherFoodField(grid: Grid, faction: number): Float32Array {
  return ecologyGrid(grid).pherFoodByFaction[factionIndex(faction)];
}

function pherHomeField(grid: Grid, faction: number): Float32Array {
  return ecologyGrid(grid).pherHomeByFaction[factionIndex(faction)];
}

function nestX(world: World, faction: number): number {
  return faction === FACTION_RIVAL ? ecologyWorld(world).rival.nestX : world.nestX;
}

function nestY(world: World, faction: number): number {
  return faction === FACTION_RIVAL ? ecologyWorld(world).rival.nestY : world.nestY;
}

function nestFood(world: World, faction: number): number {
  return faction === FACTION_RIVAL ? ecologyWorld(world).rival.nestFood : world.nestFood;
}

function setNestFood(world: World, faction: number, value: number): void {
  if (faction === FACTION_RIVAL) ecologyWorld(world).rival.nestFood = value;
  else world.nestFood = value;
}

function addNestFood(world: World, faction: number, amount: number): void {
  setNestFood(world, faction, nestFood(world, faction) + amount);
}

function nestPulse(world: World, faction: number, amount: number): void {
  if (faction === FACTION_RIVAL) ecologyWorld(world).rival.nestPulseVel += amount;
  else world.nestPulseVel += amount;
}

function nextRand(world: World): number {
  world.rng = (world.rng * 1664525 + 1013904223) >>> 0;
  return world.rng / 4294967296;
}

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

function angleTo(x: number, y: number): number {
  return Math.atan2(y, x);
}

function angleDelta(from: number, to: number): number {
  let d = to - from;
  while (d > Math.PI) d -= TAU;
  while (d < -Math.PI) d += TAU;
  return d;
}

function hash01(value: number): number {
  let x = value | 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return (x >>> 0) / 4294967296;
}

function seasonAt(time: number): number {
  return Math.floor((time % TUNING.seasons.yearSec) / TUNING.seasons.seasonSec);
}

function seasonLabel(season: number): string {
  if (season === TUNING.seasons.spring) return "Spring";
  if (season === TUNING.seasons.summer) return "Summer";
  if (season === TUNING.seasons.fall) return "Fall";
  return "Winter";
}

function seasonEnergyDrainMul(season: number): number {
  if (season === TUNING.seasons.fall) return TUNING.seasons.fallEnergyDrainMul;
  if (season === TUNING.seasons.winter) return TUNING.seasons.winterEnergyDrainMul;
  return 1;
}

function seasonSpeedMul(season: number): number {
  return season === TUNING.seasons.winter ? TUNING.seasons.winterSpeedMul : 1;
}

function seasonBushRegrowMul(season: number): number {
  if (season === TUNING.seasons.spring) return TUNING.seasons.springBushRegrowMul;
  if (season === TUNING.seasons.fall) return TUNING.seasons.fallBushRegrowMul;
  if (season === TUNING.seasons.winter) return TUNING.seasons.winterBushRegrowMul;
  return TUNING.seasons.summerBushRegrowMul;
}

function seasonCarcassChanceMul(season: number): number {
  if (season === TUNING.seasons.fall) return TUNING.seasons.fallCarcassChanceMul;
  if (season === TUNING.seasons.winter) return 0;
  return 1;
}

function seasonRainChancePerSec(season: number): number {
  if (season === TUNING.seasons.spring) return TUNING.seasons.rainSpringChancePerSec;
  if (season === TUNING.seasons.summer) return TUNING.seasons.rainSummerChancePerSec;
  if (season === TUNING.seasons.fall) return TUNING.seasons.rainFallChancePerSec;
  return TUNING.seasons.rainWinterChancePerSec;
}

function energyMaxForCaste(caste: number): number {
  return caste === TUNING.caste.soldier ? TUNING.ant.energyMax * TUNING.caste.soldierEnergyMaxMul : TUNING.ant.energyMax;
}

function chooseCaste(world: World, faction: number = FACTION_PLAYER): number {
  const workerRatio = faction === FACTION_RIVAL ? TUNING.rival.workerRatio : TUNING.caste.workerRatio;
  const soldierRatio = faction === FACTION_RIVAL ? TUNING.rival.soldierRatio : TUNING.caste.soldierRatio;
  const nurseRatio = faction === FACTION_RIVAL ? TUNING.rival.nurseRatio : TUNING.caste.nurseRatio;
  const total = Math.max(TUNING.sim.minTurnEpsilon, workerRatio + soldierRatio + nurseRatio);
  const roll = nextRand(world) * total;
  if (roll < workerRatio) return TUNING.caste.worker;
  if (roll < workerRatio + soldierRatio) return TUNING.caste.soldier;
  return TUNING.caste.nurse;
}

function turnToward(current: number, target: number, maxTurn: number): number {
  const delta = angleDelta(current, target);
  if (delta > maxTurn) return current + maxTurn;
  if (delta < -maxTurn) return current - maxTurn;
  return target;
}

function createAntStore() {
  const capacity = TUNING.caps.maxAnts;
  return {
    capacity,
    count: 0,
    freeCount: 0,
    freeList: new Int32Array(capacity),
    x: new Float32Array(capacity),
    y: new Float32Array(capacity),
    heading: new Float32Array(capacity),
    energy: new Float32Array(capacity),
    stepsSincePickup: new Float32Array(capacity),
    timerA: new Float32Array(capacity),
    timerB: new Float32Array(capacity),
    mode: new Uint8Array(capacity),
    carrying: new Uint8Array(capacity),
    flags: new Uint8Array(capacity),
    caste: new Uint8Array(capacity),
    faction: new Uint8Array(capacity),
  };
}

function createSpatialHash(): SpatialHash {
  const cell = TUNING.spatial.cell;
  const cols = Math.ceil(TUNING.world.w / cell);
  const rows = Math.ceil(TUNING.world.h / cell);
  return {
    cell,
    cols,
    rows,
    heads: new Int32Array(cols * rows),
    next: new Int32Array(TUNING.caps.maxAnts),
    wanderHeads: new Int32Array(cols * rows),
    wanderNext: new Int32Array(TUNING.caps.maxAnts),
    wanderCounts: new Uint16Array(cols * rows),
    factionMask: new Uint8Array(cols * rows),
  } as FactionSpatialHash;
}

function createTelemetry(): Telemetry {
  const len = TUNING.ui.chartSamples;
  return {
    population: new Float32Array(len),
    nestFood: new Float32Array(len),
    deaths: new Float32Array(len),
    foodPerMin: new Float32Array(len),
    fps: new Float32Array(len),
    simMs: new Float32Array(len),
    renderMs: new Float32Array(len),
    index: 0,
    count: 0,
    timer: 0,
    deliveries: new Float32Array(len),
    deliveryTimes: new Float32Array(len),
    deliveryIndex: 0,
    deliveryCount: 0,
  };
}

function createGrid(): EcologyGrid {
  const cell = TUNING.grid.cell;
  const cols = Math.max(1, Math.ceil(TUNING.world.w / cell));
  const rows = Math.max(1, Math.ceil(TUNING.world.h / cell));
  const size = cols * rows;
  const pherFoodPlayer = new Float32Array(size);
  const pherFoodRival = new Float32Array(size);
  const pherHomePlayer = new Float32Array(size);
  const pherHomeRival = new Float32Array(size);
  const activeFoodPlayer = new Int32Array(size);
  const activeFoodRival = new Int32Array(size);
  const activeHomePlayer = new Int32Array(size);
  const activeHomeRival = new Int32Array(size);
  const activeFoodListedPlayer = new Uint8Array(size);
  const activeFoodListedRival = new Uint8Array(size);
  const activeHomeListedPlayer = new Uint8Array(size);
  const activeHomeListedRival = new Uint8Array(size);
  const diffuseFoodPlayer = new Float32Array(size);
  const diffuseFoodRival = new Float32Array(size);
  const diffuseHomePlayer = new Float32Array(size);
  const diffuseHomeRival = new Float32Array(size);
  const grid: EcologyGrid = {
    cell,
    cols,
    rows,
    size,
    moisture: new Float32Array(size),
    moistureEvapExp: new Float32Array(size),
    pherFoodByFaction: [pherFoodPlayer, pherFoodRival],
    pherHomeByFaction: [pherHomePlayer, pherHomeRival],
    activeFoodByFaction: [activeFoodPlayer, activeFoodRival],
    activeFoodListedByFaction: [activeFoodListedPlayer, activeFoodListedRival],
    activeFoodCountByFaction: new Uint32Array(TUNING.factions.count),
    activeHomeByFaction: [activeHomePlayer, activeHomeRival],
    activeHomeListedByFaction: [activeHomeListedPlayer, activeHomeListedRival],
    activeHomeCountByFaction: new Uint32Array(TUNING.factions.count),
    diffuseFoodByFaction: [diffuseFoodPlayer, diffuseFoodRival],
    diffuseHomeByFaction: [diffuseHomePlayer, diffuseHomeRival],
    lureAmt: new Float32Array(size),
    activeLure: new Int32Array(size),
    activeLureListed: new Uint8Array(size),
    activeLureCount: 0,
    evapFoodLocal: new Float32Array(size),
    evapLureLocal: new Float32Array(size),
    evapHomeLocal: new Float32Array(size),
    evapDangerLocal: new Float32Array(size),
    evapFoodBase: 0,
    evapHomeBase: 0,
    evapDangerBase: 0,
    lureEvapBase: 0,
    pherFood: pherFoodPlayer,
    pherHome: pherHomePlayer,
    pherDanger: new Float32Array(size),
    foodAmt: new Float32Array(size),
    foodIndices: new Int32Array(size),
    foodListed: new Uint8Array(size),
    foodCount: 0,
    activeFood: activeFoodPlayer,
    activeFoodListed: activeFoodListedPlayer,
    activeFoodCount: 0,
    activeHome: activeHomePlayer,
    activeHomeListed: activeHomeListedPlayer,
    activeHomeCount: 0,
    activeDanger: new Int32Array(size),
    activeDangerListed: new Uint8Array(size),
    activeDangerCount: 0,
    diffuseIndices: new Int32Array(size),
    diffuseListed: new Uint8Array(size),
    diffuseCount: 0,
    diffuseFood: diffuseFoodPlayer,
    diffuseHome: diffuseHomePlayer,
    diffuseDanger: new Float32Array(size),
  };
  return grid;
}

function cellIndex(grid: Grid, x: number, y: number): number {
  const cx = clamp(Math.floor(x / grid.cell), 0, grid.cols - 1);
  const cy = clamp(Math.floor(y / grid.cell), 0, grid.rows - 1);
  return cy * grid.cols + cx;
}

function addFoodIndex(grid: Grid, idx: number): void {
  if (grid.foodListed[idx] === 0) {
    grid.foodListed[idx] = 1;
    grid.foodIndices[grid.foodCount] = idx;
    grid.foodCount += 1;
  }
}

function removeFoodIndex(grid: Grid, idx: number): void {
  if (grid.foodListed[idx] === 0) return;
  grid.foodListed[idx] = 0;
  for (let i = 0; i < grid.foodCount; i += 1) {
    if (grid.foodIndices[i] === idx) {
      grid.foodCount -= 1;
      grid.foodIndices[i] = grid.foodIndices[grid.foodCount];
      return;
    }
  }
}

function addActiveIndex(indices: Int32Array, listed: Uint8Array, count: number, idx: number): number {
  if (listed[idx] === 0) {
    listed[idx] = 1;
    indices[count] = idx;
    return count + 1;
  }
  return count;
}

function activatePher(grid: Grid, field: Float32Array, idx: number): void {
  const ecology = ecologyGrid(grid);
  for (let faction = 0; faction < TUNING.factions.count; faction += 1) {
    if (field === ecology.pherFoodByFaction[faction]) {
      ecology.activeFoodCountByFaction[faction] = addActiveIndex(ecology.activeFoodByFaction[faction], ecology.activeFoodListedByFaction[faction], ecology.activeFoodCountByFaction[faction], idx);
      if (faction === FACTION_PLAYER) grid.activeFoodCount = ecology.activeFoodCountByFaction[faction];
      return;
    }
    if (field === ecology.pherHomeByFaction[faction]) {
      ecology.activeHomeCountByFaction[faction] = addActiveIndex(ecology.activeHomeByFaction[faction], ecology.activeHomeListedByFaction[faction], ecology.activeHomeCountByFaction[faction], idx);
      if (faction === FACTION_PLAYER) grid.activeHomeCount = ecology.activeHomeCountByFaction[faction];
      return;
    }
  }
  grid.activeDangerCount = addActiveIndex(grid.activeDanger, grid.activeDangerListed, grid.activeDangerCount, idx);
}

function activateLure(grid: EcologyGrid, idx: number): void {
  grid.activeLureCount = addActiveIndex(grid.activeLure, grid.activeLureListed, grid.activeLureCount, idx);
}

function splatPher(grid: Grid, field: Float32Array, idx: number, amount: number): void {
  field[idx] = Math.min(TUNING.pher.cap, field[idx] + amount);
  activatePher(grid, field, idx);
}

function splatPherRadius(grid: Grid, field: Float32Array, x: number, y: number, radius: number, amount: number): void {
  const minCx = clamp(Math.floor((x - radius) / grid.cell), 0, grid.cols - 1);
  const maxCx = clamp(Math.floor((x + radius) / grid.cell), 0, grid.cols - 1);
  const minCy = clamp(Math.floor((y - radius) / grid.cell), 0, grid.rows - 1);
  const maxCy = clamp(Math.floor((y + radius) / grid.cell), 0, grid.rows - 1);
  const r2 = radius * radius;
  for (let cy = minCy; cy <= maxCy; cy += 1) {
    const py = (cy + HALF) * grid.cell;
    for (let cx = minCx; cx <= maxCx; cx += 1) {
      const px = (cx + HALF) * grid.cell;
      const dx = px - x;
      const dy = py - y;
      if (dx * dx + dy * dy <= r2) splatPher(grid, field, cy * grid.cols + cx, amount);
    }
  }
}

function splatFoodScent(grid: Grid, idx: number, amount: number, faction: number): void {
  if (faction === FACTION_ALL) {
    for (let i = 0; i < TUNING.factions.count; i += 1) splatPher(grid, pherFoodField(grid, i), idx, amount);
    return;
  }
  splatPher(grid, pherFoodField(grid, faction), idx, amount);
}

function splatFoodScentRadius(grid: Grid, x: number, y: number, radius: number, amount: number, faction: number): void {
  if (faction === FACTION_ALL) {
    for (let i = 0; i < TUNING.factions.count; i += 1) splatPherRadius(grid, pherFoodField(grid, i), x, y, radius, amount);
    return;
  }
  splatPherRadius(grid, pherFoodField(grid, faction), x, y, radius, amount);
}

function paintLure(world: World, x: number, y: number): void {
  const grid = ecologyGrid(world.grid);
  const radius = TUNING.tools.lureRadius;
  const minCx = clamp(Math.floor((x - radius) / grid.cell), 0, grid.cols - 1);
  const maxCx = clamp(Math.floor((x + radius) / grid.cell), 0, grid.cols - 1);
  const minCy = clamp(Math.floor((y - radius) / grid.cell), 0, grid.rows - 1);
  const maxCy = clamp(Math.floor((y + radius) / grid.cell), 0, grid.rows - 1);
  const r2 = radius * radius;
  for (let cy = minCy; cy <= maxCy; cy += 1) {
    const py = (cy + HALF) * grid.cell;
    for (let cx = minCx; cx <= maxCx; cx += 1) {
      const px = (cx + HALF) * grid.cell;
      const dx = px - x;
      const dy = py - y;
      const d2 = dx * dx + dy * dy;
      if (d2 > r2) continue;
      const idx = cy * grid.cols + cx;
      const room = TUNING.pher.cap - grid.pherFood[idx];
      if (room <= TUNING.sim.minTurnEpsilon) continue;
      const applied = TUNING.tools.lureStrength < room ? TUNING.tools.lureStrength : room;
      grid.pherFood[idx] += applied;
      grid.lureAmt[idx] = Math.min(TUNING.pher.cap, grid.lureAmt[idx] + applied);
      activatePher(grid, grid.pherFood, idx);
      activateLure(grid, idx);
    }
  }
}

function spawnParticle(world: World, x: number, y: number, kind: ParticleKind, count: number, speed: number, life: number, size: number): void {
  for (let i = 0; i < count; i += 1) {
    const p = world.particles[world.particleCursor];
    world.particleCursor = (world.particleCursor + 1) % TUNING.fx.maxParticles;
    const a = nextRand(world) * TAU;
    const s = speed * (HALF + nextRand(world));
    p.x = x;
    p.y = y;
    p.vx = Math.cos(a) * s;
    p.vy = Math.sin(a) * s;
    p.life = life;
    p.maxLife = life;
    p.size = size * (HALF + nextRand(world));
    p.kind = kind;
    p.active = true;
  }
}

function spawnDeliveryParticle(world: World, x: number, y: number, faction: number): void {
  const count = TUNING.particles.nest.count;
  const speed = TUNING.particles.nest.speed;
  const life = TUNING.particles.nest.life;
  const size = TUNING.particles.nest.size;
  const dx = nestX(world, faction) - x;
  const dy = nestY(world, faction) - y;
  for (let i = 0; i < count; i += 1) {
    const p = world.particles[world.particleCursor];
    world.particleCursor = (world.particleCursor + 1) % TUNING.fx.maxParticles;
    const side = (nextRand(world) - HALF) * speed * HALF;
    const lift = speed * HALF * (HALF + nextRand(world) * HALF);
    p.x = x;
    p.y = y;
    p.vx = dx / life + side;
    p.vy = dy / life - lift;
    p.life = life;
    p.maxLife = life;
    p.size = size * (HALF + nextRand(world));
    p.kind = ParticleKind.Nest;
    p.active = true;
  }
}

function pushCorpse(world: World, x: number, y: number): void {
  world.corpses.push({ x, y, decay: TUNING.corpse.decaySec, maxDecay: TUNING.corpse.decaySec });
}

function recordAntDeath(world: World, faction: number, cause: DeathCause, index: number): void {
  if (faction === FACTION_RIVAL) ecologyWorld(world).rival.totalDeaths += 1;
  else {
    world.totalDeaths += 1;
    world.deathWindowCount += 1;
  }
  recordDebugDeath(world, index, faction, cause);
}

function copyAntSlot(world: World, from: number, to: number): void {
  const ants = world.ants;
  const caste = casteAnts(ants).caste;
  const faction = factionAnts(ants).faction;
  ants.x[to] = ants.x[from];
  ants.y[to] = ants.y[from];
  ants.heading[to] = ants.heading[from];
  ants.energy[to] = ants.energy[from];
  ants.stepsSincePickup[to] = ants.stepsSincePickup[from];
  ants.timerA[to] = ants.timerA[from];
  ants.timerB[to] = ants.timerB[from];
  ants.mode[to] = ants.mode[from];
  ants.carrying[to] = ants.carrying[from];
  ants.flags[to] = ants.flags[from];
  caste[to] = caste[from];
  faction[to] = faction[from];
  copyDebugAntSlot(world, from, to);
}

function removeAnt(world: World, index: number): void {
  const ants = world.ants;
  const caste = casteAnts(ants).caste;
  const faction = factionAnts(ants).faction;
  const last = ants.count - 1;
  if (index !== last) copyAntSlot(world, last, index);
  ants.flags[last] = 0;
  ants.carrying[last] = 0;
  ants.mode[last] = AntMode.Wander;
  caste[last] = TUNING.caste.worker;
  faction[last] = FACTION_PLAYER;
  resetDebugAntSlot(world, last);
  ants.count = last;
  ants.freeList[ants.freeCount] = last;
  ants.freeCount = Math.min(ants.capacity, ants.freeCount + 1);
}

function addAnt(world: World, x: number, y: number, heading: number, casteValue: number = TUNING.caste.worker, factionValue: number = FACTION_PLAYER, respectGameplayCap: boolean = true): number {
  const ants = world.ants;
  const caste = casteAnts(ants).caste;
  const faction = factionAnts(ants).faction;
  const max = respectGameplayCap ? Math.min(TUNING.ants.max, ants.capacity) : ants.capacity;
  if (ants.count >= max) return -1;
  const index = ants.count;
  ants.count += 1;
  if (ants.freeCount > 0) ants.freeCount -= 1;
  ants.x[index] = x;
  ants.y[index] = y;
  ants.heading[index] = heading;
  ants.energy[index] = energyMaxForCaste(casteValue);
  ants.stepsSincePickup[index] = 0;
  ants.timerA[index] = 0;
  ants.timerB[index] = 0;
  ants.mode[index] = AntMode.Wander;
  ants.carrying[index] = 0;
  ants.flags[index] = AntFlag.Alive;
  caste[index] = casteValue;
  faction[index] = factionValue;
  assignDebugAntSlot(world, index, factionValue);
  return index;
}

function depositFood(world: World, x: number, y: number, amount: number, radius: number, scentFaction: number = FACTION_PLAYER): void {
  const grid = world.grid;
  const minCx = clamp(Math.floor((x - radius) / grid.cell), 0, grid.cols - 1);
  const maxCx = clamp(Math.floor((x + radius) / grid.cell), 0, grid.cols - 1);
  const minCy = clamp(Math.floor((y - radius) / grid.cell), 0, grid.rows - 1);
  const maxCy = clamp(Math.floor((y + radius) / grid.cell), 0, grid.rows - 1);
  let cells = 0;
  for (let cy = minCy; cy <= maxCy; cy += 1) {
    const py = cy * grid.cell + grid.cell * HALF;
    for (let cx = minCx; cx <= maxCx; cx += 1) {
      const px = cx * grid.cell + grid.cell * HALF;
      const dx = px - x;
      const dy = py - y;
      if (dx * dx + dy * dy <= radius * radius) cells += 1;
    }
  }
  if (cells <= 0) return;
  const each = amount / cells;
  for (let cy = minCy; cy <= maxCy; cy += 1) {
    const py = cy * grid.cell + grid.cell * HALF;
    for (let cx = minCx; cx <= maxCx; cx += 1) {
      const px = cx * grid.cell + grid.cell * HALF;
      const dx = px - x;
      const dy = py - y;
      if (dx * dx + dy * dy <= radius * radius) {
        const idx = cy * grid.cols + cx;
        grid.foodAmt[idx] += each;
        addFoodIndex(grid, idx);
        splatFoodScent(grid, idx, each * 0.01, scentFaction);
      }
    }
  }
}

function addFoodToCell(world: World, idx: number, amount: number, scentFaction: number = FACTION_PLAYER): void {
  const grid = world.grid;
  grid.foodAmt[idx] += amount;
  addFoodIndex(grid, idx);
  splatFoodScent(grid, idx, amount * 0.01, scentFaction);
}

function addFoodNear(world: World, x: number, y: number, radius: number, amount: number, scentFaction: number = FACTION_PLAYER): void {
  for (let i = 0; i < amount; i += 1) {
    const angle = nextRand(world) * TAU;
    const dist = Math.sqrt(nextRand(world)) * radius;
    addFoodToCell(world, cellIndex(world.grid, x + Math.cos(angle) * dist, y + Math.sin(angle) * dist), 1, scentFaction);
  }
}

function foodAmountInRadius(world: World, x: number, y: number, radius: number): number {
  const grid = world.grid;
  const minCx = clamp(Math.floor((x - radius) / grid.cell), 0, grid.cols - 1);
  const maxCx = clamp(Math.floor((x + radius) / grid.cell), 0, grid.cols - 1);
  const minCy = clamp(Math.floor((y - radius) / grid.cell), 0, grid.rows - 1);
  const maxCy = clamp(Math.floor((y + radius) / grid.cell), 0, grid.rows - 1);
  let amount = 0;
  for (let cy = minCy; cy <= maxCy; cy += 1) {
    const py = (cy + HALF) * grid.cell;
    for (let cx = minCx; cx <= maxCx; cx += 1) {
      const px = (cx + HALF) * grid.cell;
      const dx = px - x;
      const dy = py - y;
      if (dx * dx + dy * dy <= radius * radius) amount += grid.foodAmt[cy * grid.cols + cx];
    }
  }
  return amount;
}

function removeFoodInRadius(world: World, x: number, y: number, amount: number, radius: number): number {
  const grid = world.grid;
  const total = foodAmountInRadius(world, x, y, radius);
  if (total <= 0 || amount <= 0) return 0;
  const remove = Math.min(total, amount);
  const fraction = remove / total;
  const minCx = clamp(Math.floor((x - radius) / grid.cell), 0, grid.cols - 1);
  const maxCx = clamp(Math.floor((x + radius) / grid.cell), 0, grid.cols - 1);
  const minCy = clamp(Math.floor((y - radius) / grid.cell), 0, grid.rows - 1);
  const maxCy = clamp(Math.floor((y + radius) / grid.cell), 0, grid.rows - 1);
  for (let cy = minCy; cy <= maxCy; cy += 1) {
    const py = (cy + HALF) * grid.cell;
    for (let cx = minCx; cx <= maxCx; cx += 1) {
      const px = (cx + HALF) * grid.cell;
      const dx = px - x;
      const dy = py - y;
      if (dx * dx + dy * dy <= radius * radius) {
        const idx = cy * grid.cols + cx;
        const next = grid.foodAmt[idx] * (1 - fraction);
        if (next > TUNING.sim.minTurnEpsilon) {
          grid.foodAmt[idx] = next;
        } else {
          grid.foodAmt[idx] = 0;
          removeFoodIndex(grid, idx);
        }
      }
    }
  }
  return remove;
}

function isPointClear(world: World, x: number, y: number, radius: number): boolean {
  if (x < radius || y < radius || x > world.width - radius || y > world.height - radius) return false;
  for (let i = 0; i < world.obstacles.length; i += 1) {
    const obstacle = world.obstacles[i];
    const dx = x - obstacle.x;
    const dy = y - obstacle.y;
    const rr = radius + obstacle.r + TUNING.sim.obstacleMargin;
    if (dx * dx + dy * dy < rr * rr) return false;
  }
  return true;
}

function addObstacle(world: World, x: number, y: number, r: number): void {
  world.obstacles.push({
    x: clamp(x, r, world.width - r),
    y: clamp(y, r, world.height - r),
    r,
    seed: Math.floor(nextRand(world) * 1000000),
  });
}

function blurMoisture(grid: EcologyGrid): void {
  const source = grid.moisture;
  const target = grid.diffuseFood;
  for (let pass = 0; pass < TUNING.terrain.moistureBlurPasses; pass += 1) {
    for (let y = 0; y < grid.rows; y += 1) {
      for (let x = 0; x < grid.cols; x += 1) {
        const idx = y * grid.cols + x;
        const center = source[idx];
        const left = x > 0 ? source[idx - 1] : center;
        const right = x < grid.cols - 1 ? source[idx + 1] : center;
        const up = y > 0 ? source[idx - grid.cols] : center;
        const down = y < grid.rows - 1 ? source[idx + grid.cols] : center;
        target[idx] = (center + left + right + up + down) * 0.2;
      }
    }
    source.set(target);
  }
  target.fill(0);
}

function normalizeMoisture(grid: EcologyGrid): void {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < grid.size; i += 1) {
    const value = grid.moisture[i];
    if (value < min) min = value;
    if (value > max) max = value;
  }
  const range = Math.max(TUNING.sim.minTurnEpsilon, max - min);
  for (let i = 0; i < grid.size; i += 1) {
    const moisture = clamp((grid.moisture[i] - min) / range, 0, 1);
    const wetness = moisture >= TUNING.terrain.moistureWetThreshold ? (moisture - TUNING.terrain.moistureWetThreshold) / (1 - TUNING.terrain.moistureWetThreshold) : 0;
    const dryness = moisture < TUNING.terrain.moistureWetThreshold ? (TUNING.terrain.moistureWetThreshold - moisture) / TUNING.terrain.moistureWetThreshold : 0;
    grid.moisture[i] = moisture;
    grid.moistureEvapExp[i] = 1 - wetness * TUNING.terrain.wetEvapBonus + dryness * (TUNING.terrain.dryEvapPenalty - 1);
  }
}

function refreshLocalEvaporation(grid: EcologyGrid): void {
  if (grid.evapFoodBase === TUNING.pher.evapFood && grid.evapHomeBase === TUNING.pher.evapHome && grid.evapDangerBase === TUNING.pher.evapDanger && grid.lureEvapBase === TUNING.tools.lureEvapMultiplier) return;
  grid.evapFoodBase = TUNING.pher.evapFood;
  grid.evapHomeBase = TUNING.pher.evapHome;
  grid.evapDangerBase = TUNING.pher.evapDanger;
  grid.lureEvapBase = TUNING.tools.lureEvapMultiplier;
  for (let i = 0; i < grid.size; i += 1) {
    const exp = grid.moistureEvapExp[i];
    grid.evapFoodLocal[i] = Math.pow(TUNING.pher.evapFood, exp);
    grid.evapLureLocal[i] = Math.pow(TUNING.pher.evapFood, exp * TUNING.tools.lureEvapMultiplier);
    grid.evapHomeLocal[i] = Math.pow(TUNING.pher.evapHome, exp);
    grid.evapDangerLocal[i] = Math.pow(TUNING.pher.evapDanger, exp);
  }
}

function generateMoisture(world: World): void {
  const grid = ecologyGrid(world.grid);
  const count = TUNING.terrain.moistureBlobsMin + Math.floor(nextRand(world) * (TUNING.terrain.moistureBlobsMax - TUNING.terrain.moistureBlobsMin + 1));
  const xs = new Float32Array(TUNING.terrain.moistureBlobsMax);
  const ys = new Float32Array(TUNING.terrain.moistureBlobsMax);
  const radii = new Float32Array(TUNING.terrain.moistureBlobsMax);
  const strengths = new Float32Array(TUNING.terrain.moistureBlobsMax);
  for (let i = 0; i < count; i += 1) {
    radii[i] = TUNING.terrain.moistureBlobRadiusMin + nextRand(world) * (TUNING.terrain.moistureBlobRadiusMax - TUNING.terrain.moistureBlobRadiusMin);
    if (i < TUNING.sim.foodClusters.length) {
      const cluster = TUNING.sim.foodClusters[i];
      const d = Math.min(cluster.dist, Math.min(world.width, world.height) * 0.42);
      const jitter = radii[i] * TUNING.terrain.moistureBlobClusterJitter;
      xs[i] = clamp(world.nestX + Math.cos(cluster.angle) * d + (nextRand(world) - HALF) * jitter, 0, world.width);
      ys[i] = clamp(world.nestY + Math.sin(cluster.angle) * d + (nextRand(world) - HALF) * jitter, 0, world.height);
    } else {
      xs[i] = nextRand(world) * world.width;
      ys[i] = nextRand(world) * world.height;
    }
    strengths[i] = HALF + nextRand(world) * HALF;
  }
  for (let gy = 0; gy < grid.rows; gy += 1) {
    const y = (gy + HALF) * grid.cell;
    for (let gx = 0; gx < grid.cols; gx += 1) {
      const x = (gx + HALF) * grid.cell;
      let value = TUNING.terrain.moistureBase + (hash01(gx * 73856093 ^ gy * 19349663 ^ TUNING.seed.value) - HALF) * TUNING.terrain.moistureNoise;
      for (let blob = 0; blob < count; blob += 1) {
        const dx = x - xs[blob];
        const dy = y - ys[blob];
        const r = radii[blob];
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < r) {
          const t = 1 - d / r;
          value += t * t * (3 - 2 * t) * strengths[blob];
        }
      }
      grid.moisture[gy * grid.cols + gx] = value;
    }
  }
  blurMoisture(grid);
  normalizeMoisture(grid);
  refreshLocalEvaporation(grid);
}

function placeRockyRegions(world: World): void {
  const count = TUNING.terrain.rockyRegionsMin + Math.floor(nextRand(world) * (TUNING.terrain.rockyRegionsMax - TUNING.terrain.rockyRegionsMin + 1));
  const clusterCount = TUNING.sim.foodClusters.length;
  const radiusLimit = Math.min(world.width, world.height) * 0.44;
  for (let region = 0; region < count; region += 1) {
    const cluster = TUNING.sim.foodClusters[(region * 2 + 2) % clusterCount];
    const angle = cluster.angle + (nextRand(world) - HALF) * TUNING.terrain.rockyRegionAngleJitter;
    const dist = Math.min(radiusLimit, TUNING.terrain.rockyRegionStartDistance + region * TUNING.terrain.rockyRegionDistanceStep);
    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);
    const tangentX = -dirY;
    const tangentY = dirX;
    const centerX = world.nestX + dirX * dist;
    const centerY = world.nestY + dirY * dist;
    const span = TUNING.terrain.rockyRegionSpanMin + nextRand(world) * (TUNING.terrain.rockyRegionSpanMax - TUNING.terrain.rockyRegionSpanMin);
    for (let offset = -span; offset <= span; offset += TUNING.terrain.rockyRegionSpacing) {
      if (Math.abs(offset) < TUNING.terrain.rockyRegionGapHalfWidth) continue;
      const radial = (nextRand(world) - HALF) * TUNING.terrain.rockyRegionRadialJitter;
      const r = TUNING.terrain.rockyBoulderMinRadius + nextRand(world) * (TUNING.terrain.rockyBoulderMaxRadius - TUNING.terrain.rockyBoulderMinRadius);
      addObstacle(world, centerX + tangentX * offset + dirX * radial, centerY + tangentY * offset + dirY * radial, r);
    }
    for (let i = 0; i < TUNING.terrain.rockyRegionExtraBoulders; i += 1) {
      const side = nextRand(world) < HALF ? -1 : 1;
      const offset = side * (TUNING.terrain.rockyRegionGapHalfWidth + nextRand(world) * Math.max(TUNING.terrain.rockyRegionSpacing, span - TUNING.terrain.rockyRegionGapHalfWidth));
      const radial = (nextRand(world) - HALF) * TUNING.terrain.rockyRegionRadialJitter * 2;
      const r = TUNING.terrain.rockyBoulderMinRadius + nextRand(world) * (TUNING.terrain.rockyBoulderMaxRadius - TUNING.terrain.rockyBoulderMinRadius);
      addObstacle(world, centerX + tangentX * offset + dirX * radial, centerY + tangentY * offset + dirY * radial, r);
    }
  }
}

function bushSpacingClear(world: EcologyWorld, x: number, y: number): boolean {
  const min2 = TUNING.ecology.bushMinSpacing * TUNING.ecology.bushMinSpacing;
  for (let i = 0; i < world.bushes.length; i += 1) {
    const dx = x - world.bushes[i].x;
    const dy = y - world.bushes[i].y;
    if (dx * dx + dy * dy < min2) return false;
  }
  return true;
}

function findBushCell(world: EcologyWorld, preferredX: number, preferredY: number): number {
  const grid = world.grid;
  let best = -1;
  let bestMoisture = -1;
  for (let attempt = 0; attempt < TUNING.ecology.bushPlacementAttempts; attempt += 1) {
    const angle = nextRand(world) * TAU;
    const dist = Math.sqrt(nextRand(world)) * TUNING.ecology.bushPreferredRadius;
    const gx = clamp(Math.floor((preferredX + Math.cos(angle) * dist) / grid.cell), 0, grid.cols - 1);
    const gy = clamp(Math.floor((preferredY + Math.sin(angle) * dist) / grid.cell), 0, grid.rows - 1);
    const idx = gy * grid.cols + gx;
    if (grid.moisture[idx] <= TUNING.ecology.bushMoistureMin) continue;
    const x = (gx + HALF) * grid.cell;
    const y = (gy + HALF) * grid.cell;
    const nx = x - world.nestX;
    const ny = y - world.nestY;
    if (nx * nx + ny * ny < TUNING.ecology.bushMinNestDist * TUNING.ecology.bushMinNestDist) continue;
    if (nx * nx + ny * ny > TUNING.ecology.bushMaxNestDist * TUNING.ecology.bushMaxNestDist) continue;
    if (!isPointClear(world, x, y, TUNING.ecology.bushClearRadius) || !bushSpacingClear(world, x, y)) continue;
    return idx;
  }
  for (let idx = 0; idx < grid.size; idx += 1) {
    const moisture = grid.moisture[idx];
    if (moisture <= bestMoisture || moisture <= TUNING.ecology.bushMoistureMin) continue;
    const gx = idx % grid.cols;
    const gy = Math.floor(idx / grid.cols);
    const x = (gx + HALF) * grid.cell;
    const y = (gy + HALF) * grid.cell;
    const nx = x - world.nestX;
    const ny = y - world.nestY;
    if (nx * nx + ny * ny < TUNING.ecology.bushMinNestDist * TUNING.ecology.bushMinNestDist) continue;
    if (nx * nx + ny * ny > TUNING.ecology.bushMaxNestDist * TUNING.ecology.bushMaxNestDist) continue;
    if (!isPointClear(world, x, y, TUNING.ecology.bushClearRadius) || !bushSpacingClear(world, x, y)) continue;
    best = idx;
    bestMoisture = moisture;
  }
  return best;
}

function placeBerryBushes(world: EcologyWorld): void {
  const count = TUNING.ecology.bushMin + Math.floor(nextRand(world) * (TUNING.ecology.bushMax - TUNING.ecology.bushMin + 1));
  for (let i = 0; i < count; i += 1) {
    const cluster = TUNING.sim.foodClusters[i % TUNING.sim.foodClusters.length];
    const d = Math.min(cluster.dist, Math.min(world.width, world.height) * 0.42);
    const preferredX = clamp(world.nestX + Math.cos(cluster.angle) * d, TUNING.ecology.bushClearRadius, world.width - TUNING.ecology.bushClearRadius);
    const preferredY = clamp(world.nestY + Math.sin(cluster.angle) * d, TUNING.ecology.bushClearRadius, world.height - TUNING.ecology.bushClearRadius);
    const idx = findBushCell(world, preferredX, preferredY);
    if (idx < 0) break;
    const gx = idx % world.grid.cols;
    const gy = Math.floor(idx / world.grid.cols);
    const stock = Math.min(TUNING.ecology.bushCap, Math.round(TUNING.ecology.bushInitialMin + nextRand(world) * (TUNING.ecology.bushInitialMax - TUNING.ecology.bushInitialMin)));
    addFoodNear(world, (gx + HALF) * world.grid.cell, (gy + HALF) * world.grid.cell, TUNING.ecology.bushFoodRadius, stock, FACTION_ALL);
    world.bushes.push({
      x: (gx + HALF) * world.grid.cell,
      y: (gy + HALF) * world.grid.cell,
      cell: idx,
      stock,
      regrowTimer: 0,
    });
  }
}

function nextCarcassDelay(world: World): number {
  return TUNING.ecology.carcassMinSec + nextRand(world) * (TUNING.ecology.carcassMaxSec - TUNING.ecology.carcassMinSec);
}

function scheduleNextCarcass(world: EcologyWorld): void {
  world.carcass.active = false;
  world.carcass.age = 0;
  world.carcass.amount = 0;
  world.carcass.spoiled = false;
  world.carcass.nextSpawn = nextCarcassDelay(world);
}

function spawnCarcass(world: EcologyWorld): void {
  const midX = (world.nestX + world.rival.nestX) * HALF;
  const midY = (world.nestY + world.rival.nestY) * HALF;
  const dx = world.rival.nestX - world.nestX;
  const dy = world.rival.nestY - world.nestY;
  const dist = Math.sqrt(Math.max(TUNING.sim.minTurnEpsilon, dx * dx + dy * dy));
  const dirX = dx / dist;
  const dirY = dy / dist;
  const tangentX = -dirY;
  const tangentY = dirX;
  let x = midX;
  let y = midY;
  for (let attempt = 0; attempt < TUNING.ecology.carcassPlacementAttempts; attempt += 1) {
    const along = (nextRand(world) - HALF) * TUNING.rival.midlineCarcassAlong;
    const across = (nextRand(world) - HALF) * TUNING.rival.midlineCarcassJitter;
    const cx = midX + dirX * along + tangentX * across;
    const cy = midY + dirY * along + tangentY * across;
    if (isPointClear(world, cx, cy, TUNING.ecology.carcassRadius)) {
      x = cx;
      y = cy;
      break;
    }
  }
  world.carcass.active = true;
  world.carcass.x = clamp(x, TUNING.ecology.carcassRadius, world.width - TUNING.ecology.carcassRadius);
  world.carcass.y = clamp(y, TUNING.ecology.carcassRadius, world.height - TUNING.ecology.carcassRadius);
  world.carcass.age = 0;
  world.carcass.amount = TUNING.ecology.carcassAmount;
  world.carcass.spoiled = false;
  world.carcass.toast = TUNING.ecology.carcassToastSec;
  world.carcass.nextSpawn = 0;
  depositFood(world, world.carcass.x, world.carcass.y, TUNING.ecology.carcassAmount, TUNING.ecology.carcassRadius, FACTION_ALL);
  recordDebugEvent(world, { type: "carcass_spawn", tick: world.stepCount, x: world.carcass.x, y: world.carcass.y, amount: world.carcass.amount });
  spawnParticle(world, world.carcass.x, world.carcass.y, ParticleKind.Spawn, TUNING.particles.spawn.count, TUNING.particles.spawn.speed, TUNING.particles.spawn.life, TUNING.particles.spawn.size);
}

function spawnCarcassAt(world: EcologyWorld, x: number, y: number): void {
  const r = TUNING.ecology.carcassRadius;
  world.carcass.active = true;
  world.carcass.x = clamp(x, r, world.width - r);
  world.carcass.y = clamp(y, r, world.height - r);
  world.carcass.age = 0;
  world.carcass.amount = TUNING.ecology.carcassAmount;
  world.carcass.spoiled = false;
  world.carcass.toast = TUNING.ecology.carcassToastSec;
  world.carcass.nextSpawn = 0;
  depositFood(world, world.carcass.x, world.carcass.y, TUNING.ecology.carcassAmount, TUNING.ecology.carcassRadius, FACTION_ALL);
  recordDebugEvent(world, { type: "carcass_spawn", tick: world.stepCount, x: world.carcass.x, y: world.carcass.y, amount: world.carcass.amount });
  spawnParticle(world, world.carcass.x, world.carcass.y, ParticleKind.Spawn, TUNING.particles.spawn.count * 3, TUNING.particles.spawn.speed, TUNING.particles.spawn.life, TUNING.particles.spawn.size);
}

function nextSpiderDelay(world: World): number {
  return TUNING.spider.spawnMinSec + nextRand(world) * (TUNING.spider.spawnMaxSec - TUNING.spider.spawnMinSec);
}

function scheduleNextSpider(world: World): void {
  world.spider.active = false;
  world.spider.age = 0;
  world.spider.eatTimer = 0;
  world.spider.nextSpawn = nextSpiderDelay(world);
  combatSpider(world).hp = TUNING.spider.hp;
}

function spawnSpider(world: World): void {
  const spider = world.spider;
  const pad = TUNING.spider.edgePadding;
  const edge = Math.floor(nextRand(world) * TUNING.spider.edgeCount);
  spider.active = true;
  spider.age = 0;
  spider.eatTimer = 0;
  combatSpider(world).hp = TUNING.spider.hp;
  spider.edge = edge;
  if (edge === TUNING.spider.edgeTop) {
    spider.x = nextRand(world) * world.width;
    spider.y = -pad;
    spider.heading = TUNING.sim.halfPi;
  } else if (edge === TUNING.spider.edgeRight) {
    spider.x = world.width + pad;
    spider.y = nextRand(world) * world.height;
    spider.heading = Math.PI;
  } else if (edge === TUNING.spider.edgeBottom) {
    spider.x = nextRand(world) * world.width;
    spider.y = world.height + pad;
    spider.heading = -TUNING.sim.halfPi;
  } else {
    spider.x = -pad;
    spider.y = nextRand(world) * world.height;
    spider.heading = 0;
  }
  spider.nextSpawn = 0;
  world.spiderToast = TUNING.spider.toastSec;
  recordDebugEvent(world, { type: "spider_spawn", tick: world.stepCount, x: spider.x, y: spider.y, hp: combatSpider(world).hp });
}

function spawnAnt(world: World, heading: number, dist: number, casteValue: number = chooseCaste(world), factionValue: number = FACTION_PLAYER, respectGameplayCap: boolean = true): void {
  const jitter = (nextRand(world) - HALF) * TUNING.sim.spawnRimJitter;
  const a = heading + jitter;
  const hx = nestX(world, factionValue);
  const hy = nestY(world, factionValue);
  const x = hx + Math.cos(a) * dist;
  const y = hy + Math.sin(a) * dist;
  const index = addAnt(world, x, y, a, casteValue, factionValue, respectGameplayCap);
  if (index >= 0) {
    spawnParticle(world, hx + Math.cos(a) * TUNING.nest.r, hy + Math.sin(a) * TUNING.nest.r, ParticleKind.Spawn, TUNING.particles.spawn.count, TUNING.particles.spawn.speed, TUNING.particles.spawn.life, TUNING.particles.spawn.size);
  }
}

function dropRivalFood(world: EcologyWorld): void {
  const angle = nextRand(world) * TAU;
  const dist = Math.sqrt(nextRand(world)) * TUNING.rival.dripSpread;
  const x = clamp(world.rival.nestX + Math.cos(angle) * dist, TUNING.rival.dripRadius, world.width - TUNING.rival.dripRadius);
  const y = clamp(world.rival.nestY + Math.sin(angle) * dist, TUNING.rival.dripRadius, world.height - TUNING.rival.dripRadius);
  depositFood(world, x, y, TUNING.rival.dripAmount, TUNING.rival.dripRadius, FACTION_RIVAL);
}

function placeInitialAnts(world: World, faction: number, count: number): void {
  const hx = nestX(world, faction);
  const hy = nestY(world, faction);
  for (let i = 0; i < count; i += 1) {
    const a = nextRand(world) * TAU;
    const r = Math.sqrt(nextRand(world)) * TUNING.sim.initialScatterRadius;
    const targetCluster = TUNING.sim.foodClusters[i % TUNING.sim.foodClusters.length];
    const headingBase = faction === FACTION_RIVAL ? angleTo(world.nestX - hx, world.nestY - hy) + (nextRand(world) - HALF) * TUNING.sim.initialHeadingJitter : targetCluster.angle + (nextRand(world) - HALF) * TUNING.sim.initialHeadingJitter;
    const heading = i / count < TUNING.sim.initialForagerRatio ? headingBase : a;
    const x = clamp(hx + Math.cos(a) * r, TUNING.grid.cell, world.width - TUNING.grid.cell);
    const y = clamp(hy + Math.sin(a) * r, TUNING.grid.cell, world.height - TUNING.grid.cell);
    addAnt(world, x, y, heading, chooseCaste(world, faction), faction);
  }
}

function placeInitialScene(world: World): void {
  const radiusLimit = Math.min(world.width, world.height) * 0.42;
  for (const spec of TUNING.sim.foodClusters) {
    const d = Math.min(spec.dist, radiusLimit);
    const x = clamp(world.nestX + Math.cos(spec.angle) * d, spec.radius, world.width - spec.radius);
    const y = clamp(world.nestY + Math.sin(spec.angle) * d, spec.radius, world.height - spec.radius);
    depositFood(world, x, y, spec.amount, spec.radius);
  }
  for (const spec of TUNING.sim.obstacles) {
    const d = Math.min(spec.dist, radiusLimit);
    addObstacle(world, world.nestX + Math.cos(spec.angle) * d, world.nestY + Math.sin(spec.angle) * d, spec.r);
  }
  placeRockyRegions(world);
  placeBerryBushes(ecologyWorld(world));
  placeInitialAnts(world, FACTION_PLAYER, TUNING.ants.start);
  dropRivalFood(ecologyWorld(world));
  placeInitialAnts(world, FACTION_RIVAL, TUNING.rival.start);
}

export function rebuildSpatial(world: World): void {
  const spatial = world.spatial;
  const factionMask = factionSpatial(spatial).factionMask;
  spatial.heads.fill(-1);
  spatial.wanderHeads.fill(-1);
  spatial.wanderCounts.fill(0);
  factionMask.fill(0);
  const ants = world.ants;
  const faction = factionAnts(ants).faction;
  for (let i = 0; i < ants.count; i += 1) {
    const cx = clamp(Math.floor(ants.x[i] / spatial.cell), 0, spatial.cols - 1);
    const cy = clamp(Math.floor(ants.y[i] / spatial.cell), 0, spatial.rows - 1);
    const bucket = cy * spatial.cols + cx;
    factionMask[bucket] |= faction[i] === FACTION_RIVAL ? 2 : 1;
    spatial.next[i] = spatial.heads[bucket];
    spatial.heads[bucket] = i;
    if (ants.mode[i] === AntMode.Wander) {
      spatial.wanderNext[i] = spatial.wanderHeads[bucket];
      spatial.wanderHeads[bucket] = i;
      spatial.wanderCounts[bucket] += 1;
    } else {
      spatial.wanderNext[i] = -1;
    }
  }
}

export function queryCircle(world: World, x: number, y: number, r: number, cb: QueryCallback, modeFilter: AntMode | -1 = -1): void {
  const spatial = world.spatial;
  const ants = world.ants;
  const r2 = r * r;
  const minCx = clamp(Math.floor((x - r) / spatial.cell), 0, spatial.cols - 1);
  const maxCx = clamp(Math.floor((x + r) / spatial.cell), 0, spatial.cols - 1);
  const minCy = clamp(Math.floor((y - r) / spatial.cell), 0, spatial.rows - 1);
  const maxCy = clamp(Math.floor((y + r) / spatial.cell), 0, spatial.rows - 1);
  const useWander = modeFilter === AntMode.Wander;
  for (let cy = minCy; cy <= maxCy; cy += 1) {
    for (let cx = minCx; cx <= maxCx; cx += 1) {
      const bucket = cy * spatial.cols + cx;
      if (useWander && spatial.wanderCounts[bucket] === 0) continue;
      let index = useWander ? spatial.wanderHeads[bucket] : spatial.heads[bucket];
      while (index >= 0) {
        const next = useWander ? spatial.wanderNext[index] : spatial.next[index];
        const dx = ants.x[index] - x;
        const dy = ants.y[index] - y;
        if (dx * dx + dy * dy <= r2 && cb(index) === false) return;
        index = next;
      }
    }
  }
}

function hasOpposingFactionNear(world: World, x: number, y: number, r: number, faction: number): boolean {
  const spatial = world.spatial;
  const mask = factionSpatial(spatial).factionMask;
  const otherBit = faction === FACTION_RIVAL ? 1 : 2;
  const minCx = clamp(Math.floor((x - r) / spatial.cell), 0, spatial.cols - 1);
  const maxCx = clamp(Math.floor((x + r) / spatial.cell), 0, spatial.cols - 1);
  const minCy = clamp(Math.floor((y - r) / spatial.cell), 0, spatial.rows - 1);
  const maxCy = clamp(Math.floor((y + r) / spatial.cell), 0, spatial.rows - 1);
  for (let cy = minCy; cy <= maxCy; cy += 1) {
    for (let cx = minCx; cx <= maxCx; cx += 1) {
      if ((mask[cy * spatial.cols + cx] & otherBit) !== 0) return true;
    }
  }
  return false;
}

export function createWorld(width: number = TUNING.sim.minWidth, height: number = TUNING.sim.minHeight, dpr: number = 1): World {
  const particles: FxParticle[] = [];
  for (let i = 0; i < TUNING.fx.maxParticles; i += 1) {
    particles.push({ x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, size: 1, kind: ParticleKind.Spawn, active: false });
  }
  const world: EcologyWorld = {
    width: TUNING.world.w,
    height: TUNING.world.h,
    dpr,
    time: 0,
    frame: 0,
    rng: TUNING.seed.value,
    ants: createAntStore(),
    spatial: createSpatialHash(),
    obstacles: [],
    corpses: [],
    particles,
    particleCursor: 0,
    spider: {
      active: false,
      x: 0,
      y: 0,
      heading: 0,
      age: 0,
      nextSpawn: 0,
      eatTimer: 0,
      edge: TUNING.spider.edgeTop,
      hp: TUNING.spider.hp,
    } as World["spider"] & { hp: number },
    spiderToast: 0,
    bushes: [],
    digCooldown: 0,
    carcassDropCooldown: 0,
    rainTimer: 0,
    rainDuration: 0,
    rainToast: 0,
    rainCheckTimer: 0,
    peakPopulation: 0,
    broodProgress: 0,
    broodWork: 0,
    queenHunger: 0,
    terminalTimer: 0,
    terminalStartAnts: 0,
    terminalCull: 0,
    gameOver: false,
    victory: false,
    victoryYear: 0,
    combatMarks: new Uint8Array(TUNING.caps.maxAnts),
    rival: {
      nestX: TUNING.world.w - TUNING.rival.cornerPaddingX,
      nestY: TUNING.world.h - TUNING.rival.cornerPaddingY,
      nestFood: TUNING.nest.startFood,
      broodProgress: 0,
      broodWork: 0,
      queenHunger: 0,
      terminalTimer: 0,
      terminalStartAnts: 0,
      terminalCull: 0,
      gameOver: false,
      dripTimer: 0,
      nestPulse: 0,
      nestPulseVel: 0,
      totalDelivered: 0,
      totalDeaths: 0,
      peakPopulation: 0,
    },
    carcass: {
      active: false,
      x: 0,
      y: 0,
      age: 0,
      amount: 0,
      nextSpawn: 0,
      spoiled: false,
      toast: 0,
    },
    grid: createGrid(),
    nestX: TUNING.world.w * HALF,
    nestY: TUNING.world.h * HALF,
    nestFood: TUNING.nest.startFood,
    totalDeaths: 0,
    totalDelivered: 0,
    spawnTimer: 0,
    stepCount: 0,
    deathWindowTimer: 0,
    deathWindowCount: 0,
    trauma: 0,
    nestPulse: 0,
    nestPulseVel: 0,
    cursorX: TUNING.input.cursorUnset,
    cursorY: TUNING.input.cursorUnset,
    cursorActive: false,
    activeTool: Tool.Food,
    paused: false,
    speed: 1,
    telemetry: createTelemetry(),
    lastFps: TUNING.time.stepHz,
    lastSimMs: 0,
    lastFieldMs: 0,
    lastTextureMs: 0,
    lastRenderMs: 0,
    hudFlash: 0,
    debug: false,
    camera: {
      x: 0,
      y: 0,
      scale: 1,
      viewW: Math.max(TUNING.sim.minWidth, width),
      viewH: Math.max(TUNING.sim.minHeight, height),
    },
  };
  initDebugState(world, seasonAt(world.time));
  generateMoisture(world);
  world.spider.nextSpawn = nextSpiderDelay(world);
  world.carcass.nextSpawn = nextCarcassDelay(world);
  placeInitialScene(world);
  world.rival.dripTimer = TUNING.rival.dripSec;
  world.peakPopulation = countFactionAnts(world, FACTION_PLAYER);
  world.rival.peakPopulation = countFactionAnts(world, FACTION_RIVAL);
  rebuildSpatial(world);
  pushTelemetry(world, TUNING.time.stepHz);
  return world;
}

export function resizeWorld(world: World, width: number, height: number, dpr: number): void {
  world.dpr = dpr;
  world.camera.viewW = Math.max(TUNING.sim.minWidth, width);
  world.camera.viewH = Math.max(TUNING.sim.minHeight, height);
}

function sampleField(world: World, field: Float32Array, x: number, y: number): number {
  const grid = world.grid;
  if (x < 0 || y < 0 || x >= world.width || y >= world.height) return 0;
  return field[cellIndex(grid, x, y)];
}

function obstaclePenalty(world: World, x: number, y: number): number {
  let penalty = 0;
  for (let i = 0; i < world.obstacles.length; i += 1) {
    const obstacle = world.obstacles[i];
    const dx = x - obstacle.x;
    const dy = y - obstacle.y;
    const repel = obstacle.r + TUNING.sim.obstacleSensorMargin;
    const d2 = dx * dx + dy * dy;
    if (d2 < repel * repel) {
      const d = Math.sqrt(Math.max(d2, TUNING.sim.minTurnEpsilon));
      penalty += ((repel - d) / repel) * TUNING.sim.obstacleSensorWeight;
    }
  }
  return penalty;
}

function hasFoodNear(world: World, index: number, radius: number): number {
  const grid = world.grid;
  const ants = world.ants;
  const ax = ants.x[index];
  const ay = ants.y[index];
  const r2 = radius * radius;
  const minCx = clamp(Math.floor((ax - radius) / grid.cell), 0, grid.cols - 1);
  const maxCx = clamp(Math.floor((ax + radius) / grid.cell), 0, grid.cols - 1);
  const minCy = clamp(Math.floor((ay - radius) / grid.cell), 0, grid.rows - 1);
  const maxCy = clamp(Math.floor((ay + radius) / grid.cell), 0, grid.rows - 1);
  let best = -1;
  let bestAmount = 0;
  for (let cy = minCy; cy <= maxCy; cy += 1) {
    const py = (cy + HALF) * grid.cell;
    for (let cx = minCx; cx <= maxCx; cx += 1) {
      const px = (cx + HALF) * grid.cell;
      const dx = px - ax;
      const dy = py - ay;
      if (dx * dx + dy * dy <= r2) {
        const idx = cy * grid.cols + cx;
        const amount = grid.foodAmt[idx];
        if (amount > bestAmount) {
          bestAmount = amount;
          best = idx;
        }
      }
    }
  }
  return bestAmount > TUNING.sim.foodSeekAmount ? best : -1;
}

function pickupFood(world: World, index: number): boolean {
  const idx = hasFoodNear(world, index, TUNING.food.pickupRadius);
  if (idx < 0) return false;
  const ants = world.ants;
  const grid = world.grid;
  grid.foodAmt[idx] -= 1;
  if (grid.foodAmt[idx] <= 0) {
    grid.foodAmt[idx] = 0;
    removeFoodIndex(grid, idx);
  }
  const previousMode = ants.mode[index];
  ants.carrying[index] = 1;
  ants.mode[index] = AntMode.Carry;
  ants.energy[index] = Math.min(TUNING.ant.energyMax, ants.energy[index] + TUNING.ant.snackOnPickup);
  ants.stepsSincePickup[index] = 0;
  ants.timerA[index] = 1;
  ants.timerB[index] = TUNING.sim.excitementSec;
  recordTraceModeTransition(world, index, previousMode, AntMode.Carry, "saw_food");
  recordTraceInteraction(world, index, {
    kind: "pickup",
    x: (idx % grid.cols + HALF) * grid.cell,
    y: (Math.floor(idx / grid.cols) + HALF) * grid.cell,
    cell: idx,
    amountAfter: grid.foodAmt[idx],
  });
  return true;
}

function steerAnt(world: World, index: number, dt: number, traceEnabled: boolean): void {
  const ants = world.ants;
  const faction = factionAnts(ants).faction[index];
  const mode = ants.mode[index];
  const ignoringFoodTrail = mode === AntMode.Seek && ants.timerA[index] > 0;
  const angle = (TUNING.sense.angleDeg * Math.PI) / 180;
  const dist = TUNING.sense.dist;
  const heading = ants.heading[index];
  const x = ants.x[index];
  const y = ants.y[index];
  const left = heading - angle;
  const right = heading + angle;
  const field = mode === AntMode.Carry ? pherHomeField(world.grid, faction) : pherFoodField(world.grid, faction);
  const weak = ignoringFoodTrail ? 0 : mode === AntMode.Wander ? TUNING.sim.sampleFoodWeak : 1;
  const sx = x + Math.cos(heading) * dist;
  const sy = y + Math.sin(heading) * dist;
  const lx = x + Math.cos(left) * dist;
  const ly = y + Math.sin(left) * dist;
  const rx = x + Math.cos(right) * dist;
  const ry = y + Math.sin(right) * dist;
  const straightField = sampleField(world, field, sx, sy);
  const straightDanger = sampleField(world, world.grid.pherDanger, sx, sy);
  const straightObstacle = obstaclePenalty(world, sx, sy);
  const leftField = sampleField(world, field, lx, ly);
  const leftDanger = sampleField(world, world.grid.pherDanger, lx, ly);
  const leftObstacle = obstaclePenalty(world, lx, ly);
  const rightField = sampleField(world, field, rx, ry);
  const rightDanger = sampleField(world, world.grid.pherDanger, rx, ry);
  const rightObstacle = obstaclePenalty(world, rx, ry);
  const straightScore = straightField * weak - TUNING.sense.dangerWeight * straightDanger - straightObstacle;
  const leftScore = leftField * weak - TUNING.sense.dangerWeight * leftDanger - leftObstacle;
  const rightScore = rightField * weak - TUNING.sense.dangerWeight * rightDanger - rightObstacle;
  if (traceEnabled) {
    recordTraceSensor(world, index, {
      field: mode === AntMode.Carry ? "home" : "food",
      center: straightField,
      left: leftField,
      right: rightField,
      threshold: TUNING.sim.sensorThreshold,
      centerAbove: straightField > TUNING.sim.sensorThreshold,
      leftAbove: leftField > TUNING.sim.sensorThreshold,
      rightAbove: rightField > TUNING.sim.sensorThreshold,
    });
  }
  let target = heading;
  if (leftScore > straightScore && leftScore >= rightScore) target = left;
  if (rightScore > straightScore && rightScore > leftScore) target = right;
  if (mode === AntMode.Carry) {
    const home = angleTo(nestX(world, faction) - x, nestY(world, faction) - y);
    target = target + angleDelta(target, home) * TUNING.sense.homeBlend;
  }
  target += (nextRand(world) - HALF) * TUNING.ant.wanderJitter;
  ants.heading[index] = turnToward(heading, target, TUNING.ant.turnRate * dt);
}

function avoid(world: World, index: number, dt: number): void {
  const ants = world.ants;
  const heading = ants.heading[index];
  const aheadX = ants.x[index] + Math.cos(heading) * TUNING.sim.obstacleAhead;
  const aheadY = ants.y[index] + Math.sin(heading) * TUNING.sim.obstacleAhead;
  for (let i = 0; i < world.obstacles.length; i += 1) {
    const obstacle = world.obstacles[i];
    const dx = aheadX - obstacle.x;
    const dy = aheadY - obstacle.y;
    const rr = obstacle.r + TUNING.sim.obstacleMargin;
    if (dx * dx + dy * dy < rr * rr) {
      const away = angleTo(aheadX - obstacle.x, aheadY - obstacle.y);
      const escape = away + (nextRand(world) - HALF) * TUNING.sim.obstacleEscapeJitter;
      ants.heading[index] = turnToward(ants.heading[index], escape, TUNING.sim.obstacleAvoidTurn * TUNING.ant.turnRate * dt);
    }
    const odx = ants.x[index] - obstacle.x;
    const ody = ants.y[index] - obstacle.y;
    const d2 = odx * odx + ody * ody;
    const min = obstacle.r + TUNING.sim.obstaclePushPadding;
    if (d2 < min * min) {
      const d = Math.sqrt(Math.max(d2, TUNING.sim.minTurnEpsilon));
      ants.x[index] = obstacle.x + (odx / d) * min;
      ants.y[index] = obstacle.y + (ody / d) * min;
      ants.heading[index] = angleTo(odx, ody) + (nextRand(world) - HALF) * TUNING.sim.obstacleEscapeJitter;
    }
  }
  if (ants.x[index] < TUNING.sim.edgeMargin) ants.heading[index] = ants.heading[index] + angleDelta(ants.heading[index], 0) * TUNING.sim.edgeBlend * dt;
  if (ants.x[index] > world.width - TUNING.sim.edgeMargin) ants.heading[index] = ants.heading[index] + angleDelta(ants.heading[index], Math.PI) * TUNING.sim.edgeBlend * dt;
  if (ants.y[index] < TUNING.sim.edgeMargin) ants.heading[index] = ants.heading[index] + angleDelta(ants.heading[index], TUNING.sim.halfPi) * TUNING.sim.edgeBlend * dt;
  if (ants.y[index] > world.height - TUNING.sim.edgeMargin) ants.heading[index] = ants.heading[index] + angleDelta(ants.heading[index], -TUNING.sim.halfPi) * TUNING.sim.edgeBlend * dt;
}

function respawnNonFiniteAnt(world: World, index: number): void {
  if (!warnedNonFiniteAnt) {
    console.warn("Ant contained non-finite position or heading; respawned at nest.");
    warnedNonFiniteAnt = true;
  }
  const ants = world.ants;
  const faction = factionAnts(ants).faction[index];
  recordDebugNanRespawn(world, index, faction);
  const heading = nextRand(world) * TAU;
  ants.x[index] = nestX(world, faction);
  ants.y[index] = nestY(world, faction);
  ants.heading[index] = heading;
  ants.energy[index] = energyMaxForCaste(casteAnts(ants).caste[index]);
  ants.carrying[index] = 0;
  ants.stepsSincePickup[index] = 0;
  ants.mode[index] = AntMode.Wander;
  ants.timerA[index] = 0;
  ants.timerB[index] = 0;
}

let recruitWorld: World;
let recruitCarrier = 0;
let recruitFaction: number = FACTION_PLAYER;

function recruitQuery(index: number): void {
  const world = recruitWorld;
  const ants = world.ants;
  if (ants.mode[index] !== AntMode.Wander) return;
  if (casteAnts(ants).caste[index] !== TUNING.caste.worker) return;
  if (factionAnts(ants).faction[index] !== recruitFaction) return;
  const spatial = world.spatial;
  const cx = clamp(Math.floor(ants.x[index] / spatial.cell), 0, spatial.cols - 1);
  const cy = clamp(Math.floor(ants.y[index] / spatial.cell), 0, spatial.rows - 1);
  const bucket = cy * spatial.cols + cx;
  if (spatial.wanderCounts[bucket] > 0) spatial.wanderCounts[bucket] -= 1;
  ants.heading[index] = ants.heading[recruitCarrier] + Math.PI + (nextRand(world) - HALF) * TUNING.sim.recruitJitter;
  ants.mode[index] = AntMode.Seek;
  ants.stepsSincePickup[index] = 0;
  ants.timerA[index] = 0;
  ants.timerB[index] = 0;
  recordTraceModeTransition(world, index, AntMode.Wander, AntMode.Seek, "recruited");
}

function recruitNearbyWanderers(world: World, carrierIndex: number): void {
  recruitWorld = world;
  recruitCarrier = carrierIndex;
  recruitFaction = factionAnts(world.ants).faction[carrierIndex];
  queryCircle(world, world.ants.x[carrierIndex], world.ants.y[carrierIndex], TUNING.sense.recruitRadius, recruitQuery, AntMode.Wander);
}

function fleeSpider(world: World, index: number, dt: number): void {
  const spider = world.spider;
  if (!spider.active) return;
  const ants = world.ants;
  const dx = ants.x[index] - spider.x;
  const dy = ants.y[index] - spider.y;
  const r2 = TUNING.spider.dangerRadius * TUNING.spider.dangerRadius;
  const d2 = dx * dx + dy * dy;
  if (d2 <= r2) {
    const target = d2 > TUNING.sim.minTurnEpsilon ? angleTo(dx, dy) : ants.heading[index] + Math.PI;
    ants.heading[index] = turnToward(ants.heading[index], target, TUNING.ant.turnRate * TUNING.spider.fleeTurnRateMul * dt);
  }
}

function refillNestCaste(world: World, index: number, maxEnergy: number): void {
  const ants = world.ants;
  const faction = factionAnts(ants).faction[index];
  const currentFood = nestFood(world, faction);
  if (ants.energy[index] >= maxEnergy * TUNING.caste.refillBelowRatio || currentFood < TUNING.ant.refillCost) return;
  const dx = ants.x[index] - nestX(world, faction);
  const dy = ants.y[index] - nestY(world, faction);
  if (dx * dx + dy * dy > TUNING.nest.r * TUNING.nest.r) return;
  setNestFood(world, faction, currentFood - TUNING.ant.refillCost);
  ants.energy[index] = maxEnergy;
}

let soldierDangerX = 0;
let soldierDangerY = 0;
let soldierDangerValue = 0;

function findSoldierDanger(world: World, index: number): boolean {
  const grid = world.grid;
  const ants = world.ants;
  const radius = TUNING.caste.soldierDangerSenseRadius;
  const stride = Math.max(1, TUNING.caste.soldierDangerScanStrideCells);
  const minCx = clamp(Math.floor((ants.x[index] - radius) / grid.cell), 0, grid.cols - 1);
  const maxCx = clamp(Math.floor((ants.x[index] + radius) / grid.cell), 0, grid.cols - 1);
  const minCy = clamp(Math.floor((ants.y[index] - radius) / grid.cell), 0, grid.rows - 1);
  const maxCy = clamp(Math.floor((ants.y[index] + radius) / grid.cell), 0, grid.rows - 1);
  const r2 = radius * radius;
  soldierDangerValue = 0;
  soldierDangerX = ants.x[index];
  soldierDangerY = ants.y[index];
  for (let cy = minCy; cy <= maxCy; cy += stride) {
    const y = (cy + HALF) * grid.cell;
    for (let cx = minCx; cx <= maxCx; cx += stride) {
      const x = (cx + HALF) * grid.cell;
      const dx = x - ants.x[index];
      const dy = y - ants.y[index];
      if (dx * dx + dy * dy > r2) continue;
      const value = grid.pherDanger[cy * grid.cols + cx];
      if (value > soldierDangerValue) {
        soldierDangerValue = value;
        soldierDangerX = x;
        soldierDangerY = y;
      }
    }
  }
  return soldierDangerValue > TUNING.caste.soldierDangerThreshold;
}

function moveCasteAnt(world: World, index: number, dt: number, speed: number): void {
  const ants = world.ants;
  const vx = Math.cos(ants.heading[index]) * speed * dt;
  const vy = Math.sin(ants.heading[index]) * speed * dt;
  ants.x[index] = clamp(ants.x[index] + vx, 0, world.width);
  ants.y[index] = clamp(ants.y[index] + vy, 0, world.height);
}

function updateSoldierAnt(world: World, index: number, dt: number, seasonSpeedMulValue: number): void {
  const ants = world.ants;
  const faction = factionAnts(ants).faction[index];
  const hx = nestX(world, faction);
  const hy = nestY(world, faction);
  const dx = ants.x[index] - hx;
  const dy = ants.y[index] - hy;
  const dist2 = dx * dx + dy * dy;
  let target = ants.heading[index] + (nextRand(world) - HALF) * TUNING.ant.wanderJitter;
  if (findSoldierDanger(world, index)) {
    target = angleTo(soldierDangerX - ants.x[index], soldierDangerY - ants.y[index]);
  } else if (dist2 > TUNING.caste.soldierPatrolRadius * TUNING.caste.soldierPatrolRadius) {
    target = angleTo(hx - ants.x[index], hy - ants.y[index]);
  } else if (dist2 < (TUNING.caste.soldierPatrolRadius - TUNING.caste.soldierPatrolSlack) * (TUNING.caste.soldierPatrolRadius - TUNING.caste.soldierPatrolSlack)) {
    target = angleTo(dy, -dx) + (nextRand(world) - HALF) * TUNING.ant.wanderJitter;
  }
  ants.heading[index] = turnToward(ants.heading[index], target, TUNING.ant.turnRate * dt);
  avoid(world, index, dt);
  refillNestCaste(world, index, energyMaxForCaste(TUNING.caste.soldier));
  moveCasteAnt(world, index, dt, TUNING.ant.speed * seasonSpeedMulValue * TUNING.caste.soldierSpeedMul);
}

function updateNurseAnt(world: World, index: number, dt: number, seasonSpeedMulValue: number): void {
  const ants = world.ants;
  const faction = factionAnts(ants).faction[index];
  const hx = nestX(world, faction);
  const hy = nestY(world, faction);
  const dx = ants.x[index] - hx;
  const dy = ants.y[index] - hy;
  const ring = TUNING.nest.r * TUNING.caste.nurseNestRadiusMul;
  let target = ants.heading[index] + (nextRand(world) - HALF) * TUNING.ant.wanderJitter * TUNING.caste.nurseSpeedMul;
  if (dx * dx + dy * dy > ring * ring) target = angleTo(hx - ants.x[index], hy - ants.y[index]);
  ants.heading[index] = turnToward(ants.heading[index], target, TUNING.ant.turnRate * dt);
  refillNestCaste(world, index, energyMaxForCaste(TUNING.caste.nurse));
  moveCasteAnt(world, index, dt, TUNING.ant.speed * seasonSpeedMulValue * TUNING.caste.nurseSpeedMul);
}

function updateAnts(world: World, dt: number): void {
  const ants = world.ants;
  const caste = casteAnts(ants).caste;
  const faction = factionAnts(ants).faction;
  const season = seasonAt(world.time);
  const energyDrainMul = seasonEnergyDrainMul(season);
  const speedMul = seasonSpeedMul(season);
  const traceEnabled = isDebugTraceEnabled(world);
  const traceBeyondRadius = getDebugTraceBeyondRadius(world);
  const traceBeyondRadius2 = traceBeyondRadius * traceBeyondRadius;
  for (let i = ants.count - 1; i >= 0; i -= 1) {
    if (!Number.isFinite(ants.x[i]) || !Number.isFinite(ants.y[i]) || !Number.isFinite(ants.heading[i])) {
      respawnNonFiniteAnt(world, i);
      continue;
    }
    if (traceBeyondRadius > 0) {
      const dx = ants.x[i] - nestX(world, faction[i]);
      const dy = ants.y[i] - nestY(world, faction[i]);
      updateDebugTraceBeyondArm(world, i, dx * dx + dy * dy > traceBeyondRadius2);
    }
    if (traceEnabled) recordTraceTickStart(world, i);
    const debugPrevX = ants.x[i];
    const debugPrevY = ants.y[i];
    const debugPrevMode = ants.mode[i];
    let debugDelivered = false;
    let debugPerceivedFood = false;
    ants.energy[i] -= TUNING.ant.drainPerSec * energyDrainMul * dt;
    if (ants.energy[i] <= 0) {
      const idx = cellIndex(world.grid, ants.x[i], ants.y[i]);
      pushCorpse(world, ants.x[i], ants.y[i]);
      splatPher(world.grid, world.grid.pherDanger, idx, TUNING.sim.deathDanger);
      spawnParticle(world, ants.x[i], ants.y[i], ParticleKind.Death, TUNING.particles.death.count, TUNING.particles.death.speed, TUNING.particles.death.life, TUNING.particles.death.size);
      recordTraceInteraction(world, i, { kind: "starvation", cause: "starvation", faction: faction[i] });
      recordAntDeath(world, faction[i], "starvation", i);
      recordTraceTickEnd(world, i);
      removeAnt(world, i);
      continue;
    }

    const timerABefore = ants.timerA[i];
    if (!ants.carrying[i] && ants.timerA[i] > 0) ants.timerA[i] = Math.max(0, ants.timerA[i] - dt);
    if (ants.timerB[i] > 0) ants.timerB[i] = Math.max(0, ants.timerB[i] - dt);
    if (timerABefore > 0 && ants.timerA[i] === 0) recordTraceModeTransition(world, i, ants.mode[i], ants.mode[i], "timer_expired");

    if (caste[i] === TUNING.caste.soldier) {
      ants.mode[i] = AntMode.Wander;
      ants.carrying[i] = 0;
      updateSoldierAnt(world, i, dt, speedMul);
      recordDebugAntTick(world, i, debugPrevX, debugPrevY, debugPrevMode, dt, false, false);
      if (traceEnabled) recordTraceTickEnd(world, i);
      continue;
    }
    if (caste[i] === TUNING.caste.nurse) {
      ants.mode[i] = AntMode.Wander;
      ants.carrying[i] = 0;
      updateNurseAnt(world, i, dt, speedMul);
      recordDebugAntTick(world, i, debugPrevX, debugPrevY, debugPrevMode, dt, false, false);
      if (traceEnabled) recordTraceTickEnd(world, i);
      continue;
    }

    if (ants.mode[i] === AntMode.Wander) {
      ants.stepsSincePickup[i] = 0;
      const foodField = pherFoodField(world.grid, faction[i]);
      const ahead = sampleField(world, foodField, ants.x[i] + Math.cos(ants.heading[i]) * TUNING.sense.dist, ants.y[i] + Math.sin(ants.heading[i]) * TUNING.sense.dist);
      const sawTrail = ahead > TUNING.sim.sensorThreshold;
      const sawFood = sawTrail ? false : hasFoodNear(world, i, TUNING.sense.dist) >= 0;
      if (sawTrail || sawFood) {
        debugPerceivedFood = true;
        ants.mode[i] = AntMode.Seek;
        recordTraceModeTransition(world, i, AntMode.Wander, AntMode.Seek, sawTrail ? "saw_trail" : "saw_food");
      }
    }
    if (ants.mode[i] === AntMode.Seek) {
      const pickedUp = pickupFood(world, i);
      if (pickedUp) debugPerceivedFood = true;
      if (!pickedUp) {
        const foodField = pherFoodField(world.grid, faction[i]);
        const aheadX = ants.x[i] + Math.cos(ants.heading[i]) * TUNING.sense.dist;
        const aheadY = ants.y[i] + Math.sin(ants.heading[i]) * TUNING.sense.dist;
        const trailAhead = sampleField(world, foodField, aheadX, aheadY);
        const trailHere = sampleField(world, foodField, ants.x[i], ants.y[i]);
        const seesTrail = trailAhead > TUNING.sim.sensorThreshold || trailHere > TUNING.sim.sensorThreshold;
        const seesFood = hasFoodNear(world, i, TUNING.sense.dist) >= 0;
        if (seesTrail || seesFood) debugPerceivedFood = true;
        if (ants.timerA[i] > 0) {
          ants.stepsSincePickup[i] = 0;
        } else if (seesTrail) {
          ants.stepsSincePickup[i] += dt;
          if (ants.stepsSincePickup[i] > TUNING.sim.staleTrailSec) {
            ants.stepsSincePickup[i] = 0;
            ants.timerA[i] = TUNING.sim.staleIgnoreSec;
            ants.timerB[i] = TUNING.sim.staleDangerSec;
          }
        } else {
          ants.stepsSincePickup[i] = 0;
        }
        if (ants.timerA[i] <= 0 && !seesTrail && !seesFood) {
          ants.mode[i] = AntMode.Wander;
          recordTraceModeTransition(world, i, AntMode.Seek, AntMode.Wander, "gave_up");
        }
      }
    }
    if (ants.mode[i] === AntMode.Carry) {
      const dx = ants.x[i] - nestX(world, faction[i]);
      const dy = ants.y[i] - nestY(world, faction[i]);
      if (dx * dx + dy * dy <= TUNING.nest.r * TUNING.nest.r) {
        addNestFood(world, faction[i], 1);
        debugDelivered = true;
        if (faction[i] === FACTION_RIVAL) ecologyWorld(world).rival.totalDelivered += 1;
        else world.totalDelivered += 1;
        const telemetry = world.telemetry;
        if (faction[i] === FACTION_PLAYER) {
          telemetry.deliveryTimes[telemetry.deliveryIndex] = world.time;
          telemetry.deliveries[telemetry.deliveryIndex] = 1;
          telemetry.deliveryIndex = (telemetry.deliveryIndex + 1) % TUNING.ui.chartSamples;
          telemetry.deliveryCount = Math.min(TUNING.ui.chartSamples, telemetry.deliveryCount + 1);
        }
        const currentFood = nestFood(world, faction[i]);
        if (currentFood >= TUNING.ant.refillCost) {
          setNestFood(world, faction[i], currentFood - TUNING.ant.refillCost);
          ants.energy[i] = TUNING.ant.energyMax;
        }
        ants.carrying[i] = 0;
        ants.mode[i] = AntMode.Wander;
        ants.stepsSincePickup[i] = 0;
        ants.timerA[i] = 0;
        ants.timerB[i] = 0;
        recordTraceModeTransition(world, i, AntMode.Carry, AntMode.Wander, "delivered");
        recordTraceInteraction(world, i, { kind: "delivery", faction: faction[i], nestFood: nestFood(world, faction[i]) });
        nestPulse(world, faction[i], faction[i] === FACTION_RIVAL ? TUNING.rival.nestPulseImpulse : TUNING.sim.nestPulseImpulse);
        if (faction[i] === FACTION_PLAYER) world.hudFlash = TUNING.render.statPopMs / TUNING.time.msPerSec;
        spawnDeliveryParticle(world, ants.x[i], ants.y[i], faction[i]);
      }
      if (ants.mode[i] === AntMode.Carry) recruitNearbyWanderers(world, i);
    }

    steerAnt(world, i, dt, traceEnabled);
    fleeSpider(world, i, dt);
    avoid(world, i, dt);

    const starving = ants.energy[i] < TUNING.ant.starveAt;
    let mul = ants.carrying[i] ? TUNING.ant.carryMul : 1;
    if (starving) mul *= TUNING.ant.starveMul;
    if (ants.carrying[i] && ants.timerB[i] > 0) mul *= TUNING.sim.excitementSpeedMul;
    const speed = TUNING.ant.speed * speedMul * mul;
    const vx = Math.cos(ants.heading[i]) * speed * dt;
    const vy = Math.sin(ants.heading[i]) * speed * dt;
    ants.x[i] = clamp(ants.x[i] + vx, 0, world.width);
    ants.y[i] = clamp(ants.y[i] + vy, 0, world.height);

    const idx = cellIndex(world.grid, ants.x[i], ants.y[i]);
    if (!ants.carrying[i] && ants.timerB[i] > 0) splatPher(world.grid, world.grid.pherDanger, idx, TUNING.sim.staleDangerDeposit);
    if (ants.carrying[i]) {
      splatPher(world.grid, pherFoodField(world.grid, faction[i]), idx, TUNING.pher.depositFood * ants.timerA[i]);
      if (ants.timerB[i] > 0) splatPher(world.grid, pherHomeField(world.grid, faction[i]), idx, TUNING.pher.depositHome * TUNING.sim.excitementHomeMul);
      ants.stepsSincePickup[i] += 1;
      ants.timerA[i] *= TUNING.pher.pickupDecay;
    } else {
      splatPher(world.grid, pherHomeField(world.grid, faction[i]), idx, TUNING.pher.depositHome);
    }
    recordDebugAntTick(world, i, debugPrevX, debugPrevY, debugPrevMode, dt, debugDelivered, debugPerceivedFood);
    if (traceEnabled) recordTraceTickEnd(world, i);
  }
}

let spiderTargetWorld: World;
let spiderSense2 = 0;
let spiderWeight = 0;
let spiderSumX = 0;
let spiderSumY = 0;
let spiderVictim = -1;
let soldierAttackWorld: World;
let soldierAttackDamage = 0;
let soldierAttackPlayerDamage = 0;
let soldierAttackRivalDamage = 0;
let combatWorld: EcologyWorld;
let combatSource = 0;
let combatDt = 0;

function spiderTrafficQuery(index: number): void {
  const ants = spiderTargetWorld.ants;
  const spider = spiderTargetWorld.spider;
  const dx = ants.x[index] - spider.x;
  const dy = ants.y[index] - spider.y;
  const d2 = dx * dx + dy * dy;
  if (d2 <= spiderSense2) {
    const w = 1 - d2 / spiderSense2;
    spiderSumX += ants.x[index] * w;
    spiderSumY += ants.y[index] * w;
    spiderWeight += w;
  }
}

function spiderVictimQuery(index: number): boolean {
  spiderVictim = index;
  return false;
}

function killSpiderVictim(world: World): void {
  const spider = world.spider;
  spiderVictim = -1;
  queryCircle(world, spider.x, spider.y, TUNING.spider.killRadius, spiderVictimQuery);
  if (spiderVictim < 0) return;
  const ants = world.ants;
  const index = spiderVictim;
  const victimFaction = factionAnts(ants).faction[index];
  const idx = cellIndex(world.grid, ants.x[index], ants.y[index]);
  pushCorpse(world, ants.x[index], ants.y[index]);
  splatPher(world.grid, world.grid.pherDanger, idx, TUNING.spider.killDanger);
  spawnParticle(world, ants.x[index], ants.y[index], ParticleKind.Death, TUNING.particles.death.count, TUNING.particles.death.speed, TUNING.particles.death.life, TUNING.particles.death.size);
  recordDebugEvent(world, { type: "spider_kill", tick: world.stepCount, x: ants.x[index], y: ants.y[index], victimId: getDebugState(world)?.ants.id[index] ?? 0, victimFaction });
  recordTraceInteraction(world, index, { kind: "spider", cause: "spider", faction: victimFaction, spiderX: spider.x, spiderY: spider.y });
  recordAntDeath(world, victimFaction, "spider", index);
  recordTraceTickEnd(world, index);
  spider.eatTimer = TUNING.spider.eatPauseSec;
  removeAnt(world, index);
}

function soldierAttackQuery(index: number): void {
  const ants = soldierAttackWorld.ants;
  if (casteAnts(ants).caste[index] !== TUNING.caste.soldier) return;
  const damage = TUNING.caste.soldierDps;
  soldierAttackDamage += damage;
  if (factionAnts(ants).faction[index] === FACTION_RIVAL) soldierAttackRivalDamage += damage;
  else soldierAttackPlayerDamage += damage;
}

function killSpiderBySoldiers(world: World, rewardFaction: number): void {
  const spider = world.spider;
  spawnParticle(world, spider.x, spider.y, ParticleKind.Death, TUNING.particles.spiderSquash.count, TUNING.particles.spiderSquash.speed, TUNING.particles.spiderSquash.life, TUNING.particles.spiderSquash.size);
  recordDebugEvent(world, { type: "spider_squashed", tick: world.stepCount, x: spider.x, y: spider.y, rewardFaction });
  world.trauma += TUNING.spider.squashTrauma;
  addNestFood(world, rewardFaction, TUNING.spider.trophyFood);
  world.spiderToast = 0;
  scheduleNextSpider(world);
}

function updateSoldierAttacks(world: World, dt: number): void {
  const spider = world.spider;
  if (!spider.active) return;
  soldierAttackWorld = world;
  soldierAttackDamage = 0;
  soldierAttackPlayerDamage = 0;
  soldierAttackRivalDamage = 0;
  queryCircle(world, spider.x, spider.y, TUNING.caste.soldierAttackRange, soldierAttackQuery);
  if (soldierAttackDamage <= 0) return;
  const combat = combatSpider(world);
  combat.hp -= soldierAttackDamage * dt;
  if (combat.hp <= 0) killSpiderBySoldiers(world, soldierAttackRivalDamage > soldierAttackPlayerDamage ? FACTION_RIVAL : FACTION_PLAYER);
}

function markCombatDeath(world: EcologyWorld, index: number): void {
  if (world.combatMarks[index] !== 0) return;
  world.combatMarks[index] = 1;
  splatPherRadius(world.grid, world.grid.pherDanger, world.ants.x[index], world.ants.y[index], TUNING.conflict.dangerRadius, TUNING.conflict.dangerDeposit);
}

function factionCombatQuery(other: number): boolean | void {
  const world = combatWorld;
  if (other <= combatSource || world.combatMarks[other] !== 0 || world.combatMarks[combatSource] !== 0) return;
  const ants = world.ants;
  const faction = factionAnts(ants).faction;
  const aFaction = faction[combatSource];
  const bFaction = faction[other];
  if (aFaction === bFaction) return;
  const caste = casteAnts(ants).caste;
  const aSoldier = caste[combatSource] === TUNING.caste.soldier;
  const bSoldier = caste[other] === TUNING.caste.soldier;
  if (aSoldier !== bSoldier) {
    if (nextRand(world) < combatDt / TUNING.conflict.soldierKillsWorkerSec) markCombatDeath(world, aSoldier ? other : combatSource);
    return;
  }
  if (nextRand(world) < combatDt / TUNING.conflict.peerKillSec) markCombatDeath(world, nextRand(world) < HALF ? combatSource : other);
}

function updateFactionCombat(world: EcologyWorld, dt: number): number {
  const ants = world.ants;
  world.combatMarks.fill(0, 0, ants.count);
  combatWorld = world;
  combatDt = dt;
  const faction = factionAnts(ants).faction;
  for (let i = 0; i < ants.count; i += 1) {
    if (world.combatMarks[i] !== 0) continue;
    if (!hasOpposingFactionNear(world, ants.x[i], ants.y[i], TUNING.conflict.range, faction[i])) continue;
    combatSource = i;
    queryCircle(world, ants.x[i], ants.y[i], TUNING.conflict.range, factionCombatQuery);
  }
  let removed = 0;
  for (let i = ants.count - 1; i >= 0; i -= 1) {
    if (world.combatMarks[i] === 0) continue;
    const antFaction = faction[i];
    pushCorpse(world, ants.x[i], ants.y[i]);
    spawnParticle(world, ants.x[i], ants.y[i], ParticleKind.Death, TUNING.particles.death.count, TUNING.particles.death.speed, TUNING.particles.death.life, TUNING.particles.death.size);
    recordTraceInteraction(world, i, { kind: "combat", cause: "combat", faction: antFaction });
    recordAntDeath(world, antFaction, "combat", i);
    recordTraceTickEnd(world, i);
    removeAnt(world, i);
    removed += 1;
  }
  return removed;
}

function updateSpider(world: World, dt: number): void {
  const spider = world.spider;
  if (!spider.active) {
    spider.nextSpawn -= dt;
    if (spider.nextSpawn <= 0) spawnSpider(world);
    return;
  }

  spider.age += dt;
  if (spider.age >= TUNING.spider.lifetimeSec) {
    scheduleNextSpider(world);
    return;
  }

  splatPher(world.grid, world.grid.pherDanger, cellIndex(world.grid, spider.x, spider.y), TUNING.spider.dangerDeposit);
  if (spider.eatTimer > 0) {
    spider.eatTimer = Math.max(0, spider.eatTimer - dt);
    return;
  }

  spiderTargetWorld = world;
  spiderSense2 = TUNING.spider.trafficSenseRadius * TUNING.spider.trafficSenseRadius;
  spiderWeight = 0;
  spiderSumX = 0;
  spiderSumY = 0;
  queryCircle(world, spider.x, spider.y, TUNING.spider.trafficSenseRadius, spiderTrafficQuery);

  let target = spiderWeight > 0 ? angleTo(spiderSumX / spiderWeight - spider.x, spiderSumY / spiderWeight - spider.y) : angleTo(world.nestX - spider.x, world.nestY - spider.y);
  if (spider.x < 0) target = 0;
  else if (spider.x > world.width) target = Math.PI;
  if (spider.y < 0) target = target + angleDelta(target, TUNING.sim.halfPi) * TUNING.spider.edgeInwardBlend;
  else if (spider.y > world.height) target = target + angleDelta(target, -TUNING.sim.halfPi) * TUNING.spider.edgeInwardBlend;
  target += (nextRand(world) - HALF) * TUNING.spider.wanderJitter;
  spider.heading = turnToward(spider.heading, target, TUNING.spider.turnRate * dt);
  spider.x = clamp(spider.x + Math.cos(spider.heading) * TUNING.spider.speed * dt, -TUNING.spider.edgePadding, world.width + TUNING.spider.edgePadding);
  spider.y = clamp(spider.y + Math.sin(spider.heading) * TUNING.spider.speed * dt, -TUNING.spider.edgePadding, world.height + TUNING.spider.edgePadding);
  killSpiderVictim(world);
}

function updateBerryBushes(world: EcologyWorld, dt: number): void {
  const regrowMul = seasonBushRegrowMul(seasonAt(world.time));
  for (let i = 0; i < world.bushes.length; i += 1) {
    const bush = world.bushes[i];
    const current = Math.min(TUNING.ecology.bushCap, foodAmountInRadius(world, bush.x, bush.y, TUNING.ecology.bushFoodRadius));
    bush.stock = regrowMul > 0 ? current : 0;
    if (regrowMul <= 0) {
      bush.regrowTimer = 0;
      continue;
    }
    if (current > 0) splatFoodScentRadius(world.grid, bush.x, bush.y, TUNING.ecology.bushScentRadius, TUNING.ecology.bushScentDeposit * dt, FACTION_ALL);
    if (current >= TUNING.ecology.bushCap) {
      bush.regrowTimer = 0;
      continue;
    }
    const regrowSec = TUNING.ecology.bushRegrowSec / regrowMul;
    bush.regrowTimer += dt;
    while (bush.regrowTimer >= regrowSec && bush.stock < TUNING.ecology.bushCap) {
      addFoodNear(world, bush.x, bush.y, TUNING.ecology.bushFoodRadius, 1, FACTION_ALL);
      bush.stock = Math.min(TUNING.ecology.bushCap, bush.stock + 1);
      bush.regrowTimer -= regrowSec;
    }
  }
}

function updateCarcass(world: EcologyWorld, dt: number): void {
  const carcass = world.carcass;
  carcass.toast = Math.max(0, carcass.toast - dt);
  if (!carcass.active) {
    const chanceMul = seasonCarcassChanceMul(seasonAt(world.time));
    if (chanceMul > 0) {
      carcass.nextSpawn -= dt * chanceMul;
      if (carcass.nextSpawn <= 0) spawnCarcass(world);
    }
    return;
  }
  carcass.age += dt;
  removeFoodInRadius(world, carcass.x, carcass.y, (TUNING.ecology.carcassAmount / TUNING.ecology.carcassDecaySec) * dt, TUNING.ecology.carcassRadius);
  carcass.amount = foodAmountInRadius(world, carcass.x, carcass.y, TUNING.ecology.carcassRadius);
  const wasSpoiled = carcass.spoiled;
  carcass.spoiled = carcass.age >= TUNING.ecology.carcassDecaySec - TUNING.ecology.carcassSpoilSec;
  if (!wasSpoiled && carcass.spoiled) recordDebugEvent(world, { type: "carcass_spoiled", tick: world.stepCount, x: carcass.x, y: carcass.y, amount: carcass.amount });
  if (carcass.amount > 0) splatFoodScentRadius(world.grid, carcass.x, carcass.y, TUNING.ecology.carcassScentRadius, TUNING.ecology.carcassScentDeposit * dt, FACTION_ALL);
  if (carcass.spoiled && carcass.amount > 0) splatPher(world.grid, world.grid.pherDanger, cellIndex(world.grid, carcass.x, carcass.y), TUNING.ecology.carcassDangerDeposit);
  if (carcass.age >= TUNING.ecology.carcassDecaySec || carcass.amount <= TUNING.sim.minTurnEpsilon) scheduleNextCarcass(world);
}

function updateToolCooldowns(world: EcologyWorld, dt: number): void {
  world.digCooldown = Math.max(0, world.digCooldown - dt);
  world.carcassDropCooldown = Math.max(0, world.carcassDropCooldown - dt);
}

function updateRivalPatron(world: EcologyWorld, dt: number): void {
  if (world.rival.gameOver || world.victory) return;
  world.rival.dripTimer -= dt;
  if (world.rival.dripTimer > 0) return;
  dropRivalFood(world);
  world.rival.dripTimer += TUNING.rival.dripSec;
}

function countFactionAnts(world: World, factionValue: number): number {
  const ants = world.ants;
  const faction = factionAnts(ants).faction;
  let count = 0;
  for (let i = 0; i < ants.count; i += 1) {
    if (faction[i] === factionValue) count += 1;
  }
  return count;
}

function removeOneFactionAnt(world: World, factionValue: number): boolean {
  const ants = world.ants;
  const faction = factionAnts(ants).faction;
  for (let i = ants.count - 1; i >= 0; i -= 1) {
    if (faction[i] !== factionValue) continue;
    pushCorpse(world, ants.x[i], ants.y[i]);
    recordAntDeath(world, factionValue, "terminal_cull", i);
    removeAnt(world, i);
    return true;
  }
  return false;
}

function beginTerminalCascade(world: EcologyWorld, factionValue: number): void {
  const startAnts = countFactionAnts(world, factionValue);
  if (factionValue === FACTION_RIVAL) {
    world.rival.terminalTimer = TUNING.sim.minTurnEpsilon;
    world.rival.terminalStartAnts = startAnts;
    world.rival.terminalCull = 0;
  } else {
    world.terminalTimer = TUNING.sim.minTurnEpsilon;
    world.terminalStartAnts = startAnts;
    world.terminalCull = 0;
  }
  recordDebugEvent(world, { type: "terminal_start", tick: world.stepCount, faction: factionValue });
}

function finishQueenCascade(world: EcologyWorld, factionValue: number): void {
  while (removeOneFactionAnt(world, factionValue)) {}
  const yearsSurvived = Math.floor(world.time / TUNING.seasons.yearSec);
  recordDebugEvent(world, { type: "terminal_end", tick: world.stepCount, faction: factionValue });
  recordDebugEvent(world, { type: "game_over", tick: world.stepCount, faction: factionValue, yearsSurvived });
  if (factionValue === FACTION_RIVAL) {
    world.rival.gameOver = true;
    world.victory = true;
    world.victoryYear = Math.floor(world.time / TUNING.seasons.yearSec) + 1;
    world.gameOver = true;
    recordDebugEvent(world, { type: "victory", tick: world.stepCount, faction: FACTION_PLAYER, yearsSurvived });
  } else {
    world.gameOver = true;
  }
}

function updateQueenState(world: EcologyWorld, dt: number, factionValue: number): void {
  if (world.gameOver && !(world.victory && factionValue === FACTION_RIVAL)) return;
  const rival = world.rival;
  let terminalTimer = factionValue === FACTION_RIVAL ? rival.terminalTimer : world.terminalTimer;
  let terminalStartAnts = factionValue === FACTION_RIVAL ? rival.terminalStartAnts : world.terminalStartAnts;
  let terminalCull = factionValue === FACTION_RIVAL ? rival.terminalCull : world.terminalCull;
  if (terminalTimer > 0) {
    terminalTimer += dt;
    const deathsPerSecond = terminalStartAnts / TUNING.queen.terminalCascadeSec;
    terminalCull += deathsPerSecond * dt;
    while (terminalCull >= 1) {
      if (!removeOneFactionAnt(world, factionValue)) break;
      terminalCull -= 1;
    }
    if (factionValue === FACTION_RIVAL) {
      rival.terminalTimer = terminalTimer;
      rival.terminalStartAnts = terminalStartAnts;
      rival.terminalCull = terminalCull;
    } else {
      world.terminalTimer = terminalTimer;
      world.terminalStartAnts = terminalStartAnts;
      world.terminalCull = terminalCull;
    }
    if (terminalTimer >= TUNING.queen.terminalCascadeSec || countFactionAnts(world, factionValue) <= 0) finishQueenCascade(world, factionValue);
    return;
  }
  if (nestFood(world, factionValue) <= TUNING.sim.minTurnEpsilon) {
    if (factionValue === FACTION_RIVAL) {
      rival.queenHunger += dt;
      if (rival.queenHunger >= TUNING.queen.starvationSec) beginTerminalCascade(world, factionValue);
    } else {
      world.queenHunger += dt;
      if (world.queenHunger >= TUNING.queen.starvationSec) beginTerminalCascade(world, factionValue);
    }
  } else if (factionValue === FACTION_RIVAL) {
    rival.queenHunger = 0;
  } else {
    world.queenHunger = 0;
  }
}

function countNurses(world: World, factionValue: number): number {
  const ants = world.ants;
  const caste = casteAnts(ants).caste;
  const faction = factionAnts(ants).faction;
  let nurses = 0;
  for (let i = 0; i < ants.count; i += 1) {
    if (faction[i] === factionValue && caste[i] === TUNING.caste.nurse) nurses += 1;
  }
  return nurses;
}

function updateBrood(world: EcologyWorld, dt: number, factionValue: number): void {
  const rival = world.rival;
  const terminalTimer = factionValue === FACTION_RIVAL ? rival.terminalTimer : world.terminalTimer;
  const gameOver = factionValue === FACTION_RIVAL ? rival.gameOver : world.gameOver;
  if (terminalTimer > 0 || gameOver || world.victory) return;
  const nurses = countNurses(world, factionValue);
  if (nurses <= 0) return;
  let broodProgress = factionValue === FACTION_RIVAL ? rival.broodProgress : world.broodProgress;
  let broodWork = factionValue === FACTION_RIVAL ? rival.broodWork : world.broodWork;
  let food = nestFood(world, factionValue);
  if (food < 1 && broodProgress < TUNING.caste.broodProgressRequired) return;
  broodWork += (nurses * dt) / TUNING.caste.nurseWorkSecPerUnit;
  while (broodWork >= 1 && food >= 1 && broodProgress < TUNING.caste.broodProgressRequired) {
    broodWork -= 1;
    food -= 1;
    broodProgress += 1;
  }
  setNestFood(world, factionValue, food);
  if (broodProgress >= TUNING.caste.broodProgressRequired && world.ants.count < Math.min(TUNING.ants.max, world.ants.capacity)) {
    broodProgress = 0;
    const heading = nextRand(world) * TAU;
    const casteValue = chooseCaste(world, factionValue);
    spawnAnt(world, heading, TUNING.nest.r, casteValue, factionValue);
    recordDebugEvent(world, { type: "brood_hatch", tick: world.stepCount, faction: factionValue, caste: casteValue });
  }
  if (factionValue === FACTION_RIVAL) {
    rival.broodProgress = broodProgress;
    rival.broodWork = broodWork;
  } else {
    world.broodProgress = broodProgress;
    world.broodWork = broodWork;
  }
}

function startRain(world: EcologyWorld): void {
  const duration = TUNING.seasons.rainMinSec + nextRand(world) * (TUNING.seasons.rainMaxSec - TUNING.seasons.rainMinSec);
  world.rainTimer = duration;
  world.rainDuration = duration;
  world.rainToast = TUNING.seasons.rainToastSec;
  recordDebugEvent(world, { type: "rain_start", tick: world.stepCount });
}

function updateSeasonEvents(world: EcologyWorld, dt: number): void {
  const playerCount = countFactionAnts(world, FACTION_PLAYER);
  const rivalCount = countFactionAnts(world, FACTION_RIVAL);
  const currentSeason = seasonAt(world.time);
  recordDebugSeasonChange(world, currentSeason, seasonLabel(currentSeason), Math.floor(world.time / TUNING.seasons.yearSec) + 1);
  if (playerCount > world.peakPopulation) world.peakPopulation = playerCount;
  if (rivalCount > world.rival.peakPopulation) world.rival.peakPopulation = rivalCount;
  world.rainToast = Math.max(0, world.rainToast - dt);
  if (world.rainTimer > 0) {
    world.rainTimer = Math.max(0, world.rainTimer - dt);
    if (world.rainTimer === 0) recordDebugEvent(world, { type: "rain_end", tick: world.stepCount });
    return;
  }
  world.rainDuration = 0;
  world.rainCheckTimer += dt;
  if (world.rainCheckTimer < TUNING.seasons.rainCheckSec) return;
  const elapsed = world.rainCheckTimer;
  world.rainCheckTimer = 0;
  const chance = seasonRainChancePerSec(currentSeason) * elapsed;
  if (chance > 0 && nextRand(world) < chance) startRain(world);
}

function evaporateActiveField(field: Float32Array, localEvap: Float32Array, indices: Int32Array, listed: Uint8Array, count: number): number {
  const cap = TUNING.pher.cap;
  const epsilon = TUNING.pher.activeEpsilon;
  let write = 0;
  for (let read = 0; read < count; read += 1) {
    const idx = indices[read];
    const v = field[idx] * localEvap[idx];
    if (v > epsilon) {
      field[idx] = v > cap ? cap : v;
      indices[write] = idx;
      write += 1;
    } else {
      field[idx] = 0;
      listed[idx] = 0;
    }
  }
  return write;
}

function evaporateLureField(grid: EcologyGrid): void {
  const epsilon = TUNING.pher.activeEpsilon;
  let write = 0;
  for (let read = 0; read < grid.activeLureCount; read += 1) {
    const idx = grid.activeLure[read];
    const normal = grid.lureAmt[idx] * grid.evapFoodLocal[idx];
    const fast = grid.lureAmt[idx] * grid.evapLureLocal[idx];
    const extraLoss = normal - fast;
    if (extraLoss > 0) grid.pherFood[idx] = Math.max(0, grid.pherFood[idx] - extraLoss);
    if (fast > epsilon) {
      grid.lureAmt[idx] = fast;
      grid.activeLure[write] = idx;
      write += 1;
    } else {
      grid.lureAmt[idx] = 0;
      grid.activeLureListed[idx] = 0;
    }
  }
  grid.activeLureCount = write;
}

function applyRainWash(grid: EcologyGrid): void {
  const mul = TUNING.seasons.rainPherFoodMul;
  const cap = TUNING.pher.cap;
  const epsilon = TUNING.pher.activeEpsilon;
  for (let faction = 0; faction < TUNING.factions.count; faction += 1) {
    const field = grid.pherFoodByFaction[faction];
    const indices = grid.activeFoodByFaction[faction];
    const listed = grid.activeFoodListedByFaction[faction];
    let foodWrite = 0;
    for (let read = 0; read < grid.activeFoodCountByFaction[faction]; read += 1) {
      const idx = indices[read];
      const v = field[idx] * mul;
      if (v > epsilon) {
        field[idx] = v > cap ? cap : v;
        indices[foodWrite] = idx;
        foodWrite += 1;
      } else {
        field[idx] = 0;
        listed[idx] = 0;
      }
    }
    grid.activeFoodCountByFaction[faction] = foodWrite;
  }
  grid.activeFoodCount = grid.activeFoodCountByFaction[FACTION_PLAYER];
  let lureWrite = 0;
  for (let read = 0; read < grid.activeLureCount; read += 1) {
    const idx = grid.activeLure[read];
    const v = grid.lureAmt[idx] * mul;
    if (v > epsilon) {
      grid.lureAmt[idx] = v > cap ? cap : v;
      grid.activeLure[lureWrite] = idx;
      lureWrite += 1;
    } else {
      grid.lureAmt[idx] = 0;
      grid.activeLureListed[idx] = 0;
    }
  }
  grid.activeLureCount = lureWrite;
}

function addDiffuseIndex(grid: Grid, idx: number): void {
  if (grid.diffuseListed[idx] === 0) {
    grid.diffuseListed[idx] = 1;
    grid.diffuseIndices[grid.diffuseCount] = idx;
    grid.diffuseCount += 1;
  }
}

function addDiffuseNeighborhood(grid: Grid, idx: number): void {
  addDiffuseIndex(grid, idx);
  const x = idx % grid.cols;
  const y = Math.floor(idx / grid.cols);
  if (x > 0) addDiffuseIndex(grid, idx - 1);
  if (x < grid.cols - 1) addDiffuseIndex(grid, idx + 1);
  if (y > 0) addDiffuseIndex(grid, idx - grid.cols);
  if (y < grid.rows - 1) addDiffuseIndex(grid, idx + grid.cols);
}

function diffuseActiveField(grid: Grid, source: Float32Array, target: Float32Array, indices: Int32Array, listed: Uint8Array, count: number): number {
  const cap = TUNING.pher.cap;
  const lerp = TUNING.pher.diffuseLerp;
  const epsilon = TUNING.pher.activeEpsilon;
  grid.diffuseCount = 0;
  for (let i = 0; i < count; i += 1) addDiffuseNeighborhood(grid, indices[i]);
  for (let i = 0; i < count; i += 1) listed[indices[i]] = 0;
  for (let i = 0; i < grid.diffuseCount; i += 1) {
    const idx = grid.diffuseIndices[i];
    const x = idx % grid.cols;
    const y = Math.floor(idx / grid.cols);
    const center = source[idx];
    const left = x > 0 ? source[idx - 1] : center;
    const right = x < grid.cols - 1 ? source[idx + 1] : center;
    const up = y > 0 ? source[idx - grid.cols] : center;
    const down = y < grid.rows - 1 ? source[idx + grid.cols] : center;
    const avg = (left + right + up + down) * 0.25;
    const v = center + (avg - center) * lerp;
    target[idx] = v > cap ? cap : v;
  }
  let write = 0;
  for (let i = 0; i < grid.diffuseCount; i += 1) {
    const idx = grid.diffuseIndices[i];
    const v = target[idx];
    if (v > epsilon) {
      source[idx] = v;
      listed[idx] = 1;
      indices[write] = idx;
      write += 1;
    } else {
      source[idx] = 0;
    }
    target[idx] = 0;
    grid.diffuseListed[idx] = 0;
  }
  return write;
}

function updateFields(world: World): void {
  const fieldStart = performance.now();
  const grid = ecologyGrid(world.grid);
  refreshLocalEvaporation(grid);
  for (let faction = 0; faction < TUNING.factions.count; faction += 1) {
    grid.activeFoodCountByFaction[faction] = evaporateActiveField(grid.pherFoodByFaction[faction], grid.evapFoodLocal, grid.activeFoodByFaction[faction], grid.activeFoodListedByFaction[faction], grid.activeFoodCountByFaction[faction]);
  }
  grid.activeFoodCount = grid.activeFoodCountByFaction[FACTION_PLAYER];
  evaporateLureField(grid);
  if (ecologyWorld(world).rainTimer > 0) applyRainWash(grid);
  for (let faction = 0; faction < TUNING.factions.count; faction += 1) {
    grid.activeHomeCountByFaction[faction] = evaporateActiveField(grid.pherHomeByFaction[faction], grid.evapHomeLocal, grid.activeHomeByFaction[faction], grid.activeHomeListedByFaction[faction], grid.activeHomeCountByFaction[faction]);
  }
  grid.activeHomeCount = grid.activeHomeCountByFaction[FACTION_PLAYER];
  grid.activeDangerCount = evaporateActiveField(grid.pherDanger, grid.evapDangerLocal, grid.activeDanger, grid.activeDangerListed, grid.activeDangerCount);
  if (world.stepCount % TUNING.pher.diffuseEvery === 0) {
    for (let faction = 0; faction < TUNING.factions.count; faction += 1) {
      grid.activeFoodCountByFaction[faction] = diffuseActiveField(grid, grid.pherFoodByFaction[faction], grid.diffuseFoodByFaction[faction], grid.activeFoodByFaction[faction], grid.activeFoodListedByFaction[faction], grid.activeFoodCountByFaction[faction]);
    }
    grid.activeFoodCount = grid.activeFoodCountByFaction[FACTION_PLAYER];
    grid.activeLureCount = diffuseActiveField(grid, grid.lureAmt, grid.diffuseFood, grid.activeLure, grid.activeLureListed, grid.activeLureCount);
    for (let faction = 0; faction < TUNING.factions.count; faction += 1) {
      grid.activeHomeCountByFaction[faction] = diffuseActiveField(grid, grid.pherHomeByFaction[faction], grid.diffuseHomeByFaction[faction], grid.activeHomeByFaction[faction], grid.activeHomeListedByFaction[faction], grid.activeHomeCountByFaction[faction]);
    }
    grid.activeHomeCount = grid.activeHomeCountByFaction[FACTION_PLAYER];
    grid.activeDangerCount = diffuseActiveField(grid, grid.pherDanger, grid.diffuseDanger, grid.activeDanger, grid.activeDangerListed, grid.activeDangerCount);
  }
  world.lastFieldMs = performance.now() - fieldStart;
}

function updateCorpses(world: World, dt: number): void {
  for (let i = world.corpses.length - 1; i >= 0; i -= 1) {
    const corpse = world.corpses[i];
    corpse.decay -= dt;
    if (corpse.decay <= 0) {
      const last = world.corpses.length - 1;
      if (i !== last) world.corpses[i] = world.corpses[last];
      world.corpses.pop();
      continue;
    }
    splatPher(world.grid, world.grid.pherDanger, cellIndex(world.grid, corpse.x, corpse.y), TUNING.pher.dangerFromCorpse);
  }
}

function updateParticles(world: World, dt: number): void {
  for (let i = 0; i < world.particles.length; i += 1) {
    const p = world.particles[i];
    if (!p.active) continue;
    p.life -= dt;
    if (p.life <= 0) {
      p.active = false;
      continue;
    }
    p.vy += TUNING.render.particleGravity * dt;
    p.vx *= TUNING.render.particleDrag;
    p.vy *= TUNING.render.particleDrag;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.x < -TUNING.render.particleCanvasPadding || p.y < -TUNING.render.particleCanvasPadding || p.x > world.width + TUNING.render.particleCanvasPadding || p.y > world.height + TUNING.render.particleCanvasPadding) {
      p.active = false;
    }
  }
}

function pushTelemetry(world: World, fps: number): void {
  const t = world.telemetry;
  let delivered = 0;
  for (let i = 0; i < t.deliveryCount; i += 1) {
    const idx = (t.deliveryIndex - i - 1 + TUNING.ui.chartSamples) % TUNING.ui.chartSamples;
    if (world.time - t.deliveryTimes[idx] <= TUNING.sim.deliveryWindowSec) delivered += t.deliveries[idx];
  }
  t.population[t.index] = countFactionAnts(world, FACTION_PLAYER);
  t.nestFood[t.index] = world.nestFood;
  t.deaths[t.index] = world.totalDeaths;
  t.foodPerMin[t.index] = delivered;
  t.fps[t.index] = fps;
  t.simMs[t.index] = world.lastSimMs;
  t.renderMs[t.index] = world.lastRenderMs;
  t.index = (t.index + 1) % TUNING.ui.chartSamples;
  t.count = Math.min(TUNING.ui.chartSamples, t.count + 1);
}

export function stepWorld(world: World, dt: number = STEP_DT, fps: number = TUNING.time.stepHz): void {
  if (world.paused) return;
  const ecology = ecologyWorld(world);
  if (ecology.gameOver) return;
  world.time += dt;
  world.stepCount += 1;
  world.spawnTimer += dt;
  world.frame += 1;
  world.deathWindowTimer += dt;
  world.spiderToast = Math.max(0, world.spiderToast - dt);
  updateSeasonEvents(ecology, dt);
  updateQueenState(ecology, dt, FACTION_PLAYER);
  if (!ecology.gameOver) updateQueenState(ecology, dt, FACTION_RIVAL);
  if (world.deathWindowTimer >= TUNING.sim.deathsBurstWindowSec) {
    if (world.deathWindowCount >= TUNING.sim.deathsBurstCount) world.trauma += TUNING.sim.traumaBurst;
    world.deathWindowCount = 0;
    world.deathWindowTimer = 0;
  }
  updateBrood(ecology, dt, FACTION_PLAYER);
  updateBrood(ecology, dt, FACTION_RIVAL);
  updateRivalPatron(ecology, dt);

  rebuildSpatial(world);
  updateSoldierAttacks(world, dt);
  if (updateFactionCombat(ecology, dt) > 0) rebuildSpatial(world);
  updateAnts(world, dt);
  rebuildSpatial(world);
  if (updateFactionCombat(ecology, dt) > 0) rebuildSpatial(world);
  updateSpider(world, dt);
  updateBerryBushes(ecology, dt);
  updateCarcass(ecology, dt);
  updateToolCooldowns(ecology, dt);
  updateFields(world);
  updateCorpses(world, dt);
  updateParticles(world, dt);

  world.nestPulseVel -= world.nestPulse * TUNING.sim.nestPulseSpring * dt;
  world.nestPulseVel *= TUNING.sim.nestPulseDamping;
  world.nestPulse += world.nestPulseVel * dt;
  if (world.nestPulse < 0) {
    world.nestPulse = 0;
    world.nestPulseVel = 0;
  }
  ecology.rival.nestPulseVel -= ecology.rival.nestPulse * TUNING.sim.nestPulseSpring * dt;
  ecology.rival.nestPulseVel *= TUNING.sim.nestPulseDamping;
  ecology.rival.nestPulse += ecology.rival.nestPulseVel * dt;
  if (ecology.rival.nestPulse < 0) {
    ecology.rival.nestPulse = 0;
    ecology.rival.nestPulseVel = 0;
  }
  world.hudFlash = Math.max(0, world.hudFlash - dt);
  world.lastFps = world.lastFps + (fps - world.lastFps) * TUNING.sim.fpsEma;
  world.telemetry.timer += dt;
  if (world.telemetry.timer >= 1 / TUNING.ui.telemetryHz) {
    world.telemetry.timer -= 1 / TUNING.ui.telemetryHz;
    pushTelemetry(world, world.lastFps);
  }
}

function squashSpider(world: World, x: number, y: number, radius: number): void {
  const spider = world.spider;
  if (!spider.active) return;
  const dx = spider.x - x;
  const dy = spider.y - y;
  const squashR = radius + TUNING.spider.squashRadius;
  if (dx * dx + dy * dy > squashR * squashR) return;
  spawnParticle(world, spider.x, spider.y, ParticleKind.Death, TUNING.particles.spiderSquash.count, TUNING.particles.spiderSquash.speed, TUNING.particles.spiderSquash.life, TUNING.particles.spiderSquash.size);
  recordDebugEvent(world, { type: "spider_squashed", tick: world.stepCount, x: spider.x, y: spider.y, rewardFaction: FACTION_PLAYER });
  world.trauma += TUNING.spider.squashTrauma;
  addNestFood(world, FACTION_PLAYER, TUNING.spider.trophyFood);
  world.spiderToast = 0;
  scheduleNextSpider(world);
}

let boulderWorld: World;
let boulderX = 0;
let boulderY = 0;
let boulderRadius = 0;

function boulderPushQuery(index: number): void {
  const ants = boulderWorld.ants;
  const dx = ants.x[index] - boulderX;
  const dy = ants.y[index] - boulderY;
  const d2 = dx * dx + dy * dy;
  if (d2 < boulderRadius * boulderRadius) {
    const d = Math.sqrt(Math.max(d2, TUNING.sim.minTurnEpsilon));
    ants.x[index] = boulderX + (dx / d) * (boulderRadius + TUNING.sim.obstaclePushPadding);
    ants.y[index] = boulderY + (dy / d) * (boulderRadius + TUNING.sim.obstaclePushPadding);
    ants.heading[index] = angleTo(dx, dy);
  }
}

function digBoulders(world: World, x: number, y: number): void {
  const ecology = ecologyWorld(world);
  if (ecology.digCooldown > 0) return;
  const radius = TUNING.tools.digRadius;
  let removed = 0;
  for (let i = world.obstacles.length - 1; i >= 0; i -= 1) {
    const obstacle = world.obstacles[i];
    const dx = obstacle.x - x;
    const dy = obstacle.y - y;
    const rr = radius + obstacle.r;
    if (dx * dx + dy * dy > rr * rr) continue;
    spawnParticle(world, obstacle.x, obstacle.y, ParticleKind.Dust, TUNING.particles.dust.count, TUNING.particles.dust.speed, TUNING.particles.dust.life, TUNING.particles.dust.size);
    const last = world.obstacles.length - 1;
    if (i !== last) world.obstacles[i] = world.obstacles[last];
    world.obstacles.pop();
    removed += 1;
  }
  if (removed > 0) {
    ecology.digCooldown = TUNING.tools.digCooldownSec;
    spawnParticle(world, x, y, ParticleKind.Dust, TUNING.particles.dust.count, TUNING.particles.dust.speed, TUNING.particles.dust.life, TUNING.particles.dust.size);
  }
}

export function dropCarcass(world: World, x: number, y: number): boolean {
  const ecology = ecologyWorld(world);
  if (ecology.gameOver) return false;
  if (ecology.carcassDropCooldown > 0) return false;
  if (seasonAt(world.time) === TUNING.seasons.winter) return false;
  spawnCarcassAt(ecology, clamp(x, 0, world.width), clamp(y, 0, world.height));
  ecology.carcassDropCooldown = TUNING.tools.carcassDropCooldownSec;
  return true;
}

export function getDigCooldown(world: World): number {
  return ecologyWorld(world).digCooldown;
}

export function getCarcassDropCooldown(world: World): number {
  return ecologyWorld(world).carcassDropCooldown;
}

export function getSeasonState(world: World): SeasonState {
  const ecology = ecologyWorld(world);
  const yearTime = world.time % TUNING.seasons.yearSec;
  const season = seasonAt(world.time);
  const seasonElapsed = yearTime - season * TUNING.seasons.seasonSec;
  const rain = ecology.rainDuration > 0 ? ecology.rainTimer / ecology.rainDuration : 0;
  return {
    season,
    label: seasonLabel(season),
    year: Math.floor(world.time / TUNING.seasons.yearSec) + 1,
    yearsSurvived: Math.floor(world.time / TUNING.seasons.yearSec),
    yearProgress: yearTime / TUNING.seasons.yearSec,
    seasonProgress: seasonElapsed / TUNING.seasons.seasonSec,
    timeToNext: TUNING.seasons.seasonSec - seasonElapsed,
    rain: clamp(rain, 0, 1),
    rainToast: ecology.rainToast,
    peakPopulation: ecology.peakPopulation,
    winterReserveHint: TUNING.seasons.winterReserveHint,
    isWinter: season === TUNING.seasons.winter,
  };
}

export function getColonyStatus(world: World): ColonyStatus {
  const ecology = ecologyWorld(world);
  const ants = world.ants;
  const caste = casteAnts(ants).caste;
  const faction = factionAnts(ants).faction;
  let workers = 0;
  let soldiers = 0;
  let nurses = 0;
  for (let i = 0; i < ants.count; i += 1) {
    if (faction[i] !== FACTION_PLAYER) continue;
    if (caste[i] === TUNING.caste.soldier) soldiers += 1;
    else if (caste[i] === TUNING.caste.nurse) nurses += 1;
    else workers += 1;
  }
  return {
    workers,
    soldiers,
    nurses,
    broodProgress: ecology.broodProgress,
    broodRequired: TUNING.caste.broodProgressRequired,
    queenHunger: ecology.queenHunger,
    queenHungerLimit: TUNING.queen.starvationSec,
    terminal: ecology.terminalTimer > 0,
    terminalProgress: ecology.terminalTimer > 0 ? clamp(ecology.terminalTimer / TUNING.queen.terminalCascadeSec, 0, 1) : 0,
    gameOver: ecology.gameOver,
    victory: ecology.victory,
    victoryYear: ecology.victoryYear,
    yearsSurvived: Math.floor(world.time / TUNING.seasons.yearSec),
    peakPopulation: ecology.peakPopulation,
    totalFoodGathered: world.totalDelivered,
    totalDeaths: world.totalDeaths,
  };
}

export function applyTool(world: World, tool: Tool, x: number, y: number): void {
  if (ecologyWorld(world).gameOver) return;
  const wx = clamp(x, 0, world.width);
  const wy = clamp(y, 0, world.height);
  if (tool === TOOL_LURE) {
    paintLure(world, wx, wy);
    return;
  }
  if (tool === TOOL_DIG) {
    digBoulders(world, wx, wy);
    return;
  }
  if (tool === Tool.Food) {
    depositFood(world, wx, wy, TUNING.food.clickAmount, TUNING.food.clickRadius);
    return;
  }
  if (tool === Tool.Wash) {
    const grid = world.grid;
    const r = TUNING.input.washRadius;
    const minCx = clamp(Math.floor((wx - r) / grid.cell), 0, grid.cols - 1);
    const maxCx = clamp(Math.floor((wx + r) / grid.cell), 0, grid.cols - 1);
    const minCy = clamp(Math.floor((wy - r) / grid.cell), 0, grid.rows - 1);
    const maxCy = clamp(Math.floor((wy + r) / grid.cell), 0, grid.rows - 1);
    for (let cy = minCy; cy <= maxCy; cy += 1) {
      const py = (cy + HALF) * grid.cell;
      for (let cx = minCx; cx <= maxCx; cx += 1) {
        const px = (cx + HALF) * grid.cell;
        const dx = px - wx;
        const dy = py - wy;
        if (dx * dx + dy * dy <= r * r) {
          const idx = cy * grid.cols + cx;
          const ecology = ecologyGrid(grid);
          for (let faction = 0; faction < TUNING.factions.count; faction += 1) {
            ecology.pherFoodByFaction[faction][idx] = 0;
            ecology.pherHomeByFaction[faction][idx] = 0;
          }
          grid.pherDanger[idx] = 0;
          ecology.lureAmt[idx] = 0;
          ecology.activeLureListed[idx] = 0;
        }
      }
    }
    spawnParticle(world, wx, wy, ParticleKind.Wash, TUNING.particles.wash.count, TUNING.particles.wash.speed, TUNING.particles.wash.life, TUNING.particles.wash.size);
    return;
  }
  const radius = TUNING.input.boulderMinRadius + nextRand(world) * (TUNING.input.boulderMaxRadius - TUNING.input.boulderMinRadius);
  const obstacle: Obstacle = { x: wx, y: wy, r: radius, seed: Math.floor(nextRand(world) * 1000000) };
  world.obstacles.push(obstacle);
  squashSpider(world, wx, wy, radius);
  boulderWorld = world;
  boulderX = wx;
  boulderY = wy;
  boulderRadius = radius;
  queryCircle(world, wx, wy, radius, boulderPushQuery);
  spawnParticle(world, wx, wy, ParticleKind.Dust, TUNING.particles.dust.count, TUNING.particles.dust.speed, TUNING.particles.dust.life, TUNING.particles.dust.size);
}

export function stressSpawn(world: World, count: number = TUNING.debug.stressSpawnAnts): void {
  if (ecologyWorld(world).gameOver) return;
  for (let i = 0; i < count; i += 1) {
    if (world.ants.count >= world.ants.capacity) return;
    spawnAnt(world, nextRand(world) * TAU, TUNING.nest.r, chooseCaste(world, FACTION_PLAYER), FACTION_PLAYER, false);
  }
  rebuildSpatial(world);
}

export function makeHudSnapshot(world: World): HudSnapshot {
  const t = world.telemetry;
  const pop: number[] = [];
  const food: number[] = [];
  for (let i = 0; i < t.count; i += 1) {
    const idx = (t.index - t.count + i + TUNING.ui.chartSamples) % TUNING.ui.chartSamples;
    pop.push(t.population[idx]);
    food.push(t.nestFood[idx]);
  }
  return {
    ants: countFactionAnts(world, FACTION_PLAYER),
    nestFood: world.nestFood,
    deaths: world.totalDeaths,
    foodPerMin: t.count > 0 ? t.foodPerMin[(t.index - 1 + TUNING.ui.chartSamples) % TUNING.ui.chartSamples] : 0,
    fps: world.lastFps,
    simMs: world.lastSimMs,
    fieldMs: world.lastFieldMs,
    textureMs: world.lastTextureMs,
    renderMs: world.lastRenderMs,
    paused: world.paused,
    speed: world.speed,
    tool: world.activeTool,
    debug: world.debug,
    camera: { ...world.camera },
    chart: {
      population: pop,
      nestFood: food,
      count: t.count,
    },
  };
}
