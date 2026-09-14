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

What is left is evidence. 294 native Rust rules have no repo-local proof they match ESLint's
behaviour on this codebase, the CI shadow job has never executed on `main`, and three rules disagree
on findings for reasons nobody has written down.

---

## 2. What runs today

| check | command | result |
| --- | --- | --- |
| Oxlint, whole repo, through the pipeline | `npm run lint -- --linter=oxlint` | exit 0, nothing above baseline, **35 to 52 s** |
| Types | `npm run typecheck` | **passed** |
| Tooling tests | `npm run test:bun` | **587 pass / 0 fail**, 46 files |
| Per-rule parity, ported rules | `OXPROBE_TAG=_x compareFixtures.py --filter=sb` | **12 rules, all parity** |
| Whole-repo parity | `bash oxlint-migration/compareFullRepo.sh --fresh` | section 3 |
| Per-rule parity | `python3 oxlint-migration/port-probe/compareFixtures.py` | section 4 |
| Sidecar rule evidence | `python3 oxlint-migration/checkSidecarCoverage.py` | **192 / 192 covered** |
| Config drift | `npm run oxlint-config-drift` | 30 rules differ, **11 open**, nothing outside the LEDGER |

CI: `.github/workflows/oxlint.yml`, wired into `preDeploy.yml` and deliberately absent from
`confirmPassingBuild`'s `needs`. The lint step carries `continue-on-error: true`. On a push to
`main` it auto-commits its own tightened baseline, as `lint.yml` does for ESLint.

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
45 files, 30 rules differ
  5 spelled differently, same behavior
 14 accepted differences
 11 open differences, nobody chose these
```

The 11 open, grouped:

**An unexplained `scripts/**` and `.github/**` override, 6 rules.** Off in `.oxlintrc.json`, error in
ESLint, and the override carries no comment in a file whose stated convention is that every "off"
says why: `@typescript-eslint/no-unsafe-argument`, `no-unsafe-assignment`, `no-unsafe-call`,
`no-unsafe-member-access`, `no-unsafe-return`, and `no-throw-literal`.

**Oxlint is more lenient by option, 3 rules.** Each passes an option whose ESLint default is
stricter: `no-redeclare` `{builtinGlobals: false}`, `prefer-const` `{ignoreReadBeforeAssign: true}`,
`prefer-promise-reject-errors` `{allowEmptyReject: true}`.

**Two one-offs.**

- `no-restricted-globals`: a different option set in the same scope. For `.github/actions/**/*.ts`
  and `.github/libs/**/*.ts` ESLint bans `module`, `__dirname` and `__filename` because those
  sources are bundled as real ESM and a CJS idiom builds fine then throws a `ReferenceError` in CI
  (`config/eslint/eslint.config.mjs:588-613`). Oxlint applies the airbnb browser list there instead
  and loses all three bans.
- `react-hooks/rules-of-hooks`: scope difference over 2 files.

None currently produces a finding on either tool. They are latent, and they go live the moment
ESLint is removed.

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

**Native Rust rules, 294, covered only by Oxlint's own upstream test suite.** `listAllRules.py`
gives the split:

```
Totals: 494 rules -- eslint-only=7, oxlint-only=12, shared=475
Oxlint side: js:@dword-design/import-alias=1, js:core=10, js:hosted=40, js:lodash=1, js:rc=12,
             js:react-native-a11y=13, js:report-name-utils=1, js:rulesdir=36, js:testing-library=8,
             js:you-dont-need-lodash-underscore=71, native=294
