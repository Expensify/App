# oxlint-migration

**Temporary. This whole directory is deleted when ESLint is removed.**

Everything here exists to answer one question: does Oxlint report the same thing ESLint reports? Every
script in here runs both linters and compares them, so none of it has a job once there is only one
linter left. Nothing in the app, in CI's production lint gate, or in `.oxlintrc.json` depends on this
directory. Deleting it is a `git rm -r` plus removing the `oxlint-*` scripts from `package.json`.

One thing to know before reading any of it: "what ESLint reports" is no longer `npx eslint`. The
React Compiler suppression and the `@typescript-eslint/no-deprecated` stratification used to be
ESLint processors wired into `config/eslint/eslint.config.mjs`; they are now stages in
`scripts/lint/`, which runs them over ESLint's output rather than inside it. Scripts whose rule of
interest one of those stages filters pipe their report through `applyLintProcessors.ts`, which
applies the production stages rather than reimplementing them. The rest read raw ESLint and say so
at the call site.

The same move retired this migration's first blocker. The seatbelt baseline used to be a pseudo-rule
contributed by the `eslint-seatbelt` plugin, which only ESLint could run, so switching to Oxlint
needed a baseline mechanism built from scratch. Expensify/App#99259 dropped the dependency for
`scripts/lint/processors/Seatbelt.ts`, a stage over the normalized `LintMessage[]` in
`scripts/lint/types.ts`. It reads no ESLint type, and `scripts/lint/Linter.ts` is already a port with
`ESLintLinter` as one implementation, so the baseline follows whichever linter the pipeline is handed.

What is *not* here, on purpose:

| lives in | what |
| --- | --- |
| `.oxlintrc.json` (repo root) | the production Oxlint config |
| `config/oxlint/plugins/` | the four jsPlugin modules the config loads (`core`, `hosted`, `rulesdir`, `rh`) |
| `config/oxlint/reactCompilerGate.mjs` | the React Compiler gate those plugins wrap rules in |
| `config/oxlint/preferLocaleCompareFromContext.mjs` | the type-free rewrite of one custom rule |

Those are production lint config, they mirror `config/eslint/`, and they stay after this directory is
gone. See `contributingGuides/LINTING.md`.

## Why `.oxlintrc.json` is at the repo root and not in `config/oxlint/`

ESLint keeps a one-line re-export at the root and the real config in `config/eslint/`. Oxlint cannot
do the same. Its `extends` resolves *every* relative path against the directory of the file that
declares it, including `ignorePatterns` and `overrides.files`. Measured 2026-08-13: moving the real
config to `config/oxlint/oxlintrc.json` behind a root `extends` stub raised the linted file count from
8218 to 8958, because repo-root-relative ignores such as `web/gtm.js` and `docs/vendor/**` silently
stopped matching. The root file is therefore the real config, and that is deliberate.

## What is in here

| path | what it does | run with |
| --- | --- | --- |
| `compareFullRepo.{sh,py}` | whole-repo, finding-by-finding parity between the two tools | `npm run compare-oxlint` |
| `port-probe/` | one fixture per rule that deliberately violates it, so a rule with no findings in this repo is still proven to run | `npm run oxlint-rule-fixtures` |
| `rule-tester/` | harvests the upstream `RuleTester` cases for the custom rules and replays them as real files through both tools | `npm run oxlint-rule-tester` |
| `checkSidecarCoverage.py` | fails if any hand-hosted sidecar rule has no fixture, replayed case or probe | `npm run oxlint-sidecar-coverage` |
| `checkReactCompilerGate.py` | asserts the gate suppresses exactly what the ESLint side suppresses | `npm run oxlint-react-compiler-gate` |
| `applyLintProcessors.ts` | filter, not a check: applies the repo's lint processors to an ESLint JSON report so the ESLint side of a comparison means what the repo's gate reports | piped into the scripts above |
| `checkLocaleComparePort.py` | asserts the type-free rule rewrite matches the type-aware original, receiver shape by receiver shape | `npm run oxlint-locale-compare-port` |
| `checkJsxUsesPort.py` | the two rules that cannot report anything, asserted by outcome instead | `npm run oxlint-jsx-uses-port` |
| `listAllRules.py` | inventory of every rule either tool enables, and why anything is off | `npm run oxlint-rule-inventory`, `npm run oxlint-rule-availability` |
| `ruleMap.py` | the shared rule-id map and `PORT_PLAN`; imported by most of the above | library |
| `compareNativeCtxValues.py`, `eslint-ctx-values-rule.mjs` | reproduction for the two upstream bugs in Oxlint's native `react/jsx-no-constructed-context-values` (wrong anchor line, no component-scope check) | on demand, until both are filed |

## The one thing still blocking the switch

