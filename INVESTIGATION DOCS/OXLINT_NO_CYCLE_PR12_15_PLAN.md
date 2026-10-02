# `import/no-cycle`: plan for parts 12, 13, 14, 15

Written 2026-09-14. Analysis only — **no project file was changed** to produce it. Companion to
[OXLINT_NO_CYCLE_ROAD_TO_ZERO.md](OXLINT_NO_CYCLE_ROAD_TO_ZERO.md).

## Assumed starting point

Parts 1-11 merged (parts 5, 8, 9, 10, 11 are still in review as of today; this plan assumes they all
land, and that `feat/oxlint` is irrelevant to this series — see the measurement note at the end).

Baseline measured by merging `origin/main` `07dca732efa` with `fix/no-cycle-part5-search-v1`,
`fix/no-cycle-part8-navigation-barrels-v1`, `fix/no-cycle-part9-leaf-extractions-v1`,
`fix/no-cycle-part10-report-action-readers` and `fix/no-cycle-part11-policy-category-and-sort`, then
running oxlint 1.82.0 with `import/no-cycle` as the only rule:

> **181 findings / 58 files / 1 SCC of 56 files + 1 two-file cycle**

For reference, the states between now and then:

| state | findings | files |
| --- | --- | --- |
| `origin/main` today (parts 1-4, 6, 7 merged) | 268 | 84 |
| + parts 5, 8, 9 (in review) | 222 | 67 |
| + parts 10, 11 (not opened yet) | 181 | 58 |

## The four PRs

Sequential, because Δ is attributed in merge order. Every number is a simulator run (validated below),
not arithmetic.

| # | branch (pushed, empty at `origin/main`) | edges cut | this PR | cumulative after |
| --- | --- | --- | --- | --- |
| 12 | `fix/no-cycle-part12-report-action-subscribers` | `IOU/Hold -> Report`, `Task -> Report`, `Session -> Link` | **-55 / -14** | 126 / 44 |
| 13 | `fix/no-cycle-part13-navigation-session-sever` | `linkingConfig/subscribe -> Session`, `getAdaptedStateFromPath -> ReportUtils` | **-37 / -12** | 89 / 32 |
| 14 | `fix/no-cycle-part14-app-policy-draft-leaf` | `actions/App -> actions/Policy/Policy` | **-21 / -6** | 68 / 26 |
| 15 | `fix/no-cycle-part15-reportutils-workflow-reads` | `ReportUtils -> ReportWorkflow`, `ReportUtils -> ViolationsUtils` | **-13 / -2** | 55 / 24 |

**Total: 181 -> 55 findings (-70%), 58 -> 24 files.**

> **Correction, added 2026-09-14 while starting part 12.** The first draft of this plan cut
> `Link.ts -> actions/Report` and claimed -47 / -12. That cut is not implementable: see step 3 and the
> dead-end list. The revised shape cuts `Session -> actions/Link` instead, which measures **better**
> (-55 / -14) and is a real leaf. The Task.ts half also changed shape — the symbols it needs cannot
> become leaves either, so the *callers* move. Both corrections are folded in below.


Parts 12 and 13 cut different edges and are independent, so merge either first; together they are
**-92 / -26**. 14 and 15 only pay off at the figures above once both have landed; standalone on the 181
baseline they are -21/-6 and -8/-1.

### File-disjointness

One file is touched by two PRs (`actions/Session/index.ts`, 330 lines apart — see the matrix at the end).
Nothing else overlaps.

---

## Part 12 — `actions/Report` loses two cyclic action-layer importers, and `Session` stops importing `actions/Link`

`src/libs/actions/Report/index.ts` is a 8,967-line hub with 106 import statements, 22 cyclic out-edges
and 124 names in its export block. Most of those out-edges are only flagged because of **one return
path**: `ReportUtils.ts:108 -> actions/IOU/Hold.ts:35 -> actions/Report/index.ts`. The hub's subscriber
registry is the reason the action layer imports the hub at all.

Three modules in the cycle graph have a cyclic edge *into* the hub, and two of them go for one reason:
the subscriber registry.

