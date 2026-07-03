const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("playwright-core");

const repo = path.resolve(__dirname, "../../../../..");
const outDir = path.join(repo, "docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd");
const seeds = [3000, 3001, 3002, 3003, 3004];
const maxTicks = 50000;
const stepLimit = 1200;
const baseUrl = "http://127.0.0.1:5173";

const actionPoints = {
  food: [
    { x: 1928, y: 1152 },
    { x: 2168, y: 1152 },
    { x: 2048, y: 1032 },
    { x: 2048, y: 1272 },
    { x: 1868, y: 1092 },
  ],
  lure: [
    { x: 2048, y: 1032 },
    { x: 2048, y: 1272 },
  ],
};

function factionSummary(snapshot, faction) {
  const data = snapshot.factions[faction];
  return {
    population: data.population.total,
    workers: data.population.byCaste.worker,
    soldiers: data.population.byCaste.soldier,
    nurses: data.population.byCaste.nurse,
    nestFood: round(data.nestFood),
    broodProgress: round(data.broodProgress),
    queenHunger: round(data.queenHunger),
    gameOver: data.gameOver,
    terminal: data.terminal,
    totalDeaths: data.totalDeaths,
    starvationDeaths: data.deathsByCause.starvation,
    foodDelivered: data.flow.foodDelivered,
    nearestFood: snapshot.food.nearestDistanceByFaction[faction] == null
      ? null
      : round(snapshot.food.nearestDistanceByFaction[faction]),
  };
}

function compactSnapshot(snapshot) {
  return {
    tick: snapshot.meta.tick,
    hash: snapshot.meta.hash,
    player: factionSummary(snapshot, "player"),
    rival: factionSummary(snapshot, "rival"),
  };
}

function round(value) {
  return value == null ? value : Math.round(value * 100) / 100;
}

function phaseFrom(snapshot) {
  if (snapshot.factions.player.gameOver || snapshot.factions.rival.gameOver) return "ended";
  return "running";
}

function finalOutcomeFrom(snapshot, events) {
  const victory = [...events].reverse().find((event) => event.type === "victory");
  if (victory) return victory.faction === 0 ? "victory" : "gameOver";
  if (snapshot.factions.rival.population.total === 0 && snapshot.factions.player.population.total > 0) return "victory";
  if (snapshot.factions.player.population.total === 0 && snapshot.factions.rival.population.total > 0) return "gameOver";
  return "running";
}

function sign(value) {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "flat";
}

function chooseAction(snapshot, budget) {
  const p = factionSummary(snapshot, "player");
  const r = factionSummary(snapshot, "rival");
  const tick = snapshot.meta.tick;
  const foodStress = p.nestFood < 14 || p.nearestFood == null || p.nearestFood > 280;
  const populationStress = tick >= 4800 && (p.population < 135 || p.population + 35 < r.population);
  const deliveryStress = tick >= 6000 && p.foodDelivered < r.foodDelivered * 0.85;

  if (budget.food > 0 && (foodStress || populationStress)) {
    const point = actionPoints.food[5 - budget.food];
    return {
      kind: "food",
      x: point.x,
      y: point.y,
      rationale: `player stress: nestFood=${p.nestFood}, nearestFood=${p.nearestFood}, pop=${p.population}, rivalPop=${r.population}`,
      expectedEffect: "increase or preserve player delivery/nest-food recovery before the next observation",
    };
  }

  if (budget.lure > 0 && (deliveryStress || (p.nearestFood != null && r.nearestFood != null && p.nearestFood > r.nearestFood + 120))) {
    const point = actionPoints.lure[2 - budget.lure];
    return {
      kind: "lure",
      x: point.x,
      y: point.y,
      rationale: `player pathing disadvantage: playerDelivered=${p.foodDelivered}, rivalDelivered=${r.foodDelivered}, nearestFood=${p.nearestFood}/${r.nearestFood}`,
      expectedEffect: "improve player forager routing enough that delivered food rises before terminal collapse",
    };
  }

  return null;
}

