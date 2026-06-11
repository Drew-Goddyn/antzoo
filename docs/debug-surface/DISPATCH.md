STATUS: COMPLETE — historical. Active program: docs/fleet/FLEET.md. Worker manual: DEBUG.md.

# antzoo debug surface — dispatch prompts

Companion to `docs/debug-surface/BRIEF.md` (commit this file alongside it as `docs/debug-surface/DISPATCH.md`). Execution model: **one autonomous build run, then one adversarial audit run by a different agent, with the human reading verdicts and DEBUG.md — never code.**

---

## Prompt A — the build run

Paste into a fresh session of your build agent, at the repo root. In Codex CLI prefix with `/goal` (enable via `/experimental` first); in Claude Code or anywhere else paste as-is.

```
Implement docs/debug-surface/BRIEF.md completely, working stage by stage in
strict order (Stage 1, then 2, then 3, then 4). Read the BRIEF in full
before writing any code, and re-read the relevant stage before starting it.
Commit each stage separately with the stage name in the commit message.

Non-negotiable invariants from the BRIEF: zero gameplay behavior changes;
instrumentation never calls nextRand or mutates gameplay state; no refactors
of sim.ts; every per-ant debug array is copied in copyAntSlot; do not split
the RNG streams; do not change respawnNonFiniteAnt behavior.

Validation loop: at the end of each stage, actually execute that stage's
acceptance gates from the BRIEF (T0 hash sensitivity sweep, determinism,
purity, parity hash comparisons against the previous stage's final commit,
throughput measurements, the Playwright snippet for Stage 3, the
retrospective trace demo for Stage 4) and record the command outputs
verbatim in docs/debug-surface/PROGRESS.md before starting the next stage.
A failing gate means fix the code — never weaken a gate, a test, or the
hash. If the BRIEF is ambiguous anywhere, take the conservative
interpretation, note the ambiguity in PROGRESS.md, and continue without
asking.

Stop when all Stage 4 gates pass with typecheck and build clean, or stop
and report if any gate cannot be satisfied without violating an invariant.
```

## Prompt B — the adversarial audit

After the build run finishes, paste into a **fresh session of the other agent** (whichever did not write the code), at the repo root on the build branch.

```
Read docs/debug-surface/BRIEF.md, DEBUG.md, and PROGRESS.md. You did not
write this code; your job is to break it, not improve it. Produce no code
changes to src/ or scripts/ — your only deliverable is a report at
docs/debug-surface/AUDIT.md (throwaway probe scripts under a scratch dir
are fine).

Attempt, with actually executed repros: (1) find a gameplay state mutation
the hash does not detect, beyond what T0 already covers; (2) find any
nondeterminism — same seed and scenario producing divergent hashes,
including browser vs headless; (3) find an instrumentation side effect —
any snapshot, event, or trace call that changes a run's hashes; (4) verify
deathsByCause sums to totalDeaths on a fresh 50k-tick run you execute
yourself; (5) re-run two gates of your choosing from PROGRESS.md and
confirm the recorded outputs are reproducible; (6) follow DEBUG.md
literally, as a new agent with no other context, and note every place it
is wrong, ambiguous, or incomplete. For each finding: severity, repro
command, observed vs expected.

End AUDIT.md with a single line: VERDICT: SOUND or VERDICT: BROKEN (n
findings).
```

## Prompt C — remediation (only if VERDICT: BROKEN)

Paste into a fresh session of the build agent.

```
Read docs/debug-surface/AUDIT.md. Fix every finding. All gates in
docs/debug-surface/BRIEF.md must remain green — re-execute any gate whose
subject matter a fix touches and append the new outputs to PROGRESS.md
under a "Remediation" heading. Never weaken a gate, a test, or the hash to
make a finding go away. Stop when every finding is addressed with
typecheck and build clean.
```

Then re-run Prompt B in a fresh auditor session. Loop B → C until SOUND. If it doesn't converge in two loops, the BRIEF has a defect — stop and fix the document, not the agents.

---

## Appendix — single-stage recovery prompts

Only needed if the build run dies partway or one stage needs a redo. Base every recovery on the last commit whose gates are recorded green in PROGRESS.md. Same skeleton for any stage N:

```
Read docs/debug-surface/BRIEF.md in full. PROGRESS.md shows Stages 1..N-1
complete with green gates. Implement STAGE N ONLY, exactly as specified,
on top of the current state. Execute Stage N's gates and record outputs in
PROGRESS.md. All earlier-stage tests must still pass. Stages above N are
out of scope. Fix code, never gates.
```

---

## Operator notes (the no-review model)

- You read three things, ever: the **VERDICT line** in AUDIT.md, **PROGRESS.md** (skim: does every stage have verbatim command output, or prose claiming success?), and **DEBUG.md** — which you read carefully, because you are its target audience as fleet manager. If you can't operate the instrument from DEBUG.md alone, reject on those grounds; that's a product defect, not a style nit.
- Your hands-on verification is execution, not inspection: run `npm test`, run one baseline sim and read the summary line, open the game with `?seed=42&paused=1` and poke `window.__antzoo` in the console. Playing the instrument is the playtest.
- Prose in PROGRESS.md where output should be ("all tests passed successfully") is a red flag equal to a failing gate — send it back via Prompt C with that as the finding.
- Every ambiguity noted in PROGRESS.md and every DEBUG.md defect found by the auditor is a BRIEF defect. Patch BRIEF.md before the next program; the document is the compiled judgment, keep compiling into it.
