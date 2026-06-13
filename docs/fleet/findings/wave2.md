# Wave 2 findings

Source corpus: `docs/fleet/reports/wave2/*.md` on local `main` after the merged Wave 2 report PRs. GitHub audit used `gh pr list` and `gh pr view` for PRs #30-#41: #30, #31, #32, #33, #34, #37, #38, #39, #40, and #41 were merged; #36 was closed unmerged and superseded by #41; #35 was unrelated Dependabot.

## Report acceptance

| Report | Decision | Reason |
|---|---|---|
| W2-M1 | Accepted | Two drain configs, reported patched defaults, seed summaries, and rollups are sufficient for synthesis. Rollups use `config`/`winRate` rather than the canonical `runs` field, but the underlying seed summaries are present and spot-check matched. |
| W2-X1 | Accepted with caveat | Full 20 seed summaries are present. The report has four five-seed rollups rather than one n=20 rollup, so synthesis uses the seed summaries directly. Earlier PR #36 for this cell was correctly rejected and superseded for bad defaults/regenerated JSONL. |
| W2-X2 | Accepted as partial | Honest partial report: n=12 of the requested 20 due runtime. Seed summaries, n, and config are present. |
| W2-X3 | Accepted | Full n=20 report with canonical rollup, seed summaries, config, reading, and verdict. |
| W2-X4 | Accepted with caveat | Full 20 seed summaries are present. The report has four five-seed rollups rather than one n=20 rollup, so synthesis uses the seed summaries directly. |
| W2-T1b-a | Accepted | Full n=12 report with baseline config, required tick-600 terrain join, seed summaries, and verdict. |
| W2-T1b-b | Accepted | Full n=13 report with baseline config, required tick-600 terrain join, seed summaries, and verdict. |
| W2-F2a | Accepted as partial | Honest partial report: n=5 of the requested 20 due runtime. Seed summaries and the founding-wave table are usable as partial evidence. |
| W2-F2b | Accepted with caveat | Full 20 seed summaries are present. The report has split partial rollups rather than one n=20 rollup, and its prose says 15/20 player wins while the seed summaries show 16/20. Synthesis uses the verbatim seed summaries. |
| W2-R1 | Rejected | The manifest required rerunning W1-C3 seed 2002 with the same player 90 / rival 80 worker-share config. W1-C3 used six ratio keys: `caste.workerRatio=90`, `caste.soldierRatio=5`, `caste.nurseRatio=5`, `rival.workerRatio=80`, `rival.soldierRatio=10`, `rival.nurseRatio=10`. W2-R1 patched only `caste.workerRatio=90` and `rival.workerRatio=80`, leaving the companion soldier/nurse ratios at defaults. Because these are relative weights, W2-R1 is a different config. It also emitted one custom `summary` JSON object rather than the required `cross_seed_rollup` plus `seed_summary` JSONL shape. Its conclusion is not accepted into synthesis. |

## Replication spot-checks

Random selection used Node `crypto.randomInt` over each report's reported seed/config set. Timing telemetry was ignored. All accepted-report hash checks matched.