function buildPrediction(before, prevCompact, action, stepSize) {
  const p = factionSummary(before, "player");
  const r = factionSummary(before, "rival");
  const prevPopDelta = prevCompact ? p.population - prevCompact.player.population : 0;
  const persistenceDirection = sign(prevPopDelta);
  const stress = p.nestFood < 14 || p.population + 35 < r.population || p.nearestFood == null || p.nearestFood > 280;

  let prediction;
  if (action) {
    prediction = `${action.kind} action should keep player non-terminal and produce a player food-delivery increase or nest-food recovery signal within ${stepSize} ticks`;
  } else if (stress) {
    prediction = `without spending budget this chunk, player stress should persist: player remains non-terminal but population direction stays ${persistenceDirection}`;
  } else {
    prediction = `stable chunk: player remains non-terminal and population direction stays ${persistenceDirection}`;
  }

  return {
    observedState: `P pop ${p.population}, R pop ${r.population}, P food ${p.nestFood}, nearest P/R ${p.nearestFood}/${r.nearestFood}, P/R delivered ${p.foodDelivered}/${r.foodDelivered}`,
    shepherd: prediction,
    persistence: `population direction remains ${persistenceDirection} and terminal status remains ${phaseFrom(before)}`,
    persistenceDirection,
  };
}

function scorePrediction(before, after, prediction, action) {
  const beforeP = factionSummary(before, "player");
  const afterP = factionSummary(after, "player");
  const popDirection = sign(afterP.population - beforeP.population);
  const terminalStable = phaseFrom(after) === phaseFrom(before);
  const persistenceHit = popDirection === prediction.persistenceDirection && terminalStable;
  let shepherdHit = false;
  let shepherdPartial = false;

  if (action) {
    const deliveredUp = afterP.foodDelivered > beforeP.foodDelivered;
    const nestRecovered = afterP.nestFood >= beforeP.nestFood;
    const survived = !after.factions.player.gameOver;
    shepherdHit = survived && (deliveredUp || nestRecovered);
    shepherdPartial = survived && !shepherdHit;
  } else {
    shepherdHit = popDirection === prediction.persistenceDirection && !after.factions.player.gameOver;
    shepherdPartial = !after.factions.player.gameOver && !shepherdHit;
  }

  return {
    shepherd: shepherdHit ? "hit" : shepherdPartial ? "partial" : "miss",
    persistence: persistenceHit ? "hit" : "miss",
    result: `P pop ${beforeP.population}->${afterP.population}, P food ${beforeP.nestFood}->${afterP.nestFood}, P delivered ${beforeP.foodDelivered}->${afterP.foodDelivered}, phase ${phaseFrom(before)}->${phaseFrom(after)}`,
  };
}

async function readSnapshot(page) {
  return page.evaluate(() => {
    const api = window.__antzoo;
    const snapshot = api.getSnapshot();
    return { snapshot, hash: api.getHash(), events: api.getEvents() };
  });
}

async function stepAndRead(page, ticks) {
  return page.evaluate((n) => {
    const api = window.__antzoo;
    api.step(n);
    const snapshot = api.getSnapshot();
    return { snapshot, hash: api.getHash(), events: api.getEvents() };
  }, ticks);
}

async function applyTool(page, action) {
  return page.evaluate(({ kind, x, y }) => window.__antzoo.applyTool(kind, x, y), action);
}

function markdownEscape(value) {
  return String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
}