| importer | import statement | symbols | verdict |
| --- | --- | --- | --- |
| `src/libs/actions/IOU/Hold.ts:35` | `import {notifyNewAction} from '@userActions/Report';` | 1 | cut it — step 1 |
| `src/libs/actions/Task.ts:45` | `import {getMostRecentReportID, navigateToConciergeChatAndDeleteReport, notifyNewAction, optimisticReportLastData} from './Report';` | 4 | cut it — step 2 |
| `src/libs/actions/Link.ts:42` | `import {doneCheckingPublicRoom, navigateToConciergeChat, openReport} from './Report';` | 3 | **do not cut — see step 3** |

Instead of the `Link.ts` edge, cut `actions/Session/index.ts:1 -> actions/Link.ts`
(`import {buildOldDotURL, openExternalLink} from '@libs/actions/Link'`), which is what makes the
`Link.ts -> hub` edge cyclic in the first place: the return path is
`Link -> Report -> ... -> ReportUtils -> Session -> Link`. Break the last hop and `Link.ts:42` stops being
a finding with no edit to `Link.ts` at all. Measured this way it is **-55 / -14**, eight findings better
than the original plan.

**All three cut statements must disappear completely.** oxlint reports one finding per (file, resolved
module), so a partially-trimmed statement still counts, and the cuts are mutually load-bearing: cutting
`IOU/Hold -> hub` or `Task -> hub` on its own buys **0**. All three together buy -55. One PR or nothing.


### Step 1 — subscriber registry becomes a leaf

`let newActionSubscribers` (hub:796), `subscribeToNewActionEvent` (hub:803-808) and `notifyNewAction`
(hub:811-822, 12 lines, pure over the array) move verbatim to
`src/libs/actions/Report/reportActionSubscribers.ts`. The leaf imports nothing from the hub, so the hub
may keep importing it back for its own calls at hub:1270, 4763 and 5178, and may re-export it.

Repoint the src consumers: `actions/IOU/Hold.ts:35`, `actions/Task.ts:45`, `actions/Chronos.ts:19`,
`actions/IOU/Split.ts:59`, `actions/IOU/PayMoneyRequest.ts:36`, `actions/IOU/TrackExpense.ts:88`,
`actions/IOU/PerDiem.ts`, `actions/IOU/RejectMoneyRequest.ts`, `actions/IOU/SendInvoice.ts`,
`actions/IOU/SendMoney.ts`.

Keep the hub re-export (the leaf is a true leaf, so the part 9 / part 11 mid-initialization getter
hazard does not apply). 25-ish test files mock the hub for `notifyNewAction`; they keep working
untouched.

### Step 2 — `Task.ts` stops importing the hub

`notifyNewAction` is used by `Task.ts` at 434, 1349, 1400, 1493 and 1616 — all five inside just three
functions: `createTaskAndNavigate` (Task.ts:143), `getNavigationUrlOnTaskDelete` (:1334), `deleteTask`
(:1360) and `clearTaskErrors` (:1596).

**Do not move the hub symbols out.** None of them can become a leaf: `getMostRecentReportID`
(hub:5238-5243) calls `findLastAccessedReport`, and `optimisticReportLastData` (hub:5745-5759) calls
`getLastVisibleMessage` and `ReportActionsUtils.getLastVisibleAction` — all inside the SCC, so a leaf
holding them re-enters the cluster and the cycle just relocates. The direction that works is the part 6
one: move the *callers* out of `Task.ts`.

`getNavigationUrlOnTaskDelete`, `deleteTask` and `clearTaskErrors` move verbatim to
`src/libs/actions/Task/TaskDeletion.ts`, which imports the hub (for those three symbols) and `Task.ts`
(for the rest). Legal because nothing inside the SCC imports them — their consumers are UI components
(`components/ReportActionItem/TaskView.tsx`, `TaskPreview.tsx`, `TaskHeaderActionButton.tsx`,
`Search/SearchList/ListItem/TaskListItemRow.tsx`) and `tests/actions/TaskTest.ts`, all outside it. After
the move `Task.ts:45` is gone, and with it the edge.

