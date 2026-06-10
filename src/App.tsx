import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { applyTool, createWorld, dropCarcass, getCarcassDropCooldown, getColonyStatus, getDigCooldown, getSeasonState, makeHudSnapshot, resizeWorld, stepWorld, stressSpawn } from "./sim";
import { CameraState, HudSnapshot, Renderer, Tool, World } from "./types";
import { createRenderer, destroyRenderer, renderWorld } from "./render";
import { DEFAULTS, TUNING } from "./tuning";

const SPEEDS = [1, 2, 4, 8] as const;
const CONTROL = TUNING.controls.sliders;
const TOOL_FOOD = Tool.Food;
const TOOL_LURE = "lure" as Tool;
const TOOL_BOULDER = Tool.Boulder;
const TOOL_DIG = "dig" as Tool;
const TOOL_WASH = Tool.Wash;
const TOOL_ROSTER: readonly { tool: Tool; label: string; key: string }[] = [
  { tool: TOOL_FOOD, label: "Food", key: "1" },
  { tool: TOOL_LURE, label: "Lure", key: "2" },
  { tool: TOOL_BOULDER, label: "Boulder", key: "3" },
  { tool: TOOL_DIG, label: "Dig", key: "4" },
  { tool: TOOL_WASH, label: "Wash", key: "5" },
];

type TuningSection = "pher" | "sense" | "ant" | "spawn" | "ants" | "food";
type TuningNumberStore = Record<TuningSection, Record<string, number>>;
type CasteRatioKey = "workerRatio" | "soldierRatio" | "nurseRatio";
type DragMode = "none" | "tool" | "pan";

interface TuningHandle {
  section: TuningSection;
  key: string;
}

interface SliderSpec extends TuningHandle {
  label: string;
  min: number;
  max: number;
  step: number;
  precision: number;
}

interface DragState {
  mode: DragMode;
  tool: Tool;
  lastScreenX: number;
  lastScreenY: number;
  lastWorldX: number;
  lastWorldY: number;
}

const LIVE_TUNING = TUNING as unknown as TuningNumberStore;
const LIVE_CASTE = TUNING.caste as unknown as Record<CasteRatioKey, number>;
const DEFAULT_TUNING = DEFAULTS as unknown as TuningNumberStore;
const DEFAULT_CASTE = DEFAULTS.caste as unknown as Record<CasteRatioKey, number>;
const FOOD_CLICK_AMOUNT: TuningHandle = { section: "food", key: "clickAmount" };
const CASTE_RATIOS: readonly { key: CasteRatioKey; label: string }[] = [
  { key: "workerRatio", label: "Worker" },
  { key: "soldierRatio", label: "Soldier" },
  { key: "nurseRatio", label: "Nurse" },
];
const SLIDER_SPECS: readonly SliderSpec[] = [
  { section: "pher", key: "evapFood", label: "pher.evapFood", ...CONTROL.pherEvapFood },
  { section: "pher", key: "evapHome", label: "pher.evapHome", ...CONTROL.pherEvapHome },
  { section: "pher", key: "evapDanger", label: "pher.evapDanger", ...CONTROL.pherEvapDanger },
  { section: "pher", key: "diffuseLerp", label: "pher.diffuseLerp", ...CONTROL.pherDiffuseLerp },
  { section: "pher", key: "depositFood", label: "pher.depositFood", ...CONTROL.pherDepositFood },
  { section: "pher", key: "pickupDecay", label: "pher.pickupDecay", ...CONTROL.pherPickupDecay },
  { section: "sense", key: "dist", label: "sense.dist", ...CONTROL.senseDist },
  { section: "sense", key: "angleDeg", label: "sense.angleDeg", ...CONTROL.senseAngleDeg },
  { section: "ant", key: "drainPerSec", label: "ant.drainPerSec", ...CONTROL.antDrainPerSec },
  { section: "ant", key: "starveAt", label: "ant.starveAt", ...CONTROL.antStarveAt },
  { section: "spawn", key: "cost", label: "spawn.cost", ...CONTROL.spawnCost },
  { section: "spawn", key: "intervalSec", label: "spawn.intervalSec", ...CONTROL.spawnIntervalSec },
  { section: "ants", key: "max", label: "ants.max", ...CONTROL.antsMax },
];

function getTuningValue(handle: TuningHandle): number {
  return LIVE_TUNING[handle.section][handle.key];
}

function getDefaultValue(handle: TuningHandle): number {
  return DEFAULT_TUNING[handle.section][handle.key];
}

function setTuningValue(handle: TuningHandle, value: number): void {
  LIVE_TUNING[handle.section][handle.key] = value;
}

function setCasteRatios(worker: number, soldier: number, nurse: number): void {
  LIVE_CASTE.workerRatio = worker;
  LIVE_CASTE.soldierRatio = soldier;
  LIVE_CASTE.nurseRatio = nurse;
}

function formatValue(value: number): string {
  if (value >= 100) return Math.round(value).toString();
  if (value >= 10) return value.toFixed(1);
  return value.toFixed(2);
}

function normalizeCasteRatios(changed: CasteRatioKey, value: number): void {
  const clamped = Math.max(0, Math.min(TUNING.caste.ratioTotal, Math.round(value / TUNING.caste.ratioStep) * TUNING.caste.ratioStep));
  const keys: CasteRatioKey[] = ["workerRatio", "soldierRatio", "nurseRatio"];
  const others = keys.filter((key) => key !== changed);
  const remaining = TUNING.caste.ratioTotal - clamped;
  const otherTotal = LIVE_CASTE[others[0]] + LIVE_CASTE[others[1]];
  let first = otherTotal > 0 ? Math.round((LIVE_CASTE[others[0]] / otherTotal) * remaining / TUNING.caste.ratioStep) * TUNING.caste.ratioStep : remaining * TUNING.sim.randomTurnHalf;
  first = Math.max(0, Math.min(remaining, first));
  const next = {
    workerRatio: LIVE_CASTE.workerRatio,
    soldierRatio: LIVE_CASTE.soldierRatio,
    nurseRatio: LIVE_CASTE.nurseRatio,
  };
  next[changed] = clamped;
  next[others[0]] = first;
  next[others[1]] = remaining - first;
  setCasteRatios(next.workerRatio, next.soldierRatio, next.nurseRatio);
}

