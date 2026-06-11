# AGENTS.md

## Project

Antzoo is a React, TypeScript, Vite, and PixiJS ant-colony simulation. The simulation core is deterministic and seed-driven; preserve that property unless the task explicitly asks to change it.

## Repo Map

- `src/` contains the app, renderer, simulation, tuning, and debug surfaces.
- `scripts/run.ts` is the headless simulation CLI used by `npm run sim`.
- `scripts/test-debug.ts` is the debug-surface test gate used by `npm test`.
- `scenarios/` contains JSON scenario fixtures.
- `docs/debug-surface/DEBUG.md` is the technical reference for headless runs, snapshots, traces, hashes, and browser bridge behavior.
- `docs/fleet/FLEET.md` is the experiment-fleet operating document and report contract.

## Commands

- Install dependencies: `npm ci`
- Start the app: `npm run dev -- --port 5173`
- Run a headless sim: `npm run sim -- --seed 1337 --ticks 50000`
- Typecheck: `npm run typecheck`
- CI-sized debug gate: `npm test -- --fast`
- Full debug gate: `npm test`
- Production build: `npm run build`

## Working Rules

- Keep changes scoped to the request. Do not make gameplay, balance, tuning, or visual changes unless asked.
- Do not edit `node_modules/`, `dist/`, or other generated output by hand.
- For behavioral claims, record the seed, config, tick, and observable.
- When changing simulation, tuning, debug snapshots, hashing, traces, or the headless CLI, run the full `npm test` before calling the work done.
- When working on fleet reports, follow `docs/fleet/FLEET.md` exactly and only add the requested report file unless instructed otherwise.