Repoint `notifyNewAction` at the step 1 leaf inside the moved file, and export the three names from the
new module (`Task.ts`'s export block at 1733-1761 currently carries `deleteTask`, `clearTaskErrors` and
`getNavigationUrlOnTaskDelete`; those three leave it).

### Step 3 — `Session -> actions/Link`, and why `Link.ts -> hub` is left alone

`buildOldDotURL` (`Link.ts:57-79`, 23 lines) moves to a true leaf — its whole closure is
`Environment.getOldDotEnvironmentURL`, `addTrailingForwardSlash` from `@libs/UrlUtils`, and
`currentUserEmail`, which `Link.ts` mirrors at `:46-55`; read it through `getCurrentUserEmail()` from the
existing `src/libs/CurrentUserStore.ts` (part 5/6 accessor pattern; note it returns `null`, so use
`?? ''` to keep `email=` byte-identical). `openExternalLink` is already a leaf at
`src/libs/openExternalLink.ts` — `Session/index.ts:1` repoints to it directly. After that
`Session/index.ts:1` is gone, and `Link.ts:42` stops being cyclic without being touched.
Repoint `tests/actions/SessionTest.ts:57-62`, which mocks `@libs/actions/Link` for `buildOldDotURL` and
asserts on it at 590-591.

Why not cut `Link.ts:42` as first drafted: `Link.ts` would then have to import nothing that reaches the
hub, but `openLink` (393-458) calls `openReportFromDeepLink` (459-660), which needs `openReport`. Any
module holding the deep-link half of the file must import the hub, and `openLink` would import that
module, so the cycle would only move from `Link.ts` to the new file and the finding count would not
change. Cutting it properly means decoupling `openLink` from deep-link handling for the callers, which
touches every URL-opening path in the app — its own PR, and not obviously worth it once this edge stops
being cyclic anyway.

Parts 13-15 must not touch `Link.ts`, `Session/index.ts` or `DeepLinkHandler.tsx` (part 13 does edit
`Session/index.ts`, for `hasAuthToken`; the two edits are ~300 lines apart, so sequence 12 before 13).

### Test hazard — why step 2 gets no re-exports

16 `jest.requireActual('@libs/actions/Report')` spreads across 15 files (`tests/ui/ReportActionMessageEditLayoutTest.tsx:90`,
`tests/ui/ReportActionItemMessageEditTest.tsx:32`, `tests/ui/RecentlyAddedSectionTest.tsx:85`,
`tests/unit/AgentZeroStatusContextTest.ts:41`, `tests/unit/hooks/useEditMessage.test.ts:19`,
`tests/unit/libs/TransactionThreadNavigationUtilsTest.ts:17`, `tests/unit/DeepLinkHandlerTest.tsx:21`,
`tests/actions/ReportTest.ts:117`, `tests/ui/OnboardingPurpose.tsx:43`, `tests/ui/WorkspaceOnboarding.tsx:43`,
`tests/ui/PersonalDetailsOnboarding.tsx:43`, `tests/ui/OnboardingPersonalTrackGoal.tsx:39`,
`tests/ui/components/HeaderViewTest.tsx:43`, `tests/unit/ReportFetchHandlerTest.tsx:33`,
`tests/unit/Search/SearchUIUtilsTest.ts:67`, `tests/unit/inlineEditing/TransactionInlineEdit.test.ts:42`).
Any symbol a leaf must import back from the hub is therefore canonical-leaf-plus-repoint, the part 11
rule.

### Verification

`npx jest ReportTest TaskTest DeepLinkHandlerTest showReportActionNotificationTest HoldTest SplitTest ChronosTest PayMoneyRequestTest TrackExpenseTest`, plus whatever `jest.mock('@userActions/Report')` factories stub the moved names, then the no-cycle run and `npm run typecheck`.

---

## Part 13 — Navigation stops reaching the session layer and `ReportUtils`

Two cuts. Together they sever `Navigation/Navigation.ts` from the whole cluster: with both gone,
`Navigation.ts` has no value path to `ReportUtils`, `actions/Report`, `TaskUtils`, `Welcome`,
`HybridApp`, `PageHTMLCapture`, `navigateFromNotification` or `ReimbursementAccount/navigation`, so the
whole family of "consumer imports the Navigation barrel" edges stops being cyclic for free (those are
the cheap `getActiveRoute` / `clearPreloadedRoutes` / `getActiveRouteWithoutParams` repoints; do **not**
spend a PR on them, they are worth 0 once this lands).

