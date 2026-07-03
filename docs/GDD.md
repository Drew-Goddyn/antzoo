# ANTZOO — Game Design Document

**Status: the working vision.** This document supersedes `docs/roadmap.md` as the project's direction. The fleet program (`docs/fleet/FLEET.md`) and plan-goal bundles are parked as historical infrastructure — good machinery, in a drawer, available if a design question ever genuinely needs statistics again.

**How this document works:** Drew owns the fantasy and judges by watching. Coding agents own the implementation and are expected to plan their own build sequences inside each milestone. Milestones are contracts on *what the experience becomes*, never on *how it is built* or *when*. There are deliberately no dates anywhere in this document.

---

## 1. The Fantasy

**Antzoo is the feeling of lifting a rock and finding a civilization.**

A living terrarium with stakes. You are a minor god over a glass box: two ant empires live, forage, war, starve, remember, and die inside it across seasons and years. Mostly you watch, because watching is rewarding. Sometimes you reach in — and when you do, your finger has weight.

Version 1 is a diorama that plays itself: charming, but nothing on screen opposes anything, nobody on screen is anybody, and the god is optional. Version 2 is measured by a single number that no analytics can capture: **how long you watch before remembering you meant to do something else.** Ten-x better means ten-x longer.

## 2. Pillars

Every design decision, by any agent, filters through these five. When a choice is ambiguous, the pillar decides.

1. **Alive at a glance.** A stranger watching 30 seconds of the running game should see that things are *happening to someone*: trails blooming, raids flaring, a colony recovering. When in doubt, choose the option a spectator would notice.
2. **The world has an antagonist.** Drama is opposition. The rival colony is a character, not scenery. When in doubt, choose the option that makes the enemy more present.
3. **Every ant is somebody.** The sim already tracks per-ant identity, age, deliveries, and cause of death. Surface it. A death should be a small story, not a decrement. When in doubt, choose the option that names an individual.
4. **The god's hand has weight.** Interventions should feel powerful, look spectacular, and matter. When in doubt, choose the option that makes touching the world feel better than reading about it.
5. **Determinism is a toy, not just a test.** Same seed, same world — that's not only a debugging guarantee, it's a product feature: shareable worlds, replayable histories, "you have to see what happens at tick 20k on seed 4471." When in doubt, choose the option that turns reproducibility into wonder.

**The standing law beneath all five: the screen pays rent.** Work that a spectator cannot see or feel within 60 seconds of pressing play does not merge, with the sole exception of the seatbelt (§6) and performance work in service of a milestone.

## 3. What exists today (honest inventory)

Agents: trust this section; it was verified by audit against the code. Re-verify only what you depend on.

**Genuinely implemented and coupled** (`src/sim.ts`, ~2,760 lines, deterministic, one LCG via `nextRand`):
- Two full symmetric colonies: per-faction pheromone fields, castes (worker/soldier/nurse with real behavioral differences), brood + nurse egg-work, queen hunger → terminal cascade → game over, faction combat, spider predator with HP, carcasses with spoilage, berry bushes with seasonal regrowth, rain → moisture grid → local evaporation and trail-washing, four seasons modulating drain/speed/regrowth.
- A playable browser shell (`src/App.tsx`): tools (food, lure, boulder, dig, wash, carcass drop), 13 live tuning sliders, speed control, HUD panels, victory/defeat screens, toasts, minimap.
- Real rendering polish (`src/render.ts`): particle pool, per-caste/faction tints, seasonal palette, rain overlay, camera trauma, nest pulse.
- The seatbelt (§6): state hash, determinism tests, headless CLI (`scripts/run.ts`), scenario system (identical CLI/browser semantics, `?scenario=` URL param), event log with death-cause obituaries, per-ant identity, decision traces, `window.__antzoo` bridge.

