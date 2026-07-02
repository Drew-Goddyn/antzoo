# 0. Executive answer

**Diagnosis:** Antzoo has finished proving it can be trusted; it has not yet proven it can be improved — it is an unusually sound instrument wrapped around a frozen, charming toy, and the frozen part is now the risk.

**Highest-leverage move:** Run the first *authorized tuning wave* whose target is player agency — make the unattended game contested and the attended game winnable — using the drain/caste/founding findings as levers, gated by the same hash discipline that built the instrument.

**Biggest danger:** Wave 3 becomes another mapping wave. The program's own momentum (dispatch templates, report schemas, synthesis procedures) is optimized for measurement; left alone it will keep measuring.

**First thing to ask agents to do:** The housekeeping build dispatch in §11.1 — re-anchor the 120-seed baseline on post-fix code and close the W1-Z1 paperwork gap. Every subsequent wave compares against that number; it must be true before anything else runs.

---

# 1. Thesis and anti-thesis

**Thesis.** Antzoo's deep bet is that *emergence and accountability are compatible*. Almost every artificial-life project forces a choice: alive but anecdotal, or rigorous but dead. Antzoo's verified core property — one deterministic world, bit-identical between the browser you play and the CLI an agent batch-runs (audit: seed 1337, hash `632028e9736dd465` at tick 5000 on both surfaces) — collapses that choice. That property makes it, in ascending order of ambition:

- **A game** whose balance decisions are evidence-backed rather than vibes-backed — rare even in professional studios.
- **An artificial ecology** where "why did the colony die" reduces to obituaries, traces, and `(seed, config, tick, observable)` — causality you can subpoena.
- **An AI-assisted development environment** where autonomous workers demonstrably produced checkable knowledge, fabricated once, got caught by the verbatim-evidence rule (W0-A-replicate), and the process metabolized it.
- **An agent benchmark**: a rich, opaque, deterministic world with a machine-legible sensorium is precisely what "can agents do science / can agents play skillfully" evaluations lack.
- **A methodology exemplar**: the debug-surface pattern (domain-complete hash, parity gates, stimulus-only scenarios, fabrication-resistant reporting) is portable to any simulation. That write-up may outlive the ants.

**Anti-thesis — what Antzoo must not become:**

- A **museum**: ever-finer error bars on a world nobody changes. Three waves produced one 5-line code change; that ratio must invert.
- A **reporting factory**: the 48k-token W0-A-replicate report is a warning. Evidence discipline must not mean evidence *mass*.
- A **metrics game**: if win rate becomes the point, the trails, the trough drama, and the queen's 60-second countdown die of optimization.
- A **fake science project**: findings are facts about *this toy's* ecology, never claims about ants. The repo has been honest about this; keep it so.

Working doctrine in one line: *the fleet exists to make the world more alive and more knowable; any fleet activity that does neither is overhead.*

---

# 2. The knowledge-spending transformation

**Definitions:**

| Category | Definition | Test |
|---|---|---|
| Knowledge accumulation | A finding that changes what we believe | Ends in a findings doc |
| Game improvement | A change that makes play better | Ends in a merged diff to sim/tuning/UI |
| **Evidence-backed intervention** | A change *caused by* a finding, *validated by* the instrument, *judged by* a human playing it | Ends in a diff + before/after evidence + a human "yes, better" |
| Paperwork disguised as rigor | Process output whose absence would change nothing | Delete it; did anything break? |

**What kind of knowledge should change the game:** findings that identify *play pathologies* — outcomes decided by invisible dice, phases where the player is irrelevant, mechanics that exist but never matter. The corpus already contains three: the rival colony is structurally broken (median starvation deliveries 0, final population median 0 — the "rivalry" is mostly theater); the spider is mortality noise (a predator that never matters); and the unattended baseline wins 78% — *a god game where the god is optional*.

**What counts as spending:** a tuning or code change traceable to a specific finding, shipped through gates (determinism tests green, before/after evidence on held-out seeds, human visual sign-off), that a player could feel.

**What doesn't count:** re-measuring at larger n; refactoring the instrument; new observables with no consumer; findings promoted into FLEET.md that no wave acts on within two waves.

**Proof the apparatus pays rent:** one merged change where the commit message cites the finding, the PR carries held-out-seed evidence, and the devlog shows the before/after in play. Repeatably.

**Smallest honest loop-closer:** the agency wave in §4 — one tuning key moved, one scripted-rescue scenario, one held-out validation, one evening of Drew actually playing both versions.

