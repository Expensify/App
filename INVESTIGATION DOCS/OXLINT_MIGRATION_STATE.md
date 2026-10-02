# Oxlint Migration: Current State

Branch `feat/oxlint`, with `origin/main` merged at `901155d74da` (merge commit `c839d20eac5`). Tool
versions: oxlint 1.86.0, oxc-transform-react 0.152.0, oxlint-tsgolint 7.0.2003
(`package.json:368-371`). These are the newest releases; 1.86.0 and 0.152.0 are inside the seven-day
window `.npmrc`'s `min-release-age=7` would otherwise block, so the oxlint scopes are listed in
`min-release-age-exclude` to install them, and their native binding scopes are listed there too so npm
does not silently keep a stale binding. The config is `oxlint.config.mts` (section 3.7).

Every number here is the latest measurement, from the command quoted beside it. CI numbers name the
run they came from, so any of them can be reread. Numbers not re-measured at this merge say so. This
file holds current state and remaining work. Superseded numbers and resolved problems are deleted
rather than kept with a date.

The parity harness (`oxlint-migration/`, the `oxlint-*` npm scripts) is on the branch and every harness
number below comes from it.

---

## 1. Where this stands

One pipeline runs either linter. `scripts/lint/index.ts` runs both behind the same
`Linter -> Processor[] -> Formatter` ports, each with its own seatbelt baseline. Oxlint passes its
baseline over the whole repo in 36 seconds; ESLint takes 406 (section 3.1). The run is 4 JS-plugin
shards plus one type-aware process (section 2.2) and reports the same findings as a single process.

Every rule ESLint enables is either enabled in Oxlint or has a written reason not to be, and config
drift is at 0 open differences (section 3.5). Rule evidence stops short of complete on purpose: 306
fixtures, 305 identical and 1 pinned divergence, and 128 core rules left without one for the reasons in
section 4.1.

Linux CI lints the real repo in 50 to 55 s on 8 vCPU, and a planted error comes back from both linters
at the same file, line and column (section 3.6), so Phase 1 has nothing left blocking it.

Left to do:

- The push-to-`main` half of the job has never run: the seatbelt auto-commit and its race with
  `lint.yml` are `if: github.event_name == 'push'` and skip on every PR (TODO 1).
- `react-hooks/refs` reports 189 against ESLint's 210 (section 5.1); the bridge under-reports at
  1.86.0 / 0.152.0.
- `react-hooks/purity` reports 35 where ESLint reports 0, all `Date`-impure-during-render. Kept
  intentionally -- the rule catches real impurity ESLint's build misses (section 5.3).
- `rulesdir/boolean-conditional-rendering` has no replacement (section 3.2).

---

## 2. What runs today

| check | command | result |
| --- | --- | --- |
| Oxlint, whole repo, through the pipeline | `npm run lint -- --linter=oxlint` | exit 0, nothing above baseline; the same pipeline run takes **36 s** in `compare-oxlint` |
| Types | `npm run typecheck` | **passed**, including `oxlint.config.mts` |
| Tooling tests | `npm run test:bun` | **644 pass / 3 fail**, 48 files. The 3 are `SyncVersions.test.ts` git-fixture cases, failing identically at `HEAD` without any branch change and unrelated to linting |
| Per-rule parity, all batches | `npm run oxlint-rule-fixtures` | **306 entries: 305 identical, 1 pinned divergence** |
| Whole-repo parity | `bash oxlint-migration/compareFullRepo.sh --fresh` | section 3 |
| Sidecar rule evidence | `npm run oxlint-sidecar-coverage` | **193 / 193 covered** |
| Rule inventory | `npm run oxlint-rule-inventory` | **490 rules, fixture coverage 301 / 490** |
| Config drift | `npm run oxlint-config-drift` | 29 rules differ, **0 open**, all in the LEDGER |
| ESLint directive parity | `npm run oxlint-eslint-directives` | **22 / 22**, matching ESLint 9.36.0 |

CI is `.github/workflows/oxlint.yml`, wired into `preDeploy.yml` and left out of
`confirmPassingBuild`'s `needs`. The lint step carries `continue-on-error: true`. On a push to `main`
it commits its own tightened baseline, as `lint.yml` does for ESLint. Since `3914cd61dc9` it runs on
`blacksmith-8vcpu-ubuntu-2404` (32 GB) with `OXLINT_SHARDS: 4`.

`OxlintLinter` execs `node_modules/.bin/oxlint` for the file listing and every leg, so each path is its
own argv element. Going through `npx oxlint <files>` instead hands the command to `sh -c` as one string
(`@npmcli/run-script` sets `shell: true`), Linux caps a single argv element at 128 KB, and a 2-shard
file list is 229 KB per shard: `execve` fails with `E2BIG`, errno 7, npm exits `-7`, which the shell
reports as 249, and `continue-on-error` turns that into a green check that linted nothing. macOS has a
1 MB total `ARG_MAX` and no per-element cap, so developer machines never see it. Linux CI lints at
`3914cd61dc9` (run 34956909673): the lint step took 55 s, exit 0, no `Failed to parse`, and three later
clean runs agree (section 3.1). A green check cannot be a no-op: the canary in section 3.6 proves the
job reads the real repo.

### 2.1 Every oxlint script

All fifteen `package.json` scripts that touch oxlint, plus the gate and the pipeline test, run one at a
time. Exit codes are the process exits, not a reading of the output.

