# Oxlint Migration: Current State

Branch `feat/oxlint`, with `origin/main` merged at `36c747c7f83` (228 commits, no conflicts).
Every number here comes from the command quoted beside it, run on 2026-09-14 or 2026-09-15.
This file holds current state and remaining work. Resolved problems are deleted; the dead-shard
investigation lives in `OXLINT_DEAD_SHARD_HANDOFF.md`.

---

## 1. Where this stands

The pipeline is done. `scripts/lint/index.ts` runs either linter behind the same
`Linter -> Processor[] -> Formatter` ports, each with its own seatbelt baseline. Oxlint passes its
baseline over the whole repo in 34 seconds; ESLint takes 396 (section 3.1). The run is 4 JS-plugin
shards plus one type-aware process (section 2.2) and reports the same findings as a single process.

Config parity is closed. Every rule ESLint enables is either enabled in Oxlint or has a written
reason not to be, and config drift is at 0 open differences (section 3.5). Rule evidence is closed
as far as it is worth taking: 306 fixtures, all green; the 128 core rules without one are a
deliberate stop (section 4.1).

Left to do:

- The CI job has never produced a real result. Every run since sharding landed died in 3 s behind
  `continue-on-error` (section 2). The fix is pushed as `3914cd61dc9`; the first Linux run still has
  to be read (TODO 1).
- `react-hooks/set-state-in-effect` reports 47 of ESLint's 127. The fix is built and measured
  (hosting the compiler rules from `eslint-plugin-react-hooks`, exact parity) and parked because it
  costs 15 s per run; section 5.1 has the recipe.
- `react-hooks/refs` reports equal totals at different locations (section 5.2); the parked fix
  closes this too.
- `rulesdir/boolean-conditional-rendering` has no replacement (section 3.2).

---

## 2. What runs today

| check | command | result |
| --- | --- | --- |
| Oxlint, whole repo, through the pipeline | `npm run lint -- --linter=oxlint` | exit 0, nothing above baseline, **34 s** at `OXLINT_SHARDS=4` |
| Types | `npm run typecheck` | **passed** |
| Tooling tests | `npm run test:bun` | **595 pass / 0 fail**, 46 files |
| Per-rule parity, all batches | `npm run oxlint-rule-fixtures` | **306 entries: 302 identical, 1 pinned divergence, 3 blocked upstream** |
| Whole-repo parity | `bash oxlint-migration/compareFullRepo.sh --fresh` | section 3 |
| Sidecar rule evidence | `npm run oxlint-sidecar-coverage` | **192 / 192 covered** |
| Rule inventory | `npm run oxlint-rule-inventory` | **494 rules, fixture coverage 306 / 494** |
| Config drift | `npm run oxlint-config-drift` | 29 rules differ, **0 open**, all in the LEDGER |

CI is `.github/workflows/oxlint.yml`, wired into `preDeploy.yml` and left out of
`confirmPassingBuild`'s `needs`. The lint step carries `continue-on-error: true`. On a push to `main`
it commits its own tightened baseline, as `lint.yml` does for ESLint. Since `3914cd61dc9` it runs on
`blacksmith-8vcpu-ubuntu-2404` (32 GB) with `OXLINT_SHARDS: 4`.

The job has not produced a real result yet. Every run from the sharding commit (`693d2a0f09c`,
2026-09-14) to `3914cd61dc9` ended after 2 to 3 seconds with `Failed to parse Oxlint JSON output.`
and `Process completed with exit code 249`, and `continue-on-error` turned that into a green check.
`npx oxlint <files>` hands the command to `sh -c` as one string (`@npmcli/run-script` sets
`shell: true`), Linux caps a single argv element at 128 KB, and a 2-shard file list is 229 KB per
shard. `execve` fails with `E2BIG`, errno 7; npm exits `-7`, which the shell reports as 249. macOS
has a 1 MB total `ARG_MAX` and no per-element cap, so developer machines never saw it.
`OxlintLinter` now execs `node_modules/.bin/oxlint` for the file listing and every leg, so each path
is its own argv element. Verified on macOS with `OXLINT_SHARDS=2` and `4`, exit 0. The Linux run is
TODO 1.

### 2.1 Every oxlint script, rerun 2026-09-14

All thirteen `package.json` scripts that touch oxlint, run one at a time. Exit codes are the process
exits, not a reading of the output.

