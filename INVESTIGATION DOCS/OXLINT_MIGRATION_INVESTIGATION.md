# Replacing ESLint with Oxlint: current state

**Branch**: `feat/oxlint` · **Oxlint** 1.82.0 · **oxlint-tsgolint** 7.0.2001 · **oxc-transform-react** 0.149.0 · **ESLint** 9.36.0
**Last full measurement**: 2026-09-10, after merging `origin/main` (810 commits)
**Related issues**: [callstack-internal#2807](https://github.com/callstack-internal/expensify-issues/issues/2807) (this task) · [callstack-internal#1506](https://github.com/callstack-internal/expensify-issues/issues/1506) (earlier linting research) · [Expensify/App#95240](https://github.com/Expensify/App/issues/95240) (Prettier to Oxfmt, the same move, it worked)

This is a state document, not a log. Every number here was measured on the current branch. Resolved
problems are kept as one-line entries in [What is already resolved](#what-is-already-resolved) so the
history is recoverable without carrying the investigation prose.

Companion documents in this directory: [OXLINT_PROPOSAL.md](OXLINT_PROPOSAL.md),
[OXLINT_NO_CYCLE_ROAD_TO_ZERO.md](OXLINT_NO_CYCLE_ROAD_TO_ZERO.md),
[OXLINT_NO_CYCLE_FINDINGS.md](OXLINT_NO_CYCLE_FINDINGS.md),
[OXLINT_NO_CYCLE_ISSUE.md](OXLINT_NO_CYCLE_ISSUE.md). Earlier drafts referenced
`OXLINT_SIDE_BY_SIDE_PLAN.md`, `OXLINT_MIGRATION_STEPS.md`, `OXLINT_DIRECTIVE_WRAPPER_PLAN.md`,
`OXLINT_RUST_COMPILER_RESIDUALS.md` and `OXLINT_RULE_TEST_SUITE_PLAN.md`. **None of those files exist in
this directory any more**; the parts of them that still matter have been folded into this document.

---

## Where this stands

**The linting is done, the adapter is written, and Oxlint runs in CI today as a non-blocking shadow
check with its own seatbelt baseline. What is left is the fixture deadline and the flip.**

| | |
| --- | --- |
| Rules ESLint enables that also run in Oxlint | **462 / 469** |
| ESLint-only rules, each with a written plan | **7**, none of them a surprise |
| ESLint-only rules with no plan | **0** |
| Rules Oxlint enables that ESLint does not | 13, all listed below |
| Findings ESLint misses that Oxlint catches | 1318 |
| Findings Oxlint misses that ESLint catches | **85**: 80 `set-state-in-effect` blocked on [oxc#26318](https://github.com/oxc-project/oxc/issues/26318), and 5 `no-deprecated` lost to our own over-broad override |
| Whole repo, cold | ESLint **418 s** · Oxlint **87 s** |
| Files linted | 9002, both tools |

The single most important change since the last revision of this document: **`OxlintLinter` exists and
the whole pipeline runs on it.** `bun scripts/lint/index.ts --linter=oxlint` produces the same
processed, seatbelt-ratcheted report the ESLint gate produces, against
`config/oxlint/oxlint.seatbelt.tsv` (1848 rows, 1409 files, 4403 errors, generated 2026-09-10).
`.github/workflows/oxlint.yml` runs it on every PR, non-blocking, and auto-tightens its baseline on
merge to `main` the same way `lint.yml` does for ESLint.

The change before that, which made it possible: **obstacle #1, the seatbelt
debt tracker, is no longer an Oxlint problem.** Expensify/App#99259 landed on `main` and rebuilt the
ratchet as `scripts/lint/processors/Seatbelt.ts`, a pipeline stage over the tool-agnostic
`LintMessage[]` that `scripts/lint/types.ts` defines. `scripts/lint/Linter.ts` is now an abstract port
whose own doc comment says implementations "may spawn a CLI, call a library, or return a fixture, the
pipeline only sees `LinterResult`". Nothing in the seatbelt, the React Compiler filter or the
`no-deprecated` stratification reads an ESLint type.

So the ~3096 grandfathered findings that used to be the reason ESLint could not be deleted are now
handled by a stage that takes Oxlint's output. Verified live: linting `src/libs/actions/Task.ts` with
`--linter=oxlint` demotes its `no-deprecated/deprecatedGetReportName` and its three
`no-unsafe-type-assertion` findings to warnings, which only happens if the rule ids were normalized to
ESLint's namespace and the paths resolved to absolute.

---

## What is left to do

Items 1 to 3 are done and item 4 is half done; they are kept here with their outcomes rather than
moved, because the outcomes are the useful part. **Item 5 is the only one with a clock on it** and
should start now, in parallel with watching the shadow job.

### 1. Write `OxlintLinter` · **done**, 2026-09-10

`scripts/lint/oxlint/OxlintLinter.ts`, wired behind `--linter=eslint|oxlint` in
`scripts/lint/index.ts` (default still `eslint`). Everything downstream came free, as predicted:
seatbelt, `ReactCompilerFilter`, `StratifyNoDeprecated`, `StylishFormatter`.

Four things the plan for this did not anticipate, all measured and all now handled. They are written
up in full in [OXLINT_LINTER_PLAN.md](OXLINT_LINTER_PLAN.md):

- **Rule ids had to be normalized inside the linter**, not in a processor, because
  `ReactCompilerFilter` is the first stage. The `norm_ox` mapping moved out of `ruleMap.py` into
  `config/oxlint/ruleNames.mjs`, which `hosted-rules.mjs` now builds itself from and `ruleMap.py`
  reads through a node subprocess. Python and JS verified to agree on all 43 sampled codes.
- **Oxlint paths are cwd-relative and the seatbelt only matches absolute ones.**
  `FileUtils.toRelativePath` returns an already-relative path unchanged, so a relative `filePath`
  misses every baseline row silently.
- **Oxlint's JSON omits every file with no diagnostic**, which breaks the seatbelt's ratchet-down and
  its dead-row prune. Fixed with a second `oxlint --debug=files` pass: 2.65 s against the 121 s lint.
- **Exit code 1 means three different things**, one of them a config that failed to parse with no JSON
  at all. Passed through as-is, a broken `.oxlintrc.json` would have reported a clean pass.

Two claims in the previous revision of this section were wrong and are corrected below in
[What is already resolved](#what-is-already-resolved).

### 2. `rulesdir/no-onyx-connect-bypass` · **closed**, not by doing it

The shadow rule was removed rather than switched on: `config/oxlint/onyxConnectBypass.mjs` and its
probe are gone, because the mechanism became redundant on `main`. `scripts/checkOnyxConnectBypass.ts`
still runs as a post-lint step (`scripts/lint/index.ts`) and works under either linter, so there is
nothing linter-specific left here.

### 3. Three policy decisions · **resolved**: baseline everything

All three, plus two the table missed, are baselined in `config/oxlint/oxlint.seatbelt.tsv` rather than
switched off. Deltas against the ESLint baseline:

| rule | eslint | oxlint | decision |
| --- | ---: | ---: | --- |
| `@typescript-eslint/no-unnecessary-type-assertion` | 0 | 740 | baselined; structural TS 6 vs TS 7 difference, will not close by waiting |
| `import/no-cycle` | 0 | 390 | baselined; actively being fixed, so the ratchet tightens as fixes land |
| `@typescript-eslint/no-deprecated` | 235 | 401 | baselined; the extras are writes to deprecated properties, which is the stricter and wanted behavior |
| `react-hooks/preserve-manual-memoization` | 13 | 62 | baselined. **Not in the original table.** See below |
| `react-hooks/set-state-in-effect` | 125 | 47 | no action needed; a decrease auto-tightens on the next merge to `main` |

Total 4403 against ESLint's 3096. Eight rules are at exact parity.

The `preserve-manual-memoization` gap turned out not to be a port bug, and the diagnosis is worth
keeping. `config/oxlint/reactCompilerRust.mjs` sets `eslintSuppressionRules: []` deliberately, so
Oxlint analyzes the functions eslint-plugin-react-hooks skips because they carry an
`eslint-disable-next-line react-hooks/exhaustive-deps` comment. Flipping that one option back to the
compiler's default over `src/hooks` + `TimePicker` + `AboutPage` drops the `rc/*` findings from 51 to
14, and `preserve-manual-memoization` specifically from 29 to 0. 20 of the 29 distinct sites sit under
such a comment.

Oxlint is the safer setting, and not as a judgement call: **both builds already ignore those comments**
(`config/rsbuild/rsbuild.common.ts:64` sets the empty list explicitly; babel-plugin-react-compiler
auto-disables its default whenever exhaustive-memo and hooks-usage validation are both on, which is
its own default). So the comment changes what ESLint reports and nothing about what ships. Checked on
`src/hooks/usePaymentOptions.ts` with `config/reactCompiler/checkBoth.mjs`: `babel memoized=false`,
`oxc memoized=false`. Delete only the disable comment and ESLint itself reports the same missing
`lastPaymentMethod` dependency, under `react-hooks/exhaustive-deps`.

One measurement to price in before reading the count: the rule produces 62 findings at 29 distinct
locations. Do not dedupe it. Repo-wide duplication is 2% (78 of 4403) and concentrated in
`rc(refs)` at 213/171, where 213 is exactly ESLint's number.

### 4. CI and tooling swap · **half done**

Shipped: `.github/workflows/oxlint.yml`, a non-blocking shadow job wired into `preDeploy.yml` but
deliberately absent from `confirmPassingBuild`'s `needs`. `continue-on-error` on the lint step, so a
divergence never holds up a PR while ESLint is still the gate. No cache steps (Oxlint has none) and
`ubuntu-latest` rather than the 16vcpu box `lint.yml` needs, since Oxlint is one Rust process rather
than a TypeScript program per worker.

It keeps its own baseline. Two files rather than one because the seatbelt tightens itself: whichever
linter runs ratchets the file it is given down to that linter's counts, so a shared file would
ping-pong. `resolveSeatbeltOptions` takes the path as a third argument and `SEATBELT_TSV_BY_LINTER`
holds the two. Proven isolated: inflate a row in `oxlint.seatbelt.tsv` from 2 to 7, run
`npm run lint` with `CI=1` over the same subtree, and the row stays at 7 while
`eslint.seatbelt.tsv` is untouched; the Oxlint run then tightens it back to 2.

Left: make the job blocking, add it to `confirmPassingBuild`'s `needs`, remove the ESLint packages
from `package.json`, retire `eslint.seatbelt.tsv`, point editors at Oxlint's LSP.

Untested, and worth watching on the first few merges: `lint.yml` and `oxlint.yml` both auto-commit
their baseline to `main` on push, each with `continue-on-error` on the push step. They have never run
against each other.

Worth knowing about the editor experience: `main`'s pipeline already moved the ratchet and the React
Compiler filter out of `config/eslint/eslint.config.mjs`, so a bare `npx eslint` and the editor no
longer apply them. Its own LINTING.md says grandfathered rows may show as errors in the editor even
though `npm run lint` passes. That is 3096 findings across 1152 files, and it is a pre-existing
condition rather than something this migration causes.

### 5. Pin the fixture expectations while ESLint still exists · **the only remaining item with a deadline**

Of the 180 enabled jsPlugin rules, 88 (49%) have per-rule evidence: a fixture linted by both tools, a
replayed upstream `RuleTester` case, or a probe. The other 91 have plugin-level evidence only, one
fixture proving the plugin loads at all.

Across the whole config that is roughly **89 of 475 enabled rules**, because only one native Rust rule
has a fixture. The 293 native ports have none, and they are exactly the population an Oxlint version
bump breaks.

Finishing the 91 is cheaper than the number suggests: 70 are `you-dont-need-lodash-underscore` and
near-identical in shape, so one fixture file plus 70 manifest entries takes the jsPlugin scope from 49%
to 88%.

The deadline is real. Expected counts have to be pinned while ESLint still exists to generate them.
After the flip there is no oracle, and a fixture with a pinned count is the only thing left that
catches an upgrade breaking a rule. This has already happened once: the `oxc-transform-react` bump
described in [the React Compiler gap](#the-react-compiler-gap-oxc26318) silently zeroed 12 rules, and
the fixtures are what caught it.

One wording fix owed: `npm run oxlint-sidecar-coverage` prints "All 180 enabled sidecar rules are
covered", which overstates what it enforces. It only *requires* per-rule evidence from `core`, `hosted`
and `rulesdir`, and counts the rest as "listed, not required".

### 6. Upstream, not blocking · S

See [Open upstream bugs](#open-upstream-bugs). The one with real leverage is
[oxc#26318](https://github.com/oxc-project/oxc/issues/26318).

---

## Current parity, measured

Whole repository, `--type-aware`, ESLint's report passed through the production processors so both
sides mean the same thing. **ESLint 3085, Oxlint 4403.**

Only rules where the two differ:

| rule | ESLint | Oxlint | what the gap is |
| --- | ---: | ---: | --- |
| `@typescript-eslint/no-unnecessary-type-assertion` | 0 | 740 | decision 3, TypeScript 6 against TypeScript 7 |
| `@typescript-eslint/no-deprecated` | 235 | 401 | decision 3, write sites |
| `import/no-cycle` | 0 | 390 | decision 3, cleanup project |
| `react-hooks/set-state-in-effect` | **125** | **47** | **the only place Oxlint reports less.** [oxc#26318](https://github.com/oxc-project/oxc/issues/26318) |
| `react-hooks/preserve-manual-memoization` | 2 | 62 | deliberate, see below |
| `@typescript-eslint/no-unsafe-type-assertion` | 1978 | 1980 | +2 on the seatbelt's largest rule |
| `react-hooks/immutability` | 6 | 7 | engine disagreement between the JS and Rust React Compilers |
| `import/no-named-as-default` | 0 | 13 | all on `import Config from 'react-native-config'`, which ships both a named and a default `Config`. Exactly the shape the rule exists to catch, and `eslint-plugin-import` misses it |
| `unicorn/prefer-at` | 0 | 2 | newly enabled, see below |
| 11 more | 0 | 1 to 3 each | Oxlint-only handfuls |

Parity is checked three ways, not one: per-rule counts, the `(file, line)` set per rule, and Oxlint
diagnostics carrying no rule code. The third matters because it is how a crashed rule hides: it
reports nothing, so counts alone read as success.

`react-hooks/refs` is worth calling out as the interesting pass: **213 = 213**, with 3 locations
disagreeing each way. Those 6 are anchor divergences, the documented class where the Rust compiler's
diagnostic carries only the modification site while ESLint anchors on the escape site. One is pinned in
`oxlint-migration/native-vs-sidecar-probe/rhImmutabilityAnchor.tsx`.

### `unicorn/prefer-at`, enabled 2026-09-10

`rulesdir/prefer-at` cannot be ported: it needs `typeChecker.isArrayType` to tell arrays from records,
and a syntactic port fires on every `obj[key]` (measured: `checkAllIndexAccess: true` gives 413
findings in `src/`, of which ESLint confirms 0 of the sampled 104 as real array reads).

`unicorn/prefer-at` at **default options** is the type-free half. It is native in Oxlint, exists
upstream in `eslint-plugin-unicorn` (already a dependency), and reports 2:

```
src/components/PopoverMenu/index.tsx:485
src/libs/PersonalDetailsUtils.ts:430
```

Both are genuine `x[x.length - 1]` reads that ESLint's type-aware rule misses, because
`typeChecker.isArrayType` is false for `Address[] | undefined`. Recorded in `checkConfigDrift.py`'s
`LEDGER` as an intentional Oxlint-only rule. What stays uncovered without types is plain `arr[0]` and
`arr[i]`.

Measurement caveat worth repeating, because it cost time twice: **any probe config must carry the
production `ignorePatterns`.** Without them this rule reads 358 instead of 2, because it lints the ncc
bundles under `.github/actions/**/index.js` and the generated `SearchParser` files.

### The 13 rules Oxlint enables and ESLint does not

Informational, all with a `LEDGER` entry:

```
@typescript-eslint/no-floating-promises      jsdoc/check-tag-names
@typescript-eslint/no-require-imports        jsdoc/require-param
@typescript-eslint/only-throw-error          jsdoc/require-param-type
@typescript-eslint/prefer-promise-reject-errors   no-unexpected-multiline
@typescript-eslint/require-await             prefer-regex-literals
arrow-body-style                             report-name-utils/no-function-call-in-get-report-name
unicorn/prefer-at
```

---

## Rule coverage

`469 rules ESLint enables = 462 running in Oxlint + 7 ESLint-only`, nothing left over, and **zero
unexplained**. Every one of the 7 has a `PORT_PLAN` entry in `oxlint-migration/ruleMap.py` printed by
the coverage check:

| rule | verdict |
| --- | --- |
| `progress/activate` | drop. A progress bar, not a lint rule. Oxlint prints its own |
| `react-hooks/component-hook-factories` | cannot report on either tool. Upstream ships it as a stub whose `create()` returns `{}`, and ESLint lists it under `usedDeprecatedRules` |
| `react-hooks/config` | handled more strictly here. `eslint-config-expensify` enables it with no options, so ESLint's validator is never reached; `CONFIG_CATEGORY` in `config/oxlint/reactCompilerRust.mjs` throws instead, because a Config diagnostic means our own options are wrong |
| `react-hooks/gating` | cannot fire. `Gating` diagnostics need a `dynamicGating` source in the rule options, and production supplies none |
| `rulesdir/prefer-at` | superseded by `unicorn/prefer-at`, above |
| `no-invalid-this` | **decided: skip.** See below |
| `rulesdir/boolean-conditional-rendering` | **decided: skip.** See below |

### `no-invalid-this`: skipped

ESLint's implementation reaches `astUtils.hasJSDocThisTag`, which calls `sourceCode.getJSDocComment`,
which Oxlint's bridge answers with a bare `throw` at `node_modules/oxlint/dist/lint.js:5784`. Still
present in 1.82.0. Re-measured under the production `ignorePatterns`:

```
51 JS-plugin errors, 0 findings
  49  the getJSDocComment throw
   2  "Cannot read properties of undefined (reading 'parent')", the code-path analyzer on a
      declare-module .d.ts with no body
```

The crashes land on exactly the files where `this` matters: `src/libs/Heap.ts`, `MinHeap.ts`,
`MaxHeap.ts`, `Trie/TrieNode.ts`, `src/CONST/index.ts`, `scripts/lint/*`. A crashing rule is strictly
worse than an absent one, because it checks nothing and a count comparison cannot see it.

**Why skipping is safe.** ESLint reports 0 today, so nothing regresses. TS and TSX are already covered
by `noImplicitThis`, which `tsconfig.base.json:6` turns on via `"strict": true`, and that catches the
same bug class (a `this` with an implicit `any` type). The residual exposure is **46 non-ignored
`.js`/`.mjs`/`.cjs` files, 19 of which contain a `this` token**, and all of them are build tooling and
loaders rather than product code.

The one thing owed here is a tripwire that fails if Oxlint ever removes the throw, so the rule gets
picked up on a version bump instead of staying off forever.

### `rulesdir/boolean-conditional-rendering`: skipped

The rule is at `node_modules/eslint-config-expensify/eslint-plugin-expensify/boolean-conditional-rendering.js`,
enabled at `configs/public/typescript.js:280`. Lines 25 and 31 to 33 are the blocker:
`ESLintUtils.getParserServices(context)` then `typeChecker.getTypeAtLocation`. Confirmed live on
1.82.0 that this throws inside a jsPlugin even with `--type-aware`, because `--type-aware` feeds
Oxlint's Rust rules and not JS plugins.

**No native equivalent exists.** Checked the rule catalogue and probed each candidate: `react` has 64
rules and `react_perf` 4, neither has `jsx-no-leaked-render`, and `oxc/no-leaked-render` does not
exist.

**Two alternatives were measured and both rejected.**

- `eslint-plugin-react`'s own `jsx-no-leaked-render` is already in `node_modules`, is purely syntactic,
  and runs in Oxlint's jsPlugin runtime with zero plugin errors. It reports **925 findings in `src/`**,
  because with its default `validStrategies` it treats every un-coerced left operand as unsafe.
- `typescript/strict-boolean-expressions` **does exist** in Oxlint 1.82.0 and is type-aware, even
  though the rules page does not list it. It is the same bug class from the type checker, natively in
  Rust. But it fires on every boolean position (`if`, `?:`, `&&`, `||`, `!`) with no JSX-only option:
  **12452 findings in `src/`**, against our rule's 0. Worth knowing about as a separate, much larger
  conversation. It is not parity work.

A narrow type-free stand-in was designed and costed, then dropped. An AST census of `src/` (3314
tsx/jsx files, 1663 `X && <JSX>` sites) shows why it is not worth building:

```
 611  !x                      provably boolean
 129  === !== > >= < != in     provably boolean
 505  bare Identifier          needs a type
 315  nested &&                needs a type (a && b yields b's type)
  57  ||                       needs a type
  26  member                   needs a type
  15  CallExpression           needs a type
   1  ConditionalExpression    needs a type
   0  X.length / numeric literal / string literal
```

A rule scoped to the provably non-boolean shapes cannot be wrong, and would cost about 0.35 s (measured:
a `LogicalExpression` visitor in a jsPlugin over `src/` runs 1.72 to 2.07 s against 1.37 to 1.41 s for a
noop rule). But it would report **0 today and cover the 0-site row**, leaving the 919 unknowable sites
(55%) untouched. It buys a fraction of one rule for a permanent maintenance obligation.

**Why skipping is safe.** ESLint reports 0, and that 0 is real rather than a broken rule.
`utils/typeUtil.js:5-10` requires every union member to be boolean-like, so `boolean | undefined`
*would* report. It reports nothing because the convention here is already coercion: verified at
`src/Expensify.tsx:299` (`{shouldInit && <GlobalModals />}`, a plain boolean) and
`src/components/AccountSwitcher.tsx:295` (`{!!isDebugModeEnabled && (`). The census agrees, 740 of 1663
sites are already `!x` or a comparison.

Revisit when Oxlint's jsPlugin API exposes type information. The rule should then run **unchanged**,
because it already uses the standard `getParserServices` API a typed-plugin layer would mimic.

---

## The React Compiler gap: oxc#26318

The 12 `rc/*` rules run the **Rust** React Compiler through `oxc-transform-react`, called from
`config/oxlint/reactCompilerRust.mjs`. This is the one place Oxlint reports **less** than ESLint.

| rule | ESLint | Oxlint |
| --- | ---: | ---: |
| `refs` | 213 | 213 |
| `set-state-in-effect` | **125** | **47** |
| `preserve-manual-memoization` | 2 | 62 |
| `immutability` | 6 | 7 |
| `static-components` | 2 | 2 |

**Root cause, established and cited.** `oxc-transform-react` 0.148.0 (PR #26128, "fix(transform-react):
match Babel diagnostic reporting", merged 2026-08-27) narrowed `result.errors` to *fatal* React
Compiler diagnostics only. The `index.d.ts` doc comment changed in the same release from "Parse,
semantic, React Compiler, and downstream transform diagnostics" to "... and **fatal** React Compiler
diagnostics". Bisected: 12 of 12 fixtures report on 0.145.0 and 0.147.0, 0 of 12 on 0.148.0 and
0.149.0. Tracked as [oxc#26318](https://github.com/oxc-project/oxc/issues/26318), open, filed
independently and reaching the same conclusions.

**What we do about it.** `panicThreshold: 'all_errors'` instead of the default `none`, which makes the
categories readable out of the formatted codeframe again. That recovers 47 of the 125. The remaining
78 are dark because a fatal abort stops at the first failing function, so a file's later findings are
never reached. The harness pins this behavior deliberately: `checkReactCompilerRust.mjs` section 6
asserts that `TwoComponents.tsx` reports line 7 where ESLint reports 7, 21 and 24 in one pass.

All 12 rules are ON, and section 8 of the harness fails the run if any of them is not `"error"`. Three
of them (`set-state-in-effect`, `static-components`, `error-boundaries`) are silent in isolation and
only report when carried out by a fatal diagnostic elsewhere in the file, which is recorded per fixture
rather than hidden.

**The 62 `preserve-manual-memoization` against ESLint's 2 are deliberate, and they are the reason this
module exists.** `eslint-plugin-react-hooks` skips compiling any function reached by an
`eslint-disable-next-line react-hooks/exhaustive-deps` comment, and the repo has 228 of them. We pass
`eslintSuppressionRules: []` to switch that opt-out off. Honouring suppressions instead was measured
and is far worse: total 363 to 218, `refs` 236 to 176, `EffectSetState` 51 to 28. Trading 60
over-reports for roughly 145 lost findings.

**The gap does not affect memoization.** Worth stating plainly, because it is the obvious worry.
`set-state-in-effect` is not critical, so it never aborts the transform in either compiler. Ran
`checkBothCompilers` over all 99 files ESLint flags:

```
babel memoized: 80/99      oxc memoized: 80/99      divergent: 2
```

Same 80 both sides. The 2 divergences are `refs` cases (`src/components/ValidateCodeInput.tsx`,
`src/hooks/useSidebarOrderedReports.tsx`) where Babel emits partial memoization while Oxlint reports
the file as a whole failure, which is deliberate per the header comment in
`config/reactCompiler/checkWithOxc.mjs` and unrelated to `set-state-in-effect`. So the dark findings
cost lint coverage on a Rules-of-React smell, not build parity. Nothing ships less memoized.

Two separate call sites, two thresholds, which is what keeps these independent: the lint sidecar uses
`all_errors` so it can read categories, and `config/reactCompiler/checkWithOxc.mjs:79` (the memoization
verdict, used by the compliance check and the ESLint suppression processor) uses `critical_errors` and
derives `memoized` from the `_c(|react/compiler-runtime` marker rather than from errors.

Closing oxc#26318 would recover the 78 **and** let `panicThreshold` go back to `none`, which drops the
60 over-reports at the same time.

---

## Speed

Whole repository, 9002 files, one cold run each on an idle machine:

| | ESLint | Oxlint |
| --- | --- | --- |
| Wall time, cold | **418 s** | **87 s** |
| Peak memory | ~15 GB (largest worker, 2 workers) | ~8.7 GB |
| Concurrency | capped at 2; `--concurrency=auto` dies with `ERR_WORKER_OUT_OF_MEMORY` on a 48 GB laptop | 14 threads |

Treat the ratio as a shape rather than a benchmark. Only pairings from a single
`npm run compare-oxlint -- --fresh` with nothing else running are worth quoting.

**ESLint has two speeds and the cold number is only one of them.** CI caches per file, so a normal PR
is mostly cache hits:

| one run, 10 files dirty | time |
| --- | --- |
| ESLint cold | 418 s |
| ESLint warm, 10 files re-linted | ~41 s |
| Oxlint, whole repo (it keeps no cache) | 87 s |

Oxlint loses the warm case and wins the cold one. What makes the cold case matter is `lint.yml:86-90`,
which deletes the cache and re-lints the whole repo on any failure: 36 of 299 observed runs failed
lint, and they carry 43% of the job's total minutes.

**Rule count and runtime are not close to proportional.** Same tree, same binary:

| what runs | rules | files | wall |
| --- | ---: | ---: | ---: |
| native Rust only, `typeAware: false`, `jsPlugins: []` | 261 | 8532 | **1.9 s** |
| + type-aware via tsgolint | 293 | 8532 | **18.1 s** |
| full mirror: 5 jsPlugins, React Compiler, everything | **473** | 8532 | **83.3 s** |

The last 45% of the rule set costs 44x the wall time. Cost sits almost entirely in type inference and
the React Compiler pass. `hosted/` alone is 45% of the run and moves the finding count by one, which is
the parity trade: the JavaScript React Compiler analysis is entered through it, and it is what keeps
`exhaustive-deps` at 1 = 1 with no suppression comments.

A rule total quoted without its runtime, or a runtime without its rule total, says almost nothing. Any
future decomposition has to be sequential on an idle machine with bracketing runs: an earlier attempt
ran two full Oxlint runs concurrently and produced rows *above* the baseline, where removing rules
appeared to make the run slower.

---

## What is already resolved

One line each. These were the body of the investigation and are kept only so the history is
recoverable.

**Structural**

- **The seatbelt debt tracker** was the single blocker to deleting ESLint. Resolved upstream by
  Expensify/App#99259, which replaced the `eslint-seatbelt` dependency with a tool-agnostic pipeline
  stage. See [Where this stands](#where-this-stands).
- **`checkOnyxConnectBypass` had no Oxlint mechanism**, because it read ESLint's `suppressedMessages`
  and Oxlint's JSON has no equivalent. We built one by inverting the directive wrapper's predicate.
  Then `main` resolved it differently, by rewriting the script as a Babel source scan with no ESLint
  dependency at all, which makes our version redundant. See item 2.

**Suppression comments**

- **1173 disable directives named a rule id Oxlint reports under a different prefix**, because a
  jsPlugin rule cannot claim a reserved native plugin name. The plan of record was a codemod plus a
  permanent checker. Resolved instead by `config/oxlint/eslintDirectives.mjs`, roughly 160 lines
  reimplementing ESLint's directive semantics, so a hosted rule answers to the id already in the file.
  All 53 rule ids wired, credited directive gap **0**, ESLint-only locations **0**, no source changes,
  no measurable cost. This retired `naming-codemod.py`, `wire-codemod.py` and the 1090 twin comment
  lines they had generated.
- Do **not** enable `--report-unused-disable-directives` while both linters run: on a twinned line
  Oxlint's half suppresses first and it then reports the ESLint half as unused.

**Rules**

- **Nine custom syntax bans** (`no-restricted-syntax`, which Oxlint has no native port for) run
  ESLint's own core rule through a jsPlugin. Byte-exact, 336 of 336.
- **~40 homemade Expensify rules** run inside Oxlint. `expensify-rules.mjs` auto-enumerates both rule
  directories. Proven by replaying the upstream test suites through both tools: 452 cases, all 35
  rules, identical.
- **"28 low-value legacy rules with no Oxlint counterpart"** was wrong on both halves. "No counterpart"
  had been measured against Oxlint's *native* catalogue, while `core-rules.mjs` already imports
  ESLint's entire `builtinRules` map. 27 of the 28 were one line away from running, for about 14 s of
  sidecar time. Only `no-invalid-this` stayed out, and for a named bridge limitation rather than a value
  judgement.
- **The coverage check itself was blind to plain JavaScript.** All five `REPRESENTATIVE_FILES` were
  TypeScript, and typescript-eslint's `eslint-recommended` switches core rules off for TS while leaving
  them on for JS, so the union under-reported ESLint by 24 rules. Adding three files moved the count
  from 445 to 469 and exposed 6 genuine plain-JS gaps, all since wired.
- **13 rules the migrator silently dropped** are enabled, including all 17 `react-hooks` rules.
- **`@typescript-eslint/naming-convention`** runs as `hosted/naming-convention` against stubbed parser
  services, because with our selector groups the rule never actually queries a type.
- **`rulesdir/prefer-locale-compare-from-context`** was thought to need types. It does not: the only
  question it asks is "is the receiver a string", and `localeCompare` exists on exactly one built-in
  prototype. Runs as a type-free rewrite.
- **`react/jsx-no-constructed-context-values` and `rulesdir/no-inline-useOnyx-selector`** run behind
  `config/oxlint/reactCompilerGate.mjs`, which replicates ESLint's React Compiler processor by wrapping
  `context.report`. Going native on the context rule was built, measured and reverted: it would need
  115 suppression comments plus one per new provider, and cannot react to a file losing memoization.
- **`no-inline-useOnyx-selector` parity, verified ungated 2026-09-10**: Oxlint 251, ESLint 250, shared
  250, and the single extra is our own fixture, which ESLint ignores. The 0 = 0 in the parity table is
  both gates agreeing, not a rule that stopped running.
- **`import/order` is not a feature loss**: `.oxfmtrc.json`'s `sortImports` enforces a stricter
  grouping and rewrites on save. The rule stays on only because oxfmt has its own `ignorePatterns`.

**Config and tooling**

- **A generated 1058-name `globals` block** (1060 of 3507 lines) was replaced by Oxlint's named `env`
  presets plus one explicit `__DEV__`. Verified three ways rather than assumed. 3507 to 2389 lines.
- **Oxlint's JSON was corrupted** by `babel.config.js` printing debug lines unconditionally whenever a
  linter loaded it. Fixed at the source, which also removed ~78 noise lines from every ESLint run.
- **Both linters lint the same file set**, 9002 files, zero either way. Nobody had compared this before,
  and it is a regression class the findings comparison cannot see.
- **`.oxlintrc.json` cannot move into `config/oxlint/`**: Oxlint resolves `extends` paths against the
  declaring file's directory, `ignorePatterns` included, so a root stub raised the linted file count by
  740.
- **Three real bugs Oxlint caught that ESLint misses**, all fixed: a missing `key` on an `<Accordion>`
  returned from `.map` (ESLint's `jsx-key` cannot see through a `switch`), the same module imported via
  two different aliases, and a `.filter(...).at(0)` that should be `.find(...)`.
- **The migration harness had a reporting bug of its own** (found 2026-09-10):
  `oxlint-migration/applyLintProcessors.ts` matched processed messages back to raw entries on a key
  including `ruleId`, but `StratifyNoDeprecated` *rewrites* `ruleID`, so all 235
  `@typescript-eslint/no-deprecated` findings were silently dropped from the ESLint side of every
  comparison. Fixed by rebuilding the report forwards from the processed messages, with a
  count-conservation guard. Any parity number in an earlier revision of this document that reads
  `no-deprecated  eslint=0` is that bug. The bridge is now **deleted**: with `--linter` and
  `--format=json` on the pipeline, both its consumers (`compareFullRepo.sh`,
  `checkReactCompilerGate.py`) ask the gate directly instead of reconstructing its semantics.

- **Two mapping claims in the previous "Write `OxlintLinter`" section were wrong**, both corrected
  against oxlint 1.82.0 on 2026-09-10. It said Oxlint's JSON "gives byte offsets in `labels[0].span`,
  not line and column" and recommended copying `offsetToLoc` from
  `config/reactCompiler/checkWithOxc.mjs`. The span carries 1-based `line` and `column` directly
  (checked against `src/components/Text.tsx:48`, column 5 for a symbol at index 4), so no conversion
  is needed and none was written. It also said a diagnostic with no `code` is a JS-plugin crash; that
  is handled as a fatal, but 0 of the 4403 findings in the full-repo run lack a code, so the handling
  ships covered only by a fixture.
- **`eslintSuppressionRules: []` is not an Oxlint quirk, it is what every build already does**
  (measured 2026-09-10, see [item 3](#3-three-policy-decisions--resolved-baseline-everything)). Worth
  recording because the 49 extra `preserve-manual-memoization` findings look like a port bug and are
  not.

---

## Open upstream bugs

Each re-tested rather than assumed.

| what | where | impact |
| --- | --- | --- |
| **`result.errors` no longer carries non-fatal React Compiler diagnostics** | [oxc#26318](https://github.com/oxc-project/oxc/issues/26318) | 78 dark `set-state-in-effect` findings. The highest-leverage one open |
| `sourceCode.getJSDocComment` throws unconditionally | `dist/lint.js:5784`, tracked as [oxc#18245](https://github.com/oxc-project/oxc/issues/18245) | keeps `no-invalid-this` out. Decided to skip |
| code-path analyzer crashes on a body-less `declare module` | reproduced on `css.d.ts` and `pdf.worker.d.ts` | a hard crash on a common `.d.ts` shape. Worked around with a `**/*.d.ts` override |
| no directive alias map | [oxc#22647](https://github.com/oxc-project/oxc/issues/22647) is the adjacent case | solved ourselves in `eslintDirectives.mjs`, still worth filing |
| `unicorn/prefer-at` emits two identical diagnostics for one `slice(-1)[0]` | | no instance in the repo today, but it would break count parity the moment somebody writes one |
| native `jsx-no-constructed-context-values`: wrong anchor line, and no component-scope check | reproducible with `oxlint-migration/compareNativeCtxValues.py` | the reason that rule runs hosted rather than native |
| `strict-boolean-expressions` is missing from the published rules page | | it exists and works. Docs bug, but it cost real time |
| tsgolint has no `ignoreWrites` for `no-deprecated` | cite [typescript-eslint#10643](https://github.com/typescript-eslint/typescript-eslint/issues/10643) | 166 write-site findings, decision 3 |

Two in `eslint-plugin-react` rather than Oxlint: `jsx-no-constructed-context-values` misses a value
built with `satisfies`, and `prefer-exact-props` throws on any *read* of `.propTypes` once an exact
wrapper is configured.

Unrelated but worth fixing: `modules/group-ib-fp/tsconfig.json` uses three compiler flags removed in
TypeScript 7, and the TypeScript 7 compiler reports "Invalid tsconfig" for it even though the directory is ignored.

---

## Harness commands

Everything under `oxlint-migration/` exists only to compare the two linters and is deleted with ESLint.
Production config is `.oxlintrc.json` plus `config/oxlint/`, mirroring `config/eslint/`.

```bash
npm run compare-oxlint                 # the authoritative parity check; -- --fresh to re-lint
npm run oxlint-rule-fixtures           # per-rule fixtures, both tools, file/line exact
npm run oxlint-rule-tester             # replays the custom rules' own test suites through both tools
npm run oxlint-sidecar-coverage        # every jsPlugin-hosted rule has evidence it runs
npm run oxlint-react-compiler-rust     # the 12 rc/* rules and their category mapping
npm run oxlint-react-compiler-gate     # the memoization gate, which counts cannot prove
npm run oxlint-locale-compare-port     # the type-free rewrite against ESLint's typed original
npm run oxlint-jsx-uses-port           # the two rules that cannot report, asserted by outcome
npm run oxlint-onyx-bypass             # the inverted directive predicate
npm run oxlint-rule-inventory          # every rule either tool enables
npm run oxlint-rule-availability       # for each rule ESLint enforces, does Oxlint have one at all
python3 oxlint-migration/checkConfigDrift.py    # every config difference must be in LEDGER
```

Current state of all of them: green.

Every gate has been through green-red-green, one sabotage per failure bucket, reverted after. Examples:
no-op a rule's `create` and the harness must report `SILENT` plus `BRIDGE`; force `memoizedByBoth` false
and exactly the four gated cases must fail; delete a manifest entry and the rule must be reported as
having no evidence.

Three ways these harnesses have faked a pass before being fixed, all worth remembering:

1. **Oxlint honours `.gitignore` even under `--no-ignore`**, so adding a generated fixture tree to `.gitignore`
   made the run report "No files found to lint" and pass on nothing.
2. **A resolve hook has to key on the importer.** Redirecting every request for `eslint` also hits
   `@typescript-eslint/utils`, which needs the real one.
3. **Never drive a codemod off a bare grep.** One pass pulled in 21 generated
   `.github/actions/**/index.js` bundles and normalized their CRLF to LF: 30206 added lines of noise, of
   which 47 were the actual directives.

### Reproducing the full-repo comparison

```bash
bash oxlint-migration/compareFullRepo.sh --fresh
```

The wrapper runs the equivalent of:

```bash
SEATBELT_DISABLE=1 NODE_OPTIONS=--max_old_space_size=16384 ESLINT_CONCURRENCY=2 \
  bun scripts/lint/index.ts --linter=eslint --format=json --no-cache . > /tmp/eslint-full.json
npx oxlint --type-aware --format json > /tmp/oxlint-full.json
python3 oxlint-migration/compareFullRepo.py /tmp/oxlint-full.json /tmp/eslint-full.json
```

Three things that are not optional:

- **The 16 GB heap and `ESLINT_CONCURRENCY=2`.** Full-repo ESLint OOMs with `auto` on a 48 GB machine.
- **`SEATBELT_DISABLE=1`.** The seatbelt's grandfathered debt is what this is comparing against, so
  the one pipeline stage that must not run is the ratchet. The other two, the React Compiler
  suppression and the `no-deprecated` stratification, must run: they are what the repo's gate reports.
- **The production `ignorePatterns` in any ad-hoc probe config.** Omitting them silently adds the ncc
  bundles and generated parsers, which is how a 2-finding rule reads as 358.

`--rule '{"progress/activate":"off"}'` is no longer needed: the pipeline sets `LINT_PIPELINE=1`, which
`config/eslint/eslint.config.mjs:245` already reads to hide the per-file spinner.

Either side can be swapped for `--linter=oxlint` to diff the two through identical processors. Over
`src/hooks` that reads 125 (ESLint) against 147 (Oxlint), with six rules at exact parity and every
difference one of the rows in [item 3](#3-three-policy-decisions--resolved-baseline-everything).

### Adding a fixture

Drop a violating file in `oxlint-migration/port-probe/fixtures/`, enable the rule in **both** probe
configs, add a `fixtures.manifest.json` entry. Several rules may share one file; the harness matches on
rule id.

Two Oxlint config gotchas that cost time here: a rule whose plugin is declared only in an `overrides`
block must be enabled **in that same block** (the root `rules` block rejects the prefix with
`Plugin '<name>' not found`), and conversely **an unknown rule id inside `overrides` is accepted
silently and does nothing**. Rules from a plugin declared in the root `jsPlugins` work anywhere, which
is where all of this repo's hosted rules live.

Take `expected` from the ESLint run rather than guessing it. Every wave so far has had at least one rule
that fires more often than the fixture author assumed. And a gated rule needs `'use no memo'` in its
fixture, or the React Compiler gate silences it and the failure looks like a rule that never loaded.