| script | exit | result |
| --- | --- | --- |
| `lint -- --linter=oxlint` | **0** | the required gate: nothing above baseline, 36 s on a 14-core Mac |
| `lint-oxlint` | **1** | raw `oxlint .`, no pipeline and no seatbelt, so it prints the whole baseline (4193 findings). Exit 1 is by design |
| `compare-oxlint` (`--fresh`) | **0** | end to end at these pins: ESLint 3452, oxlint 4193. `set-state-in-effect` 120/120, `refs` 210/189, `purity` 0/35 (sections 3.3, 5.1, 5.3). Coverage eslint=483, oxlint=482, shared=475; no unexplained ESLint-only rules |
| `compare-oxlint-warm` | **0** | measured at these pins: ESLint cold prime 408 s, warm 413 s, oxlint 92 s -- 4.49x warm, 4.43x cold. A second warm run read 4525 s under contention from a comparison running alongside; the script ratios on the fastest run |
| `oxlint-parity-direction` | **0** | informational. 1305 (file, rule) pairs identical, +1274 added by oxlint, 533 hidden -- all three sources explained in section 3.3.1 |
| `oxlint-config-drift` | **0** | 46 files, 29 rules differ, **0 open** |
| `oxlint-eslint-directives` | **0** | all 22 directive cases match ESLint 9.36.0 |
| `oxlint-jsx-uses-port` | **0** | `jsx-uses-react` and `jsx-uses-vars` behave the same on both tools |
| `oxlint-locale-compare-port` | **0** | the type-free port matches the type-aware original on every shape in `src/` |
| `oxlint-react-compiler-gate` | **0** | the gate matches the ESLint side: silent where both compilers memoize, live where they do not |
| `oxlint-react-compiler-rust` | **0** | twelve fixtures self-report, one per `rc/*` rule; every category mapped |
| `oxlint-rule-availability` | **0** | wrote `oxlint-migration/rule-availability.json`, byte-identical |
| `oxlint-rule-fixtures` | **0** | 306 entries: 305 identical, 1 pinned divergence (`react/no-did-update-set-state`) |
| `oxlint-rule-inventory` | **0** | 490 rules, fixture coverage 301/490, 0 unproven. Wrote `rule-inventory.json`, byte-identical |
| `oxlint-rule-tester` | **0** | all 35 custom rules identical across 463 harvested cases |
| `oxlint-sidecar-coverage` | **0** | core 10/10, hosted 40/40, rulesdir 37/37, hand-hosted 87/87; all 193 enabled sidecar rules covered |
| `tests/tooling/lintPipeline.test.ts` | **0** | 50 tests, 124 assertions. Runs under `bun test`, not the jest config, which ignores `tests/tooling/` |

Before rerunning these: do not run them concurrently. `compareFullRepo.sh` truncates and rewrites
`/tmp/oxlint-full.json` and `/tmp/eslint-full.json`, `listAllRules.py` reads both, and a half-written
file kills the inventory with a `JSONDecodeError`. `load_findings` checks `os.path.exists` but not
whether the JSON is complete, so a killed comparison leaves the same trap. Also, `compare-oxlint`
reuses the `/tmp` reports unless you pass `--fresh`; an instant run is reading a cached report,
possibly from another commit.

### 2.2 How the sharded run is put together

Oxlint runs all 194 JS-plugin rules on one Node thread per process (upstream oxc#26621, open, no
PR), so more cores only help through more processes. Type-aware rules go to `oxlint-tsgolint`, a
separate multi-threaded Go binary that builds a TypeScript program for the files' import graph, about
9 GB for this repo. `OxlintLinter.run` imports `oxlint.config.mts`, derives two JSON configs from it per
run, writes them beside it and removes them in `finally`:

```text
run(targets)
  files = oxlint --debug=files targets                   # every lintable path, one short process
  N     = OXLINT_SHARDS, else min(cores / 2, (available memory - 10 GB) / 2 GB)
  write .oxlintrc.js-plugins.<pid>.json                   # full config, options.typeAware: false
  write .oxlintrc.type-aware.<pid>.json                   # no jsPlugins, none of their rules
  in parallel
    shard 1..N:  oxlint --threads=1 -c js-plugins.json every Nth file    # ~1.5 GB each
    type-aware:  oxlint -c type-aware.json targets                      # one tsgolint, ~9 GB
  retry any leg that died (no JSON on stdout, or exit >= 128), one at a time
  merge per file; a later leg's copy of an earlier leg's finding is dropped, duplicates within
  one leg are kept
```

Shards take every Nth file rather than a contiguous slice: the list is sorted by path, so slices put
most `.tsx` files, and the React Compiler work that comes with them, in one or two shards (1408 /
234 / 1570 / 679 across four slices of this repo, about 970 each interleaved). It costs little today,
because the React Compiler rules run over the Rust compiler and take seconds; contiguous slices
measured 69 s against 49 s interleaved on a per-file JavaScript plugin, so this stays a cheap guard
against a future sidecar change.

Native Rust rules run in every process; they take seconds and the merge dedupes them. "Available
memory" is `vm_stat` free + inactive + speculative + purgeable pages on macOS, because `os.freemem()`
there counts free pages only (4.5 GB on an idle 48 GB machine against 18 GB reclaimable), and
`os.freemem()` elsewhere. CI pins `OXLINT_SHARDS=4`: on 8 vCPU that is 4 shard threads plus about
4 tsgolint threads, and the type-aware leg is the floor, so more shards would not shorten the run.
`OXLINT_SHARDS=1` runs one stock process on `oxlint.config.mts` itself, for comparison. `--fix` runs the
legs one after another so the type-aware process and the shards never write the same file at once.

The memory, slice and timing figures in this section were not re-measured at this merge.

A run that only passed because of a retry says so on stderr, with the leg, exit code, whether JSON
was present, and the plan it was sized to. If the gate exits 2, keep stderr.

---

## 3. Parity

### 3.1 Timings and runners

