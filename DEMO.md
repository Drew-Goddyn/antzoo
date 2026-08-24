# M0 — The World at War

`npm run dev -- --port 5173`, open a link, press play. The camera opens on the whole terrarium: both nests are on screen from the first frame. **The fight starts early — watch the middle from about 0:10.**

- **The war:** http://127.0.0.1:5173/?seed=1337 — you win this one, barely.
- **The rival wins:** http://127.0.0.1:5173/?seed=99 — same rules, other outcome.
- **Staged demo** (`scenarios/war-demo.json` — a carcass dropped into no-man's land at 0:30, food behind your line, a lure on the front): http://127.0.0.1:5173/?scenario=ewogICJuYW1lIjogIndhci1kZW1vIiwKICAic2VlZCI6IDEzMzcsCiAgInRpY2tzIjogMTYwMDAsCiAgInRpbWVsaW5lIjogWwogICAgeyAiYXQiOiAxODAwLCAiZG8iOiAiZHJvcENhcmNhc3MiLCAieCI6IDIwNDgsICJ5IjogMTE1MiB9LAogICAgeyAiYXQiOiA1NDAwLCAiZG8iOiAiYXBwbHlUb29sIiwgInRvb2wiOiAiZm9vZCIsICJ4IjogMTgwMCwgInkiOiAxMDgwIH0sCiAgICB7ICJhdCI6IDcyMDAsICJkbyI6ICJhcHBseVRvb2wiLCAidG9vbCI6ICJsdXJlIiwgIngiOiAyMDQ4LCAieSI6IDExNTIgfSwKICAgIHsgImF0IjogOTAwMCwgImRvIjogInNuYXBzaG90IiB9LAogICAgeyAiYXQiOiAxMjAwMCwgImRvIjogImRyb3BDYXJjYXNzIiwgIngiOiAyMDQ4LCAieSI6IDExNTIgfSwKICAgIHsgImF0IjogMTU2MDAsICJkbyI6ICJzbmFwc2hvdCIgfQogIF0KfQo=

## Watch for this

- **A clash you can point to, at 0:10.** First combat death lands at 0:09 on seed 1337, 0:10 on seed 99, 0:11 on seed 4471, and the skirmish notice fires within two seconds of it. Orange sparks, a shove of the camera, a count of the dead. It is one sharp battle: seed 1337 spends 43 of its first 44 combat deaths inside the first sim-minute, and then the front goes quiet. Twenty to thirty ants a side die fighting over a full run; it used to be one.
- **Two empires, two palettes.** Gold and cyan bloom out of your nest on the left, violet and magenta out of the rival's on the right. Where the trails meet the ground turns pink — that stripe is the front.
- **The rival actually lives there.** Both empires are grown from the same tuning tables around their own nest, rotated 180°, so each gets the same six larders, the same 14 bushes and the same 3050 food. Per-object jitter is rolled separately, so it is a matched map, not a pixel-exact reflection. It forages, it starves, it wins sometimes. Nobody feeds it any more.

## Before / after — seed 1337, tick 12000

| Before — the default view. One colony. The rival is off-screen entirely. | Before, zoomed out — the rival is the grey smudge, bottom right, alone. |
| --- | --- |
| ![before](docs/demo/before-seed1337-t12000.png) | ![before wide](docs/demo/before-seed1337-t12000-wide.png) |

| After — same seed, same tick, default view: both empires and the front between them. | After, tick 600 (0:10) — the clash itself, with the skirmish notice. |
| --- | --- |
| ![after](docs/demo/after-seed1337-t12000.png) | ![clash](docs/demo/after-seed1337-t600-clash.png) |
