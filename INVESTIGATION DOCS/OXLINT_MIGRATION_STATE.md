# Oxlint Migration: Current State

Branch `feat/oxlint`, with `origin/main` merged at `26cd2cdc8e7` (merge commit `0830c2e28c8`), plus the
bump in `b715f9458f2`. Tool versions (`package.json:365-368`): oxlint **1.88.0**, oxc-transform-react
**0.154.0**, oxlint-tsgolint 7.0.2003, oxfmt ^0.55.0. `.npmrc:14-17` keeps the oxlint and
oxc-transform-react scopes in `min-release-age-exclude` so fresh releases install.

Every number here was measured on 2026-10-14 at this merge with the uncommitted fixes in section 1.1,
using the command in section 8. Numbers that were not re-measured say so. This file holds the current
state only.

---

## 1. Where this stands

One pipeline (`scripts/lint/index.ts`) runs either linter behind the same `Linter -> Processor[] ->
Formatter` ports, each with its own seatbelt baseline. Oxlint passes its baseline over the whole repo in
**41 s**; ESLint takes **632 s** (both cold, 14-core Mac, `compare-oxlint`).

Every rule ESLint enables is enabled in oxlint or has a written reason not to be. Config drift has 0
open differences.

oxlint hides **28** ESLint findings: 23 `react-hooks/refs` multiplicity and 5 accepted override reads
(section 3.2). The merge briefly raised that to 148: upstream `main` deprecated the legacy `MenuItem`
(`899e0fa5736`), and tsgolint skips the deprecated-signature check on self-closing JSX, so 120 usages went
unreported. An in-repo stand-in rule closes all 120 at the same positions as ESLint (section 4.1).

Left to do, in order: TODO in section 6.

### 1.1 Fixes from this merge (uncommitted)

| change | why |
| --- | --- |
| `oxlint.config.mts:344` enables `rulesdir/no-layout-spacing-conditional` | new ESLint rule from main (`config/eslint/eslint.config.mjs:315`); the `rulesdir` jsPlugin auto-loads every file in `eslint-plugin-local-rules/`, so enabling it was all that was needed. 0 findings on both tools |
| `oxlint.config.mts:163-164` ignores `web/cloudflare-worker/**/*` | main added it to ESLint's ignores (standalone package). Without it oxlint linted 27 baseline rows ESLint never sees |
| `config/oxlint/oxlint.seatbelt.tsv` drops the 27 `web/cloudflare-worker/` rows | the seatbelt never prunes rows for files that stop being linted |
| new `eslint-plugin-local-rules/tests/no-layout-spacing-conditional.test.js` | `oxlint-sidecar-coverage` failed 37/38 rulesdir without it; it mirrors the espree cases of `tests/unit/NoLayoutSpacingConditionalRuleTest.ts`. Now 38/38 and replayed with parity |
| `oxlint.config.mts:1229` comment: override costs 5 read-site findings (was 6) | measured |
| new `config/oxlint/noDeprecatedSelfClosingJsx.mjs`, hosted as `hosted/no-deprecated-self-closing-jsx` (`config/oxlint/plugins/hosted-rules.mjs:92`), on at `oxlint.config.mts:1066`, off beside `typescript/no-deprecated` at `:1231` | the `MenuItem` workaround, section 4.1 |
| `config/oxlint/ruleNames.mjs:57` `HOSTED_RULE_ESLINT_ID` (plus `.d.mts` and `oxlint-migration/ruleMap.py`) | lets a repo-written hosted rule report under a full ESLint id, here `@typescript-eslint/no-deprecated` |
| fixture `oxlint-migration/port-probe/fixtures/deprecatedSelfClosingJsx{,Card}.tsx` + `fragments/deprecatedJsx.*` | parity evidence for the stand-in; also fails the day tsgolint reports these itself |
| `oxlint-migration/checkConfigDrift.py:53` LEDGER entry | the stand-in is an oxlint-only config key |
| `oxlint.seatbelt.tsv` +69 rows (`SEATBELT_INCREASE=all`) | the 120 recovered `MenuItem` / `RowMenuItem` findings |