| | ESLint (`lint.yml`) | Oxlint (`oxlint.yml`) |
| --- | --- | --- |
| runner | `blacksmith-16vcpu-ubuntu-2404`, 64 GB | `blacksmith-8vcpu-ubuntu-2404`, 32 GB, `OXLINT_SHARDS: 4` |
| why that size (not re-measured at this merge) | a cold cache loads a 12 GB type program into each of two workers (`lint.yml` `runs-on` comment) | one 9.3 GB type program plus 4 shards at 1.5 GB, about 15 GB |
| whole repo, 14-core Mac, cold | 395-406 s (`ESLINT_CONCURRENCY=2`, 16 GB heap, no cache) | 36 s |
| CI lint step, clean (`079c53864`) | **51 s** warm cache, run 35079842668 | **54 s** whole repo, run 35079842842 |
| CI lint step, other clean runs | | **55 s** (34956909673), **40 s** (34981309045) |
| CI lint step, clean, cold ESLint cache (`9cd93254c01`, PR #101292, `feat/oxlint-clean`) | **462 s**, `Cache not found`, one pass, run 35869416143 | **54 s**, `OXLINT_SHARDS: 4`, no errors above baseline, run 35869416331 |
| CI job, wall clock, same commit | 517 s, conclusion `success` | 105 s, conclusion `success` (non-blocking) |
| CI lint step, one planted error (`5b3c0495a`) | **388 s**: 29 s to report it, then a full cold re-run to report it again | **50 s**, one pass |
| CI job, wall clock, same commit | 434 s, conclusion `failure` | 97 s, conclusion `success` (non-blocking) |

On a clean commit with a warm cache the two steps cost about the same wall time, 51 s for ESLint
against 54 s for oxlint, because ESLint's cache limits it to changed files while oxlint lints every
file every run. With a cold ESLint cache the same comparison is 462 s against 54 s (PR #101292): 7392
vCPU-seconds on 16 vCPU against 432 on 8, about 17 times cheaper.
Blacksmith bills per vCPU-minute and oxlint needs half the runner, so it costs about half as much to
reach that tie. Linting only changed files on PRs would beat both and is not a goal, since the
whole-repo run is what keeps the seatbelt honest.

Failing runs are where the two diverge. `lint.yml:87-91` clears the cache and re-runs on any
non-zero exit, so the canary cost ESLint 388 s of step time on 16 vCPU, 6208 vCPU-seconds, to report
one error twice. Oxlint reported it once in 50 s on 8 vCPU, 400 vCPU-seconds, about 15 times
cheaper. The retry exists to paper over stale-cache false positives, a failure mode oxlint does not
have, so retiring ESLint retires the retry with it.

Findings match: 4193 messages from the 4-shard run and from a single process, the same multiset.
The ESLint leg needs `NODE_OPTIONS=--max_old_space_size=16384` and capped concurrency or its workers
die with `ERR_WORKER_OUT_OF_MEMORY` even on a 48 GB machine.

### 3.2 Config coverage

Union of enabled rules over every tracked lintable file, both sides:

```
eslint=483   oxlint=482   shared=475
ESLint-only with a port plan: 8
ESLint-only unexplained:      0
Oxlint-only extras:           7
```

The 8 ESLint-only rules report zero findings today and none has a seatbelt row. Plans live in
`oxlint-migration/ruleMap.py` `PORT_PLAN`.

| rule | plan | proven | real loss |
| --- | --- | --- | --- |
| `progress/activate` | drop, Oxlint prints its own progress | no | none |
| `react-hooks/component-hook-factories` | nothing to port, upstream ships a stub whose `create()` returns `{}` | yes | none |
| `react-hooks/config` | not hosted; the hosted compiler rules come from the same plugin build and fail at load on a bad compiler option, which is what this rule would report | yes | none |
| `react-hooks/gating` | dropped, only fires with a `dynamicGating` source, which production does not supply | no | none |
| `no-invalid-this` | skipped, hosting it gives 51 JS-plugin errors and 0 findings; TS/TSX covered by `noImplicitThis` | yes | about none, 19 non-ignored JS files contain a `this` token |
| `rulesdir/prefer-at` | superseded in part by `unicorn/prefer-at` at default options | yes | **partial**, loses plain `arr[0]` / `arr[i]` |
| `react/jsx-filename-extension` | dropped, dead on both tools: after the JS override only `.ts`/`.mts`/`.cts` stay in scope, and JSX does not parse there | yes | none |
| `rulesdir/boolean-conditional-rendering` | **blocked**, needs the type of the `&&` left operand | no | **yes**, waits on typed `jsPlugins` |

`rulesdir/boolean-conditional-rendering` is the only real coverage loss. It reports zero findings
because it is enforced today, so the cost is deferred: future `{count && <X/>}` regressions go
uncaught. No tracking issue exists (TODO 3).

### 3.3 Findings per rule, whole repo

ESLint 3452, Oxlint 4193. Both legs run through `scripts/lint/index.ts --format=json` with
`SEATBELT_DISABLE=1`, so both pass the same processors. A typescript-eslint extension rule is counted
under the base rule oxlint runs, or one rule lands in two rows. Counted over 9886 tracked lintable
files, with `origin/main` merged at `901155d74da` and oxlint 1.86.0 / oxc-transform-react 0.152.0 /
oxlint-tsgolint 7.0.2003.

| rule | eslint | oxlint | delta | reading |
| --- | ---: | ---: | ---: | --- |
| `@typescript-eslint/no-unsafe-type-assertion` | 1894 | 1947 | +53 | both enable it; tsgolint 7.0.2003 infers stricter than TS 6.0.2 -- separate triage before Phase 3 |
| `@typescript-eslint/no-unnecessary-type-assertion` | 0 | 758 | +758 | both enable it; TS 6.0.2 and tsgo TS7 infer differently |
| `no-restricted-imports` | 598 | 96 | -502 | ESLint's `HeaderWithBackButton`->`Header` migration ban (502 findings) has no mirror in `oxlint.config.mts` -- see sections 3.3.1 and 3.5 |
| `no-restricted-syntax` | 319 | 319 | 0 | parity |
| `@typescript-eslint/no-deprecated` | 177 | 376 | +199 | write-site strictness; tsgolint flags write sites typescript-eslint does not (typescript-eslint#10643) |
| `react-hooks/refs` | 210 | 189 | -21 | multiplicity, plus 3 locations (section 5.1) |
| `react-hooks/set-state-in-effect` | 120 | 120 | 0 | exact, same locations |
| `import/no-cycle` | 0 | 120 | +120 | both enable it; ESLint's copy is inert |
| `rulesdir/no-raw-typography` | 44 | 44 | 0 | parity |
| `rulesdir/no-onyx-connect` | 36 | 36 | 0 | parity |
| `react-hooks/preserve-manual-memoization` | 4 | 54 | +50 | over-reports through the bridge |
| `rulesdir/no-default-id-values` | 21 | 21 | 0 | parity |
| `rulesdir/no-direct-personal-details-list` | 20 | 20 | 0 | parity |
| `react-hooks/purity` | 0 | 35 | +35 | `Date`-impure-during-render; kept intentionally (section 5.3) |
| `import/no-named-as-default` | 0 | 13 | +13 | shared config, Oxlint finds more |
| `react-hooks/immutability` | 6 | 7 | +1 | one extra through the bridge |
| `@typescript-eslint/no-unsafe-return` | 0 | 8 | +8 | oxlint-only, tsgolint 7.0.2003 strictness -- separate triage before Phase 3 |
| `react-hooks/static-components` | 2 | 2 | 0 | parity |
| `no-unsafe-optional-chaining` | 0 | 4 | +4 | Oxlint-only finding |
| `unicorn/prefer-at` | 0 | 4 | +4 | Oxlint-only, expected (default options, covers the type-free `x[x.length - N]` family) |
| `import/no-duplicates` | 0 | 3 | +3 | Oxlint-only finding |
| `@typescript-eslint/no-misused-promises` | 0 | 2 | +2 | Oxlint-only finding |
| `@typescript-eslint/consistent-generic-constructors` | 0 | 2 | +2 | Oxlint-only finding |
| `@typescript-eslint/no-unsafe-member-access` | 0 | 2 | +2 | Oxlint-only finding |
| `no-empty-function` | 0 | 2 | +2 | Oxlint-only finding |
| `react-hooks/exhaustive-deps` | 1 | 1 | 0 | parity |
| `react-hooks/globals` | 0 | 1 | +1 | Oxlint-only finding |
| `no-redeclare` | 0 | 1 | +1 | Oxlint-only finding |
| `import/export` | 0 | 1 | +1 | Oxlint-only finding |
| `react/no-unstable-nested-components` | 0 | 1 | +1 | Oxlint-only finding |
| `react/button-has-type` | 0 | 1 | +1 | Oxlint-only finding |
| `react/jsx-key` | 0 | 1 | +1 | Oxlint-only finding |
| `@typescript-eslint/no-unsafe-assignment` | 0 | 1 | +1 | Oxlint-only finding |
| `@typescript-eslint/no-unsafe-argument` | 0 | 1 | +1 | Oxlint-only finding |
| **totals** | **3452** | **4193** | **+741** | |

Every rule not listed reports 0 on both tools. Section 3.3.1 splits these deltas by which direction
they risk. `refs` under-reports (section 5.1); `purity` reports 35 ESLint cannot see (section 5.3);
`preserve-manual-memoization` and `immutability` over-report through the bridge. The `-502` on
`no-restricted-imports` is not an oxlint gap -- it is a migration ban ESLint has that
`oxlint.config.mts` does not mirror (section 3.5). The typescript-eslint `no-unsafe-*` extras
(`no-unsafe-type-assertion` +53, `no-unsafe-return` +8) come from tsgolint inferring stricter than
typescript-eslint, and need triage before Phase 3.

The React Compiler reports some diagnostics twice, same file, position and text. On these pins ESLint
does it at 29 `refs` locations (45 extra copies) and no other compiler rule; the bridge at 14 `refs` and
9 `preserve-manual-memoization` locations (22 and 27 extra copies). The seatbelt counts both copies on
both sides, and the sharded merge keeps within-process duplicates so counts do not move with the shard
plan. Not a defect to fix on the oxlint side.

### 3.3.1 Which way the error points

A count delta is only a risk in one direction. An oxlint finding ESLint lacks makes the gate stricter,
which is harmless: the baseline absorbs it and a human sees a new error. An ESLint finding oxlint lacks
is a check that quietly stops running the day oxlint becomes blocking, and nothing fails to say so. So
the whole-repo report is re-cut by direction with `npm run oxlint-parity-direction`, at the granularity
the seatbelt enforces -- file, rule, count. Columns do not enter a baseline row, so a finding anchored
at a different column is a different reading of the same check, not a lost one.

```
(file, rule) pairs identical        1305 pairs, 2795 findings
findings oxlint adds (safe)          +1274
findings oxlint hides (needs work)     533
```

The arithmetic closes: 3452 + 1274 - 533 = 4193.

All 533 are accounted for and none of it blocks Phase 1:

| hidden | where | why | blocks Phase 3? |
| ---: | --- | --- | --- |
| 502 | `no-restricted-imports`, 499 files | the `HeaderWithBackButton` -> `Header` ban in `config/eslint/eslint.config.mjs`, absent from `oxlint.config.mts`. Not an engine gap: mirror the pattern and it closes to 0. `checkConfigDrift.py` reads 0 open because none of its 46 probe files imports the banned path (section 3.5) | no, but fix it before Phase 3 so the two baselines line up |
| 25 | `react-hooks/refs`, 12 files | 22 of the 25 is duplicate collapsing -- ESLint emits the same diagnostic two to seven times at one location and the bridge emits it once (`DynamicConfirmationPage.tsx` 12 vs 7, `usePromptContent.ts` 10 vs 6). The other 3 are locations the bridge misses; only `AboutPage.tsx` loses the rule outright. Four oxlint-only findings elsewhere add 4 back, which is why section 3.3 calls the same rule -21: 25 hidden, 4 added (section 5.1) | no |
| 6 | `@typescript-eslint/no-deprecated`, 5 files | all five are inside the deliberate 83-file override at `oxlint.config.mts:1203`, whose own comment prices this: "Costs 6 read-site findings ESLint reports in these files". Accepted cost | no |

Two rules that look unsafe by total are safe by location: `preserve-manual-memoization` (4 vs 54) and
`immutability` (6 vs 7) hide nothing -- every ESLint file+rule count is met, oxlint just reports more.
`set-state-in-effect` and `purity` hide nothing either; both only add.

So: 1305 pairs already agree exactly, oxlint is strictly stricter on 1274 more, and the 533 it hides are
one config mirror we never did (502), one duplicate-report quirk (25), and one override already
accepted in the config with its cost written down (6). Phase 1 is safe today -- the job is
non-blocking and its own baseline is exact at 4193/4193. The `HeaderWithBackButton` mirror is the only
item that is genuinely ours to fix.

### 3.4 Seatbelt baselines

One file per linter. The seatbelt tightens itself, and a shared file would ping-pong between the two
tools' counts on every CI run.

| baseline | rows | grandfathered errors | live findings |
| --- | ---: | ---: | ---: |
| `config/eslint/eslint.seatbelt.tsv` | 1836 | 3452 | 3452 |
| `config/oxlint/oxlint.seatbelt.tsv` | 1895 | 4193 | 4193 |

Both baselines match their live counts, with no slack. The seatbelt tightens but never increases on its
own, so every merge from `main` needs a manual `SEATBELT_INCREASE=all` pass (TODO 4).

`tests/tooling/lintPipeline.test.ts` checks that every rule id in the oxlint baseline is one the
enabled config still produces through `config/oxlint/ruleNames.mjs`. If oxlint renames a diagnostic
code or a mapping entry goes wrong, the baseline rows for that rule would tighten to zero while the
live findings surface under a new id; the test fails first.

### 3.5 Config drift

`checkConfigDrift.py` probes 46 files and compares rule settings, not just presence, so it catches
the same rule with different options, or on in one scope and off in another.

```
46 files, 29 rules differ
  7 spelled differently, same behavior
 22 accepted differences
  0 open differences
```

Two things to know when reading its output. Anything authored in an ESLint preset is invisible to
it: `resolveConfigs.mjs` reads each flat block's literal `rules` and never expands `extends:` or a
legacy preset object, so preset-authored options read as absent. Two "oxlint is more lenient"
readings (`prefer-const`, `prefer-promise-reject-errors`) were this; `eslint-config-expensify`
authors identical options and `eslint --print-config` confirms it. Catching an
`eslint-config-expensify` bump is the script's purpose, so this blind spot matters.

Second, the `scripts/**` and `.github/**` override that turns off the five
`@typescript-eslint/no-unsafe-*` rules plus `no-throw-literal` carries weight: deleting it adds 695
findings that ESLint reports 0 of. Oxlint's tsgolint port of that family is stricter than
typescript-eslint's everywhere; the override only exposes it where the loosely typed GitHub Actions
glue lives. (The 695 was not re-measured at this merge.)

Third, the drift comparison reads the `no-restricted-imports` options on its 46 probe files, so a ban
that only fires on files outside that set slips through as "0 open". The `HeaderWithBackButton` ->
`Header` migration ban (`config/eslint/eslint.config.mjs:210`) is this: ESLint reports 502 of it, oxlint
reports 0 because `oxlint.config.mts` does not mirror the pattern. The `-502` row in section 3.3 is
that, not an oxlint engine gap; section 3.3.1 prices it. Mirroring the pattern is a separate config
change, TODO 2, and it should land before Phase 3 so the two baselines line up.

### 3.6 The CI canary: both jobs catch a planted error

A green check cannot distinguish a working gate from a no-op, and every CI result up to this point
was a green check. So `5b3c0495a` added `src/libs/oxlintCanary.ts` holding a bare `debugger`
statement, a rule both linters enable at error and neither baseline grandfathers, and PR #98027 ran
both jobs against it. Reverted in `bbc49a87a9a`, so the file is not on the branch.

| | ESLint (job 104741718811) | Oxlint (job 104741717018) |
| --- | --- | --- |
| location reported | `src/libs/oxlintCanary.ts:9:9` | `src/libs/oxlintCanary.ts:9:9` |
| rule id | `no-debugger` | `no-debugger` |
| message | `Unexpected 'debugger' statement.` | `` `debugger` statement is not allowed `` / `Remove the debugger statement` |
| count | `1 error` | `1 error` |
| lint step | exit 1, twice, 388 s total | exit 1, once, 50 s |
| job conclusion | `failure` | `success`, with `::warning::Oxlint reported errors above its baseline` |

Both tools flagged the same statement at the same file, line and column, under the same rule id.
The messages read differently, and nothing keys on them, since a seatbelt row is
`[filename, ruleID, maxErrors]` (section 3.4) and an upstream rewording cannot move one.

The run exercises the whole Linux chain rather than only the exit code, covering real file
discovery, the sharded run, the seatbelt, the formatter, and the `steps.oxlint.outcome` branch that
turns a failing lint step into a warning. The job reported `success` with a warning attached, which
is what Phase 1 depends on. That also rules out the last reading of a green check as a possible
`E2BIG` no-op (section 2).

One Tier B rule picked up live evidence along the way. `no-debugger` sits at the root of
`oxlint.config.mts:242` with no fixture and zero findings in the repo, the class section 4.1 argues
against covering, and it behaved identically on both tools.

The evidence is narrow: one error from one native Rust core rule in one file, so it says nothing
about the JS-plugin rules, the type-aware leg, or the `push` path (TODO 1). A wider
canary would plant one finding per rule family, a native Rust rule alongside a `hosted/` JS-plugin
rule, a `rulesdir/` port and a tsgolint type-aware rule, then read all four off both jobs. The
per-rule fixtures in section 4 already cover that locally, so the wider version only pays for
itself if Linux and macOS behaviour ever comes into question.

### 3.7 The config is TypeScript

`oxlint.config.mts` default-exports `defineConfig({...})` from `oxlint`. Structure:

- The four copies of `no-restricted-imports` are built from shared consts, the way
  `restrictedImportPaths` works in `config/eslint/eslint.config.mjs`. An override replaces a rule's
  option object rather than merging into it, so every block has to restate the full list; the consts
  keep the copies identical.
- Every `off` with a reason comment stays, even where it is technically redundant.
- Short option objects are collapsed, and long `files` lists use brace globs.
- Five `typescript/*` rules (`no-floating-promises`, `no-require-imports`, `only-throw-error`,
  `prefer-promise-reject-errors`, `require-await`) are set `off` at the root after being set `error`
  over the same files, so the inventory lists 490 rules and 7 Oxlint-only extras.

Things to know:

- `.mts`, not `.ts`: a `.ts` config warns `MODULE_TYPELESS_PACKAGE_JSON` because `package.json` has
  no `"type": "module"`.
- It cannot sit beside a JSON config. Auto-discovery fails with
  `Both '.oxlintrc.json' and 'oxlint.config.mts' found`.
- `tsconfig.node.json` includes it, so `npm run typecheck` checks it. Rule severities and per-rule
  option types are checked (an invalid severity fails typecheck); a typo in a top-level key is not.
- Oxlint, ESLint and cspell all ignore it: its quoted rule keys trip `naming-convention` by the
  hundred, and rule keys are strings rather than identifiers.
- The pipeline imports it (`loadOxlintConfig` in `scripts/lint/oxlint/OxlintLinter.ts`); the Python
  harness evaluates it through node (`load_oxlint_config` in `oxlint-migration/ruleMap.py`).
- `oxlint --help` still calls JavaScript and TypeScript config files experimental.
- The editor path works. `oxlint --lsp` (verified on 1.86.0) loads the file: driven headless, a value
  import of `react-native-onyx/dist/OnyxUtils` gets `no-restricted-imports`, the same import as
  `import type` does not (the config's `allowTypeImports` applies), and a `rulesdir/` JS-plugin rule
  still runs (`no-raw-typography` fires on the fixture over the wire).

---

## 4. Rule evidence

Sidecar rules: core rules routed through Oxlint's JS plugin runtime 10/10, the `hosted/` plugin 40/40,
the `rulesdir/` ports 37/37, the hand-hosted set 87/87. Every covered rule has a fixture, a replayed
upstream RuleTester case, or a probe.

The `rulesdir/` rules with no upstream tests are tested in the repo at `tests/unit/*RuleTest.ts`, which
jest runs against ESLint only. `eslint-plugin-local-rules/tests/` holds the same cases as
`ruleTester.run` files so `compareRuleTester.py` can harvest and replay them through both tools;
`no-direct-personal-details-list` is covered that way. Jest does not collect `.test.js`, so the two
harnesses do not double-run them.

Native Rust rules, 288. `compareFixtures.py` carries 306 entries: 305 identical on both tools, 1
pinned intentional divergence (`react/no-did-update-set-state`, section 5.2). Each batch is checked
red-green by emptying its fixtures and confirming every row flips to FAIL.

### 4.1 Tier B is deliberately not covered

128 enabled core rules (unprefixed, no plugin) produce zero findings across the repo and have no
fixture (not re-measured at this merge). Writing one each would cost:

- Oxlint fails loud on an unknown rule name (verified on 1.86.0), at root and inside an override
  (`Rule 'no-such-rule-fake' not found in plugin 'react'`), so a typo'd, renamed or dropped core rule
  cannot hide. Core rules have no plugin to enable, so the silent-because-plugin-missing trap does
  not apply either.
- Option and severity drift is `checkConfigDrift.py`'s job and it already covers these rules.
- A fixture would only catch implementation divergence on code shapes that appear nowhere in this
  repo, for the simplest rules in either linter.

If this is revisited, do not do all 128. The option-heavy and scope-sensitive rules are where a
silent divergence would cost something: `no-unused-vars` first, then `no-undef`, `no-fallthrough`,
`no-constant-condition`, `no-useless-escape`, `no-self-assign`, `no-prototype-builtins` and the four
regex rules. About twelve.

---

## 5. Open questions

### 5.1 `react-hooks/refs`, 210 vs 189: multiplicity, plus a few locations

The bridge reports 189 against ESLint's 210. Most of it is duplicate collapsing rather than lost
checks. Across 141 ESLint locations and 142 oxlint locations: 22 findings are the same location
reported fewer times (15 locations, `useInitial.ts:11` is ESLint 3 vs bridge 1,
`DynamicConfirmationPage.tsx:168` is 7 vs 3), 3 sit at locations the bridge reports nothing for, and 4
are oxlint-only elsewhere -- so 25 hidden, 4 added, net -21. The 25 land across 12 files. The three
locations the bridge misses entirely:

```
__mocks__/react-native-safe-area-context.tsx:28
__mocks__/react-native-safe-area-context.tsx:38
src/pages/settings/AboutPage/AboutPage.tsx:141
```

Only `AboutPage.tsx` loses the rule outright; in the other files the bridge still reports `refs`, just
fewer times. The seatbelt counts multiplicity, so the gap has to be explained or closed before Phase 3.
The duplicate-report behaviour is in the React Compiler itself, shared by both tools, so closing it
means matching whichever copy each tool keeps rather than fixing a miss.

### 5.2 Port findings from the fixture campaign

Each divergence is pinned in the manifests.

`typescript/no-duplicate-type-constituents` misses structural duplicates. Oxlint reports
`string & string` and `string | string` and honours `ignoreUnions`, but stays silent on
`{a: string} & {a: string}`; ESLint asks the type checker and catches it. Accepted: the rule stays
on, the gap is recorded beside it in `oxlint.config.mts`, and the fixture row carries `oxlintLines` so
it flips the day oxlint compares structurally.

`react/no-did-update-set-state` is oxlint-only, and ESLint is the one that is off.
`makeNoMethodSetStateRule`'s `shouldBeNoop` disables the rule for `componentDidUpdate` at React 16.3
or above (`node_modules/eslint-plugin-react/lib/util/makeNoMethodSetStateRule.js:41`), and this repo
is on React 19. Oxlint's port has no version gate. Pinned as `oxlintOnly`, with the sibling
`no-will-update-set-state` as the control.

Oxlint configures `react/rules-of-hooks` but reports `react-hooks/rules-of-hooks`. Config id and
diagnostic id differ for the same rule; `ruleNames.mjs` maps it, and the seatbelt test in section 3.4
guards the mapping.
An unknown plugin name in an override's `plugins` array fails partially and silently. With
`plugins: ["react", "react-hooks"]` (`react-hooks` is not an oxlint plugin) thirteen `react/*` rules
behaved normally while `react/rules-of-hooks` reported nothing. `tests/tooling/lintPipeline.test.ts`
now checks every `plugins` array in `oxlint.config.mts` against the plugin enum in oxlint's
`configuration_schema.json`.

A spec early error hides every other finding in the file on oxlint only. Redeclaring a parameter
with `const` inside the function body is a parse error for oxlint's parser, which then runs no rules
on the file; ESLint's TypeScript parser accepts it and reports `@typescript-eslint/no-redeclare`
alongside everything else. Checked on `src/pages/Search/SearchPage.tsx` with an added value import of
OnyxUtils: ESLint reported `no-redeclare` and `no-restricted-imports`, oxlint only
`Identifier 'value' has already been declared`. Both flag the offending line, and the two match again
once the file parses. It lasts only while the file has a syntax error, and config cannot change it.

### 5.3 `react-hooks/purity`, 0 vs 35: kept on purpose

oxlint's compiler enables `validateNoImpureFunctionsInRender`, so the bridge surfaces 35 `rc/purity`
findings where ESLint reports 0 at the same locations (its `react-hooks/purity` rule is enabled --
`--print-config` shows `[2]` -- but its compiler build does not flag these). All 35 are `Date` called
during render, across 23 files, e.g. `CalendarPicker/index.tsx:80-82`, `SetDatePage.tsx:83`. Calling
`Date()` / `new Date()` while rendering is genuinely impure -- it reads wall-clock time, so the render
is not a pure function of its inputs and can tear or mismatch on server/client -- and
`react-native-best-practices` and the React Compiler both treat it as a real defect. ESLint simply
misses it.

These are kept, not suppressed. They land in the oxlint baseline as grandfathered rows, so they do not
fail CI, but they stay visible in `compare-oxlint` as +35 so the code can be cleaned up over time
(hoist the `Date` out of render, or into an effect / `useMemo` with an explicit dependency). If a future
`eslint-plugin-react-hooks` bumps its compiler to the same validation, ESLint will report them too and
the delta closes on its own.

---

## 6. TODO

Ordered by what blocks what.

The next action is to open `feat/oxlint` for review and merge it, which is Phase 1. Nothing on the
branch blocks that, and the items below are cheaper to work through with the shadow job already
running on `main` than they are to hold the branch open for.

1. Watch the `push` path once the branch is on `main`. Every run so far has been a
   `pull_request`, and three steps never fire on one: the seatbelt-tightened check is
   `if: github.event_name == 'push'`, and the OSBotify git setup and the auto-commit hang off its
   output (`oxlint.yml:45-70`). All three reported `skipped` in every run read so far, the latest
   being run 35869416331, so the tightening commit and its race with `lint.yml`'s own auto-commit
   have never executed. The race should be benign, since the two jobs use separate runners and
   separate files and the loser is rejected non-fast-forward then swallowed by `continue-on-error`,
   delaying one tightening by one merge. Read the first two or three pushes to `main` and confirm
   `oxlint.seatbelt.tsv` tightens once and only once.
2. Close the deltas an oxlint gate would hide, before Phase 3 (section 3.3.1). In rough order of size:
   - Mirror the `HeaderWithBackButton` -> `Header` ban into `oxlint.config.mts`, which accounts for
     502 of them (section 3.5). A plain config edit, not an engine gap, and CI's auto-tighten will
     not catch it.
   - Explain or close the `refs` multiplicity gap (189 vs 210, section 5.1).
   - Decide whether to keep the tsgolint `no-unsafe-*` extras (`no-unsafe-type-assertion` +53,
     `no-unsafe-return` +8) grandfathered, or suppress the family to hold parity until
     typescript-eslint and tsgo agree.
   - Clean up the 35 `purity` `Date`-during-render findings over time (section 5.3); they stay
     grandfathered meanwhile.
3. File a tracking issue for `rulesdir/boolean-conditional-rendering`, which has no replacement and
   no issue today (section 3.2). It is the one real coverage loss, and Phase 4 step 6 depends on it.
4. Every merge from `main` needs a manual `SEATBELT_INCREASE=all` pass, because the seatbelt
   tightens but never increases.

Known stale, not wired to any script: `oxlint-migration/compareNativeCtxValues.py` text-patches an
`rh` plugin entry the config no longer has and reads `.oxlintrc.json`. Rewrite it before relying on
it.

One thing to keep rather than do: the canary recipe in section 3.6. Re-plant it once after Phase 3
flips the job to blocking, to prove that removing `continue-on-error` fails the build instead of
warning about it. Phase 3 rests on that single assertion and it cannot be tested before the flip.

---

## 7. Migration plan

Each phase is independently revertible and none removes a safety net before its replacement is
proven.

### Phase 1: land the shadow job (unblocked, next up)

Merge `feat/oxlint`. Oxlint then runs on every PR and every push to `main`, non-blocking, keeping
its own baseline. The job lints the real repo in 54 s and the canary confirms it reports real errors
through the whole chain (section 3.6).

- Exit criteria: one week on `main` with `oxlint.seatbelt.tsv` tightening cleanly and no observed
  interference with `lint.yml`'s auto-commit (TODO 1).
- Revert: delete the `oxlint` job from `preDeploy.yml`. Nothing else depends on it.

### Phase 2: close the evidence gap (alongside Phase 1)

TODO 2. The checks that hold the rest of parity sit in section 2.

- Exit criteria: every delta an oxlint gate would hide has a chosen path with no coverage regression
  against ESLint, `npm run oxlint-config-drift` reports 0 open differences, and `compareFullRepo.sh`
  prints no unexplained difference.

### Phase 3: flip Oxlint to blocking, keep ESLint

Not before TODO 2 is decided, which today means at least mirroring the `HeaderWithBackButton` ban so
`oxlint-parity-direction` stops reporting its 502 (section 3.3.1).

- Remove `continue-on-error` from the lint step in `oxlint.yml`.
- Drop the `Report the Oxlint result without failing the job` step, which becomes dead.
- Add `oxlint` to `confirmPassingBuild`'s `needs` in `preDeploy.yml`.
- Leave the ESLint job running and blocking.
- Re-plant the canary once (section 3.6) and confirm the job's conclusion reads `failure` rather
  than a warning. This is the only behaviour Phase 3 changes and it cannot be tested before the flip.
- Exit criteria: one week with no ESLint finding that oxlint hid -- the direction that actually drops
  a check, read from `npm run oxlint-parity-direction` on the merge runs, not the oxlint-only failures
  the non-blocking job already logs.
- Revert: put `continue-on-error` back.

### Phase 4: retire ESLint

Only after Phase 3's exit criteria, in this order so each step is separately revertible:

1. Point editors at Oxlint's LSP. It loads `oxlint.config.mts` (section 3.7).
2. Drop the ESLint job from `preDeploy.yml` and `confirmPassingBuild`'s `needs`.
3. Remove ESLint packages from `package.json`.
4. Delete `config/eslint/eslint.seatbelt.tsv`, `config/eslint/`, `scripts/lint/eslint/`.
5. Rename `oxlint.seatbelt.tsv` to the canonical seatbelt path and drop the per-linter mapping in
   `scripts/lint/processors/Seatbelt.ts`.
6. Accept the loss of `rulesdir/boolean-conditional-rendering`, or land a typed `jsPlugins`
   replacement first.

Step 3 is the point of no return: after it, expected finding counts cannot be regenerated.
Everything in Phase 2 must be finished before it.

---

## 8. Reproducing every number here

```bash
OXLINT_SHARDS=4 npm run lint -- --linter=oxlint --timings        # sections 2, 3.1
npm run typecheck                                                # section 2
npm run test:bun                                                 # section 2
bash oxlint-migration/compareFullRepo.sh --fresh                 # sections 3.2, 3.3, 5.1, 5.3
python3 oxlint-migration/checkParityDirection.py                 # section 3.3.1 (safe vs unsafe direction)
python3 oxlint-migration/port-probe/compareFixtures.py           # section 4
python3 oxlint-migration/checkSidecarCoverage.py                 # section 4
python3 oxlint-migration/listAllRules.py                         # section 4
npm run oxlint-config-drift                                      # section 3.5
```

Or every oxlint script at once, serially, which is how section 2.1 was produced:

```bash
for s in lint-oxlint compare-oxlint oxlint-parity-direction oxlint-config-drift oxlint-eslint-directives \
         oxlint-jsx-uses-port oxlint-locale-compare-port oxlint-react-compiler-gate \
         oxlint-react-compiler-rust oxlint-rule-availability oxlint-rule-fixtures \
         oxlint-rule-inventory oxlint-rule-tester oxlint-sidecar-coverage; do
    npm run "$s" >"/tmp/$s.log" 2>&1
    printf '%-32s exit=%s\n' "$s" "$?"
done
```

Serially matters: see the `/tmp` race in section 2.1. The pipeline test is not in that loop because
it runs under bun, not npm:

```bash
TZ=utc bun test --preload ./scripts/stubReactNative.js --preload ./tests/tooling/setup.ts \
    ./tests/tooling/lintPipeline.test.ts                                               # section 3.4
```

`compareFullRepo.sh` caches both reports in `/tmp`; omit `--fresh` to re-read them without the
seven-minute ESLint leg.
