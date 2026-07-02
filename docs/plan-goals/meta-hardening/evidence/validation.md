# Meta-Hardening Validation

Validation run from `/Users/Drew/projects/antzoo` after the plan-goal hardening pass.

## Markdown/link sanity

Command:

```sh
if [ -x ./node_modules/.bin/markdownlint ]; then ./node_modules/.bin/markdownlint docs/roadmap.md docs/plan-goals; else echo 'markdownlint unavailable'; fi
if command -v lychee >/dev/null 2>&1; then lychee docs/roadmap.md docs/plan-goals/**/*.md; else echo 'lychee unavailable'; fi
rg -n '\[[^]]+\]\([^)]*\)' docs/roadmap.md docs/plan-goals || true
```

Result:

```text
markdownlint unavailable
lychee unavailable
```

No Markdown inline links were found by the `rg` sanity check, so there were no local Markdown links to resolve in the edited docs.

## Existing progress ledgers

Command:

```sh
for f in docs/plan-goals/*/progress.jsonl; do node -e 'const fs=require("fs"); const file=process.argv[1]; const required=["ts","status","goal","summary","files","commands","evidence","claims","remaining"]; for (const [idx,line] of fs.readFileSync(file,"utf8").trim().split(/\n/).entries()) { const o=JSON.parse(line); for (const key of required) if (!(key in o)) throw new Error(`${file}:${idx+1} missing ${key}`); } console.log(`OK ${file}`);' "$f" || exit 1; done
```

Result:

```text
OK docs/plan-goals/01-baseline-v2/progress.jsonl
OK docs/plan-goals/02-fleet-spending-era/progress.jsonl
OK docs/plan-goals/03-wave3-agency-delta/progress.jsonl
OK docs/plan-goals/04-browser-shepherd/progress.jsonl
OK docs/plan-goals/05-proof-receipts/progress.jsonl
OK docs/plan-goals/06-rival-viability/progress.jsonl
OK docs/plan-goals/07-living-product/progress.jsonl
OK docs/plan-goals/08-antzoo-bench/progress.jsonl
```

## Required plan sections

Command:

```sh
for f in docs/plan-goals/*/PLAN.md; do for p in "This goal is not complete" "GOAL_OUTCOME.md" "progress.jsonl Schema" "Protected Files" "Stop Behavior"; do rg -q "$p" "$f" || { echo "MISSING $p in $f"; exit 1; }; done; done; echo 'all PLAN.md required sections present'
```

Result:

```text
all PLAN.md required sections present
```

Command:

```sh
for f in docs/plan-goals/02-fleet-spending-era/PLAN.md docs/plan-goals/03-wave3-agency-delta/PLAN.md docs/plan-goals/04-browser-shepherd/PLAN.md docs/plan-goals/07-living-product/PLAN.md docs/plan-goals/08-antzoo-bench/PLAN.md; do for p in "No Orchestration Rabbit Hole" "Knowledge-Spending Requirement"; do rg -q "$p" "$f" || { echo "MISSING $p in $f"; exit 1; }; done; done; echo 'orchestration and knowledge-spending sections present where required'
```

Result:

```text
orchestration and knowledge-spending sections present where required
```

## Diff hygiene

Command:

```sh
git diff --check
```

Result: passed with no output.

## Not run

`npm test` was not run because this meta-goal changed documentation only and did not touch executable code, package files, scenarios, simulation, tuning, generated output, or historical fleet reports.
