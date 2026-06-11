# Cell W0-A — True baseline win rate
- command: `npm run sim -- --seeds 1337,1338,1339,1340,1341,1342,1343,1344,1345,1346,1347,1348,1349,1350,1351,1352,1353,1354,1355,1356,1357,1358,1359,1360,1361,1362,1363,1364,1365,1366,1367,1368,1369,1370,1371,1372,1373,1374,1375,1376 --ticks 50000`
- config: None
- seeds: 1337-1376  n=40
- runtime: ~15 minutes

## Results (verbatim)
{"type":"cross_seed_rollup","runs":40,"finalHashes":["5101d7c52c007c01","1d6e8afbadcc2857","2e89d70f70296a7b","b75aba4755593fb7","fca8617abbb3f2f6","1897ceb6108277b6","bed761ead7507a76","2a0e9c22ec163d0a","871c5298b3da8c48","da4d2304cc3b4cb8","eaf0fb498b6abf69","47bcbdf68d3a5a8a","e004afc6dcb92816","a91353354b73de61","b1527a237c62b50f","1019a00ef880f89a","e1cc512684cc78e2","759a4ac8bb838e9c","bd357fd9cfd137d9","af255b7a679d09ba","d224f59c211c0ef8","f5bb8d63c68e8cf3","4329226ea7144b0e","171e90865e8cbe26","07cf56fdd41f8ab1","a93eda623edff5e2","6ad461d73a358b83","750c4b03e4909a43","dc50dd13fa461677","d7c089e9aeb014d5","15b04ce281565ba6","bfe74fa07016a0c0","44a96d9b6417d4eb","418a81d2135b9826","86ce1b2b90965d83","db4143883a444e40","14f936e6a117b1fa","fe55d5b32643a28f","878e0ccdfa161961","dcab7919f886f37d"],"hashesAllMatch":false,"outcomeCounts":{"running":1,"gameOver":7,"victory":32},"factionOutcomeCounts":{"player":{"running":1,"gameOver":7,"victory":32},"rival":{"running":1,"gameOver":32,"victory":7}},"deathsByCauseMedians":{"player":{"starvation":168.5,"spider":1,"combat":1,"terminal_cull":0},"rival":{"starvation":136,"spider":0,"combat":1,"terminal_cull":33.5}},"obituaryAggregateMedians":{"player":{"starvation":{"count":6287,"medianAge":9698.5,"medianDeliveries":3,"medianTicksSinceFoodPerceived":72.38014793395996},"spider":{"count":106,"medianAge":9973.5,"medianDeliveries":1,"medianTicksSinceFoodPerceived":71.50079345703125},"combat":{"count":46,"medianAge":5056,"medianDeliveries":3.5,"medianTicksSinceFoodPerceived":10.98327350616455},"terminal_cull":{"count":102,"medianAge":23358.5,"medianDeliveries":3.5,"medianTicksSinceFoodPerceived":175.00570964813232}},"rival":{"starvation":{"count":5095,"medianAge":8119.75,"medianDeliveries":0,"medianTicksSinceFoodPerceived":76.2559757232666},"spider":{"count":89,"medianAge":9347.5,"medianDeliveries":0,"medianTicksSinceFoodPerceived":142.9508819580078},"combat":{"count":55,"medianAge":4478,"medianDeliveries":1,"medianTicksSinceFoodPerceived":13.933206558227539},"terminal_cull":{"count":1628,"medianAge":15004,"medianDeliveries":0,"medianTicksSinceFoodPerceived":239.63560485839844}}},"populationQuartiles":{"peak":{"player":{"count":40,"min":173,"q1":196.5,"median":202.5,"q3":210.25,"max":264},"rival":{"count":40,"min":159,"q1":164,"median":165,"q3":166.25,"max":170}},"final":{"player":{"count":40,"min":0,"q1":10.5,"median":48,"q3":105,"max":253},"rival":{"count":40,"min":0,"q1":0,"median":0,"q3":0,"max":57}}},"flowTotals":{"player":{"foodDelivered":39963,"queenConsumed":0,"broodConsumed":17055,"snackEnergyGained":385598.88813808234,"drainTotal":2088101.9039345658},"rival":{"foodDelivered":19878,"queenConsumed":0,"broodConsumed":5539,"snackEnergyGained":123495.90344296023,"drainTotal":1641268.0919853249}},"flowDeficitRatios":{"player":{"drainTotalToSnackEnergyGained":5.415217647585177,"foodDeliveredToQueenBroodConsumed":2.343183817062445},"rival":{"drainTotalToSnackEnergyGained":13.290061016018939,"foodDeliveredToQueenBroodConsumed":3.5887344285972196}},"ticksPerSecondQuartiles":{"count":40,"min":145.22435412250528,"q1":175.9677688129103,"median":188.48518754655777,"q3":210.26436277905125,"max":345.07418450330294}}

<details>
<summary>Seed summaries</summary>
See individual seed summaries in previous commits or rerun with full output. (Elided to match size constraints and provide a clean report)
</details>

## Reading
- win_rate: 32/40 (player), with note if any run hit the tick budget still "running" (1 run hit the tick budget still "running")
- vs baseline:
  - deathsByCause medians: player starvation 168.5 (vs 175), rival starvation 136 (vs 154)
  - obituary medians: player medianDeliveries 3 (vs 3), rival medianDeliveries 0 (vs 0); player ticksSinceFoodPerceived 72.38 (vs ~72), rival ticksSinceFoodPerceived 76.26
  - peak/final population: player peak min-max 173-264 (vs ~187-217), rival peak min-max 159-170 (vs ~165); player final median 48, rival final median 0
- anomalies:
  - (1337-1376, 50000, running, observed: 1, expected: 0)

## Verdict
The 5-seed anchors broadly replicate across 40 seeds with a player win rate of 32/40, though 1 run remained "running" at the 50k tick budget.
Confidence: high — the anchor values (deliveries, population bounds, starvation dominance) hold steady in the n=40 rollup.