function transcriptMarkdown(seed, rows, interventions, start, final, replayInfo) {
  const lines = [];
  lines.push(`# Browser Shepherd Transcript - seed ${seed}`);
  lines.push("");
  lines.push(`- seed: ${seed}`);
  lines.push(`- URL: ${baseUrl}/?seed=${seed}&paused=1`);
  lines.push("- protocol: docs/fleet/browser/MILESTONE-1.md");
  lines.push("- mode: policy-aware shepherd");
  lines.push("- caste-policy slot: unused in this pilot run");
  lines.push("- held-out check: not in 4000-4049");
  lines.push("- budget: food 5, lure 2, boulder 1, caste policy 1");
  lines.push("");
  lines.push("## Starting State");
  lines.push("");
  lines.push("| Tick | Hash | Player pop | Rival pop | Player nest food | Rival nest food | Nearest food player/rival | Notes |");
  lines.push("|---:|---|---:|---:|---:|---:|---:|---|");
  lines.push(`| ${start.tick} | ${start.hash} | ${start.player.population} | ${start.rival.population} | ${start.player.nestFood} | ${start.rival.nestFood} | ${start.player.nearestFood}/${start.rival.nearestFood} | browser bridge snapshot |`);
  lines.push("");
  lines.push("## Prediction And Action Ledger");
  lines.push("");
  lines.push("| Before tick | Step | Observation | Shepherd prediction | Persistence prediction | Planned action | Screenshot | After tick | Result | Shepherd score | Persistence score | Budget left |");
  lines.push("|---:|---:|---|---|---|---|---|---:|---|---|---|---|");
  for (const row of rows) {
    lines.push(`| ${row.beforeTick} | ${row.step} | ${markdownEscape(row.observation)} | ${markdownEscape(row.shepherdPrediction)} | ${markdownEscape(row.persistencePrediction)} | ${markdownEscape(row.plannedAction)} | ${row.screenshot || ""} | ${row.afterTick} | ${markdownEscape(row.result)} | ${row.shepherdScore} | ${row.persistenceScore} | ${markdownEscape(row.budgetLeft)} |`);
  }
  lines.push("");
  lines.push("## Interventions");
  lines.push("");
  lines.push("| Tick | Type | Coordinates or values | State rationale | Expected effect | Screenshot | Hash before | Hash after |");
  lines.push("|---:|---|---|---|---|---|---|---|");
  if (interventions.length === 0) {
    lines.push("| | none | | no budget spent | | | | |");
  } else {
    for (const intervention of interventions) {
      lines.push(`| ${intervention.tick} | ${intervention.kind} | ${intervention.x},${intervention.y} | ${markdownEscape(intervention.rationale)} | ${markdownEscape(intervention.expectedEffect)} | ${intervention.screenshot} | ${intervention.hashBefore} | ${intervention.hashAfter} |`);
    }
  }
  lines.push("");
  lines.push("## Terminal Summary");
  lines.push("");
  lines.push("| Outcome | Final tick | Final hash | Player final pop | Rival final pop | Food delivered P/R | Starvation deaths P/R | Notes |");
  lines.push("|---|---:|---|---:|---:|---:|---:|---|");
  lines.push(`| ${final.outcome} | ${final.tick} | ${final.hash} | ${final.player.population} | ${final.rival.population} | ${final.player.foodDelivered}/${final.rival.foodDelivered} | ${final.player.starvationDeaths}/${final.rival.starvationDeaths} | replay ${replayInfo.match ? "matched" : "not checked"} |`);
  return lines.join("\n") + "\n";
}

async function runSeed(browser, seed, replayActions = null) {
  const page = await browser.newPage();
  await page.goto(`${baseUrl}/?seed=${seed}&paused=1`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(window.__antzoo));
  await page.evaluate(() => window.__antzoo.pause());

  const seedDir = path.join(outDir, `seed-${seed}`);
  await fs.mkdir(seedDir, { recursive: true });
  const startRead = await readSnapshot(page);
  let current = startRead.snapshot;
  let previousCompact = null;
  const start = compactSnapshot(current);
  const rows = [];
  const interventions = [];
  const budget = { food: 5, lure: 2, boulder: 1, policy: 1 };
  const replayMode = Array.isArray(replayActions);
  let replayIndex = 0;

  while (current.meta.tick < maxTicks && !current.factions.player.gameOver && !current.factions.rival.gameOver) {
    const before = current;
    const stepSize = Math.min(stepLimit, maxTicks - before.meta.tick);
    let action = null;

    if (replayMode) {
      if (replayActions[replayIndex] && replayActions[replayIndex].tick === before.meta.tick) {
        action = replayActions[replayIndex];
        replayIndex += 1;
      }
    } else {
      action = chooseAction(before, budget);
    }

    const prediction = buildPrediction(before, previousCompact, action, stepSize);
    let screenshot = "";
    let plannedAction = "none";
    const hashBefore = before.meta.hash;

    if (action) {
      screenshot = path.join("docs/plan-goals/04-browser-shepherd/evidence/pilot/browser-shepherd", `seed-${seed}`, `tick-${before.meta.tick}-${action.kind}.png`);
      await page.screenshot({ path: path.join(repo, screenshot), fullPage: true });
      await applyTool(page, action);
      if (budget[action.kind] != null) budget[action.kind] -= 1;
      plannedAction = `${action.kind} at ${action.x},${action.y}: ${action.rationale}`;
    }

    const afterRead = await stepAndRead(page, stepSize);
    const after = afterRead.snapshot;
    const score = scorePrediction(before, after, prediction, action);

    if (action) {
      interventions.push({
        tick: before.meta.tick,
        kind: action.kind,
        x: action.x,
        y: action.y,
        rationale: action.rationale,
        expectedEffect: action.expectedEffect,
        screenshot,
        hashBefore,
        hashAfter: after.meta.hash,
      });
    }

    rows.push({
      beforeTick: before.meta.tick,
      step: stepSize,
      observation: prediction.observedState,
      shepherdPrediction: prediction.shepherd,
      persistencePrediction: prediction.persistence,
      plannedAction,
      screenshot,
      afterTick: after.meta.tick,
      result: score.result,
      shepherdScore: score.shepherd,
      persistenceScore: score.persistence,
      budgetLeft: `food ${budget.food}, lure ${budget.lure}, boulder ${budget.boulder}, policy ${budget.policy}`,
    });

    previousCompact = compactSnapshot(before);
    current = after;
  }

  const finalRead = await readSnapshot(page);
  const final = compactSnapshot(finalRead.snapshot);
  final.raw = finalRead.snapshot;
  final.outcome = finalOutcomeFrom(finalRead.snapshot, finalRead.events);
  await page.screenshot({ path: path.join(seedDir, "final.png"), fullPage: true });
  await page.close();

  return { seed, start, rows, interventions, final, events: finalRead.events };
}