function formatTuningValue(value: number, precision: number): string {
  return precision === 0 ? Math.round(value).toString() : value.toFixed(precision);
}

function formatSeasonTime(seconds: number): string {
  const whole = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(whole / TUNING.seasons.clockMinuteSec);
  const rest = whole % TUNING.seasons.clockMinuteSec;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
}

function clampCamera(world: World): void {
  const camera = world.camera;
  camera.scale = Math.min(TUNING.camera.maxZoom, Math.max(TUNING.camera.minZoom, camera.scale));
  const visibleW = camera.viewW / camera.scale;
  const visibleH = camera.viewH / camera.scale;
  camera.x = Math.min(Math.max(0, world.width - visibleW), Math.max(0, camera.x));
  camera.y = Math.min(Math.max(0, world.height - visibleH), Math.max(0, camera.y));
}

function centerCamera(world: World): void {
  world.camera.x = world.nestX - world.camera.viewW / world.camera.scale * 0.5;
  world.camera.y = world.nestY - world.camera.viewH / world.camera.scale * 0.5;
  clampCamera(world);
}

function screenToWorld(world: World, element: HTMLElement, clientX: number, clientY: number): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  return {
    x: world.camera.x + (clientX - rect.left) / world.camera.scale,
    y: world.camera.y + (clientY - rect.top) / world.camera.scale,
  };
}

function zoomAt(world: World, element: HTMLElement, clientX: number, clientY: number, factor: number): void {
  const rect = element.getBoundingClientRect();
  const sx = clientX - rect.left;
  const sy = clientY - rect.top;
  const wx = world.camera.x + sx / world.camera.scale;
  const wy = world.camera.y + sy / world.camera.scale;
  world.camera.scale = Math.min(TUNING.camera.maxZoom, Math.max(TUNING.camera.minZoom, world.camera.scale * factor));
  world.camera.x = wx - sx / world.camera.scale;
  world.camera.y = wy - sy / world.camera.scale;
  clampCamera(world);
}

function toolForEvent(event: React.PointerEvent<HTMLElement>, active: Tool): Tool {
  if (event.altKey) return TOOL_WASH;
  if (event.shiftKey || event.button === 2) return TOOL_BOULDER;
  return active;
}

function cooldownStyle(ratio: number): CSSProperties {
  return { "--cooldown": Math.max(0, Math.min(1, ratio)).toFixed(3) } as CSSProperties;
}

