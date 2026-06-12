# Cell W0-B-rerun — Verify the sweep mechanism works and outputs are deterministic

- command:
  ```sh
  npm run sim -- --seeds 1337,1338,1339,1340,1341,1342,1343,1344,1345,1346 --ticks 50000 --scenario scenarios/W0-B-patch.json
  ```
  *(The scenario file `scenarios/W0-B-patch.json` was created containing `{"name": "W0-B-rerun", "tuning": { "ant.drainPerSec": 1.5 }, "timeline": []}`)*
- config: `ant.drainPerSec` patched to 1.5 (default is 1.2)
- seeds: 1337, 1338, 1339, 1340, 1341, 1342, 1343, 1344, 1345, 1346  n=10
- runtime: ~5 minutes

## Results (verbatim)

Run 1 `cross_seed_rollup`:
```json
{"type":"cross_seed_rollup","runs":10,"finalHashes":["b808d466e366fc8a","ce2c341287167302","132d89b956aeebcd","8cd192a4bf1a17b4","d68b5c305f89a7b8","a84b13488730ac98","64700be87ff9c208","7b6f85e153d04d5d","7077b97f59c1b417","76d5e5b671552dea"],"hashesAllMatch":false,"outcomeCounts":{"running":0,"gameOver":0,"victory":10},"factionOutcomeCounts":{"player":{"running":0,"gameOver":0,"victory":10},"rival":{"running":0,"gameOver":10,"victory":0}},"deathsByCauseMedians":{"player":{"starvation":137,"spider":0,"combat":0,"terminal_cull":0},"rival":{"starvation":145,"spider":0,"combat":0.5,"terminal_cull":24}},"obituaryAggregateMedians":{"player":{"starvation":{"count":1164,"medianAge":7783,"medianDeliveries":2.5,"medianTicksSinceFoodPerceived":58.349281311035156},"spider":{"count":19,"medianAge":8258,"medianDeliveries":2.5,"medianTicksSinceFoodPerceived":56.31597900390625},"combat":{"count":3,"medianAge":2976,"medianDeliveries":3,"medianTicksSinceFoodPerceived":5.416682243347168},"terminal_cull":{"count":0,"medianAge":null,"medianDeliveries":null,"medianTicksSinceFoodPerceived":null}},"rival":{"starvation":{"count":1373,"medianAge":6442,"medianDeliveries":0,"medianTicksSinceFoodPerceived":66.6497573852539},"spider":{"count":12,"medianAge":8916,"medianDeliveries":0,"medianTicksSinceFoodPerceived":124.98721694946289},"combat":{"count":8,"medianAge":3640,"medianDeliveries":0.5,"medianTicksSinceFoodPerceived":9.533273696899414},"terminal_cull":{"count":291,"medianAge":11190,"medianDeliveries":0,"medianTicksSinceFoodPerceived":149.92417907714844}}},"populationQuartiles":{"peak":{"player":{"count":10,"min":184,"q1":187.25,"median":196,"q3":200,"max":205},"rival":{"count":10,"min":161,"q1":163.25,"median":166,"q3":166.75,"max":171}},"final":{"player":{"count":10,"min":39,"q1":63.25,"median":83,"q3":120.75,"max":182},"rival":{"count":10,"min":0,"q1":0,"median":0,"q3":0,"max":0}}},"flowTotals":{"player":{"foodDelivered":7575,"queenConsumed":0,"broodConsumed":3344,"snackEnergyGained":78294.63914773613,"drainTotal":424166.59001280606},"rival":{"foodDelivered":2432,"queenConsumed":0,"broodConsumed":938,"snackEnergyGained":16845.65778531134,"drainTotal":290244.6150055901}},"flowDeficitRatios":{"player":{"drainTotalToSnackEnergyGained":5.417568745829908,"foodDeliveredToQueenBroodConsumed":2.265251196172249},"rival":{"drainTotalToSnackEnergyGained":17.22963975076535,"foodDeliveredToQueenBroodConsumed":2.5927505330490406}},"ticksPerSecondQuartiles":{"count":10,"min":202.5894571809913,"q1":207.05153056008578,"median":214.66449551077943,"q3":225.88002869028287,"max":239.29789911088218}}
```