---

# 3. Grounded roadmap

| Horizon | Core question | Main artifact | Measure | Playable/visible | Fleet does | Human decides | Success | Warning sign |
|---|---|---|---|---|---|---|---|---|
| **48 h** | Is our baseline true on current code? | Re-anchored 120-seed baseline; W1-Z1 gates recorded; FLEET.md/DEBUG.md corrected | Post-fix win/collapse/running counts; per-seed hashes | Nothing new | One build dispatch (§11.1) | Nothing | Baseline v2 in FLEET.md; zero "pending" lies | Rerun surprises beyond the 2 zombie seeds |
| **2 wks** | Does the god matter? | Wave 3: agency delta measured, first tuning change merged | Unattended vs scripted-rescue win rate, tuning + held-out seeds | Drew plays old vs new build, 3 runs each | Run §4 cells; regression-verify | "Is the new game better to play?" | Merged evidence-backed tuning diff | Wave 3 manifest drifts back to pure measurement |
| **6 wks** | Can an agent *play* it? Is the proof public? | Browser-legibility milestone 1 (§7); proof artifact (§9); rival-economy diagnosis (why deliveries=0 — trace probe) | Agent-play win rate vs unattended on held-out seeds; prediction calibration | Proof page with `npm run proof`; agent play-reports readable as stories | 2–3 trace cells on rival foraging; browser pilot | Whether agent narratives show understanding | Agent beats unattended baseline citing causes | Browser program spawns schema debates instead of play |
| **3 mo** | Can the rival be a real character? | Rival-viability intervention (code, not just tuning — likely first sim change since W1-Z1); tuning wave 2 | Contested-game share (both factions >0 pop at decision), rival deliveries median >0 | Rival trails visibly bloom; fights over carcasses | Design cells for rival forage fix; full T0–T5 + fresh baseline after | How competent the rival *should feel* | Games are contests, not races against self-collapse | Rival fix nukes win rate; baseline churn every week |
| **6 mo** | Is it a living product? | Public playable release with shareable seeds ("daily colony"); obituary/notable-ant surfacing in UI; ecology expansion #1 (§8: recovery arcs) | Session length, replays of shared seeds (if any telemetry — else qualitative); collapse predictability | Seed-sharing UI, in-game colony chronicle | Regression + curator roles (§6) | Aesthetic direction of UI/chronicle | Someone Drew doesn't know plays a shared seed | Shipping fear: instrument work always outranking play work |
| **1 yr** | Is it a benchmark? | Antzoo-bench v0: fixed harness, held-out seeds, "keep the colony alive" agent eval + methodology write-up | Agent score distribution vs scripted vs unattended | Replayable agent games (deterministic = perfectly replayable) | Run reference agents; contradiction-hunt the harness | What the benchmark rewards | External agent run reproduces bit-identically | Benchmark drifts from the game's real dynamics |
| **2–3 yr** | Does the pattern generalize? | "Instrumented emergence" doctrine doc + second ecology or major biome under the same debug surface | Cost to instrument the second system vs the first | Two worlds, one method | Fleet becomes a reusable harness, not Antzoo-specific | Which second world is worth loving | Second system reaches parity-gated status in <¼ the effort | Platform ambition strangles the actual game |
| **4–10 yr** | Directional only | A small family of legible living worlds; Antzoo as the reference artifact for agent-auditable simulation | — | The original colony still runs, still charming | — | Whether to keep going | It's still alive and still trusted | It's maintained but no longer played |

---

# 4. First knowledge-spending wave: **Wave 3 — "The God Matters"**

**Decision:** I am *not* choosing "collapse 20%→10%." Making the unattended game safer makes the player less necessary. The audit's sharpest play finding is that the baseline — measured with zero interventions — wins 78%. The right first target is the **agency delta**.

**Target metric:** `AgencyDelta = WinRate(scripted rescue protocol) − WinRate(unattended)`, both on held-out seeds. Ship a tuning change that yields **unattended 55–65%** and **scripted-rescue ≥85%**, with median `finalTick` within ±20% of baseline v2 and `running` outcomes ≤ baseline (zombie fix should hold this).

**Why it matters for play:** stakes require that neglect risks collapse and that intervention reliably averts it. The founding trough (fleet-documented, and visible live in my audit playthrough: pop 190→112, queen on countdown at tick ~11k) is already the natural crisis; the tools (food, lure) already work (my food drop doubled income 44→99/min). We are tuning the *distance between doom and rescue*, not adding anything.

