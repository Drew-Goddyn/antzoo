# Antzoo Concept Image Prompts

Reusable image-generation prompts for capturing the game visually — gameplay moments, system breakdowns, data art, key art, and feature visions. Run them any time in a Codex session (or any capable image model) to see where the game is and where it could go.

## How to use

1. **Compose:** copy the **Style Bible** block below, then one prompt, fill the `{PLACEHOLDERS}` (defaults in each prompt's table).
2. **Ground it (optional but better):** in a Codex session with repo access, prefix with *"Read docs/GDD.md sections 1–3 and the newest DEMO.md first, and let the current state of the game inform the image."* For the data-art prompt, let it run the headless sim for real numbers.
3. **Save outputs** to `docs/art/concepts/` with a date and prompt name (e.g. `2026-07-war-front.png`).
4. **Honesty rule:** these are **concept art**, never screenshots. Never present them as the actual game — in the README, PRs, or anywhere else — without the label "concept."

---

## The Style Bible (prepend to every prompt)

> Art direction for "Antzoo," a living-terrarium ant god game. Top-down god's-eye view of a miniature world; painterly but crisp 2D, flat perspective with soft depth, like a lovingly lit diorama under glass. Rich dark soil, moss and clover greens, scattered pebbles and berry bushes; the palette shifts with season (airy pale spring, warm gold summer, rust amber autumn, frosted blue-grey winter). Pheromone trails render as bioluminescent light laid over the earth: warm amber-gold for the player colony's food trails, soft teal for home trails, violet-magenta for the rival colony, smoldering red for danger. Ants are tiny but characterful silhouettes — brown workers, larger orange-tinted soldiers, pale grey nurses, purple-tinted rival ants. Two nests anchor the world: the player's warm mound near center, the rival's cold mound in a far corner. Mood: charming, quietly melancholy naturalism — wonder with stakes; never cartoonish, never grimdark, no photorealism, no anthropomorphized faces on ants. No readable text unless the prompt asks for interface elements; keep any labels minimal and clean.

---

## P1 — The Terrarium Portrait *(key art / high-level concept)*

**When:** you need the one image that says what Antzoo is; README hero art; motivation on a slow day.

| Placeholder | Default |
|---|---|
| `{SEASON}` | autumn |
| `{TIME_OF_STORY}` | the height of the war, year two |

> [Style Bible] — A wide establishing shot of the entire world at {SEASON}, at {TIME_OF_STORY}. Both nests visible: the player's amber trail-empire radiating from center, the rival's violet network creeping in from its corner, the two glows meeting and tangling in contested middle ground. Small dramas legible at a glance: a forager column hauling berries, a soldier line holding a ridge of pebbles, rain darkening one quadrant of soil, the spider a dark comma of dread near a spoiled carcass. Composition like a beautiful strategy-map-as-painting; the world should feel worth pressing your face against the glass for. Wide 16:9.

## P2 — The War Front *(gameplay moment)*

**When:** capturing what a dramatic minute of play looks like; before/after inspiration around milestone M0; social posts.

| Placeholder | Default |
|---|---|
| `{FLASHPOINT}` | a fallen carcass midway between the nests |
| `{STAKES}` | winter is three days away and both colonies are hungry |

> [Style Bible] — A closer-in gameplay moment at the front line: both empires converge on {FLASHPOINT} while {STAKES}. Amber and violet trail-light collide and interleave; soldiers of both factions lock in tiny fierce melees ringed by red danger-glow; workers thread through combat lanes hauling food home; fresh casualties lie as small dark punctuation emitting a red haze. The image should read as a battle *and* an economy at once — logistics under fire. Cinematic but still top-down and toylike. Wide 16:9.

## P3 — The System Exploded *(visual breakdown / explainer)*

**When:** you want to *see* one system from the GDD catalog clearly; deciding whether to break a module off and go deep.

| Placeholder | Default |
|---|---|
| `{SYSTEM}` | the pheromone economy (S1-adjacent) |
| `{ELEMENTS}` | food trails, home trails, evaporation, rain wash, ant sensing cones |

> [Style Bible] — An elegant annotated exploded-view diagram of {SYSTEM}, in the manner of a beautiful field-notebook plate or a Kurzgesagt-style explainer, but in Antzoo's palette. Break the system into layered panels or callouts showing {ELEMENTS}, with fine arrows and short single-word labels indicating flow and causation. One small hero vignette of the system in action in the world. Keep it clean, warm, and studied — a naturalist's plate for an invented ecology. Square or 4:3.

## P4 — The God's Desk *(UI / HUD concept)*

**When:** imagining interface evolution — the chronicle feed, threat readouts, the nest cutaway panel; before UI-touching milestones (M1, M2, M5).

| Placeholder | Default |
|---|---|
| `{UI_FOCUS}` | a colony chronicle feed with a notable ant's obituary, and a rival-threat readout |
| `{GAME_STATE}` | mid-crisis: queen hunger countdown running, population dipping |

> [Style Bible] — A full-interface concept mockup of Antzoo's god view during {GAME_STATE}. The living world fills the frame; interface floats as minimal dark-glass panels with warm typography: {UI_FOCUS}, a season dial, a small minimap with two glowing nest dots, an intervention toolbar (food, lure, boulder, wash) that looks tactile and inviting. UI text minimal and plausible (short real words, no lorem gibberish). The HUD should feel like instruments on a naturalist-god's desk — informative without smothering the terrarium. Wide 16:9.

## P5 — The Chronicle Poster *(data art / graphs & charts)*

**When:** turning a real run into something beautiful; celebrating or mourning a colony; making determinism feel like wonder.

**Grounding (recommended):** first run `npm run sim -- --seed {SEED} --ticks 50000` and pull real numbers from the summary line (outcome, final tick, peak populations, deaths by cause, median forager age); weave them into the image as the actual figures.

| Placeholder | Default |
|---|---|
| `{SEED}` | 1337 |
| `{HEADLINE}` | Victory in the starving year |

> [Style Bible palette, applied to information design] — A museum-quality infographic poster chronicling one complete Antzoo run: "{HEADLINE} — seed {SEED}." A central population-over-time curve for both factions rendered as flowing organic ribbons (amber vs violet), showing the founding surge, the trough, recovery, and the end; season bands tinting the timeline behind it; small stacked marks for deaths by cause (starvation dominant, spider and combat as scattered accents); a tiny framed obituary for one notable ant with age and delivery count; the run's final outcome stated in one quiet line. Style between vintage scientific poster and modern data-viz art print. Tall 3:4 poster.

## P6 — The Vision Postcard *(feature ideas / depth-ladder futures)*

**When:** deciding whether a GDD system's stage B/C is worth wanting; generating appetite before writing a module brief.

| Placeholder | Default |
|---|---|
| `{SYSTEM_STAGE}` | S6 The Underground, stage B |
| `{FANTASY_LINE}` | a cutaway nest interior: brood galleries glowing with eggs, nurses carrying larvae through tunnels, the queen vast and dim at the bottom, food stores banked against winter |

> [Style Bible] — A "postcard from a future version of Antzoo" depicting {SYSTEM_STAGE}: {FANTASY_LINE}. Render it as if the feature already shipped and this is its most magical moment, fully integrated with the existing world's look. Composition should make the viewer want to build it. Wide 16:9 or square.

*Good `{SYSTEM_STAGE}` fills, straight from the GDD ladders: S1-C rival personalities; S3-B a summoned rainstorm as an act of god; S4-B a flood rewriting the trail map; S7-C a migration to a new nest site; S8-C four colonies at war; S9-B the daily seed ritual.*

## P7 — The Moment *(dramatizing a real event)*

**When:** something actually happened in a run — a toast, an obituary, a comeback — and you want it immortalized. Pairs beautifully with P5.

| Placeholder | Default |
|---|---|
| `{EVENT}` | the eldest forager, 47 deliveries and three winters old, dies at the spider's ambush within sight of the nest |
| `{WHERE_WHEN}` | at the nest's edge, first snowfall of year three |

> [Style Bible] — A single intimate story-illustration of one true moment from a Antzoo run: {EVENT}, {WHERE_WHEN}. Closer to the ground than the god view — near the ants' own scale, soil and light looming large — but still unmistakably this world and palette. Quiet, specific, unsentimental; the drama carried by light, posture, and the indifference of the wider world continuing in the background. Square or 4:5.

---

*File owned by Drew; agents may add prompts here when a milestone introduces new visual territory, but never delete the Style Bible without a taste sign-off.*
