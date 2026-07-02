# Wave 3 Synthesis Addendum

Status: COMPLETE - methodological addendum to the Goal 03 BLOCKED result.

This addendum does not rewrite the Goal 03 outcome. The BLOCKED result was correct: no tested candidate justified a default tuning change or held-out validation. The missing finding is methodological: rescue changed trajectories in a way that looks partly like a seed re-roll, while also delivering a real economic subsidy that did not reliably buy resilience.

All tables below are derived from the committed Goal 03 per-seed CSVs under `docs/plan-goals/03-wave3-agency-delta/evidence/`.

## Default Re-Roll Arithmetic

Default W3-A0 had 14 unattended wins and 6 unattended losses. If the rescue arm behaved like an independent trajectory re-roll with the same 70% win probability as unattended play, expected paired flips would be:

| Quantity | Arithmetic | Expected | Observed |
|---|---:|---:|---:|
| Losses -> wins | `6 * 0.70` | 4.2 | 5 |
| Wins -> losses | `14 * 0.30` | 4.2 | 4 |
| Unchanged wins | `14 * 0.70` | 9.8 | 10 |
| Unchanged losses | `6 * 0.30` | 1.8 | 1 |

Using the rescue arm's observed 75% marginal win rate gives the same shape: expected losses -> wins 4.5, wins -> losses 3.5, unchanged wins 10.5, unchanged losses 1.5. The default rescue result is therefore not a clean agency proof. It is compatible with a small net-positive perturbation riding on top of chaotic paired flips.

## Paired Flip Tables

### W3-A0 default tuning

Flip count: losses -> wins 5, wins -> losses 4, unchanged wins 10, unchanged losses 1.

| Seed | Unattended | Rescue | Flip |
|---:|---|---|---|
| 3000 | victory | victory | unchanged win |
| 3001 | gameOver | gameOver | unchanged loss |
| 3002 | gameOver | victory | loss->win |
| 3003 | victory | victory | unchanged win |
| 3004 | gameOver | victory | loss->win |
| 3005 | victory | gameOver | win->loss |
| 3006 | victory | victory | unchanged win |
| 3007 | victory | victory | unchanged win |
| 3008 | victory | victory | unchanged win |
| 3009 | victory | victory | unchanged win |
| 3010 | victory | victory | unchanged win |
| 3011 | victory | victory | unchanged win |
| 3012 | victory | gameOver | win->loss |
| 3013 | victory | victory | unchanged win |
| 3014 | gameOver | victory | loss->win |
| 3015 | victory | victory | unchanged win |
| 3016 | gameOver | victory | loss->win |
| 3017 | victory | gameOver | win->loss |
| 3018 | gameOver | victory | loss->win |
| 3019 | victory | gameOver | win->loss |

### W3-R75 stronger rival candidate

Flip count: losses -> wins 2, wins -> losses 4, unchanged wins 7, unchanged losses 7.

| Seed | Unattended | Rescue | Flip |
|---:|---|---|---|
| 3000 | victory | gameOver | win->loss |
| 3001 | gameOver | victory | loss->win |
| 3002 | victory | victory | unchanged win |
| 3003 | gameOver | gameOver | unchanged loss |
| 3004 | victory | victory | unchanged win |
| 3005 | victory | gameOver | win->loss |
| 3006 | victory | victory | unchanged win |
| 3007 | gameOver | victory | loss->win |
| 3008 | victory | gameOver | win->loss |
| 3009 | victory | victory | unchanged win |
| 3010 | gameOver | gameOver | unchanged loss |
| 3011 | victory | victory | unchanged win |
| 3012 | gameOver | gameOver | unchanged loss |
| 3013 | victory | gameOver | win->loss |
| 3014 | gameOver | gameOver | unchanged loss |
| 3015 | gameOver | gameOver | unchanged loss |
| 3016 | victory | victory | unchanged win |
| 3017 | victory | victory | unchanged win |
| 3018 | gameOver | gameOver | unchanged loss |
| 3019 | gameOver | gameOver | unchanged loss |

### W3-D110 drain-pressure candidate

Flip count: losses -> wins 2, wins -> losses 3, unchanged wins 14, unchanged losses 1. The rescue seed 3011 was `running` at the 50k budget and is counted as a non-win for the flip table.