**Cut A — `src/libs/Navigation/linkingConfig/subscribe.ts:1` `import {hasAuthToken} from '@libs/actions/Session'`.**
142 of the 181 reported cycles traverse this edge. `hasAuthToken` is 3 lines (`Session/index.ts:337-339`)
reading the module-scope `deprecatedSession` cache, so it cannot move as-is — same accessor treatment as
parts 5 and 6. New leaf `src/libs/Network/SessionAuthToken.ts` (or a `hasAuthToken` export added to the
existing `src/libs/CurrentUserStore.ts`, which already does exactly this trick for
`ONYXKEYS.SESSION.email`) with its own `Onyx.connectWithoutView({key: ONYXKEYS.SESSION})`. `Session/index.ts`
imports it back and keeps exporting `hasAuthToken`, so `src/DeepLinkHandler.tsx` is untouched.
`tests/unit/Navigation/linkingConfigSubscribeTest.ts` and `tests/ui/SessionTest.tsx` need a check (the
latter `jest.requireActual`s the session module).

**Cut B — `src/libs/Navigation/helpers/getAdaptedStateFromPath.ts:14` `import {getReportOrDraftReport} from '@libs/ReportUtils'`.**
165 cycles traverse it, and it is the single edge that lets all of `src/libs/Navigation/**` reach
`ReportUtils`. Single use site: line 288, inside `getDefaultFullScreenRoute` (283-297), where the call
is `getReportOrDraftReport(reportID, undefined, undefined, {})` and only the **truthiness** is read.
With those arguments the call collapses to "does `COLLECTION.REPORT` hold this reportID". New leaf
`src/libs/Navigation/helpers/getFullScreenTargetReport.ts` with its own Onyx connection (precedent in
repo: `ReportTitleUtils.ts:17-21`, `ReportAlternateTextUtils.ts:249-270`).

Deliberately **not** moving `getReportOrDraftReport` itself: that would edit `ReportUtils.ts`, which is
part 15's anchor file, and 65 files reference the symbol. With the leaf, the only repoint is
`getAdaptedStateFromPath.ts:14`.

Test follow-up: `tests/navigation/getMatchingFullScreenRouteTests.ts:16`,
`tests/navigation/getAdaptedStateFromPathTabStripTests.ts:13` and
`tests/navigation/handleReplaceFullscreenUnderRHPTests.ts:16` mock `@libs/ReportUtils` with only
`getReportOrDraftReport`; after the repoint those mocks go inert and must target the leaf.

Files: `Navigation/linkingConfig/subscribe.ts`, `actions/Session/index.ts`, new leaf (session token),
`Navigation/helpers/getAdaptedStateFromPath.ts`, new leaf (report existence), 3 navigation tests,
`tests/ui/SessionTest.tsx`. No overlap with part 12.

---

## Part 14 — `actions/App` stops importing `actions/Policy/Policy`

`src/libs/actions/App.ts` has two import statements of the target — a type at `:40` and a value at
`:45` (`createDraftInitialWorkspace, createWorkspace, generateDefaultWorkspaceName, generatePolicyID`).
oxlint dedupes per module pair, so **both** must go. Worth **-21 / -6** after parts 12 and 13 (the
`buildOldDotURL`-shaped low hanging fruit elsewhere is gone by then, which is why this edge is the top
remaining lever; standalone on the 181 baseline it is worth the same -21).

Movable as pure content (verified: no module-scope state, no cycle in their own closure):

| symbol | def | lines | extra content that must move with it |
| --- | --- | --- | --- |
| `PolicyOwner` (type) | `Policy.ts:249-252` | 4 | — |
| `generatePolicyID` | `Policy.ts:2516-2518` | 3 | `@libs/NumberUtils` only |
| `generateDefaultWorkspaceName` | `Policy.ts:2494-2511` | 18 | `getDisplayNameForWorkspace` (`:2469-2489`, 21 lines), `@libs/Localize`, `PUBLIC_DOMAINS_SET`, `PersonalDetailsUtils.getPersonalDetailByEmail` |
| `createDraftInitialWorkspace` | `Policy.ts:2576-2642` | 67 | `generatePolicyID`, `buildOptimisticDistanceRateCustomUnits` (`:2527-2557`) -> `generateCustomUnitID` |

