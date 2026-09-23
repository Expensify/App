# Dead oxlint shard: handoff

**For**: an agent picking this up with no prior context.
**Repo state**: branch `feat/oxlint`, oxlint 1.83.0, machine 14 cores.
**Status**: resolved on 2026-09-15 by measurement rather than by catching a failure in the act. Section 0
has the findings and the fix; sections 1 to 8 are the original handoff, kept for the reasoning and the
forced-failure recipes. Section 6's instruction still stands: if the gate ever exits 2 again, keep stderr.

---

## 0. Resolution

### What was actually happening

Every shard spawned its own `oxlint-tsgolint`. Type-aware rules do not run inside oxlint; oxlint hands
the file list to `tsgolint`, a separate multi-threaded Go binary, which builds a TypeScript program for
the files' whole import graph. Measured on this machine with `/usr/bin/time -l` and `ps` sampling, one
`oxlint --threads=1` shard is two processes:

| files in the shard | oxlint (Node, JS plugins) | tsgolint child | peak of the pair | wall |
| ---: | ---: | ---: | ---: | ---: |
| 50 | | | 0.4 GB | 1.6 s |
| 300 | | | 2.8 GB | 8.6 s |
| 1300 | 1.5 GB | 3.4 to 4.3 GB | 4.3 GB | 19 s |
| 2600 | | | 4.8 GB | 24 s |
| 9093 (whole repo, one process) | | | 7.9 GB | 89 s |

Seven shards therefore meant seven redundant type programs and a peak near 38 GB on a 48 GB machine
that also runs other Conductor agents, an IDE and a browser. The shard sizing could not see this because
of two independent errors:

1. `SHARD_MEM_BUDGET_GB = 2` was the budget for the Node process alone. The real cost per shard was
   4 to 5 GB, dominated by tsgolint.
2. `os.freemem()` on macOS is the kernel's free-page count only. It excludes inactive, speculative and
   purgeable pages, which the kernel reclaims on demand. On this idle 48 GB machine it reads 4.5 GB
   while `vm_stat` shows 18 GB reclaimable. So `byMem` sat at 1 or 2 regardless of real headroom, which
   is why the old doc saw "2 shards" and "6 shards" on the same machine and why the count moved with
   "free memory" in a way that never matched the failures.

The retry was pointed at the right symptom. What a dead tsgolint looks like, measured by SIGKILLing it
mid-run: oxlint exits **1**, not a signal code, and prints
`Error running tsgolint: "exit status: exit status: 1"` on stdout with no JSON. That is the
`Failed to parse Oxlint JSON output.` path and `producedNoJSON` does catch it. Section 5's option 2
(gate on exit code alone) would have missed it, so the exit-code check is added alongside, not instead.

### What changed (`scripts/lint/oxlint/OxlintLinter.ts`)

The sharded run is now the design from oxc#26621 with the type-aware work taken out of the shards. Two
configs are derived from `.oxlintrc.json` at run time and written beside it (so relative plugin
specifiers, override globs and ignore patterns resolve identically), then removed in `finally`:

- **JS-plugin shards**: the full config with `options.typeAware: false`, fanned across N
  `oxlint --threads=1 -c .oxlintrc.js-plugins.<pid>.json` processes over disjoint buckets. No shard
  spawns tsgolint. Measured 1.4 GB per shard at 1300 files, 1.5 GB at 2600, 4.0 GB for the whole repo
  in one process.
- **one type-aware process**: the config without `jsPlugins` and without any rule they provide, over
  the original targets, all threads. tsgolint builds one program. Measured 21.9 s and 9.3 GB for the
  whole repo.

Both kinds run native (Rust) rules; the merge drops a later leg's copy of a finding an earlier leg
already reported for that file, and keeps duplicates within one leg (the React Compiler reports some
diagnostics twice on both tools, 49 through the bridge, so the seatbelt counts must not move). Raw `OxlintLinter.run(['.'])`
output was compared old against new over the whole repo: 4307 messages each way, the same multiset,
0 differences. Through the pipeline with `--format json --show-warnings` the two reports were also
identical.

Sizing: `defaultShardCount` uses `os.availableParallelism() / 2` for cores, and for memory reads
`vm_stat` on macOS (free + inactive + speculative + purgeable pages; `os.freemem()` elsewhere), reserves
10 GB for the type-aware process, and gives each JS shard 2 GB. `OXLINT_SHARDS=1` still runs one stock
process with the original config, as the escape hatch and for comparison.

