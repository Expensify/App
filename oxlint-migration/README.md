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
interest one of those stages filters run the repo's own gate,
`bun scripts/lint/index.ts --linter=eslint --format=json`, rather than reimplementing the stages or
reapplying them to a raw report. The rest read raw ESLint and say so at the call site.

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
| `checkParityDirection.py` | splits that report by direction: findings oxlint adds are safe, findings it hides are checks that stop running when the gate flips | `npm run oxlint-parity-direction` |
| `port-probe/` | one fixture per rule that deliberately violates it, so a rule with no findings in this repo is still proven to run | `npm run oxlint-rule-fixtures` |
| `rule-tester/` | harvests the upstream `RuleTester` cases for the custom rules and replays them as real files through both tools | `npm run oxlint-rule-tester` |
| `checkSidecarCoverage.py` | fails if any hand-hosted sidecar rule has no fixture, replayed case or probe | `npm run oxlint-sidecar-coverage` |
| `checkReactCompilerGate.py` | asserts the gate suppresses exactly what the ESLint side suppresses | `npm run oxlint-react-compiler-gate` |
| `checkLocaleComparePort.py` | asserts the type-free rule rewrite matches the type-aware original, receiver shape by receiver shape | `npm run oxlint-locale-compare-port` |
| `checkJsxUsesPort.py` | the two rules that cannot report anything, asserted by outcome instead | `npm run oxlint-jsx-uses-port` |
| `listAllRules.py` | inventory of every rule either tool enables, and why anything is off | `npm run oxlint-rule-inventory`, `npm run oxlint-rule-availability` |
| `ruleMap.py` | the shared rule-id map and `PORT_PLAN`; imported by most of the above | library |
| `compareNativeCtxValues.py`, `eslint-ctx-values-rule.mjs` | reproduction for the two upstream bugs in Oxlint's native `react/jsx-no-constructed-context-values` (wrong anchor line, no component-scope check) | on demand, until both are filed |

## The React Compiler rules report partially, on purpose

All twelve `rc/*` rules are on. Some of them report less (or more) than ESLint does, and they are
left on anyway: a rule whose count differs shows up as a number in `npm run compare-oxlint`, while a
rule switched off reads exactly like a clean codebase.

Measured whole-repo on `oxc-transform-react` 0.152.0 and oxlint 1.86.0:

| rule | ESLint | oxlint | |
| --- | --- | --- | --- |
| `set-state-in-effect` | 120 | 120 | exact, same locations |
| `refs` | 210 | 189 | bridge collapses ESLint's duplicate reports (see below) |
| `purity` | 0 | 35 | all `Date`-during-render; ESLint's compiler build misses them, kept on purpose |
| `preserve-manual-memoization` | 4 | 54 | over-reports through the bridge |
| `immutability` | 6 | 7 | one extra |
| `globals` | 0 | 1 | one extra |
| `static-components` | 2 | 2 | exact |
| the other five | 0 | 0 | latent in this repo |

`config/oxlint/reactCompilerRust.mjs` passes `reportDiagnostics: true` to `transformSync`, which is
what lets any of them report the non-fatal categories at all. `oxc-transform-react` 0.148.0 had
narrowed `result.errors` to *fatal* React Compiler diagnostics (oxc-project/oxc#26128, tracked as
#26318), so on the default a component whose only problem is a non-blocking validation like
`set-state-in-effect` returned nothing; the old `panicThreshold: "all_errors"` workaround made every
diagnostic fatal to recover them, at the cost of aborting on the first failing function per file.
`oxc-project/oxc#26624`, shipped in 0.152.0, added the opt-in `reportDiagnostics` that returns the
recoverable diagnostics without forcing them fatal, so the bridge now sees every finding at full
speed. `checkReactCompilerRust.mjs` pins this: `TwoComponents.tsx` reports all its findings in one
pass, as ESLint does, and each of the twelve fixtures reports on its own.

Why the bridge and not oxlint's native `react/*` compiler rules: oxc-project/oxc#26277, a
`disable-next-line` naming `react/exhaustive-deps` or `react/rules-of-hooks` silences every native
compiler diagnostic in the enclosing component, and the native rules do not expose the compiler's
`eslintSuppressionRules` option to turn that off. This config does not use the native `react/*` rules
for the compiler checks precisely because of that; `config/oxlint/reactCompilerRust.mjs` sets
`eslintSuppressionRules: []` to defeat it on the bridge. #26277 is open with no PR.

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