New leaf: `src/libs/actions/Policy/PolicyDraft.ts` (~115 lines). `Policy.ts` imports it back and keeps
re-exporting all four names — `generatePolicyID` has 14 importers and `generateDefaultWorkspaceName` 18,
so a canonical-leaf repoint there is not worth the diff, and a re-export is safe because
`PolicyDraft.ts` reaches nothing in the cycle. 6 tests spread `jest.requireActual('@userActions/Policy/Policy')`
(`tests/ui/OnboardingPurpose.tsx:53`, `tests/ui/WorkspaceOnboarding.tsx:53`,
`tests/ui/PersonalDetailsOnboarding.tsx:53`, `tests/ui/OnboardingPersonalTrackGoal.tsx:49`,
`tests/ui/RulesRequireReceiptsPageTest.tsx:35`, `tests/unit/SelectFeaturesEmptyTagGroupTest.tsx:81`) —
a re-export keeps all six green, a removal breaks them.

The blocker is `createWorkspace` (`Policy.ts:3288-3306`), which calls `buildPolicyData`
(`Policy.ts:2729-3287`, 559 lines, uses `ReportUtils`, `PolicyUtils`, `getOnboardingMessages`,
`buildTaskData`). Do not move `buildPolicyData`. Instead move `App.ts`'s **call site**:
`savePolicyDraftByNewWorkspace` (`App.ts:788-864`) and
`createWorkspaceWithPolicyDraft{,AndNavigateToIt}` (`App.ts:711`, `:624`) move to
`src/libs/actions/Policy/CreateWorkspaceFlow.ts` — the part 6 sink pattern, since
`Policy.ts` never imports `App.ts`. Those functions read `App.ts`'s module-scope `allReports` (`:109`)
and `currentSessionData` (`:53`), so export accessors from `App.ts` (parts 5 and 6 precedent) rather
than moving the caches. Repoint the two page consumers:
`pages/settings/Wallet/PersonalCards/upgrade/PersonalCardUpgradePage.tsx:17`,
`pages/workspace/DynamicWorkspaceConfirmationPage.tsx:14`.

Files: `actions/App.ts`, `actions/Policy/Policy.ts`, new `PolicyDraft.ts` + `CreateWorkspaceFlow.ts`,
2 pages, `tests/actions/AppTest.ts` + the 6 requireActual suites (verify only). Disjoint from 12, 13, 15.

---

## Part 15 — `ReportUtils` stops importing `ReportWorkflow` and `ViolationsUtils`

`ReportUtils.ts` is the centre of the remaining 56-file SCC, so its own outbound edges are the last real
levers. Two of them, **-13 / -2** after 12, 13, 14.

**A — `ReportUtils.ts:109`**
`import {canApproveIOU, canIOUBePaid, canSubmitReport, getBadgeFromIOUReport, getIOUReportActionWithBadge} from './actions/IOU/ReportWorkflow'`
(uses at 3147, 3202, 3203, 4538, 4573).

All five are pure permission/read logic — no `Onyx.` write, no `Navigation.` call, no `API.` anywhere in
`ReportWorkflow.ts:154-448`. So this is the **inverse** of part 6: the logic belongs in the util layer
and moves back into `ReportUtils.ts`, together with the unexported `canPayIOUFromReportAction`
(`:383-391`). ~295 lines move (154-448); the ~1,400 lines of real actions stay. They cannot become a
leaf: every one of them calls `ReportUtils` (`isExpenseReport`, `getReportTransactions`, `isSettled`,
`canBeAutoReimbursed`, `getReportOrDraftReport`, ...), so a leaf lands straight back in the cluster.