Retry: unchanged in shape (once, serially, after every leg has finished), widened in trigger.
`isTransientFailure` fires on no JSON **or** an exit code of 128 or more, which is `128 + signal`
(Bun reports SIGKILL as 137 and SIGABRT, which is also a Node heap exhaustion, as 134; both verified).
Codeless diagnostics with a normal exit code are still fatal without a retry, as the existing test pins.
Every note now carries the exit code and whether JSON was present, and a failed or retried run also
prints the plan it was sized to (shard count, cores, available memory), which closes the gap in
section 6 item 3.

`--fix` runs the legs one after another, because the type-aware process and the shards would otherwise
write the same files at the same time.

Separately, and found while costing runners: every CI run since the sharding commit had died in 3 s
with exit 249 because `npx oxlint <files>` becomes one `sh -c` string and Linux caps a single argv
element at 128 KB. Both the file listing and every leg now exec `node_modules/.bin/oxlint` directly.
`OXLINT_MIGRATION_STATE.md` section 2 and TODO 14 carry the details and the CI run still owed.

### Wall time

Back-to-back, same machine, three rounds, old then new: 65.3 s against 33.8 s, 41.6 s against 35.6 s,
55.6 s (6 shards) against 31.3 s (7 shards). Recorded in `OXLINT_MIGRATION_STATE.md` section 3.1.

### What is still not proven

Nobody has caught the original failure with stderr attached, so "tsgolint was killed under memory
pressure" is the best-supported explanation, not an observed one. It is supported by: the per-shard
footprint above, the fact that every failure followed heavy work in the same shell, and the fact that a
killed tsgolint reproduces exactly the class of message (`Failed to parse Oxlint JSON output.`) the
retry was written for. If the gate exits 2 again, its stderr now names the leg, the exit code and the
plan; section 6's loop is still the way to catch it.

---

---

## 1. The symptom

`npm run lint -- --linter=oxlint` is the required lint gate. It normally exits 0. Intermittently it
exits 2 with no findings printed.

Observed **5 times in one session on 2026-09-15**, against roughly 20 successful runs. Every failure
landed immediately after other heavy work in the same shell session (a whole-repo ESLint run, `tsc`
runs, `npm run test:bun`, a full-repo oxlint, or a back-to-back loop over the ten other `oxlint-*`
npm scripts). Every run on an otherwise quiet machine passed.

It is not random. It tracks free memory at invocation, for the reason in section 2.

### What it looks like

