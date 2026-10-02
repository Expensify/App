# Oxlint `import/no-cycle`: full findings

Branch `feat/oxlint` at `acf12de6d84`, oxlint 1.79.0, 8532 files linted, run 2026-08-27.
Raw machine-readable output, including every full cycle path: `oxlint-no-cycle-findings.json`.

## How to reproduce

```bash
# .oxlintrc.no-cycle.json: import plugin only, import/no-cycle only,
# same ignorePatterns as .oxlintrc.json. Takes ~3.4s.
npx oxlint . -c .oxlintrc.no-cycle.json -f json > oxlint-no-cycle-findings.json

# same run, human-readable, with the cycle path drawn per finding
npx oxlint . -c .oxlintrc.no-cycle.json
```

The dedicated config exists only so the run skips `typeAware: true` and the five `jsPlugins` the
root config loads. `import/no-cycle` is a native Rust rule and needs neither.

Cross-checked against the real config, which already has `import/no-cycle: error`:

```bash
npx oxlint . -f json | jq '[.diagnostics[] | select(.code == "import(no-cycle)")] | length'
```

Same 534 findings, 82 s instead of 3.4 s. `-A all` does not help here: it does not suppress rules the
config switches on, so that run still reports all 4469 findings and you filter afterwards either way.

## Summary

| | |
| --- | --- |
| Findings | **534** |
| Files reported on | **148** |
| Distinct modules on any cycle | **148** |
| Distinct import edges inside cycles | **535** |
| Mutually dependent clusters | **6** (largest: 116 files) |
| Import edges needed to break every cycle | **13** |
| Smallest / largest cycle | 2 / 39 modules |

ESLint reports 0 of these. `eslint-config-expensify` does enable the rule
(`configs/private/imports.js:230`, `['error', {maxDepth: '∞'}]`), but its resolver never resolves
`@src/...`, so it builds no module graph at all. Oxlint discovers `tsconfig.json` and resolves the
aliases, which is the only reason the rule fires here. Neither `.oxlintrc.json` nor the config above
passes rule options to oxlint, so this run uses oxlint's defaults; the deepest cycle it reported is 39
modules, so depth is not visibly capping the count.

## The 534 findings are 13 import edges

Oxlint reports a cycle once per module sitting on it, so 534 is a function of how large the
strongly connected component is, not of how much work there is. Greedy minimum edge cut over all
534 reported cycles:

| # | Edge to break | Reported cycles it appears in | Cycles left before it |
| --- | --- | --- | --- |
| 1 | `libs/API/makeRequest.ts` &rarr; `libs/Middleware/index.ts` | 457 | 534 |
| 2 | `libs/Log.ts` &rarr; `libs/Network/index.ts` | 34 | 77 |
| 3 | `libs/actions/IOU/MoneyRequestBuilder.ts` &rarr; `libs/actions/IOU/SearchUpdate.ts` | 10 | 43 |
| 4 | `pages/workspace/accounting/AccountingContext/index.tsx` &rarr; `pages/workspace/accounting/utils.tsx` | 8 | 33 |
| 5 | `components/MultifactorAuthentication/config/index.ts` &rarr; `components/MultifactorAuthentication/config/scenarios/index.ts` | 8 | 25 |
| 6 | `libs/Navigation/helpers/getStateFromPath.ts` &rarr; `libs/Navigation/linkingConfig/index.ts` | 5 | 17 |
| 7 | `libs/EmojiUtils.tsx` &rarr; `components/Text.tsx` | 2 | 12 |
| 8 | `libs/GPSDraftDetailsUtils.ts` &rarr; `libs/actions/GPSDraftDetails.ts` | 2 | 10 |
| 9 | `libs/TransactionUtils/index.ts` &rarr; `libs/TransactionUtils/getDistanceInMeters.ts` | 2 | 8 |
| 10 | `libs/ReportUtils.ts` &rarr; `libs/AttendeeUtils.ts` | 2 | 6 |
| 11 | `libs/actions/App.ts` &rarr; `libs/actions/Policy/Policy.ts` | 2 | 4 |
| 12 | `libs/PolicyUtils.ts` &rarr; `libs/HRUtils.ts` | 1 | 2 |
| 13 | `libs/fileDownload/DownloadUtils.ts` &rarr; `libs/actions/Link.ts` | 1 | 1 |

