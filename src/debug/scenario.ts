import { applyTool, dropCarcass, stressSpawn } from "../sim";
import { type Tool, type World } from "../types";
import { TUNING } from "../tuning";

export type ScenarioAction =
  | { at: number; do: "applyTool"; tool: string; x: number; y: number }
  | { at: number; do: "dropCarcass"; x: number; y: number }
  | { at: number; do: "stressSpawn"; n: number }
  | { at: number; do: "patchTuning"; path: string; value: unknown }
  | { at: number; do: "snapshot" };

export interface Scenario {
  name: string;
  seed?: number;
  ticks?: number;
  tuning?: Record<string, unknown>;
  timeline: ScenarioAction[];
}

export interface ScenarioRecord {
  type: "stimulus" | "scenario_snapshot";
  tick: number;
  scenario: string;
  action: ScenarioAction;
}

export interface ScenarioExecutor {
  scenario: Scenario;
  runDue(world: World, onRecord?: (record: ScenarioRecord) => void): void;
}

function assertObject(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error(`${label} must be an object`);
  return value as Record<string, unknown>;
}

function assertNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`${label} must be a finite number`);
  return value;
}

export function parseScenario(value: unknown): Scenario {
  const object = assertObject(value, "scenario");
  const name = typeof object.name === "string" && object.name.length > 0 ? object.name : "unnamed";
  const timelineValue = object.timeline;
  if (!Array.isArray(timelineValue)) throw new Error("scenario.timeline must be an array");
  const timeline = timelineValue.map((entry, index): ScenarioAction => {
    const action = assertObject(entry, `scenario.timeline[${index}]`);
    const at = Math.max(0, Math.floor(assertNumber(action.at, `scenario.timeline[${index}].at`)));
    if (action.do === "applyTool") return { at, do: "applyTool", tool: String(action.tool), x: assertNumber(action.x, "applyTool.x"), y: assertNumber(action.y, "applyTool.y") };
    if (action.do === "dropCarcass") return { at, do: "dropCarcass", x: assertNumber(action.x, "dropCarcass.x"), y: assertNumber(action.y, "dropCarcass.y") };
    if (action.do === "stressSpawn") return { at, do: "stressSpawn", n: Math.max(0, Math.floor(assertNumber(action.n, "stressSpawn.n"))) };
    if (action.do === "patchTuning") return { at, do: "patchTuning", path: String(action.path), value: action.value };
    if (action.do === "snapshot") return { at, do: "snapshot" };
    throw new Error(`Unknown scenario action: ${String(action.do)}`);
  }).sort((a, b) => a.at - b.at);
  return {
    name,
    seed: object.seed === undefined ? undefined : assertNumber(object.seed, "scenario.seed"),
    ticks: object.ticks === undefined ? undefined : Math.max(0, Math.floor(assertNumber(object.ticks, "scenario.ticks"))),
    tuning: object.tuning === undefined ? undefined : assertObject(object.tuning, "scenario.tuning"),
    timeline,
  };
}

export function scenarioFromBase64(encoded: string): Scenario {
  if (typeof globalThis.atob !== "function") throw new Error("Base64 scenario decoding requires atob");
  const json = globalThis.atob(encoded);
  return parseScenario(JSON.parse(json));
}

export function applyTuningPatch(path: string, value: unknown): void {
  const keys = path.split(".").filter(Boolean);
  if (keys.length === 0) throw new Error("Tuning path cannot be empty");
  let target: Record<string, unknown> = TUNING as unknown as Record<string, unknown>;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const next = target[keys[i]];
    if (typeof next !== "object" || next === null || Array.isArray(next)) throw new Error(`Invalid tuning path: ${path}`);
    target = next as Record<string, unknown>;
  }
  const leaf = keys[keys.length - 1];
  if (!(leaf in target)) throw new Error(`Invalid tuning path: ${path}`);
  target[leaf] = value;
}

export function getTuningPath(path: string): unknown {
  const keys = path.split(".").filter(Boolean);
  let value: unknown = TUNING;
  for (const key of keys) {
    if (typeof value !== "object" || value === null || Array.isArray(value) || !(key in value)) throw new Error(`Invalid tuning path: ${path}`);
    value = (value as Record<string, unknown>)[key];
  }
  return value;
}

export function applyScenarioSetup(scenario: Scenario): void {
  if (scenario.seed !== undefined) applyTuningPatch("seed.value", scenario.seed);
  if (scenario.tuning) {
    for (const [path, value] of Object.entries(scenario.tuning)) applyTuningPatch(path, value);
  }
}

function executeAction(world: World, action: ScenarioAction): void {
  if (action.do === "applyTool") applyTool(world, action.tool as Tool, action.x, action.y);
  else if (action.do === "dropCarcass") dropCarcass(world, action.x, action.y);
  else if (action.do === "stressSpawn") stressSpawn(world, action.n);
  else if (action.do === "patchTuning") applyTuningPatch(action.path, action.value);
}

export function createScenarioExecutor(scenario: Scenario): ScenarioExecutor {
  let cursor = 0;
  return {
    scenario,
    runDue(world, onRecord) {
      while (cursor < scenario.timeline.length && scenario.timeline[cursor].at <= world.stepCount) {
        const action = scenario.timeline[cursor];
        cursor += 1;
        if (action.do !== "snapshot") executeAction(world, action);
        onRecord?.({ type: action.do === "snapshot" ? "scenario_snapshot" : "stimulus", tick: world.stepCount, scenario: scenario.name, action });
      }
    },
  };
}