| script | exit | result |
| --- | --- | --- |
| `lint -- --linter=oxlint` | **0** | the required gate: nothing above baseline |
| `lint-oxlint` | **1** | raw `oxlint .`, no pipeline and no seatbelt, so it prints the whole baseline (~4300 lines). Exit 1 is by design |
| `compare-oxlint` (`--fresh`) | **0** | 9234 tracked lintable files. Config coverage eslint=482, oxlint=487, shared=475. No unexplained ESLint-only rules. `react-hooks/refs` has equal totals at different locations (section 5.2) |
| `compare-oxlint-warm` | **0** | timing benchmark. Warm ESLint 543 s, oxlint 86 s |
| `oxlint-config-drift` | **0** | 45 files, 29 rules differ, **0 open** |
| `oxlint-jsx-uses-port` | **0** | `jsx-uses-react` and `jsx-uses-vars` behave the same on both tools |
| `oxlint-locale-compare-port` | **0** | the type-free port matches the type-aware original on every shape in `src/` |
| `oxlint-react-compiler-gate` | **0** | the gate matches the ESLint side: silent where both compilers memoize, live where they do not |
| `oxlint-react-compiler-rust` | **0** | all assertions hold |
| `oxlint-rule-availability` | **0** | wrote `oxlint-migration/rule-availability.json` |
| `oxlint-rule-fixtures` | **0** | 306 entries: 302 identical, 1 pinned divergence, 3 blocked upstream |
| `oxlint-rule-inventory` | **0** | 494 rules, fixture coverage 306/494, 0 unproven. Wrote `rule-inventory.json` |
| `oxlint-rule-tester` | **0** | all 34 custom rules identical across 445 harvested cases |
| `oxlint-sidecar-coverage` | **0** | 192 / 192 covered |

Before rerunning these: do not run them concurrently. `compareFullRepo.sh` truncates and rewrites
`/tmp/oxlint-full.json` and `/tmp/eslint-full.json`, `listAllRules.py` reads both, and a half-written
file kills the inventory with a `JSONDecodeError`. `load_findings` checks `os.path.exists` but not
whether the JSON is complete, so a killed comparison leaves the same trap. Also, `compare-oxlint`
reuses the `/tmp` reports unless you pass `--fresh`; an instant run is reading a cached report,
possibly from another commit.

### 2.2 How the sharded run is put together

Oxlint runs all 192 JS-plugin rules on one Node thread per process (upstream oxc#26621, open, no
PR), so more cores only help through more processes. Type-aware rules go to `oxlint-tsgolint`, a
separate multi-threaded Go binary that builds a TypeScript program for the files' import graph, about
9 GB for this repo. `OxlintLinter.run` derives two configs from `.oxlintrc.json` per run, writes them
beside it and removes them in `finally`:

