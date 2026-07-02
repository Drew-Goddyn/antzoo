# Rescue Scenario Determinism

- Seed: 3000
- Config: default tuning
- Scenario: `scenarios/rescue-protocol.json`
- Tick budget: 50000
- Hash cadence: every 1000 ticks
- Hash records compared: 14
- Hash series match: true
- Final summary match: true

## Stimulus Timeline Observed

| Tick | Tool | X | Y |
|---:|---|---:|---:|
| 6000 | food | 1928 | 1152 |
| 9000 | lure | 2048 | 1032 |
| 12000 | food | 2168 | 1152 |

## Final Summary

| Run | Outcome | Final tick | Final hash | Player final pop | Rival final pop |
|---|---|---:|---|---:|---:|
| run1 | victory | 14969 | 739dff72fea1fc42 | 131 | 0 |
| run2 | victory | 14969 | 739dff72fea1fc42 | 131 | 0 |

## Artifacts

- docs/plan-goals/03-wave3-agency-delta/evidence/rescue-determinism-run1.jsonl
- docs/plan-goals/03-wave3-agency-delta/evidence/rescue-determinism-run2.jsonl

Timing telemetry was ignored for this comparison because it is nondeterministic performance data, not simulation state.