---

## 2. What runs today

| check | command | exit | result |
| --- | --- | --- | --- |
| Gate, sharded | `OXLINT_SHARDS=4 npm run lint -- --linter=oxlint --timings` | **0** | nothing above baseline, 41.1 s wall with the stand-in (40.6 s without) |
| Gate, single process | `OXLINT_SHARDS=1 npm run lint -- --linter=oxlint` | **0** | 115 s (before the stand-in) |
| Types | `npm run typecheck` | **0** | includes `oxlint.config.mts` |
| Tooling tests | `npm run test:bun` | 1 | **639 pass / 3 fail**, 47 files. The 3 are the known `syncVersions.sh` git-fixture cases, unrelated to linting |
| Pipeline test | `bun test ... tests/tooling/lintPipeline.test.ts` | **0** | 50 pass, 124 assertions |
| Raw oxlint | `npm run lint-oxlint` | 1 | no seatbelt, prints the whole baseline. Exit 1 by design |
| Whole-repo parity | `npm run compare-oxlint -- --fresh` | **0** | ESLint 3751, oxlint 5077 (section 3) |
| Parity by direction | `npm run oxlint-parity-direction` | **0** | 28 hidden (section 3.2) |
| Config drift | `npm run oxlint-config-drift` | **0** | 47 files, 30 rules differ (7 spelled differently, 23 accepted), **0 open** |
| ESLint directives | `npm run oxlint-eslint-directives` | **0** | 22 / 22 match ESLint 9.36.0 |
| Per-rule fixtures | `npm run oxlint-rule-fixtures` | **0** | 308 entries: 307 identical, 1 pinned (`react/no-did-update-set-state`) |
| Rule inventory | `npm run oxlint-rule-inventory` | **0** | 492 rules (eslint-only 8, oxlint-only 8, shared 476), fixture coverage 303 / 492, 0 unproven |
| Custom rule replay | `npm run oxlint-rule-tester` | **0** | 36 custom rules identical across 494 harvested cases |
| Sidecar coverage | `npm run oxlint-sidecar-coverage` | **0** | core 10/10, hosted 41/41, rulesdir 38/38, hand-hosted 89/89: **195 / 195** |
| Ports | `oxlint-jsx-uses-port`, `oxlint-locale-compare-port`, `oxlint-react-compiler-gate`, `oxlint-react-compiler-rust`, `oxlint-rule-availability` | **0** each | unchanged behavior |

Everything above except the single-process gate and the five port scripts was rerun after the stand-in
landed. The ESLint report was not regenerated after it, because nothing ESLint reads changed (the
fixtures sit under the ignored `oxlint-migration/`). Timings from 2026-10-14 afternoon are unreliable:
load average was about 29 on 14 cores from unrelated processes, and the `compare-oxlint` oxlint leg took
100-116 s against 41 s earlier in the day.

Do not run these concurrently. `compareFullRepo.sh` rewrites `/tmp/oxlint-full.json` and
`/tmp/eslint-full.json`, and other scripts read both; a half-written file fails with `JSONDecodeError`.
`compare-oxlint` without `--fresh` reuses those cached reports.

The `rtk` hook rewrites `npm run lint` output and prints `ESLint output (JSON parse failed ...)` for an
oxlint run on explicit files. Use `rtk proxy npm run lint -- --linter=oxlint <files>`; the real exit is 0.

### 2.1 How the sharded run works

`OxlintLinter.run` (`scripts/lint/oxlint/OxlintLinter.ts`) lists files with `oxlint --debug=files`, then
runs N JS-plugin shards (`--threads=1`, every Nth file) plus one type-aware process in parallel, retries
a dead leg once, and merges per file. JS plugins run on one Node thread per process (oxc#26621, still
open at 1.88.0), so processes are the only way to use more cores. N is `OXLINT_SHARDS`, else
`min(cores / 2, (available memory - 10 GB) / 2 GB)`. It execs `node_modules/.bin/oxlint` directly, never
`npx`, because Linux caps one argv element at 128 KB and `sh -c` with a file list fails with `E2BIG`.

