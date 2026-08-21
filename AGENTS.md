# AGENTS.md

## Start here

**Read `docs/GDD.md` in full before doing anything else.** It is the project's working vision: the fantasy, the pillars, the systems catalog, the experience milestones, and the Agent Charter you operate under. Tasks in this repo are normally phrased against it ("execute M0", "deepen S3 to stage B") and it defines what done looks like.

## Project

Antzoo is a React, TypeScript, Vite, and PixiJS ant-colony god game / living terrarium. The simulation core is deterministic and seed-driven; that property is the seatbelt that lets agents change the game aggressively — preserve it (see Working Rules), but do not mistake preserving it for the job. The job is making the world more alive on screen.

## Repo Map

- `docs/GDD.md` — the game design document and Agent Charter. **The source of direction.**
- `src/` — app (`App.tsx`), renderer (`render.ts`), simulation (`sim.ts`), tuning (`tuning.ts`), debug surfaces (`debug/`).
- `scripts/run.ts` — headless simulation CLI (`npm run sim`).
- `scripts/test-debug.ts` — the test gate (`npm test`).
- `scenarios/` — JSON scenario fixtures; run identically headless and in-browser via `?scenario=<base64>`.
- `docs/debug-surface/DEBUG.md` — technical reference for headless runs, snapshots, traces, hashes, and the `window.__antzoo` browser bridge.
- `docs/fleet/`, `docs/plan-goals/`, `docs/roadmap.md` — **historical, read-only.** Do not follow their doctrine, write their report formats, or maintain their baselines. Their numbers are stale by design once `src/` changes.

## Commands

- Install dependencies: `npm ci`
- Start the app: `npm run dev -- --port 5173`
- Run a headless sim: `npm run sim -- --seed 1337 --ticks 50000`
- Typecheck: `npm run typecheck`
- CI-sized test gate: `npm test -- --fast`
- Full test gate: `npm test`
- Production build: `npm run build`

## Working Rules (the seatbelt — full version in GDD §6)

1. Gameplay, balance, tuning, and visual changes are the point of this project when the task calls for them. Scope to the task, but do not shrink from the game.
2. Never weaken a test, gate, or the state hash. New gameplay state on `World` goes into `hashWorldState` (`src/debug/snapshot.ts`) plus a T0 sensitivity line in `scripts/test-debug.ts`. If a gate fails, fix the code.
3. All gameplay randomness flows through `nextRand(world)`. New presentation systems (visual FX, audio) must not consume gameplay RNG — use a separate presentation-only RNG. (Legacy particles draw `nextRand`; grandfathered, do not extend the pattern.)
4. Runtime-affecting work requires full `npm test`, `npm run typecheck`, and `npm run build`, all green. Documentation-only commits, including agent instructions, skills, and workflow metadata, skip application gates when the change includes no application code, simulation code, tests, build configuration, application dependencies, scenarios, or generated-source inputs. Before using this exception, inspect `git status --short`, `git diff --name-only`, and `git diff --cached --name-only` so staged, unstaged, and untracked files are all accounted for. Run `git diff --check`, parse structured files, and verify links, locks, templates, or upstream copies as relevant.
5. Any demo scenario you ship runs twice headless with identical final hashes; paste both summary lines in the PR description.
6. Milestone work ships `DEMO.md` (≤25 lines): URLs with seeds, the `?scenario=` demo link, three "watch for this" bullets, before/after screenshots at matched seed+tick. The human accepts by watching, not by reading reports.
7. Do not create fleet reports, findings docs, plan-goal bundles, progress ledgers, statistical sweeps, or any new document besides `DEMO.md`, factual updates to `docs/GDD.md`'s inventory section, and domain documentation created under the Agent Skills rules (`CONTEXT.md`, `CONTEXT-MAP.md`, and ADRs under `docs/adr/` or context-scoped `src/*/docs/adr/`). Domain documentation is created lazily only when terms or decisions are actually resolved, never as speculative scaffolding.
8. Do not edit `node_modules/`, `dist/`, or generated output by hand.
9. Plan your own build sequence within a milestone — research, architecture, and sequencing are yours. The GDD constrains what the experience becomes, not how you build it.

## Agent skills

### Issue tracker

Issues and specs are tracked in GitHub Issues using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage uses the five default canonical labels. See `docs/agents/triage-labels.md`.

### Domain docs

Domain documentation uses the single-context layout. See `docs/agents/domain.md`.
