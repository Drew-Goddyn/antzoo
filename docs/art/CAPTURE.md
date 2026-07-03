# The Capture Goal

A standing, paste-ready `/goal` for a full-freedom visual capture of Antzoo's current state. Unlike the parameterized prompts in `docs/art/PROMPTS.md` (cameras Drew points), this is a mission: the agent studies the game as it exists *today* and decides for itself what deserves capturing. Run it any time — after a milestone lands is ideal. Over time, `docs/art/captures/` becomes the game's visual diary.

**Charter note:** this goal is owner-authorized. Its outputs (`docs/art/captures/**`) are an explicit exception to the Agent Charter's no-new-documents rule (GDD §6.7). Everything else in the charter still binds.

---

## Paste this into Codex

```
/goal Deeply understand, then capture the current state of Antzoo in images.

PHASE 1 — UNDERSTAND (evidence first, imagination second).
Read docs/GDD.md in full, AGENTS.md, docs/art/PROMPTS.md (especially the
Style Bible), and the newest DEMO.md if one exists. Then observe the real
game, not your idea of it: run headless sims on 2-3 seeds of your choosing
and read the summaries; start the dev server and watch a colony live —
step, pan, change speed, intervene once or twice via the browser bridge or
UI; take real screenshots at the moments you judge most revealing, and
record (seed, tick) for every one.

PHASE 2 — CAPTURE (your judgment, your composition).
Produce a portfolio of 6-12 images that together answer: "what is this
game right now, and what does it want to become?" The mix is your call —
real screenshots, generated concept art, annotated diagrams, data art from
real run numbers. Use the Style Bible for coherence; deviate deliberately
where the game's current reality contradicts it, and say so. You may use,
adapt, or ignore prompts P1-P7. Surprise is welcome; a capture that only
restates the GDD is a wasted run.

HARD RULES (few, non-negotiable):
- Real screenshots are labeled with (seed, tick). Generated images are
  labeled "concept". Never blur that line, in filenames or in the index.
- Touch nothing: no changes to src/, scenarios/, tuning, tests, or any doc
  outside your capture folder. This goal observes the game; it does not
  change it.
- Work from main. Never from an in-flight feature branch.

DELIVERABLE: one PR adding docs/art/captures/<YYYY-MM>-<slug>/ containing
the images plus INDEX.md (one page max): a line per image — what it shows,
real-vs-concept, (seed, tick) or a one-phrase prompt gist — and a closing
3-5 sentence "state of the game" read in your own words: what the visuals
say Antzoo is today, and the one thing they say it is missing.

STOP when the PR is open. If image generation or the browser is
unavailable, ship what you can capture with an honest note; a portfolio of
real screenshots alone is a valid capture.
```

---

## How Drew reviews a capture PR

The watch test, gallery edition: open the folder, look at the images, read the closing paragraph last. Accept if the capture teaches you something about your own game or makes you want to touch it. The "state of the game" paragraph is the quiet payload — an outside eye's honest read, once per era, in a form you'll actually revisit.