The third column counts reported cycles containing the edge, which is NOT the same as findings the edge
clears. Edge 1 was merged as Part 1 ([#99670](https://github.com/Expensify/App/pull/99670)): it cleared 56
findings, not 457, because the cut over sampled cycles over-predicts.

## Mutually dependent clusters

Strongly connected components over the 535 edges above. All 148 files land in one of six, and
every module inside a component pulls in every other module of that component at evaluation time.

The graph here is built only from edges oxlint actually reported inside a cycle, so these sizes are
a lower bound on the real components in the full import graph, not an upper bound.

| Cluster | Files |
| --- | --- |
| 1 | 116 |
| 2 | 15 |
| 3 | 7 |
| 4 | 6 |
| 5 | 2 |
| 6 | 2 |

### Cluster 1, all 116 files

- `src/libs/API/index.ts`
- `src/libs/API/makeRequest.ts`
- `src/libs/API/write.ts`
- `src/libs/API/writeWhenReady.ts`
- `src/libs/AgentRuleChangeLogUtils.ts`
- `src/libs/AttendeeUtils.ts`
- `src/libs/CardFeedUtils.ts`
- `src/libs/CardUtils.ts`
- `src/libs/DistanceRequestUtils.ts`
- `src/libs/ExpensifyCardFeedSelectorUtils.ts`
- `src/libs/HRUtils.ts`
- `src/libs/IOUUtils.ts`
- `src/libs/LoginUtils.ts`
- `src/libs/Middleware/HandleDeletedAccount.ts`
- `src/libs/Middleware/HandleUnusedOptimisticID.ts`
- `src/libs/Middleware/LoadPostDataForOpenOrReconnect.ts`
- `src/libs/Middleware/Reauthentication.ts`
- `src/libs/Middleware/SaveResponseInOnyx.ts`
- `src/libs/Middleware/SupportalPermission.ts`
- `src/libs/Middleware/index.ts`
- `src/libs/ModifiedExpenseMessage.ts`
- `src/libs/MoneyRequestUtils.ts`
- `src/libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers.ts`
- `src/libs/Navigation/Navigation.ts`
- `src/libs/Navigation/helpers/dismissModalAndOpenReportInInboxTab.ts`
- `src/libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute.ts`
- `src/libs/Navigation/helpers/dynamicRoutesUtils/getDynamicRouteAdaptedState.ts`
- `src/libs/Navigation/helpers/getAdaptedStateFromPath.ts`
- `src/libs/Navigation/helpers/getReportRouteForCurrentContext.ts`
- `src/libs/Navigation/helpers/getReportURLForCurrentContext.ts`
- `src/libs/Navigation/helpers/getStateFromPath.ts`
- `src/libs/Navigation/helpers/lastVisitedTabPathUtils/index.ts`
- `src/libs/Navigation/helpers/linkTo/index.ts`
- `src/libs/Navigation/helpers/navigateAfterExpenseCreate.ts`
- `src/libs/Navigation/helpers/swapBackgroundTabForRHPTarget.ts`
- `src/libs/Navigation/helpers/willRouteNavigateToRHP.ts`
- `src/libs/Navigation/linkingConfig/index.ts`
- `src/libs/Navigation/linkingConfig/subscribe.ts`
- `src/libs/NextStepUtils.ts`
- `src/libs/Notification/LocalNotification/BrowserNotifications.ts`
- `src/libs/Notification/LocalNotification/index.ts`
- `src/libs/OptionsListUtils/index.ts`
- `src/libs/PageHTMLCapture/index.ts`
- `src/libs/PaymentUtils.ts`
- `src/libs/PerDiemRequestUtils.ts`
- `src/libs/PersonalDetailsUtils.ts`
- `src/libs/PolicyDistanceRatesUtils.ts`
- `src/libs/PolicyUtils.ts`
- `src/libs/PusherUtils.ts`
- `src/libs/Reauthentication.ts`
- `src/libs/ReportActionsUtils.ts`
- `src/libs/ReportNameUtils.ts`
- `src/libs/ReportPrimaryActionUtils.ts`
- `src/libs/ReportTitleUtils.ts`
- `src/libs/ReportUtils.ts`
- `src/libs/SearchQueryUtils.ts`
- `src/libs/SearchUIUtils.ts`
- `src/libs/SpendRuleChangeLogUtils.ts`
- `src/libs/SubscriptionUtils.ts`
- `src/libs/TaskUtils.ts`
- `src/libs/TransactionPreviewUtils.ts`
- `src/libs/TransactionUtils/getDistanceInMeters.ts`
- `src/libs/TransactionUtils/index.ts`
- `src/libs/ValidationUtils.ts`
- `src/libs/Violations/ViolationsUtils.ts`
- `src/libs/WorkspaceReportFieldUtils.ts`
- `src/libs/WorkspacesSettingsUtils.ts`
- `src/libs/actions/App.ts`
- `src/libs/actions/BankAccounts.ts`
- `src/libs/actions/ClearReportActionErrors.ts`
- `src/libs/actions/Delegate.ts`
- `src/libs/actions/HybridApp/index.ts`
- `src/libs/actions/IOU/DeleteMoneyRequest.ts`
- `src/libs/actions/IOU/Hold.ts`
- `src/libs/actions/IOU/MoneyRequest.ts`
- `src/libs/actions/IOU/MoneyRequestBuilder.ts`
- `src/libs/actions/IOU/NavigationHelpers.ts`
- `src/libs/actions/IOU/PayMoneyRequest.ts`
- `src/libs/actions/IOU/RejectMoneyRequest.ts`
- `src/libs/actions/IOU/ReportWorkflow.ts`
- `src/libs/actions/IOU/SearchUpdate.ts`
- `src/libs/actions/IOU/TrackExpense.ts`
- `src/libs/actions/Link.ts`
- `src/libs/actions/OnyxUpdates.ts`
- `src/libs/actions/PaymentMethods.ts`
- `src/libs/actions/Plaid.ts`
- `src/libs/actions/Policy/Category.ts`
- `src/libs/actions/Policy/Member.ts`
- `src/libs/actions/Policy/Policy.ts`
- `src/libs/actions/Policy/Tag.ts`
- `src/libs/actions/Reconnect.ts`
- `src/libs/actions/ReimbursementAccount/index.ts`
- `src/libs/actions/ReimbursementAccount/navigation.ts`
- `src/libs/actions/ReimbursementAccount/resetNonUSDBankAccount.ts`
- `src/libs/actions/ReimbursementAccount/resetUSDBankAccount.ts`
- `src/libs/actions/Report/DeleteReport.ts`
- `src/libs/actions/Report/index.ts`
- `src/libs/actions/Search.ts`
- `src/libs/actions/Session/index.ts`
- `src/libs/actions/SignInRedirect.ts`
- `src/libs/actions/Task.ts`
- `src/libs/actions/Transaction.ts`
- `src/libs/actions/TransactionEdit.ts`
- `src/libs/actions/Wallet.ts`
- `src/libs/actions/Welcome/OnboardingFlow.ts`
- `src/libs/actions/Welcome/index.ts`
- `src/libs/actions/connections/MergeHR.ts`
- `src/libs/actions/connections/QuickbooksOnline.ts`
- `src/libs/actions/connections/index.ts`
- `src/libs/actions/navigateFromNotification/index.ts`
- `src/libs/fileDownload/DownloadUtils.ts`
- `src/libs/fileDownload/index.ts`
- `src/libs/getWorkspaceCreatedAnalyticsEvent.ts`
- `src/libs/interceptAnonymousUser.ts`
- `src/libs/processReportIDDeeplink/getReportIDFromUrl.ts`
- `src/libs/processReportIDDeeplink/index.ts`

### Cluster 2, 15 files

- `src/libs/HttpUtils.ts`
- `src/libs/Log.ts`
- `src/libs/Network/MainQueue.ts`
- `src/libs/Network/NetworkStore.ts`
- `src/libs/Network/SequentialQueue.ts`
- `src/libs/Network/enhanceParameters.ts`
- `src/libs/Network/index.ts`
- `src/libs/NetworkState.ts`
- `src/libs/Prefetch/preparePrefetchRequest/index.ts`
- `src/libs/Prefetch/registerPrefetchOnAppStart/index.ts`
- `src/libs/Request.ts`
- `src/libs/RequestThrottle.ts`
- `src/libs/actions/PersistedRequests.ts`
- `src/libs/actions/QueuedOnyxUpdates.ts`
- `src/libs/telemetry/ReceiptObservability.ts`

### Cluster 3, 7 files

- `src/components/MultifactorAuthentication/Context/MultifactorAuthenticationComposedContextProviders.tsx`
- `src/components/MultifactorAuthentication/Context/index.ts`
- `src/components/MultifactorAuthentication/Context/stateReducer.ts`
- `src/components/MultifactorAuthentication/Context/usePromptContent.ts`
- `src/components/MultifactorAuthentication/config/index.ts`
- `src/components/MultifactorAuthentication/config/scenarios/ChangePIN.tsx`
- `src/components/MultifactorAuthentication/config/scenarios/index.ts`

### Cluster 4, 6 files

- `src/components/ConnectToCertiniaFlow/index.tsx`
- `src/components/ConnectToNetSuiteFlow/index.tsx`
- `src/components/ConnectToQuickbooksOnlineFlow/BaseConnectToQuickbooksOnlineFlow.tsx`
- `src/components/ConnectToQuickbooksOnlineFlow/index.tsx`
- `src/pages/workspace/accounting/AccountingContext/index.tsx`
- `src/pages/workspace/accounting/utils.tsx`

### Cluster 5, 2 files

- `src/components/Text.tsx`
- `src/libs/EmojiUtils.tsx`

### Cluster 6, 2 files

- `src/libs/GPSDraftDetailsUtils.ts`
- `src/libs/actions/GPSDraftDetails.ts`
## Cycle size distribution

| Modules on the cycle | Findings |
| --- | --- |
| 2 | 4 |
| 3 | 9 |
| 4 | 13 |
| 5 | 19 |
| 6 | 26 |
| 7 | 8 |
| 8 | 9 |
| 9 | 6 |
| 10 | 8 |
| 11 | 4 |
| 12 | 12 |
| 13 | 10 |
| 14 | 9 |
| 15 | 7 |
| 16 | 28 |
| 17 | 10 |
| 18 | 24 |
| 19 | 39 |
| 20 | 42 |
| 21 | 28 |
| 22 | 28 |
| 23 | 18 |
| 24 | 15 |
| 25 | 12 |
| 26 | 9 |
| 27 | 15 |
| 28 | 17 |
| 29 | 15 |
| 30 | 27 |
| 31 | 19 |
| 32 | 9 |
| 33 | 11 |
| 34 | 9 |
| 35 | 7 |
| 36 | 3 |
| 37 | 1 |
| 38 | 3 |
| 39 | 1 |

## Findings per file

| File | Findings |
| --- | --- |
| `src/libs/actions/Report/index.ts` | 27 |
| `src/libs/ReportUtils.ts` | 25 |
| `src/libs/SearchUIUtils.ts` | 20 |
| `src/libs/actions/IOU/TrackExpense.ts` | 19 |
| `src/libs/actions/Search.ts` | 16 |
| `src/libs/actions/IOU/PayMoneyRequest.ts` | 13 |
| `src/libs/actions/IOU/ReportWorkflow.ts` | 12 |
| `src/libs/OptionsListUtils/index.ts` | 11 |
| `src/libs/actions/IOU/MoneyRequest.ts` | 11 |
| `src/libs/actions/Policy/Policy.ts` | 11 |
| `src/libs/actions/Task.ts` | 11 |
| `src/libs/PolicyUtils.ts` | 9 |
| `src/libs/actions/Session/index.ts` | 9 |
| `src/libs/actions/IOU/DeleteMoneyRequest.ts` | 9 |
| `src/libs/actions/IOU/MoneyRequestBuilder.ts` | 9 |
| `src/libs/actions/BankAccounts.ts` | 9 |
| `src/libs/actions/Link.ts` | 9 |
| `src/libs/actions/Transaction.ts` | 8 |
| `src/libs/TransactionPreviewUtils.ts` | 8 |
| `src/libs/actions/IOU/RejectMoneyRequest.ts` | 8 |
| `src/libs/Network/SequentialQueue.ts` | 7 |
| `src/libs/ReportActionsUtils.ts` | 7 |
| `src/libs/actions/IOU/Hold.ts` | 7 |
| `src/libs/ReportNameUtils.ts` | 7 |
| `src/libs/SearchQueryUtils.ts` | 7 |
| `src/libs/TransactionUtils/index.ts` | 7 |
| `src/libs/actions/Policy/Member.ts` | 6 |
| `src/libs/actions/Policy/Tag.ts` | 6 |
| `src/libs/ModifiedExpenseMessage.ts` | 6 |
| `src/libs/actions/Policy/Category.ts` | 6 |
| `src/libs/Violations/ViolationsUtils.ts` | 6 |
| `src/libs/IOUUtils.ts` | 6 |
| `src/libs/Middleware/index.ts` | 5 |
| `src/libs/Request.ts` | 5 |
| `src/libs/actions/App.ts` | 5 |
| `src/libs/actions/PaymentMethods.ts` | 5 |
| `src/libs/Network/MainQueue.ts` | 4 |
| `src/libs/Navigation/Navigation.ts` | 4 |
| `src/libs/Notification/LocalNotification/BrowserNotifications.ts` | 4 |
| `src/libs/NextStepUtils.ts` | 4 |
| `src/libs/actions/Welcome/OnboardingFlow.ts` | 4 |
| `src/libs/ReportPrimaryActionUtils.ts` | 4 |
| `src/libs/actions/ClearReportActionErrors.ts` | 4 |
| `src/libs/actions/connections/index.ts` | 3 |
| `src/pages/workspace/accounting/utils.tsx` | 3 |
| `src/libs/API/index.ts` | 3 |
| `src/libs/telemetry/ReceiptObservability.ts` | 3 |
| `src/libs/Prefetch/registerPrefetchOnAppStart/index.ts` | 3 |
| `src/libs/Middleware/Reauthentication.ts` | 3 |
| `src/libs/PaymentUtils.ts` | 3 |
| `src/libs/Navigation/helpers/linkTo/index.ts` | 3 |
| `src/libs/Navigation/helpers/getAdaptedStateFromPath.ts` | 3 |
| `src/libs/actions/ReimbursementAccount/index.ts` | 3 |
| `src/libs/CardFeedUtils.ts` | 3 |
| `src/libs/MoneyRequestUtils.ts` | 3 |
| `src/libs/actions/IOU/SearchUpdate.ts` | 3 |
| `src/libs/Navigation/helpers/navigateAfterExpenseCreate.ts` | 3 |
| `src/libs/Navigation/helpers/swapBackgroundTabForRHPTarget.ts` | 3 |
| `src/libs/DistanceRequestUtils.ts` | 2 |
| `src/libs/Network/index.ts` | 2 |
| `src/libs/Navigation/linkingConfig/index.ts` | 2 |
| `src/components/MultifactorAuthentication/Context/index.ts` | 2 |
| `src/libs/API/makeRequest.ts` | 2 |
| `src/libs/API/writeWhenReady.ts` | 2 |
| `src/libs/HttpUtils.ts` | 2 |
| `src/libs/actions/Delegate.ts` | 2 |
| `src/libs/Reauthentication.ts` | 2 |
| `src/libs/actions/SignInRedirect.ts` | 2 |
| `src/libs/LoginUtils.ts` | 2 |
| `src/libs/PolicyDistanceRatesUtils.ts` | 2 |
| `src/libs/ValidationUtils.ts` | 2 |
| `src/libs/actions/connections/QuickbooksOnline.ts` | 2 |
| `src/libs/actions/Plaid.ts` | 2 |
| `src/libs/actions/Welcome/index.ts` | 2 |
| `src/libs/actions/IOU/NavigationHelpers.ts` | 2 |
| `src/libs/ExpensifyCardFeedSelectorUtils.ts` | 2 |
| `src/libs/TaskUtils.ts` | 2 |
| `src/components/Text.tsx` | 1 |
| `src/libs/EmojiUtils.tsx` | 1 |
| `src/libs/GPSDraftDetailsUtils.ts` | 1 |
| `src/libs/actions/GPSDraftDetails.ts` | 1 |
| `src/components/ConnectToCertiniaFlow/index.tsx` | 1 |
| `src/components/ConnectToNetSuiteFlow/index.tsx` | 1 |
| `src/pages/workspace/accounting/AccountingContext/index.tsx` | 1 |
| `src/components/ConnectToQuickbooksOnlineFlow/BaseConnectToQuickbooksOnlineFlow.tsx` | 1 |
| `src/components/ConnectToQuickbooksOnlineFlow/index.tsx` | 1 |
| `src/libs/Log.ts` | 1 |
| `src/libs/Network/NetworkStore.ts` | 1 |
| `src/components/MultifactorAuthentication/Context/usePromptContent.ts` | 1 |
| `src/libs/Middleware/HandleDeletedAccount.ts` | 1 |
| `src/libs/NetworkState.ts` | 1 |
| `src/libs/RequestThrottle.ts` | 1 |
| `src/libs/actions/PersistedRequests.ts` | 1 |
| `src/components/MultifactorAuthentication/Context/MultifactorAuthenticationComposedContextProviders.tsx` | 1 |
| `src/components/MultifactorAuthentication/Context/stateReducer.ts` | 1 |
| `src/components/MultifactorAuthentication/config/index.ts` | 1 |
| `src/components/MultifactorAuthentication/config/scenarios/ChangePIN.tsx` | 1 |
| `src/components/MultifactorAuthentication/config/scenarios/index.ts` | 1 |
| `src/libs/API/write.ts` | 1 |
| `src/libs/Middleware/LoadPostDataForOpenOrReconnect.ts` | 1 |
| `src/libs/actions/QueuedOnyxUpdates.ts` | 1 |
| `src/libs/Middleware/SupportalPermission.ts` | 1 |
| `src/libs/Prefetch/preparePrefetchRequest/index.ts` | 1 |
| `src/libs/actions/Reconnect.ts` | 1 |
| `src/libs/Network/enhanceParameters.ts` | 1 |
| `src/libs/Middleware/SaveResponseInOnyx.ts` | 1 |
| `src/libs/PusherUtils.ts` | 1 |
| `src/libs/actions/OnyxUpdates.ts` | 1 |
| `src/libs/Navigation/helpers/lastVisitedTabPathUtils/index.ts` | 1 |
| `src/libs/Navigation/linkingConfig/subscribe.ts` | 1 |
| `src/libs/Navigation/helpers/getReportRouteForCurrentContext.ts` | 1 |
| `src/libs/PageHTMLCapture/index.ts` | 1 |
| `src/libs/actions/navigateFromNotification/index.ts` | 1 |
| `src/libs/actions/HybridApp/index.ts` | 1 |
| `src/libs/CardUtils.ts` | 1 |
| `src/libs/Middleware/HandleUnusedOptimisticID.ts` | 1 |
| `src/libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers.ts` | 1 |
| `src/libs/Navigation/helpers/getStateFromPath.ts` | 1 |
| `src/libs/Notification/LocalNotification/index.ts` | 1 |
| `src/libs/PersonalDetailsUtils.ts` | 1 |
| `src/libs/actions/Report/DeleteReport.ts` | 1 |
| `src/libs/Navigation/helpers/dynamicRoutesUtils/getDynamicRouteAdaptedState.ts` | 1 |
| `src/libs/WorkspaceReportFieldUtils.ts` | 1 |
| `src/libs/actions/Wallet.ts` | 1 |
| `src/libs/interceptAnonymousUser.ts` | 1 |
| `src/libs/HRUtils.ts` | 1 |
| `src/libs/ReportTitleUtils.ts` | 1 |
| `src/libs/WorkspacesSettingsUtils.ts` | 1 |
| `src/libs/actions/ReimbursementAccount/resetNonUSDBankAccount.ts` | 1 |
| `src/libs/actions/ReimbursementAccount/resetUSDBankAccount.ts` | 1 |
| `src/libs/actions/TransactionEdit.ts` | 1 |
| `src/libs/actions/connections/MergeHR.ts` | 1 |
| `src/libs/AgentRuleChangeLogUtils.ts` | 1 |
| `src/libs/Navigation/helpers/getReportURLForCurrentContext.ts` | 1 |
| `src/libs/processReportIDDeeplink/getReportIDFromUrl.ts` | 1 |
| `src/libs/processReportIDDeeplink/index.ts` | 1 |
| `src/libs/TransactionUtils/getDistanceInMeters.ts` | 1 |
| `src/libs/AttendeeUtils.ts` | 1 |
| `src/libs/SpendRuleChangeLogUtils.ts` | 1 |
| `src/libs/SubscriptionUtils.ts` | 1 |
| `src/libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute.ts` | 1 |
| `src/libs/actions/ReimbursementAccount/navigation.ts` | 1 |
| `src/libs/getWorkspaceCreatedAnalyticsEvent.ts` | 1 |
| `src/libs/Navigation/helpers/dismissModalAndOpenReportInInboxTab.ts` | 1 |
| `src/libs/PerDiemRequestUtils.ts` | 1 |
| `src/libs/Navigation/helpers/willRouteNavigateToRHP.ts` | 1 |
| `src/libs/fileDownload/DownloadUtils.ts` | 1 |
| `src/libs/fileDownload/index.ts` | 1 |

## Small cycles, full paths

88 findings sit on a cycle of 8 modules or fewer. 17 of them still route
through the API/Middleware component (`cut #1`); the remaining 71 are
self-contained and can be fixed and verified without touching it. The chain closes back on its
first module.

1. `src/components/Text.tsx:3:39` (2 modules, cut #7)
   - libs/EmojiUtils.tsx -> components/Text.tsx -> libs/EmojiUtils.tsx
2. `src/libs/EmojiUtils.tsx:4:18` (2 modules, cut #7)
   - components/Text.tsx -> libs/EmojiUtils.tsx -> components/Text.tsx
3. `src/libs/GPSDraftDetailsUtils.ts:15:71` (2 modules, cut #8)
   - libs/actions/GPSDraftDetails.ts -> libs/GPSDraftDetailsUtils.ts -> libs/actions/GPSDraftDetails.ts
4. `src/libs/actions/GPSDraftDetails.ts:1:82` (2 modules, cut #8)
   - libs/GPSDraftDetailsUtils.ts -> libs/actions/GPSDraftDetails.ts -> libs/GPSDraftDetailsUtils.ts
5. `src/components/ConnectToCertiniaFlow/index.tsx:12:34` (3 modules, cut #4)
   - pages/workspace/accounting/AccountingContext/index.tsx -> pages/workspace/accounting/utils.tsx -> components/ConnectToCertiniaFlow/index.tsx -> pages/workspace/accounting/AccountingContext/index.tsx
6. `src/components/ConnectToNetSuiteFlow/index.tsx:12:34` (3 modules, cut #4)
   - pages/workspace/accounting/AccountingContext/index.tsx -> pages/workspace/accounting/utils.tsx -> components/ConnectToNetSuiteFlow/index.tsx -> pages/workspace/accounting/AccountingContext/index.tsx
7. `src/libs/DistanceRequestUtils.ts:22:85` (3 modules, cut #9)
   - libs/TransactionUtils/index.ts -> libs/TransactionUtils/getDistanceInMeters.ts -> libs/DistanceRequestUtils.ts -> libs/TransactionUtils/index.ts
8. `src/libs/Network/index.ts:11:45` (3 modules, cut #2)
   - libs/Network/SequentialQueue.ts -> libs/Log.ts -> libs/Network/index.ts -> libs/Network/SequentialQueue.ts
9. `src/libs/OptionsListUtils/index.ts:123:31` (3 modules, cut #10)
   - libs/ReportUtils.ts -> libs/AttendeeUtils.ts -> libs/OptionsListUtils/index.ts -> libs/ReportUtils.ts
10. `src/libs/actions/connections/index.ts:5:30` (3 modules, cut #12)
   - libs/PolicyUtils.ts -> libs/HRUtils.ts -> libs/actions/connections/index.ts -> libs/PolicyUtils.ts
11. `src/pages/workspace/accounting/AccountingContext/index.tsx:13:44` (3 modules, cut #4)
   - pages/workspace/accounting/utils.tsx -> components/ConnectToCertiniaFlow/index.tsx -> pages/workspace/accounting/AccountingContext/index.tsx -> pages/workspace/accounting/utils.tsx
12. `src/pages/workspace/accounting/utils.tsx:1:35` (3 modules, cut #4)
   - components/ConnectToCertiniaFlow/index.tsx -> pages/workspace/accounting/AccountingContext/index.tsx -> pages/workspace/accounting/utils.tsx -> components/ConnectToCertiniaFlow/index.tsx
13. `src/pages/workspace/accounting/utils.tsx:3:35` (3 modules, cut #4)
   - components/ConnectToNetSuiteFlow/index.tsx -> pages/workspace/accounting/AccountingContext/index.tsx -> pages/workspace/accounting/utils.tsx -> components/ConnectToNetSuiteFlow/index.tsx
14. `src/components/ConnectToQuickbooksOnlineFlow/BaseConnectToQuickbooksOnlineFlow.tsx:15:34` (4 modules, cut #4)
   - pages/workspace/accounting/AccountingContext/index.tsx -> pages/workspace/accounting/utils.tsx -> components/ConnectToQuickbooksOnlineFlow/index.tsx -> components/ConnectToQuickbooksOnlineFlow/BaseConnectToQuickbooksOnlineFlow.tsx -> pages/workspace/accounting/AccountingContext/index.tsx
15. `src/components/ConnectToQuickbooksOnlineFlow/index.tsx:9:47` (4 modules, cut #4)
   - components/ConnectToQuickbooksOnlineFlow/BaseConnectToQuickbooksOnlineFlow.tsx -> pages/workspace/accounting/AccountingContext/index.tsx -> pages/workspace/accounting/utils.tsx -> components/ConnectToQuickbooksOnlineFlow/index.tsx -> components/ConnectToQuickbooksOnlineFlow/BaseConnectToQuickbooksOnlineFlow.tsx
16. `src/libs/Log.ts:12:20` (4 modules, cut #2)
   - libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/Network/NetworkStore.ts -> libs/Log.ts -> libs/Network/index.ts
17. `src/libs/Navigation/linkingConfig/index.ts:1:37` (4 modules, cut #6)
   - libs/Navigation/helpers/getAdaptedStateFromPath.ts -> libs/Navigation/helpers/dynamicRoutesUtils/getDynamicRouteAdaptedState.ts -> libs/Navigation/helpers/getStateFromPath.ts -> libs/Navigation/linkingConfig/index.ts -> libs/Navigation/helpers/getAdaptedStateFromPath.ts
18. `src/libs/Network/MainQueue.ts:1:28` (4 modules, cut #2)
   - libs/NetworkState.ts -> libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/NetworkState.ts
19. `src/libs/Network/MainQueue.ts:9:32` (4 modules, cut #2)
   - libs/Network/NetworkStore.ts -> libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/Network/NetworkStore.ts
20. `src/libs/Network/MainQueue.ts:10:53` (4 modules, cut #2)
   - libs/Network/SequentialQueue.ts -> libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/Network/SequentialQueue.ts
21. `src/libs/Network/NetworkStore.ts:3:17` (4 modules, cut #2)
   - libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/Network/NetworkStore.ts -> libs/Log.ts
22. `src/libs/Network/SequentialQueue.ts:18:17` (4 modules, cut #2)
   - libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/Network/SequentialQueue.ts -> libs/Log.ts
23. `src/libs/Network/index.ts:10:68` (4 modules, cut #2)
   - libs/Network/MainQueue.ts -> libs/Network/NetworkStore.ts -> libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts
24. `src/libs/PolicyUtils.ts:63:82` (4 modules, cut #9)
   - libs/TransactionUtils/index.ts -> libs/TransactionUtils/getDistanceInMeters.ts -> libs/DistanceRequestUtils.ts -> libs/PolicyUtils.ts -> libs/TransactionUtils/index.ts
25. `src/libs/actions/Report/index.ts:68:26` (4 modules, cut #13)
   - libs/fileDownload/index.ts -> libs/fileDownload/DownloadUtils.ts -> libs/actions/Link.ts -> libs/actions/Report/index.ts -> libs/fileDownload/index.ts
26. `src/pages/workspace/accounting/utils.tsx:5:43` (4 modules, cut #4)
   - components/ConnectToQuickbooksOnlineFlow/index.tsx -> components/ConnectToQuickbooksOnlineFlow/BaseConnectToQuickbooksOnlineFlow.tsx -> pages/workspace/accounting/AccountingContext/index.tsx -> pages/workspace/accounting/utils.tsx -> components/ConnectToQuickbooksOnlineFlow/index.tsx
27. `src/components/MultifactorAuthentication/Context/index.ts:5:43` (5 modules, cut #5)
   - components/MultifactorAuthentication/Context/usePromptContent.ts -> components/MultifactorAuthentication/config/index.ts -> components/MultifactorAuthentication/config/scenarios/index.ts -> components/MultifactorAuthentication/config/scenarios/ChangePIN.tsx -> components/MultifactorAuthentication/Context/index.ts -> components/MultifactorAuthentication/Context/usePromptContent.ts
28. `src/components/MultifactorAuthentication/Context/usePromptContent.ts:3:52` (5 modules, cut #5)
   - components/MultifactorAuthentication/config/index.ts -> components/MultifactorAuthentication/config/scenarios/index.ts -> components/MultifactorAuthentication/config/scenarios/ChangePIN.tsx -> components/MultifactorAuthentication/Context/index.ts -> components/MultifactorAuthentication/Context/usePromptContent.ts -> components/MultifactorAuthentication/config/index.ts
29. `src/libs/API/index.ts:24:62` (5 modules, cut #1)
   - libs/API/makeRequest.ts -> libs/Middleware/index.ts -> libs/Middleware/HandleDeletedAccount.ts -> libs/actions/Session/index.ts -> libs/API/index.ts -> libs/API/makeRequest.ts
30. `src/libs/API/makeRequest.ts:13:8` (5 modules, cut #1)
   - libs/Middleware/index.ts -> libs/Middleware/HandleDeletedAccount.ts -> libs/actions/Session/index.ts -> libs/API/index.ts -> libs/API/makeRequest.ts -> libs/Middleware/index.ts
31. `src/libs/Middleware/HandleDeletedAccount.ts:1:42` (5 modules, cut #1)
   - libs/actions/Session/index.ts -> libs/API/index.ts -> libs/API/makeRequest.ts -> libs/Middleware/index.ts -> libs/Middleware/HandleDeletedAccount.ts -> libs/actions/Session/index.ts
32. `src/libs/Middleware/index.ts:2:34` (5 modules, cut #1)
   - libs/Middleware/HandleDeletedAccount.ts -> libs/actions/Session/index.ts -> libs/API/index.ts -> libs/API/makeRequest.ts -> libs/Middleware/index.ts -> libs/Middleware/HandleDeletedAccount.ts
33. `src/libs/Network/SequentialQueue.ts:14:8` (5 modules, cut #2)
   - libs/actions/PersistedRequests.ts -> libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/Network/SequentialQueue.ts -> libs/actions/PersistedRequests.ts
34. `src/libs/Network/SequentialQueue.ts:15:35` (5 modules, cut #2)
   - libs/actions/QueuedOnyxUpdates.ts -> libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/Network/SequentialQueue.ts -> libs/actions/QueuedOnyxUpdates.ts
35. `src/libs/Network/SequentialQueue.ts:19:86` (5 modules, cut #2)
   - libs/NetworkState.ts -> libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/Network/SequentialQueue.ts -> libs/NetworkState.ts
36. `src/libs/Network/SequentialQueue.ts:21:29` (5 modules, cut #2)
   - libs/RequestThrottle.ts -> libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/Network/SequentialQueue.ts -> libs/RequestThrottle.ts
37. `src/libs/Network/SequentialQueue.ts:22:60` (5 modules, cut #2)
   - libs/telemetry/ReceiptObservability.ts -> libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/Network/SequentialQueue.ts -> libs/telemetry/ReceiptObservability.ts
38. `src/libs/NetworkState.ts:12:17` (5 modules, cut #2)
   - libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/Network/SequentialQueue.ts -> libs/NetworkState.ts -> libs/Log.ts
39. `src/libs/ReportActionsUtils.ts:7:82` (5 modules, cut #10)
   - libs/ReportUtils.ts -> libs/AttendeeUtils.ts -> libs/OptionsListUtils/index.ts -> libs/AgentRuleChangeLogUtils.ts -> libs/ReportActionsUtils.ts -> libs/ReportUtils.ts
40. `src/libs/Request.ts:12:17` (5 modules, cut #2)
   - libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/Network/SequentialQueue.ts -> libs/Request.ts -> libs/Log.ts
41. `src/libs/RequestThrottle.ts:8:17` (5 modules, cut #2)
   - libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/Network/SequentialQueue.ts -> libs/RequestThrottle.ts -> libs/Log.ts
42. `src/libs/actions/IOU/TrackExpense.ts:112:78` (5 modules, cut #3)
   - libs/actions/IOU/MoneyRequestBuilder.ts -> libs/actions/IOU/SearchUpdate.ts -> libs/ReportUtils.ts -> libs/actions/IOU/MoneyRequest.ts -> libs/actions/IOU/TrackExpense.ts -> libs/actions/IOU/MoneyRequestBuilder.ts
43. `src/libs/actions/PersistedRequests.ts:1:17` (5 modules, cut #2)
   - libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/Network/SequentialQueue.ts -> libs/actions/PersistedRequests.ts -> libs/Log.ts
44. `src/libs/actions/Session/index.ts:3:22` (5 modules, cut #1)
   - libs/API/index.ts -> libs/API/makeRequest.ts -> libs/Middleware/index.ts -> libs/Middleware/HandleDeletedAccount.ts -> libs/actions/Session/index.ts -> libs/API/index.ts
45. `src/libs/telemetry/ReceiptObservability.ts:4:17` (5 modules, cut #2)
   - libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/Network/SequentialQueue.ts -> libs/telemetry/ReceiptObservability.ts -> libs/Log.ts
46. `src/components/MultifactorAuthentication/Context/MultifactorAuthenticationComposedContextProviders.tsx:8:43` (6 modules, cut #5)
   - components/MultifactorAuthentication/Context/stateReducer.ts -> components/MultifactorAuthentication/config/index.ts -> components/MultifactorAuthentication/config/scenarios/index.ts -> components/MultifactorAuthentication/config/scenarios/ChangePIN.tsx -> components/MultifactorAuthentication/Context/index.ts -> components/MultifactorAuthentication/Context/MultifactorAuthenticationComposedContextProviders.tsx -> components/MultifactorAuthentication/Context/stateReducer.ts
47. `src/components/MultifactorAuthentication/Context/index.ts:1:68` (6 modules, cut #5)
   - components/MultifactorAuthentication/Context/MultifactorAuthenticationComposedContextProviders.tsx -> components/MultifactorAuthentication/Context/stateReducer.ts -> components/MultifactorAuthentication/config/index.ts -> components/MultifactorAuthentication/config/scenarios/index.ts -> components/MultifactorAuthentication/config/scenarios/ChangePIN.tsx -> components/MultifactorAuthentication/Context/index.ts -> components/MultifactorAuthentication/Context/MultifactorAuthenticationComposedContextProviders.tsx
48. `src/components/MultifactorAuthentication/Context/stateReducer.ts:1:58` (6 modules, cut #5)
   - components/MultifactorAuthentication/config/index.ts -> components/MultifactorAuthentication/config/scenarios/index.ts -> components/MultifactorAuthentication/config/scenarios/ChangePIN.tsx -> components/MultifactorAuthentication/Context/index.ts -> components/MultifactorAuthentication/Context/MultifactorAuthenticationComposedContextProviders.tsx -> components/MultifactorAuthentication/Context/stateReducer.ts -> components/MultifactorAuthentication/config/index.ts
49. `src/components/MultifactorAuthentication/config/index.ts:4:56` (6 modules, cut #5)
   - components/MultifactorAuthentication/config/scenarios/index.ts -> components/MultifactorAuthentication/config/scenarios/ChangePIN.tsx -> components/MultifactorAuthentication/Context/index.ts -> components/MultifactorAuthentication/Context/MultifactorAuthenticationComposedContextProviders.tsx -> components/MultifactorAuthentication/Context/stateReducer.ts -> components/MultifactorAuthentication/config/index.ts -> components/MultifactorAuthentication/config/scenarios/index.ts
50. `src/components/MultifactorAuthentication/config/scenarios/ChangePIN.tsx:5:49` (6 modules, cut #5)
   - components/MultifactorAuthentication/Context/index.ts -> components/MultifactorAuthentication/Context/MultifactorAuthenticationComposedContextProviders.tsx -> components/MultifactorAuthentication/Context/stateReducer.ts -> components/MultifactorAuthentication/config/index.ts -> components/MultifactorAuthentication/config/scenarios/index.ts -> components/MultifactorAuthentication/config/scenarios/ChangePIN.tsx -> components/MultifactorAuthentication/Context/index.ts
51. `src/components/MultifactorAuthentication/config/scenarios/index.ts:8:48` (6 modules, cut #5)
   - components/MultifactorAuthentication/config/scenarios/ChangePIN.tsx -> components/MultifactorAuthentication/Context/index.ts -> components/MultifactorAuthentication/Context/MultifactorAuthenticationComposedContextProviders.tsx -> components/MultifactorAuthentication/Context/stateReducer.ts -> components/MultifactorAuthentication/config/index.ts -> components/MultifactorAuthentication/config/scenarios/index.ts -> components/MultifactorAuthentication/config/scenarios/ChangePIN.tsx
52. `src/libs/API/index.ts:22:38` (6 modules, cut #1)
   - libs/API/writeWhenReady.ts -> libs/API/makeRequest.ts -> libs/Middleware/index.ts -> libs/Middleware/HandleDeletedAccount.ts -> libs/actions/Session/index.ts -> libs/API/index.ts -> libs/API/writeWhenReady.ts
53. `src/libs/API/index.ts:26:23` (6 modules, cut #1)
   - libs/API/write.ts -> libs/API/makeRequest.ts -> libs/Middleware/index.ts -> libs/Middleware/HandleDeletedAccount.ts -> libs/actions/Session/index.ts -> libs/API/index.ts -> libs/API/write.ts
54. `src/libs/API/makeRequest.ts:15:44` (6 modules, cut #11)
   - libs/Middleware/LoadPostDataForOpenOrReconnect.ts -> libs/actions/App.ts -> libs/actions/Policy/Policy.ts -> libs/actions/Policy/Category.ts -> libs/API/index.ts -> libs/API/makeRequest.ts -> libs/Middleware/LoadPostDataForOpenOrReconnect.ts
55. `src/libs/API/write.ts:11:62` (6 modules, cut #1)
   - libs/API/makeRequest.ts -> libs/Middleware/index.ts -> libs/Middleware/HandleDeletedAccount.ts -> libs/actions/Session/index.ts -> libs/API/index.ts -> libs/API/write.ts -> libs/API/makeRequest.ts
56. `src/libs/API/writeWhenReady.ts:14:30` (6 modules, cut #1)
   - libs/API/makeRequest.ts -> libs/Middleware/index.ts -> libs/Middleware/HandleDeletedAccount.ts -> libs/actions/Session/index.ts -> libs/API/index.ts -> libs/API/writeWhenReady.ts -> libs/API/makeRequest.ts
57. `src/libs/Middleware/LoadPostDataForOpenOrReconnect.ts:3:46` (6 modules, cut #11)
   - libs/actions/App.ts -> libs/actions/Policy/Policy.ts -> libs/actions/Policy/Category.ts -> libs/API/index.ts -> libs/API/makeRequest.ts -> libs/Middleware/LoadPostDataForOpenOrReconnect.ts -> libs/actions/App.ts
58. `src/libs/ReportUtils.ts:116:8` (6 modules, cut #3)
   - libs/actions/IOU/MoneyRequest.ts -> libs/actions/IOU/TrackExpense.ts -> libs/actions/IOU/DeleteMoneyRequest.ts -> libs/actions/IOU/MoneyRequestBuilder.ts -> libs/actions/IOU/SearchUpdate.ts -> libs/ReportUtils.ts -> libs/actions/IOU/MoneyRequest.ts
59. `src/libs/Request.ts:9:38` (6 modules, cut #2)
   - libs/actions/QueuedOnyxUpdates.ts -> libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/Network/SequentialQueue.ts -> libs/Request.ts -> libs/actions/QueuedOnyxUpdates.ts
60. `src/libs/Request.ts:14:46` (6 modules, cut #2)
   - libs/Network/NetworkStore.ts -> libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/Network/SequentialQueue.ts -> libs/Request.ts -> libs/Network/NetworkStore.ts
61. `src/libs/SearchUIUtils.ts:106:33` (6 modules, cut #3)
   - libs/actions/IOU/MoneyRequest.ts -> libs/actions/IOU/TrackExpense.ts -> libs/actions/IOU/DeleteMoneyRequest.ts -> libs/actions/IOU/MoneyRequestBuilder.ts -> libs/actions/IOU/SearchUpdate.ts -> libs/SearchUIUtils.ts -> libs/actions/IOU/MoneyRequest.ts
62. `src/libs/actions/IOU/DeleteMoneyRequest.ts:46:82` (6 modules, cut #3)
   - libs/actions/IOU/MoneyRequestBuilder.ts -> libs/actions/IOU/SearchUpdate.ts -> libs/ReportUtils.ts -> libs/actions/IOU/MoneyRequest.ts -> libs/actions/IOU/TrackExpense.ts -> libs/actions/IOU/DeleteMoneyRequest.ts -> libs/actions/IOU/MoneyRequestBuilder.ts
63. `src/libs/actions/IOU/MoneyRequest.ts:75:42` (6 modules, cut #3)
   - libs/actions/IOU/TrackExpense.ts -> libs/actions/IOU/DeleteMoneyRequest.ts -> libs/actions/IOU/MoneyRequestBuilder.ts -> libs/actions/IOU/SearchUpdate.ts -> libs/ReportUtils.ts -> libs/actions/IOU/MoneyRequest.ts -> libs/actions/IOU/TrackExpense.ts
64. `src/libs/actions/IOU/MoneyRequestBuilder.ts:88:35` (6 modules, cut #3)
   - libs/actions/IOU/SearchUpdate.ts -> libs/ReportUtils.ts -> libs/PaymentUtils.ts -> libs/actions/IOU/ReportWorkflow.ts -> libs/actions/IOU/PayMoneyRequest.ts -> libs/actions/IOU/MoneyRequestBuilder.ts -> libs/actions/IOU/SearchUpdate.ts
65. `src/libs/actions/IOU/PayMoneyRequest.ts:55:44` (6 modules, cut #3)
   - libs/actions/IOU/MoneyRequestBuilder.ts -> libs/actions/IOU/SearchUpdate.ts -> libs/ReportUtils.ts -> libs/PaymentUtils.ts -> libs/actions/IOU/ReportWorkflow.ts -> libs/actions/IOU/PayMoneyRequest.ts -> libs/actions/IOU/MoneyRequestBuilder.ts
66. `src/libs/actions/IOU/TrackExpense.ts:125:115` (6 modules, cut #3)
   - libs/actions/IOU/DeleteMoneyRequest.ts -> libs/actions/IOU/MoneyRequestBuilder.ts -> libs/actions/IOU/SearchUpdate.ts -> libs/ReportUtils.ts -> libs/actions/IOU/MoneyRequest.ts -> libs/actions/IOU/TrackExpense.ts -> libs/actions/IOU/DeleteMoneyRequest.ts
67. `src/libs/actions/QueuedOnyxUpdates.ts:1:17` (6 modules, cut #2)
   - libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/Network/SequentialQueue.ts -> libs/Request.ts -> libs/actions/QueuedOnyxUpdates.ts -> libs/Log.ts
68. `src/libs/actions/Session/index.ts:30:24` (6 modules, cut #6)
   - libs/Navigation/Navigation.ts -> libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers.ts -> libs/Navigation/helpers/getStateFromPath.ts -> libs/Navigation/linkingConfig/index.ts -> libs/Navigation/linkingConfig/subscribe.ts -> libs/actions/Session/index.ts -> libs/Navigation/Navigation.ts
69. `src/libs/actions/Session/index.ts:57:26` (6 modules, cut #1)
   - libs/actions/Welcome/index.ts -> libs/API/index.ts -> libs/API/makeRequest.ts -> libs/Middleware/index.ts -> libs/Middleware/HandleDeletedAccount.ts -> libs/actions/Session/index.ts -> libs/actions/Welcome/index.ts
70. `src/libs/telemetry/ReceiptObservability.ts:1:68` (6 modules, cut #2)
   - libs/actions/PersistedRequests.ts -> libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/Network/SequentialQueue.ts -> libs/telemetry/ReceiptObservability.ts -> libs/actions/PersistedRequests.ts
71. `src/libs/telemetry/ReceiptObservability.ts:5:28` (6 modules, cut #2)
   - libs/NetworkState.ts -> libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/Network/SequentialQueue.ts -> libs/telemetry/ReceiptObservability.ts -> libs/NetworkState.ts
72. `src/libs/API/writeWhenReady.ts:15:19` (7 modules, cut #1)
   - libs/API/write.ts -> libs/API/makeRequest.ts -> libs/Middleware/index.ts -> libs/Middleware/HandleDeletedAccount.ts -> libs/actions/Session/index.ts -> libs/API/index.ts -> libs/API/writeWhenReady.ts -> libs/API/write.ts
73. `src/libs/HttpUtils.ts:21:40` (7 modules, cut #2)
   - libs/Prefetch/registerPrefetchOnAppStart/index.ts -> libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/Network/SequentialQueue.ts -> libs/Request.ts -> libs/HttpUtils.ts -> libs/Prefetch/registerPrefetchOnAppStart/index.ts
74. `src/libs/Middleware/SupportalPermission.ts:4:45` (7 modules, cut #1)
   - libs/actions/App.ts -> libs/actions/Policy/Policy.ts -> libs/actions/Policy/Category.ts -> libs/API/index.ts -> libs/API/makeRequest.ts -> libs/Middleware/index.ts -> libs/Middleware/SupportalPermission.ts -> libs/actions/App.ts
75. `src/libs/Middleware/index.ts:10:33` (7 modules, cut #1)
   - libs/Middleware/SupportalPermission.ts -> libs/actions/App.ts -> libs/actions/Policy/Policy.ts -> libs/actions/Policy/Category.ts -> libs/API/index.ts -> libs/API/makeRequest.ts -> libs/Middleware/index.ts -> libs/Middleware/SupportalPermission.ts
76. `src/libs/Network/MainQueue.ts:2:37` (7 modules, cut #2)
   - libs/Request.ts -> libs/HttpUtils.ts -> libs/Prefetch/preparePrefetchRequest/index.ts -> libs/Network/NetworkStore.ts -> libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/Request.ts
77. `src/libs/Prefetch/registerPrefetchOnAppStart/index.ts:7:17` (7 modules, cut #2)
   - libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/Network/SequentialQueue.ts -> libs/Request.ts -> libs/HttpUtils.ts -> libs/Prefetch/registerPrefetchOnAppStart/index.ts -> libs/Log.ts
78. `src/libs/Request.ts:13:31` (7 modules, cut #2)
   - libs/Network/enhanceParameters.ts -> libs/Network/NetworkStore.ts -> libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/Network/SequentialQueue.ts -> libs/Request.ts -> libs/Network/enhanceParameters.ts
79. `src/libs/actions/Delegate.ts:1:22` (7 modules, cut #1)
   - libs/API/index.ts -> libs/API/makeRequest.ts -> libs/Middleware/index.ts -> libs/Middleware/HandleDeletedAccount.ts -> libs/actions/Session/index.ts -> libs/Reauthentication.ts -> libs/actions/Delegate.ts -> libs/API/index.ts
80. `src/libs/HttpUtils.ts:20:36` (8 modules, cut #2)
   - libs/Prefetch/preparePrefetchRequest/index.ts -> libs/Network/NetworkStore.ts -> libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/Network/SequentialQueue.ts -> libs/Request.ts -> libs/HttpUtils.ts -> libs/Prefetch/preparePrefetchRequest/index.ts
81. `src/libs/Middleware/Reauthentication.ts:1:25` (8 modules, cut #1)
   - libs/actions/Reconnect.ts -> libs/actions/App.ts -> libs/actions/Policy/Policy.ts -> libs/actions/Policy/Category.ts -> libs/API/index.ts -> libs/API/makeRequest.ts -> libs/Middleware/index.ts -> libs/Middleware/Reauthentication.ts -> libs/actions/Reconnect.ts
82. `src/libs/Network/SequentialQueue.ts:20:37` (8 modules, cut #2)
   - libs/Request.ts -> libs/HttpUtils.ts -> libs/Prefetch/preparePrefetchRequest/index.ts -> libs/Network/NetworkStore.ts -> libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/Network/SequentialQueue.ts -> libs/Request.ts
83. `src/libs/Prefetch/preparePrefetchRequest/index.ts:1:28` (8 modules, cut #2)
   - libs/Network/NetworkStore.ts -> libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/Network/SequentialQueue.ts -> libs/Request.ts -> libs/HttpUtils.ts -> libs/Prefetch/preparePrefetchRequest/index.ts -> libs/Network/NetworkStore.ts
84. `src/libs/Prefetch/registerPrefetchOnAppStart/index.ts:9:30` (8 modules, cut #2)
   - libs/Network/NetworkStore.ts -> libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/Network/SequentialQueue.ts -> libs/Request.ts -> libs/HttpUtils.ts -> libs/Prefetch/registerPrefetchOnAppStart/index.ts -> libs/Network/NetworkStore.ts
85. `src/libs/Request.ts:11:23` (8 modules, cut #2)
   - libs/HttpUtils.ts -> libs/Prefetch/preparePrefetchRequest/index.ts -> libs/Network/NetworkStore.ts -> libs/Log.ts -> libs/Network/index.ts -> libs/Network/MainQueue.ts -> libs/Network/SequentialQueue.ts -> libs/Request.ts -> libs/HttpUtils.ts
86. `src/libs/actions/Reconnect.ts:12:28` (8 modules, cut #1)
   - libs/actions/App.ts -> libs/actions/Policy/Policy.ts -> libs/actions/Policy/Category.ts -> libs/API/index.ts -> libs/API/makeRequest.ts -> libs/Middleware/index.ts -> libs/Middleware/Reauthentication.ts -> libs/actions/Reconnect.ts -> libs/actions/App.ts
87. `src/libs/actions/Session/index.ts:49:41` (8 modules, cut #1)
   - libs/actions/App.ts -> libs/actions/Policy/Policy.ts -> libs/actions/Policy/Category.ts -> libs/API/index.ts -> libs/API/makeRequest.ts -> libs/Middleware/index.ts -> libs/Middleware/HandleDeletedAccount.ts -> libs/actions/Session/index.ts -> libs/actions/App.ts
88. `src/libs/actions/Session/index.ts:56:30` (8 modules, cut #6)
   - libs/actions/SignInRedirect.ts -> libs/actions/HybridApp/index.ts -> libs/Navigation/Navigation.ts -> libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers.ts -> libs/Navigation/helpers/getStateFromPath.ts -> libs/Navigation/linkingConfig/index.ts -> libs/Navigation/linkingConfig/subscribe.ts -> libs/actions/Session/index.ts -> libs/actions/SignInRedirect.ts

## Every finding

All 534, sorted by cycle size ascending. `cut #N` is the row of the edge-cut table above that
clears this finding. Full paths for the larger cycles are in the JSON.

| # | Location | Modules on cycle | Cleared by |
| --- | --- | --- | --- |
| 1 | `src/components/Text.tsx:3:39` | 2 | cut #7 |
| 2 | `src/libs/EmojiUtils.tsx:4:18` | 2 | cut #7 |
| 3 | `src/libs/GPSDraftDetailsUtils.ts:15:71` | 2 | cut #8 |
| 4 | `src/libs/actions/GPSDraftDetails.ts:1:82` | 2 | cut #8 |
| 5 | `src/components/ConnectToCertiniaFlow/index.tsx:12:34` | 3 | cut #4 |
| 6 | `src/components/ConnectToNetSuiteFlow/index.tsx:12:34` | 3 | cut #4 |
| 7 | `src/libs/DistanceRequestUtils.ts:22:85` | 3 | cut #9 |
| 8 | `src/libs/Network/index.ts:11:45` | 3 | cut #2 |
| 9 | `src/libs/OptionsListUtils/index.ts:123:31` | 3 | cut #10 |
| 10 | `src/libs/actions/connections/index.ts:5:30` | 3 | cut #12 |
| 11 | `src/pages/workspace/accounting/AccountingContext/index.tsx:13:44` | 3 | cut #4 |
| 12 | `src/pages/workspace/accounting/utils.tsx:1:35` | 3 | cut #4 |
| 13 | `src/pages/workspace/accounting/utils.tsx:3:35` | 3 | cut #4 |
| 14 | `src/components/ConnectToQuickbooksOnlineFlow/BaseConnectToQuickbooksOnlineFlow.tsx:15:34` | 4 | cut #4 |
| 15 | `src/components/ConnectToQuickbooksOnlineFlow/index.tsx:9:47` | 4 | cut #4 |
| 16 | `src/libs/Log.ts:12:20` | 4 | cut #2 |
| 17 | `src/libs/Navigation/linkingConfig/index.ts:1:37` | 4 | cut #6 |
| 18 | `src/libs/Network/MainQueue.ts:1:28` | 4 | cut #2 |
| 19 | `src/libs/Network/MainQueue.ts:9:32` | 4 | cut #2 |
| 20 | `src/libs/Network/MainQueue.ts:10:53` | 4 | cut #2 |
| 21 | `src/libs/Network/NetworkStore.ts:3:17` | 4 | cut #2 |
| 22 | `src/libs/Network/SequentialQueue.ts:18:17` | 4 | cut #2 |
| 23 | `src/libs/Network/index.ts:10:68` | 4 | cut #2 |
| 24 | `src/libs/PolicyUtils.ts:63:82` | 4 | cut #9 |
| 25 | `src/libs/actions/Report/index.ts:68:26` | 4 | cut #13 |
| 26 | `src/pages/workspace/accounting/utils.tsx:5:43` | 4 | cut #4 |
| 27 | `src/components/MultifactorAuthentication/Context/index.ts:5:43` | 5 | cut #5 |
| 28 | `src/components/MultifactorAuthentication/Context/usePromptContent.ts:3:52` | 5 | cut #5 |
| 29 | `src/libs/API/index.ts:24:62` | 5 | cut #1 |
| 30 | `src/libs/API/makeRequest.ts:13:8` | 5 | cut #1 |
| 31 | `src/libs/Middleware/HandleDeletedAccount.ts:1:42` | 5 | cut #1 |
| 32 | `src/libs/Middleware/index.ts:2:34` | 5 | cut #1 |
| 33 | `src/libs/Network/SequentialQueue.ts:14:8` | 5 | cut #2 |
| 34 | `src/libs/Network/SequentialQueue.ts:15:35` | 5 | cut #2 |
| 35 | `src/libs/Network/SequentialQueue.ts:19:86` | 5 | cut #2 |
| 36 | `src/libs/Network/SequentialQueue.ts:21:29` | 5 | cut #2 |
| 37 | `src/libs/Network/SequentialQueue.ts:22:60` | 5 | cut #2 |
| 38 | `src/libs/NetworkState.ts:12:17` | 5 | cut #2 |
| 39 | `src/libs/ReportActionsUtils.ts:7:82` | 5 | cut #10 |
| 40 | `src/libs/Request.ts:12:17` | 5 | cut #2 |
| 41 | `src/libs/RequestThrottle.ts:8:17` | 5 | cut #2 |
| 42 | `src/libs/actions/IOU/TrackExpense.ts:112:78` | 5 | cut #3 |
| 43 | `src/libs/actions/PersistedRequests.ts:1:17` | 5 | cut #2 |
| 44 | `src/libs/actions/Session/index.ts:3:22` | 5 | cut #1 |
| 45 | `src/libs/telemetry/ReceiptObservability.ts:4:17` | 5 | cut #2 |
| 46 | `src/components/MultifactorAuthentication/Context/MultifactorAuthenticationComposedContextProviders.tsx:8:43` | 6 | cut #5 |
| 47 | `src/components/MultifactorAuthentication/Context/index.ts:1:68` | 6 | cut #5 |
| 48 | `src/components/MultifactorAuthentication/Context/stateReducer.ts:1:58` | 6 | cut #5 |
| 49 | `src/components/MultifactorAuthentication/config/index.ts:4:56` | 6 | cut #5 |
| 50 | `src/components/MultifactorAuthentication/config/scenarios/ChangePIN.tsx:5:49` | 6 | cut #5 |
| 51 | `src/components/MultifactorAuthentication/config/scenarios/index.ts:8:48` | 6 | cut #5 |
| 52 | `src/libs/API/index.ts:22:38` | 6 | cut #1 |
| 53 | `src/libs/API/index.ts:26:23` | 6 | cut #1 |
| 54 | `src/libs/API/makeRequest.ts:15:44` | 6 | cut #11 |
| 55 | `src/libs/API/write.ts:11:62` | 6 | cut #1 |
| 56 | `src/libs/API/writeWhenReady.ts:14:30` | 6 | cut #1 |
| 57 | `src/libs/Middleware/LoadPostDataForOpenOrReconnect.ts:3:46` | 6 | cut #11 |
| 58 | `src/libs/ReportUtils.ts:116:8` | 6 | cut #3 |
| 59 | `src/libs/Request.ts:9:38` | 6 | cut #2 |
| 60 | `src/libs/Request.ts:14:46` | 6 | cut #2 |
| 61 | `src/libs/SearchUIUtils.ts:106:33` | 6 | cut #3 |
| 62 | `src/libs/actions/IOU/DeleteMoneyRequest.ts:46:82` | 6 | cut #3 |
| 63 | `src/libs/actions/IOU/MoneyRequest.ts:75:42` | 6 | cut #3 |
| 64 | `src/libs/actions/IOU/MoneyRequestBuilder.ts:88:35` | 6 | cut #3 |
| 65 | `src/libs/actions/IOU/PayMoneyRequest.ts:55:44` | 6 | cut #3 |
| 66 | `src/libs/actions/IOU/TrackExpense.ts:125:115` | 6 | cut #3 |
| 67 | `src/libs/actions/QueuedOnyxUpdates.ts:1:17` | 6 | cut #2 |
| 68 | `src/libs/actions/Session/index.ts:30:24` | 6 | cut #6 |
| 69 | `src/libs/actions/Session/index.ts:57:26` | 6 | cut #1 |
| 70 | `src/libs/telemetry/ReceiptObservability.ts:1:68` | 6 | cut #2 |
| 71 | `src/libs/telemetry/ReceiptObservability.ts:5:28` | 6 | cut #2 |
| 72 | `src/libs/API/writeWhenReady.ts:15:19` | 7 | cut #1 |
| 73 | `src/libs/HttpUtils.ts:21:40` | 7 | cut #2 |
| 74 | `src/libs/Middleware/SupportalPermission.ts:4:45` | 7 | cut #1 |
| 75 | `src/libs/Middleware/index.ts:10:33` | 7 | cut #1 |
| 76 | `src/libs/Network/MainQueue.ts:2:37` | 7 | cut #2 |
| 77 | `src/libs/Prefetch/registerPrefetchOnAppStart/index.ts:7:17` | 7 | cut #2 |
| 78 | `src/libs/Request.ts:13:31` | 7 | cut #2 |
| 79 | `src/libs/actions/Delegate.ts:1:22` | 7 | cut #1 |
| 80 | `src/libs/HttpUtils.ts:20:36` | 8 | cut #2 |
| 81 | `src/libs/Middleware/Reauthentication.ts:1:25` | 8 | cut #1 |
| 82 | `src/libs/Network/SequentialQueue.ts:20:37` | 8 | cut #2 |
| 83 | `src/libs/Prefetch/preparePrefetchRequest/index.ts:1:28` | 8 | cut #2 |
| 84 | `src/libs/Prefetch/registerPrefetchOnAppStart/index.ts:9:30` | 8 | cut #2 |
| 85 | `src/libs/Request.ts:11:23` | 8 | cut #2 |
| 86 | `src/libs/actions/Reconnect.ts:12:28` | 8 | cut #1 |
| 87 | `src/libs/actions/Session/index.ts:49:41` | 8 | cut #1 |
| 88 | `src/libs/actions/Session/index.ts:56:30` | 8 | cut #6 |
| 89 | `src/libs/Middleware/Reauthentication.ts:9:32` | 9 | cut #1 |
| 90 | `src/libs/Middleware/index.ts:7:30` | 9 | cut #1 |
| 91 | `src/libs/Network/enhanceParameters.ts:11:49` | 9 | cut #2 |
| 92 | `src/libs/Prefetch/registerPrefetchOnAppStart/index.ts:8:40` | 9 | cut #2 |
| 93 | `src/libs/actions/IOU/MoneyRequest.ts:13:31` | 9 | cut #3 |
| 94 | `src/libs/actions/Session/index.ts:52:46` | 9 | cut #1 |
| 95 | `src/libs/Middleware/SaveResponseInOnyx.ts:3:30` | 10 | cut #1 |
| 96 | `src/libs/Middleware/index.ts:9:32` | 10 | cut #1 |
| 97 | `src/libs/PusherUtils.ts:9:25` | 10 | cut #1 |
| 98 | `src/libs/Reauthentication.ts:13:61` | 10 | cut #1 |
| 99 | `src/libs/actions/Delegate.ts:29:23` | 10 | cut #1 |
| 100 | `src/libs/actions/IOU/TrackExpense.ts:136:35` | 10 | cut #3 |
| 101 | `src/libs/actions/OnyxUpdates.ts:3:25` | 10 | cut #1 |
| 102 | `src/libs/actions/Session/index.ts:38:28` | 10 | cut #1 |
| 103 | `src/libs/Navigation/helpers/lastVisitedTabPathUtils/index.ts:1:30` | 11 | cut #1 |
| 104 | `src/libs/Navigation/linkingConfig/subscribe.ts:1:28` | 11 | cut #1 |
| 105 | `src/libs/actions/Report/index.ts:80:24` | 11 | cut #1 |
| 106 | `src/libs/actions/SignInRedirect.ts:2:35` | 11 | cut #1 |
| 107 | `src/libs/Middleware/Reauthentication.ts:2:30` | 12 | cut #1 |
| 108 | `src/libs/Navigation/helpers/getReportRouteForCurrentContext.ts:1:24` | 12 | cut #1 |
| 109 | `src/libs/PageHTMLCapture/index.ts:1:24` | 12 | cut #1 |
| 110 | `src/libs/ReportUtils.ts:108:29` | 12 | cut #1 |
| 111 | `src/libs/ReportUtils.ts:121:57` | 12 | cut #1 |
| 112 | `src/libs/actions/Report/index.ts:73:35` | 12 | cut #1 |
| 113 | `src/libs/actions/Report/index.ts:75:32` | 12 | cut #1 |
| 114 | `src/libs/actions/Report/index.ts:76:45` | 12 | cut #1 |
| 115 | `src/libs/actions/Report/index.ts:87:29` | 12 | cut #1 |
| 116 | `src/libs/actions/Report/index.ts:198:38` | 12 | cut #1 |
| 117 | `src/libs/actions/Report/index.ts:213:37` | 12 | cut #1 |
| 118 | `src/libs/actions/navigateFromNotification/index.ts:1:24` | 12 | cut #1 |
| 119 | `src/libs/Reauthentication.ts:16:30` | 13 | cut #1 |
| 120 | `src/libs/ReportUtils.ts:107:36` | 13 | cut #1 |
| 121 | `src/libs/ReportUtils.ts:117:112` | 13 | cut #1 |
| 122 | `src/libs/ReportUtils.ts:118:36` | 13 | cut #1 |
| 123 | `src/libs/ReportUtils.ts:122:44` | 13 | cut #1 |
| 124 | `src/libs/actions/HybridApp/index.ts:1:24` | 13 | cut #1 |
| 125 | `src/libs/actions/IOU/ReportWorkflow.ts:5:22` | 13 | cut #1 |
| 126 | `src/libs/actions/Report/index.ts:91:39` | 13 | cut #1 |
| 127 | `src/libs/actions/Session/index.ts:1:48` | 13 | cut #6 |
| 128 | `src/libs/actions/SignInRedirect.ts:13:31` | 13 | cut #1 |
| 129 | `src/libs/Navigation/Navigation.ts:64:29` | 14 | cut #1 |
| 130 | `src/libs/PaymentUtils.ts:28:35` | 14 | cut #1 |
| 131 | `src/libs/ReportActionsUtils.ts:69:32` | 14 | cut #1 |
| 132 | `src/libs/ReportActionsUtils.ts:70:43` | 14 | cut #1 |
| 133 | `src/libs/actions/IOU/Hold.ts:3:22` | 14 | cut #1 |
| 134 | `src/libs/actions/IOU/PayMoneyRequest.ts:5:22` | 14 | cut #1 |
| 135 | `src/libs/actions/IOU/ReportWorkflow.ts:99:49` | 14 | cut #1 |
| 136 | `src/libs/actions/Report/index.ts:74:32` | 14 | cut #1 |
| 137 | `src/libs/actions/Session/index.ts:39:35` | 14 | cut #6 |
| 138 | `src/libs/Navigation/Navigation.ts:53:30` | 15 | cut #1 |
| 139 | `src/libs/ReportActionsUtils.ts:73:92` | 15 | cut #1 |
| 140 | `src/libs/ReportUtils.ts:180:8` | 15 | cut #1 |
| 141 | `src/libs/actions/IOU/PayMoneyRequest.ts:54:49` | 15 | cut #1 |
| 142 | `src/libs/actions/IOU/ReportWorkflow.ts:96:42` | 15 | cut #1 |
| 143 | `src/libs/actions/Report/index.ts:9:29` | 15 | cut #1 |
| 144 | `src/libs/actions/Report/index.ts:106:37` | 15 | cut #1 |
| 145 | `src/libs/CardUtils.ts:60:112` | 16 | cut #1 |
| 146 | `src/libs/LoginUtils.ts:8:24` | 16 | cut #1 |
| 147 | `src/libs/Middleware/HandleUnusedOptimisticID.ts:1:63` | 16 | cut #1 |
| 148 | `src/libs/Middleware/index.ts:3:38` | 16 | cut #1 |
| 149 | `src/libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers.ts:4:30` | 16 | cut #1 |
| 150 | `src/libs/Navigation/Navigation.ts:47:80` | 16 | cut #1 |
| 151 | `src/libs/Navigation/helpers/getStateFromPath.ts:2:29` | 16 | cut #1 |
| 152 | `src/libs/Navigation/helpers/linkTo/index.ts:2:30` | 16 | cut #1 |
| 153 | `src/libs/Navigation/linkingConfig/index.ts:9:23` | 16 | cut #1 |
| 154 | `src/libs/Notification/LocalNotification/BrowserNotifications.ts:7:34` | 16 | cut #1 |
| 155 | `src/libs/Notification/LocalNotification/index.ts:10:34` | 16 | cut #1 |
| 156 | `src/libs/PersonalDetailsUtils.ts:19:46` | 16 | cut #1 |
| 157 | `src/libs/PolicyDistanceRatesUtils.ts:20:35` | 16 | cut #1 |
| 158 | `src/libs/ReportActionsUtils.ts:57:50` | 16 | cut #1 |
| 159 | `src/libs/ReportUtils.ts:243:49` | 16 | cut #1 |
| 160 | `src/libs/ValidationUtils.ts:19:49` | 16 | cut #1 |
| 161 | `src/libs/actions/IOU/MoneyRequestBuilder.ts:59:53` | 16 | cut #1 |
| 162 | `src/libs/actions/IOU/PayMoneyRequest.ts:33:49` | 16 | cut #1 |
| 163 | `src/libs/actions/Policy/Member.ts:4:22` | 16 | cut #1 |
| 164 | `src/libs/actions/Policy/Tag.ts:6:22` | 16 | cut #1 |
| 165 | `src/libs/actions/Report/DeleteReport.ts:2:56` | 16 | cut #1 |
| 166 | `src/libs/actions/Report/index.ts:84:31` | 16 | cut #1 |
| 167 | `src/libs/actions/Report/index.ts:177:70` | 16 | cut #1 |
| 168 | `src/libs/actions/Report/index.ts:210:31` | 16 | cut #1 |
| 169 | `src/libs/actions/Report/index.ts:211:51` | 16 | cut #1 |
| 170 | `src/libs/actions/Report/index.ts:212:33` | 16 | cut #1 |
| 171 | `src/libs/actions/Report/index.ts:274:26` | 16 | cut #1 |
| 172 | `src/libs/actions/Transaction.ts:3:22` | 16 | cut #1 |
| 173 | `src/libs/Navigation/helpers/getAdaptedStateFromPath.ts:36:30` | 17 | cut #1 |
| 174 | `src/libs/Notification/LocalNotification/BrowserNotifications.ts:9:31` | 17 | cut #1 |
| 175 | `src/libs/OptionsListUtils/index.ts:16:68` | 17 | cut #1 |
| 176 | `src/libs/OptionsListUtils/index.ts:34:8` | 17 | cut #1 |
| 177 | `src/libs/OptionsListUtils/index.ts:174:65` | 17 | cut #1 |
| 178 | `src/libs/PaymentUtils.ts:32:49` | 17 | cut #1 |
| 179 | `src/libs/PolicyUtils.ts:62:89` | 17 | cut #1 |
| 180 | `src/libs/actions/IOU/ReportWorkflow.ts:32:8` | 17 | cut #1 |
| 181 | `src/libs/actions/Policy/Policy.ts:7:22` | 17 | cut #1 |
| 182 | `src/libs/actions/Report/index.ts:201:40` | 17 | cut #1 |
| 183 | `src/libs/ModifiedExpenseMessage.ts:30:8` | 18 | cut #1 |
| 184 | `src/libs/Navigation/Navigation.ts:59:20` | 18 | cut #1 |
| 185 | `src/libs/Navigation/helpers/dynamicRoutesUtils/getDynamicRouteAdaptedState.ts:2:30` | 18 | cut #1 |
| 186 | `src/libs/Navigation/helpers/getAdaptedStateFromPath.ts:29:41` | 18 | cut #1 |
| 187 | `src/libs/Navigation/helpers/linkTo/index.ts:1:60` | 18 | cut #1 |
| 188 | `src/libs/OptionsListUtils/index.ts:24:98` | 18 | cut #1 |
| 189 | `src/libs/PolicyUtils.ts:53:70` | 18 | cut #1 |
| 190 | `src/libs/ReportActionsUtils.ts:76:48` | 18 | cut #1 |
| 191 | `src/libs/ReportUtils.ts:138:30` | 18 | cut #1 |
| 192 | `src/libs/ReportUtils.ts:297:8` | 18 | cut #1 |
| 193 | `src/libs/ValidationUtils.ts:17:81` | 18 | cut #1 |
| 194 | `src/libs/WorkspaceReportFieldUtils.ts:13:35` | 18 | cut #1 |
| 195 | `src/libs/actions/BankAccounts.ts:5:22` | 18 | cut #1 |
| 196 | `src/libs/actions/IOU/PayMoneyRequest.ts:14:48` | 18 | cut #1 |
| 197 | `src/libs/actions/IOU/ReportWorkflow.ts:19:39` | 18 | cut #1 |
| 198 | `src/libs/actions/IOU/ReportWorkflow.ts:70:49` | 18 | cut #1 |
| 199 | `src/libs/actions/Link.ts:1:22` | 18 | cut #1 |
| 200 | `src/libs/actions/Policy/Category.ts:6:22` | 18 | cut #1 |
| 201 | `src/libs/actions/Policy/Member.ts:44:32` | 18 | cut #1 |
| 202 | `src/libs/actions/Policy/Policy.ts:103:33` | 18 | cut #1 |
| 203 | `src/libs/actions/Policy/Policy.ts:166:117` | 18 | cut #1 |
| 204 | `src/libs/actions/Report/index.ts:200:76` | 18 | cut #1 |
| 205 | `src/libs/actions/Search.ts:13:70` | 18 | cut #1 |
| 206 | `src/libs/actions/connections/QuickbooksOnline.ts:1:22` | 18 | cut #1 |
| 207 | `src/libs/LoginUtils.ts:7:48` | 19 | cut #1 |
| 208 | `src/libs/ModifiedExpenseMessage.ts:21:40` | 19 | cut #1 |
| 209 | `src/libs/NextStepUtils.ts:14:95` | 19 | cut #1 |
| 210 | `src/libs/Notification/LocalNotification/BrowserNotifications.ts:10:39` | 19 | cut #1 |
| 211 | `src/libs/OptionsListUtils/index.ts:8:92` | 19 | cut #1 |
| 212 | `src/libs/OptionsListUtils/index.ts:19:34` | 19 | cut #1 |
| 213 | `src/libs/PolicyUtils.ts:49:34` | 19 | cut #1 |
| 214 | `src/libs/PolicyUtils.ts:51:36` | 19 | cut #1 |
| 215 | `src/libs/PolicyUtils.ts:52:70` | 19 | cut #1 |
| 216 | `src/libs/PolicyUtils.ts:65:51` | 19 | cut #1 |
| 217 | `src/libs/ReportNameUtils.ts:37:72` | 19 | cut #1 |
| 218 | `src/libs/ReportUtils.ts:142:29` | 19 | cut #1 |
| 219 | `src/libs/SearchUIUtils.ts:105:46` | 19 | cut #1 |
| 220 | `src/libs/SearchUIUtils.ts:107:60` | 19 | cut #1 |
| 221 | `src/libs/TransactionPreviewUtils.ts:17:38` | 19 | cut #1 |
| 222 | `src/libs/actions/App.ts:3:22` | 19 | cut #1 |
| 223 | `src/libs/actions/BankAccounts.ts:53:45` | 19 | cut #1 |
| 224 | `src/libs/actions/BankAccounts.ts:66:64` | 19 | cut #1 |
| 225 | `src/libs/actions/BankAccounts.ts:67:91` | 19 | cut #1 |
| 226 | `src/libs/actions/IOU/Hold.ts:9:39` | 19 | cut #1 |
| 227 | `src/libs/actions/IOU/MoneyRequest.ts:38:40` | 19 | cut #1 |
| 228 | `src/libs/actions/IOU/MoneyRequestBuilder.ts:14:74` | 19 | cut #1 |
| 229 | `src/libs/actions/IOU/PayMoneyRequest.ts:12:39` | 19 | cut #1 |
| 230 | `src/libs/actions/IOU/PayMoneyRequest.ts:31:49` | 19 | cut #1 |
| 231 | `src/libs/actions/IOU/RejectMoneyRequest.ts:3:22` | 19 | cut #1 |
| 232 | `src/libs/actions/IOU/TrackExpense.ts:7:22` | 19 | cut #1 |
| 233 | `src/libs/actions/Link.ts:41:107` | 19 | cut #1 |
| 234 | `src/libs/actions/Link.ts:42:41` | 19 | cut #1 |
| 235 | `src/libs/actions/PaymentMethods.ts:3:22` | 19 | cut #1 |
| 236 | `src/libs/actions/Plaid.ts:1:22` | 19 | cut #1 |
| 237 | `src/libs/actions/Report/index.ts:101:8` | 19 | cut #1 |
| 238 | `src/libs/actions/Report/index.ts:108:103` | 19 | cut #1 |
| 239 | `src/libs/actions/Search.ts:109:43` | 19 | cut #1 |
| 240 | `src/libs/actions/Task.ts:5:22` | 19 | cut #1 |
| 241 | `src/libs/actions/Wallet.ts:1:22` | 19 | cut #1 |
| 242 | `src/libs/actions/Welcome/OnboardingFlow.ts:7:23` | 19 | cut #1 |
| 243 | `src/libs/actions/Welcome/index.ts:1:22` | 19 | cut #1 |
| 244 | `src/libs/actions/connections/index.ts:1:22` | 19 | cut #1 |
| 245 | `src/libs/interceptAnonymousUser.ts:1:26` | 19 | cut #1 |
| 246 | `src/libs/HRUtils.ts:13:46` | 20 | cut #1 |
| 247 | `src/libs/ModifiedExpenseMessage.ts:37:81` | 20 | cut #1 |
| 248 | `src/libs/OptionsListUtils/index.ts:121:8` | 20 | cut #1 |
| 249 | `src/libs/OptionsListUtils/index.ts:122:39` | 20 | cut #1 |
| 250 | `src/libs/OptionsListUtils/index.ts:175:116` | 20 | cut #1 |
| 251 | `src/libs/PolicyUtils.ts:58:123` | 20 | cut #1 |
| 252 | `src/libs/ReportActionsUtils.ts:77:69` | 20 | cut #1 |
| 253 | `src/libs/ReportNameUtils.ts:28:92` | 20 | cut #1 |
| 254 | `src/libs/ReportNameUtils.ts:36:48` | 20 | cut #1 |
| 255 | `src/libs/ReportNameUtils.ts:186:116` | 20 | cut #1 |
| 256 | `src/libs/ReportTitleUtils.ts:12:35` | 20 | cut #1 |
| 257 | `src/libs/ReportUtils.ts:98:101` | 20 | cut #1 |
| 258 | `src/libs/ReportUtils.ts:135:35` | 20 | cut #1 |
| 259 | `src/libs/ReportUtils.ts:136:32` | 20 | cut #1 |
| 260 | `src/libs/ReportUtils.ts:137:43` | 20 | cut #1 |
| 261 | `src/libs/ReportUtils.ts:143:41` | 20 | cut #1 |
| 262 | `src/libs/ReportUtils.ts:148:44` | 20 | cut #1 |
| 263 | `src/libs/ReportUtils.ts:244:31` | 20 | cut #1 |
| 264 | `src/libs/SearchQueryUtils.ts:71:63` | 20 | cut #1 |
| 265 | `src/libs/SearchUIUtils.ts:102:43` | 20 | cut #1 |
| 266 | `src/libs/WorkspacesSettingsUtils.ts:13:88` | 20 | cut #1 |
| 267 | `src/libs/actions/IOU/DeleteMoneyRequest.ts:3:22` | 20 | cut #1 |
| 268 | `src/libs/actions/IOU/MoneyRequest.ts:39:81` | 20 | cut #1 |
| 269 | `src/libs/actions/IOU/MoneyRequestBuilder.ts:11:39` | 20 | cut #1 |
| 270 | `src/libs/actions/IOU/ReportWorkflow.ts:80:8` | 20 | cut #1 |
| 271 | `src/libs/actions/IOU/TrackExpense.ts:90:40` | 20 | cut #1 |
| 272 | `src/libs/actions/Policy/Member.ts:22:82` | 20 | cut #1 |
| 273 | `src/libs/actions/Policy/Tag.ts:28:30` | 20 | cut #1 |
| 274 | `src/libs/actions/ReimbursementAccount/index.ts:14:36` | 20 | cut #1 |
| 275 | `src/libs/actions/ReimbursementAccount/index.ts:15:33` | 20 | cut #1 |
| 276 | `src/libs/actions/ReimbursementAccount/resetNonUSDBankAccount.ts:1:22` | 20 | cut #1 |
| 277 | `src/libs/actions/ReimbursementAccount/resetUSDBankAccount.ts:1:22` | 20 | cut #1 |
| 278 | `src/libs/actions/Report/index.ts:83:39` | 20 | cut #1 |
| 279 | `src/libs/actions/Report/index.ts:107:45` | 20 | cut #1 |
| 280 | `src/libs/actions/Search.ts:108:42` | 20 | cut #1 |
| 281 | `src/libs/actions/Search.ts:113:35` | 20 | cut #1 |
| 282 | `src/libs/actions/Search.ts:114:57` | 20 | cut #1 |
| 283 | `src/libs/actions/Task.ts:41:33` | 20 | cut #1 |
| 284 | `src/libs/actions/Transaction.ts:21:78` | 20 | cut #1 |
| 285 | `src/libs/actions/TransactionEdit.ts:12:37` | 20 | cut #1 |
| 286 | `src/libs/actions/connections/MergeHR.ts:1:21` | 20 | cut #1 |
| 287 | `src/libs/actions/connections/index.ts:18:27` | 20 | cut #1 |
| 288 | `src/libs/AgentRuleChangeLogUtils.ts:8:50` | 21 | cut #1 |
| 289 | `src/libs/CardFeedUtils.ts:42:29` | 21 | cut #1 |
| 290 | `src/libs/ModifiedExpenseMessage.ts:31:59` | 21 | cut #1 |
| 291 | `src/libs/ModifiedExpenseMessage.ts:38:58` | 21 | cut #1 |
| 292 | `src/libs/ModifiedExpenseMessage.ts:39:38` | 21 | cut #1 |
| 293 | `src/libs/Navigation/helpers/getReportURLForCurrentContext.ts:2:24` | 21 | cut #1 |
| 294 | `src/libs/Notification/LocalNotification/BrowserNotifications.ts:11:30` | 21 | cut #1 |
| 295 | `src/libs/PaymentUtils.ts:31:24` | 21 | cut #1 |
| 296 | `src/libs/PolicyDistanceRatesUtils.ts:18:32` | 21 | cut #1 |
| 297 | `src/libs/ReportUtils.ts:150:143` | 21 | cut #1 |
| 298 | `src/libs/SearchQueryUtils.ts:66:30` | 21 | cut #1 |
| 299 | `src/libs/SearchUIUtils.ts:135:8` | 21 | cut #1 |
| 300 | `src/libs/TransactionUtils/index.ts:10:59` | 21 | cut #1 |
| 301 | `src/libs/TransactionUtils/index.ts:15:34` | 21 | cut #1 |
| 302 | `src/libs/Violations/ViolationsUtils.ts:27:8` | 21 | cut #1 |
| 303 | `src/libs/actions/App.ts:43:108` | 21 | cut #1 |
| 304 | `src/libs/actions/BankAccounts.ts:29:32` | 21 | cut #1 |
| 305 | `src/libs/actions/IOU/Hold.ts:33:25` | 21 | cut #1 |
| 306 | `src/libs/actions/IOU/NavigationHelpers.ts:4:57` | 21 | cut #1 |
| 307 | `src/libs/actions/IOU/TrackExpense.ts:86:31` | 21 | cut #1 |
| 308 | `src/libs/actions/Policy/Policy.ts:95:30` | 21 | cut #1 |
| 309 | `src/libs/actions/Policy/Policy.ts:105:29` | 21 | cut #1 |
| 310 | `src/libs/actions/Report/index.ts:92:42` | 21 | cut #1 |
| 311 | `src/libs/actions/Report/index.ts:102:37` | 21 | cut #1 |
| 312 | `src/libs/actions/Transaction.ts:15:34` | 21 | cut #1 |
| 313 | `src/libs/actions/Transaction.ts:18:39` | 21 | cut #1 |
| 314 | `src/libs/processReportIDDeeplink/getReportIDFromUrl.ts:1:38` | 21 | cut #1 |
| 315 | `src/libs/processReportIDDeeplink/index.ts:1:32` | 21 | cut #1 |
| 316 | `src/libs/ExpensifyCardFeedSelectorUtils.ts:18:64` | 22 | cut #1 |
| 317 | `src/libs/NextStepUtils.ts:27:47` | 22 | cut #1 |
| 318 | `src/libs/OptionsListUtils/index.ts:20:24` | 22 | cut #1 |
| 319 | `src/libs/ReportNameUtils.ts:139:8` | 22 | cut #1 |
| 320 | `src/libs/ReportNameUtils.ts:187:46` | 22 | cut #1 |
| 321 | `src/libs/ReportPrimaryActionUtils.ts:24:8` | 22 | cut #1 |
| 322 | `src/libs/ReportUtils.ts:97:55` | 22 | cut #1 |
| 323 | `src/libs/ReportUtils.ts:124:39` | 22 | cut #1 |
| 324 | `src/libs/SearchUIUtils.ts:149:30` | 22 | cut #1 |
| 325 | `src/libs/TransactionPreviewUtils.ts:21:78` | 22 | cut #1 |
| 326 | `src/libs/TransactionUtils/getDistanceInMeters.ts:1:34` | 22 | cut #1 |
| 327 | `src/libs/TransactionUtils/index.ts:32:8` | 22 | cut #1 |
| 328 | `src/libs/TransactionUtils/index.ts:45:8` | 22 | cut #1 |
| 329 | `src/libs/TransactionUtils/index.ts:101:33` | 22 | cut #1 |
| 330 | `src/libs/Violations/ViolationsUtils.ts:9:34` | 22 | cut #1 |
| 331 | `src/libs/actions/BankAccounts.ts:33:34` | 22 | cut #1 |
| 332 | `src/libs/actions/BankAccounts.ts:54:37` | 22 | cut #1 |
| 333 | `src/libs/actions/IOU/MoneyRequest.ts:14:86` | 22 | cut #1 |
| 334 | `src/libs/actions/IOU/MoneyRequestBuilder.ts:56:8` | 22 | cut #1 |
| 335 | `src/libs/actions/IOU/ReportWorkflow.ts:17:24` | 22 | cut #1 |
| 336 | `src/libs/actions/IOU/TrackExpense.ts:85:91` | 22 | cut #1 |
| 337 | `src/libs/actions/Policy/Category.ts:35:74` | 22 | cut #1 |
| 338 | `src/libs/actions/Policy/Category.ts:38:47` | 22 | cut #1 |
| 339 | `src/libs/actions/Policy/Policy.ts:89:39` | 22 | cut #1 |
| 340 | `src/libs/actions/ReimbursementAccount/index.ts:17:74` | 22 | cut #1 |
| 341 | `src/libs/actions/Report/index.ts:189:8` | 22 | cut #1 |
| 342 | `src/libs/actions/Search.ts:48:8` | 22 | cut #1 |
| 343 | `src/libs/actions/connections/QuickbooksOnline.ts:9:29` | 22 | cut #1 |
| 344 | `src/libs/AttendeeUtils.ts:10:34` | 23 | cut #1 |
| 345 | `src/libs/ReportUtils.ts:103:39` | 23 | cut #1 |
| 346 | `src/libs/ReportUtils.ts:301:38` | 23 | cut #1 |
| 347 | `src/libs/ReportUtils.ts:302:29` | 23 | cut #1 |
| 348 | `src/libs/SpendRuleChangeLogUtils.ts:15:50` | 23 | cut #1 |
| 349 | `src/libs/TaskUtils.ts:11:24` | 23 | cut #1 |
| 350 | `src/libs/actions/IOU/Hold.ts:8:24` | 23 | cut #1 |
| 351 | `src/libs/actions/IOU/MoneyRequest.ts:7:34` | 23 | cut #1 |
| 352 | `src/libs/actions/IOU/PayMoneyRequest.ts:11:24` | 23 | cut #1 |
| 353 | `src/libs/actions/IOU/PayMoneyRequest.ts:36:37` | 23 | cut #1 |
| 354 | `src/libs/actions/IOU/RejectMoneyRequest.ts:11:42` | 23 | cut #1 |
| 355 | `src/libs/actions/IOU/ReportWorkflow.ts:20:40` | 23 | cut #1 |
| 356 | `src/libs/actions/IOU/TrackExpense.ts:25:74` | 23 | cut #1 |
| 357 | `src/libs/actions/PaymentMethods.ts:20:28` | 23 | cut #1 |
| 358 | `src/libs/actions/PaymentMethods.ts:21:45` | 23 | cut #1 |
| 359 | `src/libs/actions/Policy/Tag.ts:31:35` | 23 | cut #1 |
| 360 | `src/libs/actions/Search.ts:69:49` | 23 | cut #1 |
| 361 | `src/libs/actions/Transaction.ts:64:8` | 23 | cut #1 |
| 362 | `src/libs/DistanceRequestUtils.ts:20:90` | 24 | cut #1 |
| 363 | `src/libs/MoneyRequestUtils.ts:12:101` | 24 | cut #1 |
| 364 | `src/libs/PolicyUtils.ts:59:24` | 24 | cut #1 |
| 365 | `src/libs/SearchUIUtils.ts:115:36` | 24 | cut #1 |
| 366 | `src/libs/SearchUIUtils.ts:229:8` | 24 | cut #1 |
| 367 | `src/libs/SubscriptionUtils.ts:21:51` | 24 | cut #1 |
| 368 | `src/libs/TaskUtils.ts:13:56` | 24 | cut #1 |
| 369 | `src/libs/Violations/ViolationsUtils.ts:29:35` | 24 | cut #1 |
| 370 | `src/libs/actions/BankAccounts.ts:34:53` | 24 | cut #1 |
| 371 | `src/libs/actions/IOU/MoneyRequestBuilder.ts:9:38` | 24 | cut #1 |
| 372 | `src/libs/actions/IOU/RejectMoneyRequest.ts:10:39` | 24 | cut #1 |
| 373 | `src/libs/actions/IOU/TrackExpense.ts:12:34` | 24 | cut #1 |
| 374 | `src/libs/actions/Plaid.ts:5:34` | 24 | cut #1 |
| 375 | `src/libs/actions/Policy/Category.ts:30:26` | 24 | cut #1 |
| 376 | `src/libs/actions/Policy/Policy.ts:98:43` | 24 | cut #1 |
| 377 | `src/libs/IOUUtils.ts:17:29` | 25 | cut #1 |
| 378 | `src/libs/ReportPrimaryActionUtils.ts:68:8` | 25 | cut #1 |
| 379 | `src/libs/TransactionPreviewUtils.ts:51:8` | 25 | cut #1 |
| 380 | `src/libs/actions/BankAccounts.ts:30:24` | 25 | cut #1 |
| 381 | `src/libs/actions/IOU/Hold.ts:35:31` | 25 | cut #1 |
| 382 | `src/libs/actions/IOU/MoneyRequest.ts:34:8` | 25 | cut #1 |
| 383 | `src/libs/actions/IOU/PayMoneyRequest.ts:13:47` | 25 | cut #1 |
| 384 | `src/libs/actions/IOU/PayMoneyRequest.ts:35:51` | 25 | cut #1 |
| 385 | `src/libs/actions/IOU/ReportWorkflow.ts:33:154` | 25 | cut #1 |
| 386 | `src/libs/actions/IOU/ReportWorkflow.ts:68:8` | 25 | cut #1 |
| 387 | `src/libs/actions/IOU/ReportWorkflow.ts:81:35` | 25 | cut #1 |
| 388 | `src/libs/actions/Search.ts:71:46` | 25 | cut #1 |
| 389 | `src/libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute.ts:2:24` | 26 | cut #1 |
| 390 | `src/libs/SearchUIUtils.ts:118:24` | 26 | cut #1 |
| 391 | `src/libs/actions/IOU/Hold.ts:11:102` | 26 | cut #1 |
| 392 | `src/libs/actions/IOU/Hold.ts:12:29` | 26 | cut #1 |
| 393 | `src/libs/actions/IOU/PayMoneyRequest.ts:15:134` | 26 | cut #1 |
| 394 | `src/libs/actions/IOU/PayMoneyRequest.ts:29:8` | 26 | cut #1 |
| 395 | `src/libs/actions/IOU/RejectMoneyRequest.ts:31:38` | 26 | cut #1 |
| 396 | `src/libs/actions/IOU/TrackExpense.ts:82:8` | 26 | cut #1 |
| 397 | `src/libs/actions/PaymentMethods.ts:18:24` | 26 | cut #1 |
| 398 | `src/libs/NextStepUtils.ts:15:80` | 27 | cut #1 |
| 399 | `src/libs/NextStepUtils.ts:26:8` | 27 | cut #1 |
| 400 | `src/libs/SearchQueryUtils.ts:70:74` | 27 | cut #1 |
| 401 | `src/libs/SearchUIUtils.ts:121:69` | 27 | cut #1 |
| 402 | `src/libs/SearchUIUtils.ts:202:38` | 27 | cut #1 |
| 403 | `src/libs/TransactionPreviewUtils.ts:20:32` | 27 | cut #1 |
| 404 | `src/libs/actions/IOU/DeleteMoneyRequest.ts:27:100` | 27 | cut #1 |
| 405 | `src/libs/actions/IOU/MoneyRequest.ts:9:40` | 27 | cut #1 |
| 406 | `src/libs/actions/IOU/MoneyRequest.ts:11:24` | 27 | cut #1 |
| 407 | `src/libs/actions/IOU/MoneyRequestBuilder.ts:15:99` | 27 | cut #1 |
| 408 | `src/libs/actions/IOU/MoneyRequestBuilder.ts:16:99` | 27 | cut #1 |
| 409 | `src/libs/actions/IOU/MoneyRequestBuilder.ts:57:29` | 27 | cut #1 |
| 410 | `src/libs/actions/ReimbursementAccount/navigation.ts:2:24` | 27 | cut #1 |
| 411 | `src/libs/actions/Search.ts:32:41` | 27 | cut #1 |
| 412 | `src/libs/actions/Search.ts:37:36` | 27 | cut #1 |
| 413 | `src/libs/IOUUtils.ts:21:64` | 28 | cut #1 |
| 414 | `src/libs/SearchQueryUtils.ts:62:34` | 28 | cut #1 |
| 415 | `src/libs/SearchQueryUtils.ts:72:39` | 28 | cut #1 |
| 416 | `src/libs/SearchUIUtils.ts:108:45` | 28 | cut #1 |
| 417 | `src/libs/SearchUIUtils.ts:110:39` | 28 | cut #1 |
| 418 | `src/libs/SearchUIUtils.ts:112:87` | 28 | cut #1 |
| 419 | `src/libs/SearchUIUtils.ts:148:39` | 28 | cut #1 |
| 420 | `src/libs/TransactionUtils/index.ts:33:73` | 28 | cut #1 |
| 421 | `src/libs/TransactionUtils/index.ts:47:38` | 28 | cut #1 |
| 422 | `src/libs/actions/IOU/RejectMoneyRequest.ts:9:29` | 28 | cut #1 |
| 423 | `src/libs/actions/IOU/SearchUpdate.ts:3:59` | 28 | cut #1 |
| 424 | `src/libs/actions/IOU/SearchUpdate.ts:5:57` | 28 | cut #1 |
| 425 | `src/libs/actions/IOU/TrackExpense.ts:16:98` | 28 | cut #1 |
| 426 | `src/libs/actions/IOU/TrackExpense.ts:19:24` | 28 | cut #1 |
| 427 | `src/libs/actions/IOU/TrackExpense.ts:91:37` | 28 | cut #1 |
| 428 | `src/libs/actions/Policy/Tag.ts:30:88` | 28 | cut #1 |
| 429 | `src/libs/actions/Search.ts:39:40` | 28 | cut #1 |
| 430 | `src/libs/CardFeedUtils.ts:22:41` | 29 | cut #1 |
| 431 | `src/libs/SearchQueryUtils.ts:61:38` | 29 | cut #1 |
| 432 | `src/libs/SearchQueryUtils.ts:76:27` | 29 | cut #1 |
| 433 | `src/libs/SearchUIUtils.ts:103:39` | 29 | cut #1 |
| 434 | `src/libs/SearchUIUtils.ts:147:8` | 29 | cut #1 |
| 435 | `src/libs/SearchUIUtils.ts:182:8` | 29 | cut #1 |
| 436 | `src/libs/SearchUIUtils.ts:232:38` | 29 | cut #1 |
| 437 | `src/libs/actions/IOU/DeleteMoneyRequest.ts:9:38` | 29 | cut #1 |
| 438 | `src/libs/actions/IOU/DeleteMoneyRequest.ts:10:24` | 29 | cut #1 |
| 439 | `src/libs/actions/IOU/MoneyRequest.ts:12:54` | 29 | cut #1 |
| 440 | `src/libs/actions/IOU/SearchUpdate.ts:4:131` | 29 | cut #1 |
| 441 | `src/libs/actions/IOU/TrackExpense.ts:14:47` | 29 | cut #1 |
| 442 | `src/libs/actions/IOU/TrackExpense.ts:23:60` | 29 | cut #1 |
| 443 | `src/libs/actions/Search.ts:115:46` | 29 | cut #1 |
| 444 | `src/libs/getWorkspaceCreatedAnalyticsEvent.ts:5:35` | 29 | cut #1 |
| 445 | `src/libs/CardFeedUtils.ts:41:47` | 30 | cut #1 |
| 446 | `src/libs/ExpensifyCardFeedSelectorUtils.ts:17:8` | 30 | cut #1 |
| 447 | `src/libs/IOUUtils.ts:15:32` | 30 | cut #1 |
| 448 | `src/libs/IOUUtils.ts:16:24` | 30 | cut #1 |
| 449 | `src/libs/MoneyRequestUtils.ts:10:44` | 30 | cut #1 |
| 450 | `src/libs/MoneyRequestUtils.ts:13:38` | 30 | cut #1 |
| 451 | `src/libs/Navigation/helpers/navigateAfterExpenseCreate.ts:5:41` | 30 | cut #1 |
| 452 | `src/libs/Navigation/helpers/navigateAfterExpenseCreate.ts:14:49` | 30 | cut #1 |
| 453 | `src/libs/ReportNameUtils.ts:185:8` | 30 | cut #1 |
| 454 | `src/libs/ReportPrimaryActionUtils.ts:33:8` | 30 | cut #1 |
| 455 | `src/libs/ReportPrimaryActionUtils.ts:56:8` | 30 | cut #1 |
| 456 | `src/libs/SearchUIUtils.ts:200:8` | 30 | cut #1 |
| 457 | `src/libs/TransactionPreviewUtils.ts:15:66` | 30 | cut #1 |
| 458 | `src/libs/TransactionPreviewUtils.ts:29:8` | 30 | cut #1 |
| 459 | `src/libs/TransactionPreviewUtils.ts:52:38` | 30 | cut #1 |
| 460 | `src/libs/TransactionPreviewUtils.ts:53:73` | 30 | cut #1 |
| 461 | `src/libs/Violations/ViolationsUtils.ts:5:71` | 30 | cut #1 |
| 462 | `src/libs/Violations/ViolationsUtils.ts:6:30` | 30 | cut #1 |
| 463 | `src/libs/actions/IOU/MoneyRequest.ts:21:8` | 30 | cut #1 |
| 464 | `src/libs/actions/IOU/NavigationHelpers.ts:2:40` | 30 | cut #1 |
| 465 | `src/libs/actions/IOU/RejectMoneyRequest.ts:34:31` | 30 | cut #1 |
| 466 | `src/libs/actions/IOU/TrackExpense.ts:88:36` | 30 | cut #1 |
| 467 | `src/libs/actions/IOU/TrackExpense.ts:134:57` | 30 | cut #1 |
| 468 | `src/libs/actions/Policy/Policy.ts:106:37` | 30 | cut #1 |
| 469 | `src/libs/actions/Search.ts:49:54` | 30 | cut #1 |
| 470 | `src/libs/actions/Search.ts:67:30` | 30 | cut #1 |
| 471 | `src/libs/actions/Welcome/OnboardingFlow.ts:3:29` | 30 | cut #1 |
| 472 | `src/libs/Navigation/helpers/dismissModalAndOpenReportInInboxTab.ts:2:41` | 31 | cut #1 |
| 473 | `src/libs/PerDiemRequestUtils.ts:16:35` | 31 | cut #1 |
| 474 | `src/libs/Violations/ViolationsUtils.ts:28:38` | 31 | cut #1 |
| 475 | `src/libs/actions/App.ts:10:36` | 31 | cut #1 |
| 476 | `src/libs/actions/ClearReportActionErrors.ts:15:26` | 31 | cut #1 |
| 477 | `src/libs/actions/IOU/DeleteMoneyRequest.ts:30:49` | 31 | cut #1 |
| 478 | `src/libs/actions/IOU/DeleteMoneyRequest.ts:31:40` | 31 | cut #1 |
| 479 | `src/libs/actions/IOU/RejectMoneyRequest.ts:12:39` | 31 | cut #1 |
| 480 | `src/libs/actions/IOU/RejectMoneyRequest.ts:30:8` | 31 | cut #1 |
| 481 | `src/libs/actions/IOU/TrackExpense.ts:37:8` | 31 | cut #1 |
| 482 | `src/libs/actions/IOU/TrackExpense.ts:38:99` | 31 | cut #1 |
| 483 | `src/libs/actions/Policy/Policy.ts:85:47` | 31 | cut #1 |
| 484 | `src/libs/actions/Policy/Policy.ts:93:39` | 31 | cut #1 |
| 485 | `src/libs/actions/Search.ts:66:90` | 31 | cut #1 |
| 486 | `src/libs/actions/Transaction.ts:29:8` | 31 | cut #1 |
| 487 | `src/libs/actions/Transaction.ts:49:8` | 31 | cut #1 |
| 488 | `src/libs/actions/Transaction.ts:65:29` | 31 | cut #1 |
| 489 | `src/libs/actions/Welcome/OnboardingFlow.ts:2:37` | 31 | cut #1 |
| 490 | `src/libs/actions/Welcome/OnboardingFlow.ts:4:41` | 31 | cut #1 |
| 491 | `src/libs/actions/App.ts:12:41` | 32 | cut #1 |
| 492 | `src/libs/actions/IOU/DeleteMoneyRequest.ts:11:122` | 32 | cut #1 |
| 493 | `src/libs/actions/IOU/DeleteMoneyRequest.ts:26:8` | 32 | cut #1 |
| 494 | `src/libs/actions/Link.ts:9:30` | 32 | cut #1 |
| 495 | `src/libs/actions/Policy/Member.ts:23:37` | 32 | cut #1 |
| 496 | `src/libs/actions/Policy/Member.ts:24:30` | 32 | cut #1 |
| 497 | `src/libs/actions/Policy/Tag.ts:35:47` | 32 | cut #1 |
| 498 | `src/libs/actions/Task.ts:10:32` | 32 | cut #1 |
| 499 | `src/libs/actions/Task.ts:12:24` | 32 | cut #1 |
| 500 | `src/libs/IOUUtils.ts:18:56` | 33 | cut #1 |
| 501 | `src/libs/IOUUtils.ts:19:106` | 33 | cut #1 |
| 502 | `src/libs/Navigation/helpers/swapBackgroundTabForRHPTarget.ts:14:30` | 33 | cut #1 |
| 503 | `src/libs/Navigation/helpers/willRouteNavigateToRHP.ts:4:30` | 33 | cut #1 |
| 504 | `src/libs/actions/ClearReportActionErrors.ts:1:124` | 33 | cut #1 |
| 505 | `src/libs/actions/ClearReportActionErrors.ts:2:35` | 33 | cut #1 |
| 506 | `src/libs/actions/Link.ts:14:36` | 33 | cut #1 |
| 507 | `src/libs/actions/PaymentMethods.ts:15:28` | 33 | cut #1 |
| 508 | `src/libs/actions/Policy/Category.ts:34:33` | 33 | cut #1 |
| 509 | `src/libs/actions/Policy/Policy.ts:97:30` | 33 | cut #1 |
| 510 | `src/libs/actions/Task.ts:15:39` | 33 | cut #1 |
| 511 | `src/libs/Navigation/helpers/navigateAfterExpenseCreate.ts:6:65` | 34 | cut #1 |
| 512 | `src/libs/actions/ClearReportActionErrors.ts:3:43` | 34 | cut #1 |
| 513 | `src/libs/actions/Link.ts:13:43` | 34 | cut #1 |
| 514 | `src/libs/actions/Link.ts:15:24` | 34 | cut #1 |
| 515 | `src/libs/actions/Policy/Category.ts:36:88` | 34 | cut #1 |
| 516 | `src/libs/actions/Policy/Tag.ts:23:26` | 34 | cut #1 |
| 517 | `src/libs/actions/Task.ts:14:35` | 34 | cut #1 |
| 518 | `src/libs/actions/Task.ts:17:39` | 34 | cut #1 |
| 519 | `src/libs/actions/Task.ts:40:120` | 34 | cut #1 |
| 520 | `src/libs/Navigation/helpers/linkTo/index.ts:5:29` | 35 | cut #1 |
| 521 | `src/libs/Navigation/helpers/swapBackgroundTabForRHPTarget.ts:13:42` | 35 | cut #1 |
| 522 | `src/libs/Navigation/helpers/swapBackgroundTabForRHPTarget.ts:15:48` | 35 | cut #1 |
| 523 | `src/libs/actions/App.ts:14:43` | 35 | cut #1 |
| 524 | `src/libs/actions/Task.ts:16:37` | 35 | cut #1 |
| 525 | `src/libs/actions/Task.ts:18:30` | 35 | cut #1 |
| 526 | `src/libs/actions/Welcome/index.ts:6:24` | 35 | cut #1 |
| 527 | `src/libs/actions/Link.ts:40:75` | 36 | cut #1 |
| 528 | `src/libs/actions/Search.ts:28:26` | 36 | cut #1 |
| 529 | `src/libs/actions/Task.ts:19:43` | 36 | cut #1 |
| 530 | `src/libs/actions/Link.ts:19:123` | 37 | cut #1 |
| 531 | `src/libs/actions/Policy/Member.ts:17:26` | 38 | cut #1 |
| 532 | `src/libs/fileDownload/DownloadUtils.ts:4:23` | 38 | cut #1 |
| 533 | `src/libs/fileDownload/index.ts:3:31` | 38 | cut #1 |
| 534 | `src/libs/Navigation/helpers/getAdaptedStateFromPath.ts:14:38` | 39 | cut #1 |

## All distinct edges inside cycles

| From | To | Findings containing it |
| --- | --- | --- |
| `libs/API/makeRequest.ts` | `libs/Middleware/index.ts` | 457 |
| `libs/API/index.ts` | `libs/API/makeRequest.ts` | 454 |
| `libs/Navigation/helpers/getStateFromPath.ts` | `libs/Navigation/linkingConfig/index.ts` | 434 |
| `libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers.ts` | `libs/Navigation/helpers/getStateFromPath.ts` | 414 |
| `libs/Navigation/Navigation.ts` | `libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers.ts` | 414 |
| `libs/actions/Session/index.ts` | `libs/API/index.ts` | 288 |
| `libs/Navigation/linkingConfig/subscribe.ts` | `libs/actions/Session/index.ts` | 276 |
| `libs/Navigation/linkingConfig/index.ts` | `libs/Navigation/linkingConfig/subscribe.ts` | 276 |
| `libs/ReportUtils.ts` | `libs/PaymentUtils.ts` | 268 |
| `libs/PaymentUtils.ts` | `libs/actions/IOU/ReportWorkflow.ts` | 265 |
| `libs/Middleware/HandleUnusedOptimisticID.ts` | `libs/actions/Report/index.ts` | 257 |
| `libs/Middleware/index.ts` | `libs/Middleware/HandleUnusedOptimisticID.ts` | 257 |
| `libs/LoginUtils.ts` | `libs/Navigation/Navigation.ts` | 231 |
| `libs/PersonalDetailsUtils.ts` | `libs/LoginUtils.ts` | 225 |
| `libs/CardUtils.ts` | `libs/PersonalDetailsUtils.ts` | 205 |
| `libs/actions/IOU/ReportWorkflow.ts` | `libs/actions/IOU/PayMoneyRequest.ts` | 198 |
| `libs/Navigation/helpers/getAdaptedStateFromPath.ts` | `libs/ReportUtils.ts` | 197 |
| `libs/actions/IOU/PayMoneyRequest.ts` | `libs/actions/IOU/MoneyRequestBuilder.ts` | 185 |
| `libs/actions/Report/DeleteReport.ts` | `libs/ReportActionsUtils.ts` | 182 |
| `libs/actions/Report/index.ts` | `libs/actions/Report/DeleteReport.ts` | 180 |
| `libs/actions/IOU/MoneyRequestBuilder.ts` | `libs/actions/IOU/SearchUpdate.ts` | 178 |
| `libs/Middleware/HandleDeletedAccount.ts` | `libs/actions/Session/index.ts` | 175 |
| `libs/Middleware/index.ts` | `libs/Middleware/HandleDeletedAccount.ts` | 175 |
| `libs/ReportActionsUtils.ts` | `libs/CardUtils.ts` | 175 |
| `libs/Navigation/linkingConfig/index.ts` | `libs/Navigation/helpers/getAdaptedStateFromPath.ts` | 162 |
| `libs/actions/Session/index.ts` | `libs/Navigation/Navigation.ts` | 159 |
| `libs/actions/IOU/SearchUpdate.ts` | `libs/SearchUIUtils.ts` | 158 |
| `libs/WorkspacesSettingsUtils.ts` | `libs/PolicyUtils.ts` | 121 |
| `libs/ReportActionsUtils.ts` | `libs/WorkspacesSettingsUtils.ts` | 121 |
| `libs/PolicyUtils.ts` | `libs/OptionsListUtils/index.ts` | 117 |
| `libs/OptionsListUtils/index.ts` | `libs/ModifiedExpenseMessage.ts` | 105 |
| `libs/ReportNameUtils.ts` | `libs/ReportUtils.ts` | 101 |
| `libs/AttendeeUtils.ts` | `libs/OptionsListUtils/index.ts` | 100 |
| `libs/AgentRuleChangeLogUtils.ts` | `libs/ReportActionsUtils.ts` | 96 |
| `libs/SearchUIUtils.ts` | `libs/actions/IOU/MoneyRequest.ts` | 95 |
| `libs/ReportUtils.ts` | `libs/AttendeeUtils.ts` | 91 |
| `libs/OptionsListUtils/index.ts` | `libs/AgentRuleChangeLogUtils.ts` | 90 |
| `libs/actions/IOU/MoneyRequest.ts` | `libs/actions/IOU/TrackExpense.ts` | 89 |
| `libs/ModifiedExpenseMessage.ts` | `libs/ReportNameUtils.ts` | 88 |
| `libs/PolicyUtils.ts` | `libs/HRUtils.ts` | 84 |
| `libs/HRUtils.ts` | `libs/actions/connections/index.ts` | 84 |
| `libs/actions/connections/index.ts` | `libs/actions/connections/MergeHR.ts` | 84 |
| `libs/actions/connections/MergeHR.ts` | `libs/API/index.ts` | 84 |
| `libs/ModifiedExpenseMessage.ts` | `libs/PolicyUtils.ts` | 78 |
| `libs/actions/Report/index.ts` | `libs/ModifiedExpenseMessage.ts` | 68 |
| `libs/actions/Policy/Policy.ts` | `libs/actions/Policy/Category.ts` | 64 |
| `libs/actions/IOU/ReportWorkflow.ts` | `libs/actions/IOU/Hold.ts` | 60 |
| `libs/actions/Policy/Member.ts` | `libs/actions/Policy/Policy.ts` | 51 |
| `libs/PolicyUtils.ts` | `libs/TransactionUtils/index.ts` | 50 |
| `libs/TransactionUtils/index.ts` | `libs/ReportUtils.ts` | 46 |
| `libs/actions/IOU/Hold.ts` | `libs/actions/Report/index.ts` | 43 |
| `libs/Navigation/Navigation.ts` | `libs/Navigation/helpers/linkTo/index.ts` | 41 |
| `libs/Navigation/helpers/linkTo/index.ts` | `libs/Navigation/helpers/getAdaptedStateFromPath.ts` | 41 |
| `libs/actions/IOU/TrackExpense.ts` | `libs/actions/Policy/Member.ts` | 41 |
| `libs/Log.ts` | `libs/Network/index.ts` | 34 |
| `libs/Network/index.ts` | `libs/Network/MainQueue.ts` | 33 |
| `libs/DistanceRequestUtils.ts` | `libs/PolicyUtils.ts` | 32 |
| `libs/actions/Policy/Category.ts` | `libs/API/index.ts` | 29 |
| `libs/TransactionUtils/index.ts` | `libs/TransactionUtils/getDistanceInMeters.ts` | 28 |
| `libs/TransactionUtils/getDistanceInMeters.ts` | `libs/DistanceRequestUtils.ts` | 28 |
| `libs/actions/App.ts` | `libs/actions/Policy/Policy.ts` | 28 |
| `libs/Network/MainQueue.ts` | `libs/Network/SequentialQueue.ts` | 27 |
| `libs/SearchUIUtils.ts` | `libs/actions/Search.ts` | 25 |
| `libs/fileDownload/DownloadUtils.ts` | `libs/actions/Link.ts` | 24 |
| `libs/fileDownload/index.ts` | `libs/fileDownload/DownloadUtils.ts` | 24 |
| `libs/actions/IOU/TrackExpense.ts` | `libs/actions/IOU/DeleteMoneyRequest.ts` | 24 |
| `libs/OptionsListUtils/index.ts` | `libs/ReportNameUtils.ts` | 23 |
| `libs/Middleware/index.ts` | `libs/Middleware/Reauthentication.ts` | 19 |
| `libs/PolicyUtils.ts` | `libs/actions/BankAccounts.ts` | 18 |
| `libs/actions/Report/index.ts` | `libs/actions/Policy/Member.ts` | 17 |
| `libs/Middleware/Reauthentication.ts` | `libs/Reauthentication.ts` | 16 |
| `libs/Reauthentication.ts` | `libs/actions/Delegate.ts` | 15 |
| `libs/actions/Delegate.ts` | `libs/actions/App.ts` | 15 |
| `libs/SearchUIUtils.ts` | `libs/TransactionPreviewUtils.ts` | 15 |
| `libs/Network/NetworkStore.ts` | `libs/Log.ts` | 14 |
| `libs/Network/SequentialQueue.ts` | `libs/Request.ts` | 14 |
| `libs/actions/Policy/Category.ts` | `libs/fileDownload/index.ts` | 14 |
| `libs/ValidationUtils.ts` | `libs/CardUtils.ts` | 13 |
| `libs/SearchQueryUtils.ts` | `libs/CardFeedUtils.ts` | 13 |
| `libs/actions/Policy/Category.ts` | `libs/actions/Task.ts` | 12 |
| `libs/actions/IOU/SearchUpdate.ts` | `libs/SearchQueryUtils.ts` | 12 |
| `libs/actions/IOU/Hold.ts` | `libs/API/index.ts` | 11 |
| `libs/Request.ts` | `libs/HttpUtils.ts` | 10 |
| `libs/CardFeedUtils.ts` | `libs/CardUtils.ts` | 10 |
| `libs/Navigation/helpers/dynamicRoutesUtils/getDynamicRouteAdaptedState.ts` | `libs/Navigation/helpers/getStateFromPath.ts` | 9 |
| `libs/Navigation/helpers/getAdaptedStateFromPath.ts` | `libs/Navigation/helpers/dynamicRoutesUtils/getDynamicRouteAdaptedState.ts` | 9 |
| `libs/actions/Link.ts` | `libs/actions/Report/index.ts` | 9 |
| `libs/actions/IOU/SearchUpdate.ts` | `libs/ReportUtils.ts` | 9 |
| `libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute.ts` | `libs/Navigation/Navigation.ts` | 9 |
| `libs/actions/Transaction.ts` | `libs/API/index.ts` | 9 |
| `libs/actions/Report/index.ts` | `libs/actions/Transaction.ts` | 9 |
| `libs/NextStepUtils.ts` | `libs/PolicyUtils.ts` | 9 |
| `libs/actions/Policy/Policy.ts` | `libs/actions/Welcome/OnboardingFlow.ts` | 9 |
| `libs/actions/Search.ts` | `libs/actions/IOU/RejectMoneyRequest.ts` | 9 |
| `pages/workspace/accounting/AccountingContext/index.tsx` | `pages/workspace/accounting/utils.tsx` | 8 |
| `components/MultifactorAuthentication/config/index.ts` | `components/MultifactorAuthentication/config/scenarios/index.ts` | 8 |
| `components/MultifactorAuthentication/config/scenarios/ChangePIN.tsx` | `components/MultifactorAuthentication/Context/index.ts` | 8 |
| `components/MultifactorAuthentication/config/scenarios/index.ts` | `components/MultifactorAuthentication/config/scenarios/ChangePIN.tsx` | 8 |
| `libs/actions/BankAccounts.ts` | `libs/actions/PaymentMethods.ts` | 7 |
| `libs/ReportUtils.ts` | `libs/actions/BankAccounts.ts` | 7 |
| `libs/SubscriptionUtils.ts` | `libs/PolicyUtils.ts` | 7 |
| `libs/actions/IOU/MoneyRequestBuilder.ts` | `libs/actions/Policy/Tag.ts` | 7 |
| `libs/actions/IOU/Hold.ts` | `libs/NextStepUtils.ts` | 7 |
| `libs/actions/BankAccounts.ts` | `libs/actions/ReimbursementAccount/index.ts` | 7 |
| `libs/actions/IOU/TrackExpense.ts` | `libs/actions/IOU/NavigationHelpers.ts` | 7 |
| `libs/actions/IOU/DeleteMoneyRequest.ts` | `libs/IOUUtils.ts` | 7 |
| `libs/actions/Policy/Category.ts` | `libs/OptionsListUtils/index.ts` | 7 |
| `libs/ReportUtils.ts` | `libs/actions/IOU/MoneyRequest.ts` | 6 |
| `components/MultifactorAuthentication/Context/stateReducer.ts` | `components/MultifactorAuthentication/config/index.ts` | 6 |
| `components/MultifactorAuthentication/Context/MultifactorAuthenticationComposedContextProviders.tsx` | `components/MultifactorAuthentication/Context/stateReducer.ts` | 6 |
| `components/MultifactorAuthentication/Context/index.ts` | `components/MultifactorAuthentication/Context/MultifactorAuthenticationComposedContextProviders.tsx` | 6 |
| `libs/actions/IOU/DeleteMoneyRequest.ts` | `libs/actions/IOU/MoneyRequestBuilder.ts` | 6 |
| `libs/actions/Reconnect.ts` | `libs/actions/App.ts` | 6 |
| `libs/actions/Welcome/OnboardingFlow.ts` | `libs/Navigation/Navigation.ts` | 6 |
| `libs/ModifiedExpenseMessage.ts` | `libs/PersonalDetailsUtils.ts` | 6 |
| `libs/Notification/LocalNotification/index.ts` | `libs/Notification/LocalNotification/BrowserNotifications.ts` | 6 |
| `libs/actions/Report/index.ts` | `libs/Notification/LocalNotification/index.ts` | 6 |
| `libs/ReportNameUtils.ts` | `libs/AgentRuleChangeLogUtils.ts` | 6 |
| `libs/actions/Welcome/OnboardingFlow.ts` | `libs/actions/App.ts` | 6 |
| `libs/actions/IOU/NavigationHelpers.ts` | `libs/Navigation/helpers/navigateAfterExpenseCreate.ts` | 6 |
| `libs/actions/Link.ts` | `libs/Navigation/helpers/swapBackgroundTabForRHPTarget.ts` | 6 |
| `libs/actions/Report/index.ts` | `libs/fileDownload/index.ts` | 5 |
| `libs/actions/Welcome/index.ts` | `libs/API/index.ts` | 5 |
| `libs/HttpUtils.ts` | `libs/Prefetch/registerPrefetchOnAppStart/index.ts` | 5 |
| `libs/HttpUtils.ts` | `libs/Prefetch/preparePrefetchRequest/index.ts` | 5 |
| `libs/Prefetch/preparePrefetchRequest/index.ts` | `libs/Network/NetworkStore.ts` | 5 |
| `libs/actions/SignInRedirect.ts` | `libs/actions/HybridApp/index.ts` | 5 |
| `libs/actions/HybridApp/index.ts` | `libs/Navigation/Navigation.ts` | 5 |
| `libs/Reauthentication.ts` | `libs/actions/SignInRedirect.ts` | 5 |
| `libs/actions/PaymentMethods.ts` | `libs/API/index.ts` | 5 |
| `libs/actions/Report/index.ts` | `libs/SearchQueryUtils.ts` | 5 |
| `libs/SearchUIUtils.ts` | `libs/ReportPrimaryActionUtils.ts` | 5 |
| `libs/Violations/ViolationsUtils.ts` | `libs/AttendeeUtils.ts` | 5 |
| `libs/IOUUtils.ts` | `libs/Navigation/Navigation.ts` | 5 |
| `libs/actions/IOU/DeleteMoneyRequest.ts` | `libs/actions/ClearReportActionErrors.ts` | 5 |
| `libs/Network/MainQueue.ts` | `libs/Network/NetworkStore.ts` | 4 |
| `libs/NetworkState.ts` | `libs/Log.ts` | 4 |
| `libs/Network/SequentialQueue.ts` | `libs/telemetry/ReceiptObservability.ts` | 4 |
| `libs/actions/Session/index.ts` | `libs/Reauthentication.ts` | 4 |
| `libs/Middleware/index.ts` | `libs/Middleware/SaveResponseInOnyx.ts` | 4 |
| `libs/actions/OnyxUpdates.ts` | `libs/PusherUtils.ts` | 4 |
| `libs/PusherUtils.ts` | `libs/actions/Reconnect.ts` | 4 |
| `libs/Middleware/SaveResponseInOnyx.ts` | `libs/actions/OnyxUpdates.ts` | 4 |
| `libs/actions/IOU/PayMoneyRequest.ts` | `libs/actions/IOU/Hold.ts` | 4 |
| `libs/actions/Report/index.ts` | `libs/PolicyDistanceRatesUtils.ts` | 4 |
| `libs/WorkspaceReportFieldUtils.ts` | `libs/ValidationUtils.ts` | 4 |
| `libs/ReportActionsUtils.ts` | `libs/WorkspaceReportFieldUtils.ts` | 4 |
| `libs/TransactionPreviewUtils.ts` | `libs/actions/Transaction.ts` | 4 |
| `libs/MoneyRequestUtils.ts` | `libs/ReportUtils.ts` | 4 |
| `libs/ReportNameUtils.ts` | `libs/TransactionUtils/index.ts` | 4 |
| `libs/actions/Transaction.ts` | `libs/Violations/ViolationsUtils.ts` | 4 |
| `libs/actions/Task.ts` | `libs/actions/Report/index.ts` | 4 |
| `libs/Navigation/helpers/dismissModalAndOpenReportInInboxTab.ts` | `libs/Navigation/Navigation.ts` | 4 |
| `libs/Navigation/helpers/navigateAfterExpenseCreate.ts` | `libs/Navigation/helpers/dismissModalAndOpenReportInInboxTab.ts` | 4 |
| `libs/TransactionPreviewUtils.ts` | `libs/Violations/ViolationsUtils.ts` | 4 |
| `pages/workspace/accounting/utils.tsx` | `components/ConnectToCertiniaFlow/index.tsx` | 3 |
| `components/ConnectToCertiniaFlow/index.tsx` | `pages/workspace/accounting/AccountingContext/index.tsx` | 3 |
| `libs/Network/SequentialQueue.ts` | `libs/Log.ts` | 3 |
| `components/ConnectToQuickbooksOnlineFlow/BaseConnectToQuickbooksOnlineFlow.tsx` | `pages/workspace/accounting/AccountingContext/index.tsx` | 3 |
| `pages/workspace/accounting/utils.tsx` | `components/ConnectToQuickbooksOnlineFlow/index.tsx` | 3 |
| `components/ConnectToQuickbooksOnlineFlow/index.tsx` | `components/ConnectToQuickbooksOnlineFlow/BaseConnectToQuickbooksOnlineFlow.tsx` | 3 |
| `libs/actions/PersistedRequests.ts` | `libs/Log.ts` | 3 |
| `libs/actions/QueuedOnyxUpdates.ts` | `libs/Log.ts` | 3 |
| `libs/API/index.ts` | `libs/API/writeWhenReady.ts` | 3 |
| `libs/API/write.ts` | `libs/API/makeRequest.ts` | 3 |
| `libs/Network/enhanceParameters.ts` | `libs/Network/NetworkStore.ts` | 3 |
| `libs/actions/TransactionEdit.ts` | `libs/actions/Transaction.ts` | 3 |
| `libs/Navigation/helpers/getReportURLForCurrentContext.ts` | `libs/Navigation/Navigation.ts` | 3 |
| `libs/Notification/LocalNotification/BrowserNotifications.ts` | `libs/ModifiedExpenseMessage.ts` | 3 |
| `libs/TaskUtils.ts` | `libs/Navigation/Navigation.ts` | 3 |
| `libs/PolicyUtils.ts` | `libs/actions/connections/QuickbooksOnline.ts` | 3 |
| `libs/actions/Policy/Policy.ts` | `libs/actions/PaymentMethods.ts` | 3 |
| `libs/actions/BankAccounts.ts` | `libs/actions/Plaid.ts` | 3 |
| `libs/actions/Link.ts` | `libs/actions/Welcome/index.ts` | 3 |
| `libs/PaymentUtils.ts` | `libs/Navigation/Navigation.ts` | 3 |
| `libs/PolicyDistanceRatesUtils.ts` | `libs/MoneyRequestUtils.ts` | 3 |
| `libs/SearchQueryUtils.ts` | `libs/MoneyRequestUtils.ts` | 3 |
| `libs/processReportIDDeeplink/getReportIDFromUrl.ts` | `libs/ReportUtils.ts` | 3 |
| `libs/processReportIDDeeplink/index.ts` | `libs/processReportIDDeeplink/getReportIDFromUrl.ts` | 3 |
| `libs/actions/Report/index.ts` | `libs/processReportIDDeeplink/index.ts` | 3 |
| `libs/CardFeedUtils.ts` | `libs/ExpensifyCardFeedSelectorUtils.ts` | 3 |
| `libs/NextStepUtils.ts` | `libs/TransactionUtils/index.ts` | 3 |
| `libs/actions/ReimbursementAccount/index.ts` | `libs/actions/ReimbursementAccount/navigation.ts` | 3 |
| `libs/actions/ReimbursementAccount/navigation.ts` | `libs/Navigation/Navigation.ts` | 3 |
| `libs/SearchUIUtils.ts` | `libs/AttendeeUtils.ts` | 3 |
| `libs/getWorkspaceCreatedAnalyticsEvent.ts` | `libs/LoginUtils.ts` | 3 |
| `libs/Navigation/helpers/willRouteNavigateToRHP.ts` | `libs/Navigation/helpers/getStateFromPath.ts` | 3 |
| `libs/Navigation/helpers/swapBackgroundTabForRHPTarget.ts` | `libs/Navigation/helpers/getAdaptedStateFromPath.ts` | 3 |
| `libs/actions/Policy/Member.ts` | `libs/fileDownload/index.ts` | 3 |
| `libs/EmojiUtils.tsx` | `components/Text.tsx` | 2 |
| `components/Text.tsx` | `libs/EmojiUtils.tsx` | 2 |
| `libs/GPSDraftDetailsUtils.ts` | `libs/actions/GPSDraftDetails.ts` | 2 |
| `libs/actions/GPSDraftDetails.ts` | `libs/GPSDraftDetailsUtils.ts` | 2 |
| `pages/workspace/accounting/utils.tsx` | `components/ConnectToNetSuiteFlow/index.tsx` | 2 |
| `components/ConnectToNetSuiteFlow/index.tsx` | `pages/workspace/accounting/AccountingContext/index.tsx` | 2 |
| `components/MultifactorAuthentication/Context/usePromptContent.ts` | `components/MultifactorAuthentication/config/index.ts` | 2 |
| `components/MultifactorAuthentication/Context/index.ts` | `components/MultifactorAuthentication/Context/usePromptContent.ts` | 2 |
| `libs/Network/SequentialQueue.ts` | `libs/actions/PersistedRequests.ts` | 2 |
| `libs/Network/SequentialQueue.ts` | `libs/NetworkState.ts` | 2 |
| `libs/Network/SequentialQueue.ts` | `libs/RequestThrottle.ts` | 2 |
| `libs/RequestThrottle.ts` | `libs/Log.ts` | 2 |
| `libs/telemetry/ReceiptObservability.ts` | `libs/Log.ts` | 2 |
| `libs/API/writeWhenReady.ts` | `libs/API/makeRequest.ts` | 2 |
| `libs/API/index.ts` | `libs/API/write.ts` | 2 |
| `libs/Middleware/LoadPostDataForOpenOrReconnect.ts` | `libs/actions/App.ts` | 2 |
| `libs/API/makeRequest.ts` | `libs/Middleware/LoadPostDataForOpenOrReconnect.ts` | 2 |
| `libs/Request.ts` | `libs/actions/QueuedOnyxUpdates.ts` | 2 |
| `libs/Prefetch/registerPrefetchOnAppStart/index.ts` | `libs/Log.ts` | 2 |
| `libs/Middleware/index.ts` | `libs/Middleware/SupportalPermission.ts` | 2 |
| `libs/Middleware/SupportalPermission.ts` | `libs/actions/App.ts` | 2 |
| `libs/Middleware/Reauthentication.ts` | `libs/actions/Reconnect.ts` | 2 |
| `libs/Prefetch/registerPrefetchOnAppStart/index.ts` | `libs/Network/enhanceParameters.ts` | 2 |
| `libs/PerDiemRequestUtils.ts` | `libs/ReportUtils.ts` | 2 |
| `libs/actions/IOU/MoneyRequest.ts` | `libs/PerDiemRequestUtils.ts` | 2 |
| `libs/Navigation/helpers/lastVisitedTabPathUtils/index.ts` | `libs/Navigation/helpers/getStateFromPath.ts` | 2 |
| `libs/actions/SignInRedirect.ts` | `libs/Navigation/helpers/lastVisitedTabPathUtils/index.ts` | 2 |
| `libs/Navigation/helpers/getReportRouteForCurrentContext.ts` | `libs/Navigation/Navigation.ts` | 2 |
| `libs/actions/Report/index.ts` | `libs/Navigation/helpers/getReportRouteForCurrentContext.ts` | 2 |
| `libs/actions/Report/index.ts` | `libs/PageHTMLCapture/index.ts` | 2 |
| `libs/PageHTMLCapture/index.ts` | `libs/Navigation/Navigation.ts` | 2 |
| `libs/actions/navigateFromNotification/index.ts` | `libs/Navigation/Navigation.ts` | 2 |
| `libs/actions/Report/index.ts` | `libs/actions/navigateFromNotification/index.ts` | 2 |
| `libs/actions/Report/index.ts` | `libs/actions/Welcome/OnboardingFlow.ts` | 2 |
| `libs/actions/Policy/Tag.ts` | `libs/API/index.ts` | 2 |
| `libs/OptionsListUtils/index.ts` | `libs/TaskUtils.ts` | 2 |
| `libs/actions/connections/QuickbooksOnline.ts` | `libs/API/index.ts` | 2 |
| `libs/actions/Plaid.ts` | `libs/API/index.ts` | 2 |
| `libs/actions/BankAccounts.ts` | `libs/actions/Wallet.ts` | 2 |
| `libs/actions/Wallet.ts` | `libs/API/index.ts` | 2 |
| `libs/actions/IOU/RejectMoneyRequest.ts` | `libs/API/index.ts` | 2 |
| `libs/SearchUIUtils.ts` | `libs/interceptAnonymousUser.ts` | 2 |
| `libs/interceptAnonymousUser.ts` | `libs/actions/Session/index.ts` | 2 |
| `libs/ReportNameUtils.ts` | `libs/SpendRuleChangeLogUtils.ts` | 2 |
| `libs/SpendRuleChangeLogUtils.ts` | `libs/ReportActionsUtils.ts` | 2 |
| `libs/actions/Report/index.ts` | `libs/ReportTitleUtils.ts` | 2 |
| `libs/ReportTitleUtils.ts` | `libs/ReportUtils.ts` | 2 |
| `libs/ReportUtils.ts` | `libs/Navigation/helpers/getReportURLForCurrentContext.ts` | 2 |
| `libs/ReportUtils.ts` | `libs/TaskUtils.ts` | 2 |
| `libs/actions/Search.ts` | `libs/actions/IOU/PayMoneyRequest.ts` | 2 |
| `libs/actions/IOU/MoneyRequest.ts` | `libs/actions/TransactionEdit.ts` | 2 |
| `libs/actions/ReimbursementAccount/resetNonUSDBankAccount.ts` | `libs/API/index.ts` | 2 |
| `libs/actions/ReimbursementAccount/index.ts` | `libs/actions/ReimbursementAccount/resetNonUSDBankAccount.ts` | 2 |
| `libs/actions/ReimbursementAccount/index.ts` | `libs/actions/ReimbursementAccount/resetUSDBankAccount.ts` | 2 |
| `libs/actions/ReimbursementAccount/resetUSDBankAccount.ts` | `libs/API/index.ts` | 2 |
| `libs/actions/BankAccounts.ts` | `libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute.ts` | 2 |
| `libs/ReportPrimaryActionUtils.ts` | `libs/PolicyUtils.ts` | 2 |
| `libs/actions/PaymentMethods.ts` | `libs/SubscriptionUtils.ts` | 2 |
| `libs/TransactionPreviewUtils.ts` | `libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute.ts` | 2 |
| `libs/SearchQueryUtils.ts` | `libs/ReportNameUtils.ts` | 2 |
| `libs/actions/IOU/TrackExpense.ts` | `libs/getWorkspaceCreatedAnalyticsEvent.ts` | 2 |
| `libs/ExpensifyCardFeedSelectorUtils.ts` | `libs/CardUtils.ts` | 2 |
| `libs/actions/ClearReportActionErrors.ts` | `libs/actions/Report/DeleteReport.ts` | 2 |
| `libs/actions/Link.ts` | `libs/Navigation/helpers/willRouteNavigateToRHP.ts` | 2 |
| `libs/Navigation/helpers/swapBackgroundTabForRHPTarget.ts` | `libs/Navigation/helpers/linkTo/index.ts` | 2 |
| `libs/DistanceRequestUtils.ts` | `libs/TransactionUtils/index.ts` | 1 |
| `libs/Network/index.ts` | `libs/Network/SequentialQueue.ts` | 1 |
| `libs/OptionsListUtils/index.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/actions/connections/index.ts` | `libs/PolicyUtils.ts` | 1 |
| `libs/Network/MainQueue.ts` | `libs/NetworkState.ts` | 1 |
| `libs/Network/SequentialQueue.ts` | `libs/actions/QueuedOnyxUpdates.ts` | 1 |
| `libs/ReportActionsUtils.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/Request.ts` | `libs/Log.ts` | 1 |
| `libs/actions/IOU/TrackExpense.ts` | `libs/actions/IOU/MoneyRequestBuilder.ts` | 1 |
| `libs/Request.ts` | `libs/Network/NetworkStore.ts` | 1 |
| `libs/actions/Session/index.ts` | `libs/actions/Welcome/index.ts` | 1 |
| `libs/telemetry/ReceiptObservability.ts` | `libs/actions/PersistedRequests.ts` | 1 |
| `libs/telemetry/ReceiptObservability.ts` | `libs/NetworkState.ts` | 1 |
| `libs/API/writeWhenReady.ts` | `libs/API/write.ts` | 1 |
| `libs/Network/MainQueue.ts` | `libs/Request.ts` | 1 |
| `libs/Request.ts` | `libs/Network/enhanceParameters.ts` | 1 |
| `libs/actions/Delegate.ts` | `libs/API/index.ts` | 1 |
| `libs/Prefetch/registerPrefetchOnAppStart/index.ts` | `libs/Network/NetworkStore.ts` | 1 |
| `libs/actions/Session/index.ts` | `libs/actions/App.ts` | 1 |
| `libs/actions/Session/index.ts` | `libs/actions/SignInRedirect.ts` | 1 |
| `libs/actions/Session/index.ts` | `libs/actions/Delegate.ts` | 1 |
| `libs/actions/IOU/TrackExpense.ts` | `libs/actions/IOU/SearchUpdate.ts` | 1 |
| `libs/actions/Report/index.ts` | `libs/Navigation/Navigation.ts` | 1 |
| `libs/Middleware/Reauthentication.ts` | `libs/actions/SignInRedirect.ts` | 1 |
| `libs/ReportUtils.ts` | `libs/actions/IOU/Hold.ts` | 1 |
| `libs/ReportUtils.ts` | `libs/actions/Session/index.ts` | 1 |
| `libs/actions/Report/index.ts` | `libs/LoginUtils.ts` | 1 |
| `libs/actions/Report/index.ts` | `libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute.ts` | 1 |
| `libs/ReportUtils.ts` | `libs/actions/IOU/ReportWorkflow.ts` | 1 |
| `libs/ReportUtils.ts` | `libs/actions/Policy/Policy.ts` | 1 |
| `libs/ReportUtils.ts` | `libs/actions/TransactionEdit.ts` | 1 |
| `libs/actions/IOU/ReportWorkflow.ts` | `libs/API/index.ts` | 1 |
| `libs/actions/Report/index.ts` | `libs/PersonalDetailsUtils.ts` | 1 |
| `libs/actions/Session/index.ts` | `libs/actions/Link.ts` | 1 |
| `libs/Navigation/Navigation.ts` | `libs/Navigation/linkingConfig/index.ts` | 1 |
| `libs/ReportActionsUtils.ts` | `libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute.ts` | 1 |
| `libs/ReportActionsUtils.ts` | `libs/Navigation/helpers/getReportURLForCurrentContext.ts` | 1 |
| `libs/actions/IOU/PayMoneyRequest.ts` | `libs/API/index.ts` | 1 |
| `libs/actions/Session/index.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/Navigation/Navigation.ts` | `libs/Navigation/helpers/getStateFromPath.ts` | 1 |
| `libs/ReportActionsUtils.ts` | `libs/PersonalDetailsUtils.ts` | 1 |
| `libs/ReportUtils.ts` | `libs/PolicyUtils.ts` | 1 |
| `libs/actions/Report/index.ts` | `libs/API/index.ts` | 1 |
| `libs/actions/Report/index.ts` | `libs/ReportActionsUtils.ts` | 1 |
| `libs/Navigation/helpers/linkTo/index.ts` | `libs/Navigation/helpers/getStateFromPath.ts` | 1 |
| `libs/PolicyDistanceRatesUtils.ts` | `libs/ValidationUtils.ts` | 1 |
| `libs/ReportUtils.ts` | `libs/SubscriptionUtils.ts` | 1 |
| `libs/ValidationUtils.ts` | `libs/LoginUtils.ts` | 1 |
| `libs/actions/IOU/PayMoneyRequest.ts` | `libs/actions/Policy/Policy.ts` | 1 |
| `libs/actions/Policy/Member.ts` | `libs/API/index.ts` | 1 |
| `libs/actions/Report/index.ts` | `libs/actions/Session/index.ts` | 1 |
| `libs/actions/Report/index.ts` | `libs/actions/Welcome/index.ts` | 1 |
| `libs/Navigation/helpers/getAdaptedStateFromPath.ts` | `libs/Navigation/helpers/getStateFromPath.ts` | 1 |
| `libs/Notification/LocalNotification/BrowserNotifications.ts` | `libs/ReportActionsUtils.ts` | 1 |
| `libs/OptionsListUtils/index.ts` | `libs/LoginUtils.ts` | 1 |
| `libs/OptionsListUtils/index.ts` | `libs/PolicyUtils.ts` | 1 |
| `libs/PaymentUtils.ts` | `libs/SubscriptionUtils.ts` | 1 |
| `libs/PolicyUtils.ts` | `libs/PersonalDetailsUtils.ts` | 1 |
| `libs/actions/IOU/ReportWorkflow.ts` | `libs/PolicyUtils.ts` | 1 |
| `libs/actions/Policy/Policy.ts` | `libs/API/index.ts` | 1 |
| `libs/actions/Report/index.ts` | `libs/actions/Policy/Policy.ts` | 1 |
| `libs/OptionsListUtils/index.ts` | `libs/PersonalDetailsUtils.ts` | 1 |
| `libs/ReportUtils.ts` | `libs/Navigation/helpers/getStateFromPath.ts` | 1 |
| `libs/ReportUtils.ts` | `libs/TransactionUtils/index.ts` | 1 |
| `libs/actions/BankAccounts.ts` | `libs/API/index.ts` | 1 |
| `libs/actions/IOU/PayMoneyRequest.ts` | `libs/PolicyUtils.ts` | 1 |
| `libs/actions/IOU/ReportWorkflow.ts` | `libs/NextStepUtils.ts` | 1 |
| `libs/actions/IOU/ReportWorkflow.ts` | `libs/SubscriptionUtils.ts` | 1 |
| `libs/actions/Link.ts` | `libs/API/index.ts` | 1 |
| `libs/actions/Search.ts` | `libs/API/index.ts` | 1 |
| `libs/LoginUtils.ts` | `libs/actions/Session/index.ts` | 1 |
| `libs/Notification/LocalNotification/BrowserNotifications.ts` | `libs/ReportNameUtils.ts` | 1 |
| `libs/PolicyUtils.ts` | `libs/actions/connections/index.ts` | 1 |
| `libs/PolicyUtils.ts` | `libs/ValidationUtils.ts` | 1 |
| `libs/ReportNameUtils.ts` | `libs/PolicyUtils.ts` | 1 |
| `libs/ReportUtils.ts` | `libs/Navigation/linkingConfig/index.ts` | 1 |
| `libs/SearchUIUtils.ts` | `libs/actions/connections/index.ts` | 1 |
| `libs/SearchUIUtils.ts` | `libs/actions/IOU/ReportWorkflow.ts` | 1 |
| `libs/actions/App.ts` | `libs/API/index.ts` | 1 |
| `libs/actions/IOU/MoneyRequest.ts` | `libs/actions/Transaction.ts` | 1 |
| `libs/actions/IOU/MoneyRequestBuilder.ts` | `libs/PolicyUtils.ts` | 1 |
| `libs/actions/IOU/PayMoneyRequest.ts` | `libs/NextStepUtils.ts` | 1 |
| `libs/actions/IOU/PayMoneyRequest.ts` | `libs/SubscriptionUtils.ts` | 1 |
| `libs/actions/IOU/TrackExpense.ts` | `libs/API/index.ts` | 1 |
| `libs/actions/Link.ts` | `libs/actions/Session/index.ts` | 1 |
| `libs/actions/Report/index.ts` | `libs/PolicyUtils.ts` | 1 |
| `libs/actions/Report/index.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/actions/Task.ts` | `libs/API/index.ts` | 1 |
| `libs/actions/connections/index.ts` | `libs/API/index.ts` | 1 |
| `libs/ModifiedExpenseMessage.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/OptionsListUtils/index.ts` | `libs/ReportActionsUtils.ts` | 1 |
| `libs/OptionsListUtils/index.ts` | `libs/TransactionUtils/index.ts` | 1 |
| `libs/ReportNameUtils.ts` | `libs/PersonalDetailsUtils.ts` | 1 |
| `libs/ReportUtils.ts` | `libs/actions/Welcome/OnboardingFlow.ts` | 1 |
| `libs/ReportUtils.ts` | `libs/LoginUtils.ts` | 1 |
| `libs/ReportUtils.ts` | `libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute.ts` | 1 |
| `libs/ReportUtils.ts` | `libs/Navigation/Navigation.ts` | 1 |
| `libs/SearchQueryUtils.ts` | `libs/PolicyUtils.ts` | 1 |
| `libs/actions/IOU/DeleteMoneyRequest.ts` | `libs/API/index.ts` | 1 |
| `libs/actions/IOU/MoneyRequestBuilder.ts` | `libs/NextStepUtils.ts` | 1 |
| `libs/actions/IOU/ReportWorkflow.ts` | `libs/TransactionUtils/index.ts` | 1 |
| `libs/actions/IOU/TrackExpense.ts` | `libs/actions/Transaction.ts` | 1 |
| `libs/actions/Policy/Member.ts` | `libs/PolicyUtils.ts` | 1 |
| `libs/actions/Policy/Tag.ts` | `libs/PolicyUtils.ts` | 1 |
| `libs/actions/Report/index.ts` | `libs/NextStepUtils.ts` | 1 |
| `libs/actions/Search.ts` | `libs/actions/IOU/ReportWorkflow.ts` | 1 |
| `libs/actions/Search.ts` | `libs/actions/Policy/Policy.ts` | 1 |
| `libs/actions/Task.ts` | `libs/actions/Welcome/index.ts` | 1 |
| `libs/actions/Transaction.ts` | `libs/PolicyUtils.ts` | 1 |
| `libs/CardFeedUtils.ts` | `libs/PolicyUtils.ts` | 1 |
| `libs/ModifiedExpenseMessage.ts` | `libs/ReportActionsUtils.ts` | 1 |
| `libs/ModifiedExpenseMessage.ts` | `libs/TransactionUtils/index.ts` | 1 |
| `libs/ModifiedExpenseMessage.ts` | `libs/ValidationUtils.ts` | 1 |
| `libs/Notification/LocalNotification/BrowserNotifications.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/ReportUtils.ts` | `libs/PersonalDetailsUtils.ts` | 1 |
| `libs/SearchUIUtils.ts` | `libs/PolicyUtils.ts` | 1 |
| `libs/TransactionUtils/index.ts` | `libs/AttendeeUtils.ts` | 1 |
| `libs/TransactionUtils/index.ts` | `libs/DistanceRequestUtils.ts` | 1 |
| `libs/Violations/ViolationsUtils.ts` | `libs/PolicyUtils.ts` | 1 |
| `libs/actions/IOU/Hold.ts` | `libs/TransactionUtils/index.ts` | 1 |
| `libs/actions/IOU/NavigationHelpers.ts` | `libs/actions/Transaction.ts` | 1 |
| `libs/actions/IOU/TrackExpense.ts` | `libs/actions/Policy/Policy.ts` | 1 |
| `libs/actions/Policy/Policy.ts` | `libs/PolicyUtils.ts` | 1 |
| `libs/actions/Policy/Policy.ts` | `libs/actions/Task.ts` | 1 |
| `libs/actions/Transaction.ts` | `libs/DistanceRequestUtils.ts` | 1 |
| `libs/actions/Transaction.ts` | `libs/NextStepUtils.ts` | 1 |
| `libs/ExpensifyCardFeedSelectorUtils.ts` | `libs/PolicyUtils.ts` | 1 |
| `libs/OptionsListUtils/index.ts` | `libs/Navigation/Navigation.ts` | 1 |
| `libs/ReportNameUtils.ts` | `libs/ReportActionsUtils.ts` | 1 |
| `libs/ReportUtils.ts` | `libs/actions/Report/index.ts` | 1 |
| `libs/TransactionPreviewUtils.ts` | `libs/PolicyUtils.ts` | 1 |
| `libs/TransactionUtils/index.ts` | `libs/PolicyUtils.ts` | 1 |
| `libs/Violations/ViolationsUtils.ts` | `libs/DistanceRequestUtils.ts` | 1 |
| `libs/actions/BankAccounts.ts` | `libs/PersonalDetailsUtils.ts` | 1 |
| `libs/actions/IOU/MoneyRequest.ts` | `libs/PolicyUtils.ts` | 1 |
| `libs/actions/IOU/MoneyRequestBuilder.ts` | `libs/TransactionUtils/index.ts` | 1 |
| `libs/actions/IOU/ReportWorkflow.ts` | `libs/Navigation/Navigation.ts` | 1 |
| `libs/actions/Policy/Category.ts` | `libs/PolicyUtils.ts` | 1 |
| `libs/actions/Policy/Policy.ts` | `libs/NextStepUtils.ts` | 1 |
| `libs/actions/Report/index.ts` | `libs/TransactionUtils/index.ts` | 1 |
| `libs/actions/Search.ts` | `libs/PolicyUtils.ts` | 1 |
| `libs/actions/connections/QuickbooksOnline.ts` | `libs/PolicyUtils.ts` | 1 |
| `libs/ReportUtils.ts` | `libs/ReportActionsUtils.ts` | 1 |
| `libs/ReportUtils.ts` | `libs/ValidationUtils.ts` | 1 |
| `libs/ReportUtils.ts` | `libs/Violations/ViolationsUtils.ts` | 1 |
| `libs/actions/IOU/Hold.ts` | `libs/Navigation/Navigation.ts` | 1 |
| `libs/actions/IOU/MoneyRequest.ts` | `libs/DistanceRequestUtils.ts` | 1 |
| `libs/actions/IOU/PayMoneyRequest.ts` | `libs/Navigation/Navigation.ts` | 1 |
| `libs/actions/IOU/PayMoneyRequest.ts` | `libs/actions/Welcome/OnboardingFlow.ts` | 1 |
| `libs/actions/IOU/RejectMoneyRequest.ts` | `libs/PolicyUtils.ts` | 1 |
| `libs/actions/IOU/ReportWorkflow.ts` | `libs/PersonalDetailsUtils.ts` | 1 |
| `libs/actions/IOU/TrackExpense.ts` | `libs/PolicyUtils.ts` | 1 |
| `libs/actions/PaymentMethods.ts` | `libs/PolicyUtils.ts` | 1 |
| `libs/actions/Policy/Tag.ts` | `libs/TransactionUtils/index.ts` | 1 |
| `libs/actions/Search.ts` | `libs/SubscriptionUtils.ts` | 1 |
| `libs/actions/Transaction.ts` | `libs/TransactionUtils/index.ts` | 1 |
| `libs/MoneyRequestUtils.ts` | `libs/TransactionUtils/index.ts` | 1 |
| `libs/PolicyUtils.ts` | `libs/Navigation/Navigation.ts` | 1 |
| `libs/SearchUIUtils.ts` | `libs/TransactionUtils/index.ts` | 1 |
| `libs/TaskUtils.ts` | `libs/ReportActionsUtils.ts` | 1 |
| `libs/Violations/ViolationsUtils.ts` | `libs/TransactionUtils/index.ts` | 1 |
| `libs/actions/BankAccounts.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/actions/IOU/MoneyRequestBuilder.ts` | `libs/IOUUtils.ts` | 1 |
| `libs/actions/IOU/RejectMoneyRequest.ts` | `libs/NextStepUtils.ts` | 1 |
| `libs/actions/IOU/TrackExpense.ts` | `libs/DistanceRequestUtils.ts` | 1 |
| `libs/actions/Plaid.ts` | `libs/CardUtils.ts` | 1 |
| `libs/actions/Policy/Policy.ts` | `libs/TransactionUtils/index.ts` | 1 |
| `libs/IOUUtils.ts` | `libs/PolicyUtils.ts` | 1 |
| `libs/ReportPrimaryActionUtils.ts` | `libs/TransactionUtils/index.ts` | 1 |
| `libs/TransactionPreviewUtils.ts` | `libs/TransactionUtils/index.ts` | 1 |
| `libs/actions/BankAccounts.ts` | `libs/Navigation/Navigation.ts` | 1 |
| `libs/actions/IOU/MoneyRequest.ts` | `libs/TransactionUtils/index.ts` | 1 |
| `libs/actions/IOU/PayMoneyRequest.ts` | `libs/OptionsListUtils/index.ts` | 1 |
| `libs/actions/IOU/PayMoneyRequest.ts` | `libs/actions/Report/index.ts` | 1 |
| `libs/actions/IOU/ReportWorkflow.ts` | `libs/ReportActionsUtils.ts` | 1 |
| `libs/actions/IOU/ReportWorkflow.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/actions/IOU/ReportWorkflow.ts` | `libs/ValidationUtils.ts` | 1 |
| `libs/actions/Search.ts` | `libs/TransactionUtils/index.ts` | 1 |
| `libs/SearchUIUtils.ts` | `libs/Navigation/Navigation.ts` | 1 |
| `libs/actions/IOU/Hold.ts` | `libs/ReportActionsUtils.ts` | 1 |
| `libs/actions/IOU/Hold.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/actions/IOU/PayMoneyRequest.ts` | `libs/ReportActionsUtils.ts` | 1 |
| `libs/actions/IOU/PayMoneyRequest.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/actions/IOU/RejectMoneyRequest.ts` | `libs/TransactionUtils/index.ts` | 1 |
| `libs/actions/IOU/TrackExpense.ts` | `libs/TransactionUtils/index.ts` | 1 |
| `libs/actions/PaymentMethods.ts` | `libs/Navigation/Navigation.ts` | 1 |
| `libs/NextStepUtils.ts` | `libs/ReportActionsUtils.ts` | 1 |
| `libs/NextStepUtils.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/SearchQueryUtils.ts` | `libs/PersonalDetailsUtils.ts` | 1 |
| `libs/SearchUIUtils.ts` | `libs/PersonalDetailsUtils.ts` | 1 |
| `libs/actions/IOU/DeleteMoneyRequest.ts` | `libs/TransactionUtils/index.ts` | 1 |
| `libs/actions/IOU/MoneyRequest.ts` | `libs/IOUUtils.ts` | 1 |
| `libs/actions/IOU/MoneyRequest.ts` | `libs/Navigation/Navigation.ts` | 1 |
| `libs/actions/IOU/MoneyRequestBuilder.ts` | `libs/ReportActionsUtils.ts` | 1 |
| `libs/actions/IOU/MoneyRequestBuilder.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/actions/IOU/MoneyRequestBuilder.ts` | `libs/Violations/ViolationsUtils.ts` | 1 |
| `libs/actions/Search.ts` | `libs/Navigation/Navigation.ts` | 1 |
| `libs/actions/Search.ts` | `libs/PaymentUtils.ts` | 1 |
| `libs/IOUUtils.ts` | `libs/TransactionUtils/index.ts` | 1 |
| `libs/SearchQueryUtils.ts` | `libs/CardUtils.ts` | 1 |
| `libs/SearchUIUtils.ts` | `libs/actions/Report/index.ts` | 1 |
| `libs/SearchUIUtils.ts` | `libs/CardUtils.ts` | 1 |
| `libs/SearchUIUtils.ts` | `libs/ReportNameUtils.ts` | 1 |
| `libs/TransactionUtils/index.ts` | `libs/ReportActionsUtils.ts` | 1 |
| `libs/TransactionUtils/index.ts` | `libs/ValidationUtils.ts` | 1 |
| `libs/actions/IOU/RejectMoneyRequest.ts` | `libs/Navigation/Navigation.ts` | 1 |
| `libs/actions/IOU/TrackExpense.ts` | `libs/IOUUtils.ts` | 1 |
| `libs/actions/IOU/TrackExpense.ts` | `libs/Navigation/Navigation.ts` | 1 |
| `libs/actions/IOU/TrackExpense.ts` | `libs/actions/Welcome/OnboardingFlow.ts` | 1 |
| `libs/actions/Policy/Tag.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/actions/Search.ts` | `libs/PersonalDetailsUtils.ts` | 1 |
| `libs/SearchQueryUtils.ts` | `libs/ValidationUtils.ts` | 1 |
| `libs/SearchUIUtils.ts` | `libs/CardFeedUtils.ts` | 1 |
| `libs/SearchUIUtils.ts` | `libs/ReportActionsUtils.ts` | 1 |
| `libs/SearchUIUtils.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/SearchUIUtils.ts` | `libs/ValidationUtils.ts` | 1 |
| `libs/actions/IOU/DeleteMoneyRequest.ts` | `libs/Navigation/Navigation.ts` | 1 |
| `libs/actions/IOU/MoneyRequest.ts` | `libs/OptionsListUtils/index.ts` | 1 |
| `libs/actions/IOU/TrackExpense.ts` | `libs/PersonalDetailsUtils.ts` | 1 |
| `libs/actions/Search.ts` | `libs/actions/Report/index.ts` | 1 |
| `libs/IOUUtils.ts` | `libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute.ts` | 1 |
| `libs/MoneyRequestUtils.ts` | `libs/ValidationUtils.ts` | 1 |
| `libs/Navigation/helpers/navigateAfterExpenseCreate.ts` | `libs/Navigation/Navigation.ts` | 1 |
| `libs/ReportPrimaryActionUtils.ts` | `libs/ReportActionsUtils.ts` | 1 |
| `libs/ReportPrimaryActionUtils.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/SearchUIUtils.ts` | `libs/SearchQueryUtils.ts` | 1 |
| `libs/TransactionPreviewUtils.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/TransactionPreviewUtils.ts` | `libs/ReportActionsUtils.ts` | 1 |
| `libs/TransactionPreviewUtils.ts` | `libs/ValidationUtils.ts` | 1 |
| `libs/Violations/ViolationsUtils.ts` | `libs/CardUtils.ts` | 1 |
| `libs/actions/IOU/MoneyRequest.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/actions/IOU/RejectMoneyRequest.ts` | `libs/actions/Report/index.ts` | 1 |
| `libs/actions/IOU/TrackExpense.ts` | `libs/actions/Report/index.ts` | 1 |
| `libs/actions/Search.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/actions/Search.ts` | `libs/SearchUIUtils.ts` | 1 |
| `libs/actions/Welcome/OnboardingFlow.ts` | `libs/Navigation/linkingConfig/index.ts` | 1 |
| `libs/Violations/ViolationsUtils.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/actions/App.ts` | `libs/Navigation/helpers/willRouteNavigateToRHP.ts` | 1 |
| `libs/actions/IOU/DeleteMoneyRequest.ts` | `libs/actions/Report/index.ts` | 1 |
| `libs/actions/IOU/RejectMoneyRequest.ts` | `libs/ReportActionsUtils.ts` | 1 |
| `libs/actions/IOU/RejectMoneyRequest.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/actions/IOU/TrackExpense.ts` | `libs/ReportActionsUtils.ts` | 1 |
| `libs/actions/IOU/TrackExpense.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/actions/Policy/Policy.ts` | `libs/getWorkspaceCreatedAnalyticsEvent.ts` | 1 |
| `libs/actions/Policy/Policy.ts` | `libs/PersonalDetailsUtils.ts` | 1 |
| `libs/actions/Search.ts` | `libs/SearchQueryUtils.ts` | 1 |
| `libs/actions/Transaction.ts` | `libs/ReportActionsUtils.ts` | 1 |
| `libs/actions/Transaction.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/actions/Welcome/OnboardingFlow.ts` | `libs/Navigation/helpers/getAdaptedStateFromPath.ts` | 1 |
| `libs/actions/App.ts` | `libs/Navigation/Navigation.ts` | 1 |
| `libs/actions/IOU/DeleteMoneyRequest.ts` | `libs/ReportActionsUtils.ts` | 1 |
| `libs/actions/IOU/DeleteMoneyRequest.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/actions/Link.ts` | `libs/Navigation/helpers/getStateFromPath.ts` | 1 |
| `libs/actions/Policy/Member.ts` | `libs/ReportActionsUtils.ts` | 1 |
| `libs/actions/Policy/Member.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/actions/Policy/Tag.ts` | `libs/actions/Task.ts` | 1 |
| `libs/actions/Task.ts` | `libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute.ts` | 1 |
| `libs/actions/Task.ts` | `libs/Navigation/Navigation.ts` | 1 |
| `libs/IOUUtils.ts` | `libs/ReportActionsUtils.ts` | 1 |
| `libs/IOUUtils.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/Navigation/helpers/swapBackgroundTabForRHPTarget.ts` | `libs/Navigation/helpers/getStateFromPath.ts` | 1 |
| `libs/actions/ClearReportActionErrors.ts` | `libs/ReportActionsUtils.ts` | 1 |
| `libs/actions/ClearReportActionErrors.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/actions/PaymentMethods.ts` | `libs/CardUtils.ts` | 1 |
| `libs/actions/Policy/Policy.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/actions/Task.ts` | `libs/PersonalDetailsUtils.ts` | 1 |
| `libs/Navigation/helpers/navigateAfterExpenseCreate.ts` | `libs/SearchQueryUtils.ts` | 1 |
| `libs/actions/ClearReportActionErrors.ts` | `libs/SearchQueryUtils.ts` | 1 |
| `libs/actions/Link.ts` | `libs/Navigation/Navigation.ts` | 1 |
| `libs/actions/Policy/Category.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/actions/Policy/Tag.ts` | `libs/fileDownload/index.ts` | 1 |
| `libs/actions/Task.ts` | `libs/OptionsListUtils/index.ts` | 1 |
| `libs/actions/Task.ts` | `libs/ReportNameUtils.ts` | 1 |
| `libs/Navigation/helpers/linkTo/index.ts` | `libs/Navigation/linkingConfig/index.ts` | 1 |
| `libs/actions/App.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/actions/Task.ts` | `libs/ReportActionsUtils.ts` | 1 |
| `libs/actions/Task.ts` | `libs/ReportUtils.ts` | 1 |
| `libs/actions/Welcome/index.ts` | `libs/Navigation/Navigation.ts` | 1 |
| `libs/actions/Search.ts` | `libs/fileDownload/index.ts` | 1 |
| `libs/actions/Task.ts` | `libs/SearchQueryUtils.ts` | 1 |
| `libs/actions/Link.ts` | `libs/ReportUtils.ts` | 1 |

