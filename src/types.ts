import type { Application, Container, Graphics, Particle as PixiParticle, ParticleContainer, Sprite, Texture } from "pixi.js";

export enum AntMode {
  Wander = 0,
  Seek = 1,
  Carry = 2,
}

export enum Tool {
  Food = "food",
  Boulder = "boulder",
  Wash = "wash",
}

export enum ParticleKind {
  Nest = 0,
  Dust = 1,
  Death = 2,
  Wash = 3,
  Spawn = 4,
}

export const AntFlag = {
  Alive: 1,
} as const;

export interface AntStore {
  capacity: number;
  count: number;
  freeCount: number;
  freeList: Int32Array;
  x: Float32Array;
  y: Float32Array;
  heading: Float32Array;
  energy: Float32Array;
  stepsSincePickup: Float32Array;
  timerA: Float32Array;
  timerB: Float32Array;
  mode: Uint8Array;
  carrying: Uint8Array;
  flags: Uint8Array;
}

export interface Obstacle {
  x: number;
  y: number;
  r: number;
  seed: number;
}

export interface Corpse {
  x: number;
  y: number;
  decay: number;
  maxDecay: number;
}

export interface FxParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  kind: ParticleKind;
  active: boolean;
}

export interface Spider {
  active: boolean;
  x: number;
  y: number;
  heading: number;
  age: number;
  nextSpawn: number;
  eatTimer: number;
  edge: number;
}

export interface Grid {
  cell: number;
  cols: number;
  rows: number;
  size: number;
  pherFood: Float32Array;
  pherHome: Float32Array;
  pherDanger: Float32Array;
  foodAmt: Float32Array;
  foodIndices: Int32Array;
  foodListed: Uint8Array;
  foodCount: number;
  activeFood: Int32Array;
  activeFoodListed: Uint8Array;
  activeFoodCount: number;
  activeHome: Int32Array;
  activeHomeListed: Uint8Array;
  activeHomeCount: number;
  activeDanger: Int32Array;
  activeDangerListed: Uint8Array;
  activeDangerCount: number;
  diffuseIndices: Int32Array;
  diffuseListed: Uint8Array;
  diffuseCount: number;
  diffuseFood: Float32Array;
  diffuseHome: Float32Array;
  diffuseDanger: Float32Array;
}

export interface SpatialHash {
  cell: number;
  cols: number;
  rows: number;
  heads: Int32Array;
  next: Int32Array;
  wanderHeads: Int32Array;
  wanderNext: Int32Array;
  wanderCounts: Uint16Array;
}

export interface Telemetry {
  population: Float32Array;
  nestFood: Float32Array;
  deaths: Float32Array;
  foodPerMin: Float32Array;
  fps: Float32Array;
  simMs: Float32Array;
  renderMs: Float32Array;
  index: number;
  count: number;
  timer: number;
  deliveries: Float32Array;
  deliveryTimes: Float32Array;
  deliveryIndex: number;
  deliveryCount: number;
}

export interface CameraState {
  x: number;
  y: number;
  scale: number;
  viewW: number;
  viewH: number;
}

export interface WarStatus {
  skirmishX: number;
  skirmishY: number;
  skirmishTimer: number;
  toastTimer: number;
  toastCooldown: number;
  firstClashSeen: boolean;
  playerLosses: number;
  rivalLosses: number;
}

export interface HudSnapshot {
  ants: number;
  nestFood: number;
  deaths: number;
  foodPerMin: number;
  fps: number;
  simMs: number;
  fieldMs: number;
  textureMs: number;
  renderMs: number;
  paused: boolean;
  speed: number;
  tool: Tool;
  debug: boolean;
  camera: CameraState;
  war: WarStatus;
  chart: {
    population: number[];
    nestFood: number[];
    count: number;
  };
}

export interface World {
  width: number;
  height: number;
  dpr: number;
  time: number;
  frame: number;
  rng: number;
  ants: AntStore;
  spatial: SpatialHash;
  obstacles: Obstacle[];
  corpses: Corpse[];
  particles: FxParticle[];
  particleCursor: number;
  spider: Spider;
  spiderToast: number;
  grid: Grid;
  nestX: number;
  nestY: number;
  nestFood: number;
  totalDeaths: number;
  totalDelivered: number;
  spawnTimer: number;
  stepCount: number;
  deathWindowTimer: number;
  deathWindowCount: number;
  trauma: number;
  nestPulse: number;
  nestPulseVel: number;
  cursorX: number;
  cursorY: number;
  cursorActive: boolean;
  activeTool: Tool;
  paused: boolean;
  speed: number;
  telemetry: Telemetry;
  lastFps: number;
  lastSimMs: number;
  lastFieldMs: number;
  lastTextureMs: number;
  lastRenderMs: number;
  hudFlash: number;
  debug: boolean;
  camera: CameraState;
  war: WarStatus;
}

export interface Renderer {
  app: Application;
  container: HTMLElement;
  worldContainer: Container;
  terrainLayer: Container;
  pheromoneLayer: Container;
  foodLayer: Container;
  obstacleLayer: Container;
  corpseLayer: Container;
  nestLayer: Container;
  antLayer: ParticleContainer<PixiParticle>;
  effectLayer: Container;
  overlayLayer: Container;
  terrainSprite: Sprite;
  pherSprite: Sprite;
  pherCanvas: HTMLCanvasElement;
  pherCtx: CanvasRenderingContext2D;
  pherImage: ImageData | null;
  pherTexture: Texture;
  antTextures: Texture[];
  antParticles: PixiParticle[];
  effectSprites: Sprite[];
  foodGraphics: Graphics;
  obstacleGraphics: Graphics;
  corpseGraphics: Graphics;
  nestGraphics: Graphics;
  spiderGraphics: Graphics;
  cursorGraphics: Graphics;
  minimapCanvas: HTMLCanvasElement;
  minimapCtx: CanvasRenderingContext2D;
  destroyed: boolean;
}