All twelve `rc/*` React Compiler rules are `off` in `.oxlintrc.json`. They were ported and measured
working on `oxc-transform-react` 0.147.0. Version 0.148.0 narrowed `result.errors` to *fatal* React
Compiler diagnostics ([oxc-project/oxc#26128](https://github.com/oxc-project/oxc/pull/26128), "match
Babel diagnostic reporting"), and `should_panic` in `crates/oxc_react_compiler/src/diagnostics.rs`
answers `false` unconditionally for the default `panicThreshold: "none"`, so the Rust engine now
analyzes every file and returns nothing. Measured: 12/12 fixtures report on 0.147.0, 0/12 on 0.148.0
and 0.149.0.

Forcing the diagnostics fatal to read them back does not work. `panicThreshold: "all_errors"` aborts
on the first function that fails to compile and returns only what it accumulated, so later components
in the same file are never analyzed: two components each with a ref read gives 1 finding where ESLint
gives 2. Whole-repo that was `refs` 215 vs 215 with mismatched locations both ways, `immutability` 6
vs 7, and `preserve-manual-memoization` 2 vs 65. Wrong in both directions, so worse than off.

Cost while off: 352 findings ESLint reports and oxlint does not. What it needs is for oxc to expose
non-fatal React Compiler diagnostics; their own `outputMode: "lint"` is documented as "analyze and
report diagnostics without applying compiler output", which is precisely the missing channel.

Tracked upstream as [oxc-project/oxc#26318](https://github.com/oxc-project/oxc/issues/26318),
"expose recoverable React Compiler diagnostics" against the Node binding, filed 2026-09-04 and open with
no maintainer reply. Filed by someone else and it reaches the same three conclusions independently:
`errors` is fatal-only, `outputMode: "lint"` returns nothing, and `panicThreshold` is not a workaround
because it stops at the first diagnostic. It asks for a `diagnostics` array beside `errors`, or a
Babel-style logger; the Rust side already has category, span and help text and only the binding drops
them. So there is nothing to file, only something to wait on or contribute to.

Related but already avoided:
[oxc-project/oxc#26277](https://github.com/oxc-project/oxc/issues/26277) reports that a
`disable-next-line` naming `react/exhaustive-deps` or `react/rules-of-hooks` suppresses every React
Compiler diagnostic in the enclosing component. That hits Oxlint's *native* `react/*` rules, which this
config does not use for the compiler checks precisely because of that behaviour, which is what
`eslintSuppressionRules: []` in `config/oxlint/reactCompilerRust.mjs` is there to defeat.

Nothing here silently tolerates it. `checkReactCompilerRust.mjs` derives an `ENGINE_REPORTS` flag and
asserts either the real expectations or the blocked ones, ending with a check that the twelve rules
are enabled if and only if the engine can feed them. The `port-probe/` entries carry
`blockedUpstream`, which asserts ESLint still reports and oxlint still does not. So the day upstream
fixes this, both suites fail and say what to turn back on.

## Files that are records, not inputs

`migration-details.log` (what `npx @oxlint/migrate` skipped and why) and `dep-override-files.json`
(the write-only deprecation file list a codemod emitted into the config) are kept as provenance for
steps that are already applied. Nothing reads them. They die with this directory.

Generated reports are gitignored, not committed: `rule-inventory.json`, `rule-availability.json`,
`dep-cmp.json`, `dep-only-api.json`. Regenerate with the scripts above rather than restoring them.

## The plan documents

`OXLINT_MIGRATION_INVESTIGATION.md`, `OXLINT_MIGRATION_TLDR.md`, `OXLINT_SIDE_BY_SIDE_PLAN.md`,
`OXLINT_MIGRATION_STEPS.md` and `OXLINT_RULE_TEST_SUITE_PLAN.md` at the repo root carry the
measurements, the decisions and the remaining checklist. Start with `OXLINT_MIGRATION_STEPS.md` if
what you want is the order of work.

## Deleted 2026-08-25

Nine files whose subject no longer exists: `naming-codemod.py` and `wire-codemod.py` (the directive
wrapper removed the need for twin suppression comments, so there is nothing to codemod),
`compareLintResults.ts` (superseded by `compareFullRepo.py`), `compareReactCompiler.mjs` (verified
Oxlint's native `react/*` per-check rules, which `rc/*` replaced), `reactCompilerVariants.py`,
`compareReactCompilerNative.py` and `measureReactCompilerCost.sh` (they measured a sidecar-versus-native
trade whose two subjects are both gone: `rh/` was deleted and 1.79.0 split the aggregate rule), and
`native-vs-sidecar-probe/{native,sidecar}.oxlintrc.json`. None was wired into `package.json`, so no
command changed. The three `.tsx` fixtures in `native-vs-sidecar-probe/` stay: they are live inputs to
`npm run oxlint-react-compiler-rust`.
