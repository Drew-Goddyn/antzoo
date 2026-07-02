# Fleet spending-era readback

Timestamp: 2026-07-02T12:32:48-07:00

This receipt reads the updated `docs/fleet/FLEET.md` as a bounded evidence runner would.

## Plan criteria readback

| Criterion | Readback |
|---|---|
| Baseline v2 dependency | Goal 01 is complete locally, and FLEET uses baseline v2 as the current comparison baseline. |
| Measurement era separated from spending era | Mission now distinguishes measurement-era finding accumulation from knowledge-spending work that proposes an intervention, changes an authorized surface, verifies it, and names player-visible effect. |
| Spending loop visible | Mission states the loop as repo finding -> proposed intervention -> controlled change -> verification -> human-visible effect. |
| Docs/reports are not game improvement | Mission says docs and reports alone do not count as game improvement. |
| Runtime-neutral fleet language | Mission says fleet, worker, and dispatch mean bounded evidence-loop cells and explicitly rejects orchestration infrastructure. |
| Report schema v2 | Report schema now uses concise markdown, exact command, config defaults and values, seeds/n, artifact SHA-256 listings, per-seed outcome/finalTick/finalHash tables, reading, verdict, and spending implication. |
| Fabrication tripwire preserved | The tripwire is per-seed final hashes plus mandatory replication spot-check; raw JSONL is stored as gzipped artifacts instead of pasted in full. |
| Historical baseline relabeled | The old Wave 1 dispatch baseline is labeled historical/pre-W1-Z1-fix, and current comparisons point to baseline v2. |
| Wave 3 manifest present | `Wave 3 - The God Matters` exists with target metric, acceptance bands, seed ledger, rescue protocol, candidate cells, confirmation cells, held-out cells, and failure criteria. |
| Cell-size ceiling | Wave 3 cells use at most 20 seeds; the final held-out range is split into 20/20/10 seed subcells. |
| Seed hygiene | Burned ranges 1337-1456 and 2000-2119 are recorded; tuning seeds 3000-3049 and held-out seeds 4000-4049 are separated; fallback 4050-4099 requires explicit authorization. |
| Scenario/CLI patching first | Manifest says candidate tuning uses scenario/CLI patching before default tuning values change. |
| Human play sign-off | Manifest requires final held-out evidence, `npm test`, and Drew's play sign-off before changing default tuning values. |
| Caste ratio guardrail | Manifest says every caste-ratio config must specify companion ratio keys, and names the full rival 75% tuple as 75/12.5/12.5. |
| Bounded runner clarity | A runner can execute W3-A0, W3-R75, W3-D110, W3-R75-D110, confirmation cells, optional tie-break, and held-out acceptance cells without asking for seed ranges, configs, rescue-arm definition, or metrics. |

## Claims still unsafe after this goal

- No Wave 3 candidate has been run.
- No default tuning value has been accepted.
- No held-out seed has been touched.
- No human-visible improvement has been proven.
- The rival 75% tuple is authorized for candidate evidence, not accepted as a shipped tuning change.

## Validation boundary

This goal is a docs-contract update. The required gate is `git diff --check`; no simulation or `npm test` run is required unless non-doc files change.
