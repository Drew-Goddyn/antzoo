import { Application, Assets, CanvasSource, Container, Graphics, Particle, ParticleContainer, Rectangle, Sprite, Texture } from "pixi.js";
import { ParticleKind, Renderer, Tool, World } from "./types";
import { TUNING } from "./tuning";

const HALF = TUNING.sim.randomTurnHalf;
const TAU = TUNING.sim.tau;

type RenderGrid = World["grid"] & {
  moisture?: Float32Array;
  pherFoodByFaction?: [Float32Array, Float32Array];
  pherHomeByFaction?: [Float32Array, Float32Array];
};

type RenderBush = {
  x: number;
  y: number;
  stock: number;
};

type RenderCarcass = {
  active: boolean;
  x: number;
  y: number;
  age: number;
  amount: number;
  spoiled: boolean;
  toast: number;
};

type RenderEcologyWorld = World & {
  bushes?: RenderBush[];
  carcass?: RenderCarcass;
  rainTimer?: number;
  rainDuration?: number;
  broodProgress?: number;
  terminalTimer?: number;
  victory?: boolean;
  rival?: {
    nestX: number;
    nestY: number;
    broodProgress: number;
    terminalTimer: number;
    nestPulse: number;
  };
  grid: RenderGrid;
};

type RenderAntStore = World["ants"] & {
  caste?: Uint8Array;
  faction?: Uint8Array;
};

function ecologyWorld(world: World): RenderEcologyWorld {
  return world as RenderEcologyWorld;
}

function makeCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);
  return canvas;
}

function hash01(value: number): number {
  let x = value | 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return (x >>> 0) / 4294967296;
}

