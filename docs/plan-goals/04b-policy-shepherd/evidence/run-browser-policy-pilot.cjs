const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("playwright-core");

const repo = path.resolve(__dirname, "../../../..");
const evidenceRoot = path.join(repo, "docs/plan-goals/04b-policy-shepherd/evidence");
const baseUrl = "http://127.0.0.1:5173";
const seeds = [3005, 3006, 3007, 3008, 3009];
const maxTicks = 50000;
const stepLimit = 1200;
const policyTick = 6000;

const menu = {
  "worker-surge": {
    label: "Worker surge",
    values: { worker: 90, soldier: 5, nurse: 5 },
    expectedEffect: "increase player food-economy resilience by biasing future caste policy toward workers",
  },
  balanced: {
    label: "Balanced/default",
    values: { worker: 80, soldier: 10, nurse: 10 },
    expectedEffect: "preserve the default policy when no clear stress signal justifies a shift",
  },
  "nurse-recovery": {
    label: "Nurse recovery",
    values: { worker: 70, soldier: 5, nurse: 25 },
    expectedEffect: "favor recovery support when population/brood recovery is the main visible weakness",
  },
  "soldier-buffer": {
    label: "Soldier buffer",
    values: { worker: 70, soldier: 25, nurse: 5 },
    expectedEffect: "increase security buffer when rival pressure is the main visible weakness",
  },
};

function round(value) {
  return value == null ? value : Math.round(value * 100) / 100;
}

function sign(value) {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "flat";
}

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
    combatDeaths: data.deathsByCause.combat,
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

function observedStateText(snapshot, previousCompact) {
  const p = factionSummary(snapshot, "player");
  const r = factionSummary(snapshot, "rival");
  const previousPop = previousCompact ? previousCompact.player.population : p.population;
  const popDirection = sign(p.population - previousPop);
  return `P pop ${p.population} (${popDirection}), R pop ${r.population}, P food ${p.nestFood}, P/R delivered ${p.foodDelivered}/${r.foodDelivered}, nearest P/R ${p.nearestFood}/${r.nearestFood}, P starvation ${p.starvationDeaths}, R starvation ${r.starvationDeaths}`;
}

function choosePolicy(snapshot, previousCompact) {
  const p = factionSummary(snapshot, "player");
  const r = factionSummary(snapshot, "rival");
  const previousPop = previousCompact ? previousCompact.player.population : p.population;
  const playerNearest = p.nearestFood == null ? Infinity : p.nearestFood;
  const rivalNearest = r.nearestFood == null ? Infinity : r.nearestFood;

  if (p.nestFood <= 3 || p.foodDelivered < r.foodDelivered || playerNearest > rivalNearest + 120) {
    return {
      key: "worker-surge",
      rule: "Rule 1: food-economy stress",
      rationale: `player nestFood=${p.nestFood}, delivered P/R=${p.foodDelivered}/${r.foodDelivered}, nearest P/R=${p.nearestFood}/${r.nearestFood}`,
    };
  }

  if (p.population < 145 || p.population < previousPop) {
    return {
      key: "nurse-recovery",
      rule: "Rule 2: population recovery",
      rationale: `player population ${previousPop}->${p.population}, brood=${p.broodProgress}, nestFood=${p.nestFood}`,
    };
  }

  if (r.population >= p.population + 25) {
    return {
      key: "soldier-buffer",
      rule: "Rule 3: rival pressure",
      rationale: `rival population ${r.population} exceeds player population ${p.population} by ${r.population - p.population}`,
    };
  }

  return {
    key: "balanced",
    rule: "Rule 4: no strong stress signal",
    rationale: `no menu stress threshold crossed: player pop=${p.population}, rival pop=${r.population}, nestFood=${p.nestFood}`,
  };
}

