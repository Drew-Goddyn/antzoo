# Fresh Verifier Note - Wave 3 Addendum and Placebo Law

Status: PASS

Scope verified:

- `scenarios/placebo-perturbation.json` uses only the same rescue action types and ticks: `applyTool` food at 6000, `applyTool` lure at 9000, and `applyTool` food at 12000.
- Placebo raw artifacts contain exactly 20 seed files, all in the burned tuning range `3000-3019`.
- Each raw artifact has a summary for its filename seed and emits the placebo stimuli due before that run's terminal tick. Early terminal runs correctly do not emit later scheduled stimuli.
- `placebo-summary.json` reports placebo `n=20`, `wins=14`, `collapses=6`, and `running=0`.
- `placebo-per-seed.csv` contains 20 data rows covering seeds `3000-3019`.
- `docs/fleet/FLEET.md` now requires paired placebo/null analysis and mechanism deltas for intervention claims.
- `docs/plan-goals/04-browser-shepherd/PLAN.md` now requires paired placebo/null analysis, defines state-contingent agency, forbids exploratory held-out use, and handles caste policy as a player-facing UI-control decision.
- No progress ledger was modified by this addendum task, so no touched `progress.jsonl` required parsing.

Validation receipts:

- `docs/plan-goals/03-wave3-agency-delta/evidence/placebo/npm-test.txt`: full `npm test` passed.
- `docs/plan-goals/03-wave3-agency-delta/evidence/placebo/git-diff-check.txt`: `git diff --check` passed.

Verifier note:

An initial overly strict check expected all three scheduled stimuli in every raw file. That was corrected because early terminal runs, such as seed 3007, can finish after the tick-6000 action and before later scheduled actions. The accepted check verifies the full committed scenario timeline and the per-run stimuli due before each final tick.