```

There is no repo-local evidence that any given native rule behaves the way ESLint's equivalent does
on this codebase. This is the only item with a deadline: expected counts can only be pinned while
ESLint still exists to produce them.

---

## 5. Open questions

### 5.1 `@typescript-eslint/no-deprecated`, 231 vs 399

168 extra Oxlint findings, unaccounted for. The obvious cause is ruled out: `.oxlintrc.json:567`
enables `hosted/no-deprecated` alongside `typescript/no-deprecated`, but the hosted one is
**`react`**/no-deprecated (`config/oxlint/ruleNames.mjs`), a different rule about class lifecycle
methods. All 399 diagnostics carry `typescript(no-deprecated)` and there are 0 duplicates at the
same `file:line:column`. So 168 real extra detections that nobody has explained. Already baselined,
so not a gate risk.

### 5.2 `react-hooks/set-state-in-effect`, 127 vs 47

The only row in the whole table where ESLint finds more than Oxlint. 80 findings Oxlint misses. Not
a harness artifact: `RULES_SUPPRESSED_BY_REACT_COMPILER`
(`config/reactCompiler/suppressedRules.mjs:14`) holds only
`react/jsx-no-constructed-context-values` and `rulesdir/no-inline-useOnyx-selector`, so
`ReactCompilerFilter` never touched this rule on either side.

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

### 5.4 The oxlint shard merge turns one empty shard into a whole-run failure

Intermittent and reproduced: `npm run lint -- --linter=oxlint` failed three times in a row with

```
ESLint output (JSON parse failed: EOF while parsing a value at line 1 column 0)
```

then passed seven times in a row later the same day with no code change. The string is serde_json's
empty-input error, compiled into oxlint's own binary, so one of oxlint's child processes died and
wrote nothing. `OxlintLinter.ts:172` treats stdout with no `{` as fatal, and `mergeShardResults`
(`OxlintLinter.ts:82-86`) then returns that fatal shard and discards every healthy shard's findings.
A SIGKILLed child writes no stderr, so nothing explains it.

Shard count is re-derived per invocation from `os.freemem()` (`OxlintLinter.ts:56-59`), and measured
peak demand is about 9.7 GB across 18 processes at 6 shards against a `SHARD_MEM_BUDGET_GB = 2`
assumption, so memory pressure from a concurrent ESLint run is the likely trigger. `--shards=1`
never hit it. Owned by whoever owns `scripts/lint/oxlint/OxlintLinter.ts`, not diagnosed further
here.

### 5.5 `listAllRules.py` undercounts fixtures

It reports `Fixture coverage: 56/494` because it reads `fixtures.manifest.json` only.
`checkSidecarCoverage.py` merges `fragments/*.manifest.json` too and reports 192/192. Cosmetic, but
the two numbers look contradictory in a report. One-line fix.

---

## 6. TODO

Ordered by what blocks what.

1. **Land the shadow job on `main` and watch it.** It has never executed there. Auto-tightening of
   `oxlint.seatbelt.tsv` and the push race against `lint.yml` are both unobserved. Analysis says the
   race is benign (separate runners, separate checkouts, different files, loser rejected
   non-fast-forward and swallowed by `continue-on-error`, so one tightening is delayed by one merge
   rather than lost), which is the documented behaviour of the existing ESLint job. Unproven in
   practice.
2. **Evidence for the 294 native rules.** Deadline-bound. Write fixtures highest-finding-count
   first.
3. **Drive the 11 open config differences to zero** (section 3.5). Each either gets ported or gets a
   LEDGER entry naming who decided to drop it and why. Cheapest first: comment or delete the
   `scripts/**` / `.github/**` override, then align the 3 lenient option sets.
4. **Explain `set-state-in-effect` 127 vs 47** (section 5.2). Sample the 80 ESLint-only findings. If
   Oxlint's rule genuinely misses them, the flip would ship a coverage regression.
5. **Explain `no-deprecated` 231 vs 399** (section 5.1). Sample 10 Oxlint-only findings, confirm each
   is a genuine deprecated usage, record the cause in `PORT_PLAN`.
6. **`rulesdir/boolean-conditional-rendering`** has no replacement and no tracking issue.
7. **Every merge from `main` needs a manual `SEATBELT_INCREASE=all` pass.** The seatbelt auto-tightens
   but never auto-increases.
8. **The shard fatal-on-empty-stdout path** (section 5.4). Intermittent today, a blocker the day
   the job becomes required.
9. **`listAllRules.py` fixture count** (section 5.5).

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

`compareFullRepo.sh` caches both reports in `/tmp`; omit `--fresh` to re-read them without the
seven-minute ESLint leg.