| Seed | Unattended | Rescue | Flip |
|---:|---|---|---|
| 3000 | victory | victory | unchanged win |
| 3001 | victory | victory | unchanged win |
| 3002 | victory | gameOver | win->loss |
| 3003 | gameOver | gameOver | unchanged loss |
| 3004 | victory | victory | unchanged win |
| 3005 | victory | victory | unchanged win |
| 3006 | victory | victory | unchanged win |
| 3007 | victory | victory | unchanged win |
| 3008 | victory | victory | unchanged win |
| 3009 | victory | victory | unchanged win |
| 3010 | victory | victory | unchanged win |
| 3011 | victory | running | win->loss |
| 3012 | victory | gameOver | win->loss |
| 3013 | victory | victory | unchanged win |
| 3014 | victory | victory | unchanged win |
| 3015 | victory | victory | unchanged win |
| 3016 | gameOver | victory | loss->win |
| 3017 | victory | victory | unchanged win |
| 3018 | victory | victory | unchanged win |
| 3019 | gameOver | victory | loss->win |

### W3-R75-D110 combined candidate

Flip count: losses -> wins 1, wins -> losses 3, unchanged wins 13, unchanged losses 3.

| Seed | Unattended | Rescue | Flip |
|---:|---|---|---|
| 3000 | gameOver | gameOver | unchanged loss |
| 3001 | victory | victory | unchanged win |
| 3002 | victory | victory | unchanged win |
| 3003 | victory | gameOver | win->loss |
| 3004 | victory | gameOver | win->loss |
| 3005 | gameOver | victory | loss->win |
| 3006 | victory | victory | unchanged win |
| 3007 | victory | victory | unchanged win |
| 3008 | victory | victory | unchanged win |
| 3009 | victory | gameOver | win->loss |
| 3010 | victory | victory | unchanged win |
| 3011 | victory | victory | unchanged win |
| 3012 | victory | victory | unchanged win |
| 3013 | victory | victory | unchanged win |
| 3014 | gameOver | gameOver | unchanged loss |
| 3015 | victory | victory | unchanged win |
| 3016 | victory | victory | unchanged win |
| 3017 | victory | victory | unchanged win |
| 3018 | victory | victory | unchanged win |
| 3019 | gameOver | gameOver | unchanged loss |

## Mechanism Deltas

Values are paired medians, rescue minus unattended, computed from each committed per-seed CSV. `P/R` means player/rival.

| Cell | dFood delivered P/R | dPeak pop P/R | dStarvation deaths P/R | dFinal pop P/R | dFinalTick |
|---|---:|---:|---:|---:|---:|
| W3-A0 | +148 / -43.5 | 0 / 0 | +5 / +2.5 | +7 / 0 | +254.5 |
| W3-R75 | +144 / -10 | 0 / 0 | +12 / +3.5 | 0 / 0 | -1015.5 |
| W3-D110 | +80.5 / -2.5 | 0 / 0 | -2.5 / +0.5 | +10 / 0 | -152 |
| W3-R75-D110 | +129.5 / +17 | 0 / 0 | +26.5 / +11.5 | 0 / 0 | +1887.5 |

The default rescue protocol clearly delivered an economic subsidy: median player food delivered increased by 148 over unattended. That subsidy did not reliably purchase resilience. In the same default cell, four unattended wins became rescue losses, player starvation deaths increased by a paired median of 5, and the net win-rate movement was only +1 seed. The right reading is compensation without a validated agency claim.

## Out-of-Sample Prediction Findings

- Rival-75 landed where the knowledge base predicted a contested/risk band could exist: W3-R75 unattended play was 11/20 player wins, or 55%, inside the target 55-65% risk band. The candidate still failed because rescue fell to 9/20 wins.
- Drain-1.32 moved unattended play safer in the direction prior drain findings implied. W3-D110 unattended play rose to 17/20 wins from the default 14/20 on the same tuning seeds, with lower median player starvation deaths than default unattended. That made it unsuitable for the Wave 3 agency target, but the directional prediction held.

## Methodological Finding

Raw win-rate deltas are not enough in this deterministic chaotic simulation. Any intervention that changes the trajectory must be compared on paired seeds against a placebo or null perturbation, and the synthesis must report paired flips plus mechanism deltas. A headline improvement such as 14/20 to 15/20 wins can hide a churn pattern of wins becoming losses and losses becoming wins.

Goal 04 must therefore avoid treating a tiny unpaired browser-shepherd win-rate improvement as agency. It needs placebo-calibrated paired analysis, mechanism deltas, and a rule for distinguishing perturbation luck from state-contingent shepherding.
