# oxlint-migration

**Temporary. This whole directory is deleted when ESLint is removed.**

Everything here exists to answer one question: does Oxlint report the same thing ESLint reports? Every
script in here runs both linters and compares them, so none of it has a job once there is only one
linter left. Nothing in the app, in CI's production lint gate, or in `.oxlintrc.json` depends on this
directory. Deleting it is a `git rm -r` plus removing the `oxlint-*` scripts from `package.json`.

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
| `checkReactCompilerGate.py` | asserts the gate suppresses exactly what the ESLint processor suppresses | `npm run oxlint-react-compiler-gate` |
| `checkLocaleComparePort.py` | asserts the type-free rule rewrite matches the type-aware original, receiver shape by receiver shape | `npm run oxlint-locale-compare-port` |
| `checkJsxUsesPort.py` | the two rules that cannot report anything, asserted by outcome instead | `npm run oxlint-jsx-uses-port` |
| `listAllRules.py` | inventory of every rule either tool enables, and why anything is off | `npm run oxlint-rule-inventory`, `npm run oxlint-rule-availability` |
| `ruleMap.py` | the shared rule-id map and `PORT_PLAN`; imported by most of the above | library |
| `naming-codemod.py`, `wire-codemod.py` | one-shot codemod scripts that added the dual suppression comments | already applied |
| `compareNativeCtxValues.py`, `compareReactCompiler*.{py,mjs}`, `measureReactCompilerCost.sh`, `reactCompilerVariants.py` | the React Compiler measurements behind the decision to keep the jsPlugin re-export instead of Oxlint's native aggregate | on demand |

## Files that are records, not inputs

`migration-details.log` (what `npx @oxlint/migrate` skipped and why) and `dep-override-files.json`
(the write-only deprecation file list a codemod emitted into the config) are kept as provenance for
steps that are already applied. Nothing reads them. They die with this directory.

Generated reports are gitignored, not committed: `rule-inventory.json`, `rule-availability.json`,
`dep-cmp.json`, `dep-only-api.json`. Regenerate with the scripts above rather than restoring them.

## The plan documents

`OXLINT_MIGRATION_INVESTIGATION.md`, `OXLINT_MIGRATION_TLDR.md`, `OXLINT_SIDE_BY_SIDE_PLAN.md` and
`OXLINT_RULE_TEST_SUITE_PLAN.md` at the repo root carry the measurements, the decisions and the
remaining checklist.