function parseHex(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function hexNumber(hex: string): number {
  return Number.parseInt(hex.slice(1), 16);
}

function rgbNumber(rgb: [number, number, number]): number {
  return (rgb[0] << 16) + (rgb[1] << 8) + rgb[2];
}

function mixHex(a: string, b: string, t: number): number {
  const ca = parseHex(a);
  const cb = parseHex(b);
  const inv = 1 - t;
  return rgbNumber([
    Math.round(ca[0] * inv + cb[0] * t),
    Math.round(ca[1] * inv + cb[1] * t),
    Math.round(ca[2] * inv + cb[2] * t),
  ]);
}

function renderSeasonAt(time: number): number {
  return Math.floor((time % TUNING.seasons.yearSec) / TUNING.seasons.seasonSec);
}

function seasonTintHex(season: number): string {
  if (season === TUNING.seasons.spring) return TUNING.seasons.springTint;
  if (season === TUNING.seasons.summer) return TUNING.seasons.summerTint;
  if (season === TUNING.seasons.fall) return TUNING.seasons.fallTint;
  return TUNING.seasons.winterTint;
}

function rainActive(world: World): boolean {
  return (ecologyWorld(world).rainTimer ?? 0) > 0;
}

function renderAnts(ants: World["ants"]): RenderAntStore {
  return ants as RenderAntStore;
}

function createCanvasTexture(canvas: HTMLCanvasElement, label: string): Texture<CanvasSource> {
  return new Texture({
    label,
    source: new CanvasSource({
      resource: canvas,
      alphaMode: "premultiply-alpha-on-upload",
    }),
  });
}

function cacheAsset(key: string, value: Texture): void {
  if (!Assets.cache.has(key)) Assets.cache.set(key, value);
}

function drawTerrainCanvas(world: World): HTMLCanvasElement {
  const canvas = makeCanvas(world.width, world.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const ecology = ecologyWorld(world);
  const cx = world.width * HALF;
  const cy = world.height * HALF;
  const radius = Math.max(world.width, world.height) * TUNING.render.backgroundVignetteOuter;
  const grad = ctx.createRadialGradient(cx, cy, Math.max(1, Math.min(world.width, world.height) * TUNING.render.backgroundVignetteInner), cx, cy, radius);
  grad.addColorStop(0, TUNING.colors.soilWarm);
  grad.addColorStop(1, TUNING.colors.soilDark);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, world.width, world.height);
  if (ecology.grid.moisture) {
    const moistureCanvas = makeCanvas(ecology.grid.cols, ecology.grid.rows);
    const moistureCtx = moistureCanvas.getContext("2d");
    if (moistureCtx) {
      const image = moistureCtx.createImageData(ecology.grid.cols, ecology.grid.rows);
      const wet = parseHex(TUNING.colors.soilWet);
      const dry = parseHex(TUNING.colors.soilDry);
      for (let i = 0; i < ecology.grid.size; i += 1) {
        const m = ecology.grid.moisture[i];
        const inv = 1 - m;
        const p = i * 4;
        image.data[p] = dry[0] * inv + wet[0] * m;
        image.data[p + 1] = dry[1] * inv + wet[1] * m;
        image.data[p + 2] = dry[2] * inv + wet[2] * m;
        image.data[p + 3] = Math.round(TUNING.render.moistureTintAlpha * 255 * (HALF + Math.abs(m - HALF)));
      }
      moistureCtx.putImageData(image, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(moistureCanvas, 0, 0, world.width, world.height);
    }
  }
  const count = Math.floor((world.width * world.height * TUNING.render.backgroundPebblesPerMegaPixel) / 1000000);
  for (let i = 0; i < count; i += 1) {
    const r = hash01(i * 17 + TUNING.seed.value);
    const x = hash01(i * 29 + TUNING.seed.value) * world.width;
    const y = hash01(i * 43 + TUNING.seed.value) * world.height;
    const size = TUNING.render.backgroundPebbleMin + hash01(i * 59) * TUNING.render.backgroundPebbleRange;
    ctx.globalAlpha = 0.08 + r * 0.08;
    ctx.fillStyle = TUNING.colors.pebble;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  return canvas;
}

function drawAntFrame(ctx: CanvasRenderingContext2D, frameX: number, frameY: number, starving: boolean, carrying: boolean): void {
  const frameW = TUNING.render.antSpriteW;
  const frameH = TUNING.render.antSpriteH;
  const frame = frameX / frameW;
  ctx.save();
  ctx.translate(frameX + frameW * HALF, frameY + frameH * HALF);
  ctx.fillStyle = starving ? TUNING.colors.starving : TUNING.colors.antDark;
  ctx.strokeStyle = TUNING.colors.antDark;
  ctx.lineWidth = 0.7;
  for (let side = -1; side <= 1; side += 2) {
    const phase = frame === 1 ? -side : frame === 2 ? side : 0;
    const rearReach = side * (3.4 + phase * 0.7);
    const midReach = side * (4.2 - phase * 0.6);
    const foreReach = side * (3.2 + phase * 0.5);
    ctx.beginPath();
    ctx.moveTo(-3, side * 2);
    ctx.lineTo(-6.2 - phase, rearReach);
    ctx.moveTo(1, side * 2);
    ctx.lineTo(3.2 + phase, midReach);
    ctx.moveTo(4, side * 1.5);
    ctx.lineTo(7 + phase, foreReach);
    ctx.stroke();
  }
  ctx.fillStyle = starving ? TUNING.colors.starving : TUNING.colors.ant;
  ctx.beginPath();
  ctx.ellipse(-5, 0, 4.5, 3.2, 0, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, 0, 3.7, 2.8, 0, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(5.2, 0, 3.5, 2.5, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = TUNING.colors.antDark;
  ctx.fillRect(7.2, -0.7, 1.4, 1.4);
  if (carrying) {
    ctx.fillStyle = TUNING.colors.food;
    ctx.fillRect(TUNING.render.crumbOffset - 1, -TUNING.render.crumbSize * HALF, TUNING.render.crumbSize, TUNING.render.crumbSize);
  }
  ctx.restore();
}

function createAntTextures(): Texture[] {
  const scale = TUNING.render.antSpriteScale;
  const frameCount = 3;
  const variants = 4;
  const frameW = TUNING.render.antSpriteW * scale;
  const frameH = TUNING.render.antSpriteH * scale;
  const canvas = makeCanvas(frameW * frameCount * variants, frameH);
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.scale(scale, scale);
    for (let variant = 0; variant < variants; variant += 1) {
      const starving = variant === 1 || variant === 3;
      const carrying = variant >= 2;
      for (let frame = 0; frame < frameCount; frame += 1) {
        drawAntFrame(ctx, (variant * frameCount + frame) * TUNING.render.antSpriteW, 0, starving, carrying);
      }
    }
  }
  const atlas = createCanvasTexture(canvas, "antzoo-ant-atlas");
  cacheAsset("antzoo.antAtlas", atlas);
  const textures: Texture[] = [];
  for (let i = 0; i < frameCount * variants; i += 1) {
    textures.push(new Texture({ source: atlas.source, frame: new Rectangle(i * frameW, 0, frameW, frameH), defaultAnchor: { x: HALF, y: HALF } }));
  }
  return textures;
}

function createDotTexture(radius: number, color: string): Texture {
  const size = Math.ceil(radius * 2 + 2);
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(size * HALF, size * HALF, radius, 0, TAU);
    ctx.fill();
  }
  const texture = createCanvasTexture(canvas, `antzoo-dot-${radius}-${color}`);
  cacheAsset(`antzoo.dot.${radius}.${color}`, texture);
  return texture;
}

export async function createRenderer(container: HTMLElement, minimapCanvas: HTMLCanvasElement, world: World): Promise<Renderer> {
  const app = new Application();
  await app.init({ resizeTo: container, antialias: true, background: "#0d0a07", autoStart: false });
  app.canvas.style.display = "block";
  app.canvas.style.width = "100%";
  app.canvas.style.height = "100%";

  const worldContainer = new Container();
  const terrainLayer = new Container();
  const pheromoneLayer = new Container();
  const foodLayer = new Container();
  const obstacleLayer = new Container();
  const corpseLayer = new Container();
  const nestLayer = new Container();
  const effectLayer = new Container();
  const overlayLayer = new Container();

  const terrainTexture = createCanvasTexture(drawTerrainCanvas(world), "antzoo-terrain");
  cacheAsset("antzoo.terrain", terrainTexture);
  const terrainSprite = new Sprite(terrainTexture);
  terrainSprite.width = world.width;
  terrainSprite.height = world.height;
  terrainLayer.addChild(terrainSprite);

  const pherCanvas = makeCanvas(world.grid.cols, world.grid.rows);
  const pherCtx = pherCanvas.getContext("2d", { willReadFrequently: true });
  if (!pherCtx) throw new Error("Could not create pheromone canvas context.");
  const pherTexture = createCanvasTexture(pherCanvas, "antzoo-pheromones");
  cacheAsset("antzoo.pheromones", pherTexture);
  const pherSprite = new Sprite(pherTexture);
  pherSprite.width = world.width;
  pherSprite.height = world.height;
  pherSprite.blendMode = "add";
  pherSprite.alpha = TUNING.render.pherAlpha;
  pheromoneLayer.addChild(pherSprite);

  const antTextures = createAntTextures();
  const antLayer = new ParticleContainer<Particle>({
    texture: antTextures[0],
    dynamicProperties: { position: true, rotation: true, uvs: true, color: true },
  });
  const antParticles: Particle[] = [];
  for (let i = 0; i < TUNING.caps.maxAnts; i += 1) {
    const particle = new Particle({ texture: antTextures[0], anchorX: HALF, anchorY: HALF, alpha: 0, x: TUNING.input.cursorUnset, y: TUNING.input.cursorUnset });
    particle.scaleX = TUNING.render.antDrawW / antTextures[0].width;
    particle.scaleY = TUNING.render.antDrawH / antTextures[0].height;
    antParticles.push(particle);
  }
  antLayer.addParticle(...antParticles);

  const foodGraphics = new Graphics();
  const obstacleGraphics = new Graphics();
  const corpseGraphics = new Graphics();
  const nestGraphics = new Graphics();
  const spiderGraphics = new Graphics();
  const cursorGraphics = new Graphics();
  foodLayer.addChild(foodGraphics);
  obstacleLayer.addChild(obstacleGraphics);
  corpseLayer.addChild(corpseGraphics);
  nestLayer.addChild(nestGraphics, spiderGraphics);
  overlayLayer.addChild(cursorGraphics);

  const effectTexture = createDotTexture(4, "#ffffff");
  const effectSprites: Sprite[] = [];
  for (let i = 0; i < TUNING.fx.maxParticles; i += 1) {
    const sprite = new Sprite(effectTexture);
    sprite.anchor.set(HALF);
    sprite.visible = false;
    effectSprites.push(sprite);
    effectLayer.addChild(sprite);
  }

  worldContainer.addChild(terrainLayer, pheromoneLayer, foodLayer, obstacleLayer, corpseLayer, nestLayer, antLayer, effectLayer, overlayLayer);
  app.stage.addChild(worldContainer);

  minimapCanvas.width = TUNING.minimap.w;
  minimapCanvas.height = TUNING.minimap.h;
  const minimapCtx = minimapCanvas.getContext("2d");
  if (!minimapCtx) throw new Error("Could not create minimap context.");

  return {
    app,
    container,
    worldContainer,
    terrainLayer,
    pheromoneLayer,
    foodLayer,
    obstacleLayer,
    corpseLayer,
    nestLayer,
    antLayer,
    effectLayer,
    overlayLayer,
    terrainSprite,
    pherSprite,
    pherCanvas,
    pherCtx,
    pherImage: null,
    pherTexture,
    antTextures,
    antParticles,
    effectSprites,
    foodGraphics,
    obstacleGraphics,
    corpseGraphics,
    nestGraphics,
    spiderGraphics,
    cursorGraphics,
    minimapCanvas,
    minimapCtx,
    destroyed: false,
  };
}

export function destroyRenderer(renderer: Renderer): void {
  if (renderer.destroyed) return;
  renderer.destroyed = true;
  Assets.cache.remove("antzoo.terrain");
  Assets.cache.remove("antzoo.pheromones");
  Assets.cache.remove("antzoo.antAtlas");
  Assets.cache.remove("antzoo.dot.4.#ffffff");
  renderer.app.destroy(true, { children: true, texture: true, textureSource: true });
}

function updatePheromoneImage(renderer: Renderer, world: World): void {
  const grid = ecologyWorld(world).grid;
  if (renderer.pherCanvas.width !== grid.cols || renderer.pherCanvas.height !== grid.rows || !renderer.pherImage) {
    renderer.pherCanvas.width = grid.cols;
    renderer.pherCanvas.height = grid.rows;
    renderer.pherImage = renderer.pherCtx.createImageData(grid.cols, grid.rows);
  }
  const image = renderer.pherImage;
  const data = image.data;
  const foodColor = parseHex(TUNING.colors.food);
  const food2Color = parseHex(TUNING.colors.food2);
  const homeColor = parseHex(TUNING.colors.home);
  const rivalFoodColor = parseHex(TUNING.colors.rivalTrailFood);
  const rivalHomeColor = parseHex(TUNING.colors.rivalTrailHome);
  const dangerColor = parseHex(TUNING.colors.danger);
  const rivalFoodField = grid.pherFoodByFaction?.[TUNING.factions.rival];
  const rivalHomeField = grid.pherHomeByFaction?.[TUNING.factions.rival];
  for (let i = 0; i < grid.size; i += 1) {
    const food = Math.min(1, grid.pherFood[i] / TUNING.pher.cap);
    const home = Math.min(1, grid.pherHome[i] / TUNING.pher.cap);
    const rivalFood = Math.min(1, ((rivalFoodField ? rivalFoodField[i] : 0) / TUNING.pher.cap) * TUNING.render.rivalPherAlpha);
    const rivalHome = Math.min(1, ((rivalHomeField ? rivalHomeField[i] : 0) / TUNING.pher.cap) * TUNING.render.rivalPherAlpha);
    const danger = Math.min(1, grid.pherDanger[i] / TUNING.pher.cap);
    const warmMix = food * 0.35;
    const dangerMix = danger * 1.15;
    const totalRaw = food + warmMix + home + rivalFood + rivalHome + dangerMix;
    const total = Math.min(1, totalRaw);
    const p = i * 4;
    if (total <= 0.001) {
      data[p + 3] = 0;
    } else {
      const inv = 1 / Math.max(TUNING.sim.minTurnEpsilon, totalRaw);
      const glow = 0.45 + total * 0.55;
      data[p] = Math.min(255, (foodColor[0] * food + food2Color[0] * warmMix + homeColor[0] * home + rivalFoodColor[0] * rivalFood + rivalHomeColor[0] * rivalHome + dangerColor[0] * dangerMix) * inv * glow);
      data[p + 1] = Math.min(255, (foodColor[1] * food + food2Color[1] * warmMix + homeColor[1] * home + rivalFoodColor[1] * rivalFood + rivalHomeColor[1] * rivalHome + dangerColor[1] * dangerMix) * inv * glow);
      data[p + 2] = Math.min(255, (foodColor[2] * food + food2Color[2] * warmMix + homeColor[2] * home + rivalFoodColor[2] * rivalFood + rivalHomeColor[2] * rivalHome + dangerColor[2] * dangerMix) * inv * glow);
      data[p + 3] = Math.min(255, total * 165);
    }
  }
  renderer.pherCtx.putImageData(image, 0, 0);
  renderer.pherTexture.source.update();
}

function drawBushes(g: Graphics, world: RenderEcologyWorld): void {
  if (!world.bushes) return;
  const bushColor = hexNumber(TUNING.colors.bush);
  const bushDark = hexNumber(TUNING.colors.bushDark);
  const berry = hexNumber(TUNING.colors.berry);
  const soilDark = hexNumber(TUNING.colors.soilDark);
  for (let i = 0; i < world.bushes.length; i += 1) {
    const bush = world.bushes[i];
    const stockRatio = Math.max(0, Math.min(1, bush.stock / TUNING.ecology.bushCap));
    g.ellipse(bush.x, bush.y + TUNING.render.bushDrawRadius * HALF, TUNING.render.bushDrawRadius * 1.25, TUNING.render.bushDrawRadius * 0.38).fill({ color: soilDark, alpha: TUNING.render.bushShadowAlpha });
    g.circle(bush.x, bush.y, TUNING.render.bushDrawRadius).fill({ color: bushDark, alpha: 0.92 });
    for (let branch = 0; branch < TUNING.render.bushBranchCount; branch += 1) {
      const angle = (branch / TUNING.render.bushBranchCount) * TAU + hash01(i * 101 + branch * 17) * HALF;
      const length = TUNING.render.bushBranchLength * (HALF + hash01(i * 131 + branch * 19) * HALF);
      g.moveTo(bush.x, bush.y)
        .lineTo(bush.x + Math.cos(angle) * length, bush.y + Math.sin(angle) * length)
        .stroke({ color: bushColor, alpha: 0.72, width: 1 });
    }
    g.circle(bush.x, bush.y, TUNING.render.bushDrawRadius * 0.62).fill({ color: bushColor, alpha: 0.68 });
    const sparkles = Math.floor(stockRatio * TUNING.render.bushBerryMaxSparkles);
    for (let sparkle = 0; sparkle < sparkles; sparkle += 1) {
      const angle = hash01(i * 251 + sparkle * 37) * TAU;
      const dist = hash01(i * 271 + sparkle * 41) * TUNING.render.bushDrawRadius * 0.9;
      const twinkle = TUNING.render.foodTwinkleBase + Math.sin(world.time * TUNING.render.foodTwinkleSpeed + i + sparkle) * TUNING.render.foodTwinkleAmp;
      g.circle(bush.x + Math.cos(angle) * dist, bush.y + Math.sin(angle) * dist, TUNING.render.bushBerryRadius).fill({ color: berry, alpha: Math.max(0.18, Math.min(0.9, twinkle * stockRatio)) });
    }
  }
}

function drawCarcass(g: Graphics, world: RenderEcologyWorld): void {
  const carcass = world.carcass;
  if (!carcass || !carcass.active) return;
  const stockRatio = Math.max(0, Math.min(1, carcass.amount / TUNING.ecology.carcassAmount));
  const body = hexNumber(TUNING.colors.carcass);
  const bone = hexNumber(TUNING.colors.carcassBone);
  const danger = hexNumber(TUNING.colors.danger);
  const spoil = hexNumber(TUNING.colors.carcassSpoil);
  const soilDark = hexNumber(TUNING.colors.soilDark);
  const r = TUNING.render.carcassDrawRadius;
  g.ellipse(carcass.x, carcass.y + r * 0.48, r * 1.28, r * 0.38).fill({ color: soilDark, alpha: 0.36 });
  g.ellipse(carcass.x, carcass.y, r * 1.12, r * 0.64).fill({ color: body, alpha: 0.42 + stockRatio * 0.42 });
  g.circle(carcass.x - r * 0.72, carcass.y - r * 0.08, r * 0.42).fill({ color: body, alpha: 0.32 + stockRatio * 0.36 });
  for (let rib = 0; rib < TUNING.render.carcassRibCount; rib += 1) {
    const offset = (rib - (TUNING.render.carcassRibCount - 1) * HALF) * r * 0.32;
    g.arc(carcass.x + offset, carcass.y - r * 0.08, r * 0.36, Math.PI * 0.1, Math.PI * 0.92).stroke({ color: bone, alpha: 0.28 + stockRatio * 0.32, width: 1 });
  }
  if (carcass.spoiled) {
    const pulse = HALF + Math.sin(world.time * TUNING.render.carcassSpoilPulseSpeed) * HALF;
    g.circle(carcass.x, carcass.y, TUNING.ecology.carcassRadius * (1.1 + pulse * 0.18)).stroke({ color: danger, alpha: 0.12 + pulse * 0.12, width: 1 });
    g.circle(carcass.x + r * 0.42, carcass.y - r * 0.18, r * 0.22).fill({ color: spoil, alpha: 0.26 });
  }
  if (carcass.toast > 0) {
    const alpha = Math.min(1, carcass.toast / TUNING.ecology.carcassToastSec) * TUNING.render.carcassEventRingAlpha;
    g.circle(carcass.x, carcass.y, TUNING.render.carcassEventRingRadius * (1 + (1 - alpha) * 0.18)).stroke({ color: bone, alpha, width: 2 });
  }
}

function updateFood(renderer: Renderer, world: World): void {
  const g = renderer.foodGraphics;
  const grid = world.grid;
  const ecology = ecologyWorld(world);
  g.clear();
  const max = Math.min(grid.foodCount, TUNING.render.foodRenderMaxCells);
  const foodColor = hexNumber(TUNING.colors.food);
  for (let i = 0; i < max; i += 1) {
    const idx = grid.foodIndices[i];
    const amount = grid.foodAmt[idx];
    if (amount <= 0) continue;
    const cx = idx % grid.cols;
    const cy = Math.floor(idx / grid.cols);
    const x = (cx + HALF) * grid.cell;
    const y = (cy + HALF) * grid.cell;
    const dots = TUNING.render.foodDotsMin + Math.floor(hash01(idx) * TUNING.render.foodDotsRange);
    for (let d = 0; d < dots; d += 1) {
      const angle = hash01(idx * 31 + d * 7) * TAU;
      const dist = hash01(idx * 53 + d * 11) * grid.cell * HALF;
      const twinkle = TUNING.render.foodTwinkleBase + Math.sin(world.time * TUNING.render.foodTwinkleSpeed + idx * 0.37 + d) * TUNING.render.foodTwinkleAmp;
      g.circle(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, TUNING.render.foodDotRadius).fill({ color: foodColor, alpha: Math.max(0.2, Math.min(1, twinkle)) });
    }
  }
  drawBushes(g, ecology);
  drawCarcass(g, ecology);
}

function updateObstacles(renderer: Renderer, world: World): void {
  const g = renderer.obstacleGraphics;
  g.clear();
  const soilDark = hexNumber(TUNING.colors.soilDark);
  const stone = hexNumber(TUNING.colors.stone);
  const stoneDark = hexNumber(TUNING.colors.stoneDark);
  const stoneLight = hexNumber(TUNING.colors.stoneLight);
  for (let i = 0; i < world.obstacles.length; i += 1) {
    const o = world.obstacles[i];
    g.ellipse(o.x, o.y + o.r * TUNING.render.obstacleShadowOffset, o.r * 0.95, o.r * 0.28).fill({ color: soilDark, alpha: 0.32 });
    for (let p = 0; p <= TUNING.render.obstacleRoughPoints; p += 1) {
      const a = (p / TUNING.render.obstacleRoughPoints) * TAU;
      const rr = o.r * (1 - TUNING.render.obstacleRoughness * HALF + hash01(o.seed + p * 97) * TUNING.render.obstacleRoughness);
      const x = o.x + Math.cos(a) * rr;
      const y = o.y + Math.sin(a) * rr;
      if (p === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.closePath().fill({ color: stoneDark }).stroke({ color: stone, alpha: 0.55, width: 1 });
    g.arc(o.x - o.r * 0.18, o.y - o.r * 0.18, o.r * 0.72, Math.PI * 1.05, Math.PI * 1.75).stroke({ color: stoneLight, alpha: 0.35, width: 1 });
    const crackCount = 2 + Math.floor(hash01(o.seed + 701) * 2);
    for (let c = 0; c < crackCount; c += 1) {
      const base = hash01(o.seed + c * 311) * TAU;
      const start = o.r * (0.18 + hash01(o.seed + c * 313) * 0.24);
      const mid = o.r * (0.36 + hash01(o.seed + c * 317) * 0.2);
      const end = o.r * (0.52 + hash01(o.seed + c * 331) * 0.18);
      g.moveTo(o.x + Math.cos(base) * start, o.y + Math.sin(base) * start)
        .lineTo(o.x + Math.cos(base + 0.22) * mid, o.y + Math.sin(base + 0.22) * mid)
        .lineTo(o.x + Math.cos(base - 0.16) * end, o.y + Math.sin(base - 0.16) * end)
        .stroke({ color: stoneDark, alpha: 0.6, width: 1 });
    }
  }
}

function updateCorpses(renderer: Renderer, world: World): void {
  const g = renderer.corpseGraphics;
  g.clear();
  const danger = hexNumber(TUNING.colors.danger);
  const antDark = hexNumber(TUNING.colors.antDark);
  const corpseColor = hexNumber(TUNING.colors.corpse);
  const starving = hexNumber(TUNING.colors.starving);
  for (let i = 0; i < world.corpses.length; i += 1) {
    const corpse = world.corpses[i];
    const fade = corpse.decay / corpse.maxDecay;
    g.circle(corpse.x, corpse.y, TUNING.sense.dist * (1.2 - fade * 0.2)).stroke({ color: danger, alpha: fade * 0.18, width: 1 });
    g.ellipse(corpse.x, corpse.y, 4.2, 2.6).fill({ color: corpseColor, alpha: TUNING.render.corpseAlphaFloor + fade * (1 - TUNING.render.corpseAlphaFloor) });
    g.ellipse(corpse.x + 0.5, corpse.y - 0.2, 2.2, 1.1).fill({ color: starving, alpha: 0.35 });
    for (let side = -1; side <= 1; side += 2) {
      g.moveTo(corpse.x - 2.8, corpse.y + side)
        .lineTo(corpse.x - 5, corpse.y + side * 3.4)
        .moveTo(corpse.x + 1.4, corpse.y + side * 0.8)
        .lineTo(corpse.x + 3.8, corpse.y + side * 3.2)
        .stroke({ color: antDark, alpha: fade, width: 0.8 });
    }
  }
}

function drawNestAt(g: Graphics, x: number, y: number, broodProgress: number, pulseValue: number, nestColor: string, queenColor: string, eggColor: string, ringColor: string): void {
  const pulse = TUNING.render.nestRingBase + Math.min(TUNING.render.nestRingPulse, pulseValue);
  const queenX = x + TUNING.render.queenOffsetX;
  const queenY = y + TUNING.render.queenOffsetY;
  g.circle(x, y, TUNING.nest.r).fill({ color: hexNumber(nestColor) });
  g.ellipse(queenX, queenY, TUNING.render.queenVeilRadiusX, TUNING.render.queenVeilRadiusY).fill({ color: hexNumber(TUNING.colors.nestDark), alpha: 0.72 });
  g.ellipse(queenX, queenY, TUNING.render.queenRadiusX, TUNING.render.queenRadiusY).fill({ color: hexNumber(queenColor), alpha: 0.48 });
  g.ellipse(x + TUNING.nest.r * 0.08, y + TUNING.nest.r * 0.06, TUNING.nest.r * 0.38, TUNING.nest.r * 0.24).fill({ color: hexNumber(TUNING.colors.nestDark) });
  const broodRatio = Math.max(0, Math.min(1, broodProgress / TUNING.caste.broodProgressRequired));
  if (broodRatio > 0) {
    g.circle(x, y, TUNING.render.eggClutchRadius).stroke({ color: hexNumber(eggColor), alpha: TUNING.render.eggRingAlpha * broodRatio, width: 1 });
    const eggCount = Math.max(1, Math.ceil(TUNING.render.eggDotCount * broodRatio));
    for (let i = 0; i < eggCount; i += 1) {
      const a = (i / TUNING.render.eggDotCount) * TAU;
      g.circle(x + Math.cos(a) * TUNING.render.eggClutchRadius * 0.64, y + Math.sin(a) * TUNING.render.eggClutchRadius * 0.42, TUNING.render.eggDotRadius).fill({ color: hexNumber(eggColor), alpha: 0.34 + broodRatio * 0.36 });
    }
  }
  g.circle(x, y, TUNING.nest.r * pulse).stroke({ color: hexNumber(ringColor), alpha: 0.35 + Math.min(0.45, pulseValue), width: 2 });
}

function updateNest(renderer: Renderer, world: World): void {
  const g = renderer.nestGraphics;
  g.clear();
  const ecology = ecologyWorld(world);
  drawNestAt(g, world.nestX, world.nestY, ecology.broodProgress ?? 0, world.nestPulse, TUNING.colors.nest, TUNING.colors.queen, TUNING.colors.egg, TUNING.colors.nestRing);
  if (ecology.rival) {
    drawNestAt(g, ecology.rival.nestX, ecology.rival.nestY, ecology.rival.broodProgress, ecology.rival.nestPulse, TUNING.colors.rivalNest, TUNING.colors.rivalQueen, TUNING.colors.rivalEgg, TUNING.colors.rivalTrailHome);
  }
}

function updateAnts(renderer: Renderer, world: World): void {
  const ants = renderAnts(world.ants);
  const particles = renderer.antParticles;
  const ecology = ecologyWorld(world);
  const playerTerminal = (ecology.terminalTimer ?? 0) > 0;
  const rivalTerminal = (ecology.rival?.terminalTimer ?? 0) > 0;
  const baseScaleX = TUNING.render.antDrawW / renderer.antTextures[0].width;
  const baseScaleY = TUNING.render.antDrawH / renderer.antTextures[0].height;
  for (let i = 0; i < ants.count; i += 1) {
    const particle = particles[i];
    const starving = ants.energy[i] < TUNING.ant.starveAt;
    const carrying = ants.carrying[i] !== 0;
    const variant = carrying ? (starving ? 3 : 2) : starving ? 1 : 0;
    const caste = ants.caste ? ants.caste[i] : TUNING.caste.worker;
    const faction = ants.faction ? ants.faction[i] : TUNING.factions.player;
    const casteScale = caste === TUNING.caste.soldier ? TUNING.caste.soldierScale : 1;
    const frame = Math.floor((world.time * TUNING.ant.speed + i * 0.37) * TUNING.render.antBodyWobbleDistance) % 3;
    const wobble = Math.sin((world.time * TUNING.ant.speed + i * 0.37) * TUNING.render.antBodyWobbleDistance) * TUNING.render.antBodyWobbleAmount;
    particle.texture = renderer.antTextures[variant * 3 + frame];
    particle.x = ants.x[i];
    particle.y = ants.y[i];
    particle.scaleX = baseScaleX * casteScale;
    particle.scaleY = baseScaleY * casteScale;
    particle.rotation = ants.heading[i] + wobble;
    if ((faction === TUNING.factions.rival && rivalTerminal) || (faction !== TUNING.factions.rival && playerTerminal)) particle.tint = hexNumber(TUNING.render.terminalAntTint);
    else if (faction === TUNING.factions.rival) particle.tint = hexNumber(TUNING.colors.rivalAnt);
    else particle.tint = hexNumber(TUNING.colors.warPlayer);
    particle.alpha = 1;
  }
  for (let i = ants.count; i < particles.length; i += 1) {
    const particle = particles[i];
    if (particle.alpha === 0) break;
    particle.alpha = 0;
    particle.tint = 0xffffff;
    particle.x = TUNING.input.cursorUnset;
    particle.y = TUNING.input.cursorUnset;
  }
}

function updateSpider(renderer: Renderer, world: World): void {
  const g = renderer.spiderGraphics;
  g.clear();
  const spider = world.spider;
  if (!spider.active) return;
  g.circle(spider.x, spider.y, TUNING.spider.dangerRadius).stroke({ color: hexNumber(TUNING.colors.danger), alpha: TUNING.spider.drawRingAlpha, width: TUNING.spider.drawLineWidth });
  g.ellipse(spider.x, spider.y + TUNING.spider.drawBodyRadius, TUNING.spider.drawBodyRadius * TUNING.spider.drawShadowRadiusXMul, TUNING.spider.drawBodyRadius * TUNING.spider.drawShadowRadiusYMul).fill({ color: hexNumber(TUNING.colors.soilDark), alpha: TUNING.spider.drawShadowAlpha });
  const cos = Math.cos(spider.heading);
  const sin = Math.sin(spider.heading);
  const tx = (lx: number, ly: number) => spider.x + lx * cos - ly * sin;
  const ty = (lx: number, ly: number) => spider.y + lx * sin + ly * cos;
  const pairCenter = (TUNING.spider.drawLegPairs - 1) * HALF;
  for (let pair = 0; pair < TUNING.spider.drawLegPairs; pair += 1) {
    const along = (pair - pairCenter) * TUNING.spider.drawLegSpacing;
    const phase = Math.sin(world.time * TUNING.spider.drawLegWiggleSpeed + pair) * TUNING.spider.drawLegWiggleAmount;
    for (let side = -1; side <= 1; side += 2) {
      g.moveTo(tx(along, side * TUNING.spider.drawLegRootY), ty(along, side * TUNING.spider.drawLegRootY))
        .lineTo(tx(along + phase, side * (TUNING.spider.drawLegRootY + TUNING.spider.drawLegLength)), ty(along + phase, side * (TUNING.spider.drawLegRootY + TUNING.spider.drawLegLength)))
        .stroke({ color: hexNumber(TUNING.colors.spiderLeg), width: TUNING.spider.drawLineWidth });
    }
  }
  g.ellipse(tx(TUNING.spider.drawAbdomenOffset, 0), ty(TUNING.spider.drawAbdomenOffset, 0), TUNING.spider.drawAbdomenRadius, TUNING.spider.drawBodyRadius).fill({ color: hexNumber(TUNING.colors.spider) });
  g.ellipse(tx(TUNING.spider.drawHeadOffset, 0), ty(TUNING.spider.drawHeadOffset, 0), TUNING.spider.drawHeadRadius, TUNING.spider.drawHeadRadius * TUNING.spider.drawHeadRadiusYMul).fill({ color: hexNumber(TUNING.colors.spider) });
  g.circle(tx(TUNING.spider.drawHeadOffset + TUNING.spider.drawEyeForward, -TUNING.spider.drawEyeSide), ty(TUNING.spider.drawHeadOffset + TUNING.spider.drawEyeForward, -TUNING.spider.drawEyeSide), TUNING.spider.drawEyeRadius).fill({ color: hexNumber(TUNING.colors.spiderEye) });
  g.circle(tx(TUNING.spider.drawHeadOffset + TUNING.spider.drawEyeForward, TUNING.spider.drawEyeSide), ty(TUNING.spider.drawHeadOffset + TUNING.spider.drawEyeForward, TUNING.spider.drawEyeSide), TUNING.spider.drawEyeRadius).fill({ color: hexNumber(TUNING.colors.spiderEye) });
}

function updateParticles(renderer: Renderer, world: World): void {
  for (let i = 0; i < world.particles.length; i += 1) {
    const p = world.particles[i];
    const sprite = renderer.effectSprites[i];
    if (!p.active || p.life < TUNING.render.particleMinLife * 0.01) {
      sprite.visible = false;
      continue;
    }
    const alpha = p.life / p.maxLife;
    sprite.visible = true;
    sprite.x = p.x;
    sprite.y = p.y;
    sprite.alpha = alpha;
    sprite.scale.set(Math.max(0.1, p.size * alpha * 0.25));
    if (p.kind === ParticleKind.Nest) sprite.tint = hexNumber(TUNING.colors.food);
    else if (p.kind === ParticleKind.Death) sprite.tint = hexNumber(TUNING.colors.danger);
    else if (p.kind === ParticleKind.Wash) sprite.tint = hexNumber(TUNING.colors.home);
    else if (p.kind === ParticleKind.Dust) sprite.tint = hexNumber(TUNING.colors.stoneLight);
    else sprite.tint = hexNumber(TUNING.colors.nestRing);
  }
}

function updateTerrainTint(renderer: Renderer, world: World): void {
  const seasonTint = seasonTintHex(renderSeasonAt(world.time));
  renderer.terrainSprite.tint = rainActive(world) ? mixHex(seasonTint, TUNING.seasons.rainTint, TUNING.render.seasonRainTintMix) : hexNumber(seasonTint);
}

function drawRain(g: Graphics, world: World): void {
  if (!rainActive(world)) return;
  const visibleW = world.camera.viewW / world.camera.scale;
  const visibleH = world.camera.viewH / world.camera.scale;
  const minX = world.camera.x;
  const minY = world.camera.y;
  const length = TUNING.seasons.rainStreakLength / world.camera.scale;
  const spanY = visibleH + length * 2;
  const fall = (world.time * TUNING.seasons.rainStreakSpeed) / world.camera.scale;
  const slant = length * TUNING.seasons.rainStreakSlant;
  for (let i = 0; i < TUNING.seasons.rainStreakCount; i += 1) {
    const x = minX + hash01(i * 911 + TUNING.seed.value) * visibleW;
    const y = minY - length + ((hash01(i * 577 + TUNING.seed.value) * spanY + fall) % spanY);
    g.moveTo(x, y)
      .lineTo(x + slant, y + length)
      .stroke({ color: hexNumber(TUNING.seasons.rainTint), alpha: TUNING.seasons.rainStreakAlpha, width: TUNING.seasons.rainStreakWidth / world.camera.scale });
  }
}

function factionColor(faction: number): number {
  return faction === TUNING.factions.rival ? hexNumber(TUNING.colors.warRival) : hexNumber(TUNING.colors.warPlayer);
}

function drawLiveClashSparks(g: Graphics, world: World): void {
  const ants = renderAnts(world.ants);
  if (!ants.faction) return;
  const range = TUNING.conflict.range * TUNING.render.liveClashSparkRangeMul;
  const range2 = range * range;
  const spatial = world.spatial;
  const danger = hexNumber(TUNING.colors.danger);
  let sparks = 0;
  for (let i = 0; i < ants.count && sparks < TUNING.render.liveClashSparkMax; i += 1) {
    const minCx = Math.max(0, Math.floor((ants.x[i] - range) / spatial.cell));
    const maxCx = Math.min(spatial.cols - 1, Math.floor((ants.x[i] + range) / spatial.cell));
    const minCy = Math.max(0, Math.floor((ants.y[i] - range) / spatial.cell));
    const maxCy = Math.min(spatial.rows - 1, Math.floor((ants.y[i] + range) / spatial.cell));
    for (let cy = minCy; cy <= maxCy && sparks < TUNING.render.liveClashSparkMax; cy += 1) {
      for (let cx = minCx; cx <= maxCx && sparks < TUNING.render.liveClashSparkMax; cx += 1) {
        let other = spatial.heads[cy * spatial.cols + cx];
        while (other >= 0 && sparks < TUNING.render.liveClashSparkMax) {
          const next = spatial.next[other];
          if (other > i && ants.faction[other] !== ants.faction[i]) {
            const dx = ants.x[other] - ants.x[i];
            const dy = ants.y[other] - ants.y[i];
            if (dx * dx + dy * dy <= range2) {
              const x = (ants.x[i] + ants.x[other]) * HALF;
              const y = (ants.y[i] + ants.y[other]) * HALF;
              const size = TUNING.render.liveClashSparkSize * (0.8 + Math.sin(world.time * 18 + i * 0.31) * 0.2);
              g.moveTo(x - size, y - size)
                .lineTo(x + size, y + size)
                .stroke({ color: factionColor(ants.faction[i]), alpha: TUNING.render.liveClashSparkAlpha, width: TUNING.render.liveClashSparkLineWidth });
              g.moveTo(x - size, y + size)
                .lineTo(x + size, y - size)
                .stroke({ color: factionColor(ants.faction[other]), alpha: TUNING.render.liveClashSparkAlpha, width: TUNING.render.liveClashSparkLineWidth });
              g.circle(x, y, size * 1.4).stroke({ color: danger, alpha: 0.2, width: 1 });
              sparks += 1;
            }
          }
          other = next;
        }
      }
    }
  }
}

function updateCursor(renderer: Renderer, world: World): void {
  const g = renderer.cursorGraphics;
  g.clear();
  drawLiveClashSparks(g, world);
  drawRain(g, world);
  if (!world.cursorActive) return;
  const tool = world.activeTool;
  let r: number = TUNING.food.clickRadius;
  if (tool === Tool.Boulder) r = (TUNING.input.boulderMinRadius + TUNING.input.boulderMaxRadius) * HALF;
  if (tool === Tool.Wash) r = TUNING.input.washRadius;
  g.circle(world.cursorX, world.cursorY, r).stroke({ color: hexNumber(TUNING.colors.preview), alpha: 0.52, width: 1 });
}

function updateCamera(renderer: Renderer, world: World, dt: number): void {
  let shakeX = 0;
  let shakeY = 0;
  if (world.trauma > 0) {
    const a = hash01(world.frame * 1973) * TAU;
    const amount = world.trauma * world.trauma * TUNING.render.shakePixels;
    shakeX = Math.cos(a) * amount;
    shakeY = Math.sin(a) * amount;
    world.trauma = Math.max(0, world.trauma - TUNING.fx.shakeDecay * dt);
  }
  renderer.worldContainer.scale.set(world.camera.scale);
  renderer.worldContainer.position.set(-world.camera.x * world.camera.scale + shakeX, -world.camera.y * world.camera.scale + shakeY);
}

function updateMinimap(renderer: Renderer, world: World): void {
  const ctx = renderer.minimapCtx;
  const w = TUNING.minimap.w;
  const h = TUNING.minimap.h;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = TUNING.colors.soilDark;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.95;
  ctx.drawImage(renderer.pherCanvas, 0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  const sx = w / world.width;
  const sy = h / world.height;
  ctx.fillStyle = TUNING.colors.nestRing;
  ctx.beginPath();
  ctx.arc(world.nestX * sx, world.nestY * sy, TUNING.minimap.dotNest, 0, TAU);
  ctx.fill();
  const ecology = ecologyWorld(world);
  if (ecology.rival) {
    ctx.fillStyle = TUNING.colors.rivalTrailHome;
    ctx.beginPath();
    ctx.arc(ecology.rival.nestX * sx, ecology.rival.nestY * sy, TUNING.minimap.dotNest, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = TUNING.colors.food;
  for (let i = 0; i < world.grid.foodCount; i += 1) {
    const idx = world.grid.foodIndices[i];
    if (world.grid.foodAmt[idx] <= 0) continue;
    const cx = idx % world.grid.cols;
    const cy = Math.floor(idx / world.grid.cols);
    ctx.fillRect((cx + HALF) * world.grid.cell * sx, (cy + HALF) * world.grid.cell * sy, TUNING.minimap.dotFood, TUNING.minimap.dotFood);
  }
  ctx.strokeStyle = TUNING.colors.preview;
  ctx.lineWidth = TUNING.minimap.viewportLineWidth;
  ctx.strokeRect(world.camera.x * sx, world.camera.y * sy, (world.camera.viewW / world.camera.scale) * sx, (world.camera.viewH / world.camera.scale) * sy);
}

export function renderWorld(renderer: Renderer, world: World, dt: number): void {
  if (renderer.destroyed) return;
  world.lastTextureMs = 0;
  if (world.frame % TUNING.render.pherUpdateEvery === 0) {
    const textureStart = performance.now();
    updatePheromoneImage(renderer, world);
    world.lastTextureMs = performance.now() - textureStart;
  }
  updateCamera(renderer, world, dt);
  updateTerrainTint(renderer, world);
  updateFood(renderer, world);
  updateObstacles(renderer, world);
  updateCorpses(renderer, world);
  updateNest(renderer, world);
  updateAnts(renderer, world);
  updateSpider(renderer, world);
  updateParticles(renderer, world);
  updateCursor(renderer, world);
  updateMinimap(renderer, world);
  renderer.app.render();
}