function buildPrediction(before, previousCompact, action, stepSize) {
  const compact = compactSnapshot(before);
  const prevPop = previousCompact ? previousCompact.player.population : compact.player.population;
  const persistenceDirection = sign(compact.player.population - prevPop);
  const terminalPhase = phaseFrom(before);

  if (action) {
    const option = menu[action.key];
    return {
      observation: observedStateText(before, previousCompact),
      shepherd: `${option.label} at tick ${before.meta.tick} should keep player non-terminal and show a player food-delivery increase in the next ${stepSize} ticks; final interpretation will compare paired food, starvation, population, and outcome.`,
      persistence: `without state-aware policy understanding, player population direction remains ${persistenceDirection} and terminal phase remains ${terminalPhase}`,
      persistenceDirection,
    };
  }

  return {
    observation: observedStateText(before, previousCompact),
    shepherd: `before the policy decision, player remains non-terminal and population direction remains ${persistenceDirection} over the next ${stepSize} ticks`,
    persistence: `population direction remains ${persistenceDirection} and terminal phase remains ${terminalPhase}`,
    persistenceDirection,
  };
}

function scorePrediction(before, after, prediction, action) {
  const beforeP = factionSummary(before, "player");
  const afterP = factionSummary(after, "player");
  const popDirection = sign(afterP.population - beforeP.population);
  const terminalStable = phaseFrom(after) === phaseFrom(before);
  const persistenceHit = popDirection === prediction.persistenceDirection && terminalStable;

  let shepherdHit;
  let shepherdPartial;
  if (action) {
    const survived = !after.factions.player.gameOver;
    const deliveredUp = afterP.foodDelivered > beforeP.foodDelivered;
    shepherdHit = survived && deliveredUp;
    shepherdPartial = survived && !deliveredUp;
  } else {
    shepherdHit = !after.factions.player.gameOver && popDirection === prediction.persistenceDirection;
    shepherdPartial = !after.factions.player.gameOver && !shepherdHit;
  }

  return {
    shepherd: shepherdHit ? "hit" : shepherdPartial ? "partial" : "miss",
    persistence: persistenceHit ? "hit" : "miss",
    result: `P pop ${beforeP.population}->${afterP.population}, P food ${beforeP.nestFood}->${afterP.nestFood}, P delivered ${beforeP.foodDelivered}->${afterP.foodDelivered}, phase ${phaseFrom(before)}->${phaseFrom(after)}`,
  };
}