Two rewires: `getAllReportNameValuePairs()` (from `actions/IOU/index`) has an in-file equivalent already
(`allReportNameValuePair`, `ReportUtils.ts:1207-1215`); `getAllTransactionViolations()` has none, so
thread it as a parameter — `ReportUtils` already does this at `canSubmitAndIsAwaitingForCurrentUser`
(`:3126`), and `ReportUtils.ts:3147` already passes `undefined` for it.

`ReportWorkflow.ts` must **not** re-export: it keeps `./Hold` and `./Report` imports, so a
`ReportUtils`-re-exported getter would sit mid-cycle at evaluation time (the part 9 / part 11 failure).
Repoint its consumers instead — 12 in src:
`components/MoneyReportHeaderActions/MoneyReportHeaderSecondaryActions.tsx:66`,
`components/MoneyReportHeaderActions/MoneyReportHeaderSelectionDropdown.tsx:34`,
`components/MoneyReportHeaderModals.tsx:13`,
`components/MoneyReportHeaderPrimaryAction/ApprovePrimaryAction.tsx:13`,
`.../PayPrimaryAction.tsx:30`,
`components/ReportActionItem/MoneyRequestReportPreview/useReportPreviewActionDecision.ts:9`,
`components/Search/SearchList/ListItem/ActionCell/PayActionCell.tsx:16`,
`hooks/useSearchBulkActions.ts:118`, `hooks/useSelectionModeReportActions.ts:6`,
`hooks/useLifecycleActions.tsx:33`, `libs/SearchUIUtils.ts:112`, plus `libs/ReportUtils.ts:109`.

Test retargets (they stub the moved functions on `@libs/actions/IOU/ReportWorkflow` and must move to
`@libs/ReportUtils`): `tests/ui/components/PayActionCellTest.tsx:60`,
`tests/ui/components/PayActionButtonTest.tsx:85`, `tests/unit/hooks/useSelectionModeReportActions.test.ts:253`,
`tests/unit/ReportSubmitUtilsTest.ts:14`. Verify-only: `SubmitActionButtonTest.tsx:78`,
`ApproveActionButtonTest.tsx:58`, `ReportSubmitToContentTest.tsx:116`, `PaymentUtilsTest.ts:30`,
`tests/actions/IOUTest/ReportWorkflowTest.ts`, `tests/unit/IOUUtilsTest.ts`.

**B — `ReportUtils.ts:294`** `import ViolationsUtils from './Violations/ViolationsUtils'`, used at
2397 (`getViolationsOnyxData`) and 9859 (`hasVisibleViolationsForUser`). The edges are mutual:
`ViolationsUtils.ts:28` imports `isCurrentUserSubmitter` from `ReportUtils`, and neither direction
alone is worth anything on the 181 baseline (both simulate to 0); they only pay after 12 and 13 have
re-shaped the mesh. Cheapest cut is the `ReportUtils` side: `hasVisibleViolationsForUser` is a read that
can take the violations list as a parameter (same thread-the-value pattern), and
`getViolationsOnyxData` is only reached from the optimistic-transaction path — if that call site sits
inside a function that is itself an action-shape, move the call site out of `ReportUtils` per part 6.
Decide at implementation time which of the two call sites is the real host; both are single-site.

Files: `ReportUtils.ts`, `actions/IOU/ReportWorkflow.ts`, `Violations/ViolationsUtils.ts`,
`SearchUIUtils.ts`, the 11 components/hooks above, 6-8 test files.

Deliberately excluded: `ReportUtils.ts:111` `import {isAnonymousUser} from './actions/Session'`
(-4 / -2 on the post-12/13 graph, and `isAnonymousUser` at `Session/index.ts:326` takes the session as a
parameter so it is a clean leaf). It edits `Session/index.ts`, which is part 13's file. It is first item
of part 16.

---

## Disjointness matrix

