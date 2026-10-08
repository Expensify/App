# `import/no-cycle`: road to zero

> **2026-09-10 re-baseline.** Parts 1, 1b, 2, 3 and 4 are merged. Parts 5, 6 and 7 are open. Parts 8
> and 9 are pushed with no PR yet. Parts 10 and 11 are new. `main` has moved on and oxlint is now
> **1.82.0** (was 1.80.0), so every number below the scoreboard's historical rows was re-measured from
> scratch against `upstream/main`, last at `ed1f08698dc`. Current `main` is **390 findings / 95 files in
> a single cluster**, unchanged from the earlier `b63843bd645` re-measurement. The pre-part-5 figures in
> the older sections are kept as a record of what each merged PR bought at the time and are not
> comparable to the current baseline.

## Current state, measured 2026-09-10

| State | findings | files | clusters |
| --- | --- | --- | --- |
| `main` (`ed1f08698dc`, parts 1-4 merged) | 390 | 95 | `[95]` |
| `main` + parts 5, 6, 7 (in review) | 254 | 77 | `[75, 2]` |
| `main` + part 8 | 363 | 88 | `[88]` |
| `main` + part 9 | 372 | 91 | `[91]` |
| `main` + part 10 | 376 | 92 | `[92]` |
| `main` + part 11 | 379 | 93 | `[93]` |
| `main` + part 10 + part 11 | 365 | 90 | `[90]` |
| `main` + parts 5-7 + 8 | 229 | 70 | `[68, 2]` |
| `main` + parts 5-7 + 8 + 9 | 218 | 66 | `[64, 2]` |
| **`main` + parts 5-11** | **179** | **58** | `[56, 2]` |

Parts 8, 9, 10 and 11 all move the counter standalone, unlike parts 6 and 7 which were worth almost
nothing until the earlier parts landed. Merge order does not change the final total.

| # | PR | State | Standalone Δ | Files | Stacked Δ on parts 5-9 |
| --- | --- | --- | --- | --- | --- |
| 8 | not opened yet | ready | **-27** | -7 | (already in the 218 row) |
| 9 | not opened yet | ready | **-18** | -4 | (already in the 218 row) |
| 10 | not opened yet | ready | **-14** | -3 | -12 / -3 |
| 11 | not opened yet | ready | **-11** | -2 | **-29 / -5** |

Part 11 is the outlier in the other direction from parts 6 and 7: it is small standalone and large
stacked, because the two edges it cuts are the last cyclic in-edges of the `OptionsListUtils` subtree
once parts 5-9 have landed.

Master tracking doc for the effort to get `Expensify/App` to zero `import/no-cycle` findings.

Every number here was produced by running oxlint 1.80.0 against a real checkout. Nothing is estimated.

- Baseline commit: `upstream/main` at `a7305dc6754`
- Command: `npx oxlint . -c .oxlintrc.no-cycle.json -f json`
- **findings** = one per import statement that sits on a cycle. This is the number CI would report.
- **files** = distinct files with at least one finding.
- **clusters** = sizes of the strongly connected components in the value-import graph of `src/`.

`import type` edges do not count. oxlint's `import/no-cycle` does not follow them, which is why a
type-only extraction is sometimes the cheapest way to break an edge.

---

## Scoreboard

The rows below are **historical**: each was measured against `upstream/main` at `a7305dc6754` with
oxlint 1.80.0, which is the baseline that was current when parts 1 to 7 were written. They record what
each PR bought at the time. For today's numbers see "Current state" above; the two are not comparable
because `main` moved and oxlint changed version.