| Report | Seed and config | Command/config recorded | Reported final hash | Observed final hash | Verdict |
|---|---|---|---|---|---|
| W2-M1 | Seed 2002, `ant.drainPerSec=0.9` | `PATH=/opt/homebrew/bin:$PATH npm run sim -- --seed 2002 --ticks 50000 --sample-every 300 --scenario <tmp>` with scenario `{"name":"spotcheck-W2-M1-0.9","tuning":{"ant.drainPerSec":0.9},"timeline":[]}` | `323e20a1a898a369` | `323e20a1a898a369` | Match |
| W2-X1 | Seed 2109, player 70/15/15, rival 60/20/20 | `PATH=/opt/homebrew/bin:$PATH npm run sim -- --seed 2109 --ticks 50000 --sample-every 300 --scenario <tmp>` with scenario `{"tuning":{"caste.workerRatio":70,"caste.soldierRatio":15,"caste.nurseRatio":15,"rival.workerRatio":60,"rival.soldierRatio":20,"rival.nurseRatio":20},"timeline":[]}` | `37bb45c12c55a0d9` | `37bb45c12c55a0d9` | Match |
| W2-X2 | Seed 2101, player 70/15/15, rival 80/10/10 | `PATH=/opt/homebrew/bin:$PATH npm run sim -- --seed 2101 --ticks 50000 --sample-every 300 --scenario <tmp>` with scenario `{"tuning":{"caste.workerRatio":70,"caste.soldierRatio":15,"caste.nurseRatio":15,"rival.workerRatio":80,"rival.soldierRatio":10,"rival.nurseRatio":10},"timeline":[]}` | `03c012503d93935c` | `03c012503d93935c` | Match |
| W2-X3 | Seed 2109, player 90/5/5, rival 60/20/20 | `PATH=/opt/homebrew/bin:$PATH npm run sim -- --seed 2109 --ticks 50000 --sample-every 300 --scenario <tmp>` with scenario `{"tuning":{"caste.workerRatio":90,"caste.soldierRatio":5,"caste.nurseRatio":5,"rival.workerRatio":60,"rival.soldierRatio":20,"rival.nurseRatio":20},"timeline":[]}` | `1607b728381ea540` | `1607b728381ea540` | Match |
| W2-X4 | Seed 2119, player 90/5/5, rival 80/10/10 | `PATH=/opt/homebrew/bin:$PATH npm run sim -- --seed 2119 --ticks 50000 --sample-every 300 --scenario <tmp>` with scenario `{"tuning":{"caste.workerRatio":90,"caste.soldierRatio":5,"caste.nurseRatio":5,"rival.workerRatio":80,"rival.soldierRatio":10,"rival.nurseRatio":10},"timeline":[]}` | `35aa2eb7da28508b` | `35aa2eb7da28508b` | Match |
| W2-T1b-a | Seed 2036, baseline | `PATH=/opt/homebrew/bin:$PATH npm run sim -- --seed 2036 --ticks 50000 --sample-every 600` | `14b0b6c8c8769b90` | `14b0b6c8c8769b90` | Match |
| W2-T1b-b | Seed 2037, baseline | `PATH=/opt/homebrew/bin:$PATH npm run sim -- --seed 2037 --ticks 50000 --sample-every 600` | `195b925bdba86bdf` | `195b925bdba86bdf` | Match |
| W2-F2a | Seed 2051, baseline | `PATH=/opt/homebrew/bin:$PATH npm run sim -- --seed 2051 --ticks 50000 --sample-every 300` | `d00e5534740d83d4` | `d00e5534740d83d4` | Match |
| W2-F2b | Seed 2084, baseline | `PATH=/opt/homebrew/bin:$PATH npm run sim -- --seed 2084 --ticks 50000 --sample-every 300` | `e25aad70c45b648c` | `e25aad70c45b648c` | Match |

## Confirmed findings

Drain mechanism: W2-M1 supports an economic/starvation regime shift, not a combat regime shift. On seeds 2000-2004, `ant.drainPerSec=0.9` produced 1/5 player wins while `ant.drainPerSec=1.5` produced 5/5 player wins. Combat deaths stayed single-digit in both configs; the visible movement is in starvation, brood, nest food, final population, and decisiveness.

Caste composition: the 2x2 de-confound kills a simple worker-gap-only explanation. Outcomes from accepted seed summaries were:

| Cell | Player ratios | Rival ratios | Player wins |
|---|---:|---:|---:|
| W2-X1 | 70/15/15 | 60/20/20 | 14/20 |
| W2-X2 | 70/15/15 | 80/10/10 | 5/12 partial |
| W2-X3 | 90/5/5 | 60/20/20 | 19/20 |
| W2-X4 | 90/5/5 | 80/10/10 | 10/20 |

The same +10 worker-share gap behaves differently at lower and higher absolute levels: 70/60 went 14/20 while 90/80 went 10/20. A high rival worker share also erases much of the player advantage: 70/80 was only 5/12 partial and 90/80 was 10/20. The durable fact is interaction, not a one-axis rule.

Terrain luck: W2-T1b-a and W2-T1b-b complete the rejected W1-T1b half with n=25. The combined second half was 19/25 player wins and 6/25 rival wins. Tick-600 nearest-food-distance delta alone is weak: player wins had median delta 62.49, rival wins had median delta 71.35, and the two huge negative deltas split outcomes (`seed=2028` rival win at -932.60, `seed=2038` player win at -915.36). Terrain still matters, but the next useful variable is not just nearest distance; it needs early delivery success, stock/cluster quality, and path obstruction.

Founding wave: W2-F2a and W2-F2b provide n=25 accepted partial/full evidence, with 20/25 player wins and 5/25 collapses. Collapse trough depths were 87, 124, 127, 131, and 149. Victory trough depths ranged from 14 to 143, including deep surviving runs at 106, 116, 117, 122, 127, 129, 139, and 143. The W1 tentative boundary between 76 and 87 is killed; trough depth is a risk signal, not a hard scalar threshold.

High-worker running trace: unresolved. W2-R1 was the right question but the wrong config, so the W1-C3 seed 2002 state at 50k remains unclassified.

## Killed or weakened hypotheses

- H1, in its narrow form, is weakened: tick-600 nearest-food distance by faction is not predictive enough on its own.
- H2, as a hard trough-depth threshold between 76 and 87, is killed.
- H3, as worker-gap-only, is killed. Absolute player capacity, rival capacity, and the gap interact.
- H4, as a combat/military explanation for the drain non-linearity, is weakened. The accepted Wave 2 mechanism evidence points mostly to economics/starvation.
- H5 is not answered because W2-R1 was rejected.