function Stat({ label, value, flash, reserveRatio }: { label: string; value: string; flash?: boolean; reserveRatio?: number }) {
  const [pop, setPop] = useState(false);
  const previous = useRef(value);
  useEffect(() => {
    if (previous.current !== value) {
      previous.current = value;
      setPop(true);
      const id = window.setTimeout(() => setPop(false), TUNING.render.statPopMs);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [value]);
  return (
    <div className={`stat ${pop ? "stat-pop" : ""} ${flash ? "stat-flash" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {reserveRatio === undefined ? null : (
        <span className="reserve-bar" aria-hidden="true">
          <i style={{ transform: `scaleX(${reserveRatio})` }} />
        </span>
      )}
    </div>
  );
}

function Chart({ snapshot }: { snapshot: HudSnapshot }) {
  const w = TUNING.render.chartW;
  const h = TUNING.render.chartH;
  const p = TUNING.render.chartPad;
  const count = snapshot.chart.count;
  const pop = snapshot.chart.population;
  const food = snapshot.chart.nestFood;
  let popMax: number = TUNING.ants.max;
  let foodMax: number = Math.max(TUNING.nest.startFood, TUNING.spawn.minReserve + TUNING.spawn.cost);
  for (let i = 0; i < count; i += 1) {
    if (pop[i] > popMax) popMax = pop[i];
    if (food[i] > foodMax) foodMax = food[i];
  }
  const makePath = (values: number[], max: number) => {
    if (count <= 1) return "";
    let path = "";
    for (let i = 0; i < count; i += 1) {
      const x = p + (i / (TUNING.ui.chartSamples - 1)) * (w - p * 2);
      const y = h - p - (values[i] / max) * (h - p * 2);
      path += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)} `;
    }
    return path;
  };
  return (
    <svg className="chart" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Population and nest food over time">
      <title>Population and nest food</title>
      <rect x="0" y="0" width={w} height={h} rx="0" />
      <path className="chart-grid" d={`M${p} ${h - p}H${w - p}M${p} ${p}H${w - p}`} />
      <path className="chart-pop" d={makePath(pop, popMax)} />
      <path className="chart-food" d={makePath(food, foodMax)} />
    </svg>
  );
}

function DebugOverlay({ snapshot }: { snapshot: HudSnapshot }) {
  if (!snapshot.debug) return null;
  const camera: CameraState = snapshot.camera;
  return (
    <div className="debug panel">
      <span>fps {Math.round(snapshot.fps)} | sim {snapshot.simMs.toFixed(2)} / field {snapshot.fieldMs.toFixed(2)} / tex {snapshot.textureMs.toFixed(2)} / render {snapshot.renderMs.toFixed(2)} ms</span>
      <span>cam {camera.x.toFixed(0)}, {camera.y.toFixed(0)} x{camera.scale.toFixed(2)}</span>
      <span>ants {snapshot.ants}</span>
    </div>
  );
}

function SeasonPanel({ state, nestFood }: { state: ReturnType<typeof getSeasonState>; nestFood: number }) {
  const reserveRatio = Math.max(0, Math.min(1, nestFood / state.winterReserveHint));
  return (
    <div className={`season-panel panel ${state.isWinter ? "winter" : ""}`}>
      <div className="season-main">
        <strong>{state.label}</strong>
        <span>{formatSeasonTime(state.timeToNext)}</span>
      </div>
      <span className="season-track" aria-hidden="true">
        <i style={{ transform: `scaleX(${state.seasonProgress})` }} />
      </span>
      <div className="season-score">
        <span>Year {state.year}</span>
        <span>Survived {state.yearsSurvived}</span>
        <span>Peak {state.peakPopulation}</span>
      </div>
      <span className="reserve-track" aria-hidden="true">
        <i style={{ transform: `scaleX(${reserveRatio})` }} />
      </span>
    </div>
  );
}

function CastePanel({ status }: { status: ReturnType<typeof getColonyStatus> }) {
  const broodRatio = Math.max(0, Math.min(1, status.broodProgress / status.broodRequired));
  const queenRatio = Math.max(0, Math.min(1, status.queenHunger / status.queenHungerLimit));
  return (
    <div className={`caste-panel panel ${status.terminal ? "terminal" : ""}`}>
      <div className="caste-counts">
        <span>W {status.workers}</span>
        <span>S {status.soldiers}</span>
        <span>N {status.nurses}</span>
      </div>
      <div className="brood-row">
        <span>Brood</span>
        <strong>{status.broodProgress.toFixed(0)}/{status.broodRequired}</strong>
      </div>
      <span className="brood-track" aria-hidden="true">
        <i style={{ transform: `scaleX(${broodRatio})` }} />
      </span>
      <div className="brood-row">
        <span>Queen</span>
        <strong>{status.terminal ? "terminal" : status.queenHunger > 0 ? `${Math.ceil(Math.max(0, status.queenHungerLimit - status.queenHunger))}s` : "fed"}</strong>
      </div>
      <span className="queen-track" aria-hidden="true">
        <i style={{ transform: `scaleX(${status.terminal ? status.terminalProgress : queenRatio})` }} />
      </span>
    </div>
  );
}

function RatioPanel({ onChange }: { onChange: (key: CasteRatioKey, value: number) => void }) {
  return (
    <div className="ratio-panel" aria-label="Caste ratio policy">
      <div className="ratio-head">
        <strong>Ratios</strong>
        <span>{TUNING.caste.ratioTotal}%</span>
      </div>
      {CASTE_RATIOS.map((item) => {
        const value = LIVE_CASTE[item.key];
        return (
          <label className="ratio-row" key={item.key}>
            <span>
              <span>{item.label}</span>
              <strong>{value}%</strong>
            </span>
            <input type="range" min="0" max={TUNING.caste.ratioTotal} step={TUNING.caste.ratioStep} value={value} onChange={(event) => onChange(item.key, Number(event.currentTarget.value))} />
          </label>
        );
      })}
    </div>
  );
}

function GameOverOverlay({ status, onRestart }: { status: ReturnType<typeof getColonyStatus>; onRestart: () => void }) {
  if (!status.gameOver) return null;
  return (
    <div className={`game-over ${status.victory ? "victory" : ""}`}>
      <section className="game-over-panel panel" aria-label="Game over">
        <h1>{status.victory ? `Rival outlasted in year ${status.victoryYear}` : "Colony lost"}</h1>
        <div className="game-over-stats">
          <span><em>Years</em><strong>{status.yearsSurvived}</strong></span>
          <span><em>Peak</em><strong>{status.peakPopulation}</strong></span>
          <span><em>Food</em><strong>{status.totalFoodGathered}</strong></span>
          <span><em>Deaths</em><strong>{status.totalDeaths}</strong></span>
        </div>
        <button type="button" onClick={onRestart}>Restart</button>
      </section>
    </div>
  );
}

export function App() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const pixiHostRef = useRef<HTMLDivElement | null>(null);
  const minimapRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const worldRef = useRef<World>(createWorld());
  const accumulatorRef = useRef(0);
  const lastTimeRef = useRef(0);
  const spaceDownRef = useRef(false);
  const dragRef = useRef<DragState>({ mode: "none", tool: TOOL_FOOD, lastScreenX: 0, lastScreenY: 0, lastWorldX: TUNING.input.cursorUnset, lastWorldY: TUNING.input.cursorUnset });
  const [snapshot, setSnapshot] = useState<HudSnapshot>(() => makeHudSnapshot(worldRef.current));
  const [fallbackText, setFallbackText] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [resetEpoch, setResetEpoch] = useState(0);
  const [, setTuningRevision] = useState(0);
  const styles = useMemo(() => makeStyles(), []);
  const reserveRatio = Math.max(0, Math.min(1, (snapshot.nestFood - TUNING.spawn.minReserve) / TUNING.spawn.cost));
  const digCooldown = getDigCooldown(worldRef.current);
  const carcassDropCooldown = getCarcassDropCooldown(worldRef.current);
  const seasonState = getSeasonState(worldRef.current);
  const colonyStatus = getColonyStatus(worldRef.current);
  const digCooldownRatio = digCooldown / TUNING.tools.digCooldownSec;
  const carcassCooldownRatio = carcassDropCooldown / TUNING.tools.carcassDropCooldownSec;
  const carcassDisabled = carcassDropCooldown > 0 || seasonState.isWinter;

  useEffect(() => {
    const viewport = pixiHostRef.current;
    const minimap = minimapRef.current;
    if (!viewport || !minimap) return undefined;
    let destroyed = false;
    let localRenderer: Renderer | null = null;
    rendererRef.current = null;
    setFallbackText(null);
    createRenderer(viewport, minimap, worldRef.current)
      .then((renderer) => {
        if (destroyed) {
          destroyRenderer(renderer);
          return;
        }
        localRenderer = renderer;
        viewport.replaceChildren(renderer.app.canvas);
        rendererRef.current = renderer;
      })
      .catch((error: unknown) => {
        if (!destroyed) setFallbackText(error instanceof Error ? error.message : "Pixi renderer could not be initialized.");
      });
    return () => {
      destroyed = true;
      if (localRenderer) {
        const canvas = localRenderer.app.canvas;
        destroyRenderer(localRenderer);
        if (canvas.parentElement === viewport) canvas.remove();
        if (rendererRef.current === localRenderer) rendererRef.current = null;
        localRenderer = null;
      }
    };
  }, [resetEpoch]);

  useEffect(() => {
    const resize = () => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const rect = viewport.getBoundingClientRect();
      const dpr = Math.min(TUNING.render.maxDpr, window.devicePixelRatio || 1);
      resizeWorld(worldRef.current, rect.width, rect.height, dpr);
      if (worldRef.current.stepCount === 0) centerCamera(worldRef.current);
      else clampCamera(worldRef.current);
    };
    resize();
    const observer = new ResizeObserver(resize);
    if (viewportRef.current) observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, [resetEpoch]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSnapshot(makeHudSnapshot(worldRef.current));
    }, TUNING.time.msPerSec / TUNING.ui.hudHz);
    return () => window.clearInterval(id);
  }, [resetEpoch]);

  useEffect(() => {
    let raf = 0;
    let alive = true;
    const fixedDt = 1 / TUNING.time.stepHz;
    lastTimeRef.current = 0;
    const tick = (timeMs: number) => {
      if (!alive) return;
      const renderer = rendererRef.current;
      const world = worldRef.current;
      if (lastTimeRef.current === 0) lastTimeRef.current = timeMs;
      const realDt = Math.min(TUNING.time.maxFrameMs / TUNING.time.msPerSec, (timeMs - lastTimeRef.current) / TUNING.time.msPerSec);
      lastTimeRef.current = timeMs;
      const fps = realDt > 0 ? 1 / realDt : TUNING.time.stepHz;
      let simMs = 0;
      if (!world.paused) {
        accumulatorRef.current += realDt * Math.min(TUNING.time.maxStepsPerFrame, Math.max(1, world.speed));
        let steps = 0;
        const simStart = performance.now();
        while (accumulatorRef.current >= fixedDt && steps < TUNING.time.maxStepsPerFrame) {
          stepWorld(world, fixedDt, fps);
          accumulatorRef.current -= fixedDt;
          steps += 1;
        }
        simMs = performance.now() - simStart;
        if (steps > 0) world.lastSimMs = simMs / steps;
        if (steps === TUNING.time.maxStepsPerFrame && accumulatorRef.current > fixedDt) accumulatorRef.current = fixedDt;
      } else {
        world.lastSimMs = 0;
      }
      if (renderer) {
        const renderStart = performance.now();
        renderWorld(renderer, world, realDt);
        world.lastRenderMs = performance.now() - renderStart;
      }
      if (alive) raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => {
      alive = false;
      window.cancelAnimationFrame(raf);
    };
  }, [resetEpoch]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      const viewport = viewportRef.current;
      const world = worldRef.current;
      if (event.code === "Space") {
        spaceDownRef.current = true;
        event.preventDefault();
        return;
      }
      if (event.key === "d" || event.key === "D") {
        world.debug = !world.debug;
        setSnapshot(makeHudSnapshot(world));
        return;
      }
      if (event.key === "g" || event.key === "G") {
        stressSpawn(world);
        setSnapshot(makeHudSnapshot(world));
        return;
      }
      const keyedTool = TOOL_ROSTER.find((item) => item.key === event.key);
      if (keyedTool) {
        world.activeTool = keyedTool.tool;
        setSnapshot(makeHudSnapshot(world));
        event.preventDefault();
        return;
      }
      if (event.key === "ArrowLeft") world.camera.x -= TUNING.camera.keyPanPx / world.camera.scale;
      else if (event.key === "ArrowRight") world.camera.x += TUNING.camera.keyPanPx / world.camera.scale;
      else if (event.key === "ArrowUp") world.camera.y -= TUNING.camera.keyPanPx / world.camera.scale;
      else if (event.key === "ArrowDown") world.camera.y += TUNING.camera.keyPanPx / world.camera.scale;
      else if ((event.key === "+" || event.key === "=") && viewport) zoomAt(world, viewport, window.innerWidth * 0.5, window.innerHeight * 0.5, TUNING.camera.zoomStep);
      else if ((event.key === "-" || event.key === "_") && viewport) zoomAt(world, viewport, window.innerWidth * 0.5, window.innerHeight * 0.5, 1 / TUNING.camera.zoomStep);
      else return;
      event.preventDefault();
      clampCamera(world);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") spaceDownRef.current = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const setTool = (tool: Tool) => {
    worldRef.current.activeTool = tool;
    setSnapshot(makeHudSnapshot(worldRef.current));
  };

  const setSpeed = (speed: number) => {
    worldRef.current.speed = speed;
    setSnapshot(makeHudSnapshot(worldRef.current));
  };

  const togglePause = () => {
    worldRef.current.paused = !worldRef.current.paused;
    setSnapshot(makeHudSnapshot(worldRef.current));
  };

  const reset = () => {
    const current = worldRef.current;
    const fresh = createWorld(current.camera.viewW, current.camera.viewH, current.dpr);
    fresh.activeTool = current.activeTool;
    fresh.speed = current.speed;
    fresh.debug = current.debug;
    centerCamera(fresh);
    worldRef.current = fresh;
    accumulatorRef.current = 0;
    lastTimeRef.current = 0;
    setSnapshot(makeHudSnapshot(fresh));
    setResetEpoch((value) => value + 1);
  };

  const applyToolStroke = (world: World, tool: Tool, fromX: number, fromY: number, toX: number, toY: number) => {
    if (tool !== TOOL_LURE) {
      applyTool(world, tool, toX, toY);
      return;
    }
    const dx = toX - fromX;
    const dy = toY - fromY;
    const dist = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.ceil(dist / TUNING.tools.lureStrokeSpacing));
    for (let i = 1; i <= steps; i += 1) {
      const t = i / steps;
      applyTool(world, tool, fromX + dx * t, fromY + dy * t);
    }
  };

  const triggerCarcassDrop = () => {
    const world = worldRef.current;
    const x = world.cursorActive ? world.cursorX : world.camera.x + world.camera.viewW / world.camera.scale * 0.5;
    const y = world.cursorActive ? world.cursorY : world.camera.y + world.camera.viewH / world.camera.scale * 0.5;
    if (dropCarcass(world, x, y)) setSnapshot(makeHudSnapshot(world));
  };

  const refreshTuningPanel = () => setTuningRevision((value) => value + 1);

  const updateTuning = (handle: TuningHandle, value: number) => {
    setTuningValue(handle, value);
    refreshTuningPanel();
  };

  const updateCasteRatio = (key: CasteRatioKey, value: number) => {
    normalizeCasteRatios(key, value);
    refreshTuningPanel();
  };

  const resetDrawerTuning = () => {
    for (const spec of SLIDER_SPECS) setTuningValue(spec, getDefaultValue(spec));
    setTuningValue(FOOD_CLICK_AMOUNT, getDefaultValue(FOOD_CLICK_AMOUNT));
    setCasteRatios(DEFAULT_CASTE.workerRatio, DEFAULT_CASTE.soldierRatio, DEFAULT_CASTE.nurseRatio);
  };

  const applyBalanced = () => {
    resetDrawerTuning();
    refreshTuningPanel();
  };

  const applyHarsh = () => {
    resetDrawerTuning();
    setTuningValue({ section: "ant", key: "drainPerSec" }, TUNING.controls.presets.harsh.drainPerSec);
    setTuningValue({ section: "pher", key: "evapFood" }, TUNING.controls.presets.harsh.evapFood);
    refreshTuningPanel();
  };

  const applyAbundance = () => {
    resetDrawerTuning();
    setTuningValue({ section: "spawn", key: "cost" }, TUNING.controls.presets.abundance.cost);
    setTuningValue(FOOD_CLICK_AMOUNT, TUNING.controls.presets.abundance.clickAmount);
    refreshTuningPanel();
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    event.preventDefault();
    const world = worldRef.current;
    const point = screenToWorld(world, viewport, event.clientX, event.clientY);
    world.cursorX = point.x;
    world.cursorY = point.y;
    world.cursorActive = true;
    if (event.button === 1 || (spaceDownRef.current && event.button === 0)) {
      dragRef.current = { mode: "pan", tool: world.activeTool, lastScreenX: event.clientX, lastScreenY: event.clientY, lastWorldX: point.x, lastWorldY: point.y };
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }
    const tool = toolForEvent(event, world.activeTool);
    dragRef.current = { mode: "tool", tool, lastScreenX: event.clientX, lastScreenY: event.clientY, lastWorldX: point.x, lastWorldY: point.y };
    event.currentTarget.setPointerCapture(event.pointerId);
    applyTool(world, tool, point.x, point.y);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const world = worldRef.current;
    const point = screenToWorld(world, viewport, event.clientX, event.clientY);
    world.cursorX = point.x;
    world.cursorY = point.y;
    world.cursorActive = true;
    if (dragRef.current.mode === "pan") {
      const dx = event.clientX - dragRef.current.lastScreenX;
      const dy = event.clientY - dragRef.current.lastScreenY;
      world.camera.x -= dx / world.camera.scale;
      world.camera.y -= dy / world.camera.scale;
      clampCamera(world);
      dragRef.current.lastScreenX = event.clientX;
      dragRef.current.lastScreenY = event.clientY;
      return;
    }
    if (dragRef.current.mode !== "tool") return;
    const dx = point.x - dragRef.current.lastWorldX;
    const dy = point.y - dragRef.current.lastWorldY;
    if (dx * dx + dy * dy >= TUNING.input.dragSpacing * TUNING.input.dragSpacing) {
      applyToolStroke(world, dragRef.current.tool, dragRef.current.lastWorldX, dragRef.current.lastWorldY, point.x, point.y);
      dragRef.current.lastWorldX = point.x;
      dragRef.current.lastWorldY = point.y;
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current.mode = "none";
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handlePointerLeave = () => {
    worldRef.current.cursorActive = false;
    dragRef.current.mode = "none";
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    event.preventDefault();
    const factor = Math.exp(-event.deltaY * TUNING.camera.wheelZoomBase);
    zoomAt(worldRef.current, viewport, event.clientX, event.clientY, factor);
  };

  const handleMinimapPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const world = worldRef.current;
    const x = ((event.clientX - rect.left) / rect.width) * world.width;
    const y = ((event.clientY - rect.top) / rect.height) * world.height;
    world.camera.x = x - world.camera.viewW / world.camera.scale * 0.5;
    world.camera.y = y - world.camera.viewH / world.camera.scale * 0.5;
    clampCamera(world);
  };

  return (
    <main className="app">
      <style>{styles}</style>
      <div
        ref={viewportRef}
        className={`viewport ${spaceDownRef.current ? "panning" : ""}`}
        aria-label="Ant colony simulation"
        onContextMenu={(event) => event.preventDefault()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onWheel={handleWheel}
      >
        <div ref={pixiHostRef} className="pixi-host" />
      </div>
      <div className="overlay">
        {fallbackText ? <div className="fallback panel">{fallbackText}</div> : null}
        <div className="toolbar panel" aria-label="God tools">
          {TOOL_ROSTER.map((item) => {
            const isDig = item.tool === TOOL_DIG;
            const disabled = isDig && digCooldown > 0;
            const className = `tool-button ${snapshot.tool === item.tool ? "active" : ""} ${disabled ? "cooldown" : ""}`;
            return (
              <button key={item.label} type="button" aria-pressed={snapshot.tool === item.tool} className={className} disabled={disabled} style={isDig ? cooldownStyle(digCooldownRatio) : undefined} onClick={() => setTool(item.tool)}>
                <span>{item.label}</span>
              </button>
            );
          })}
          <button type="button" className={`tool-button action-button ${carcassDropCooldown > 0 ? "cooldown" : ""}`} disabled={carcassDisabled} style={cooldownStyle(carcassCooldownRatio)} onClick={triggerCarcassDrop}>
            <span>Carcass</span>
          </button>
        </div>
        <div className="hud panel">
          <Stat label="Ants" value={Math.round(snapshot.ants).toString()} />
          <Stat label="Nest food" value={formatValue(snapshot.nestFood)} flash={worldRef.current.hudFlash > 0} reserveRatio={reserveRatio} />
          <Stat label="Deaths" value={Math.round(snapshot.deaths).toString()} />
          <Stat label="Food/min" value={formatValue(snapshot.foodPerMin)} />
          <Stat label="FPS" value={Math.round(snapshot.fps).toString()} />
        </div>
        <SeasonPanel state={seasonState} nestFood={snapshot.nestFood} />
        <CastePanel status={colonyStatus} />
        {seasonState.rainToast > 0 ? <div className="rain-toast panel">{TUNING.seasons.rainToastText}</div> : null}
        <DebugOverlay snapshot={snapshot} />
        <canvas ref={minimapRef} className="minimap panel" width={TUNING.minimap.w} height={TUNING.minimap.h} aria-label="World minimap" onPointerDown={handleMinimapPointerDown} />
        <div className={`tuning-shell ${drawerOpen ? "open" : "collapsed"}`}>
          <button className="gear-toggle" type="button" aria-label={drawerOpen ? "Close tuning drawer" : "Open tuning drawer"} aria-expanded={drawerOpen} onClick={() => setDrawerOpen((open) => !open)}>
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3.2" />
              <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
            </svg>
          </button>
          {drawerOpen ? (
            <aside className="tuning-drawer panel" aria-label="Live tuning controls">
              <div className="drawer-head">
                <strong>Tuning</strong>
                <span>live</span>
              </div>
              <div className="preset-row" aria-label="Tuning presets">
                <button type="button" onClick={applyBalanced}>Balanced</button>
                <button type="button" onClick={applyHarsh}>Harsh</button>
                <button type="button" onClick={applyAbundance}>Abundance</button>
              </div>
              <RatioPanel onChange={updateCasteRatio} />
              <div className="slider-list">
                {SLIDER_SPECS.map((spec) => {
                  const value = getTuningValue(spec);
                  return (
                    <label className="tuning-row" key={`${spec.section}.${spec.key}`} onDoubleClick={() => updateTuning(spec, getDefaultValue(spec))}>
                      <span className="tuning-label">
                        <span>{spec.label}</span>
                        <strong>{formatTuningValue(value, spec.precision)}</strong>
                      </span>
                      <input type="range" min={spec.min} max={spec.max} step={spec.step} value={value} onChange={(event) => updateTuning(spec, Number(event.currentTarget.value))} />
                    </label>
                  );
                })}
              </div>
            </aside>
          ) : null}
        </div>
        <div className="bottom panel">
          <button type="button" onClick={togglePause}>{snapshot.paused ? "Play" : "Pause"}</button>
          <button type="button" onClick={reset}>Reset</button>
          <div className="speed" aria-label="Simulation speed">
            {SPEEDS.map((speed) => (
              <button key={speed} type="button" className={snapshot.speed === speed ? "active" : ""} aria-pressed={snapshot.speed === speed} onClick={() => setSpeed(speed)}>
                x{speed}
              </button>
            ))}
          </div>
          <Chart snapshot={snapshot} />
        </div>
        <GameOverOverlay status={colonyStatus} onRestart={reset} />
      </div>
    </main>
  );
}

function makeStyles(): string {
  return `
    :root {
      color-scheme: dark;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: ${TUNING.colors.soilDark};
      color: ${TUNING.colors.text};
    }
    * { box-sizing: border-box; }
    html, body, #root { width: 100%; height: 100%; margin: 0; overflow: hidden; }
    button {
      min-height: 32px;
      padding: 0 12px;
      border: 1px solid ${TUNING.colors.border};
      border-radius: 6px;
      background: ${TUNING.colors.panel2};
      color: ${TUNING.colors.text};
      font: inherit;
      font-size: 12px;
      cursor: pointer;
    }
    button:hover { border-color: ${TUNING.colors.accent}; }
    button:focus-visible { outline: 2px solid ${TUNING.colors.active}; outline-offset: 2px; }
    button.active {
      color: ${TUNING.colors.active};
      border-color: ${TUNING.colors.active};
      background: ${TUNING.colors.panel};
    }
    button:disabled {
      color: ${TUNING.colors.muted};
      border-color: ${TUNING.colors.border};
      cursor: not-allowed;
      opacity: 0.72;
    }
    .tool-button {
      position: relative;
      overflow: hidden;
    }
    .tool-button span {
      position: relative;
      z-index: 1;
    }
    .tool-button.cooldown::before {
      content: "";
      position: absolute;
      inset: 2px;
      border-radius: 4px;
      background: rgba(216, 211, 176, 0.18);
      transform: scaleX(var(--cooldown));
      transform-origin: left center;
      pointer-events: none;
    }
    .app {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: ${TUNING.colors.soilDark};
      user-select: none;
    }
    .viewport {
      position: absolute;
      inset: 0;
      overflow: hidden;
      touch-action: none;
      cursor: crosshair;
    }
    .pixi-host {
      position: absolute;
      inset: 0;
    }
    .pixi-host canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
    .overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .panel {
      pointer-events: auto;
      background: ${TUNING.colors.panel};
      border: 1px solid ${TUNING.colors.border};
      color: ${TUNING.colors.text};
    }
    .fallback {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      padding: 12px 16px;
      max-width: 360px;
      text-align: center;
      color: ${TUNING.colors.fallback};
    }
    .toolbar {
      position: absolute;
      left: 12px;
      top: 12px;
      display: flex;
      gap: 8px;
      padding: 8px;
    }
    .hud {
      position: absolute;
      right: 12px;
      top: 12px;
      display: grid;
      grid-template-columns: repeat(5, minmax(74px, auto));
      gap: 1px;
      padding: 6px;
    }
    .debug {
      position: absolute;
      right: 256px;
      top: 82px;
      display: grid;
      gap: 3px;
      min-width: 430px;
      padding: 8px;
      color: ${TUNING.colors.muted};
      font-size: 11px;
      font-variant-numeric: tabular-nums;
      line-height: 1.25;
      white-space: nowrap;
    }
    .season-panel {
      position: absolute;
      right: 12px;
      top: 82px;
      width: 232px;
      display: grid;
      gap: 5px;
      padding: 8px;
      font-size: 11px;
      line-height: 1.2;
      font-variant-numeric: tabular-nums;
    }
    .season-main,
    .season-score {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 10px;
    }
    .season-main strong {
      color: ${TUNING.colors.text};
      font-size: 13px;
      font-weight: 600;
    }
    .season-main span,
    .season-score span {
      color: ${TUNING.colors.muted};
    }
    .season-panel.winter .season-main strong {
      color: ${TUNING.colors.starving};
    }
    .season-track,
    .reserve-track {
      display: block;
      width: 100%;
      height: 2px;
      overflow: hidden;
      background: ${TUNING.colors.border};
    }
    .season-track i,
    .reserve-track i {
      display: block;
      width: 100%;
      height: 100%;
      transform-origin: left center;
      background: ${TUNING.colors.active};
    }
    .reserve-track i {
      background: ${TUNING.colors.food};
    }
    .rain-toast {
      position: absolute;
      right: 12px;
      top: 250px;
      padding: 6px 10px;
      color: ${TUNING.colors.muted};
      font-size: 12px;
      letter-spacing: 0;
    }
    .caste-panel {
      position: absolute;
      right: 12px;
      top: 156px;
      width: 232px;
      display: grid;
      gap: 5px;
      padding: 8px;
      font-size: 11px;
      line-height: 1.2;
      font-variant-numeric: tabular-nums;
    }
    .caste-counts,
    .brood-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
      color: ${TUNING.colors.muted};
    }
    .caste-counts span {
      min-width: 0;
      color: ${TUNING.colors.text};
    }
    .brood-row strong {
      color: ${TUNING.colors.text};
      font-size: 11px;
      font-weight: 500;
    }
    .caste-panel.terminal .brood-row strong {
      color: ${TUNING.colors.starving};
    }
    .brood-track,
    .queen-track {
      display: block;
      width: 100%;
      height: 2px;
      overflow: hidden;
      background: ${TUNING.colors.border};
    }
    .brood-track i,
    .queen-track i {
      display: block;
      width: 100%;
      height: 100%;
      transform-origin: left center;
      background: ${TUNING.colors.egg};
    }
    .queen-track i {
      background: ${TUNING.colors.starving};
    }
    .minimap {
      position: absolute;
      left: ${TUNING.minimap.left}px;
      bottom: ${TUNING.minimap.bottom}px;
      width: ${TUNING.minimap.w}px;
      height: ${TUNING.minimap.h}px;
      display: block;
      image-rendering: auto;
      cursor: pointer;
    }
    .tuning-shell {
      position: absolute;
      right: 12px;
      top: 286px;
      display: flex;
      flex-direction: row-reverse;
      align-items: flex-start;
      gap: 8px;
      pointer-events: none;
    }
    .tuning-shell.collapsed {
      width: 36px;
    }
    .gear-toggle {
      width: 36px;
      min-height: 36px;
      padding: 0;
      display: grid;
      place-items: center;
      flex: 0 0 36px;
      pointer-events: auto;
    }
    .gear-toggle svg {
      width: 18px;
      height: 18px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .tuning-drawer {
      width: min(${TUNING.controls.drawerWidth}px, calc(100vw - 68px));
      max-height: calc(100vh - 430px);
      padding: 10px;
      overflow: auto;
      pointer-events: auto;
      contain: layout style paint;
    }
    .drawer-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 8px;
    }
    .drawer-head strong {
      color: ${TUNING.colors.text};
      font-size: 13px;
      font-weight: 600;
    }
    .drawer-head span {
      color: ${TUNING.colors.muted};
      font-size: 11px;
      text-transform: uppercase;
    }
    .preset-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      margin-bottom: 8px;
    }
    .preset-row button {
      min-height: 28px;
      padding: 0 6px;
      font-size: 11px;
    }
    .ratio-panel {
      display: grid;
      gap: 6px;
      padding: 8px 0;
      margin-bottom: 8px;
      border-top: 1px solid ${TUNING.colors.border};
      border-bottom: 1px solid ${TUNING.colors.border};
    }
    .ratio-head,
    .ratio-row > span {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
      color: ${TUNING.colors.muted};
      font-size: 11px;
      line-height: 1.2;
    }
    .ratio-head strong,
    .ratio-row strong {
      color: ${TUNING.colors.text};
      font-size: 11px;
      font-weight: 500;
    }
    .ratio-row {
      display: grid;
      gap: 4px;
      user-select: none;
    }
    .ratio-row input[type="range"] {
      width: 100%;
      height: 16px;
      margin: 0;
      background: transparent;
      accent-color: ${TUNING.colors.accent};
      cursor: pointer;
      appearance: none;
    }
    .ratio-row input[type="range"]:focus-visible {
      outline: 1px solid ${TUNING.colors.active};
      outline-offset: 2px;
    }
    .ratio-row input[type="range"]::-webkit-slider-runnable-track {
      height: 3px;
      background: ${TUNING.colors.border};
    }
    .ratio-row input[type="range"]::-webkit-slider-thumb {
      width: 10px;
      height: 10px;
      margin-top: -3.5px;
      border: 1px solid ${TUNING.colors.active};
      border-radius: 50%;
      background: ${TUNING.colors.panel2};
      appearance: none;
    }
    .ratio-row input[type="range"]::-moz-range-track {
      height: 3px;
      background: ${TUNING.colors.border};
    }
    .ratio-row input[type="range"]::-moz-range-thumb {
      width: 10px;
      height: 10px;
      border: 1px solid ${TUNING.colors.active};
      border-radius: 50%;
      background: ${TUNING.colors.panel2};
    }
    .slider-list {
      display: grid;
      gap: 6px;
    }
    .tuning-row {
      display: grid;
      gap: 4px;
      padding: 6px 0;
      border-top: 1px solid ${TUNING.colors.border};
      user-select: none;
    }
    .tuning-label {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
      color: ${TUNING.colors.muted};
      font-size: 11px;
      line-height: 1.2;
    }
    .tuning-label strong {
      color: ${TUNING.colors.text};
      font-size: 11px;
      font-weight: 500;
      font-variant-numeric: tabular-nums;
    }
    .tuning-row input[type="range"] {
      width: 100%;
      height: 16px;
      margin: 0;
      background: transparent;
      accent-color: ${TUNING.colors.accent};
      cursor: pointer;
      appearance: none;
    }
    .tuning-row input[type="range"]:focus-visible {
      outline: 1px solid ${TUNING.colors.active};
      outline-offset: 2px;
    }
    .tuning-row input[type="range"]::-webkit-slider-runnable-track {
      height: 3px;
      background: ${TUNING.colors.border};
    }
    .tuning-row input[type="range"]::-webkit-slider-thumb {
      width: 10px;
      height: 10px;
      margin-top: -3.5px;
      border: 1px solid ${TUNING.colors.active};
      border-radius: 50%;
      background: ${TUNING.colors.panel2};
      appearance: none;
    }
    .tuning-row input[type="range"]::-moz-range-track {
      height: 3px;
      background: ${TUNING.colors.border};
    }
    .tuning-row input[type="range"]::-moz-range-thumb {
      width: 10px;
      height: 10px;
      border: 1px solid ${TUNING.colors.active};
      border-radius: 50%;
      background: ${TUNING.colors.panel2};
    }
    .stat {
      min-width: 74px;
      padding: 6px 8px;
      transform: scale(1);
      transition: transform ${TUNING.render.statPopMs}ms ease, background-color ${TUNING.render.statPopMs}ms ease;
    }
    .stat span {
      display: block;
      color: ${TUNING.colors.muted};
      font-size: 11px;
      line-height: 1.2;
    }
    .stat strong {
      display: block;
      color: ${TUNING.colors.text};
      font-size: 16px;
      line-height: 1.25;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }
    .reserve-bar {
      display: block;
      width: 100%;
      height: 2px;
      margin-top: 4px;
      overflow: hidden;
      background: ${TUNING.colors.border};
    }
    .reserve-bar i {
      display: block;
      width: 100%;
      height: 100%;
      transform-origin: left center;
      background: ${TUNING.colors.food};
    }
    .stat-pop { transform: scale(1.12); }
    .stat-flash { background: ${TUNING.colors.soilWarm}; }
    .bottom {
      position: absolute;
      left: 50%;
      bottom: 12px;
      transform: translateX(-50%);
      display: grid;
      grid-template-columns: auto auto auto auto;
      align-items: center;
      gap: 8px;
      padding: 8px;
      max-width: calc(100vw - 24px);
    }
    .speed {
      display: flex;
      gap: 6px;
    }
    .chart {
      width: min(${TUNING.render.chartW}px, 42vw);
      height: ${TUNING.render.chartH}px;
      display: block;
    }
    .chart rect {
      fill: ${TUNING.colors.panel2};
      stroke: ${TUNING.colors.border};
      stroke-width: 1;
    }
    .chart path {
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .chart-grid {
      stroke: ${TUNING.colors.border};
      stroke-width: 1;
      opacity: 0.7;
    }
    .chart-pop {
      stroke: ${TUNING.colors.home};
      stroke-width: 2;
    }
    .chart-food {
      stroke: ${TUNING.colors.food};
      stroke-width: 2;
    }
    .game-over {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      padding: 24px;
      background: rgba(5, 5, 5, 0.78);
      pointer-events: auto;
      animation: game-over-fade 2.4s ease forwards;
    }
    .game-over-panel {
      width: min(420px, calc(100vw - 48px));
      display: grid;
      gap: 12px;
      padding: 16px;
      background: ${TUNING.colors.gameOver};
    }
    .game-over.victory .game-over-panel {
      background: ${TUNING.colors.victory};
    }
    .game-over-panel h1 {
      margin: 0;
      color: ${TUNING.colors.text};
      font-size: 20px;
      line-height: 1.25;
      font-weight: 600;
      letter-spacing: 0;
    }
    .game-over-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1px;
      border: 1px solid ${TUNING.colors.border};
      background: ${TUNING.colors.border};
    }
    .game-over-stats span {
      display: grid;
      gap: 3px;
      padding: 8px;
      background: ${TUNING.colors.panel};
      font-variant-numeric: tabular-nums;
    }
    .game-over-stats em {
      color: ${TUNING.colors.muted};
      font-size: 11px;
      font-style: normal;
      line-height: 1.2;
    }
    .game-over-stats strong {
      color: ${TUNING.colors.text};
      font-size: 16px;
      line-height: 1.25;
      font-weight: 600;
    }
    .game-over-panel button {
      justify-self: end;
    }
    @keyframes game-over-fade {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @media (max-width: 780px) {
      .hud {
        left: 12px;
        right: 12px;
        top: 62px;
        grid-template-columns: repeat(5, 1fr);
      }
      .debug {
        top: 252px;
        right: 12px;
      }
      .season-panel {
        left: 12px;
        right: 12px;
        top: 132px;
        width: auto;
      }
      .caste-panel {
        left: 12px;
        right: 12px;
        top: 206px;
        width: auto;
      }
      .rain-toast {
        right: 12px;
        top: 304px;
      }
      .tuning-shell {
        top: 342px;
      }
      .tuning-drawer {
        max-height: calc(100vh - 500px);
      }
      .minimap {
        bottom: 154px;
        width: 160px;
        height: 90px;
      }
      .stat { min-width: 0; }
      .bottom {
        width: calc(100vw - 24px);
        grid-template-columns: auto auto 1fr;
      }
      .chart {
        grid-column: 1 / -1;
        width: 100%;
      }
    }
  `;
}