| # | PR | State | Findings | Δ findings | Files | Δ files | Clusters after |
| --- | --- | --- | --- | --- | --- | --- | --- |
| — | starting point (`main` before part 1) | — | 540 | — | 150 | — | `[118, 15, 7, 6, 2, 2]` |
| 1 | [#99670](https://github.com/Expensify/App/pull/99670) | merged | 482 | **-58** | 131 | -19 | `[99, 15, 7, 6, 2, 2]` |
| 1b | [#100009](https://github.com/Expensify/App/pull/100009) | merged | 482 | **0** | 131 | 0 | `[99, 15, 7, 6, 2, 2]` |
| 2 | [#99768](https://github.com/Expensify/App/pull/99768) | merged | 462 | **-20** | 114 | -17 | `[99, 15]` |
| 3 | [#99910](https://github.com/Expensify/App/pull/99910) | merged | 448 | **-34** | 116 | -15 | `[99, 7, 6, 2, 2]` |
| 4 | [#100028](https://github.com/Expensify/App/pull/100028) | merged | 431 | **-51** | 124 | -7 | `[92, 15, 7, 6, 2, 2]` |
| 5 | [#100029](https://github.com/Expensify/App/pull/100029) | in review | 431 | **-51** | 128 | -3 | `[94, 15, 7, 6, 2, 2]` |
| 6 | [#100164](https://github.com/Expensify/App/pull/100164) | in review | 476 | **-6** (-51 stacked) | 131 | 0 (-9 stacked) | `[99, 15, 7, 6, 2, 2]` |
| 7 | [#100165](https://github.com/Expensify/App/pull/100165) | in review | 481 | **-1** (-36 stacked) | 131 | 0 (-6 stacked) | `[99, 15, 7, 6, 2, 2]` |
| | **all of 1b + 2 + 3 + 4 + 5 stacked on `main`** | | **330** | **-152** | **89** | **-42** | `[87, 2]` |
| | **+ 6** | | **279** | **-203** | **80** | **-51** | `[78, 2]` |
| | **+ 6 + 7** | | **243** | **-239** | **74** | **-57** | `[72, 2]` |

Parts 1b, 2, 3, 4 and 5 were each measured **individually merged into `a7305dc6754`**, so the Δ column
is what that PR alone buys. The stacked row is also a real oxlint run, not arithmetic: all five branches
merged into `a7305dc6754` give 330 / 89.

Parts 1b, 2, 3 and 4 are exactly additive (482 - 20 - 34 - 51 = 377) because each touches a different
region. Part 5 is the exception: alone it is -51, but stacked after part 4 it only adds -47, because the
two cuts share four paths through `LoginUtils` and `PersonalDetailsUtils`. Merge order still does not
change the final total.

Part 1 was measured at its real merge commit `f362ba018be`: parent `60ee64a188b` gives 540 / 150, the
merge itself gives 482 / 131.

Cumulative once parts 1-5 land: **540 -> 330, -38.9%**, and 150 -> 89 files.
Cumulative once parts 1-7 land: **540 -> 243, -55.0%**, and 150 -> 74 files.

**Parts 6 and 7 are worth almost nothing on their own** (-6 and -1) and a lot stacked (-51 and -36).
They cut edges that only become load-bearing after the earlier parts remove the parallel paths around
them. Their Δ column above shows both figures. Every other part's Δ is the same standalone or stacked.

---

## Part 1 — `libs/API` / `libs/Middleware` registration

[#99670](https://github.com/Expensify/App/pull/99670) · merged · branch `fix/no-cycle-api-middleware-registration` · 9 files, +173 / -61

**540 -> 482 findings (-58), 150 -> 131 files.** Biggest single win so far.

`libs/API/makeRequest.ts` imported the middleware barrel, and every middleware imported back into
`libs/API`. The PR moves middleware registration out of the barrel into an explicit
`src/libs/Middleware/register.ts` called from `src/setup/index.ts`, so the barrel no longer pulls the
middleware implementations at import time.

Touched: `src/libs/API/makeRequest.ts`, `src/libs/Middleware/index.ts`,
`src/libs/Middleware/register.ts` (new), `src/setup/index.ts`, `.storybook/preview.tsx`, plus 4 test
files.

The big cluster drops 118 -> 99. One file, `src/libs/merge/HRUtils.ts`, enters the graph as a side
effect; net is still -19 files.

## Part 1b — follow up: register middlewares explicitly in tests

[#100009](https://github.com/Expensify/App/pull/100009) · in review · branch `fix/no-cycle-part1b-register-middlewares-explicitly` · 8 files, +69 / -37

**482 -> 482 findings (0), 131 -> 131 files.**

This one buys zero findings and that is expected. It is the test-side follow up to part 1: test setups
and `.storybook/preview.tsx` now call the explicit registration helper instead of relying on the
barrel's side effect. It exists so part 1's structure holds, not to move the counter.

Touched: `src/libs/Middleware/register.ts`, `src/setup/index.ts`, `.storybook/preview.tsx`,
`tests/utils/TestHelper.ts`, and 4 test files.

## Part 2 — four independent small clusters

[#99768](https://github.com/Expensify/App/pull/99768) · in review · branch `fix/no-cycle-pr2-small-clusters` · 13 files, +131 / -98

**482 -> 462 findings (-20), 131 -> 114 files.** Best files-per-line ratio of the whole series.

Four unrelated small cycles, each broken by extracting a leaf module or a context file:

| Cycle | Fix |
| --- | --- |
| `components/Text.tsx` <-> `libs/EmojiUtils.tsx` | `containsOnlyCustomEmoji` moves to new `libs/CustomEmojiUtils.ts` |
| `libs/GPSDraftDetailsUtils` <-> `libs/actions/GPSDraftDetails` | shared point helpers move to new `libs/GPSPointUtils.ts` |
| `AccountingContext/index.tsx` <-> `accounting/utils.tsx` | context objects move to new `AccountingContext/contexts.ts` |
| `MultifactorAuthentication/config/scenarios/ChangePIN` <-> `MultifactorAuthentication/Context` | scenario stops importing the context hook |

Clusters go `[99, 15, 7, 6, 2, 2]` -> `[99, 15]`. Four of the six cycle clusters in the repo disappear
entirely.

17 files leave the graph: the whole `MultifactorAuthentication/Context` + `config` subtree (7 files),
all four `ConnectTo*Flow` components, `Text.tsx`, `EmojiUtils`, both `GPSDraftDetails` modules, and
both `AccountingContext` files.

## Part 3 — `libs/Log` stops importing `libs/Network`

[#99910](https://github.com/Expensify/App/pull/99910) · in review · branch `fix/no-cycle-part3-log-network` · 5 files, +91 / -65

**482 -> 448 findings (-34), 131 -> 116 files.** Kills the entire 15-file network cluster.

`libs/Log` imported `post` from `libs/Network`. `libs/Network` imports `MainQueue`, and `MainQueue`
imports `Request`, `SequentialQueue` and `NetworkStore`, all three of which import `libs/Log`. That
single edge held the whole network subsystem inside the graph.

Every log packet is queued with `shouldProcessImmediately: false`, so `post` pushed and returned
without ever calling `MainQueue.process`. So the fix is a split, not a rewrite:

- New `src/libs/Network/MainQueueStore.ts`: the queue array and `push` / `clear` / `getAll` move
  verbatim out of `MainQueue`, plus `replaceAll` and `enqueue`. Imports nothing that reaches `libs/Log`.
- `MainQueue.ts` keeps `canMakeRequest`, `replay`, `process` and re-exports the moved functions, so
  every consumer is untouched.
- `Network/index.ts`: `post` is `enqueue(...)` plus the `processMainQueue()` kick.
- `Log.ts` imports `enqueue` instead of `post`.

No function bodies change.

15 files leave: `Network/index`, `Network/MainQueue`, `Network/NetworkStore`,
`Network/SequentialQueue`, `Network/enhanceParameters`, `NetworkState`, `Request`, `RequestThrottle`,
`HttpUtils`, `Log`, `actions/PersistedRequests`, `actions/QueuedOnyxUpdates`,
`telemetry/ReceiptObservability`, and both `Prefetch` modules.

Detail, including the two independent code reviews: `OXLINT_NO_CYCLE_PR3_PLAN.md`.

## Part 4 — `libs/LoginUtils` stops importing `actions/Session` and `Navigation`

[#100028](https://github.com/Expensify/App/pull/100028) · in review · branch `fix/no-cycle-part4-loginutils-saml` · 4 files, +25 / -15

**482 -> 431 findings (-51), 131 -> 124 files.** Biggest win available for the smallest diff.

`src/libs/LoginUtils.ts` is 150 lines of pure string helpers plus one function,
`handleSAMLLoginError`, which is the only reason the file imports `./actions/Session`
(`clearSignInData`, `setAccountError`) and `./Navigation/Navigation`. Those two imports drag 42 direct
LoginUtils importers, and everything downstream of them, into the graph.

`handleSAMLLoginError` has exactly two call sites, both in `src/pages/signin/SAMLSignInPage/`. So it
moves to a new `src/pages/signin/SAMLSignInPage/handleSAMLLoginError.ts`, verbatim, and `LoginUtils`
drops the three now-unused imports. `index.native.tsx` already imported `Navigation`, `ROUTES`,
`clearSignInData` and `setAccountError` for other reasons, so nothing new lands there.

The big cluster drops 99 -> 92. 7 files leave: `LoginUtils`, `PersonalDetailsUtils`, `ValidationUtils`,
`CardUtils`, `WorkspaceReportFieldUtils`, `actions/Plaid`, `getWorkspaceCreatedAnalyticsEvent`.

This also makes two earlier roadmap items free. `PersonalDetailsUtils -> LoginUtils` (-28 on its own)
and `CardUtils -> PersonalDetailsUtils` (-12 on its own) are both subsumed: cutting either after this
removes 0 additional findings.

Detail and full verification table: `OXLINT_NO_CYCLE_PR4_PLAN.md`. Patch: `OXLINT_NO_CYCLE_PR4.patch`.

## Part 5 — `actions/IOU/SearchUpdate` stops importing `SearchUIUtils`

[#100029](https://github.com/Expensify/App/pull/100029) · in review · branch `fix/no-cycle-part5-search` · 4 files, +511 / -477

**482 -> 431 findings (-51), 131 -> 128 files.** Big cluster 99 -> 94.

`SearchUpdate.ts:5` imported `{getSuggestedSearches, isEligibleForStatus}` from `SearchUIUtils`, a
7108-line file that imports most of the action layer. Both functions and their private dependencies
only need `@src/CONST`, `./SearchQueryUtils` and types, so they move verbatim into a new
`src/libs/SearchSuggestionUtils.ts`, along with `createTopSearchMenuItem`,
`expenseStatusActionMapping`, `isValidExpenseStatus`, `SEARCH_TYPE_MENU_ICON_NAMES` and the
`SearchTypeMenuItem` / `SearchKey` / `ExpenseStatusPredicate` types.

`SearchUIUtils` imports them back and keeps re-exporting the public ones, so its export surface is
unchanged and no consumer besides `SearchUpdate` moves.

4 files leave (`interceptAnonymousUser`, `ReportPrimaryActionUtils`, `TransactionPreviewUtils`,
`actions/IOU/RejectMoneyRequest`) and the new module enters, so the net is -3.

Two things a reviewer should know:

1. **The new module is itself in a cycle.** It needs the query builders from `SearchQueryUtils`, which
   is in the big cluster. That is why the result is -51 and not the -53 a naive edge cut predicts.
2. **One test changed.** `tests/unit/Search/SearchUIUtilsTest.ts` used
   `jest.mock('@userActions/Search', () => ({...jest.requireActual(...), fn: jest.fn()}))`. The
   `requireActual` re-enters the `SearchUIUtils` <-> `actions/Search` cycle, which makes Jest evaluate
   the factory twice and hand out two different mocks. On `main` it evaluates once and passes by luck;
   changing the load order breaks the luck. The mock is now memoised in a hoisted `var`. Production code
   at `SearchUIUtils.ts:2403` is untouched, and green-red-green confirms the test still guards it.

Detail, including the rejected companion cut: `OXLINT_NO_CYCLE_PR5_PLAN.md`. Patch:
`OXLINT_NO_CYCLE_PR5.patch`.

## Part 6 — `ReportUtils` stops importing the IOU / Policy / Report action modules

[#100164](https://github.com/Expensify/App/pull/100164) · draft · branch `fix/no-cycle-part6-reportutils-flows` · 13 files, +478 / -438

**-51 findings and -9 files stacked on parts 1-5** (330 -> 279). Only **-6** on bare `main`.

Three functions in `ReportUtils` are not utilities: `getAddExpenseDropdownOptions` (77 lines),
`createDraftWorkspaceAndNavigateToConfirmationScreen` (43) and
`createDraftTransactionAndNavigateToParticipantSelector` (224). They write Onyx and navigate. Between
them they are the only reason `ReportUtils` imports four action modules, so moving all three verbatim
into a new `src/libs/actions/IOU/StartExpenseFlows.ts` cuts four edges at once:
`actions/IOU/MoneyRequest`, `actions/Policy/Policy`, `actions/Report` and `actions/TransactionEdit`.

The new module imports `ReportUtils`, but nothing in the cluster imports it back, so it is a sink and is
not itself reported.

One thing is not a pure move: the code reads `deprecatedCurrentUserEmail` and
`deprecatedCurrentUserAccountID`, two module-scope `let`s that `ReportUtils` mirrors from Onyx. Exporting
them trips `import/no-mutable-exports`, so `ReportUtils` now exposes `getDeprecatedCurrentUserEmail()`
and `getDeprecatedCurrentUserAccountID()` accessors instead.

9 files leave: the whole `actions/IOU` expense-creation chain (`MoneyRequest`, `TrackExpense`,
`DeleteMoneyRequest`, `NavigationHelpers`), plus `actions/TransactionEdit`,
`actions/ClearReportActionErrors`, `PerDiemRequestUtils` and two navigation helpers.

Detail: `OXLINT_NO_CYCLE_PR6_PLAN.md`. Patch: `OXLINT_NO_CYCLE_PR6.patch`.

## Part 7 — `actions/IOU/ReportWorkflow` stops importing `actions/IOU/PayMoneyRequest`

[#100165](https://github.com/Expensify/App/pull/100165) · draft · branch `fix/no-cycle-part7-merge-pay-onyx-data` · 3 files, +37 / -29

**-36 findings and -6 files stacked on parts 1-6** (279 -> 243). Only **-1** on bare `main`.

Best value-per-line in the series. `mergeAdditionalPayOnyxData` is an 18-line pure generic function
whose only dependency is a type that needs nothing at runtime. It moves into a true leaf,
`src/libs/actions/IOU/mergeAdditionalPayOnyxData.ts`, together with `AdditionalPayOnyxData` and
`SearchPayOnyxKey`. `ReportWorkflow` then has no import of `PayMoneyRequest` at all, and
`PayMoneyRequest` re-exports both so `actions/Search` is untouched.

`actions/IOU/PayMoneyRequest` leaves the graph.

Detail, including the rejected `PayMoneyRequest -> MoneyRequestBuilder` companion:
`OXLINT_NO_CYCLE_PR7_PLAN.md`. Patch: `OXLINT_NO_CYCLE_PR7.patch`.

---

## Part 8 — stop importing navigation barrels for the route config and the active route

not opened yet · branch `fix/no-cycle-part8-navigation-barrels` · 5 files, +40 / -30

**-27 findings and -7 files standalone on `main`** (390 -> 363). -25 and -7 stacked behind parts 5-7.

Two independent cases of a light consumer importing a heavy barrel to reach one small thing.

1. `Navigation/helpers/getStateFromPath` imported `{linkingConfig}` from the `linkingConfig` barrel and
   used exactly `linkingConfig.config` on one line. `config` already lives in its own module, which is
   already cycle-free, so this is a one-line repoint. Worth **-18 / -6 files** by itself, the biggest
   single cut available on `main`.
2. `createDynamicRoute` imported the whole `Navigation` barrel to call `Navigation.getActiveRoute()`
   once. That function is 15 lines over `navigationRef` and `getPathFromState`, neither in a cycle, so
   it moves to a new `Navigation/helpers/getActiveRoute.ts`. `Navigation.ts` imports it back and keeps
   exporting it. Worth **-7 / -1** more.

One test changes: `createDynamicRouteTests` retargets its `jest.mock` from `@libs/Navigation/Navigation`
to the new leaf, because the real leaf pulls the 164 KB route config in behind `getPathFromState` and the
test mocks `@src/ROUTES` only partially. Green-red-green checked.

Detail: `OXLINT_NO_CYCLE_PR8_PLAN.md`. Patch: `OXLINT_NO_CYCLE_PR8.patch`.

## Part 9 — three pure helpers move into leaf modules

not opened yet · branch `fix/no-cycle-part9-leaf-extractions` · 10 files, +87 / -60

**-18 findings and -4 files standalone on `main`** (390 -> 372).

Same shape as part 2: three unrelated small cycles, each broken by moving one pure function to a leaf.

| Edge cut | Moved to | Δ |
| --- | --- | --- |
| `fileDownload/DownloadUtils -> actions/Link` | `openExternalLink.ts` (3 lines over `asyncOpenURL`) | -7, -3 files |
| `ReportUtils -> PaymentUtils` | `getBankAccountLastFourDigits.ts` (12 lines, zero value imports) | -4, -1 file |
| `SearchUIUtils -> TransactionPreviewUtils` | `getIOUPayerAndReceiver.ts` (14 lines, two consumers, both repointed) | -7, -1 file |

Two more candidates were built, measured and then dropped: the `PolicyUtils` predicates (-4) break
`ReportUtilsTest`, whose `jest.mock` factory spreads `jest.requireActual` and enumerates the new
re-export getter mid-initialization; and `getCardFeedsForDisplay` (-6) drags four helpers plus
`CardUtils` along. Both are written up so nobody repeats the work.

Detail: `OXLINT_NO_CYCLE_PR9_PLAN.md`. Patch: `OXLINT_NO_CYCLE_PR9.patch`.

---

## Part 10 — the dependency-free core of `ReportActionsUtils` moves into two leaf modules

not opened yet · branch `fix/no-cycle-part10-report-action-readers` · 11 files, +96 / -58

**-14 findings and -3 files standalone on `main`** (390 -> 376). -12 / -3 stacked on parts 5-9
(218 -> 206).

`ReportActionsUtils.ts` is a 5,200 line hub with 29 cyclic in-edges, but nine of its exports need nothing
from that graph. Two new leaves take them:

- `src/libs/ReportActionTypeGuards.ts`: `isActionOfType`, `isMoneyRequestAction`,
  `isModifiedExpenseAction`, `isDynamicExternalWorkflowApproveFailedAction`. `CONST` and types only.
- `src/libs/ReportActionMessageUtils.ts`: `getReportActionMessage`, `getOriginalMessage`,
  `getReportActionHtml`, `getReportActionText`, `getTextFromHtml`. `@libs/Parser` and
  `ReportActionFollowupUtils/stripFollowupListFromHtml`, neither in any cycle.

`ReportActionsUtils` imports both back and keeps exporting all nine names. Eight consumers that imported
**only** those names are repointed: `AgentRuleChangeLogUtils`, `SpendRuleChangeLogUtils`, `IOUUtils`,
`ModifiedExpenseMessage`, `NextStepUtils`, `actions/Report/DeleteReport`, `TaskUtils`,
`Notification/LocalNotification/BrowserNotifications`.

The re-export is safe here because no test spreads `jest.requireActual('@libs/ReportActionsUtils')`; the
two suites that mock it pass object literals. `TransactionUtils/index` was left out: it also needs
`getReportAction`, which reads the module-scope `allReportActions` Onyx cache.

Detail: `OXLINT_NO_CYCLE_PR10_PLAN.md`. Patch: `OXLINT_NO_CYCLE_PR10.patch`.

---

## Part 11 — policy category Onyx builders and `sortAlphabetically` move into leaf modules

not opened yet · branch `fix/no-cycle-part11-policy-category-and-sort` · 25 files, +206 / -177

**-11 findings and -2 files standalone on `main`** (390 -> 379). **-29 / -5 stacked on parts 5-9**
(218 -> 189), the largest stacked payoff since part 5.

| Edge cut | Moved to | Δ standalone |
| --- | --- | --- |
| `actions/Policy/Policy -> actions/Policy/Category` | `actions/Policy/PolicyCategoriesOnyxData.ts` (3 optimistic builders + `DEFAULT_MCC_GROUP`) | -6, -1 file |
| `AttendeeUtils -> OptionsListUtils` | `sortAlphabetically.ts` (13 lines, one type-only import) | -5, -1 file |

The gap between -11 standalone and -29 stacked is the point: after parts 5-9 those two are the last
cyclic in-edges of the `OptionsListUtils` subtree, so cutting them drops `getChatPreviewParts`,
`AttendeeUtils` and the `OptionsListUtils` barrel out of the cluster together.

**`sortAlphabetically` could not be re-exported.** Keeping the re-export in `OptionsListUtils` reproduced
the part-9 hazard exactly: `tests/unit/useGroupChatDraftParticipantSyncTest.ts` and
`tests/ui/BaseVacationDelegateSelectionComponentTest.tsx` both spread
`jest.requireActual('@libs/OptionsListUtils')` and hit
`TypeError: Cannot read properties of undefined (reading 'default')` at the re-export getter, because the
barrel was mid-initialization at its line 16 (`@libs/Navigation/Navigation`) and the leaf's require at
line 70 had not run. So the leaf is canonical instead: `OptionsListUtils` stops exporting the name and
all 15 consumers import it directly. That is the wider diff, but it does not depend on require ordering.

Three candidates were measured and dropped: `OptionsListUtils/index -> getChatPreviewParts` (-5, the
barrel genuinely calls it), `MoneyRequestBuilder -> Policy/Tag` (-6 standalone but **0** stacked, and the
leaf would need `PolicyUtils.getSortedTagKeys` and `TransactionUtils.getTagArrayFromName` extracted
first) and `actions/Report -> Policy/Member` (-5, the builders need `ReportUtils` and `PolicyUtils` and
`Member.ts` uses them internally, so the leaf lands back inside the cluster).

Detail: `OXLINT_NO_CYCLE_PR11_PLAN.md`. Patch: `OXLINT_NO_CYCLE_PR11.patch`.

---

## What is left after parts 5 to 11 land

**179 findings across 58 files**, in two clusters: a 56-file `ReportUtils` / `actions` mesh and the
isolated 2-cycle between `SearchUIUtils` and `actions/Search`.

Ranked by findings removed if cut alone, measured on the graph with parts 5-11 applied:

| Edge | Δ findings | Δ files | Shape |
| --- | --- | --- | --- |
| `actions/Session -> actions/Link` | -9 | -2 | `{buildOldDotURL, openExternalLink}`. Part 9 already extracted `openExternalLink`, so only `buildOldDotURL` is left, but it reads `currentUserEmail` from module scope, so it needs the accessor treatment part 6 used |
| `ReportUtils -> actions/IOU/ReportWorkflow` | -9 | -1 | `{canApproveIOU, canIOUBePaid, canSubmitReport, ...}`, the util layer asking the action layer for permissions |
| `actions/Report -> actions/Transaction` | -8 | -1 | |
| `actions/Policy/Policy -> actions/Task` | -8 | -1 | newly load-bearing: part 11 removed the parallel path through `actions/Policy/Category` |
| `Notification/LocalNotification -> .../BrowserNotifications` | -5 | -2 | platform barrel importing its own web implementation, which still reaches `ReportUtils` |
| `actions/Report -> Notification/LocalNotification` | -5 | -2 | pairs with the row above |
| `Navigation/helpers/getAdaptedStateFromPath -> ReportUtils` | -5 | -1 | |
| `actions/Welcome/index -> Navigation/Navigation` | -5 | -1 | real navigation actions, not extractable to a leaf |
| `actions/Report -> actions/Policy/Member` | -5 | -1 | `buildAddMembersToWorkspaceOnyxData` + `buildRoomMembersOnyxData`; needs `ReportUtils` and `PolicyUtils`, see part 11's dropped candidates |
| `SearchQueryUtils -> CardFeedUtils` | -4 | -2 | `getCardFeedsForDisplay`, dropped in part 9 as too large |
| `actions/HybridApp/index -> Navigation/Navigation` | -4 | -2 | uses only `Navigation.clearPreloadedRoutes`, a 3-line `navigationRef` wrapper. Leaf-extractable the same way part 8 extracted `getActiveRoute`, so this is the cheapest remaining nav cut |
| `actions/connections/index -> PolicyUtils` | -4 | -2 | `import * as PolicyUtils`, needs enumerating first |
| `actions/SignInRedirect -> actions/HybridApp/index` | -4 | -2 | |

Two things stand out for the next parts:

- **`actions/HybridApp/index -> Navigation/Navigation` is the last cheap navigation cut.** Three more
  consumers (`Navigation/helpers/getReportURLForCurrentContext`,
  `Navigation/helpers/getReportRouteForCurrentContext`, `PageHTMLCapture/index`) use **only**
  `Navigation.getActiveRoute`, which part 8 already extracted to
  `src/libs/Navigation/helpers/getActiveRoute.ts`. Repointing those three plus a new
  `clearPreloadedRoutes` leaf is worth **-11 / -5** on the parts-5-9 graph, but three of the four edges
  depend on part 8's leaf existing, so that PR has to stack on part 8 rather than branch off `main`.
- **`ReportUtils -> actions/IOU/Hold` is worth -58** once the top four edges above are gone (it is only
  worth -1 today). That is the single largest lever left in the graph, and it is the part 6 pattern again:
  move the action-shaped functions out of the util file.

`actions/Report/index.ts` still has 21 findings on its own, more than any other file.

### Full path to zero

A greedy feedback-arc-set over the post-part-11 graph reaches an acyclic graph after **23 more edges**,
down from 24 after part 9, 34 after part 7 and 39 after part 5. Upper bound; the true minimum may be
lower, never higher.

---

## Branches

| Branch | What it holds |
| --- | --- |
| `feat/oxlint` | the oxlint migration only: `.oxlintrc.json`, `config/oxlint/**`, `oxlint-migration/**`, `package.json` wiring, and 7 `src/` files fixed purely to satisfy oxlint rules. **No no-cycle work.** |
| `feat/oxlint-nocycle-all` | `upstream/main` with parts 5, 6, 7, 8, 9, 10 and 11 merged in (it was reset off `feat/oxlint` on 2026-09-10 because parts 1-4 are upstream now and their duplicate-change conflicts made the merge unusable). Local only, never pushed. Not for review; it exists so the whole series can be measured in one checkout and so the next part can be planned against the real end state. Checked out as a workspace at `~/conductor/workspaces/expensify-app/nocycle-all`. |
| `fix/no-cycle-part10-report-action-readers` | part 10, off `upstream/main` at `ed1f08698dc`. Not pushed yet. |
| `fix/no-cycle-part11-policy-category-and-sort` | part 11, off `upstream/main` at `ed1f08698dc`. Not pushed yet. |

Parts 10 and 11 were developed in a throwaway worktree at `~/conductor/nocycle-dev` (outside the
Conductor workspaces directory, so it does not confuse the sidebar) with `node_modules` cloned from
`kyoto` via `cp -Rc` (APFS clone-on-write; a symlinked `node_modules` makes Jest fail with
`TurboModuleRegistry.getEnforcing(...): 'ReactNativeHybridApp' could not be found`).

Rebuild the tracking branch after any part changes. Note `submodule.recurse` is `true` in this repo and
the `Mobile-Expensify` submodule is not initialised in a hand-made worktree, so every git command that
touches the index needs `-c submodule.recurse=false` or it fails with
`fatal: not a git repository: .../modules/Mobile-Expensify`:

```
git -c submodule.recurse=false reset --hard upstream/main
for b in fix/no-cycle-part5-search \
         fix/no-cycle-part6-reportutils-flows \
         fix/no-cycle-part7-merge-pay-onyx-data \
         fix/no-cycle-part8-navigation-barrels \
         fix/no-cycle-part9-leaf-extractions \
         fix/no-cycle-part10-report-action-readers \
         fix/no-cycle-part11-policy-category-and-sort; do
  git -c submodule.recurse=false merge --no-edit $b
done
```

Only part 5 conflicts (see the `SearchUIUtils.ts` note below). Parts 6 to 11 merge clean.

Historical, measured on `feat/oxlint` at `ba9f018e9dd` (`origin/main` `28464099394` merged in), back
when the tracking branch was still based on `feat/oxlint`:

| Branch | no-cycle findings | files | full oxlint ruleset |
| --- | --- | --- | --- |
| `feat/oxlint` | 482 | 131 | 5930 total |
| `feat/oxlint-nocycle-all` (parts 1b-5) | 330 | 89 | 5778 total |
| `feat/oxlint-nocycle-all` (parts 1b-7) | **242** | **74** | **5689** total |

For parts 1b-5 the full-ruleset total dropped by exactly 152, the same as the no-cycle drop, so
`import/no-cycle` was the only rule those PRs moved.

For parts 1b-7 the full ruleset drops 5930 -> 5689, one more than the no-cycle drop of 240. The extra
one is `typescript(no-unsafe-type-assertion)`, 2014 -> 2013: part 6 carries an explicit
`eslint-disable-next-line` for the `as Transaction` assertion it moves, and oxlint honours the
directive. No other rule moves.

The tracking branch reports **242** where the same seven parts stacked on plain `main` report **243**.
The one-finding difference comes from `feat/oxlint`'s own lint-compliance edits to `src/`, not from any
of the no-cycle parts.

Part 5 conflicts with `SearchUIUtils.ts` on current `main` (`main` added the `VIOLATIONS_BY_SUBMITTER`
suggested search and the `UserEye` icon inside blocks that part 5 moves out). The resolution used on the
tracking branch is to re-derive `SearchSuggestionUtils.ts` from `main`'s current `SearchUIUtils.ts`
rather than hand-merge; the extraction's dependency set is unchanged, so the same line ranges still
apply.

---

## Measurement setup

`.oxlintrc.no-cycle.json` is untracked and lives at the repo root. It is derived from `feat/oxlint`'s
`.oxlintrc.json`: same `ignorePatterns`, `categories.correctness` off, `import/no-cycle` the only rule
on, and no JS plugin block so it loads on `main` (`main` has no `.oxlintrc.json` yet, and
`feat/oxlint`'s version loads `./config/oxlint/plugins/core-rules.mjs`, which is not on `main`).

Without `node_modules`, `tsconfig.json` cannot be loaded (it extends `expo/tsconfig.base`), oxlint
resolves no `@libs/...` alias, and the rule reports 0. Same reason ESLint's copy of the rule reports 0.
Any measurement worktree needs `node_modules` present or symlinked.

The per-edge Δ figures come from an SCC simulator built off the cycle paths in oxlint's own JSON
output. Its accuracy is established, not assumed: it reproduces `main` exactly
(482 / 131 / `[99, 15, 7, 6, 2, 2]`), and it predicted part 3's applied result (448 / 116), part 4's
applied result (431 / 124) and part 5's applied result (431 / 128) before any of those changes were
measured. Every figure in the scoreboard is a real oxlint run; the simulator is only used to rank edges
that have not been implemented yet.

## Other docs in this folder

| File | What it is |
| --- | --- |
| `OXLINT_NO_CYCLE_FINDINGS.md` | raw dump of every finding |
| `OXLINT_NO_CYCLE_ISSUE.md` | the GitHub issue text |
| `OXLINT_NO_CYCLE_PR2_PLAN.md` / `_DESCRIPTION.md` | part 2 detail |
| `OXLINT_NO_CYCLE_PR3_PLAN.md` / `_DESCRIPTION.md` | part 3 detail, including two code reviews |
| `OXLINT_NO_CYCLE_PR4_PLAN.md` | part 4 detail and verification |
| `OXLINT_NO_CYCLE_PR4.patch` | part 4, applyable with `git apply` |
| `OXLINT_NO_CYCLE_PR5_PLAN.md` | part 5 detail, the test change, and the rejected companion cut |
| `OXLINT_NO_CYCLE_PR5.patch` | part 5, applyable with `git apply` |
| `OXLINT_NO_CYCLE_PR6_PLAN.md` | part 6 detail and verification |
| `OXLINT_NO_CYCLE_PR6.patch` | part 6, applyable with `git apply` |
| `OXLINT_NO_CYCLE_PR7_PLAN.md` | part 7 detail and the rejected companion cut |
| `OXLINT_NO_CYCLE_PR7.patch` | part 7, applyable with `git apply` |
| `OXLINT_NO_CYCLE_PR8_PLAN.md` | part 8 detail, verification, and the test retarget |
| `OXLINT_NO_CYCLE_PR8.patch` | part 8, applyable with `git apply` |
| `OXLINT_NO_CYCLE_PR9_PLAN.md` | part 9 detail and two candidates built then dropped |
| `OXLINT_NO_CYCLE_PR9.patch` | part 9, applyable with `git apply` |
| `OXLINT_NO_CYCLE_PR10_PLAN.md` | part 10 detail, verification, and why the re-export is safe there |
| `OXLINT_NO_CYCLE_PR10.patch` | part 10, applyable with `git apply` |
| `OXLINT_NO_CYCLE_PR11_PLAN.md` | part 11 detail, the re-export failure, and three dropped candidates |
| `OXLINT_NO_CYCLE_PR11.patch` | part 11, applyable with `git apply` |

Only the part 8 to 11 plans and patches are actually present in this folder; the part 2 to 7 rows above
predate a cleanup and their files are not here.