**Known hollows** (verified — these are where v2's leverage lives):
- **The rival lives in a food desert.** All food clusters, scatter regions, and bushes generate relative to the *player's* nest (`sim.ts` ~855–902, ~969–990); the rival sits in a corner (`~1269`) on a scripted food drip (`~2073`) and its foragers spawn aimed at the player's nest (`~1126`). Median rival deliveries: zero. The "rivalry" is theater.
- **The god is optional.** Unattended baseline wins ~78%; measured interventions were indistinguishable from blind placebo. There is currently no skill gradient.
- **The spider is noise.** A predator that almost never matters to outcomes.
- **No sound of any kind.**
- **No nest interior.** The nest is a point with scalar state (brood progress, food, queen hunger).
- **No onboarding.** The first minute teaches nothing.
- **Win/lose is a race against self-collapse**, not a contest.

## 4. The Systems Catalog

Each system is a module Drew can break off and go deep on. Each has a **depth ladder** — ship stage A before considering stage B; a stage is only deepened if the previous one created pull. "Design space" marks where agents have explicit creative freedom.

### S1 — The War *(the rival as a living empire)*
- **Fantasy:** two civilizations expanding toward each other; contested ground; raids; front lines you can read from orbit.
- **Today:** hollow (food desert, drip-fed, invisible trails at 0.72 alpha).
- **Ladder:** **A.** Rival gets its own food geography (mirror generation around its nest), drip cut to founding subsidy, spawn headings fixed; rival trails rendered at full hostile-palette visibility; skirmish FX; war toasts; a staged `war-demo` scenario. **B.** Territorial behavior: patrol borders, raiding parties targeting player food stores/carcasses, visible war tides. **C.** Rival personality: aggression that responds to player strength; multiple rival archetypes per seed.
- **Design space:** everything about how the war *looks and escalates*. The only contract: both empires visibly forage and clash on screen at default settings.

### S2 — The Chronicle *(every ant is somebody)*
- **Fantasy:** "Your eldest forager died today: 47 deliveries, 3 winters, killed by the spider she'd escaped twice."
- **Today:** all the data exists (per-ant id, birth tick, deliveries, distance, mode history, death cause) — displayed nowhere.
- **Ladder:** **A.** Notable-ant surfacing: HUD chronicle feed of births, elder deaths, first deliveries, heroics; end-of-game colony history screen built from real obituaries. **B.** Named ants with followable camera; a "hall of the dead" per run. **C.** Dynasties and lineages across brood generations.
- **Design space:** the voice and selection of what's notable. Keep it dry — the data is moving on its own; sentimentality would cheapen it.

### S3 — The God Hand *(interventions with weight)*
- **Fantasy:** reaching into the terrarium feels mighty: food falls like a meteor gift; a lure sings; a flood is an act of wrath.
- **Today:** tools are functional clicks with modest FX.
- **Ladder:** **A.** Juice every existing tool: impact FX, sound, screen response, ant reaction visible within seconds. **B.** One new dramatic power with cost and cooldown (e.g., summoned rainstorm, lightning strike, blessing on a trail). **C.** A god economy — power fueled by the colony's flourishing (deliveries, hatchings) so intervention capacity grows out of stewardship. This is the design lever most likely to create a real game loop; treat it as a serious candidate, not decoration.
- **Design space:** the power set, the costs, the theology. Contract: the hand must *feel* better than v1 within one use.

### S4 — The Theater *(weather and seasons as spectacle)*
- **Fantasy:** winter as a held breath; a storm as an event you gather to watch; a flood that rewrites the map's trails.
- **Today:** seasons and rain are mechanically real but visually quiet.
- **Ladder:** **A.** Dramatize what exists — season transitions as moments, rain as weather rather than texture, carcass arrival as an event. **B.** Floods: reuse the moisture grid; heavy rain pools, washes trails and food, forces recovery arcs. **C.** Rare spectacular events (swarm years, aurora winters) as seed-specific "you have to see this" moments feeding S9.
- **Design space:** all of it, within one rule — disasters must be foreshadowed on screen before they land (fair drama, not dice).

### S5 — The Soundscape
- **Fantasy:** the terrarium hums. Colony health is audible before it's legible: forage-traffic patter, war snares, the queen's slowing heartbeat as starvation nears.
- **Today:** silence. This is the single cheapest feel-multiplier in the project.
- **Ladder:** **A.** Ambient bed + event sounds (delivery ticks, combat, rain, toasts) driven by existing events/counters. **B.** State-driven mix: the soundtrack *is* the HUD — terminal cascade should be audible dread. **C.** Generative music seeded per world (deterministic wonder, S9).
- **Seatbelt note:** audio is presentation; it must never consume gameplay RNG (§6).

### S6 — The Underground *(the SimAnt dream, staged honestly)*
- **Fantasy:** press against the glass and see *inside*: brood galleries, food stores, the queen herself, nurses at work.
- **Today:** the nest interior does not exist; brood/food/queen are scalars.
- **Ladder:** **A.** A cutaway nest view — a rendered interior *driven entirely by existing real state* (brood progress → visible eggs; nestFood → visible stores; queen hunger → her posture; terminal cascade → visible dying). Render-only; zero sim change; already emotionally large. **B.** Spatialize the interior: chambers as real places, nurses actually carrying eggs, interior as simulated space. This is a major sim change; attempt only if stage A creates strong pull. **C.** Digging/architecture as player expression.
- **Design space:** the entire look and metaphor of the interior. Stage A is explicitly allowed to be theatrical — a puppet show operated by true data.

### S7 — The Long Game *(beyond the race to collapse)*
- **Fantasy:** colonies that survive have histories: hard winters named and remembered, near-collapses, golden ages, a rival dynasty finally broken in year four.
- **Today:** one arc — someone starves first, usually within one to two years.
- **Ladder:** **A.** Victory/defeat rework: tiers and survival milestones instead of a single binary; the year counter made meaningful. **B.** Recovery and era arcs: multi-year rhythm where collapse-and-rebuild is a story, not an end. **C.** Migration, new queens, colony succession.
- **Dependency:** design after S1 lands — an antagonist changes what "long" means.

### S8 — The Ten Thousand *(scale as spectacle)*
- **Fantasy:** the original dream — thousands of ants, the screen dense with intent, superorganism behavior visible as weather.
- **Today:** peak populations ~350; headless ~770 ticks/sec at that scale; typed arrays and spatial hashing already in place.
- **Ladder:** **A.** Profile and lift the ceiling to ~2,000 ants at 60fps browser / fast headless without changing behavior (hash-parity work, agents' favorite kind). **B.** Tuning/design for genuinely larger colonies. **C.** Third and fourth colonies per map.
- **Contract:** scale work merges only when it *shows* — bigger must look grander, not just benchmark better.

### S9 — The Shareable World *(determinism as product)*
- **Fantasy:** "seed 4471, watch the western front at 4× — trust me." A daily colony everyone watches diverge under their own hands.
- **Today:** `?seed=` URL works; nothing invites sharing.
- **Ladder:** **A.** Shareable seed links with a framed "world card" (seed, year reached, epitaph from the chronicle). **B.** Daily seed ritual + replayable intervention recordings (scenario format already encodes stimuli — a replay *is* a scenario). **C.** A public gallery of notable worlds.
- **Dependency:** worth building only once S1/S2 make worlds worth sharing.

### S10 — The First Minute
- **Fantasy:** a newcomer understands what they're seeing, and cares, inside 60 seconds — no tutorial text walls, just legible drama and one irresistible button.
- **Today:** cold HUD, no guidance.
- **Ladder:** **A.** An opening beat (camera intro over the two nests, one prompted first intervention). **B.** Progressive HUD disclosure. **C.** A framed "keeper's manual" diegetic to the god fantasy.
- **Position:** last polish before showing strangers; pointless before the world itself is magnetic.

## 5. Experience Milestones

Ordered by dependency and heat, not time. Each is a contract on what Drew sees; agents decompose each into their own internal plan (research, architecture, sequencing — full freedom). **A milestone is accepted by the watch test: Drew opens the URLs in the demo note, watches, and says yes or no.** Ship stage A of the named systems; deeper stages only by pull.

- **M0 — The World at War** *(S1-A, plus S4-A skirmish/event FX as needed).* Watch test: within 60 seconds at 4×, two empires' trails visibly bloom from opposite corners in opposing palettes; within three sim-minutes there is a legible clash the spectator can point to. Includes the staged `war-demo` scenario.
- **M1 — Blood and Memory** *(S2-A, S3-A, S5-A).* Watch test: a death shows up as a story; a food drop feels like a meteor gift; closing your eyes, you can hear whether the colony is okay.
- **M2 — The Underground** *(S6-A).* Watch test: click the nest, see inside, and feel something when the brood galleries are full versus when the queen is starving.
- **M3 — The Long Game** *(S7-A/B, revisiting S1-B rival pressure).* Watch test: a full session tells a multi-year story with at least one named crisis survived.
- **M4 — The Ten Thousand** *(S8).* Watch test: the dense-colony demo makes you say "whoa" — not "the benchmark improved."
- **M5 — A World Worth Sharing** *(S9, S10).* Watch test: Drew sends one link to one person who owes him nothing, and they reply about something that happened *in the world*.

After every milestone: Drew watches, then decides — deepen a system that hooked him (break-off procedure, §7), proceed to the next milestone, or stop. Stopping after a landed milestone is a legitimate outcome, not a failure.

## 6. The Agent Charter (the seatbelt — the only process that survives v2)

This repo's determinism machinery exists so that agents can change the world aggressively without silently breaking it. Use it as a seatbelt, never as a deliverable.

1. **Never weaken a gate, test, or the hash.** New gameplay state on `World` must be added to `hashWorldState` (`src/debug/snapshot.ts`) and get a T0 sensitivity line (`scripts/test-debug.ts`). Fix code, not gates.
2. **RNG law.** All gameplay randomness through `nextRand(world)`. New *presentation* systems (visual FX, audio) must NOT consume gameplay RNG — use a separate presentation-only RNG. (Legacy caveat: existing particles draw `nextRand`; grandfathered, do not extend the pattern.)
3. **Green before merge:** `npm test`, `npm run typecheck`, `npm run build`.
4. **Demo determinism:** any demo scenario runs twice headless with identical final hashes; paste both summary lines in the PR description. This is the *entire* evidence requirement.
5. **Every milestone PR ships `DEMO.md`** (≤25 lines): URLs with seeds, the `?scenario=` demo link, three "watch for this" bullets, before/after screenshots at matched seed+tick.
6. **Forbidden:** fleet reports, findings docs, plan-goal bundles, progress ledgers, statistical validation sweeps, baseline re-anchoring, calendar estimates, and any new document other than `DEMO.md` and updates to this GDD's inventory section when the ground truth changes.
7. **Historical docs** (`docs/fleet/`, `docs/plan-goals/`, `docs/roadmap.md`) are read-only context. Their baseline numbers are stale by design the moment `src/sim.ts` changes; one line in the PR description ("baselines stale by design") settles the debt.
8. **Agents are expected to exercise judgment:** research prior art, propose mechanics, write their own internal multi-step plans, and surprise on quality. The GDD constrains what the experience must become, not how.

## 7. Drew's Role

- **The watch test:** open the demo URLs, watch for a few minutes, play if pulled. Verdict is yes/no plus at most three sentences of taste notes. No reports.
- **The break-off procedure:** when a system hooks you, write a one-page module brief — *the fantasy in two sentences; what stage it's at; what "deeper" would feel like; what must not be lost* — and hand it to an agent as its own goal. That's the entire ceremony.
- **The taste gate is non-delegable:** no player-facing change merges without your yes. Charm outranks any metric.

## 8. Not Now / Maybe Never

- **Networked multiplayer** — breaks the determinism model and the scope. Revisit only if Antzoo has an audience.
- **ML-driven ants, 3D** — different projects.
- **Claims about real ants** — Antzoo facts are Antzoo facts. Always.
- **Resurrecting the fleet statistics program** — only if a specific design question (e.g., "is the war balanced enough to ship as default?") genuinely demands it, and then as a single bounded dispatch, never as an era.

---

*Appendix — module brief template (for break-offs):*

```
MODULE: <name>            SYSTEM: S<n>, stage <A/B/C>
FANTASY (2 sentences):
CURRENT STATE (1 paragraph, honest):
WHAT DEEPER FEELS LIKE (3 bullets, all visible/audible/playable):
MUST NOT LOSE (charm/behavior to preserve):
SEATBELT NOTES (new state → hash? new RNG? perf budget?):
WATCH TEST (how Drew will judge it):
```