async function replaySeed(browser, original) {
  const replay = await runSeed(browser, original.seed, original.interventions);
  return {
    seed: original.seed,
    interventionTicks: original.interventions.map((item) => `${item.tick}:${item.kind}@${item.x},${item.y}`),
    firstFinalHash: original.final.hash,
    replayFinalHash: replay.final.hash,
    match: original.final.hash === replay.final.hash,
    replayFinalTick: replay.final.tick,
  };
}

function summarizeScores(results) {
  const totals = { shepherd: { hit: 0, partial: 0, miss: 0 }, persistence: { hit: 0, miss: 0 } };
  for (const result of results) {
    for (const row of result.rows) {
      totals.shepherd[row.shepherdScore] += 1;
      totals.persistence[row.persistenceScore] += 1;
    }
  }
  return totals;
}

(async () => {
  await fs.mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const results = [];
  for (const seed of seeds) {
    const result = await runSeed(browser, seed);
    results.push(result);
    await fs.writeFile(path.join(outDir, `seed-${seed}.json`), JSON.stringify(result, null, 2));
  }
  const replayInfo = await replaySeed(browser, results[0]);
  await browser.close();

  for (const result of results) {
    const replayForTranscript = result.seed === replayInfo.seed ? replayInfo : { match: false };
    await fs.writeFile(
      path.join(outDir, `seed-${result.seed}-transcript.md`),
      transcriptMarkdown(result.seed, result.rows, result.interventions, result.start, result.final, replayForTranscript),
    );
  }

  const summary = {
    seeds,
    maxTicks,
    stepLimit,
    budget: { food: 5, lure: 2, boulder: 1, castePolicy: 1 },
    castePolicy: "authorized by milestone but unused in this pilot",
    results: results.map((result) => ({
      seed: result.seed,
      outcome: result.final.outcome,
      finalTick: result.final.tick,
      finalHash: result.final.hash,
      playerFinalPop: result.final.player.population,
      rivalFinalPop: result.final.rival.population,
      playerFoodDelivered: result.final.player.foodDelivered,
      rivalFoodDelivered: result.final.rival.foodDelivered,
      playerStarvationDeaths: result.final.player.starvationDeaths,
      rivalStarvationDeaths: result.final.rival.starvationDeaths,
      interventions: result.interventions.map((item) => ({
        tick: item.tick,
        kind: item.kind,
        x: item.x,
        y: item.y,
        rationale: item.rationale,
      })),
    })),
    predictionScores: summarizeScores(results),
    replay: replayInfo,
  };
  await fs.writeFile(path.join(outDir, "browser-shepherd-summary.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
