# Oxlint Migration: Current State

Branch `feat/oxlint`, with `origin/main` merged at `36c747c7f83` (228 commits, no conflicts).
Every number here was produced by the command quoted beside it, on 2026-09-14.
This file is current state and remaining work only. Resolved problems are not kept.

---

## 1. Where this stands

The pipeline is done. `scripts/lint/index.ts` runs either linter behind the same
`Linter -> Processor[] -> Formatter` ports, each with its own seatbelt baseline, and Oxlint is green
against its baseline over the whole repo in 43 seconds against ESLint's 394. Config parity is
closed: every rule ESLint enables is either enabled in Oxlint or has a written reason not to be.

Rule evidence is now largely closed too. The fixture campaign took `compareFixtures.py` from 56
entries to 306, all green and each batch red-green verified (section 4). The 128 core rules still
without a fixture are a deliberate stop with the reasoning written down (section 4.1), not a queue.

Config drift is at **0 open differences** (section 3.5), and two of the three rules that disagreed on
findings are now explained: `no-deprecated` is priced tsgolint write-site strictness (section 5.1),
and `set-state-in-effect` is an upstream detection gap with a nine-line reproducer ready to file
(section 5.2).

What is left: the CI shadow job has never executed on `main`, `react-hooks/refs` still hides a
disagreement behind equal totals (section 5.3), the `set-state-in-effect` bug needs filing upstream,
and the fixture campaign surfaced eight port findings that need an owner before the cutover
(section 5.5) -- among them a real detection hole in `typescript/no-duplicate-type-constituents` and
one piece of dead config, `react/jsx-filename-extension`.

---

## 2. What runs today

| check | command | result |
| --- | --- | --- |
| Oxlint, whole repo, through the pipeline | `npm run lint -- --linter=oxlint` | exit 0, nothing above baseline, **35 to 52 s** |
| Types | `npm run typecheck` | **passed** |
| Tooling tests | `npm run test:bun` | **587 pass / 0 fail**, 46 files |
| Per-rule parity, all batches | `npm run oxlint-rule-fixtures` | **306 entries: 302 identical, 1 pinned divergence, 3 blocked upstream** |
| Whole-repo parity | `bash oxlint-migration/compareFullRepo.sh --fresh` | section 3 |
| Per-rule parity | `python3 oxlint-migration/port-probe/compareFixtures.py` | section 4 |
| Sidecar rule evidence | `npm run oxlint-sidecar-coverage` | **192 / 192 covered** |
| Rule inventory | `npm run oxlint-rule-inventory` | **494 rules, fixture coverage 306 / 494** |
| Config drift | `npm run oxlint-config-drift` | 28 rules differ, **0 open**, nothing outside the LEDGER |

CI: `.github/workflows/oxlint.yml`, wired into `preDeploy.yml` and deliberately absent from
`confirmPassingBuild`'s `needs`. The lint step carries `continue-on-error: true`. On a push to
`main` it auto-commits its own tightened baseline, as `lint.yml` does for ESLint.

### 2.1 Every oxlint script, rerun 2026-09-14

All thirteen `package.json` scripts that touch oxlint, run one at a time. Exit codes are the actual
process exits, not a reading of the output.

| script | exit | result |
| --- | --- | --- |
| `lint -- --linter=oxlint` | **0** | the required gate: nothing above baseline |
| `lint-oxlint` | **1** | raw `oxlint .`, no pipeline and no seatbelt, so it prints the whole baseline (~4300 lines). Exit 1 is the designed behaviour of this script, not a regression |
| `compare-oxlint` (`--fresh`) | **0** | 9234 tracked lintable files. Config coverage eslint=482, oxlint=487, shared=475. No unexplained ESLint-only rules. One rule with equal totals hiding a real disagreement (`react-hooks/refs`, section 5.3) |
| `compare-oxlint-warm` | **0** | timing benchmark, not a correctness gate. Warm ESLint 543s vs oxlint 86s, **6.31x** (section 3.1) |
| `oxlint-config-drift` | **0** | 45 files, 28 rules differ, **0 open**. No unlisted drift |
| `oxlint-jsx-uses-port` | **0** | `jsx-uses-react` and `jsx-uses-vars` produce the same observable outcome on both tools |
| `oxlint-locale-compare-port` | **0** | the type-free port matches the type-aware original on every shape in `src/` |
| `oxlint-react-compiler-gate` | **0** | the gate matches the ESLint side: silent where both compilers memoize, live where they do not |
| `oxlint-react-compiler-rust` | **0** | all assertions hold |
| `oxlint-rule-availability` | **0** | wrote `oxlint-migration/rule-availability.json` |
| `oxlint-rule-fixtures` | **0** | 306 entries: 302 identical, 1 pinned divergence, 3 blocked upstream |
| `oxlint-rule-inventory` | **0** | 494 rules, fixture coverage 306/494, 0 unproven. Wrote `rule-inventory.json` |
| `oxlint-rule-tester` | **0** | all 34 custom rules identical across 445 harvested cases |
| `oxlint-sidecar-coverage` | **0** | 192 / 192 covered |