**Rescue protocol (the scripted stand-in for a competent player):** a scenario timeline placing 2 food drops + 1 lure near the player nest during ticks 6,000–14,000 (the documented trough window), positions derived from nest coordinates. This is expressible today — the scenario executor supports `applyTool` at ticks with identical CLI/browser semantics (audit: `food-distance-probe` replay gate).

**Levers, ranked by evidence:**

1. **`rival.workerRatio` 60 → 75** — strongest evidence: W2-X2 (player 70/rival 80) dropped player wins to 5/12; W2-X4 (90/80) to 10/20. Strengthening the rival makes the world contested rather than making physics crueler. *Uncertain:* whether it also fixes rival-deliveries=0; the wave should report that observable explicitly.
2. **`ant.drainPerSec` 1.2 → 1.32 (1.1×)** — the drain response is non-linear and economically mediated (W1-D cells, W2-M1); a small raise pressures both factions. *Uncertain:* W1-D4's exact 1.1× result — the designer must pull it from `docs/fleet/findings/wave1.md` before choosing.
3. **Founding-support keys** (`spawn.cost` / `spawn.intervalSec`) — reserve as a compensator if lever 1/2 makes the trough unrecoverable even with rescue.

**Experiment design:**

- **Tuning seeds:** 3000–3049 (n=50, fresh; ranges 1337–1456 and 2000–2119 are burned by prior findings).
- **Held-out seeds:** 4000–4049, touched exactly once, by the final candidate config only.
- Cells of ≤20 seeds (existing ceiling), 2 conditions each (unattended, rescue), candidate configs = 3–4 combinations of levers 1–2.
- Every cell reports per-seed final hashes; synthesis replicates one random seed per report (existing procedure — keep it).

**Acceptance criteria:** target bands hit on held-out seeds; `npm test` green; per-config replication `hashesAllMatch: true`; median finalTick within ±20%; rival final-population median > 0 in unattended runs (contested-world check); Drew's visual sign-off (below).

