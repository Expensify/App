# React unnecessary-effect lint evaluation

## Result

Adding `eslint-plugin-react-you-might-not-need-an-effect@1.0.2` produces **1,134 new errors in 365 files**. The **complete App lint run confirms exactly 1,134 blocking errors, all from this plugin, with no other blocking errors**. Both the full scan and an independent plugin-only scan evaluated **10,623 files**, with **zero fatal/parser errors**. The plugin-only scan took **28.8 seconds**. All nine rules are enabled as errors. No application behavior was changed, and no violations were added to the seatbelt baseline.

These are **diagnostic counts, not confirmed bugs or distinct unnecessary effects**. The findings include actionable simplifications, repeated reports on the same effect, and questionable suggestions for legitimate synchronization code.

## Setup

Both branches are named `rory/react-unnecessary-effects`, created from freshly fetched `origin/main` on October 21, 2026:

| Repository              | Worktree                                                             | Base commit                                |
| ----------------------- | -------------------------------------------------------------------- | ------------------------------------------ |
| eslint-config-expensify | `/Users/rory/Expensidev/.worktrees/eslint-react-unnecessary-effects` | `2577c93efcc669be2b0a9ff5b9e5109f6f95f835` |
| App                     | `/Users/rory/Expensidev/App-Worktrees/react-unnecessary-effects`     | `ab211f45777e507eabf6b562e072529adba3477f` |

The shared React config registers the plugin and imports its strict rule set, **without importing the preset's browser globals** into React Native consumers. Regression tests verify rule severity, derived-state detection, necessary external synchronization, and the absence of added browser globals.

