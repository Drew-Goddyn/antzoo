# Wave 3 Candidate Synthesis

Status: BLOCKED - no final candidate selected.

## Decision

Do not touch held-out seeds `4000-4049`.

The authorized first-pass candidates do not produce the required agency shape. The goal needs unattended play to land in the 55-65% win band while scripted rescue reaches at least 85%. None of the tested configs hit both conditions, and the two stronger-pressure candidates made rescue worse than unattended on the tuning slice.

## First-Pass Evidence

All cells used seeds `3000-3019`; no cell used more than 20 seeds per arm. Each arm has per-seed outcome, final tick, and final hash evidence in the companion CSV/JSON/raw artifacts.

| Cell | Config | Unattended wins | Rescue wins | Agency delta | Running outcomes | Median unattended finalTick | Median rescue finalTick | Decision |
|---|---|---:|---:|---:|---:|---:|---:|---|
| W3-A0 | default tuning | 14/20 (70%) | 15/20 (75%) | +5 points | 0 unattended / 0 rescue | 20990.5 | 22175 | Reject as final candidate: rescue does not reach 85%, and unattended remains above the 55-65% target band. |
| W3-R75 | rival `75 / 12.5 / 12.5` | 11/20 (55%) | 9/20 (45%) | -10 points | 0 unattended / 0 rescue | 26746.5 | 25713.5 | Reject: unattended reaches the risk band, but rescue collapses below unattended and far below 85%. |
| W3-D110 | `ant.drainPerSec = 1.32` | 17/20 (85%) | 16/20 (80%) | -5 points | 0 unattended / 1 rescue | 17175.5 | 16537 | Reject: unattended becomes safer, rescue stays below 85%, and one rescue run remains running at the 50k budget. |
| W3-R75-D110 | rival `75 / 12.5 / 12.5` plus `ant.drainPerSec = 1.32` | 16/20 (80%) | 14/20 (70%) | -10 points | 0 unattended / 0 rescue | 20393.5 | 23233 | Reject: unattended is too safe and rescue is worse than unattended. |

## Held-Out Safeguard

- No final candidate was chosen.
- No held-out command was run.
- No artifact path under this goal contains seed `4000-4049`.
- The held-out range `4000-4049` remains reserved for a future final candidate.

## Why This Blocks Shipping

The goal can ship a tuning/default change only after a final candidate passes held-out validation and Drew's human play sign-off. The first-pass evidence does not justify selecting a final candidate, so running held-out seeds would spend the protected validation range without a defensible candidate-selection note.

The failure criterion "no config hits both unattended and rescue target bands" is met here. The honest outcome is to stop, preserve the evidence, and redesign the intervention rather than silently iterate or burn held-out seeds.

## Evidence Artifacts

- `docs/plan-goals/03-wave3-agency-delta/evidence/w3-a0-summary.md`
- `docs/plan-goals/03-wave3-agency-delta/evidence/w3-r75-summary.md`
- `docs/plan-goals/03-wave3-agency-delta/evidence/w3-d110-summary.md`
- `docs/plan-goals/03-wave3-agency-delta/evidence/w3-r75-d110-summary.md`
- `docs/plan-goals/03-wave3-agency-delta/evidence/*-per-seed.csv`
- `docs/plan-goals/03-wave3-agency-delta/evidence/*-summary.json`
- `docs/plan-goals/03-wave3-agency-delta/evidence/raw/`

## Claims Still Unsafe

- It is unsafe to claim any Wave 3 candidate improves player agency enough to ship.
- It is unsafe to claim held-out acceptance, because held-out seeds were intentionally not touched.
- It is unsafe to change default tuning, because no final candidate passed held-out validation and Drew has not provided human play sign-off.

## Recommended Next Intervention Design

The rescue protocol may need a different lever than global pressure. The evidence suggests the tested pressure changes either make rescue worse or make unattended play too safe. A future plan should consider a more targeted agency surface, such as rescue timing/strength, founding-trough recovery, or player-visible support mechanics, before spending held-out seeds.
