# Synthesis Addendum Outcome

Status: COMPLETE

## Result

Goal 03's BLOCKED result is now formalized as a methodological finding. The rescue protocol delivered a real economic subsidy, but paired flips and the placebo calibration show that the outcome claim remains ambiguous without a placebo/null comparison. Goal 04's plan has been repaired so browser-shepherd execution cannot claim success from a tiny unpaired win-rate movement.

## Files Changed

| File | Purpose |
|---|---|
| `docs/plan-goals/03-wave3-agency-delta/evidence/synthesis-addendum.md` | Adds paired Goal 03 flip tables, re-roll arithmetic, mechanism deltas, compensation finding, prediction findings, and the methodological conclusion. |
| `scenarios/placebo-perturbation.json` | Adds reusable same-timeline placebo perturbation scenario with off-nest food/lure/food stimuli. |
| `docs/plan-goals/03-wave3-agency-delta/evidence/placebo/raw/*.jsonl` | Raw placebo runs for seeds `3000-3019`. |
| `docs/plan-goals/03-wave3-agency-delta/evidence/placebo/placebo-per-seed.csv` | Per-seed placebo rollup. |
| `docs/plan-goals/03-wave3-agency-delta/evidence/placebo/placebo-summary.md` | Human-readable placebo summary with placebo-vs-unattended and placebo-vs-rescue comparisons. |
| `docs/plan-goals/03-wave3-agency-delta/evidence/placebo/placebo-summary.json` | Machine-readable placebo summary. |
| `docs/plan-goals/03-wave3-agency-delta/evidence/placebo/npm-test.txt` | Full debug gate receipt. |
| `docs/plan-goals/03-wave3-agency-delta/evidence/placebo/git-diff-check.txt` | Whitespace gate receipt. |
| `docs/plan-goals/03-wave3-agency-delta/evidence/placebo/fresh-verifier.md` | Verifier note for scenario shape, seed hygiene, summaries, and plan repairs. |
| `docs/fleet/FLEET.md` | Adds the intervention-claim placebo law. |
| `docs/plan-goals/04-browser-shepherd/PLAN.md` | Requires placebo-calibrated paired analysis, defines state-contingent agency, protects held-out seeds, and handles caste policy as a player-facing UI-control decision. |

No `progress.jsonl` file was modified by this addendum task.

## Commands Run

| Command | Result |
|---|---|
| `git rev-parse --show-toplevel` | Confirmed repo root. |
| `git status --short --branch` | Started on `main...origin/main`; later used again to review changed files. |
| `git pull --ff-only` | Already up to date. |
| Required `sed`, `find`, `rg`, and `tail` inspections | Read Goal 03 outcome, candidate synthesis, CSV/JSON summaries, rescue scenario, FLEET, Goal 04 plan, scenario parser, runner, and tuning defaults. |
| Node CSV analysis script | Computed Goal 03 paired flips and mechanism deltas from committed CSVs. |
| `npm run sim -- --seed <3000-3019> --ticks 50000 --scenario scenarios/placebo-perturbation.json --out docs/plan-goals/03-wave3-agency-delta/evidence/placebo/raw/<seed>.jsonl` | Passed for all 20 placebo runs. |
| Node placebo summary script | Wrote placebo per-seed CSV, summary Markdown, and summary JSON from raw summaries. |
| `npm test` | Passed; receipt in `evidence/placebo/npm-test.txt`. |
| `git diff --check` | Passed on rerun; receipt in `evidence/placebo/git-diff-check.txt`. The first shell wrapper used zsh's reserved `status` variable after running the check and was rerun with `git_status`. |
| Node verifier script | Passed scenario timeline, raw count, seed range, due-stimulus, summary, and CSV checks. |

## Placebo Results

| Arm | Seeds | Wins | Collapses | Running | Win rate | Median finalTick | Median player final pop | Median player food delivered |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Unattended | 3000-3019 | 14 | 6 | 0 | 70% | 20990.5 | 44 | 943 |
| Placebo | 3000-3019 | 14 | 6 | 0 | 70% | 21558.5 | 32.5 | 985.5 |
| Rescue | 3000-3019 | 15 | 5 | 0 | 75% | 22175 | 32.5 | 1102 |

Paired placebo-vs-unattended flips: losses -> wins 3, wins -> losses 3, unchanged wins 11, unchanged losses 3.

Paired rescue-vs-unattended flips: losses -> wins 5, wins -> losses 4, unchanged wins 10, unchanged losses 1.

The placebo cell used the same scheduled action types and ticks as rescue, but moved stimuli far from both nests. It still created six paired outcome flips with zero net win-rate gain. This confirms that trajectory perturbation alone can flip outcomes and must be separated from agency.

## Re-Roll Null Status

The re-roll null is strengthened but not fully confirmed. Default rescue's flip counts closely match simple re-roll arithmetic, and placebo created symmetric paired flips without near-nest assistance. But rescue also produced a real median player-food-delivered increase over both unattended and placebo. The safe reading is: rescue produced compensation and trajectory churn; it did not prove robust state-contingent agency.

## Safe Claims

- Goal 03 was correctly BLOCKED for shipping: no final candidate justified held-out validation or default tuning changes.
- Default rescue delivered a real economic subsidy: median player food delivered rose by 148 over unattended.
- The subsidy did not reliably buy resilience: four default unattended wins became rescue losses, and the net win movement was only +1 seed.
- Rival-75 produced the predicted contested/risk-band unattended result at 11/20 wins, but failed because rescue fell to 9/20 wins.
- Drain-1.32 made unattended play safer in the predicted direction at 17/20 wins, but that made it unsuitable for the Wave 3 target.
- Placebo perturbation can flip paired outcomes without improving headline win rate.
- Future intervention claims need paired flips, mechanism deltas, and a placebo/null comparison when the intervention perturbs trajectory.

## Unsafe Claims

- It remains unsafe to claim the rescue protocol proves player agency.
- It remains unsafe to claim any Wave 3 candidate is shippable.
- It remains unsafe to touch held-out seeds `4000-4049` from this evidence.
- It remains unsafe to change default tuning.
- It is unsafe for Goal 04 to claim browser-shepherd success from a small unpaired win-rate improvement.

## Goal 04 Launch Safety

Goal 04 is safe to launch only from the repaired plan in `docs/plan-goals/04-browser-shepherd/PLAN.md`. It is not safe to launch from the previous criteria. The repaired plan now requires paired placebo/null analysis, mechanism deltas, a definition of state-contingent agency, held-out seed protection, and an explicit caste-policy decision before pilot execution.