## Anomalies worth trace probes

- Terrain paradox seeds: `seed=2028` rival win with delta -932.60 and `seed=2038` player win with delta -915.36 should be traced for early delivery success, path obstruction, and food-cluster quality.
- Founding-depth contradictions: `seed=2073` collapsed at depth 87 while `seed=2085` survived at depth 87, and several seeds survived at depths above 120. Pair trough depth with brood bank, recovery slope, food access, and rival pressure.
- W1-C3 `seed=2002` should be rerun to 60k with all six ratio keys from W1-C3, not only the two worker-ratio keys used by W2-R1.
- W2-F2b's prose win-rate line disagrees with its seed summaries. The seed summaries are accepted; future syntheses should keep treating prose as secondary to verbatim JSONL.

## Next-wave candidates

- Redispatch the high-worker running trace with unambiguous wording: W1-C3 `seed=2002`, 60k ticks, `sample-every=600`, exact six-key config `caste.workerRatio=90`, `caste.soldierRatio=5`, `caste.nurseRatio=5`, `rival.workerRatio=80`, `rival.soldierRatio=10`, `rival.nurseRatio=10`. Require canonical `cross_seed_rollup` and `seed_summary` JSONL, not a custom summary object. Compare against the W1-C3 50k hash `524106b762dc5b5f` before interpreting the 60k result.
- Terrain trace wave on the paradox seeds above plus matched controls, collecting early deliveries, food stock quality, obstruction/pathing indicators, and nearest-distance deltas.
- Founding recovery wave on the contradictory depth band, especially depths 87-143, with brood bank and post-trough recovery slope as first-class observables.
- Drain mechanism expansion only if needed after the above: replicate W2-M1 at larger n before treating the 0.9/1.5 mechanism split as fully quantified.

## Program metrics

- Audit source: PR-channel audit with `gh pr list`, `gh pr view`, and `gh api repos/Drew-Goddyn/antzoo/issues/<pr>/comments` for #30-#41, local report-file inspection, local hash spot-checks, and Jules session transcripts recovered from report branch names. The session-channel audit covered session ids `13668811880068167112`, `12971336313636760869`, `12270456070822392186`, `1691485173907394181`, `2072638115262462444`, `7167278260488318820`, `15531701479257429570`, and `1293179279238527757`; `953952653211056927`, `15531329362200989236`, and `15735629862028852926` returned no transcript messages through the helper.
- Current merged source-corpus acceptance: 9/10 reports accepted into synthesis, 1/10 rejected (`W2-R1`).
- First-submission acceptance by cell: 8/10. W2-X1's first PR (#36) was rejected/closed and replaced by #41, and W2-R1 was rejected in this synthesis audit for the wrong config and non-schema output.
- Judgment rounds, PR channel: 2 auditable interventions before synthesis - #36 rejection/redispatch for bad defaults/regenerated JSONL, and #41 repair request for the missing confidence line. The W2-R1 rejection happened in this synthesis pass, not during PR review.
- Judgment rounds, session channel: 7 auditable operator interventions. These were W2-T1b-a choosing the full 12-seed background run, the first W2-X1 attempt being told to complete the full run, W2-T1b-b partial/full batching guidance, two W2-X2 batching decisions, W2-F2b split-batch evidence guidance, and W2-X1 redispatch approval of four real n=5 split batches.
- Ceremony rounds, PR channel: 2 auditable acknowledgement-only worker comments tied to #36/#41. Standard Jules intro boilerplate was excluded.
- Ceremony rounds, session channel: 5 auditable proceed/ack-only rounds: W2-X4, W2-M1, the first W2-T1b-a proceed, W2-X2 final-step proceed, and W2-F2b final-step proceed.
- Novel findings: W2-M1 added mechanism evidence for the drain non-linearity; W2-X1..X4 clarified caste interaction; W2-T1b-a/b killed nearest-distance-only terrain luck; W2-F2a/b killed the hard founding-depth threshold; W2-R1 produced no accepted scientific finding.

## Worker friction

Wave 2 had recurring split-batch rollups (`W2-X1`, `W2-X4`, `W2-F2b`) and honest partial reports (`W2-X2`, `W2-F2a`). These are report-schema and dispatch-sizing concerns, not DEBUG.md technical-manual defects.

W2-R1 exposed a dispatch wording defect: "same player 90 / rival 80 worker-share config" was too easy to interpret as only the two worker-ratio keys, even though W1-C3's actual config used six ratio keys. The redispatch packet must spell out all six keys and explicitly require canonical `cross_seed_rollup` plus `seed_summary` JSONL. No `docs/debug-surface/DEBUG.md` change is warranted from this evidence.
