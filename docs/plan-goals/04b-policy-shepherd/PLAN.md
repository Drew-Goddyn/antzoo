# Goal 04B - Policy-Aware Browser Shepherd Diagnostic

Operator artifact: this plan-goal bundle is stored in-repo so a future reviewer can inspect the protocol, raw evidence, synthesis, and final claims without trusting the completing agent's prose.

## Goal

Run a small browser diagnostic to test whether a state-reading shepherd can use the visible player-facing caste-policy controls to improve paired outcomes or mechanisms beyond both unattended play and a non-state-contingent policy placebo.

This is not final candidate validation. It must not touch held-out seeds, default tuning, source, scripts, package files, historical reports, or scenarios.

## Bundle

- Root: `docs/plan-goals/04b-policy-shepherd/`
- Plan: `docs/plan-goals/04b-policy-shepherd/PLAN.md`
- Launcher: `docs/plan-goals/04b-policy-shepherd/LAUNCHER.txt`
- Progress: `docs/plan-goals/04b-policy-shepherd/progress.jsonl`
- Outcome: `docs/plan-goals/04b-policy-shepherd/GOAL_OUTCOME.md`
- Evidence: `docs/plan-goals/04b-policy-shepherd/evidence/`

## Required Context Read

The executing agent must start from the current repository root returned by `git rev-parse --show-toplevel`, then inspect:

- `docs/plan-goals/README.md`
- `docs/fleet/browser/MILESTONE-1.md`
- `docs/plan-goals/04-browser-shepherd/PLAN.md`
- `docs/plan-goals/04-browser-shepherd/GOAL_OUTCOME.md`
- `docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd-pilot-report.md`
- `docs/plan-goals/03-wave3-agency-delta/evidence/synthesis-addendum.md`
- `docs/plan-goals/03-wave3-agency-delta/evidence/placebo/placebo-summary.md`
- `docs/fleet/FLEET.md`
- `docs/debug-surface/DEBUG.md`
- `package.json`
- Goal 04 UI evidence proving visible caste sliders exist.

## Seed Policy

- Pilot seeds: `3005-3009`
- Held-out seeds used: none
- Forbidden: `4000-4049`, `4050-4099`, and any fallback held-out range.

## Arms

For each seed, collect paired evidence for:

1. Unattended: no intervention.
2. Perturbation placebo/null: committed `scenarios/placebo-perturbation.json`.
3. Fixed policy placebo: one predeclared non-state-contingent visible caste-policy action at tick `6000` for every seed.
4. Policy-aware shepherd: one visible caste-policy action at tick `6000`, selected from the predeclared menu after observing browser state.

The policy arms must not use `window.__antzoo.patchTuning`, `resetWorld`, hidden tuning APIs, or source reads during individual browser runs. The only allowed bridge calls during policy runs are `getSnapshot`, `getEvents`, `getHash`, `pause`, and `step(n)` with `n <= 1200`. Policy changes must be made through visible browser UI sliders.

## Policy Menu

The predeclared menu is:

| Option | Worker | Soldier | Nurse | Intended reading |
|---|---:|---:|---:|---|
| Worker surge | 90 | 5 | 5 | Starvation, low nest food, poor food access, or delivery disadvantage. |
| Balanced/default | 80 | 10 | 10 | No visible stress or no clear state read. |
| Nurse recovery | 70 | 5 | 25 | Population recovery or brood support is the main visible weakness. |
| Soldier buffer | 70 | 25 | 5 | Rival pressure or combat/security is the main visible weakness. |

The fixed policy placebo uses `Worker surge` at tick `6000` for every seed. Prior repo evidence says high player worker share is the strongest known non-state-contingent caste-policy direction, so this is a stringent policy placebo rather than a weak strawman.

The policy-aware shepherd chooses at tick `6000` using this predeclared rule:

- Choose `Worker surge` when player nest food is at or below `3`, player food delivered is below rival food delivered, or player nearest-food distance is more than `120` world units worse than rival nearest-food distance.
- Choose `Nurse recovery` when player population is below `145` or has visibly declined since the prior chunk while brood/nest recovery looks more important than rival pressure.
- Choose `Soldier buffer` when rival population exceeds player population by at least `25` and worker-food stress is not the primary observed issue.
- Choose `Balanced/default` only when none of the above states are present.

If multiple rules apply, use the first matching rule in the order above. Do not tune this menu or decision rule after pilot execution starts.

## Evidence Requirements

Create at least:

- `evidence/current-state.md`
- `evidence/policy-menu.md`
- `evidence/fixed-policy-placebo.md`
- `evidence/pilot-report.md`
- per-seed policy-aware transcripts
- screenshots showing the caste-policy UI before and after at least one action
- raw or summarized outputs for all four arms
- replay verification note
- validation logs

The pilot report must include seed list, arm definitions, held-out check, per-seed outcome table, paired flip tables against unattended, perturbation placebo/null, and fixed policy placebo, mechanism deltas, prediction accuracy against persistence baseline, policy-decision analysis, replay hash result, and safe/unsafe claims.

## Replay

Replay at least one policy-aware shepherded seed with the same visible policy values and intervention tick. If visible UI replay cannot be made deterministic, record that limitation and do not claim replay-proven policy agency.

## Validation

Required before final:

```sh
git diff --check
node -e '<parse progress.jsonl>'
```

Run the browser bridge smoke gate if needed to establish environment. Do not run full `npm test` unless source, scenario, debug, CLI, or simulation-facing files change.

Stop the dev server before finishing.

## Allowed Files

- `docs/plan-goals/04b-policy-shepherd/**`
- Additional browser evidence files under this bundle.

Optional only if explicitly justified:

- `docs/fleet/browser/MILESTONE-1.md`
- `docs/fleet/FLEET.md`

## Protected Files

- `src/**`
- `scripts/**`
- `scenarios/**` unless no alternative exists and the rationale is recorded
- package files
- historical fleet reports
- generated output outside the 04B evidence bundle
- default tuning

## Success And Claim Standard

Complete means the pilot ran, evidence is durable, replay was attempted, validation passed, and `GOAL_OUTCOME.md` names safe and unsafe claims.

Do not claim policy-aware agency success unless the policy-aware shepherd beats both perturbation placebo/null and fixed policy placebo on paired analysis with supporting mechanism deltas. Raw win-rate movement, perturbation luck, hidden tuning patches, and fixed policy wins do not count as state-contingent agency.

Block if visible UI caste controls cannot be operated reliably, browser automation cannot capture required evidence, replay impossibility prevents useful interpretation, or the paired policy-placebo comparison cannot be produced.