---

## 3. Parity

### 3.1 Findings per rule, whole repo

Both legs run through `scripts/lint/index.ts --format=json` with `SEATBELT_DISABLE=1`, over 10398
tracked lintable files.

| rule | eslint | oxlint | delta | reading |
| --- | ---: | ---: | ---: | --- |
| `@typescript-eslint/no-unsafe-type-assertion` | 1886 | 1945 | +59 | tsgolint infers stricter than TS 6. Kept, safe direction |
| `@typescript-eslint/no-deprecated` | 512 | 752 | +240 | oxlint adds write sites (typescript-eslint#10643, 243 `originalMessage`); hides 5 (override). Includes the 120 from the stand-in (section 4.1) |
| `@typescript-eslint/no-unnecessary-type-assertion` | 0 | 799 | +799 | TS 6 vs tsgo TS 7 inference |
| `no-restricted-imports` | 593 | 593 | 0 | parity |
| `no-restricted-syntax` | 319 | 319 | 0 | parity |
| `react-hooks/refs` | 207 | 188 | -19 | duplicate collapsing plus 3 locations (section 4.2) |
| `react-hooks/set-state-in-effect` | 117 | 117 | 0 | parity |
| `import/no-cycle` | 0 | 126 | +126 | ESLint's copy is inert; being reduced by the no-cycle PR series |
| `react-hooks/preserve-manual-memoization` | 4 | 47 | +43 | bridge over-reports, hides nothing |
| `react-hooks/purity` | 0 | 28 | +28 | `Date` during render, 20 files, kept on purpose (section 4.3) |
| `rulesdir/no-raw-typography` | 44 | 44 | 0 | parity |
| `rulesdir/no-onyx-connect` | 30 | 30 | 0 | parity |
| `rulesdir/no-default-id-values` | 21 | 21 | 0 | parity |
| `import/no-named-as-default` | 0 | 13 | +13 | oxlint finds more |
| `rulesdir/no-direct-personal-details-list` | 9 | 9 | 0 | parity |
| `react-hooks/immutability` | 6 | 7 | +1 | bridge, hides nothing |
| `@typescript-eslint/no-unsafe-return` | 0 | 8 | +8 | tsgolint strictness |
| `no-unsafe-optional-chaining` | 0 | 5 | +5 | oxlint-only |
| `unicorn/prefer-at` | 0 | 4 | +4 | stands in for `rulesdir/prefer-at` |
| 15 more rules | 3 | 22 | +19 | 1-2 oxlint-only findings each; `static-components` 2/2 and `exhaustive-deps` 1/1 at parity |
| **totals** | **3751** | **5077** | **+1326** | |

### 3.2 Which way the error points

An oxlint-only finding makes the gate stricter, which is harmless. An ESLint finding oxlint lacks is a
check that silently stops the day oxlint becomes blocking. `npm run oxlint-parity-direction` cuts by
(file, rule, count), the seatbelt's granularity:

```
(file, rule) pairs identical      1950 pairs, 3606 findings
findings oxlint adds (safe)       +1354
findings oxlint hides                28
3751 + 1354 - 28 = 5077
```

| hidden | rule | cause | blocks Phase 3? |
| ---: | --- | --- | --- |
| 5 | `no-deprecated`, `getReportTransactions` in 4 `src/libs/actions/` files | inside the deliberate 83-file override (`oxlint.config.mts:1142-1231`), accepted cost written beside it | no |
| 23 | `react-hooks/refs`, 10 files | duplicate collapsing, plus 3 locations missed entirely (section 4.2) | no, explained |

### 3.3 Config coverage

```
eslint=484   oxlint=484   shared=476
ESLint-only with a port plan: 8      unexplained: 0
Oxlint-only extras: 8 (arrow-body-style, hosted/no-deprecated-self-closing-jsx, jsdoc/check-tag-names,
                       jsdoc/require-param, jsdoc/require-param-type, no-unexpected-multiline,
                       prefer-regex-literals, unicorn/prefer-at)
```

The one new ESLint rule since the last merge is `rulesdir/no-layout-spacing-conditional`, now shared.
The 8 ESLint-only rules, plans in `oxlint-migration/ruleMap.py` `PORT_PLAN`:

| rule | plan | real loss |
| --- | --- | --- |
| `rulesdir/boolean-conditional-rendering` | **blocked**, needs the `&&` operand type; jsPlugins get no type info | **yes** |
| `rulesdir/prefer-at` | superseded in part by `unicorn/prefer-at` | partial, loses plain `arr[0]` |
| `no-invalid-this` | skipped, bridge throws; TS covered by `noImplicitThis` | about none |
| `progress/activate`, `react-hooks/component-hook-factories`, `react-hooks/config`, `react-hooks/gating`, `react/jsx-filename-extension` | nothing to port (dead, stub, or handled) | none |

### 3.4 Seatbelt baselines

| baseline | rows | grandfathered | live |
| --- | ---: | ---: | ---: |
| `config/eslint/eslint.seatbelt.tsv` | 2008 | 3751 | 3751 |
| `config/oxlint/oxlint.seatbelt.tsv` | 2599 | 5077 | 5077 |

Both exact. The seatbelt tightens but never increases or prunes, so every merge from `main` needs a
manual `SEATBELT_INCREASE=all` pass (done in `b715f9458f2`) and a check for rows on files that stopped
being linted (the cloudflare rows in section 1.1). `lintPipeline.test.ts` fails if a baseline rule id is
no longer produced by the enabled config.

### 3.5 Config drift notes

`checkConfigDrift.py` compares settings on 47 probe files. Its blind spots: it does not expand ESLint
`extends:` presets, and `no-restricted-imports` bans that fire only outside the probe set are invisible
to it. The two bans oxlint spells differently (`OnyxUtils` path, `config/eslint/eslint.config.mjs:733`;
`HeaderWithBackButton`, two `group` entries at `oxlint.config.mts:103-104` because oxlint matches
paths exactly) are confirmed by the whole-repo total instead: `no-restricted-imports` 593 / 593.

The `scripts/**` and `.github/**` override that turns off the five `no-unsafe-*` rules carries weight:
without it tsgolint adds about 695 findings ESLint does not report (not re-measured at this merge).

---

## 4. Open questions

### 4.1 `no-deprecated` on self-closing JSX: tsgolint gap, closed by a stand-in rule

**Root cause:** `isNodeCalleeOfParent` in tsgolint's `internal/rules/no_deprecated/no_deprecated.go:34-54`
treats a JSX tag as a call only under `KindJsxOpeningElement`. The TS AST gives `<X />` its own kind,
`KindJsxSelfClosingElement`, so a self-closing tag never reaches `getCallLikeDeprecation`, which is what
checks the resolved signature's `@deprecated`. typescript-eslint works on ESTree, where both forms are
`JSXOpeningElement`, so it catches both. A tag whose own symbol is `@deprecated` (`<Legacy />`) is still
caught through the plain symbol path, which is why `MenuItemWithTopDescription` matches 148 / 148.

`MenuItem` hits exactly this: `@deprecated` sits on the inner component
(`src/components/MenuItem/MenuItem.tsx:433`), the exported `MenuItem` is `Object.assign(LegacyMenuItem, ...)`
(`index.ts:56`), so only the signature is deprecated, and every usage in the repo is self-closing
(0 `</MenuItem>`).

Probe (`/tmp/depprobe`, not in the repo), `@deprecated function A`, `declare const B: typeof A & {Root}`:

| usage | typescript-eslint | tsgolint 7.0.2003 / 7.0.2004 |
| --- | --- | --- |
| `<B />` | reports | **misses** |
| `<B></B>` | reports | reports |
| `<B.Root />` | silent | silent |

**Stand-in:** `config/oxlint/noDeprecatedSelfClosingJsx.mjs`, a type-free jsPlugin rule hosted as
`hosted/no-deprecated-self-closing-jsx`:

- reports only self-closing `<X />` of a component listed in its options (`oxlint.config.mts:1066`,
  today `src/components/MenuItem`, default import), since tsgolint already reports `<X></X>`;
- matches the import by resolved module, so both `@components/MenuItem` (214 imports) and `./MenuItem`
  (17) count; aliases come from `tsconfig.json` `paths`;
- follows simple local aliases (`const RowMenuItem = cond ? MenuItem : ...`, `MergeProviderCard.tsx:110`);
- reports under `@typescript-eslint/no-deprecated` (`HOSTED_RULE_ESLINT_ID`), so `stratify-no-deprecated`
  files it on the same per-symbol seatbelt rows as ESLint, and honors existing
  `eslint-disable ... @typescript-eslint/no-deprecated` comments;
- is on and off in exactly the scopes `typescript/no-deprecated` is.

Measured: ESLint 120 `MenuItem` + `RowMenuItem` findings, oxlint 120, 0 on only one side, matching on
(file, line, column). The fixture was checked red-green: inverting the self-closing test drops oxlint to
0 and fails the entry.

Limits: the component list is manual, so a future component deprecated only through its signature is
missed until it is added; `oxlint-parity-direction` shows that as new hidden `no-deprecated` findings. If
tsgolint fixes self-closing JSX, the fixture fails on an unclaimed `typescript/no-deprecated` finding
(verified by adding `<Card></Card>` to it) and the repo findings double, which is the signal to delete the
stand-in.

### 4.2 `react-hooks/refs`, 207 vs 188

Mostly duplicate collapsing: the React Compiler emits some diagnostics several times at one location
and the two builds keep different copies (139 ESLint locations, 140 oxlint). Three locations the bridge
misses entirely: `__mocks__/react-native-safe-area-context.tsx:28`, `:38`, and
`src/pages/settings/AboutPage/AboutPage.tsx:143`. Unchanged by oxc-transform-react 0.154.0: the only
compiler commits since 0.152.0 are oxc#27495 (suppression-range perf) and oxc#27431 (AST refactor).

### 4.3 `react-hooks/purity`, 0 vs 28: kept on purpose

oxlint's compiler enables `validateNoImpureFunctionsInRender`; all 28 are `Date` read during render
across 20 files. Real impurity ESLint's compiler build misses. Grandfathered, visible as +28 so it can
be cleaned up.

### 4.4 Known upstream quirks (pinned, no action)

- `typescript/no-duplicate-type-constituents` misses structural duplicates (`{a: string} & {a: string}`);
  gap recorded at `oxlint.config.mts:808`, fixture flips when fixed.
- `react/no-did-update-set-state` has no React-version gate in oxlint; pinned `oxlintOnly`.
- `react/rules-of-hooks` is configured under one id and reported as `react-hooks/rules-of-hooks`;
  `config/oxlint/ruleNames.mjs` maps it.
- An unknown plugin name in an override's `plugins` array silently disables some rules;
  `lintPipeline.test.ts` validates every array against oxlint's schema.
- A spec early error makes oxlint skip every rule in the file. 1.87/1.88 add stricter early errors
  (oxc#27220 rejects module syntax in script files), so watch for new parse errors after bumps; none
  appeared at this merge.

### 4.5 What 1.87.0 / 1.88.0 / oxc 0.153-0.154 changed for us

None of our workarounds go away. Nothing gives jsPlugins type info, oxc#26621 is still open, and there
are no rule-id renames or `--format json` changes. Worth knowing:

- oxc#27462 (1.88.0): type-aware diagnostics share one source per file. Upstream measured the oxlint
  process at 30.5 GiB to 0.7 GiB peak RSS on a large repo. Our memory sizing in section 2.1 (about 9 GB
  type-aware leg) was not re-measured.
- oxc#25486: LSP now surfaces config load failures to the editor.
- jsx-a11y fixes (oxc#27302, #27304, #27306) could move counts; nothing moved at this merge.

---

## 5. CI (last measured before this merge, not re-measured)

`.github/workflows/oxlint.yml` runs on `blacksmith-8vcpu-ubuntu-2404` with `OXLINT_SHARDS: 4`
(`oxlint.yml:18,34`), `continue-on-error: true` on the lint step (`:30`), wired into `preDeploy.yml`,
not in `confirmPassingBuild`'s `needs`. Last clean runs: oxlint 54 s (run 35869416331) against ESLint
462 s with a cold cache on 16 vCPU (run 35869416143). A planted `debugger` canary was reported by both
at the same file:line:col (PR #98027). The push-to-`main` steps (`oxlint.yml:47`) have never run.

---

## 6. TODO

1. Commit the section 1.1 fixes.
2. Add any newly deprecated wrapper component to the stand-in's list when `oxlint-parity-direction` shows
   hidden `no-deprecated` findings (section 4.1).
3. After Phase 1 lands, read the first two or three pushes to `main` and confirm `oxlint.seatbelt.tsv`
   tightens once and only once (`oxlint.yml:47` steps have never executed).
4. Explain or close the `refs` gap (section 4.2) before Phase 3.
5. File a tracking issue for `rulesdir/boolean-conditional-rendering` (blocked on typed jsPlugins).
6. On every merge from `main`: `SEATBELT_INCREASE=all`, drop baseline rows for newly ignored paths,
   diff `config/eslint/eslint.config.mjs` for new rules and ignores, and add a
   `eslint-plugin-local-rules/tests/*.test.js` mirror for any new local rule.
7. Optional: re-measure type-aware leg memory after oxc#27462; the shard formula may allow more shards.

Known stale: `oxlint-migration/compareNativeCtxValues.py` reads `.oxlintrc.json`; rewrite before use.

---

## 7. Migration plan

- **Phase 1, next:** merge `feat/oxlint`. Shadow job, non-blocking, own baseline. Exit: one week of clean
  tightening on `main`. Revert: drop the job from `preDeploy.yml`.
- **Phase 2, alongside:** every hidden delta has a chosen path (today: `refs` 23, override 5). Drift stays at 0 open.
- **Phase 3:** remove `continue-on-error`, add `oxlint` to `confirmPassingBuild`, keep ESLint. Re-plant the
  canary once to prove the job fails. Exit: one week with no ESLint finding oxlint hid.
- **Phase 4:** retire ESLint: LSP in editors, drop the job, remove packages (point of no return), delete
  `config/eslint/`, rename the oxlint baseline, accept or replace `boolean-conditional-rendering`.

---

## 8. Reproducing every number here

```bash
OXLINT_SHARDS=4 npm run lint -- --linter=oxlint --timings
npm run typecheck && npm run test:bun
TZ=utc bun test --preload ./scripts/stubReactNative.js --preload ./tests/tooling/setup.ts ./tests/tooling/lintPipeline.test.ts
npm run compare-oxlint -- --fresh          # ~11 min, ESLint leg dominates; must finish before the next line
for s in oxlint-parity-direction oxlint-config-drift oxlint-eslint-directives oxlint-jsx-uses-port \
         oxlint-locale-compare-port oxlint-react-compiler-gate oxlint-react-compiler-rust \
         oxlint-rule-availability oxlint-rule-fixtures oxlint-rule-inventory oxlint-rule-tester \
         oxlint-sidecar-coverage; do
    npm run "$s" >"/tmp/$s.log" 2>&1; printf '%-32s exit=%s\n' "$s" "$?"
done
```