| file group | 12 | 13 | 14 | 15 |
| --- | --- | --- | --- | --- |
| `actions/Report/index.ts`, `actions/Task.ts`, `actions/Link.ts`, new `actions/Report/reportActionSubscribers.ts` + `actions/Task/TaskDeletion.ts` + `buildOldDotURL.ts`, `actions/IOU/Hold.ts`, `actions/Chronos.ts`, `actions/IOU/{Split,PayMoneyRequest,TrackExpense,PerDiem,RejectMoneyRequest,SendInvoice,SendMoney}.ts`, `actions/Session/index.ts` (line 1) | x | | | |
| `Navigation/linkingConfig/subscribe.ts`, `Navigation/helpers/getAdaptedStateFromPath.ts`, new `SessionAuthStore.ts` + `Navigation/helpers/getReportFromOnyx.ts`, `actions/Session/index.ts` (`hasAuthToken`) | | x | | |
| `actions/App.ts`, `actions/Policy/Policy.ts`, `PersonalCardUpgradePage.tsx`, `DynamicWorkspaceConfirmationPage.tsx` | | | x | |
| `ReportUtils.ts`, `actions/IOU/ReportWorkflow.ts`, `Violations/ViolationsUtils.ts`, `SearchUIUtils.ts`, `MoneyReportHeader*`, `PayActionCell.tsx`, `useSearchBulkActions.ts`, `useSelectionModeReportActions.ts`, `useLifecycleActions.tsx` | | | | x |

Everything is disjoint except one file: `actions/Session/index.ts`, where part 12 repoints the
`buildOldDotURL` import at line 1 and part 13 deletes the `hasAuthToken` body at ~337. ~330 lines apart,
so merge 12 before 13 and the second rebase is free. The other two files that a later part will want are
`actions/Link.ts` (16+ may want `openExternalLink`/`openOldDotLink` settled) and `Session/index.ts` again
for the `isAnonymousUser` leaf. Assign them, do not coordinate at review time.

## Backlog for parts 16+

Δs below are on the graph with parts 12 and 13 applied, i.e. the state after 12+13 (92 / 33). Re-measure
after 14 and 15 land before picking.

| Δ findings / files | edge | note |
| --- | --- | --- |
| -4 / -2 | `ReportUtils.ts:111 -> actions/Session/index.ts` | `isAnonymousUser(sessionParam?)` is already parameterised; natural sequel to part 13's session leaf |
| -10 / -4 | `actions/Task.ts:20 -> SearchQueryUtils.ts` | single symbol, `buildOptimisticSnapshotData` |
| -8 / -4 | `actions/connections/index.ts:6 -> PolicyUtils`, `connections/QuickbooksOnline.ts:9 -> PolicyUtils`, `PolicyUtils.ts:54 -> QuickbooksOnline`, `ReportActionsUtils.ts:79 -> WorkspacesSettingsUtils` | the cheap-leaf cluster: `isCollectPolicy` (3 lines, `PolicyUtils.ts:1551`), `shouldShowQBOReimbursableExportDestinationAccountError` (5 lines, move *into* `PolicyUtils`), `getUnitTranslationKey` + `getWorkspaceAddressStreetLines` (8 + 9 lines, zero imports). `PolicyUtils -> merge/HRUtils` and `HRUtils -> connections` die for free with the first. ~19 consumer files, 1 test |
| -4 / -2 | `SearchQueryUtils.ts:61 -> CardFeedUtils.ts` | `getCardFeedsForDisplay` is now feasible: ~190-line leaf (`CardFeedUtils.ts:145-268` + `getExpensifyCardFeedDescription` + `getDescriptionForPolicyDomainCard`/`getPolicyIDFromDomainName`). Blocked from part 15 only because it edits both `PolicyUtils.ts` (part 14) and `SearchUIUtils.ts` (part 15) |
| -3 / -1 | `ReportNameUtils.ts -> ModifiedExpenseMessage.ts` | |
| -2 / -2 | `actions/Search.ts <-> SearchUIUtils.ts` | the last non-mesh 2-cycle |

Dead ends, documented so nobody re-does the work:

- `actions/Policy/Policy.ts:107 -> actions/Task.ts` (`buildTaskData`, -14 standalone). `buildTaskData`
  needs `ReportUtils.buildOptimisticTaskReportAction` (`ReportUtils.ts:8450-8503`), which reads
  `deprecatedCurrentUserAccountID` (1035), `allPersonalDetails` (1075) and `delegateEmail` (1224). No
  leaf survives; only caller-side data threading through `createWorkspace` would work.