Run 2 `cross_seed_rollup`:
```json
{"type":"cross_seed_rollup","runs":10,"finalHashes":["b808d466e366fc8a","ce2c341287167302","132d89b956aeebcd","8cd192a4bf1a17b4","d68b5c305f89a7b8","a84b13488730ac98","64700be87ff9c208","7b6f85e153d04d5d","7077b97f59c1b417","76d5e5b671552dea"],"hashesAllMatch":false,"outcomeCounts":{"running":0,"gameOver":0,"victory":10},"factionOutcomeCounts":{"player":{"running":0,"gameOver":0,"victory":10},"rival":{"running":0,"gameOver":10,"victory":0}},"deathsByCauseMedians":{"player":{"starvation":137,"spider":0,"combat":0,"terminal_cull":0},"rival":{"starvation":145,"spider":0,"combat":0.5,"terminal_cull":24}},"obituaryAggregateMedians":{"player":{"starvation":{"count":1164,"medianAge":7783,"medianDeliveries":2.5,"medianTicksSinceFoodPerceived":58.349281311035156},"spider":{"count":19,"medianAge":8258,"medianDeliveries":2.5,"medianTicksSinceFoodPerceived":56.31597900390625},"combat":{"count":3,"medianAge":2976,"medianDeliveries":3,"medianTicksSinceFoodPerceived":5.416682243347168},"terminal_cull":{"count":0,"medianAge":null,"medianDeliveries":null,"medianTicksSinceFoodPerceived":null}},"rival":{"starvation":{"count":1373,"medianAge":6442,"medianDeliveries":0,"medianTicksSinceFoodPerceived":66.6497573852539},"spider":{"count":12,"medianAge":8916,"medianDeliveries":0,"medianTicksSinceFoodPerceived":124.98721694946289},"combat":{"count":8,"medianAge":3640,"medianDeliveries":0.5,"medianTicksSinceFoodPerceived":9.533273696899414},"terminal_cull":{"count":291,"medianAge":11190,"medianDeliveries":0,"medianTicksSinceFoodPerceived":149.92417907714844}}},"populationQuartiles":{"peak":{"player":{"count":10,"min":184,"q1":187.25,"median":196,"q3":200,"max":205},"rival":{"count":10,"min":161,"q1":163.25,"median":166,"q3":166.75,"max":171}},"final":{"player":{"count":10,"min":39,"q1":63.25,"median":83,"q3":120.75,"max":182},"rival":{"count":10,"min":0,"q1":0,"median":0,"q3":0,"max":0}}},"flowTotals":{"player":{"foodDelivered":7575,"queenConsumed":0,"broodConsumed":3344,"snackEnergyGained":78294.63914773613,"drainTotal":424166.59001280606},"rival":{"foodDelivered":2432,"queenConsumed":0,"broodConsumed":938,"snackEnergyGained":16845.65778531134,"drainTotal":290244.6150055901}},"flowDeficitRatios":{"player":{"drainTotalToSnackEnergyGained":5.417568745829908,"foodDeliveredToQueenBroodConsumed":2.265251196172249},"rival":{"drainTotalToSnackEnergyGained":17.22963975076535,"foodDeliveredToQueenBroodConsumed":2.5927505330490406}},"ticksPerSecondQuartiles":{"count":10,"min":202.56731253717805,"q1":207.61499833776594,"median":214.89637557356545,"q3":227.4761072326901,"max":239.85172404011786}}
```

<details>
<summary>Per-seed hash comparison (Baseline vs Patched Run 1 vs Patched Run 2)</summary>

| Seed | Baseline Hash | Patched Run 1 Hash | Patched Run 2 Hash |
| --- | --- | --- | --- |
| 1337 | `5101d7c52c007c01` | `b808d466e366fc8a` | `b808d466e366fc8a` |
| 1338 | `1d6e8afbadcc2857` | `ce2c341287167302` | `ce2c341287167302` |
| 1339 | `2e89d70f70296a7b` | `132d89b956aeebcd` | `132d89b956aeebcd` |
| 1340 | `b75aba4755593fb7` | `8cd192a4bf1a17b4` | `8cd192a4bf1a17b4` |
| 1341 | `fca8617abbb3f2f6` | `d68b5c305f89a7b8` | `d68b5c305f89a7b8` |
| 1342 | `1897ceb6108277b6` | `a84b13488730ac98` | `a84b13488730ac98` |
| 1343 | `bed761ead7507a76` | `64700be87ff9c208` | `64700be87ff9c208` |
| 1344 | `2a0e9c22ec163d0a` | `7b6f85e153d04d5d` | `7b6f85e153d04d5d` |
| 1345 | `871c5298b3da8c48` | `7077b97f59c1b417` | `7077b97f59c1b417` |
| 1346 | `da4d2304cc3b4cb8` | `76d5e5b671552dea` | `76d5e5b671552dea` |
</details>

## Reading
- The patch was successfully applied: for every seed (n=10), the patched run hash differs from the baseline hash.
- The two identical patched runs produced exactly the same per-seed final hashes.
- win_rate: 10/10 (player), no runs hit the tick budget still "running".
- vs baseline: The patched runs exhibit identical performance characteristics to one another except for performance timing (e.g. `ticksPerSecondQuartiles`).

## Verdict
The sweep mechanism works for scenario tuning patches (evidenced by baseline hash divergence when `ant.drainPerSec` is patched), and deterministic simulation outputs are stable across repeated identical patched runs (identical per-seed hashes).
Confidence: high — The two runs yielded byte-identical state hashes for all 10 seeds.