```text
run(targets)
  files = oxlint --debug=files targets                   # 9093 paths, one short process
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
234 / 1570 / 679 across four slices of this repo, about 970 each interleaved). It matters little
today, because the React Compiler rules run over the Rust compiler and cost seconds; it matters a
lot the day they move to the hosted JavaScript plugin (section 5.1), where contiguous slices
measured 69 s against 49 s interleaved.

Native Rust rules run in every process; they take seconds and the merge dedupes them. "Available
memory" is `vm_stat` free + inactive + speculative + purgeable pages on macOS, because `os.freemem()`
there counts free pages only (4.5 GB on an idle 48 GB machine against 18 GB reclaimable), and
`os.freemem()` elsewhere. CI pins `OXLINT_SHARDS=4`: on 8 vCPU that is 4 shard threads plus about
4 tsgolint threads, and the type-aware leg is the floor, so more shards would not shorten the run.
`OXLINT_SHARDS=1` runs one stock process with the original config, for comparison. `--fix` runs the
legs one after another so the type-aware process and the shards never write the same file at once.

A run that only passed because of a retry says so on stderr, with the leg, exit code, whether JSON
was present, and the plan it was sized to. If the gate exits 2, keep stderr.

---

## 3. Parity

### 3.1 Timings and runners

| | ESLint (`lint.yml`) | Oxlint (`oxlint.yml`) |
| --- | --- | --- |
| runner | `blacksmith-16vcpu-ubuntu-2404`, 64 GB | `blacksmith-8vcpu-ubuntu-2404`, 32 GB, `OXLINT_SHARDS: 4` |
| why that size | a cold cache loads a 12 GB type program into each of two workers (`lint.yml` `runs-on` comment) | one 9.3 GB type program plus 4 shards at 1.5 GB, about 15 GB |
| whole repo, 14-core Mac, cold | 396 s (`ESLINT_CONCURRENCY=2`, 16 GB heap, no cache) | 34 s (89 s as one process) |
| CI lint step | under a minute on a warm cache, several minutes cold, plus a clear-cache-and-retry on failure (`lint.yml:77-90`) | about 45 s, extrapolated from the Mac, unverified until TODO 1 |

Blacksmith bills per vCPU-minute, so the oxlint job costs about half per run. On a warm cache the two
lint steps take about the same wall time, because ESLint's cache limits it to changed files while
oxlint lints the whole repo every time. On a cold cache oxlint is several minutes faster. Linting only
changed files on PRs would beat the warm time and is not a goal: the whole-repo run is what keeps the
seatbelt honest.

Findings match: 4307 raw messages from the sharded run and from a single process, the same multiset.
The ESLint leg needs `NODE_OPTIONS=--max_old_space_size=16384` and capped concurrency or its workers
die with `ERR_WORKER_OUT_OF_MEMORY` even on a 48 GB machine.

### 3.2 Config coverage

Union of enabled rules over every tracked lintable file, both sides:

```
eslint=482   oxlint=487   shared=475
ESLint-only with a port plan: 7
ESLint-only unexplained:      0
Oxlint-only extras:           12
```

The 7 ESLint-only rules report zero findings today and none has a seatbelt row. Plans live in
`oxlint-migration/ruleMap.py` `PORT_PLAN`.

| rule | plan | proven | real loss |
| --- | --- | --- | --- |
| `progress/activate` | drop, Oxlint prints its own progress | no | none |
| `react-hooks/component-hook-factories` | nothing to port, upstream ships a stub whose `create()` returns `{}` | yes | none |
| `react-hooks/config` | not hosted; the hosted compiler rules come from the same plugin build and fail at load on a bad compiler option, which is what this rule would report | yes | none |
| `react-hooks/gating` | dropped, only fires with a `dynamicGating` source, which production does not supply | no | none |
| `no-invalid-this` | skipped, hosting it gives 51 JS-plugin errors and 0 findings; TS/TSX covered by `noImplicitThis` | yes | about none, 19 non-ignored JS files contain a `this` token |
| `rulesdir/prefer-at` | superseded in part by `unicorn/prefer-at` at default options | yes | **partial**, loses plain `arr[0]` / `arr[i]` |
| `rulesdir/boolean-conditional-rendering` | **blocked**, needs the type of the `&&` left operand | no | **yes**, waits on typed `jsPlugins` |

`rulesdir/boolean-conditional-rendering` is the only real coverage loss. It reports zero findings
because it is enforced today, so the cost is deferred: future `{count && <X/>}` regressions go
uncaught. No tracking issue exists (TODO 3).

### 3.3 Findings per rule, whole repo

ESLint 3333, Oxlint 4552. Both legs run through `scripts/lint/index.ts --format=json` with
`SEATBELT_DISABLE=1`, so both pass the same processors. A typescript-eslint extension rule is counted
under the base rule oxlint runs, or one rule lands in two rows. Rerun 2026-09-16 after merging
`origin/main` and mirroring `no-direct-personal-details-list` (9306 tracked lintable files).

| rule | eslint | oxlint | delta | reading |
| --- | ---: | ---: | ---: | --- |
| `@typescript-eslint/no-unsafe-type-assertion` | 1953 | 1955 | +2 | noise |
| `@typescript-eslint/no-unnecessary-type-assertion` | 0 | 758 | +758 | both enable it; TS 6.0.2 and tsgo TS7 infer differently |
| `no-restricted-syntax` | 327 | 327 | 0 | parity |
| `rulesdir/no-direct-personal-details-list` | 270 | 270 | 0 | parity; rule mirrored 2026-09-16, its impl from #101075 landed on main the same day |
| `@typescript-eslint/no-deprecated` | 223 | 399 | +176 | priced: all 182 oxlint-only are write sites (tsgolint strictness, typescript-eslint#10643); all 6 ESLint-only are read sites silenced by the 91-file write-site override. Accepted cost: 6 lost findings |
| `react-hooks/refs` | 212 | 212 | 0 | equal totals, 3 locations differ each way, section 5.2 |
| `import/no-cycle` | 0 | 259 | +259 | both enable it; ESLint's copy is inert |
| `react-hooks/set-state-in-effect` | 124 | 45 | **-79** | **open**, the Rust bridge cannot see non-fatal compiler diagnostics; fix parked, section 5.1 |
| `no-restricted-imports` | 97 | 97 | 0 | parity, includes the ported OnyxUtils ban |
| `rulesdir/no-raw-typography` | 44 | 44 | 0 | parity |
| `rulesdir/no-onyx-connect` | 41 | 41 | 0 | parity |
| `react-hooks/preserve-manual-memoization` | 12 | 75 | +63 | over-reports through the bridge; the parked fix brings it to 12, section 5.1 |
| `rulesdir/no-default-id-values` | 21 | 21 | 0 | parity |
| `react-hooks/immutability` | 6 | 7 | +1 | one extra through the bridge; the parked fix brings it to 6 |
| `import/no-named-as-default` | 0 | 13 | +13 | shared config, Oxlint finds more |
| `unicorn/prefer-at` | 0 | 4 | +4 | Oxlint-only, expected (default options, covers the type-free `x[x.length - N]` family) |
| `react-hooks/static-components` | 2 | 2 | 0 | parity |
| `react-hooks/exhaustive-deps` | 1 | 1 | 0 | parity |
| `no-unsafe-optional-chaining` | 0 | 3 | +3 | Oxlint-only finding |
| `@typescript-eslint/no-unsafe-return` | 0 | 3 | +3 | Oxlint-only finding |
| `@typescript-eslint/no-misused-promises` | 0 | 3 | +3 | Oxlint-only finding |
| `import/no-duplicates` | 0 | 3 | +3 | Oxlint-only finding |
| `no-empty-function` | 0 | 2 | +2 | Oxlint-only finding |
| `@typescript-eslint/no-unsafe-member-access` | 0 | 2 | +2 | Oxlint-only finding |
| `react/no-unstable-nested-components` | 0 | 1 | +1 | Oxlint-only finding |
| `react/button-has-type` | 0 | 1 | +1 | Oxlint-only finding |
| `no-redeclare` | 0 | 1 | +1 | Oxlint-only finding |
| `import/export` | 0 | 1 | +1 | Oxlint-only finding |
| `react/jsx-key` | 0 | 1 | +1 | Oxlint-only finding |
| `@typescript-eslint/no-unsafe-assignment` | 0 | 1 | +1 | Oxlint-only finding |
| **totals** | **3333** | **4552** | **+1219** | |

Every rule not listed reports 0 on both tools. The +1219 decomposes exactly: +1017 from
`no-unnecessary-type-assertion` (758) and `import/no-cycle` (259), two rules ESLint enables but cannot
report on; +176 `no-deprecated`; -15 net across `react-hooks/*`; +41 scattered singles, each an Oxlint
finding ESLint's copy of the same rule missed.

The React Compiler reports some diagnostics twice, same file, position and text: ESLint's plugin
does it for 39 `refs` locations, the bridge for 42 `refs` and 7 `preserve-manual-memoization`. The
seatbelt counts both copies on both sides, and the sharded merge keeps within-process duplicates so
counts do not move with the shard plan. Not a defect to fix on the oxlint side.

### 3.4 Seatbelt baselines

One file per linter. The seatbelt tightens itself, and a shared file would ping-pong between the two
tools' counts on every CI run.

| baseline | rows | grandfathered errors | live findings (2026-09-16) |
| --- | ---: | ---: | ---: |
| `config/eslint/eslint.seatbelt.tsv` | 1583 | 3333 | 3333 |
| `config/oxlint/oxlint.seatbelt.tsv` | 2054 | 4591 | 4552 |

The ESLint baseline matches its live count. The Oxlint baseline carries 4591 against a live 4552 — 39
rows of slack left by the 2026-09-16 hand-merge of `82f9a6d`'s re-baseline against this branch's own
(union-max, section 3.3), plus the #101075 personal-details changes that landed on `main` after it.
Under CI's `SEATBELT_FROZEN=0` the extra rows only warn, so the gate still holds; the next
`SEATBELT_INCREASE=all` regen tightens it back to the live count. The seatbelt tightens but never
increases on its own, so every merge from `main` needs that manual pass anyway (TODO 4).

`tests/tooling/lintPipeline.test.ts` checks that every rule id in the oxlint baseline is one the
enabled config still produces through `config/oxlint/ruleNames.mjs`. If oxlint renames a diagnostic
code or a mapping entry goes wrong, the baseline rows for that rule would tighten to zero while the
live findings surface under a new id; the test fails first.

### 3.5 Config drift

`checkConfigDrift.py` probes 45 files and compares rule settings, not just presence, so it catches
the same rule with different options, or on in one scope and off in another.

```
45 files, 29 rules differ
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
glue lives.

---

## 4. Rule evidence

Sidecar rules, 192 of 192 covered: core rules routed through Oxlint's JS plugin runtime (10), the
`hosted/` plugin (40), the `rulesdir/` ports (36), the hand-hosted set (86). Each has a fixture, a replayed upstream RuleTester case, or a probe.

Native Rust rules, 294. `compareFixtures.py` carries 306 entries: 302 identical on both tools, 1
pinned intentional divergence (`react/no-did-update-set-state`, section 5.3), 3 asserted silent
because the Rust bridge cannot see their non-fatal category (`set-state-in-effect`,
`static-components`, `error-boundaries`; section 5.1). Each batch was checked red-green by emptying
its fixtures and confirming every row flips to FAIL.

### 4.1 Tier B is deliberately not covered

128 enabled core rules (unprefixed, no plugin) produce zero findings across the repo and have no
fixture. Writing one each was planned and dropped:

- Oxlint 1.83.0 fails loud on an unknown rule name, at root and inside an override (`Rule
  'no-such-rule-at-all' not found in plugin 'eslint'`), so a typo'd, renamed or dropped core rule
  cannot hide. Core rules have no plugin to enable, so the silent-because-plugin-missing trap does
  not apply either.
- Option and severity drift is `checkConfigDrift.py`'s job and it already covers these rules.
- A fixture would only catch implementation divergence on code shapes that appear nowhere in this
  repo, for the simplest rules in either linter.

If this is revisited, do not do all 128. The option-heavy and scope-sensitive rules are where a
silent divergence would cost something: `no-unused-vars` first, then `no-undef`, `no-fallthrough`,
`no-constant-condition`, `no-useless-escape`, `no-self-assign`, `no-prototype-builtins` and the four
regex rules. About twelve. The original gap script reports 132 because it does not exclude rules
that already have a fixture; the real number is 128.

---

## 5. Open questions

### 5.1 `react-hooks/set-state-in-effect`, 127 vs 47: fixed, then parked for speed

**Why the bridge misses.** The twelve React Compiler rules run as `rc/*` over `oxc-transform-react`
(`config/oxlint/reactCompilerRust.mjs`). Its `transformSync` returns only fatal compiler diagnostics
(oxc-project/oxc#26318, confirmed on 0.150.0, the current release). `set-state-in-effect` is a
non-blocking validation: a component whose only problem is that one compiles fine, and the binding
drops the diagnostic. The 47 the bridge catches are files where something else aborted the compile
and the list came along. Verified on `oxlint-migration/setStateInEffectRepro.tsx`: zero errors under
every `panicThreshold`, `outputMode` and `enableVerboseNoSetStateInEffect` combination.

**Why not oxlint's native `react/*` compiler rules.** oxc-project/oxc#26277, reproduced on 1.83.0
with the issue's own case: a `disable-next-line` naming `react/exhaustive-deps` or
`react/rules-of-hooks` silences every compiler diagnostic in the enclosing component (two
`react(purity)` violations, one reported). The compiler's default `eslintSuppressionRules` skips any
function carrying such a comment, and the native rules do not expose the option. This repo has 228
of those comments. Measured earlier: native `set-state-in-effect` reports 415, of which 69 are
ESLint's 127. Open upstream, no PR.

**The fix, built and measured on 2026-09-15.** Host the twelve rules from `eslint-plugin-react-hooks`
7.1.1, the build ESLint runs (nested under `eslint-config-expensify`), under `hosted/`, the way
`exhaustive-deps` already is. The plugin parses each file with Babel and runs the JavaScript
compiler once per file, cached across the twelve rules, so every diagnostic is visible and the
suppression handling is ESLint's own. Whole repo, by rule, file, line and multiplicity:

| rule | ESLint | bridge (today) | hosted |
| --- | ---: | ---: | ---: |
| `set-state-in-effect` | 127 | 47 | 127, same locations |
| `refs` | 215 | 215, 3 locations differ | 215, same locations |
| `preserve-manual-memoization` | 2 | 65 | 2 |
| `immutability` | 6 | 7 | 6 |
| `static-components` | 2 | 2 | 2 |

The three fixture rows asserted silent in `compareFixtures.py` report on their own with the hosted
plugin, so the manifest goes to 305 identical and 1 pin.

**The cost, and why it is parked.** About 100 s of CPU per whole-repo run for Babel parse plus
compile (one rule or twelve makes no difference: 54.7 s against 58.9 s over `src/` single-threaded).
Through the pipeline at `OXLINT_SHARDS=4`: 34 s today, 51 s hosted with interleaved shards, 69 s
with the contiguous slices the sharder used before. One process: 89 s today, 170 s hosted. The CI
estimate moves from about 45 s to about 65 s. The whole-repo run was judged to be close to a minute
already, so the bridge stays until the missing findings matter more than 15 s.

**The switch, when wanted.** Every step was done and verified once; the diff was reverted, not lost.

1. `config/oxlint/ruleNames.mjs`: add the twelve names to `HOSTED_RULE_ORIGIN` with origin
   `react-hooks`; drop the `plugin === 'rc'` branch in `oxlintCodeToESLintRuleID`.
2. `config/oxlint/plugins/hosted-rules.mjs`: add
   `...hostRules(reactHooks, 'react-hooks', plainlyHosted('react-hooks'))` to the plugin's rules.
   `exhaustive-deps` stays in `SEPARATELY_GATED`.
3. `.oxlintrc.json`: `rc/*` to `hosted/*`, remove the `rc` entry from `jsPlugins`, rewrite the
   comment block.
4. `oxlint-migration/ruleMap.py`: remove the two `rc` branches (`norm_ox_code`, `norm_ox_config`).
5. `oxlint-migration/port-probe/fixtures.manifest.json` and `oxlint.fixtures.json`: `rc/` to
   `hosted/`, drop the three `blockedUpstream` pins, drop the `rc-rules.mjs` plugin path.
6. Delete `config/oxlint/plugins/rc-rules.mjs`, `config/oxlint/reactCompilerRust.mjs`,
   `oxlint-migration/checkReactCompilerRust.mjs`, `oxlint-migration/rc-rust-probe.oxlintrc.json`,
   and the `oxlint-react-compiler-rust` script in `package.json`.
7. `SEATBELT_INCREASE=all npm run lint -- --linter=oxlint` to re-baseline. Expect the `react-hooks/*`
   rows to match `eslint.seatbelt.tsv` row for row (68 files for `refs`, 99 for
   `set-state-in-effect`).
8. Update `tests/tooling/lintPipeline.test.ts`: the mapping expectation `rc(set-state-in-effect)`
   becomes `hosted(set-state-in-effect)`.

Switch to oxlint's native `react/*` rules instead if #26277 is fixed first (an `eslintSuppressionRules`
option on the native rules), since that path costs nothing; re-run `compareFullRepo.sh` before
trusting it.

### 5.2 `react-hooks/refs`, equal totals at different locations

215 on both, 3 locations each way:

```
eslint only: __mocks__/react-native-safe-area-context.tsx:38
eslint only: __mocks__/react-native-safe-area-context.tsx:39
eslint only: src/components/FlatList/FlatList/index.tsx:70
oxlint only: src/components/EmojiPicker/EmojiPickerMenu/index.native.tsx:117
oxlint only: src/components/EmojiPicker/EmojiPickerMenu/index.native.tsx:130
oxlint only: src/components/EmojiPicker/EmojiPickerMenu/index.tsx:176
```

The hosted plugin (section 5.1) reports the same 215 locations as ESLint, so this closes with it.

### 5.3 Port findings from the fixture campaign

Each was measured while building a batch and is pinned in the manifests.

`typescript/no-duplicate-type-constituents` misses structural duplicates. Oxlint reports
`string & string` and `string | string` and honours `ignoreUnions`, but stays silent on
`{a: string} & {a: string}`; ESLint asks the type checker and catches it. Accepted: the rule stays
on, the gap is recorded beside it in `.oxlintrc.json`, and the fixture row carries `oxlintLines` so
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
now checks every `plugins` array in `.oxlintrc.json` against the plugin enum in oxlint's
`configuration_schema.json`.

---

## 6. TODO

Ordered by what blocks what.

1. Read the first real CI run. `3914cd61dc9` moved the job to `blacksmith-8vcpu-ubuntu-2404` with
   `OXLINT_SHARDS: 4` and replaced `npx oxlint` with the direct bin (section 2). The lint step should
   take about a minute and print no `Failed to parse`. Write the measured duration into section 3.1.
   Then land the shadow job on `main` and watch `oxlint.seatbelt.tsv` tighten and the push race
   against `lint.yml`. The race should be benign (separate runners and files, the loser is rejected
   non-fast-forward and swallowed by `continue-on-error`, so one tightening is delayed by one merge);
   nobody has seen it run.
2. Decide on the parked compiler-rule fix before Phase 3 (section 5.1). Blocking with the bridge
   ships 80 fewer `set-state-in-effect` findings than ESLint; the hosted plugin closes that for 15 s
   per run, or oxlint's native rules do it for free once oxc#26277 is fixed.
3. `rulesdir/boolean-conditional-rendering` has no replacement and no tracking issue (section 3.2).
4. Every merge from `main` needs a manual `SEATBELT_INCREASE=all` pass. The seatbelt tightens but
   never increases.

---

## 7. Migration plan

Each phase is independently revertible and none removes a safety net before its replacement is
proven.

### Phase 1: land the shadow job (blocked on TODO 1)

Merge `feat/oxlint`. Oxlint runs on every PR and every push to `main`, non-blocking, keeping its own
baseline. Not before the CI run in TODO 1 has been read: the fix for the 3-second death has only been
verified on macOS, and landing without that run could put a green-looking no-op on `main`.

- Exit criteria: one week on `main` with `oxlint.seatbelt.tsv` tightening cleanly and no observed
  interference with `lint.yml`'s auto-commit.
- Revert: delete the `oxlint` job from `preDeploy.yml`. Nothing else depends on it.

### Phase 2: close the evidence gap (alongside Phase 1)

TODO 2. Everything else is closed; the checks that keep it that way run in section 2.

- Exit criteria: the compiler rules have a chosen path with no coverage regression against ESLint,
  `npm run oxlint-config-drift` reports 0 open differences, and `compareFullRepo.sh` prints no
  unexplained difference.

### Phase 3: flip Oxlint to blocking, keep ESLint

Not before TODO 2 is decided.

- Remove `continue-on-error` from the lint step in `oxlint.yml`.
- Add `oxlint` to `confirmPassingBuild`'s `needs` in `preDeploy.yml`.
- Leave the ESLint job running and blocking.
- Exit criteria: one week with no Oxlint-only CI failure ESLint would not also have caught.
- Revert: put `continue-on-error` back.

### Phase 4: retire ESLint

Only after Phase 3's exit criteria, in this order so each step is separately revertible:

1. Point editors at Oxlint's LSP.
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
bash oxlint-migration/compareFullRepo.sh --fresh                 # sections 3.2, 3.3, 5.2
python3 oxlint-migration/port-probe/compareFixtures.py           # section 4
python3 oxlint-migration/checkSidecarCoverage.py                 # section 4
python3 oxlint-migration/listAllRules.py                         # section 4
npm run oxlint-config-drift                                      # section 3.5
```

Or every oxlint script at once, serially, which is how section 2.1 was produced:

```bash
for s in lint-oxlint compare-oxlint oxlint-config-drift oxlint-jsx-uses-port \
         oxlint-locale-compare-port oxlint-react-compiler-gate oxlint-react-compiler-rust \
         oxlint-rule-availability oxlint-rule-fixtures oxlint-rule-inventory \
         oxlint-rule-tester oxlint-sidecar-coverage; do
    npm run "$s" >"/tmp/$s.log" 2>&1
    printf '%-32s exit=%s\n' "$s" "$?"
done
```

Serially matters: see the `/tmp` race in section 2.1.

`compareFullRepo.sh` caches both reports in `/tmp`; omit `--fresh` to re-read them without the
seven-minute ESLint leg.
