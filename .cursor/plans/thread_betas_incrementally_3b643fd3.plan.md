---
name: ""
overview: ""
todos: []
isProject: false
---

# Thread `betas` through remaining internal `openReport` callers

## Goal

Remove `Onyx.connectWithoutView` for `ONYXKEYS.BETAS` in `src/libs/ReportUtils.ts` by threading `betas` through every caller of `openReport` so the module-level `allBetas` variable is no longer needed.

## Premise

Six internal functions in `src/libs/actions/Report/index.ts` call `openReport` without passing `betas`. The module-level variable `allBetas` in `ReportUtils.ts` is used as a fallback (`betas ?? allBetas`) inside `prepareOnboardingOnyxData`. Once every path passes `betas` explicitly, we can remove the `Onyx.connectWithoutView` subscription and the `allBetas` variable.

## Progress


| PR    | Status  | Link                                                  |
| ----- | ------- | ----------------------------------------------------- |
| A/F   | Merged  | [#85707](https://github.com/Expensify/App/pull/85707) |
| B     | Merged  | [#85710](https://github.com/Expensify/App/pull/85710) |
| C     | Merged  | [#85714](https://github.com/Expensify/App/pull/85714) |
| D     | Merged  | [#85876](https://github.com/Expensify/App/pull/85876) |
| E     | Pending | —                                                     |
| Final | Pending | —                                                     |


---

## PR A/F — `navigateToAndOpenReportWithAccountIDs` + `replaceOptimisticReportWithActualReport`

**Status: Merged** ([#85707](https://github.com/Expensify/App/pull/85707))

### Changes

- `Report/index.ts`: Add `betas` param to `navigateToAndOpenReportWithAccountIDs`, pass to `openReport`.
- `PromotedActionsBar.tsx` / `ProfilePage.tsx`: Thread `betas` through `PromotedActions.message`.
- `WorkspaceWorkflowsPayerPage.tsx`: `useOnyx(ONYXKEYS.BETAS)`, pass `betas`.
- `replaceOptimisticReportWithActualReport`: Pass `betas: undefined` on two `openReport` calls (safe — `introSelected` is always `undefined` so `prepareOnboardingOnyxData` is never reached). Retained with a comment explaining why `betas: undefined` is acceptable.

### Tests

- `tests/unit/PromotedActionsBarTest.ts`: Added `betas: undefined` to all `PromotedActions.message()` calls.

---

## PR B — `navigateToAndOpenChildReport` + `createChildReport` + `toggleSubscribeToChildReport`

**Status: Merged** ([#85710](https://github.com/Expensify/App/pull/85710))

### Changes

- `Report/index.ts`: Add `betas` param to `navigateToAndOpenChildReport`, `createChildReport`, `toggleSubscribeToChildReport`; pass through to `openReport`.
- `ContextMenuActions.tsx`: Pass `betas` at six call sites (already has `betas` in payload).
- `ReportActionItemThread.tsx`: `useOnyx(ONYXKEYS.BETAS)`, pass `betas`.

### Tests

- `tests/actions/ReportTest.ts`: Added `betas: undefined` to `navigateToAndOpenChildReport` test calls. Added new test verifying `betas` is forwarded to `openReport`.

---

## PR C — `navigateToAndOpenReport` + `PromotedActionsBar.message`

**Status: Merged** ([#85714](https://github.com/Expensify/App/pull/85714))

### Changes

- `Report/index.ts`: Add `betas` param to `navigateToAndOpenReport`; pass to `openReport`. Internal call from `navigateToConciergeChat` passes `betas: undefined` temporarily (fixed in PR D).
- `NewChatPage.tsx`: Already has `betas`, pass it.
- `SearchRouter.tsx`, `SearchPageHeaderInput.tsx`: Add `useOnyx(ONYXKEYS.BETAS)`, pass `betas`.
- `PromotedActionsBar.tsx`: Thread `betas` through `PromotedActions.message` call to `navigateToAndOpenReport`.

### Tests

- `tests/actions/ReportTest.ts`: Updated `navigateToAndOpenReport` test calls with `betas: undefined`.

---

## PR D — `navigateToConciergeChat` and its callers

**Status: Draft** ([#85876](https://github.com/Expensify/App/pull/85876))

### Changes

**Core signatures (`Report/index.ts`):**

- `navigateToConciergeChat`: Add `betas` param after `isSelfTourViewed`, pass to `navigateToAndOpenReport`.
- `navigateToConciergeChatAndDeleteReport`: Add `betas`, pass to `navigateToConciergeChat`.
- `clearCreateChatError`: Add `betas`, pass to `navigateToConciergeChatAndDeleteReport`.
- `navigateToMostRecentReport`: Add `betas`, pass to `navigateToConciergeChat`.
- `leaveGroupChat`: Add `betas`, pass to `navigateToMostRecentReport`.
- `leaveRoom`: Add `betas`, pass to `navigateToMostRecentReport`.

**Downstream action files:**

- `Task.ts` (`clearTaskErrors`): Add `betas`, pass to `navigateToConciergeChatAndDeleteReport`.
- `Link.ts` (`openReportFromDeepLink`): Pass `betas` to `navigateToConciergeChat` (with `undefined` for `isSelfTourViewed` + TODO).
- `walletNavigationUtils.ts`: Add `betas` param, pass to `navigateToConciergeChat` (with `undefined` for `isSelfTourViewed` + TODO).

**Component callers (20 files) — each adds `useOnyx(ONYXKEYS.BETAS)` and passes `betas`:**

- `ConciergePage.tsx`
- `ReportScreen.tsx`
- `AboutPage.tsx`
- `ConnectBankAccount.tsx`
- `FinishChatCard.tsx`
- `NonUSD/Finish/index.tsx`
- `WorkspaceMoreFeaturesPage.tsx`
- `WorkspaceCompanyCardsFeedPendingPage.tsx`
- `SubscriptionSettings/index.tsx`
- `TaxExemptActions/index.tsx`
- `AddNewCardPage.tsx`
- `WorkspaceCardsListLabel.tsx`
- `PreTrialBillingBanner.tsx`
- `ConciergeLinkRenderer.tsx`
- `MoneyRequestReceiptView.tsx`
- `DebugReportPage.tsx`
- `ReportActionItemParentAction.tsx` (uses existing `allBetas`)
- `ReportActionItemCreated.tsx`
- `TaskView.tsx`
- `ReportDetailsPage.tsx`
- `WalletStatementModal/index.tsx`
- `WalletStatementModal/index.native.tsx`

### Tests

- `tests/actions/ReportTest.ts`: Updated all test calls with `undefined` for `betas`. Added two new tests:
  1. `navigateToConciergeChat` forwards `betas` to `openReport` when `conciergeReportID` is `undefined`.
  2. `clearCreateChatError` forwards `betas` through the call chain to `openReport`.

---

## PR E — `createTransactionThreadReport`

**Status: Pending**

### Changes

- `Report/index.ts`: Add `betas` to `createTransactionThreadReport`, pass to `openReport` (line ~1920).
- `SearchUIUtils.ts`: `createAndOpenSearchTransactionThread` takes `betas`, passes to `createTransactionThreadReport`.

**Direct component callers of `createTransactionThreadReport`:**

- `MoneyReportHeader.tsx`
- `ReportScreen.tsx` (2 call sites)
- `SearchMoneyRequestReportPage.tsx` (2 call sites)
- `PureReportActionItem.tsx`
- `MoneyRequestAction.tsx`
- `MoneyRequestReportTransactionList.tsx`
- `MoneyRequestReportTransactionsNavigation.tsx` (2 call sites)

**Callers of `createAndOpenSearchTransactionThread`:**

- `Search/index.tsx`
- `TransactionGroupListExpanded.tsx`

### Tests

- Add `betas: undefined` to existing test calls for `createTransactionThreadReport`.
- Add new test verifying `betas` forwarding.

---

## Final PR — Remove `Onyx.connectWithoutView` for `ONYXKEYS.BETAS`

**Status: Pending**

### Changes

- `src/libs/ReportUtils.ts`: Remove `Onyx.connectWithoutView` for `ONYXKEYS.BETAS`, remove `allBetas` variable, remove `betas ?? allBetas` fallback in `prepareOnboardingOnyxData`.
- Make `betas` required (not optional) in `PrepareOnboardingOnyxDataParams`.
- Update all callers of `prepareOnboardingOnyxData` to pass `betas` explicitly.

### Tests

- `ReportUtilsTest.ts`: Update `prepareOnboardingOnyxData` test calls with required `betas` param.

---

## Complete Call Tree (verified from main — 2026-03-12)

```
prepareOnboardingOnyxData (src/libs/ReportUtils.ts) — uses allBetas fallback (betas ?? allBetas)
├── getGuidedSetupDataForOpenReport (Report/index.ts) — passes betas ✅
│   └── openReport (Report/index.ts) — passes betas ✅
│       ├── navigateToAndOpenReportWithAccountIDs — passes betas ✅ (PR A/F)
│       │   ├── PromotedActionsBar.message — passes betas ✅
│       │   │   └── ProfilePage.tsx — useOnyx ✅
│       │   └── WorkspaceWorkflowsPayerPage.tsx — useOnyx ✅
│       ├── navigateToAndOpenChildReport — passes betas ✅ (PR B)
│       │   ├── createChildReport — passes betas ✅
│       │   │   └── ContextMenuActions.tsx — passes betas ✅
│       │   └── ReportActionItemThread.tsx — useOnyx ✅
│       ├── toggleSubscribeToChildReport — passes betas ✅ (PR B)
│       │   └── ContextMenuActions.tsx — passes betas ✅
│       ├── navigateToAndOpenReport — passes betas ✅ (PR C)
│       │   ├── NewChatPage.tsx — useOnyx ✅
│       │   ├── SearchRouter.tsx — useOnyx ✅
│       │   ├── SearchPageHeaderInput.tsx — useOnyx ✅
│       │   ├── useSearchPageInput.tsx — useOnyx ✅ (added on main after PR C)
│       │   ├── PromotedActionsBar.message — passes betas ✅
│       │   │   └── ProfilePage.tsx — useOnyx ✅
│       │   └── navigateToConciergeChat — passes betas ✅ (PR D)
│       │       ├── ConciergePage.tsx — useOnyx ✅
│       │       ├── ReportScreen.tsx — useOnyx ✅
│       │       ├── AboutPage.tsx — useOnyx ✅
│       │       ├── ConnectBankAccount.tsx — useOnyx ✅
│       │       ├── FinishChatCard.tsx — useOnyx ✅
│       │       ├── NonUSD/Finish/index.tsx — useOnyx ✅
│       │       ├── WorkspaceMoreFeaturesPage.tsx — useOnyx ✅
│       │       ├── WorkspaceCompanyCardsFeedPendingPage.tsx — useOnyx ✅
│       │       ├── SubscriptionSettings/index.tsx — useOnyx ✅
│       │       ├── TaxExemptActions/index.tsx — useOnyx ✅
│       │       ├── companyCards/addNew/AddNewCardPage.tsx — useOnyx ✅
│       │       ├── WorkspaceCardsListLabel.tsx — useOnyx ✅
│       │       ├── PreTrialBillingBanner.tsx — useOnyx ✅
│       │       ├── ConciergeLinkRenderer.tsx — useOnyx ✅
│       │       ├── WalletStatementModal (web + native) — useOnyx ✅
│       │       ├── WorkspaceWorkflowsPage.tsx — useOnyx ✅ (added on main after PR D)
│       │       ├── WalletPage/index.tsx — useOnyx ✅ (added on main after PR D)
│       │       ├── PersonalCards/AddNewCardPage.tsx — useOnyx ✅ (added on main after PR D)
│       │       ├── SettlementButton/index.tsx — useOnyx ✅ (added on main after PR D)
│       │       ├── Link.ts (openReportFromDeepLink) — passes betas ✅
│       │       ├── navigateToConciergeChatAndDeleteReport — passes betas ✅
│       │       │   ├── MoneyRequestReceiptView.tsx — useOnyx ✅
│       │       │   ├── DebugReportPage.tsx — useOnyx ✅
│       │       │   ├── ReportActionItemParentAction.tsx — useOnyx ✅
│       │       │   └── clearCreateChatError — passes betas ✅
│       │       │       ├── ReportActionItemCreated.tsx — useOnyx ✅
│       │       │       └── clearTaskErrors (Task.ts) — passes betas ✅
│       │       │           └── TaskView.tsx — useOnyx ✅
│       │       ├── navigateToMostRecentReport — passes betas ✅
│       │       │   ├── leaveGroupChat — passes betas ✅
│       │       │   │   └── ReportDetailsPage.tsx — useOnyx ✅
│       │       │   └── leaveRoom — passes betas ✅
│       │       │       └── ReportDetailsPage.tsx — useOnyx ✅
│       │       └── (test callers) — passes undefined ✅
│       ├── createTransactionThreadReport — does NOT pass betas ❌ (PR E)
│       │   ├── MoneyReportHeader.tsx ❌
│       │   ├── ReportScreen.tsx (2 call sites) ❌
│       │   ├── SearchMoneyRequestReportPage.tsx (2 call sites) ❌
│       │   ├── PureReportActionItem.tsx ❌
│       │   ├── MoneyRequestAction.tsx ❌
│       │   ├── MoneyRequestReportTransactionList.tsx ❌
│       │   ├── MoneyRequestReportTransactionsNavigation.tsx (2 call sites) ❌
│       │   └── SearchUIUtils.createAndOpenSearchTransactionThread ❌
│       │       ├── Search/index.tsx ❌
│       │       └── TransactionGroupListExpanded.tsx ❌
│       ├── replaceOptimisticReportWithActualReport — passes betas: undefined ✅ (PR A/F)
│       └── (direct callers in components) — passes betas ✅
├── completeOnboarding (Report/index.ts) — passes betas ✅
│   ├── BaseOnboardingWorkspaces.tsx — useOnyx ✅
│   └── BaseOnboardingPurpose.tsx — useOnyx ✅
├── requestMoney (IOU/index.ts) — passes betas ✅
│   └── ...
└── buildPolicyData (Policy/Policy.ts) — passes betas ✅
    └── createWorkspace — passes betas ✅
        ├── BaseOnboardingWorkspaceConfirmation.tsx — useOnyx ✅
        └── ...
```

---

## Suggested Merge Order

A/F, B, C were merged in any order. D depended on C. E is independent. Final PR depends on all others.

**Completed:** A/F → B → C → D
**Remaining:** E → Final PR