function markdownEscape(value) {
  return String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
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

async function ensureTuningDrawer(page) {
  const workerSlider = page.getByRole("slider", { name: /Worker/i }).first();
  if (await workerSlider.count() > 0) {
    await workerSlider.waitFor({ state: "visible" });
    return;
  }
  const toggle = page.getByRole("button", { name: /tuning drawer/i }).first();
  await toggle.click();
  await page.getByRole("slider", { name: /Worker/i }).first().waitFor({ state: "visible" });
}

async function sliders(page) {
  await ensureTuningDrawer(page);
  return {
    worker: page.getByRole("slider", { name: /Worker/i }).first(),
    soldier: page.getByRole("slider", { name: /Soldier/i }).first(),
    nurse: page.getByRole("slider", { name: /Nurse/i }).first(),
  };
}

async function readPolicy(page) {
  const controls = await sliders(page);
  return {
    worker: Number(await controls.worker.inputValue()),
    soldier: Number(await controls.soldier.inputValue()),
    nurse: Number(await controls.nurse.inputValue()),
  };
}

async function setPolicy(page, values) {
  const controls = await sliders(page);
  await controls.worker.fill(String(values.worker));
  await controls.soldier.fill(String(values.soldier));
  await controls.nurse.fill(String(values.nurse));
  const actual = await readPolicy(page);
  for (const key of ["worker", "soldier", "nurse"]) {
    if (actual[key] !== values[key]) {
      throw new Error(`visible policy slider ${key} expected ${values[key]} but read ${actual[key]}`);
    }
  }
  return actual;
}

function relPath(...parts) {
  return path.join("docs/plan-goals/04b-policy-shepherd/evidence", ...parts);
}

async function screenshot(page, relativePath) {
  const absolutePath = path.join(repo, relativePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await page.screenshot({ path: absolutePath, fullPage: true });
  return relativePath;
}

function transcriptMarkdown(result, replayInfo) {
  const lines = [];
  lines.push(`# Browser Policy Transcript - seed ${result.seed}`);
  lines.push("");
  lines.push(`- seed: ${result.seed}`);
  lines.push(`- URL: ${baseUrl}/?seed=${result.seed}&paused=1`);
  lines.push("- protocol: docs/plan-goals/04b-policy-shepherd/PLAN.md");
  lines.push(`- mode: ${result.mode}`);
  lines.push("- held-out check: not in 4000-4049 or 4050-4099");
  lines.push("- budget: caste policy 1; food/lure/boulder 0 in this diagnostic");
  lines.push(`- policy tick: ${policyTick}`);
  lines.push("");
  lines.push("## Starting State");
  lines.push("");
  lines.push("| Tick | Hash | Player pop | Rival pop | Player nest food | Rival nest food | Nearest food player/rival | Notes |");
  lines.push("|---:|---|---:|---:|---:|---:|---:|---|");
  lines.push(`| ${result.start.tick} | ${result.start.hash} | ${result.start.player.population} | ${result.start.rival.population} | ${result.start.player.nestFood} | ${result.start.rival.nestFood} | ${result.start.player.nearestFood}/${result.start.rival.nearestFood} | browser bridge snapshot |`);
  lines.push("");
  lines.push("## Prediction And Action Ledger");
  lines.push("");
  lines.push("| Before tick | Step | Observation | Shepherd prediction | Persistence prediction | Planned action | Screenshot | After tick | Result | Shepherd score | Persistence score |");
  lines.push("|---:|---:|---|---|---|---|---|---:|---|---|---|");
  for (const row of result.rows) {
    lines.push(`| ${row.beforeTick} | ${row.step} | ${markdownEscape(row.observation)} | ${markdownEscape(row.shepherdPrediction)} | ${markdownEscape(row.persistencePrediction)} | ${markdownEscape(row.plannedAction)} | ${row.screenshot || ""} | ${row.afterTick} | ${markdownEscape(row.result)} | ${row.shepherdScore} | ${row.persistenceScore} |`);
  }
  lines.push("");
  lines.push("## Policy Intervention");
  lines.push("");
  lines.push("| Tick | Before values | After values | Option | State rationale | Expected effect | Screenshot before | Screenshot after | Hash before | Hash after next step |");
  lines.push("|---:|---|---|---|---|---|---|---|---|---|");
  if (!result.policyAction) {
    lines.push("| | | | none | policy tick not reached | | | | | |");
  } else {
    const action = result.policyAction;
    lines.push(`| ${action.tick} | ${action.beforeValues.worker}/${action.beforeValues.soldier}/${action.beforeValues.nurse} | ${action.afterValues.worker}/${action.afterValues.soldier}/${action.afterValues.nurse} | ${markdownEscape(action.optionLabel)} | ${markdownEscape(action.rationale)} | ${markdownEscape(action.expectedEffect)} | ${action.beforeScreenshot} | ${action.afterScreenshot} | ${action.hashBefore} | ${action.hashAfterNextStep} |`);
  }
  lines.push("");
  lines.push("## Terminal Summary");
  lines.push("");
  lines.push("| Outcome | Final tick | Final hash | Player final pop | Rival final pop | Food delivered P/R | Starvation deaths P/R | Replay |");
  lines.push("|---|---:|---|---:|---:|---:|---:|---|");
  lines.push(`| ${result.final.outcome} | ${result.final.tick} | ${result.final.hash} | ${result.final.player.population} | ${result.final.rival.population} | ${result.final.player.foodDelivered}/${result.final.rival.foodDelivered} | ${result.final.player.starvationDeaths}/${result.final.rival.starvationDeaths} | ${replayInfo ? replayInfo.match ? "matched" : "mismatch" : "not replayed"} |`);
  return lines.join("\n") + "\n";
}

async function runPolicySeed(browser, seed, mode, replayPolicyAction = null) {
  const modeDir = mode === "fixed-policy-placebo" ? "policy-placebo" : mode === "policy-aware-replay" ? "replay" : "policy-aware";
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${baseUrl}/?seed=${seed}&paused=1`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(window.__antzoo));
  await page.evaluate(() => window.__antzoo.pause());
  await ensureTuningDrawer(page);

  const seedDir = path.join(modeDir, `seed-${seed}`);
  const startRead = await readSnapshot(page);
  let current = startRead.snapshot;
  let previousCompact = null;
  const start = compactSnapshot(current);
  const rows = [];
  let policyApplied = false;
  let policyAction = null;

  while (current.meta.tick < maxTicks && !current.factions.player.gameOver && !current.factions.rival.gameOver) {
    const before = current;
    const beforeCompact = compactSnapshot(before);
    const stepSize = Math.min(stepLimit, maxTicks - before.meta.tick);
    let action = null;
    let plannedAction = "none";
    let rowScreenshot = "";

    if (!policyApplied && before.meta.tick === policyTick) {
      if (replayPolicyAction) {
        action = {
          key: replayPolicyAction.optionKey,
          rule: "Replay: same visible policy option and tick as original policy-aware run",
          rationale: replayPolicyAction.rationale,
        };
      } else if (mode === "fixed-policy-placebo") {
        action = {
          key: "worker-surge",
          rule: "Fixed placebo: predeclared non-state-contingent action",
          rationale: "same Worker surge values at tick 6000 for every seed, chosen before per-seed state inspection",
        };
      } else {
        action = choosePolicy(before, previousCompact);
      }
    }

    const prediction = buildPrediction(before, previousCompact, action, stepSize);
    const hashBefore = before.meta.hash;

    if (action) {
      const option = menu[action.key];
      const beforeValues = await readPolicy(page);
      const beforeScreenshot = await screenshot(page, relPath(seedDir, `tick-${before.meta.tick}-policy-before.png`));
      const afterValues = await setPolicy(page, option.values);
      const afterScreenshot = await screenshot(page, relPath(seedDir, `tick-${before.meta.tick}-policy-after.png`));
      rowScreenshot = `${beforeScreenshot}; ${afterScreenshot}`;
      plannedAction = `${option.label} ${afterValues.worker}/${afterValues.soldier}/${afterValues.nurse}: ${action.rule}; ${action.rationale}`;
      policyAction = {
        tick: before.meta.tick,
        optionKey: action.key,
        optionLabel: option.label,
        rule: action.rule,
        rationale: action.rationale,
        expectedEffect: option.expectedEffect,
        beforeValues,
        afterValues,
        beforeScreenshot,
        afterScreenshot,
        observedState: prediction.observation,
        hashBefore,
        hashAfterImmediate: await page.evaluate(() => window.__antzoo.getHash()),
        hashAfterNextStep: null,
      };
      policyApplied = true;
    }

    const afterRead = await stepAndRead(page, stepSize);
    const after = afterRead.snapshot;
    const score = scorePrediction(before, after, prediction, action);

    if (action && policyAction) {
      policyAction.hashAfterNextStep = after.meta.hash;
    }

    rows.push({
      beforeTick: before.meta.tick,
      step: stepSize,
      observation: prediction.observation,
      shepherdPrediction: prediction.shepherd,
      persistencePrediction: prediction.persistence,
      plannedAction,
      screenshot: rowScreenshot,
      afterTick: after.meta.tick,
      result: score.result,
      shepherdScore: score.shepherd,
      persistenceScore: score.persistence,
    });

    previousCompact = beforeCompact;
    current = after;
  }

  const finalRead = await readSnapshot(page);
  const final = compactSnapshot(finalRead.snapshot);
  final.raw = finalRead.snapshot;
  final.outcome = finalOutcomeFrom(finalRead.snapshot, finalRead.events);
  const finalScreenshot = await screenshot(page, relPath(seedDir, "final.png"));
  await page.close();

  return {
    seed,
    mode,
    start,
    rows,
    policyAction,
    final,
    finalScreenshot,
    events: finalRead.events,
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

function compactResult(result) {
  return {
    seed: result.seed,
    mode: result.mode,
    outcome: result.final.outcome,
    finalTick: result.final.tick,
    finalHash: result.final.hash,
    playerFinalPop: result.final.player.population,
    rivalFinalPop: result.final.rival.population,
    playerFoodDelivered: result.final.player.foodDelivered,
    rivalFoodDelivered: result.final.rival.foodDelivered,
    playerStarvationDeaths: result.final.player.starvationDeaths,
    rivalStarvationDeaths: result.final.rival.starvationDeaths,
    policyAction: result.policyAction && {
      tick: result.policyAction.tick,
      optionKey: result.policyAction.optionKey,
      optionLabel: result.policyAction.optionLabel,
      values: result.policyAction.afterValues,
      rationale: result.policyAction.rationale,
      observedState: result.policyAction.observedState,
      screenshots: [result.policyAction.beforeScreenshot, result.policyAction.afterScreenshot],
      hashBefore: result.policyAction.hashBefore,
      hashAfterImmediate: result.policyAction.hashAfterImmediate,
      hashAfterNextStep: result.policyAction.hashAfterNextStep,
    },
  };
}

async function writeResult(result, replayInfo = null) {
  const modeDir = result.mode === "fixed-policy-placebo" ? "policy-placebo" : result.mode === "policy-aware-replay" ? "replay" : "policy-aware";
  const outDir = path.join(evidenceRoot, modeDir);
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, `seed-${result.seed}.json`), JSON.stringify(result, null, 2));
  await fs.writeFile(path.join(outDir, `seed-${result.seed}-transcript.md`), transcriptMarkdown(result, replayInfo));
}

(async () => {
  await fs.mkdir(evidenceRoot, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const fixedResults = [];
  const awareResults = [];

  for (const seed of seeds) {
    const result = await runPolicySeed(browser, seed, "fixed-policy-placebo");
    fixedResults.push(result);
    await writeResult(result);
  }

  for (const seed of seeds) {
    const result = await runPolicySeed(browser, seed, "policy-aware-shepherd");
    awareResults.push(result);
  }

  const replayOriginal = awareResults[0];
  const replayResult = await runPolicySeed(browser, replayOriginal.seed, "policy-aware-replay", replayOriginal.policyAction);
  const replayInfo = {
    seed: replayOriginal.seed,
    policyTick: replayOriginal.policyAction ? replayOriginal.policyAction.tick : null,
    optionKey: replayOriginal.policyAction ? replayOriginal.policyAction.optionKey : null,
    values: replayOriginal.policyAction ? replayOriginal.policyAction.afterValues : null,
    firstFinalHash: replayOriginal.final.hash,
    replayFinalHash: replayResult.final.hash,
    firstFinalTick: replayOriginal.final.tick,
    replayFinalTick: replayResult.final.tick,
    match: replayOriginal.final.hash === replayResult.final.hash,
  };

  for (const result of awareResults) {
    await writeResult(result, result.seed === replayInfo.seed ? replayInfo : null);
  }
  await writeResult(replayResult, replayInfo);
  await browser.close();

  const fixedSummary = {
    mode: "fixed-policy-placebo",
    seeds,
    policyTick,
    policy: menu["worker-surge"],
    results: fixedResults.map(compactResult),
    predictionScores: summarizeScores(fixedResults),
  };
  const awareSummary = {
    mode: "policy-aware-shepherd",
    seeds,
    policyTick,
    menu,
    results: awareResults.map(compactResult),
    predictionScores: summarizeScores(awareResults),
    replay: replayInfo,
  };
  const replayNote = [
    "# Replay Verification",
    "",
    `- seed: ${replayInfo.seed}`,
    `- policy tick: ${replayInfo.policyTick}`,
    `- option: ${replayInfo.optionKey}`,
    `- values: ${replayInfo.values ? `${replayInfo.values.worker}/${replayInfo.values.soldier}/${replayInfo.values.nurse}` : "none"}`,
    `- first final tick/hash: ${replayInfo.firstFinalTick} / ${replayInfo.firstFinalHash}`,
    `- replay final tick/hash: ${replayInfo.replayFinalTick} / ${replayInfo.replayFinalHash}`,
    `- match: ${replayInfo.match ? "yes" : "no"}`,
    "",
  ].join("\n");

  await fs.writeFile(path.join(evidenceRoot, "policy-placebo/fixed-policy-summary.json"), JSON.stringify(fixedSummary, null, 2));
  await fs.writeFile(path.join(evidenceRoot, "policy-aware/policy-aware-summary.json"), JSON.stringify(awareSummary, null, 2));
  await fs.writeFile(path.join(evidenceRoot, "replay/replay-verification.md"), replayNote);
  console.log(JSON.stringify({ fixedSummary, awareSummary }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