- `actions/Delegate.ts:29 -> actions/App.ts` (`openApp`, -4). `openApp` ->
  `getOnyxDataForOpenOrReconnect` (`App.ts:309-411`) -> `ReportUtils` + module caches `allReports` (109),
  `allPolicies` (110), `isUsingImportedState` (80). Also `src/libs/actions/__mocks__/App.ts:14` spreads
  `requireActual`.
- `actions/Session/index.ts:39 -> src/libs/Reauthentication.ts` (-2). `reauthenticate` (204 lines) pulls
  `actions/Delegate` and `actions/SignInRedirect` and mutates 7 module-scope caches.
- `Link.ts:42 -> actions/Report/index.ts` (the cut part 12 originally planned). See step 3: `openLink`
  calls `openReportFromDeepLink`, so no destination for the deep-link half escapes the hub.
- **Sink with an SCC importer = relocated cycle.** The recurring trap behind all four rows above: a module
  that imports the hub is only a sink if nothing inside the SCC imports it. Putting a hub symbol behind a
  new file that a cyclic consumer imports moves the finding, it does not remove it. Before writing any
  leaf, ask both directions: does the destination reach the cycle, and does anything in the cycle reach
  the destination?
- `Navigation/Navigation.ts`'s `navigate` and `goBack` cannot be leaf-extracted (module state
  `pendingNavigationCall` 126, `sidePanelNVP` 103, plus 647 / 686 importers). Anything that wants them
  must ride out the cycle instead of repointing.

## Measurement recipe

```
git worktree add --detach /tmp/nocycle-wt origin/main
ln -s <kyoto>/node_modules /tmp/nocycle-wt/node_modules      # symlink is enough for oxlint
cp <kyoto>/.oxlintrc.no-cycle.json /tmp/nocycle-wt/
cd /tmp/nocycle-wt && npx oxlint . -c .oxlintrc.no-cycle.json -f json
```

Findings = `diagnostics.length`; files = distinct `diagnostics[].filename`; a finding's reported edge is
`(filename, first path in the note)`. The per-edge simulator used throughout
(`scc.py` + `run.py` in the session temp dir, worth committing alongside the config) rebuilds the graph
from the cycle paths in the notes, removes a candidate edge, recomputes SCCs and recounts.

**Simulator accuracy is established, not assumed.** It reproduces `origin/main` exactly (268 / 84), and
the six edges cut by parts 5, 8 and 9 predict exactly the measured **-46 / -17** of `main + 5 + 8 + 9`
(222 / 67). It also reproduces the historical per-cut figures the road-to-zero doc recorded from real
runs: `getStateFromPath -> linkingConfig` -18, `createDynamicRoute -> Navigation` -7,
`DownloadUtils -> actions/Link` -7, `ReportUtils -> PaymentUtils` -4.

## Caveats

- Line numbers come from a local merge of parts 5, 8, 9, 10 and 11 into `07dca732efa`, not from a post-merge
  `main`. Re-derive them when each PR is written. Part 10's merge needed a hand resolution in
  `ReportActionsUtils.ts` (main changed `getOriginalMessage` and
  `isCardBrokenConnectionAction`), so post-merge line numbers will shift by a handful.
- `main` moves ~850 commits every four days. `ReportActionsUtils.ts` had 17 commits in the last four days
  alone, so parts 15's anchor is the churn hot spot: rebase it immediately before merge, and re-run the
  no-cycle measurement after every rebase rather than trusting the numbers in the PR description.
- oxlint reports one finding per (file, module) pair, so a PR's real Δ depends on the whole import
  statement going away. That is what makes part 12 all-or-nothing and what makes "trim one symbol from
  an import" a 0-finding PR.
- Where a moved symbol must be re-exported by the hub, the leaf must import nothing from the cycle.
  Where it cannot satisfy that, the canonical-leaf-plus-repoint rule from part 11 applies, and every
  `jest.requireActual` spread on the hub is a reason to repoint rather than re-export.
- No file in this repository was modified to produce this plan. The only writes were under the session
  temp directory (scratch worktrees, since removed) and this document.