Through a shell whose output is filtered (this repo's `rtk` wrapper does this), it renders as:

```
ESLint output (JSON parse failed: EOF while parsing a value at line 1 column 0)
```

That wording is misleading twice over: it names ESLint when the failing linter is oxlint, and it
names JSON parsing when the cause is a dead process. **Do not trust the rendered form.** Raw, from
`bun scripts/lint/index.ts --linter=oxlint`, a forced instance of the same class looks like:

```
Failed to parse Oxlint JSON output.
Failed to parse oxlint configuration file.

  x Rule 'no-such-rule-at-all' not found in plugin 'eslint'
```

---

## 2. Why it happens

Oxlint runs every JS plugin on a single thread (upstream `oxc#26621`, open), so `--threads` does
nothing for the sidecar rules this repo enables (192 today by `checkSidecarCoverage.py`; the code
comment at `OxlintLinter.ts:51` still says 180 and is stale). `OxlintLinter` works around that by sharding:
it splits the file list into buckets and runs one `oxlint --threads=1` process per bucket.

Shard count is derived **per invocation** from cores and free memory
(`scripts/lint/oxlint/OxlintLinter.ts:56-60`):

```ts
const SHARD_MEM_BUDGET_GB = 2;

function defaultShardCount(): number {
    const byCpu = Math.floor(os.cpus().length / 2);
    const byMem = Math.floor(os.freemem() / 1073741824 / SHARD_MEM_BUDGET_GB);
    return Math.max(1, Math.min(byCpu, byMem));
}
```

So the same command shards differently depending on what else is running. Under pressure a shard
process gets killed by the OS. A killed process writes no stdout, `extractJSONObject`
(`OxlintLinter.ts:144`) finds no `{`, and `parseOxlintStdout` (`:189`) returns a fatal result.

`mergeShardResults` (`:82-87`) then returns **that** shard, discarding every other shard's findings:

```ts
const fatalShard = results.find((result) => result.exitCode >= FATAL_EXIT_CODE);
if (fatalShard) {
    return fatalShard;
}
```

### That last part is correct and has a test. Do not "fix" it.

`tests/tooling/lintPipeline.test.ts:348`, "a crashed JS plugin in one shard is fatal and dominates
clean shards". A shard that died tells you nothing about what it would have found. Reporting the
survivors as a complete run would let the seatbelt auto-tighten against a partial result and freeze a
false baseline. Failing loudly is the safe behaviour.

The gap was never the merge. It was that nothing retried.

---

## 3. What is already implemented

Commit `bf400fbc078`, in `scripts/lint/oxlint/OxlintLinter.ts`.

**Shard retry.** After the parallel pass, any shard whose stdout contained no JSON object is rerun
once. Gate is `producedNoJSON` (`:168`):

```ts
function producedNoJSON(stdout: string): boolean {
    return extractJSONObject(stdout) === null;
}
```

Three design points, each deliberate:

- **Serial, not a second parallel pass** (`:296-302`). Shard count comes from `os.freemem()`, so a
  concurrent retry would most likely be killed the same way. Serialising is the part that makes the
  retry worth having, not the retry itself.
- **Narrower than "the shard was fatal".** A shard that returned *codeless diagnostics* threw inside
  a JS plugin, and a shard that matched no files is a mistyped path. Both are deterministic, so
  retrying them buys nothing. This distinction is the crux of section 5 — read it.
- **A config error is retried too**, because it is indistinguishable from a dead shard here. It fails
  again for the price of one extra process.

**File-listing retry** (`:231-255`). `listLintedFiles` gathers the file list in its own
`npx oxlint --debug=files` process, before any shard runs, and is exposed to the same death. A killed
lister writes nothing, and an empty list was indistinguishable from a genuinely unmatched path, so it
surfaced as `Oxlint matched no files` — which sends you looking at your targets instead of at memory.
An empty list is now asked for a second time.

**Never silent** (`:292`, `:301`). A run that only passed because of a retry appends a note to the
merged stderr:

```
Oxlint shard 2 of 6 produced no JSON and was retried once: recovered
Oxlint listed no files on the first attempt and 9234 on the second, so that listing died rather than matching nothing.
```

Without that, a machine sitting one shard away from failing looks identical to a healthy one.

### What is verified

| check | result |
| --- | --- |
| forced no-JSON failure is retried once, serially, both shards | `failed again` note, exit 2 preserved |
| genuinely unmatched path | still fatal, message says it asked twice |
| healthy path | exit 0, no note |
| `producedNoJSON` unit test (`tests/tooling/lintPipeline.test.ts:356`) | green, and green-red-green |
| `npm run typecheck`, `npm run lint-changed`, `npm run test:bun` | pass, 588 tests |

Forced-failure recipe used (restore the config afterwards):

```bash
cp .oxlintrc.json /tmp/oxlintrc.good.json
python3 -c "
p='.oxlintrc.json'; s=open(p).read()
s=s.replace('\"no-delete-var\": \"error\",','\"no-such-rule-at-all\": \"error\",',1)
open(p,'w').write(s)"
OXLINT_SHARDS=2 bun scripts/lint/index.ts --linter=oxlint >/dev/null 2>/tmp/retry.err
cat /tmp/retry.err
cp /tmp/oxlintrc.good.json .oxlintrc.json
```

---

## 4. What is NOT verified, and why you are reading this

**The retry has never been observed handling the real failure.**

The gate returned exit 2 **twice after the retry landed**. Both times stderr had been redirected to
`/dev/null`, so there is no evidence about whether a retry fired, recovered, or was skipped. It then
went quiet for 15 consecutive runs, including 4 under deliberate memory pressure (a concurrent
whole-repo ESLint run). Suggestive. Not proof.

Attempts to reproduce on demand that all **failed**:

- a background whole-repo `npm run lint` as a memory hog, then 4 gate runs — all exit 0, free memory
  stayed 8.8 to 13.6 GB
- replaying the exact sequence that had preceded a failure (`test:bun`, then the React Compiler
  compliance check, then the gate) — exit 0

So the trigger is not simply "low free memory at the moment of invocation". It may need the memory to
be transiently consumed *during* the shard run rather than before it.

---

## 5. The most likely uncovered path

**This is the first thing to check when it next fails.**

`producedNoJSON` only retries a shard that emitted *no JSON at all*. But a JS plugin dying under
memory pressure may not kill the process silently — it may throw, and oxlint then emits diagnostics
with **no rule code**, which `parseOxlintStdout` turns into a fatal (`OxlintLinter.ts:205-212`):

```ts
// A diagnostic with no `code` is a crashing JS plugin, not a finding.
const codeless = parsed.diagnostics.filter((diagnostic) => !diagnostic.code);
if (codeless.length > 0) {
    ...
    return fatal(`Oxlint reported ${codeless.length} diagnostic(s) with no rule code, which means a JS plugin threw:\n${sample}`, '', stderr, exitCode);
}
```

That result **has** a JSON body, so `producedNoJSON` is false and it is never retried. Correctly so
for a deterministic plugin throw — which is what the existing test pins. But an OOM-killed plugin
would look the same.

If the next failure's stderr says `diagnostic(s) with no rule code` rather than
`Failed to parse Oxlint JSON output.`, that is the case to handle. It needs a way to tell an
OOM-killed plugin from a genuinely broken one before adding a retry there, because retrying a real
plugin bug doubles every failed run. Options worth weighing, none implemented:

1. Retry codeless-diagnostic shards once as well, serially, and accept the doubled cost on real
   plugin bugs. Simplest. Weakens the guarantee the existing test describes.
2. Look at the killed process's exit code. A signal kill surfaces as 137 (SIGKILL); a plugin throw
   should not. `LinterResult` already carries `exitCode`, so this may separate the two cleanly — but
   confirm oxlint actually propagates 137 in the sharded path rather than normalising it.
3. Cap shard count more conservatively (`SHARD_MEM_BUDGET_GB` is 2, `:54`), trading wall-clock for
   headroom. Treats the cause rather than the symptom, and is measurable: the ratio in
   `OXLINT_MIGRATION_STATE.md` section 3.1 is oxlint 86 s against warm ESLint 543 s, so there is room
   to spend.

Option 2 is the one to try first if the evidence supports it, because it keeps the existing guarantee
intact.

---

## 6. The one instruction

**When it fails, keep stderr.**

`LintPipeline.ts:37` already surfaces a fatal linter's stderr as the report, so the reason is always
there. Every failed diagnosis in this investigation came from throwing it away — including one wrong
conclusion where a `.oxlintrc.json` edit was briefly blamed, and the bisect that "confirmed" it was
itself invalid because the spliced probe config really was malformed. Three clean runs on the
committed config settled it.

Use this, not `>/dev/null 2>&1`:

```bash
for i in $(seq 1 10); do
    npm run lint -- --linter=oxlint >"/tmp/gate$i.out" 2>"/tmp/gate$i.err"
    code=$?
    printf 'run %s exit=%s retries=%s\n' "$i" "$code" "$(grep -c 'retried once\|listed no files' "/tmp/gate$i.err")"
    if [ "$code" != 0 ]; then
        echo "CAUGHT -- stderr:"; cat "/tmp/gate$i.err"
        break
    fi
done
```

Then answer, in order:

1. Did a retry note appear? If yes, the mechanism fired and the retry itself is insufficient.
2. Does stderr say `Failed to parse Oxlint JSON output.` (dead process, should have been retried) or
   `diagnostic(s) with no rule code` (section 5's path, deliberately not retried)?
3. What was the shard count? Add a temporary log of `defaultShardCount()` if needed; it is not
   currently reported, which is itself a gap worth closing.

---

## 7. Files

| path | what |
| --- | --- |
| `scripts/lint/oxlint/OxlintLinter.ts` | sharding, retry, parsing, merge. All line references above |
| `scripts/lint/LintPipeline.ts:18,37` | fatal exits skip processors and surface stderr as the report |
| `tests/tooling/lintPipeline.test.ts:348,356` | the crashed-plugin guarantee, and `producedNoJSON` |
| `INVESTIGATION DOCS/OXLINT_MIGRATION_STATE.md` section 5.4 | the same story in the migration's own words |
| `INVESTIGATION DOCS/OXLINT_MIGRATION_STATE.md` section 3.1 | timings, if you want to spend wall-clock on headroom |

Useful env vars: `OXLINT_SHARDS` forces shard count (`resolveShardCount`, `:62`), `OXLINT_THREADS`
applies only when unsharded.

---

## 8. Definition of done

Either:

- a captured failure showing the retry fired and recovered, pasted into section 5.4 of
  `OXLINT_MIGRATION_STATE.md`, which closes TODO 12 there; or
- a captured failure showing it did **not**, plus the fix for whichever path it took.

Do not close this on "it stopped happening". It already stopped happening once, for 15 runs, and that
is what this document exists to prevent someone concluding from.
