# Policy Menu - Goal 04B

Predeclared before pilot execution.

| Option | Worker | Soldier | Nurse | Intended use |
|---|---:|---:|---:|---|
| Worker surge | 90 | 5 | 5 | Use when food economics are the visible problem: low nest food, delivery disadvantage, or poor food access. |
| Balanced/default | 80 | 10 | 10 | Use when no visible stressor is strong enough to justify a policy shift. |
| Nurse recovery | 70 | 5 | 25 | Use when population recovery or brood support is the visible problem. |
| Soldier buffer | 70 | 25 | 5 | Use when rival pressure is the visible problem and food stress is not primary. |

## Decision Rule

At tick `6000`, after observing browser state:

1. Choose `Worker surge` when player nest food is at or below `3`, player food delivered is below rival food delivered, or player nearest-food distance is more than `120` world units worse than rival nearest-food distance.
2. Else choose `Nurse recovery` when player population is below `145` or has declined since the prior chunk while brood/nest recovery looks more important than rival pressure.
3. Else choose `Soldier buffer` when rival population exceeds player population by at least `25` and worker-food stress is not the primary observed issue.
4. Else choose `Balanced/default`.

If multiple rules apply, use the first matching rule. Do not revise this menu or rule mid-pilot.

## Evidence Standard

Every policy-aware decision must record:

- tick
- before policy values from visible sliders
- observed state
- chosen menu option
- rationale tied to the observed state
- falsifiable expected effect
- before/after screenshot evidence
- hash after the next step