Two things to know before rerunning these:

- **Do not run them concurrently.** `compareFullRepo.sh` truncates and rewrites `/tmp/oxlint-full.json`
  and `/tmp/eslint-full.json`, and `listAllRules.py` reads both. Running the two at once makes the
  inventory die on an opaque `JSONDecodeError` from a half-written file. Its `load_findings` guards
  with `os.path.exists` but not with "is this valid JSON", so a killed comparison leaves the same
  landmine behind. Observed here, then cleared by rerunning serially.
- **`compare-oxlint` reuses the `/tmp` reports unless you pass `--fresh`**, and says so on the first
  line. A run that looks instant is reading a cached report, possibly from a different commit.


---

## 3. Parity

### 3.1 Timings

Single cold run each, one developer machine, whole repo. Not a benchmark.

| leg | seconds |
| --- | --- |
| ESLint, type-aware, `ESLINT_CONCURRENCY=2`, 16 GB heap, no cache | **396.0** |
| Oxlint through the pipeline, sharded | **35 to 52** |

Roughly **9x**. Oxlint runs every JS plugin on one thread, so `--threads` does nothing for the 192
sidecar rules this repo enables (upstream oxc#26621); `OxlintLinter` fans the file list across
several `oxlint --threads=1` processes and merges the reports. Findings are identical either way.

The ESLint leg needs `NODE_OPTIONS=--max_old_space_size=16384` and capped concurrency or its workers
die with `ERR_WORKER_OUT_OF_MEMORY` even on a 48 GB machine. Oxlint needs neither.

**Warm cache, the shape CI actually sees** (`compareWarmCache.sh`, 10 dirty files vs `origin/main`,
reusing an already-primed cache snapshot, logs in `/tmp/oxlint-warm-compare`):

| leg | seconds |
| --- | ---: |
| ESLint cold prime | 432 |
| ESLint warm run | 543 |
| Oxlint, `--type-aware --quiet`, no cache | 86 |

Warm ESLint / Oxlint = **6.31x**, cold = **5.02x**. Both legs here ran on a machine that was busy
with other work, so the absolute numbers are higher than the single-run figures in the table above
and only the ratio is worth quoting. Note the warm run came out *slower* than the cold prime: at
this repo size ESLint's cache is not buying what CI assumes it buys, which is worth a look before
anyone cites cache warmth as a reason the ESLint leg is affordable.

### 3.2 Config coverage

Union of enabled rules over **every tracked lintable file**, 9187 of them, both sides.

```
eslint=482   oxlint=487   shared=475
ESLint-only with a port plan: 7
ESLint-only unexplained:      0
Oxlint-only extras:           12
```

Union taken over all 9201 tracked lintable files, both sides.

The 7 ESLint-only rules all report zero findings today and none has a seatbelt row, so dropping them
costs no current signal. Plans live in `oxlint-migration/ruleMap.py` `PORT_PLAN`.

| rule | plan | proven | real loss |
| --- | --- | --- | --- |
| `progress/activate` | drop, Oxlint prints its own progress | no | none |
| `react-hooks/component-hook-factories` | nothing to port, upstream ships a stub whose `create()` returns `{}` | yes | none |
| `react-hooks/config` | handled more strictly, a Config diagnostic throws in `config/oxlint/reactCompilerRust.mjs` | yes | none |
| `react-hooks/gating` | dropped, only fires with a `dynamicGating` source, which production does not supply | no | none |
| `no-invalid-this` | decided skip, hosting it gives 51 JS-plugin errors and 0 findings; TS/TSX covered by `noImplicitThis` | yes | ~none, 19 non-ignored JS files contain a `this` token |
| `rulesdir/prefer-at` | superseded in part by `unicorn/prefer-at` at default options | yes | **partial**, loses plain `arr[0]` / `arr[i]` |
| `rulesdir/boolean-conditional-rendering` | **blocked**, needs the type of the `&&` left operand | no | **yes**, waits on typed `jsPlugins` |

`rulesdir/boolean-conditional-rendering` is the only genuine coverage loss. It sits at zero findings
because it is enforced today, so the cost is deferred: future `{count && <X/>}` regressions go
uncaught. No tracking issue exists.

The 12 Oxlint-only extras are upside, not risk: `@typescript-eslint/no-floating-promises`,
`no-require-imports`, `only-throw-error`, `prefer-promise-reject-errors`, `require-await`,
`arrow-body-style`, `jsdoc/check-tag-names`, `jsdoc/require-param`, `jsdoc/require-param-type`,
`no-unexpected-multiline`, `prefer-regex-literals`, `unicorn/prefer-at`.

### 3.3 Findings per rule, whole repo

ESLint 3083, Oxlint 4295. Both legs run through `scripts/lint/index.ts --format=json` with
`SEATBELT_DISABLE=1`, so both pass the same processors. A typescript-eslint extension rule is
counted under the base rule oxlint runs, or one rule lands in two rows.

| rule | eslint | oxlint | delta | reading |
| --- | ---: | ---: | ---: | --- |
| `@typescript-eslint/no-unsafe-type-assertion` | 1967 | 1969 | +2 | noise |
| `@typescript-eslint/no-unnecessary-type-assertion` | 0 | 754 | +754 | both enable it; TS 6.0.2 vs tsgo TS7 inference diverge |
| `no-restricted-syntax` | 327 | 327 | 0 | parity |
| `@typescript-eslint/no-deprecated` | 231 | 399 | **+168** | **unexplained**, section 5.1 |
| `react-hooks/refs` | 215 | 215 | 0 | equal totals, 3 locations differ each way, section 5.3 |
| `import/no-cycle` | 0 | 268 | +268 | both enable it; ESLint's copy is silently inert |
| `react-hooks/set-state-in-effect` | 127 | 47 | **-80** | **unexplained**, section 5.2 |
| `no-restricted-imports` | 97 | 97 | 0 | parity, includes the ported OnyxUtils ban |
| `rulesdir/no-raw-typography` | 44 | 44 | 0 | parity |
| `rulesdir/no-onyx-connect` | 42 | 42 | 0 | parity |
| `react-hooks/preserve-manual-memoization` | 2 | 65 | +63 | `eslintSuppressionRules`, section 5.2 |
| `rulesdir/no-default-id-values` | 21 | 21 | 0 | parity |
| `react-hooks/immutability` | 6 | 7 | +1 | unexplained |
| `import/no-named-as-default` | 0 | 13 | +13 | shared config, Oxlint finds more |
| `react-hooks/static-components` | 2 | 2 | 0 | parity |
| `react-hooks/exhaustive-deps` | 1 | 1 | 0 | parity |
| `no-unsafe-optional-chaining` | 0 | 3 | +3 | Oxlint-only finding |
| `@typescript-eslint/no-unsafe-return` | 0 | 3 | +3 | Oxlint-only finding |
| `@typescript-eslint/no-misused-promises` | 0 | 3 | +3 | Oxlint-only finding |
| `import/no-duplicates` | 0 | 3 | +3 | Oxlint-only finding |
| `no-empty-function` | 0 | 2 | +2 | Oxlint-only finding |
| `@typescript-eslint/no-unsafe-member-access` | 0 | 2 | +2 | Oxlint-only finding |
| `unicorn/prefer-at` | 0 | 2 | +2 | Oxlint-only, expected |
| `react/no-unstable-nested-components` | 0 | 1 | +1 | Oxlint-only finding |
| `react/button-has-type` | 0 | 1 | +1 | Oxlint-only finding |
| `no-redeclare` | 0 | 1 | +1 | Oxlint-only finding |
| `import/export` | 0 | 1 | +1 | Oxlint-only finding |
| `react/jsx-key` | 0 | 1 | +1 | Oxlint-only finding |
| `@typescript-eslint/no-unsafe-assignment` | 0 | 1 | +1 | Oxlint-only finding |
| `rulesdir/prefer-at` | 1 | 0 | -1 | superseded, see the port plan above |
| **totals** | **3083** | **4295** | **+1212** | |

Every rule not listed reports 0 on both tools. The +1212 decomposes exactly: **+1022** from
`no-unnecessary-type-assertion` and `import/no-cycle`, two rules ESLint enables but cannot report
on; **+168** `no-deprecated`; **-16 net** across `react-hooks/*`; **+39** scattered singles, each an
Oxlint finding ESLint's copy of the same rule missed.

### 3.4 Seatbelt baselines

One file per linter, because the seatbelt tightens itself and a shared file would ping-pong between
the two tools' counts on every CI run.

| baseline | rows | grandfathered errors |
| --- | ---: | ---: |
| `config/eslint/eslint.seatbelt.tsv` | 1398 | 3092 |
| `config/oxlint/oxlint.seatbelt.tsv` | 1849 | 4295 |

The Oxlint baseline matches its live finding count exactly.

### 3.5 Config drift

`checkConfigDrift.py` probes 45 files and compares rule *settings*, not just presence, so it catches
what the enabled-rule union cannot: the same rule on both sides with different options, or on in one
scope and off in another.

```
45 files, 28 rules differ
  7 spelled differently, same behavior
 21 accepted differences
  0 open differences, nobody chose these
```

**The 11 open differences are closed as of 2026-09-15**, two by porting and nine by writing down a
measured reason. Working through them changed the picture rather than confirming it, so the
reasoning is worth keeping.

**Ported, 2 rules.** Both were real gaps and both cost nothing to close: neither added a single
finding, because the codebase already complies.

- `no-restricted-globals`: `.oxlintrc.json` now carries ESLint's `.github/actions/**/*.ts` and
  `.github/libs/**/*.ts` block banning `module`, `__dirname` and `__filename`. Like ESLint, the
  override replaces the root airbnb browser list for that scope rather than merging with it, which
  is what ESLint actually resolves.
- `react-hooks/rules-of-hooks`: `react/rules-of-hooks` is now `off` for the storybook glob list,
  mirroring what the preset does on the ESLint side.

**Not a difference at all, 2 rules.** `prefer-const` and `prefer-promise-reject-errors` were listed
as "oxlint is the more lenient of the two". They are not: `eslint-config-expensify` authors the
identical options, at `configs/private/es6.js:93-96` and `configs/private/best-practices.js:365`, and
`eslint --print-config` confirms that is what resolves. The false reading comes from
`resolveConfigs.mjs`, which reads each flat block's literal `rules` and never expands an `extends:`
key or a legacy preset object, so preset-authored options read as absent. **Anything authored in a
preset is invisible to this check** -- worth remembering, since catching an
`eslint-config-expensify` bump is the whole point of the script. Acting on the original reading would
have made oxlint stricter than ESLint and added 10 findings ESLint reports none of.

**Deliberate and necessary, 1 rule.** `no-redeclare`: ESLint turns the core rule off and runs
`@typescript-eslint/no-redeclare`, which ignores TypeScript declaration merging. Oxlint has no
`typescript/no-redeclare` at all, so it runs the core rule with `builtinGlobals: false` -- the only
lever that stops it firing on TS global augmentation. Restoring the default adds exactly 2 findings,
`src/types/global.d.ts:69` and `src/types/expo.d.ts:2`, both global augmentation that ESLint reports
none of.

**Load-bearing, not unexplained, 6 rules.** The `scripts/**` and `.github/**` override that turns off
the five `@typescript-eslint/no-unsafe-*` rules plus `no-throw-literal` was described as carrying no
comment in a file whose convention is that every "off" says why. The reason turned out to be
substantial: **deleting it adds 695 findings that ESLint reports 0 of.** Oxlint's tsgolint port of
that family is simply stricter than typescript-eslint's, and this is not a type-info problem -- on
the same file with the same program, `typescript/no-unsafe-type-assertion` agrees exactly (1 = 1 on
`.github/actions/javascript/proposalPoliceComment/proposalPoliceComment.ts`, 8 = 8 on
`src/libs/memoize/index.ts`) while `no-unsafe-return` is 3 against 0 on that same memoize file. The
divergence is global; the override only makes it visible, because that is where the loosely-typed
GitHub Actions glue lives. ESLint's seatbelt carries 0 entries for all six rules repo-wide.

---

## 4. Rule evidence

Two populations, very different confidence.

**Sidecar rules, 192 of 192 covered.** Everything this repo hosts itself: core rules routed through
Oxlint's JS plugin runtime, the `hosted/` plugin, the `rulesdir/` ports, the hand-hosted set. Each
has a fixture, a replayed upstream RuleTester case, or a probe.

```
core/              10/10 covered
hosted/            40/40 covered
rulesdir/          36/36 covered
hand-hosted        86/86 covered
```

**Native Rust rules, 294.** `listAllRules.py` gives the split:

```
Totals: 494 rules -- eslint-only=7, oxlint-only=12, shared=475
Oxlint side: js:@dword-design/import-alias=1, js:core=10, js:hosted=40, js:lodash=1, js:rc=12,
             js:react-native-a11y=13, js:report-name-utils=1, js:rulesdir=36, js:testing-library=8,
             js:you-dont-need-lodash-underscore=71, native=294
Fixture coverage: 306/494 rules have an example file
```

The fixture campaign closed most of this. `compareFixtures.py` now carries 306 entries:

```
302 rules behave identically on both tools.
1 pinned intentional divergence: react/no-did-update-set-state
3 blocked upstream, oxlint silent by known cause
```

Batches, each red-green verified by emptying its fixtures and confirming every row flips to FAIL:
`ydnlBatch` 70, `tsBatch` 54 (type-aware), `reactNativeRulesBatch` 32, `jsx11yBatch` 31, `oxonly` 12,
`a11yNpmBatch` 12, `importNativeBatch` 12, `storybookBatch` 12, `tlBatch` 8, `unicornNativeBatch` 6,
`typedSample` 1, plus the 56-rule base manifest.

What remains uncovered is **Tier B: 128 core rules that fire nowhere in this repo**. That is a
deliberate stop, not a gap left by running out of time -- see section 4.1.

### 4.1 Tier B is deliberately not covered

128 enabled core rules (unprefixed, no plugin) produce zero findings across the whole repo and have
no fixture. Writing one fixture each was planned and then dropped. The reasoning, so nobody spends a
session re-deriving it:

**The failure mode fixtures exist to catch no longer applies to these rules.** The harness was built
because "oxlint silently accepts unknown rules inside `overrides`". Measured against 1.83.0 with a
bogus rule name, at root and inside an override:

```
$ npx oxlint -c unk.probe.json --no-ignore /tmp/probe.ts
Failed to parse oxlint configuration file.
  x Rule 'no-such-rule-at-all' not found in plugin 'eslint'
```

It fails loud both ways. A typo'd, renamed or dropped core rule cannot hide. The sibling trap -- a
native rule accepted but silent because its plugin is not in `plugins` -- does not apply either:
core rules have no plugin to enable, and 116 of the 128 are declared only at the config root.

**Option and severity drift is a different gate.** `checkConfigDrift.py` compares rule *settings*
across 45 probed files and already covers these rules; `prefer-const` and `prefer-promise-reject-errors`
are both Tier B rules and both appear in its output (section 3.5).

**What a fixture would still add is narrow.** Only implementation divergence between two ports of
the same rule, on code shapes that appear nowhere in this repo -- zero repo-wide findings is the
definition of Tier B. Of the 128, 53 are in `eslint:recommended` and 75 are style. Oxlint ports core
rules from ESLint's own test suite, and these are the simplest rules in either linter.

**If this is ever revisited, do not do all 128.** The rules where a silent divergence would actually
cost something are the option-heavy and regex/scope-sensitive ones: `no-unused-vars` above all, then
`no-undef`, `no-fallthrough`, `no-constant-condition`, `no-useless-escape`, `no-self-assign`,
`no-prototype-builtins`, and the four regex rules. One shard, roughly twelve rules.

Note for anyone regenerating the list: the script in the original gap plan reports **132**. It
filters on "has repo violations" but not "already has a fixture", so it double-counts
`arrow-body-style`, `no-unexpected-multiline`, `one-var` and `prefer-regex-literals`. The real
number is 128.

---

## 5. Open questions

### 5.1 `@typescript-eslint/no-deprecated`, 231 vs 399 -- explained

Resolved 2026-09-15. Every finding on both sides is accounted for, and the previous note that "168
real extra detections nobody has explained" was both wrong in kind and slightly wrong in count.

Matching on `(file, line, column)` over the two full-repo reports:

| | count |
| --- | ---: |
| shared | 225 |
| oxlint-only | **174** |
| ESLint-only | **6** |

**All 174 oxlint-only findings are write sites.** 164 are explicit object-literal properties
(`originalMessage: {...}`) and the other 10 are shorthand properties (`originalMessage,`,
`{videoAttributeCache}`) that a naive read/write classifier misreads as reads. 172 of the 174 are the
single deprecated property `originalMessage`; the rest are `prompt_cache_retention` and
`videoAttributeCache`, one each. This is exactly the tsgolint write-site strictness already recorded
in the `checkConfigDrift.py` LEDGER (typescript-eslint#10643): tsgolint reports assignments to a
deprecated property, typescript-eslint does not, and no option separates reads from writes. Nothing
unexplained remains here.

**All 6 ESLint-only findings are read sites that the write-site override silences.** Each is a call
to the deprecated `getReportTransactions` (`src/libs/ReportUtils.ts:1292-1296`), in
`src/libs/actions/IOU/{DeleteMoneyRequest,RejectMoneyRequest,TrackExpense,UpdateMoneyRequest}.ts` and
`src/libs/actions/Transaction.ts`. All five files are inside the 91-file override where
`.oxlintrc.json` sets `typescript/no-deprecated` to `off`. So oxlint is not missing them by
implementation: the override that holds back the write-site flood takes the legitimate read-site
findings with it.

That is the measurable cost of the workaround, and it is small: **6 lost read-site findings across
91 files.** If tsgolint ever gains a read/write option, the override can shrink and those 6 come
back. Until then this is a priced trade, not an open question.

### 5.2 `react-hooks/set-state-in-effect`, 127 vs 47 -- an upstream detection gap

Investigated 2026-09-15. The cause is not in this repo, and there is a minimal reproducer:
`oxlint-migration/setStateInEffectRepro.tsx`.

The 47 are a strict subset of the 127: the split is **47 shared, 80 ESLint-only, 0 oxlint-only**.
Grouped by file it is all-or-nothing, which is what pointed at the cause:

| | files |
| --- | ---: |
| oxlint catches every finding in the file | 32 |
| oxlint catches none of them | 67 |
| oxlint catches some but not all | **0** |

Ruled out, each by measurement rather than reading:

- **Not `ReactCompilerFilter`.** `RULES_SUPPRESSED_BY_REACT_COMPILER` holds only two rules and this
  is not one of them, on either side.
- **Not the documented `panicThreshold: 'all_errors'` truncation**
  (`config/oxlint/reactCompilerRust.mjs:138-143`). Truncation would leave partial files and
  other-rule diagnostics behind. Instrumenting `analyze()` over all 99 files: every one of the 67
  returns `result.fatal === false` with `result.errors.length === 0`, and produces no diagnostic of
  any rule name. The compiler compiles them and surfaces nothing.
- **Not the parse-failure early return** at `reactCompilerRust.mjs:178`. None of the 67 reaches it.
- **Not rule-name mapping, setter provenance, or control-flow shape.** Both sets are majority local
  `useState` setters, and both contain guarded, unguarded and early-return forms in similar
  proportions.

`result.fatal` splits the two groups perfectly, 32 true against 67 false, but that is a restatement
rather than a cause: under `all_errors` every diagnostic is fatal, so `fatal` is a consequence of
having found one.

**The reproducer is a nine-line component**: `useState`, a `useEffect` whose body is a single
`setValue(1)`, nothing else. `eslint-plugin-react-hooks` reports it. `oxc-transform-react` returns
`[]`. So the gap reaches the most basic shape the rule exists for, which makes this worth filing
upstream.

It is not family-wide, which is why it needs filing as this one rule rather than as the bridge being
broken. Whole-family counts, ESLint against oxlint: `refs` 215 = 215, `static-components` 2 = 2,
`exhaustive-deps` 1 = 1, `immutability` 6 vs 7, `preserve-manual-memoization` 2 vs 65 -- that last
one runs the other way and still has the `eslintSuppressionRules` explanation recorded below.

**Still open:** what distinguishes the 32 files the Rust port does detect. No syntactic discriminator
separates them, and adding a deliberate compiler bail to the reproducer did not make the finding
appear. Answering it is not needed to file the bug, only to predict the blast radius.

`preserve-manual-memoization` 2 vs 65 in the same family is understood: ESLint's compiler skips
functions carrying an `exhaustive-deps` disable comment, Oxlint's does not, and both production
builds already set `eslintSuppressionRules` to `[]`, so Oxlint matches what ships. Whether that
reasoning holds finding-by-finding has not been checked. `immutability` 6 vs 7 is unexamined.

### 5.3 `react-hooks/refs`, equal totals hiding a disagreement

215 on both, 3 locations each way:

```
eslint only: __mocks__/react-native-safe-area-context.tsx:38
eslint only: __mocks__/react-native-safe-area-context.tsx:39
eslint only: src/components/FlatList/FlatList/index.tsx:70
oxlint only: src/components/EmojiPicker/EmojiPickerMenu/index.native.tsx:117
oxlint only: src/components/EmojiPicker/EmojiPickerMenu/index.native.tsx:130
oxlint only: src/components/EmojiPicker/EmojiPickerMenu/index.tsx:176
```

### 5.4 A dead oxlint shard fails the whole run, with no retry

Narrow robustness gap, not a correctness bug. An earlier draft of this section called it a bug and
blamed an incident on it; both claims were wrong and are corrected below.

**The behaviour, demonstrated by calling the exported functions directly:**

```
dead shard            {"files":[],"exitCode":137,"stderr":"Failed to parse Oxlint JSON output."}
merge(healthy, dead)  {"files":[],"exitCode":137,"stderr":"Failed to parse Oxlint JSON output."}
cores 14, freemem 5.2 GB  ->  2 shards
```

A shard whose process dies writes no stdout, `parseOxlintStdout` sees no `{` and returns fatal
(`OxlintLinter.ts:153-159, 172-173`), and `mergeShardResults` (`OxlintLinter.ts:82-86`) returns that
shard, dropping every other shard's findings.

**That last part is deliberate and has a test**, `tests/tooling/lintPipeline.test.ts:348`, "a crashed
JS plugin in one shard is fatal and dominates clean shards". It is also the right call: a shard that
died tells you nothing about what it would have found, and reporting the survivors as a complete run
would let the seatbelt auto-tighten against a partial result and freeze a false baseline. Failing
loudly is the safe behaviour, not a defect.

**It is not silent either.** `LintPipeline.ts:37` surfaces a fatal linter's stderr as the report, so
`Failed to parse Oxlint JSON output.` does reach the caller.

**What is actually left:** a shard killed by the OS under memory pressure is indistinguishable from a
shard whose JS plugin threw, so a transient OOM fails the entire lint run and nothing retries. Shard
count is re-derived per invocation from `os.freemem()` (`OxlintLinter.ts:56-59`) against
`SHARD_MEM_BUDGET_GB = 2`, so it varies with whatever else is running: 6 shards in one measurement
that day, 2 in another. A retry-once on a fatal shard would close it.

**The incident that prompted this section was probably not this code path.** The observed message was
`ESLint output (JSON parse failed: EOF while parsing a value at line 1 column 0)`. Oxlint's fatal
path prints `Failed to parse Oxlint JSON output.` and ESLint's prints `Failed to parse ESLint JSON
output.`; neither matches. That exact string is not in the working tree, not in `node_modules`, and
not in any of the last 30 commits touching `scripts/lint/`. The likeliest explanation, and the one
that also explains uncommitted files in this worktree being reverted twice the same day, is that
another session had in-progress edits under `scripts/lint/` at that moment which have since been
replaced.

**Not currently reproducible: 13 consecutive clean runs since the merge.**

### 5.5 Port findings surfaced by the fixture campaign

Each was measured while building a batch. None is a harness artifact; all are pinned in the
manifests so they trip if either side changes.

**`typescript/no-duplicate-type-constituents` misses structural duplicates.** Oxlint reports
`string & string` and `string | string` and honours `ignoreUnions`, but stays silent on
`{a: string} & {a: string}`. ESLint asks the type checker and catches it. Production enables the
rule, so this is a live hole, not a fixture artifact. The row is pinned with `oxlintLines` and flips
the day oxlint compares structurally.

**`react/jsx-filename-extension` can never fire.** Production allows `.js/.jsx/.tsx` and turns the
rule off for `.js/.jsx/.mjs/.cjs`, leaving `.ts/.mts/.cts` as the only live scopes -- and JSX does
not parse in any of them. Both tools return a parse error rather than a finding on a `.mts` or `.ts`
holding JSX. Dead config. It has no fixture row because no violation can exist; fix the config
instead.

**`react/no-did-update-set-state` is oxlint-only, and ESLint is the one that is off.**
`makeNoMethodSetStateRule`'s `shouldBeNoop` disables the rule for `componentDidUpdate` once the
detected React version is at or above 16.3
(`node_modules/eslint-plugin-react/lib/util/makeNoMethodSetStateRule.js:41`), and this repo is on
React 19. Oxlint's port has no version gate. Pinned as `oxlintOnly`, with the sibling
`no-will-update-set-state` -- no noop entry, fires on both -- as the control.

**Oxlint configures `react/rules-of-hooks` but reports `react-hooks/rules-of-hooks`.** Config id and
diagnostic id differ for the same rule. This is the rule-rename class that has already caused one
incident, and it is why a golden snapshot of `ruleNames.mjs` is worth having.

**An unknown plugin name in an override's `plugins` array fails partially and silently.** With
`plugins: ["react", "react-hooks"]` -- `react-hooks` is not an oxlint plugin -- thirteen `react/*`
rules behaved normally while `react/rules-of-hooks` reported nothing. Nastier than the documented
`plugins` trap because the shard looks healthy.

**Four anchor-convention differences.** Same violation, same count, different reported line:
`typescript/adjacent-overload-signatures` (ESLint on the out-of-order signature, oxlint on the first
of the group), `typescript/no-duplicate-enum-values` (duplicate member vs first member with that
value), `typescript/no-unsafe-declaration-merging` (ESLint reports interface *and* class, oxlint only
the interface), `react/no-redundant-should-component-update`. These matter beyond cosmetics: a
`disable-next-line` placed for one tool's anchor does not suppress the other's. Worth auditing
existing suppressions before the cutover.

**typescript-eslint v8 defaults are far more permissive than the fixtures assumed.**
`restrict-template-expressions` and `restrict-plus-operands` now allow nullish, boolean, any and
number by default, so only an object (or `never`) still reports. `no-unsafe-unary-minus` does not
fire on `any` at all, since `any` is assignable to `number`; a string enum member is the only shape
that negates a non-number without tsc catching it first. Both tools agree on all of this -- the
point is that these rules are much weaker than their names suggest.

**React 19 deleted the APIs four react rules police.** `isMounted`, `findDOMNode`, `ReactDOM.render`
and `React.createClass` are gone from the types, so `no-is-mounted`, `no-find-dom-node`,
`no-render-return-value` and `prefer-es6-class` cannot have type-checking fixtures. They live in
`fixtures/reactNativeRulesC.jsx`, which `fixtures/tsconfig.json` excludes.


---

## 6. TODO

Ordered by what blocks what.

1. **Land the shadow job on `main` and watch it.** It has never executed there. Auto-tightening of
   `oxlint.seatbelt.tsv` and the push race against `lint.yml` are both unobserved. Analysis says the
   race is benign (separate runners, separate checkouts, different files, loser rejected
   non-fast-forward and swallowed by `continue-on-error`, so one tightening is delayed by one merge
   rather than lost), which is the documented behaviour of the existing ESLint job. Unproven in
   practice.
2. ~~**Evidence for the 294 native rules.**~~ Done to the point of diminishing returns.
   `compareFixtures.py` carries 306 entries, all green. The 128 remaining core rules are a
   deliberate stop with the reasoning written down (section 4.1), not outstanding work.
3. ~~**Drive the 11 open config differences to zero**~~ Done 2026-09-15, section 3.5. Two ported,
   nine documented with measurements. Note for whoever reads that section: two of the eleven were
   not differences, and acting on the original reading of them would have made oxlint stricter than
   ESLint.
4. ~~**Explain `set-state-in-effect` 127 vs 47**~~ Done 2026-09-15, section 5.2. It is an upstream
   detection gap in `oxc-transform-react`, with a nine-line reproducer at
   `oxlint-migration/setStateInEffectRepro.tsx`. **File it upstream** -- that is the remaining
   action, and it is the one item here that would ship a coverage regression if the flip happened
   first.
5. ~~**Explain `no-deprecated` 231 vs 399**~~ Done 2026-09-15, section 5.1. All 174 oxlint-only
   findings are write sites, the already-documented tsgolint strictness. All 6 ESLint-only findings
   are read sites the write-site override silences, which prices that workaround at 6 lost findings
   across 91 files.
6. **`rulesdir/boolean-conditional-rendering`** has no replacement and no tracking issue.
7. **Fix `react/jsx-filename-extension`** (section 5.5). As configured it can never produce a
   finding on any file in this repo. Either widen the disabled-extension override or drop the rule;
   leaving it is a rule everyone believes is running.
8. **Own the `typescript/no-duplicate-type-constituents` structural gap** (section 5.5). Oxlint
   misses duplicate object-literal constituents that ESLint catches, and the rule is enabled in
   production. Either accept it in the LEDGER or file it upstream.
9. **Audit existing suppressions against the four anchor differences** (section 5.5). A
   `disable-next-line` written for ESLint's anchor line does not suppress oxlint's, and vice versa.
   Cheap to check, and it fails closed only in one direction.
10. **Golden snapshot for `config/oxlint/ruleNames.mjs`** -- highest-value of the untested pipeline
    seams. The rule-rename class has bitten twice now: once before, and again with
    `react/rules-of-hooks` reporting as `react-hooks/rules-of-hooks` (section 5.5).
11. **Every merge from `main` needs a manual `SEATBELT_INCREASE=all` pass.** The seatbelt auto-tightens
   but never auto-increases.
12. **Retry a dead oxlint shard once** (section 5.4). Today a transient OOM fails the whole lint run.
   Low priority while the job is non-blocking, worth having before it becomes required.

---

## 7. Migration plan

Each phase is independently revertible and none removes a safety net before its replacement is
proven.

### Phase 1: land the shadow job (ready now)

Merge `feat/oxlint`. Oxlint runs on every PR and every push to `main`, non-blocking, keeping its own
baseline.

- Exit criteria: one week on `main` with `oxlint.seatbelt.tsv` auto-tightening cleanly and no
  observed interference with `lint.yml`'s auto-commit.
- Revert: delete the `oxlint` job from `preDeploy.yml`. Nothing else depends on it.

### Phase 2: close the evidence gap (the long pole, runs alongside Phase 1)

TODO items 2 through 5, plus 8 and 9.

- Exit criteria: every rule with a nonzero finding count has repo-local evidence,
  `npm run oxlint-config-drift` reports 0 open differences, and `compareFullRepo.sh` prints no
  unexplained difference.

### Phase 3: flip Oxlint to blocking, keep ESLint

- Remove `continue-on-error` from the lint step in `oxlint.yml`.
- Add `oxlint` to `confirmPassingBuild`'s `needs` in `preDeploy.yml`.
- Leave the ESLint job running and blocking. Both gates active.
- Exit criteria: one week with no Oxlint-only CI failure ESLint would not also have caught.
- Revert: put `continue-on-error` back. One line.

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

Step 3 is the point of no return: after it, expected finding counts can no longer be regenerated.
Everything in Phase 2 must be finished before it.

---

## 8. Reproducing every number here

```bash
npm run lint -- --linter=oxlint                                  # sections 2, 3.1
npm run typecheck                                                # section 2
npm run test:bun                                                 # section 2
bash oxlint-migration/compareFullRepo.sh --fresh                 # sections 3.1, 3.2, 3.3, 5.3
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
