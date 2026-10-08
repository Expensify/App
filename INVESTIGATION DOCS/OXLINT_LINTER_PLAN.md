# Plan: `OxlintLinter`

Implementation plan for item 1 of [OXLINT_MIGRATION_INVESTIGATION.md](OXLINT_MIGRATION_INVESTIGATION.md#1-write-oxlintlinter--the-one-real-task--s-to-m).

Every number below was measured in this worktree on 2026-09-10 against oxlint 1.82.0
(`package.json:360`), unless marked otherwise.

---

## The shape of the work

`scripts/lint/Linter.ts` is a two-method port. `scripts/lint/eslint/ESLintLinter.ts` is the only
implementation. The task is a sibling `scripts/lint/oxlint/OxlintLinter.ts` that spawns oxlint,
parses its JSON, and returns a `LinterResult`. Seatbelt, `ReactCompilerFilter`,
`StratifyNoDeprecated` and `StylishFormatter` then apply unchanged.

The catch is that "unchanged" is conditional. Those four stages read three things out of a
`LintMessage`: `ruleID`, `filePath`, and `severity`. Oxlint disagrees with ESLint on the first two,
and the pipeline's fatal-error contract disagrees with oxlint's exit codes. Those are obstacles
O1, O2 and O4 below, and they are the whole of the risk.

---

## Obstacles

### O1. Rule IDs are in oxlint's namespace, and every downstream stage is keyed on ESLint's

Oxlint emits `code` as `plugin(rule)`:

```json
{"code": "typescript(no-unsafe-type-assertion)", "severity": "error", "filename": "src/libs/Log.ts",
 "labels": [{"span": {"offset": 1343, "length": 129, "line": 29, "column": 12}}]}
```

Three consumers are keyed on the ESLint name instead:

| consumer | keyed on | evidence |
| --- | --- | --- |
| the seatbelt baseline | `"@typescript-eslint/no-unsafe-type-assertion"` and 34 other ESLint ids, 1393 rows, 3096 errors | `config/eslint/eslint.seatbelt.tsv` |
| `ReactCompilerFilter` | `react/jsx-no-constructed-context-values`, `rulesdir/no-inline-useOnyx-selector`, `react-hooks/exhaustive-deps` | `config/reactCompiler/suppressedRules.mjs:14`, `:20` |
| `StratifyNoDeprecated` | `@typescript-eslint/no-deprecated` | `scripts/lint/processors/StratifyNoDeprecated.ts:10` |

So normalization has to happen inside the linter, before the pipeline flattens messages. It cannot
be a processor, because `ReactCompilerFilter` is the first stage and would already have run.

The mapping exists: `norm_ox` at `oxlint-migration/ruleMap.py:165`. It is Python, and it depends on
two tables, `OXLINT_RENAMES` (2 entries, `ruleMap.py:126`) and `HOSTED_RULE_ORIGIN` (28 entries,
`ruleMap.py:133`).

Full-repo run, 9002 files, 4403 diagnostics, plugin prefixes actually observed:

```
typescript 3130   import 407   rc 331   core 329   rulesdir 108   eslint 92   react 3   unicorn 2   hosted 1
```

All nine map cleanly under `norm_ox`. `hosted` is the only one needing `HOSTED_RULE_ORIGIN`.

**Recommendation: do not port the tables to TypeScript.** `HOSTED_RULE_ORIGIN` is a hand-maintained
restatement of information `config/oxlint/plugins/hosted-rules.mjs:67` already computes:
`hostRules(rules, eslintPrefix, names)` builds each hosted rule with its ESLint prefix in hand and
throws the prefix away. Have that file also export the derived `rule -> eslint id` map, then:

- `OxlintLinter.ts` (bun) imports it directly, as `ReactCompilerFilter.ts:9` already imports
  `suppressedRules.mjs`.
- `ruleMap.py` reads it through the node subprocess it already runs in `js_plugin_rules`
  (`ruleMap.py:352`), and `HOSTED_RULE_ORIGIN` is deleted.

That is the same three-runtimes-one-source pattern `suppressedRules.mjs` was created for, and it
removes a drift class rather than adding one. `OXLINT_RENAMES` is 2 entries and can live in the same
shared module.

### O2. Oxlint paths are cwd-relative; the seatbelt only matches absolute ones

`filename` comes back as `src/libs/Log.ts`. Seatbelt keys are relative to the TSV's own directory:

```
"../../__mocks__/@pusher/pusher-websocket-react-native/index.ts"	"@typescript-eslint/no-unsafe-type-assertion"	1
```

`FileUtils.toRelativePath` (`scripts/utils/FileUtils.ts:45`) returns an already-relative path
**unchanged**. Feed it `src/libs/Log.ts` and it looks up `src/libs/Log.ts`, which is in no row, so
all 3096 grandfathered errors miss and every finding is reported as new. Silent, and it looks like
a parity catastrophe rather than a path bug.

Two more stages assume absolute: `ReactCompilerFilter.shouldSkipCompiler` tests
`filename.includes('/tests/')` (`ReactCompilerFilter.ts:36`), which a bare `tests/foo.ts` fails, and
both `ReactCompilerFilter` and `StratifyNoDeprecated` call `Bun.file(filename).text()`.

Fix: resolve every `filename` against `projectRoot` in the normalizer. One line, but it has to be
there from the first commit or the M4 baseline is generated wrong.

### O3. Oxlint never reports the files that were clean, and the seatbelt needs them

`LinterResult.files` is per-file; oxlint's JSON is a flat `diagnostics` array plus a
`number_of_files` count. A file with zero findings does not appear.

`ProcessorContext.lintedFiles` feeds two things that only work with the full list:

- the zero-fill at `Seatbelt.ts:434`, which is how a file whose count dropped to 0 gets ratcheted down
- the dead-row prune at `Seatbelt.ts:460`

Without it the ratchet becomes one-way and CI (`readOnly: false`, `Seatbelt.ts:530`) stops tightening.

Fix: a second invocation, `oxlint --debug=files`, which prints the file list and exits.

| run | wall time | files |
| --- | ---: | ---: |
| `oxlint --type-aware --format json .` | 121.5s | 9002 |
| `oxlint --debug=files .` | 2.65s | 9002 |

2% overhead, and the counts agree exactly. Take it.

### O4. Exit code 1 means three different things, one of which is fatal

`LintPipeline.ts:32` treats `exitCode > 1` as fatal and `1` as a normal "found errors" run. Oxlint
returns 1 for all of:

| situation | exit | stdout |
| --- | ---: | --- |
| found diagnostics | 1 | the JSON |
| no files matched the target | 1 | `No files found to lint. ...` then a JSON object with `number_of_files: 0` |
| config failed to parse | 1 | `Failed to parse oxlint configuration file.` and `x Rule 'nonexistent-rule-xyz' not found in plugin 'eslint'`, **no JSON at all** |

Passed through as-is, a broken `.oxlintrc.json` reports a clean pass and CI goes green.

Fix, mirroring `parseESLintStdout` (`ESLintLinter.ts:92`): no JSON payload that parses promotes the
exit code to `Math.max(2, exitCode)` and puts stdout+stderr in `stderr`. Add one oxlint-specific
case: `number_of_files === 0` while explicit targets were given is also fatal, since that is the
`--no-error-on-unmatched-pattern` situation ESLint would have failed on. Do **not** pass
`--no-error-on-unmatched-pattern`; it turns the typo case into exit 0.

### O5. Oxlint writes warnings to stdout, ahead of the JSON

The `No files found to lint.` line above is on stdout, not stderr, prepended to the JSON. Same
problem `extractJSONArray` (`ESLintLinter.ts:70`) solves for babel logs, so it needs the object
equivalent: first `{` to last `}`.

### O6. `--cache` does not exist, and `--concurrency` is `--threads`

`oxlint --help` has no cache flag. The pipeline's `--no-cache` (`scripts/lint/index.ts:29`) becomes
a no-op under oxlint and should say so in its description once the flip lands. `ESLINT_CONCURRENCY`
has no oxlint counterpart either; the flag is `--threads`. Cold full-repo run is 121s, which is the
number that matters, not the cache.

### O7. The investigation doc is stale on span shape

[OXLINT_MIGRATION_INVESTIGATION.md:63](OXLINT_MIGRATION_INVESTIGATION.md) says oxlint "gives byte
offsets in `labels[0].span`, not line and column" and recommends copying `offsetToLoc` from
`config/reactCompiler/checkWithOxc.mjs:40`. As of 1.82.0 the span carries `line` and `column`
directly, and they are 1-based: `src/components/Text.tsx:48` reports column 5 for `fontSize`, which
sits at index 4 on that line. **No offset conversion is needed.** Drop that from the task.

What is genuinely missing from oxlint's JSON: `endLine`, `endColumn`, `fix`, `suggestions`. Nothing
downstream reads them (`StylishFormatter.ts:13` uses line and column only; Seatbelt uses neither),
so leave them undefined rather than reconstructing them from `offset` + `length`.

Residual, not blocking: oxc spans are UTF-8 byte based and ESLint columns are UTF-16 code units, so
a finding after a non-ASCII character on the same line can land at a different column. The only
consumer that cares is `StratifyNoDeprecated`'s `lineColumnToOffset` (`StratifyNoDeprecated.ts:14`),
which degrades to the backtick-symbol regex fallback (`:81`) when the AST lookup misses.

### O8. `help` and `note` have no ESLint equivalent

504 of 4403 diagnostics carry `help`, 392 carry `note`. ESLint folds that context into `message`.
Dropping them loses the actionable half of a finding:

```
message: Module "react-native-config" has named export "Config"
help:    Using default import as "Config" can be confusing. Use another name for default import ...
```

Recommend appending `help` to `message`. Safe for the ratchet: Seatbelt keys on `ruleID` only and
rewrites `message` itself (`Seatbelt.ts:151`).

### O9. The "no `code` means a JS-plugin crash" case is currently untriggered

The doc's second mapping note ([:65](OXLINT_MIGRATION_INVESTIGATION.md)) is sound in principle and
is what `compareFullRepo.py:45` guards. But 0 of 4403 diagnostics in the full-repo run lack a
`code`, so the handling ships unexercised. Build it (promote to fatal, never a null `ruleID`) and
cover it with a fixture in `tests/tooling/`, because there is no live case to catch a regression.

### O10. The baseline is not a drop-in, and two of the deltas are not in the doc's decision table

Raw oxlint counts folded through `norm_ox`, against the current seatbelt totals (no-deprecated
folded back from its stratified ids):

| rule | seatbelt | oxlint | delta |
| --- | ---: | ---: | ---: |
| `@typescript-eslint/no-unsafe-type-assertion` | 1978 | 1980 | +2 |
| `@typescript-eslint/no-unnecessary-type-assertion` | 0 | 740 | **+740** |
| `import/no-cycle` | 0 | 390 | **+390** |
| `@typescript-eslint/no-deprecated` | 235 | 401 | **+166** |
| `react-hooks/preserve-manual-memoization` | 13 | 62 | **+49** |
| `react-hooks/set-state-in-effect` | 125 | 47 | **-78** |
| `no-restricted-syntax` | 329 | 329 | 0 |
| `react-hooks/refs` | 213 | 213 | 0 |
| `no-restricted-imports` | 86 | 86 | 0 |
| `rulesdir/no-raw-typography` | 45 | 45 | 0 |
| `rulesdir/no-onyx-connect` | 42 | 42 | 0 |
| `rulesdir/no-default-id-values` | 21 | 21 | 0 |
| **total** | **3096** | **4403** | **+1307** |

The first three are the three policy decisions the doc already tracks. The last two are not:

- `preserve-manual-memoization` **+49** and `set-state-in-effect` **-78** are both `rc` rules, so
  they are the [React Compiler gap (oxc#26318)](OXLINT_MIGRATION_INVESTIGATION.md#the-react-compiler-gap-oxc26318)
  showing up as a baseline delta rather than as a missing rule. The doc's decision table lists only
  the three type-aware/import rules.
- The **negative** delta is the sharper problem. In frozen mode (`SEATBELT_FROZEN`,
  `Seatbelt.ts:276`) a count that goes *down* is an error until the TSV is rewritten, by design.
  So the flip cannot be "swap the linter and see"; the seatbelt has to be regenerated in the same
  change.

(The comparison above is against raw oxlint, before `ReactCompilerFilter`. That filter only touches
`react/jsx-no-constructed-context-values`, `rulesdir/no-inline-useOnyx-selector` and the
useCallback/useMemo `exhaustive-deps` subset, none of which appear in the table, so the deltas hold.)

---

## Milestones

### M1. Share the rule-name map · S

- `config/oxlint/plugins/hosted-rules.mjs`: export the `rule -> eslint id` map `hostRules` already
  derives.
- New shared module for `norm_ox`'s logic plus `OXLINT_RENAMES`, next to `suppressedRules.mjs`.
- `oxlint-migration/ruleMap.py`: read it, delete `HOSTED_RULE_ORIGIN`.
- Guard: `npm run oxlint-config-drift` and `npm run compare-oxlint` must produce byte-identical
  output before and after. Nothing about the mapping changes, only where it lives.

### M2. `scripts/lint/oxlint/OxlintLinter.ts` · M

Structure mirrors `ESLintLinter.ts` so the two read as siblings, with the same exported seams for
testing (`parseOxlintStdout`, `normalizeOxlintDiagnostics`).

Covers O1, O2, O4, O5, O7, O8, O9. Argument list: `--format json` plus targets. Do not pass
`--type-aware`; `.oxlintrc.json` already sets `options.typeAware: true`, verified. Do not pass
`--no-error-on-unmatched-pattern` (O4).

Tests in `tests/tooling/lintPipeline.test.ts`, following the existing fixture-string style at
`lintPipeline.test.ts:76`:

- normalizes each of the 9 observed plugin prefixes to its ESLint id
- resolves `filename` to an absolute path against `projectRoot`
- JSON preceded by the `No files found to lint.` line still parses
- config-parse-failure stdout with no JSON promotes to exit 2
- `number_of_files: 0` with explicit targets is fatal
- a diagnostic with no `code` is fatal, never a null `ruleID`
- 1-based line/column pass through untouched

Green-red-green each: break the normalizer and confirm the assertion fails.

### M3. Run both linters through one pipeline · S

`--linter=eslint|oxlint` in `scripts/lint/index.ts:59`, defaulting to eslint. The `--debug=files`
pre-pass (O3) lands here.

The payoff is the diff: `StylishFormatter` output from both linters, same processors, same seatbelt.
That is a strictly better oracle than `compareFullRepo.py`, and it retires
`oxlint-migration/applyLintProcessors.ts`, which exists only because raw ESLint JSON is no longer
what the gate reports.

### M4. Regenerate the seatbelt under oxlint · S, but gated on M3

`SEATBELT_INCREASE=all` with the oxlint linter, then review the TSV diff against the O10 table. Any
per-rule delta *not* in that table is a port bug and blocks the flip.

### M5. CI and tooling swap

Item 4 of the investigation doc. Out of scope here.

---

## Status

M1, M2 and M3 are implemented. M4 is not, deliberately: it rewrites 1393 seatbelt rows and depends
on the three policy decisions the investigation doc still lists as open.

| milestone | state | what landed |
| --- | --- | --- |
| M1 share the rule-name map | done | `config/oxlint/ruleNames.mjs` (+ `.d.mts`), `hosted-rules.mjs` builds itself from it, `ruleMap.py` reads it and no longer carries `HOSTED_RULE_ORIGIN`/`OXLINT_RENAMES` |
| M2 `OxlintLinter` | done | `scripts/lint/oxlint/OxlintLinter.ts`, 12 tests in `tests/tooling/lintPipeline.test.ts` |
| M3 both linters, one pipeline | done | `--linter=eslint\|oxlint` in `scripts/lint/index.ts`, default unchanged at `eslint` |
| M4 regenerate the seatbelt | done | `config/oxlint/oxlint.seatbelt.tsv`, 1848 rows / 1409 files / 4403 errors, generated with `SEATBELT_INCREASE=all` |
| M5 CI, shadow only | done | `.github/workflows/oxlint.yml`, non-blocking, wired into `preDeploy.yml` but deliberately absent from `confirmPassingBuild`'s `needs` |

### D1 / D2 / D3, resolved 2026-09-10

- **D1 two baselines.** `SEATBELT_TSV_BY_LINTER` in `Seatbelt.ts`; `resolveSeatbeltOptions` takes the
  relative path as a third argument, defaulting to the ESLint one. Proven isolated: inflate a row in
  `oxlint.seatbelt.tsv` from 2 to 7, run `npm run lint` with `CI=1` on the same subtree, and the row
  stays at 7 while `eslint.seatbelt.tsv` is untouched; the oxlint run then tightens it back to 2.
- **D2 `import/no-cycle`.** Baselined, all 390. Being actively fixed, so the ratchet tightens as
  fixes land.
- **D3 `react-hooks/preserve-manual-memoization`.** Not a port bug. `reactCompilerRust.mjs:151` sets
  `eslintSuppressionRules: []` deliberately, so oxlint analyzes the functions ESLint's plugin skips
  because of an `eslint-disable-next-line react-hooks/exhaustive-deps` comment. 20 of the 29 distinct
  sites sit under one of those comments. Verified on `src/hooks/usePaymentOptions.ts:247`: deleting
  the disable comment makes ESLint itself report the same missing `lastPaymentMethod` dependency,
  under `react-hooks/exhaustive-deps`. Same defect, different rule id. Baselined.

  One measurement worth keeping: the rule produces 62 findings at only 29 distinct locations
  (`AboutPage.tsx:164` is reported 8 times, `usePaymentOptions.ts:247` 6 times), so the baselined
  count is inflated relative to the work. `rc(refs)` is 213 at 171 distinct, and ESLint's baseline is
  also 213, so the duplication is not oxlint-specific.

### Verification

- `hosted-rules.mjs` serves the same 28 rule keys as before, in the same per-plugin groups, each
  still bound to a rule with a `create()`.
- Python `norm_ox` and JS `oxlintCodeToESLintRuleID` agree on all 57 rule codes the full-repo run
  produces plus all 28 hosted rules. `npm run oxlint-config-drift` still prints "No unlisted drift".
- `npm run typecheck` passes. `npm run lint-changed` is clean. `bun test tests/tooling/lintPipeline.test.ts
  tests/tooling/lintSeatbelt.test.ts`: 51 pass, 0 fail.
- The 12 new tests were checked green-red-green: 10 separate mutations (drop the path resolution,
  drop the help/note fold, drop the codeless-diagnostic fatal, drop the stdout-prefix tolerance,
  drop the severity map, drop the zero-fill, drop the hosted-origin throw, drop the `typescript/`
  prefix, drop the renames, stop promoting the fatal exit code) each turned at least one test red.
- O2 confirmed live, not just in a unit test: linting `src/libs/actions/Task.ts` through
  `--linter=oxlint` demotes its `no-deprecated/deprecatedGetReportName` and its three
  `no-unsafe-type-assertion` findings to warnings, which only happens if the absolute path matched
  the file's seatbelt rows and `StratifyNoDeprecated` produced the stratified id.
- O3 confirmed live with `SEATBELT_VERBOSE=1`: `src/components/AutoCompleteSuggestions/index.tsx`
  produces no `react-hooks/set-state-in-effect` diagnostic under oxlint and the seatbelt logs
  `update max errors 1 -> 0` for it. Without the `--debug=files` pass that file never reaches the
  processor and the row never tightens.
- O4 confirmed live: `bun scripts/lint/index.ts --linter=oxlint src/does-not-exist.ts` exits 2.

### The M3 diff, on `src/hooks`

Both linters, same processors, seatbelt disabled:

```
rule                                                  eslint  oxlint
@typescript-eslint/no-unsafe-type-assertion               90      90
react-hooks/refs                                          19      19
react-hooks/preserve-manual-memoization                    0      13
@typescript-eslint/no-unnecessary-type-assertion           0      12
no-restricted-imports                                      4       4
react-hooks/set-state-in-effect                            6       2
rulesdir/no-raw-typography                                 3       3
@typescript-eslint/no-deprecated                           2       2
no-restricted-syntax                                       1       1
import/no-duplicates                                       0       1
TOTAL                                                    125     147
```

Six rules at exact parity; every difference is an O10 row. Reproduce over any path with two
`bun scripts/lint/index.ts` runs, `SEATBELT_DISABLE=1` and `--show-warnings`.

### applyLintProcessors.ts, removed

`oxlint-migration/applyLintProcessors.ts` is deleted. It existed only because raw
`npx eslint --format json` stopped being what the gate reports once `ReactCompilerFilter` and
`StratifyNoDeprecated` became pipeline stages, so a harness comparing oxlint against raw ESLint was
comparing against something the repo never emits. The bridge re-applied those two stages to a raw
report.

Deleting it needed a machine-readable pipeline output first, because both of its consumers worked on
JSON and `StylishFormatter` was the only formatter:

- `scripts/lint/formatters/JSONFormatter.ts` plus `--format=stylish|json` in `index.ts`. The shape is
  the pipeline's own flat `LintMessage[]`, not ESLint's per-file report: a consumer asking what the
  gate reports should read the gate's vocabulary. It never filters warnings, since a seatbelt-demoted
  finding cannot be recovered once dropped.
- `compareFullRepo.sh` now runs `bun scripts/lint/index.ts --linter=eslint --format=json --no-cache .`
  with `SEATBELT_DISABLE=1`, `ESLINT_CONCURRENCY=2` and a 16 GB heap. `--rule
  '{"progress/activate":"off"}'` is gone: the pipeline sets `LINT_PIPELINE=1`, which already hides the
  spinner (`config/eslint/eslint.config.mjs:245`).
- `compareFullRepo.py`'s `eslint_locations` reads the flat shape; `eslint_messages` documents why.
- `checkReactCompilerGate.py` runs the gate directly instead of piping ESLint through the bridge.
- `tsconfig.bun.json` loses the one-file `oxlint-migration/` carve-out that existed only for it, and
  `oxlint-migration/README.md` loses its row.

Verified: `checkReactCompilerGate.py` still prints "The gate matches the ESLint side" on all four
matrix cells, and `compareFullRepo.py` over `src/hooks` reproduces the M3 table exactly (125 vs 147,
same per-rule numbers) now that it is fed by the pipeline rather than by the bridge.

---

## Shipped

Four commits on `feat/oxlint`, pushed 2026-09-10 (`62b9fce1eb1..abccfb74fc1`):

```
b06ea0c635e  Share the oxlint rule-name map across the three runtimes that need it
5d89c035d2c  Run either linter through the lint pipeline, each with its own seatbelt baseline
67edb64f8a8  Replace the lint-processor bridge with the pipeline's own JSON output
abccfb74fc1  Run Oxlint as a non-blocking shadow check in CI
```

## Recommended sequence

M1 → M2 → M3 → M4. M1 first because M2's normalizer should import the shared map rather than be
written against a copy and reconciled later.