**Failure criteria (declare honestly, don't iterate silently):** no config hits both bands; or held-out results deviate >15 points from tuning-seed results (overfitting signal); or rescue protocol becomes the *only* path to victory (unattended <40% = punishing, not dramatic).

**Anti-overfitting:** the train/held-out split above; never re-run held-out seeds with variant configs; if a second candidate needs validation, mint seeds 4050–4099.

**Determinism gates:** tuning-only changes leave `src/sim.ts` untouched; hashes change *by design* (hash domain includes tuning — never compare across configs, per FLEET.md's own rule); the gates are same-config replication + full `npm test` + baseline v2 unchanged for default config.

**Deciding "actually better":** three sessions each on old and new builds at mixed speeds — one where you intervene well, one where you deliberately neglect, one where you rescue at the last second. The new build wins if neglect *feels* like dawning dread rather than a coin flip, and rescue *feels* earned.

**Inspect visually before accepting:** the trough must still read as drama (population fall + queen countdown visible); trails must still bloom to food drops; the strengthened rival's trails must be visibly busier (this is the aliveness dividend of lever 1); losses must be foreshadowed on the HUD (brood bank, nest food) at least ~30 sim-seconds out.

---

# 5. Doctrine for game-feel and aliveness

| Judged by | What |
|---|---|
| **Tests** | Determinism, hash domain, trace/sampling purity, death accounting, ID uniqueness — everything already in T0–T5. Never game feel. |
| **Statistics** | Win/collapse/contested rates, agency delta, mortality composition, game length, predictability of collapse from visible signals. |
| **Watching** | Trail formation, trough drama, rival activity, seasonal texture, whether the minimap tells a story at a glance. |
| **Playing** | Tool responsiveness, whether interventions feel causal, pacing across a year, the emotional beat of the queen countdown. |
| **Human taste** | Whether it's *charming*. Color, motion, sound (someday), what the game is about. Final accept/reject on every player-facing change. |
| **Agents, with guardrails** | Screenshot-based observation reports ("describe what the colony is doing and why") cross-checked against snapshots — useful as regression sensors for legibility, never as arbiters of fun. |

**Never fully delegated:** accepting a player-facing change; defining what "better" means for a wave; naming/aesthetics; anything that trades charm for a metric.

**Recurring artifacts:** per-wave, one "before/after" pair of annotated screenshots + one 3-run play note from Drew (10 minutes, not a report); per-release, a devlog entry built from obituaries and event logs — the instrument already generates the raw story (ages, deliveries, causes of death).

**Keeping the toy alive while measurable:** the rule that has already worked — instrumentation is hash-excluded and additive — extends to gameplay changes: every new mechanic ships with its observables *in the same PR*, so measurability never lags aliveness.

**Preventing metric-death of charm:** every wave's acceptance criteria must include at least one *non-target guard* (game length, contestedness, drama visibility) plus the human sign-off. A wave that hits its number and fails taste is a failed wave, recorded as such.

---

# 6. Fleet redesign for the post-measurement era

| Role | Verdict | Does | Must produce | Bureaucracy risk |
|---|---|---|---|---|
| Baseline auditor | **Keep, shrink** | Re-anchor baseline only after sim-code changes; nothing periodic | Per-seed hash+outcome table vs prior baseline, diff-only reading | Scheduled audits of an unchanged sim — forbid |
| Tuning worker | **Add (new centerpiece)** | Runs candidate configs from an authorized wave design; never invents configs | Per-seed table (seed, outcome, finalTick, finalHash, 2–3 wave metrics) + artifact files | Config drift (W2-R1's failure mode) — dispatch must enumerate every key |
| Visual/play observer | **Add, small** | Plays/watches specific builds in-browser via bridge + screenshots; answers "what does the colony appear to be doing?" | Narrative with (tick, screenshot, snapshot-field) triples | Purple prose; cap at 1 page |
| Regression verifier | **Keep** | Replication spot-check (one random seed per accepted report) + `npm test` on every build PR | Hash match table | None — this is the cheapest trust anchor; never cut it |
| Report synthesizer | **Keep, once per wave** | Findings doc: accept/reject, killed hypotheses, promotion to FLEET.md | Acceptance table + replication table (current format is good) | Synthesis of syntheses — one layer only |
| Contradiction hunter | **Keep, on demand** | Chases anomalies the synthesis names (e.g., terrain-paradox seeds 2028/2038; the two same-depth-87 opposite outcomes) | Trace-level causal account per anomaly | Open-ended fishing — only dispatched against named anomalies |
| Browser-legibility tester | **Add (§7)** | Plays full games through `window.__antzoo` under a tool budget | Play log + predictions + outcome vs unattended | Becoming a second report factory — one schema, one page |
| Artifact curator | **Modify → automate** | Not a role; a script. Validates report schema, checks artifact hashes, updates indices | CI output | A human-shaped curator is pure overhead — don't create one |

**Report format v2** (kills the JSONL-in-Markdown problem while keeping the fabrication tripwire):

- Report = ≤2 pages: command, config (key + default + new value), seeds/n, **per-seed table** (seed, outcome, finalTick, finalHash, wave metrics), reading, verdict, confidence.
- Raw JSONL → gzipped files in `docs/fleet/artifacts/<cell>/`, with SHA-256 of each file listed in the report.
- The tripwire *was never really the verbatim text* — it's that **hashes can't be invented**: the per-seed finalHash column plus the mandatory replication spot-check catches fabrication exactly as W0-A-replicate's would have been caught. Text volume was incidental; drop it.
- One `cross_seed_rollup` line may stay verbatim (it's small).

---

# 7. Browser-legibility program

**Question:** can an agent *play* Antzoo — perceive, predict, intervene, explain — rather than batch-run it?

**Milestone 1 (small, testable): "One Colony, One Shepherd."** An agent connects to the dev server at `?seed=<S>&paused=1`, and must shepherd the colony to victory using only:

- **Tools:** `getSnapshot()`, `getEvents()`, `step(n)` in ≤1,200-tick chunks (audit: 5,000 ticks ≈ 8.4s in-browser — chunks keep turns responsive), `applyTool` under a budget of **5 food + 2 lures + 1 boulder**, and screenshots. No `patchTuning`, no `resetWorld`, no reading `src/`.
- **Prediction discipline:** before each `step`, the agent writes one falsifiable prediction ("player population will fall below 120 by tick 12,000 because brood bank is X and nearest food is Y"). Predictions are scored after the run — *this* is the anti-scraping mechanism. A metric scraper can read numbers; only a world-model can bet on them.
- **Report:** one page — interventions with (tick, x, y, why), prediction ledger with hit/miss, causal narrative of the run's turning point, final outcome + hash (replayable: same seed + same intervention ticks = same game, verifiable by re-execution).

**Proof of understanding:** on 10 held-out seeds, agent-shepherded win rate exceeds the unattended baseline *and* prediction accuracy beats a naive persistence baseline *and* a spot-replay of one game reproduces its hash.

**What only the browser teaches:** whether the *rendered* world carries the information — can the agent detect the trough from what a player sees (screenshots + HUD) before confirming in the snapshot? Run a variant where snapshot access is restricted to what the HUD shows. That variant is the real legibility test of the game qua game.

**Anti-paperwork:** one report schema, one page, no synthesis layer until ≥10 runs exist; the deliverable is the *replayable game*, not the document.

---

# 8. Alive-ecology expansion map

Sequencing principle: **deepen what the evidence says is hollow before adding anything new.** Two systems are demonstrably hollow today: the rival (deliveries=0) and the predator (mortality noise).

| Expansion | Aliveness payoff | New observables needed | Risk | When |
|---|---|---|---|---|
| **Rival behavior depth** (fix foraging; modest adaptive pressure) | The other colony becomes a character; games become contests | Rival delivery/trail metrics already exist — that's why we know it's broken | Balance upheaval; needs fresh baseline after | **Soon** (3-mo horizon) |
| **Recovery arcs / brood-bank legibility** (surface trough, brood reserve, recovery slope in HUD) | Players *see* doom coming and rescue landing; converts W1-F1/W2-F2 findings into UI | None — snapshot already has them | Low; UI-only | **Soon** (with Wave 3) |
| **Obituary/chronicle surfacing** ("your eldest forager died: 47 deliveries, 3 winters") | Cheapest emotional depth in the codebase; the data already exists per-ant | None | Sentimentality kitsch — keep it dry | **Soon** |
| **Predator rework** (spider matters seasonally, or hunts trails) | A predator that never kills isn't a predator | Spider-encounter and avoidance events | Adding danger without counterplay | **Later** — after rival, because two threat reworks at once confounds everything |
| **Disasters: floods** (reuse existing rain/moisture grid to wash trails/food) | Seasons gain teeth; recovery arcs get a trigger | Flood-extent field summary, per-flood event | Feels random/unfair without foreshadowing | **Later** |
| **Terrain depth** (pathing chokepoints, richer food geography) | Would make terrain luck *legible* rather than statistical | Path-obstruction observables — findings already say nearest-distance is too weak | Building observables is a prerequisite, not a follow-up | **Later**, observables first |
| **Colony roles depth** (nurses/soldiers earn their keep) | Caste panel becomes strategy, not slider | Per-caste contribution counters | Complexity for the 2×2 findings to become 3-axis mud | **Much later** |
| **Multi-objective survival** (seasons goals, migration) | Long-arc narrative | Whole new outcome taxonomy | Dilutes the crisp win/collapse frame that makes findings possible | **Much later** |
| **Third colony / multiplayer / ML-driven ants / 3D** | — | — | Breaks determinism, legibility, or scope | **Never** (this decade) |

---

# 9. Proof artifact

**Name:** `docs/proof/RECEIPTS.md`, linked from a README section titled **"Why you can trust this repo's claims."**

**Audience:** future Drew, future agents, and skeptical outsiders (researchers, tool-builders) in that order.

**Contents:** (1) the **W1-Z1 story** — worker finds zombie state at seed 1401, diagnoses the exact nested `terminalTimer > 0` condition by reading, 5-line gated fix, before/after termination evidence; (2) the **W0-A-replicate catch** — the fabricated round-number seed summaries shown side-by-side with real ones, and the rejection record; (3) the **replication chain** — worker VM, operator spot-check, and independent audit all producing `1607b728381ea540` for W2-X3 seed 2109.

**Format: hybrid, with a live component.** The doc is short (≤3 pages); the teeth are **`npm run proof`** — a small script that re-runs seed 1337 (asserts hash `5101d7c52c007c01`), seed 1401 (asserts termination, the fix's living witness), and one fleet-report replication, printing PASS lines. A proof that re-executes on the reader's machine is categorically stronger than any prose; it makes the artifact self-canonicalizing — anyone who doubts it runs it.

---

# 10. Constitution and danger map

**Laws (non-negotiable):**

1. If a gate fails, fix the code — never the gate, the test, or the hash.
2. Every behavioral claim reduces to `(seed, config, tick, observable)`; hashes identify `(state, config)` and are never compared across configs.
3. Results are never synthesized, estimated, or extrapolated. BLOCKED-with-honest-partial is success; fabrication is the only unforgivable defect.
4. Instrumentation is additive, hash-excluded, RNG-free. The browser and headless remain one world.
5. The fleet measures and proposes; it tunes only under written authorization with named gates.
6. Any sim-code change triggers baseline re-anchoring before the next wave.
7. Tuning seeds and held-out seeds never mix; burned ranges are recorded.
8. Every player-facing change requires human play sign-off. Taste does not delegate.
9. Worker confusion is a doc defect; fix the packet, never coach the worker.
10. A finding unspent after two waves is flagged: act on it or archive it.

**Graduation ladder:** *knowledge → code*: finding named in an authorized wave design with gates. *Code → play*: gates pass on held-out seeds + human sign-off + devlog before/after. *Play → doctrine*: what playing taught gets one paragraph in FLEET.md's doctrine section, so the next wave's "better" is informed by the last wave's feel.

**Danger map:**

| Failure mode | Warning sign | Countermeasure | Earliest cheap signal |
|---|---|---|---|
| Museum of frozen-toy facts | A wave manifest with no intervention cell | Law 10; every wave needs ≥1 spending cell | Wave design doc lacks a diff target |
| Paperwork explosion | Reports >2 pages; new report layers | Format v2; artifact files; page cap | A report you don't finish reading |
| Stale baselines | Comparisons cite pre-change numbers | Law 6; baseline version stamped in every report | Two baseline versions cited in one doc |
| Seed overfitting | Held-out results diverge >15 pts from tuning results | Train/held-out discipline; fresh mint per candidate | Same seed range in two tuning waves |
| Metric over feel | A change hits targets but Drew doesn't enjoy it | Human sign-off is an acceptance gate, recorded | You dread the play session |
| Losing charm | Screenshots stop being pretty; FX sacrificed for throughput | FX stays in-loop (it already shares the RNG stream — can't be silently cut anyway) | Before/after screenshots look worse |
| Illegible complexity | New mechanic ships without observables | Same-PR observable rule (§5) | A "why did that happen?" with no queryable answer |
| Toy science → real science claims | "Ants do X" phrasing | Law: findings are Antzoo-facts; wording audit at synthesis | The word "ants" without "Antzoo's" |
| Fleet as the product | More effort on FLEET.md than on sim.ts in a month | Ratio check at each synthesis: lines of process vs lines of game | A wave about the fleet itself |
| Human disengagement | Drew merges reports unread; play sessions skipped | Shrink operator load (format v2, automation); keep play sign-off mandatory and *short* | You can't recall the last time you played |

---

# 11. Next dispatches

**Dispatch 1 — Housekeeping build (send first, alone):**

> Read docs/fleet/FLEET.md and docs/debug-surface/DEBUG.md in full. Build dispatch, authorized. Objective: close the W1-Z1 record and re-anchor the baseline on post-fix code. (1) Run seeds 1337–1456, 50k ticks, baseline config; produce per-seed outcome+finalHash table. Confirm outcome changes only on previously-running seeds (1401 and one other); flag any other diff prominently. (2) Record all three W1-Z1 fix gates with verbatim outputs in docs/fleet/findings/w1z1-fix-gates.md. (3) Update FLEET.md: replace the stale "AUTHORIZED pending" line with the fix record; replace the Established-baseline counts with the post-fix numbers, labeled "baseline v2 (post-W1-Z1-fix)". (4) Add a DEBUG.md caveat: Math.sin/cos/pow are not IEEE-pinned across JS engines; determinism is verified on V8 (Node/Chrome) only. Constraints: no src/ changes; `npm test` must pass. Deliverable: one PR. Evidence: per-seed tables, verbatim gate outputs. Stop when the PR is open or write a BLOCKED report with honest partials.

**Dispatch 2 — Report format v2 + wave-3 manifest:**

> Read docs/fleet/FLEET.md. Objective: amend FLEET.md for the spending era. (1) Replace the report schema with format v2: ≤2-page reports containing command, config (key/default/new), seeds/n, a per-seed table (seed, outcome, finalTick, finalHash, wave metrics), reading, verdict; raw JSONL committed gzipped under docs/fleet/artifacts/<cell>/ with SHA-256 listed in the report; one verbatim cross_seed_rollup line permitted. Keep the replication spot-check unchanged. (2) Add a "Wave 3 — The God Matters" manifest section from the attached design [paste §4]: rescue-protocol scenario spec, cells for unattended vs rescue at candidate configs (rival.workerRatio 75; ant.drainPerSec 1.32; combined), tuning seeds 3000–3049, held-out 4000–4049 reserved and marked do-not-touch. (3) Record burned seed ranges (1337–1456, 2000–2119). Constraints: docs only; preserve all existing laws verbatim. Deliverable: one PR. Stop when open.

**Dispatch 3 — Rescue scenario + pilot cells:**

> Read FLEET.md (Wave 3 manifest) and DEBUG.md. Objective: build the rescue-protocol scenario and pilot the agency delta. (1) Add scenarios/rescue-protocol.json: 2 food drops + 1 lure near the player nest during ticks 6000–14000, positions computed from nest coordinates recorded in the report; stimulus only, no assertions. (2) Verify replay determinism: two runs, identical hash series (T4 style). (3) Pilot n=10 (seeds 3000–3009): unattended vs rescue at baseline config; report both win rates, per-seed table per format v2, and W1-D4's 1.1× drain result quoted from docs/fleet/findings/wave1.md. Constraints: no src/ or tuning changes; scenario file plus report only; npm test green. Deliverable: one PR (scenario + report). Evidence: per-seed hashes, replay parity output. Stop when open or BLOCKED with honest partials.

**Dispatch 4 — Browser-legibility milestone 1 spec:**

> Read DEBUG.md (browser bridge section) and FLEET.md. Objective: write docs/fleet/browser/MILESTONE-1.md, the "One Colony, One Shepherd" protocol. Specify: agent connects at ?seed=<S>&paused=1; allowed tools exactly getSnapshot, getEvents, step (≤1200-tick chunks), applyTool with budget 5 food/2 lure/1 boulder, screenshots; forbidden: patchTuning, resetWorld, reading src/. Define the prediction ledger (one falsifiable prediction before each step, scored post-run), the one-page report schema (interventions with tick/x/y/why, prediction hits/misses, causal narrative, final outcome+hash), and the success bar: on 10 held-out seeds, shepherded win rate > unattended baseline v2, prediction accuracy > persistence baseline, one game re-executed to an identical hash. Include one worked example transcript skeleton. Constraints: docs only; no new code; must be executable by an agent with no other context than this file plus DEBUG.md. Deliverable: one PR. Stop when open.

**Dispatch 5 — Proof artifact:**

> Read docs/debug-surface/AUDIT.md, docs/fleet/findings/wave0.md, wave1.md, wave2.md, and docs/fleet/reports/wave0/W0-A-replicate.md. Objective: build the canonical proof artifact. (1) Write docs/proof/RECEIPTS.md (≤3 pages): the W1-Z1 zombie story (discovery, diagnosis, 5-line gated fix, before/after termination), the W0-A-replicate fabrication catch (show the round-number fabricated seed summaries beside real ones, and the rejection record), and the replication chain for W2-X3 seed 2109 hash 1607b728381ea540. Every claim cites its source file. (2) Add scripts/proof.ts + `npm run proof`: re-runs seed 1337 asserting final hash 5101d7c52c007c01 at tick 33235, seed 1401 asserting termination before 60k ticks, and the W2-X3 replication asserting its hash; prints PASS/FAIL lines. (3) Add a README section "Why you can trust this repo's claims" linking both. Constraints: no src/ changes; npm test green; proof script must pass locally with verbatim output in the PR. Deliverable: one PR. Stop when open.

---

# 12. Plan-goal execution layer

The roadmap is now paired with portable in-repo plan-goal bundles under `docs/plan-goals/`. These are operator artifacts, not simulation behavior. Each bundle contains:

- `PLAN.md`: durable source of truth for a future long-running builder.
- `LAUNCHER.txt`: pasteable `/goal` launcher kept intentionally short.
- `progress.jsonl`: append-only execution ledger.
- `evidence/` and `notes/`: durable proof and scratch locations.

Start at `docs/plan-goals/README.md`, then run the bundles in this order unless Drew explicitly changes priority:

| Order | Bundle | Purpose |
|---:|---|---|
| 1 | `docs/plan-goals/01-baseline-v2/PLAN.md` | Close the W1-Z1 paperwork gap and publish baseline v2. |
| 2 | `docs/plan-goals/02-fleet-spending-era/PLAN.md` | Move FLEET.md to report v2 and authorize Wave 3. |
| 3 | `docs/plan-goals/03-wave3-agency-delta/PLAN.md` | Ship the first knowledge-spending tuning intervention. |
| 4 | `docs/plan-goals/04-browser-shepherd/PLAN.md` | Prove browser-legible agent play. |
| 5 | `docs/plan-goals/05-proof-receipts/PLAN.md` | Build the public proof doc and `npm run proof`. |
| 6 | `docs/plan-goals/06-rival-viability/PLAN.md` | Diagnose and fix the hollow rival colony. |
| 7 | `docs/plan-goals/07-living-product/PLAN.md` | Ship a small player-facing product slice. |
| 8 | `docs/plan-goals/08-antzoo-bench/PLAN.md` | Package Antzoo-bench v0. |

Hard gates:

- Baseline v2 is first. Later goals may do preparatory docs work before it, but they must not compare against stale pre-fix baseline numbers as current truth.
- Report format v2 is required before dispatching new fleet experiment cells.
- A child dispatch that stops at "PR open" does not complete the parent plan-goal. Dependent work should wait for the required artifact to land on the current branch, unless Drew explicitly approves continuing from an unmerged branch or commit.
- Candidate tuning should run through scenario/CLI patching first. Default tuning values change only after held-out validation and human play sign-off.
- Held-out seeds `4000-4049` are touched exactly once by the final Wave 3 candidate. If a second final candidate is explicitly authorized, mint `4050-4099` instead of retuning against the first held-out range.

---

# 13. Portable memory capsule

> **ANTZOO CONTEXT CAPSULE (post-audit, post-planning, 2026-07)**
>
> **What it is:** A deterministic ant-colony god game (Vite/React/PixiJS; sim core `src/sim.ts` ~2.7k lines, Node-runnable, single LCG) with a verified debug surface: domain-complete state hash (`src/debug/snapshot.ts`), headless CLI (`scripts/run.ts`), scenario executor, event log with death-cause obituaries, decision traces, `window.__antzoo` browser bridge. Fleet program (`docs/fleet/FLEET.md`): autonomous workers run headless experiments, one-file reports, per-wave synthesis, replication spot-checks.
>
> **Verified (independent audit, 2026-07-01):** same-seed determinism (seed 1337 → `5101d7c52c007c01` @ tick 33235, twice); browser==headless bit-parity (`632028e9736dd465` @ 5000); cross-machine fleet replication (W2-X3 seed 2109 → `1607b728381ea540`, worker VM + audit match); full test gate green (T0 per-category hash sensitivity through T5 trace purity); game playable and charming (trails, seasons, castes, queen countdown; food drop doubled income live). Fleet epistemics real: W0-A-replicate fabrication (round-number seed summaries) caught and rejected; W2-R1 rejected for wrong config; hypotheses killed (founding-depth threshold, worker-gap-only caste rule). One code fix from three waves: W1-Z1 zombie-state (5 lines, `a21a91b`); verified seed 1401 now terminates @ 46872 with seed-1337 hash unchanged.
>
> **The moat:** every claim reduces to (seed, config, tick, observable); hashes can't be faked; claims survived independent replication. The methodology, not the ants, is the durable asset.
>
> **Key facts:** baseline (pre-fix, n=120) 78.3% unattended win rate; rival is hollow (median starvation deliveries 0, final pop median 0); spider is mortality noise; drain response non-linear and economic; caste outcomes interact (2×2). `queenConsumed` counter always 0 (documented gap). Determinism is V8-verified only (Math.sin/cos unpinned across engines). Seed ranges 1337–1456, 2000–2119 burned.
>
> **Main risks:** museum-ification (measuring a frozen toy), report bloat (48k-token reports), stale baselines (n=120 predates the fix; rerun pending), seed overfitting, metric-over-charm.
>
> **Next phase — spend knowledge:** (1) housekeeping: post-fix 120-seed baseline v2, record W1-Z1 gates, fix stale FLEET.md line, V8 caveat. (2) Wave 3 "The God Matters": target agency delta — unattended 55–65%, scripted-rescue ≥85% (rescue scenario: food/lure during trough ticks 6k–14k); levers: `rival.workerRatio`→75, `ant.drainPerSec`→1.32; tune on 3000–3049, validate on held-out 4000–4049; human play sign-off mandatory. (3) Browser milestone "One Colony, One Shepherd" (bridge-only play, intervention budget, prediction ledger). (4) Proof artifact `docs/proof/RECEIPTS.md` + `npm run proof`.
>
> **Core thesis:** emergence and accountability are compatible. Antzoo must stay a living world that can be studied, improved, played, and trusted — never paperwork about ants.