The initial evaluation installed the shared-config worktree as a local copy using `--install-links`. The App draft instead pins the same config to GitHub commit [`9362673c0e7e45fbe6b664445d0c1da32c75de71`](https://github.com/Expensify/eslint-config-expensify/commit/9362673c0e7e45fbe6b664445d0c1da32c75de71), from [the shared-config draft PR](https://github.com/Expensify/eslint-config-expensify/pull/200), so installation does not depend on a local worktree path. Its existing TypeScript 6 compiler-API patch was updated to target config version `4.0.11` instead of `4.0.8`, without changing the patch contents. Without that patch, an existing type-aware Expensify rule crashes against TypeScript 7. The upstream config's manifest is still `4.0.11`; its base lockfile already says `4.0.12`. That pre-existing mismatch was preserved, and no release version was invented.

**This is an evaluation integration using an unreleased commit, not a final registry dependency pin.** After releasing the shared config, replace the commit pin with the published version and update the patch filename accordingly. The App draft intentionally fails lint on the new findings until a rollout strategy is agreed.

## New errors by rule

All rule names below use the prefix `react-you-might-not-need-an-effect/`.

| Rule                                |    Errors |       Affected files |
| ----------------------------------- | --------: | -------------------: |
| `no-event-handler`                  |       865 |                  320 |
| `no-adjust-state-on-prop-change`    |        83 |                   47 |
| `no-pass-data-to-parent`            |        58 |                   47 |
| `no-derived-state`                  |        56 |                   35 |
| `no-chain-state-updates`            |        48 |                   26 |
| `no-initialize-state`               |         9 |                    9 |
| `no-external-store-subscription`    |         7 |                    6 |
| `no-pass-live-state-to-parent`      |         5 |                    4 |
| `no-reset-all-state-on-prop-change` |         3 |                    3 |
| **Total**                           | **1,134** | **365 unique files** |

Affected-file counts overlap between rules. None of the new diagnostics provides an automatic fix.

### Distribution

| Area                             | Errors | Files |
| -------------------------------- | -----: | ----: |
| `src/components`                 |    506 |   145 |
| `src/pages`                      |    429 |   146 |
| `src/hooks`                      |    180 |    60 |
| `src/libs`                       |     11 |     7 |
| Other source locations and tests |      8 |     7 |

The largest individual files are:

| File                                                                        | Errors |
| --------------------------------------------------------------------------- | -----: |
| `src/components/MoneyRequestConfirmationList/DistanceRequestController.tsx` |     37 |
| `src/pages/ReimbursementAccount/ReimbursementAccountPage.tsx`               |     37 |
| `src/components/Search/index.tsx`                                           |     28 |
| `src/components/Search/SearchWriteActionsProvider.tsx`                      |     26 |
| `src/components/Search/hooks/useStableOptimisticSortedData.ts`              |     20 |

Those five files account for only 148 errors (13.1%), so remediation is spread broadly across the application. Within pages, workspace settings account for 119 findings and money-request pages for 74.

## Findings and migration insights

### 1. The dominant rule is a broad heuristic, not an event-provenance analysis

`no-event-handler` is **76.3% of all new errors**. In version 1.0.2, its implementation reports prop/state references in an effect's `if` conditions; it does not establish that the effect was caused by a user event. Multiple guarded references can produce many diagnostics for one effect.

- `src/hooks/useBackfillWhenNoVisibleActions.ts:61` receives **12 reports** for one effect that backfills missing chat history. Its conditions include offline status, loading status, and pagination cursors. Moving this only into a click handler would miss data/network-driven transitions.
- `src/components/Search/SearchWriteActionsProvider.tsx:156` receives **20 reports across two rules** in one selection-reconciliation effect. This is synchronizing selection with changing search data, not necessarily an event handler in disguise.

**Recommendation:** review this rule separately before making it a blocking requirement. Treat its output as triage candidates; do not mechanically move all flagged code to event handlers.

### 2. Straightforward derived-state cleanup exists, but historical/user-editable state needs care

- **Good cleanup candidate:** `src/components/Lottie/index.tsx:42` copies `source.file` into `animationFile` in an effect. Inspecting the component suggests this can become a render-time value, avoiding an intermediate stale render.
- **Not a simple computed value:** `src/components/MapView/useDistanceUnit.ts:14` intentionally follows the incoming unit only until the user toggles it. Replacing the state with `unit` would remove the user's override semantics.
- **Historical cache:** `src/components/Search/hooks/useStableOptimisticSortedData.ts:91` receives **20 reports across five rules**. Its cached item survives temporary disappearance from a stale server snapshot and participates in rollback timing. That history cannot simply be recomputed from the latest `sortedData`.

**Recommendation:** prioritize pure prop-to-state copies; separately review editable drafts, optimistic caches, and last-known-good values. A reducer or a clearer ownership boundary may be appropriate for some complex cases, but the lint suggestion alone does not establish the correct replacement.

A second useful review candidate is `src/components/TimePicker/TimePicker.tsx:694`: an effect formats local time state and calls the parent's `onInputChange`. A controlled value or coordinated updates in input handlers could simplify that ownership boundary. Its existing dependency suppression also makes the synchronization worth reviewing, although a behavior-preserving rewrite must cover every input path.

### 3. Some data-flow messages are misleading

`src/components/AddPaymentMethodMenu.tsx:91` is told to fetch `CONST` in the parent. The argument is actually `CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT`, a constant passed to `onItemSelected`, not fetched child-owned data. The surrounding effect also waits for Onyx loading to finish and automatically selects the only payment option.

The `no-pass-data-to-parent` message at `src/components/AutoCompleteSuggestions/index.tsx:112` expands a long, repeatedly listed chain of upstream identifiers. This is difficult to act on and suggests opportunities for upstream deduplication and better recognition of imported constants.

**Recommendation:** consider upstream bug reports for constant classification and diagnostic readability. Do not equate all 58 reports with misplaced fetching.

### 4. Subscription and initialization suggestions need platform/lifecycle review

- `src/components/MapView/useAnimatedLeadingDirectionCoordinate.ts:119` and `:130` are flagged as external-store subscriptions, but the effect starts/cancels an animation. `useSyncExternalStore` is not an automatic replacement for animation lifecycle management.
- `src/hooks/useEarlyRenewalPeriod.ts:43` is flagged by both initialization and external-store rules. It schedules future clock-boundary updates; removing the effect would remove those future updates. A shared clock store could be a deliberate redesign, not a one-line fix.
- `src/hooks/useTextWithMiddleEllipsis.ts:106` measures a DOM element and subscribes to resize events. A dedicated measurement/subscription hook may help, but preserving post-mount measurement and cleanup is essential.
- `src/components/ConnectToXeroFlow/index.native.tsx:21` is an initialization candidate, but its mount-only modal/navigation flow depends on 2FA state. Review navigation and modal timing before changing the initial state.

### 5. Counts overstate the number of independent remediation tasks

An AST grouping of the plugin-only results associates 1,132 diagnostics with **484 inline `useEffect` call sites**; two reports are outside those inline ranges. **100 call sites are reported by multiple new rules.** This grouping uses containing call ranges and is an approximation, not a formal count of independently removable effects.

Fixing or redesigning one effect can eliminate several diagnostics at once. Conversely, an effect may contain necessary synchronization alongside a redundant state update; removing the entire effect is not always correct.

A separate cross-check enabled the existing `react-hooks/set-state-in-effect` rule alongside the nine new rules. It found **117 existing diagnostics**, all already grandfathered by seatbelt. Of the 484 grouped effect call sites reported by the new plugin, **77 also have that existing-rule diagnostic and 407 do not**. At file level, 293 of the 365 affected files have no existing `set-state-in-effect` diagnostic. This demonstrates additional coverage beyond the existing rule, but not that every additional report is actionable. The cross-check reproduced the same 1,134 plugin diagnostics with no parser failures.

### 6. This plugin is not a complete effect audit

Version 1.0.2 recognizes `useEffect` and `React.useEffect` by name, not `useLayoutEffect`, aliased effect imports, or custom effect wrappers. Its state analysis specifically recognizes React `useState`; external/custom stores are not automatically treated as local React state. Several rules also skip effects with cleanup. Correct dependency arrays remain important, as the plugin documentation notes.

The manual examples above are a qualitative sample, not a measured false-positive rate. No runtime correctness or performance improvement was claimed or benchmarked.

## Validation and full-lint status

The completed full run separates existing findings from the plugin's impact:

| Stage                                         |    Errors | Grandfathered warnings |
| --------------------------------------------- | --------: | ---------------------: |
| Raw ESLint output                             |     5,090 |                      0 |
| After React Compiler filtering                |     4,756 |                      0 |
| After deprecation classification and seatbelt | **1,134** |              **3,622** |

Of the 5,090 raw errors, **1,134 are new-plugin errors and 3,956 are from existing rules**. React Compiler filtering removes 334 existing-rule findings; seatbelt grandfathers the remaining 3,622. No new-plugin diagnostics are suppressed or grandfathered. The standard `npm run lint` wrapper exits **1**, as expected for the 1,134 newly introduced blocking errors; it does not crash.

- Shared config: `npm run lint` passes; **36 test suites / 479 tests pass**.
- App tooling suite: **604 tests pass**.
- App `lint-changed` passes with no changed lintable application/config files; `spell-changed` passes.
- Changed package files and patch documentation pass Prettier; patch metadata validation and patch application pass.
- The initial full lint crashed because installing the new config displaced App's version-specific TypeScript API patch; updating the patch target fixes that compatibility issue.
- A subsequent full run with four workers and an 8 GB heap exhausted a worker heap before complete JSON output. The serial 24 GB retry completed, producing the full results above. The follow-up standard wrapper run reused that ESLint cache and took **18.4 seconds** overall (9.1 seconds ESLint, 5.1 seconds React Compiler filtering, 4.0 seconds deprecation classification). This is a cached verification time, not a cold-run benchmark; 24 GB is the successful configured heap ceiling, not a measured minimum requirement.
- After replacing the local dependency with the pushed GitHub commit pin and applying the unchanged TypeScript API patch, the standard full lint wrapper reproduced **exactly 1,134 errors**, completing in **17.0 seconds** with the cache. This confirms the draft's installable dependency pin matches the locally evaluated configuration.
- App pins Node `26.12.1` / npm `11.20.0`; these runs use installed Node `26.7.0` / npm `11.19.0`, with Bun `1.3.14`. Installation explicitly relaxed engine enforcement for this local evaluation. Results should be rerun on the pinned toolchain before release.
- No React component or type changes were made, so native builds, browser flows, the full application Jest suite, Storybook, and application typechecking were not run.

## Reproduction and artifacts

From the shared-config worktree:

```sh
npm install --ignore-scripts
npm run lint
npm test -- --runInBand
```

From the App worktree:

```sh
npm install --save-dev --save-exact --ignore-scripts --engine-strict=false 'github:Expensify/eslint-config-expensify#9362673c0e7e45fbe6b664445d0c1da32c75de71'
npx patch-package --patch-dir patches/eslint-config-expensify --error-on-fail
NODE_OPTIONS=--max_old_space_size=24576 ESLINT_CONCURRENCY=off npm run lint -- --timings
```

The plugin-only cross-check preserves App's configuration, target discovery, and ignores, disables other rules, and turns off type-aware parser projects because this plugin does not require type information. This avoids conflating existing lint debt with new plugin errors. Existing inline suppressions remain in effect. The runner and results are saved under `/Users/rory/Expensidev/analysis/react-unnecessary-effects/`, including:

- `full/summary.json`: counts after every standard App processing stage, plus rule/file breakdowns.
- `full/violations.csv`: all 1,134 new-plugin diagnostics, one row each.
- `full/processed.json`: processed diagnostics including grandfathered existing findings.
- `app-lint.log`, `app-raw.json`, and `app-raw.stderr`: standard-wrapper output and raw ESLint evidence.
- `focused-summary.json`, `focused/summary.json`, and `focused/violations.csv`: independent plugin-only cross-check.
- `focused-with-state/summary.json`: comparison with the existing state-in-effect rule.
- `focused-effect-lint.mjs` and `analyze-effect-lint.ts`: the local analysis runners.

## Suggested rollout

1. Keep the strict configuration for evaluation, but triage the high-volume `no-event-handler` and questionable data/subscription reports before enabling them as blockers for every consumer.
2. Start remediation with verified pure derived-state copies and clear state-update chains; preserve user overrides, history, external synchronization, and offline behavior.
3. If adopting App-wide now, generate a **rule-scoped** seatbelt baseline using the existing runner, rather than adding hundreds of inline disables or using `SEATBELT_INCREASE=ALL`. This evaluation intentionally leaves the baseline unchanged so its impact is visible.
4. Publish the shared config first, replace App's GitHub commit dependency with the released pin, update the existing patch for that version, and rerun on the exact pinned toolchain.
