---
name: Thread delegateEmail incrementally (v2)
overview: Remove deprecated Onyx.connect() for ONYXKEYS.ACCOUNT in src/libs/ReportUtils.ts by threading delegateEmail through all buildOptimistic* functions and their callers from React components.
todos:
  - id: pr-1
    content: "PR 1: buildOptimisticEditedTaskFieldReportAction → editTask → TaskTitlePage, TaskDescriptionPage"
    status: completed
  - id: pr-2
    content: "PR 2: buildOptimisticChangedTaskAssigneeReportAction → editTaskAssignee → TaskAssigneeSelectorModal"
    status: completed
  - id: pr-2b
    content: "PR 2b: Refactor editTaskAssignee to use options object — remove max-params eslint-disable"
    status: completed
  - id: pr-3
    content: "PR 3: Unapprove + Retract + Submit — 3 builders + 3 actions + MoneyReportHeader/SubmitActionButton/SubmitPrimaryAction"
    status: completed
  - id: pr-4
    content: "PR 4: Approve — 1 builder + approveMoneyRequest + 6 component callers"
    status: completed
  - id: pr-5
    content: "PR 5: Task complete/reopen/delete — 1 builder + 4 Task.ts fns + 5 components"
    status: completed
  - id: pr-6
    content: "PR 6: Task secondary — getFinishOnboardingTaskOnyxData + completeTestDriveTask + Workflow/Policy callers + 3 components"
    status: completed
  - id: pr-7
    content: "PR 7: AddComment — builder + addActions/addComment/addAttachment + explain/inviteToRoom/resolveConcierge + 14 components"
    status: completed
  - id: pr-8
    content: "PR 8: ModifiedExpense — builder + getUpdateMoneyRequestParams/getUpdateTrackExpenseParams + updateMoneyRequest* + components"
    status: pending
  - id: pr-9
    content: "PR 9: IOUReportAction + ReportPreview — 2 builders + all shared IOU internal helpers (no component changes)"
    status: pending
  - id: pr-10
    content: "PR 10: IOU request + track + distance — requestMoney/createDistanceRequest/trackExpense + component callers"
    status: pending
  - id: pr-11
    content: "PR 11: IOU split flows — startSplitBill/splitBill/splitBillAndOpenReport + completeSplitBill + component callers"
    status: pending
  - id: pr-12
    content: "PR 12: IOU pay + send + invoice — payMoneyRequest/payInvoice/sendInvoice/sendMoney + component callers"
    status: pending
  - id: pr-13
    content: "PR 13: IOU reject + per diem — rejectMoneyRequest/submitPerDiemExpense + component callers"
    status: pending
  - id: pr-14
    content: "PR 14: prepareOnboardingOnyxData — Report callers + Policy/Policy.ts + IOU test drive"
    status: pending
  - id: pr-15
    content: "PR 15: Remaining callers (Workflow.ts, Policy/Tag.ts, Policy/Category.ts, openReport, Search, changePolicyData)"
    status: pending
  - id: pr-16
    content: "PR 16 (Final): Remove Onyx.connect() for ONYXKEYS.ACCOUNT + cleanup"
    status: pending
isProject: false
---

# Remove `Onyx.connect()` for `ONYXKEYS.ACCOUNT` in `ReportUtils.ts`

## Target

```typescript
// src/libs/ReportUtils.ts — module-level variable set by Onyx.connect
let delegateEmail: string;
Onyx.connect({
    key: ONYXKEYS.ACCOUNT,
    callback: (value) => {
        delegateEmail = value?.delegatedAccess?.delegate ?? '';
    },
});
```

The `delegateEmail` variable is consumed by 11 `buildOptimistic*` functions to set `delegateAccountID` on optimistic report actions.

**Reference issue**: [https://github.com/Expensify/App/issues/66425](https://github.com/Expensify/App/issues/66425)

---

## Source in React components

```typescript
import {delegateEmailSelector} from '@selectors/Account';
const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
```

The selector returns `account?.delegatedAccess?.delegate ?? ''` (defined in `src/selectors/Account.ts`).

---

## Rules (follow strictly in every PR)

1. **Use `string | undefined`** for `delegateEmail` at every level — actions, builders, types, and component props. **Never** use `delegateEmail?: string` (optional syntax). Always explicit `delegateEmail: string | undefined`.
2. **Components**: Use `const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector})` — no `= ''` default. Pass the value (which may be `undefined`) directly to action functions.
3. **Builders**: Handle `undefined` with a ternary: `delegateEmailParam ? getPersonalDetailByEmail(delegateEmailParam) : undefined`. **Exception**: If not all callers are migrated in this PR, use the fallback pattern from Rule 7 instead.
4. **Where a caller doesn't have delegateEmail yet** (different PR), pass `undefined` explicitly and add a comment that names the specific builder function using the fallback **and the PR number (per this plan) that will thread the real value**: `// Will be refactored in PR <N>; <builderFunctionName> falls back to module-level Onyx.connect value; tracked in https://github.com/Expensify/App/issues/66425`. The builder MUST have the fallback pattern (Rule 7) active whenever any caller in the tree passes `undefined`.
5. **ESLint disables**: Avoid `// eslint-disable-next-line` where possible. When unavoidable, always add a justification comment explaining why.
6. **Tests in every PR**: Each PR must verify `delegateAccountID` forwarding. Set up `ONYXKEYS.PERSONAL_DETAILS_LIST` with a delegate's personal details, call the action with a known `delegateEmail`, then inspect `(API.write as jest.Mock).mock.calls` → `onyxData.optimisticData` → find the report action update → check `delegateAccountID` matches the delegate's accountID. Also test the `undefined` case.
7. **Module-level fallback rule (CRITICAL)**: When a builder function is modified to accept `delegateEmailParam` but **not all callers are migrated in the same PR**, the builder **MUST** fall back to the module-level `delegateEmail` variable:

```typescript
   const effectiveDelegateEmail = delegateEmailParam ?? delegateEmail;
   const delegateAccountDetails = effectiveDelegateEmail ? getPersonalDetailByEmail(effectiveDelegateEmail) : undefined;
   

```

   Add a comment: `// Falls back to module-level delegateEmail (from Onyx.connect) for callers not yet migrated; will be removed in https://github.com/Expensify/App/issues/66425`

   **PRs that NEED the fallback** (builder has callers migrated across multiple PRs):

- **PR 5** (`buildOptimisticTaskReportAction`) — callers in PR 6, 14, 15
- **PR 7** (`buildOptimisticAddCommentReportAction`) — callers in PR 11, 14
- **PR 8** (`buildOptimisticModifiedExpenseReportAction`) — callers: PR 11 via Split.ts, TransactionInlineEdit.ts (module-level, future PR)
- **PR 9** (`buildOptimisticIOUReportAction`, `buildOptimisticReportPreview`) — callers in PR 10–15
 **PRs that do NOT need the fallback** (all callers migrated in same PR):
- PR 1, 2, 3, 4, 6, 10, 11, 12, 13, 14, 15
 **Late-arriving `undefined` callers**: If a later PR introduces an `undefined` caller to a builder that was modified in a **previous PR without a fallback** (because at that time all callers were migrated), the **current PR must add the fallback** to the builder before passing `undefined`. For example, if PR 6 migrated all callers of a builder and didn't need a fallback, but PR 15 later adds a new caller that passes `undefined`, PR 15 must first add the fallback (`delegateEmailParam ?? delegateEmail`) to the builder in the same commit.

1. **Fallback guarantee (STRICT)**: Before passing `undefined` for `delegateEmail` anywhere in the call tree, you MUST verify that the top-level builder function at the end of the chain has the fallback pattern (`delegateEmailParam ?? delegateEmail`) active. Every `undefined` comment MUST name the exact builder function that provides the fallback. Never pass `undefined` without confirming the fallback exists. If the builder doesn't have the fallback yet, add it in the same PR.
2. **Post-edit checklist**: Run `npx prettier --write`, `npx eslint --max-warnings=0`, and `npm run typecheck-tsgo` on every changed file before committing.
3. **No removed comments**: When editing a line that has an existing comment above it, preserve that comment unless it's directly related to the change.
4. **Dylan's feedback (IMPORTANT)**: We're not just refactoring to remove Onyx.connect; we also need to think about a cleaner way to optimize the codebase, remove dead code, and increase unit test coverage. When a large object is passed as a parameter but many fields aren't used, use a selector or filter to pass only necessary fields. Avoid introducing new full-collection subscriptions (e.g. `useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST)` without a selector).
5. **TODO comments must name the specific parameter (STRICT)**: When passing `undefined` for a parameter, the comment MUST specify **which parameter** is `undefined`. When there are multiple `undefined` values, each one must be labeled. Format: `// <paramName>: will be threaded in PR <N>; <builderFunctionName> falls back to module-level Onyx.connect value (https://github.com/Expensify/App/issues/66425)`. For non-applicable params use: `// <paramName>: not applicable here`. Example with multiple `undefined` values: `// parentReportAction: not applicable here; delegateEmail: will be threaded in PR 15; buildOptimisticTaskReportAction falls back to module-level Onyx.connect value (https://github.com/Expensify/App/issues/66425)`.

---

## Progress


| PR         | Status      | Link                                                  |
| ---------- | ----------- | ----------------------------------------------------- |
| 1          | Merged      | [#85929](https://github.com/Expensify/App/pull/85929) |
| 2          | Merged      | [#86805](https://github.com/Expensify/App/pull/86805) |
| 2b         | Completed   | —                                                     |
| 3          | Merged      | [#86942](https://github.com/Expensify/App/pull/86942) |
| 4          | Merged      | [#87222](https://github.com/Expensify/App/pull/87222) |
| 5          | Merged      | [#87527](https://github.com/Expensify/App/pull/87527) |
| 6          | Merged      | [#87809](https://github.com/Expensify/App/pull/87809) |
| 7          | Merged      | [#87968](https://github.com/Expensify/App/pull/87968) |
| 8          | Pending     | —                                                     |
| 9          | Pending     | —                                                     |
| 10         | Pending     | —                                                     |
| 11         | Pending     | —                                                     |
| 12         | Pending     | —                                                     |
| 13         | Pending     | —                                                     |
| 14         | Pending     | —                                                     |
| 15         | Pending     | —                                                     |
| 16 (Final) | Pending     | —                                                     |


---

## Dependencies

```
PR 1 ─── MERGED
PR 2 ─── MERGED
PR 2b ── COMPLETED
PR 3 ─── MERGED
PR 4 ─── MERGED
PR 5 ─── MERGED
PR 6 ─── MERGED (depends on PR 5)
PR 7 ─── MERGED (independent)
PR 8 ─── independent
PR 9 ─── independent
PR 10 ── depends on PR 9
PR 11 ── depends on PR 9
PR 12 ── depends on PR 9
PR 13 ── depends on PR 9
PR 14 ── depends on PRs 5 + 7 + 9
PR 15 ── depends on PR 14
PR 16 ── depends on ALL above
```

Parallel tracks: PRs 7, 8, 9 can proceed independently. PRs 10-13 are independent of each other (all depend on PR 9).

---

## Complete Call Tree

Each `buildOptimistic*` function in `ReportUtils.ts` reads the module-level `delegateEmail` variable.
PR annotations show which PR threads `delegateEmail` through that path.

Legend: **[PR N]** = handled in that PR. ✅ = merged/completed. 🔄 = in progress.

---

### 1. `buildOptimisticEditedTaskFieldReportAction` — ✅ PR 1

```
buildOptimisticEditedTaskFieldReportAction (ReportUtils.ts)     ✅ PR 1
└── editTask (Task.ts)                                          ✅ PR 1
    ├── TaskTitlePage.tsx                                        ✅ PR 1
    └── TaskDescriptionPage.tsx                                  ✅ PR 1
```

---

### 2. `buildOptimisticChangedTaskAssigneeReportAction` — ✅ PR 2

```
buildOptimisticChangedTaskAssigneeReportAction (ReportUtils.ts) ✅ PR 2
└── editTaskAssignee (Task.ts)                                  ✅ PR 2 (refactored to options object in PR 2b)
    └── TaskAssigneeSelectorModal.tsx                            ✅ PR 2
```

---

### 3. `buildOptimisticUnapprovedReportAction` — ✅ PR 3

```
buildOptimisticUnapprovedReportAction (ReportUtils.ts)          ✅ PR 3
└── unapproveExpenseReport (IOU/index.ts)                       ✅ PR 3
    └── MoneyReportHeader.tsx                                    ✅ PR 3
```

---

### 4. `buildOptimisticRetractedReportAction` — ✅ PR 3

```
buildOptimisticRetractedReportAction (ReportUtils.ts)           ✅ PR 3
└── retractReport (IOU/index.ts)                                ✅ PR 3
    └── MoneyReportHeader.tsx                                    ✅ PR 3
```

---

### 5. `buildOptimisticSubmittedReportAction` — ✅ PR 3

```
buildOptimisticSubmittedReportAction (ReportUtils.ts)           ✅ PR 3
└── submitReport (IOU/index.ts)                                 ✅ PR 3
    ├── MoneyReportHeader.tsx                                    ✅ PR 3
    ├── SubmitActionButton.tsx                                   ✅ PR 3
    └── SubmitPrimaryAction.tsx                                  ✅ PR 3
```

---

### 6. `buildOptimisticApprovedReportAction` — ✅ PR 4

```
buildOptimisticApprovedReportAction (ReportUtils.ts)            ✅ PR 4
└── approveMoneyRequest (IOU/index.ts)                          ✅ PR 4
    ├── MoneyReportHeader.tsx                                    ✅ PR 4
    ├── ApproveActionButton.tsx                                  ✅ PR 4
    ├── PayActionButton.tsx                                      ✅ PR 4
    ├── SettlementButton/index.tsx                               ✅ PR 4
    ├── ProcessMoneyReportHoldMenu.tsx (via useHoldMenuSubmit)   ✅ PR 4
    ├── useConfirmApproval.ts                                    ✅ PR 4
    └── PaymentUtils.ts (selectPaymentType)                     ✅ PR 4
```

---

### 7. `buildOptimisticTaskReportAction` — ✅ PR 5 + PR 6 + [PR 14] + [PR 15]

> ⚠️ NEEDS FALLBACK: callers migrated across PR 5, 6, 14, 15

```
buildOptimisticTaskReportAction (ReportUtils.ts)                ✅ PR 5 (with fallback)
│
├── buildTaskData (Task.ts)                                     ✅ PR 5
│   ├── completeTask (Task.ts)                                  ✅ PR 5
│   │   ├── TaskHeaderActionButton.tsx                           ✅ PR 5
│   │   ├── TaskView.tsx                                        ✅ PR 5
│   │   ├── TaskPreview.tsx                                     ✅ PR 5
│   │   ├── TaskListItemRow.tsx                                 ✅ PR 5
│   │   ├── Workflow.ts (createApprovalWorkflow)                ✅ PR 6 (passes undefined → PR 15)
│   │   └── Task.ts internal:
│   │       ├── getFinishOnboardingTaskOnyxData (Task.ts)       ✅ PR 6
│   │       │   ├── completeTestDriveTask (Task.ts)             ✅ PR 6
│   │       │   │   ├── IOURequestStepConfirmation.tsx          ✅ PR 6
│   │       │   │   ├── TestDriveDemo.tsx                       ✅ PR 6
│   │       │   │   └── DiscoverSection.tsx                     ✅ PR 6
│   │       │   ├── Policy/Tag.ts                               ✅ PR 6 (passes undefined → PR 15)
│   │       │   └── Policy/Category.ts                          ✅ PR 6 (passes undefined → PR 15)
│   │       └── completeTestDriveTask (Task.ts)                 ✅ PR 6
│   └── Policy/Policy.ts (buildPolicyData)                      [PR 14] (passes undefined → PR 14 threads it)
│
├── reopenTask (Task.ts)                                        ✅ PR 5
│   ├── TaskHeaderActionButton.tsx                              ✅ PR 5
│   ├── TaskView.tsx                                            ✅ PR 5
│   ├── TaskPreview.tsx                                         ✅ PR 5
│   └── ReportDetailsPage.tsx                                   ✅ PR 5
│
├── deleteTask (Task.ts)                                        ✅ PR 5
│   └── ReportDetailsPage.tsx                                   ✅ PR 5
│
└── prepareOnboardingOnyxData (ReportUtils.ts)                  [PR 14]
    ├── Report/index.ts (getGuidedSetupDataForOpenReport)       [PR 14]
    ├── Report/index.ts (completeOnboarding)                    [PR 14]
    │   ├── BaseOnboardingPurpose.tsx                            [PR 14]
    │   ├── BaseOnboardingWorkspaces.tsx                         [PR 14]
    │   ├── BaseOnboardingWorkspaceInvite.tsx                    [PR 14]
    │   ├── BaseOnboardingPersonalDetails.tsx                    [PR 14]
    │   ├── BaseOnboardingWorkspaceOptional.tsx                  [PR 14]
    │   ├── BaseOnboardingInterestedFeatures.tsx                 [PR 14]
    │   └── useAutoCreateTrackWorkspace.ts                       [PR 14]
    ├── Policy/Policy.ts (buildPolicyData)                      [PR 14]
    │   ├── createWorkspace (Policy/Policy.ts)                  [PR 14]
    │   │   ├── App.ts                                          [PR 14] (server flow — may stay undefined)
    │   │   ├── SettlementButton/index.tsx                      [PR 14]
    │   │   ├── IOURequestStepUpgrade.tsx                       [PR 14]
    │   │   ├── useAutoCreateTrackWorkspace.ts                  [PR 14]
    │   │   ├── WorkspaceConfirmationForTravelPage.tsx          [PR 14]
    │   │   ├── BaseOnboardingWorkspaceOptional.tsx             [PR 14]
    │   │   ├── BaseOnboardingWorkspaceConfirmation.tsx         [PR 14]
    │   │   └── BaseOnboardingInterestedFeatures.tsx            [PR 14]
    │   └── IOU/index.ts (test drive buildPolicyData call)     [PR 14]
    └── IOU/TrackExpense.ts (convertBulkTrackedExpensesToIOU)   [PR 14]
```

---

### 8. `buildOptimisticAddCommentReportAction` — ✅ PR 7 + [PR 11] + [PR 14]

> ⚠️ NEEDS FALLBACK: callers migrated across PR 7, 11, 14

```
buildOptimisticAddCommentReportAction (ReportUtils.ts)          ✅ PR 7 (with fallback)
│
├── addActions (Report/index.ts)                                ✅ PR 7
│   ├── addComment (Report/index.ts)                            ✅ PR 7
│   │   ├── ReportActionCompose.tsx                             ✅ PR 7
│   │   ├── ShareDetailsPage.tsx                                ✅ PR 7
│   │   ├── TravelTerms.tsx                                     ✅ PR 7
│   │   ├── ChronosTimerHeaderButton.tsx                        ✅ PR 7
│   │   ├── ChronosScheduleOOOPage.tsx                          ✅ PR 7
│   │   ├── explain (Report/index.ts)                           ✅ PR 7
│   │   │   ├── ContextMenuActions.tsx (via payload)            ✅ PR 7
│   │   │   │   └── BaseReportActionContextMenu.tsx (useOnyx)   ✅ PR 7
│   │   │   └── ReportActionItemMessageWithExplain.tsx          ✅ PR 7
│   │   ├── inviteToRoomAction (Report/index.ts)                ✅ PR 7
│   │   │   └── RoomInvitePage.tsx                              ✅ PR 7
│   │   ├── resolveConciergeCategoryOptions (Report/index.ts)   ✅ PR 7
│   │   │   └── PureReportActionItem.tsx                        ✅ PR 7
│   │   └── resolveConciergeDescriptionOptions (Report/index.ts)✅ PR 7
│   │       └── PureReportActionItem.tsx                        ✅ PR 7
│   ├── addAttachmentWithComment (Report/index.ts)              ✅ PR 7
│   │   ├── ReportActionCompose.tsx                             ✅ PR 7
│   │   ├── ShareDetailsPage.tsx                                ✅ PR 7
│   │   └── MoneyRequestReceiptView.tsx                         ✅ PR 7
│   └── SuggestedFollowup.ts (resolveSuggestedFollowup)         ✅ PR 7
│       └── PureReportActionItem.tsx                            ✅ PR 7
│
├── respondToProactiveAppReview (User.ts)                       ✅ PR 7
│   └── ProactiveAppReviewModalManager.tsx                      ✅ PR 7
│
├── pressLockedBankAccount (BankAccounts.ts)                    ✅ PR 7
│   ├── WalletPage/index.tsx                                    ✅ PR 7
│   ├── WorkspaceWorkflowsPage.tsx                              ✅ PR 7
│   └── SettlementButton/index.tsx                              ✅ PR 7
│
├── IOU/index.ts (buildOnyxDataForTestDriveIOU)                 [PR 14] (passes undefined → PR 14)
│
├── IOU/Split.ts (updateSplitTransactions addComment)           [PR 11] (passes undefined → PR 11)
│   ├── useDeleteTransactions.ts                                [PR 11]
│   │   ├── useSelectedTransactionsActions.ts                   [PR 11]
│   │   ├── MoneyRequestHeaderSecondaryActions.tsx              [PR 11]
│   │   ├── PopoverReportActionContextMenu.tsx                  [PR 11]
│   │   ├── MoneyReportHeader.tsx                               [PR 11]
│   │   └── ReportDetailsPage.tsx                               [PR 11]
│   └── SplitBillDetailsPage.tsx                                [PR 11]
│
├── buildOptimisticTaskCommentReportAction (ReportUtils.ts)     [PR 14]
│   ├── Task.ts (createTaskAndNavigate)                         [PR 14]
│   ├── getTaskAssigneeChatOnyxData (ReportUtils.ts)            [PR 14]
│   │   └── Task.ts (createTaskAndNavigate, editTaskAssignee)   [PR 14]
│   └── prepareOnboardingOnyxData (ReportUtils.ts)              [PR 14]
│
└── prepareOnboardingOnyxData (ReportUtils.ts)                  [PR 14]
    └── (see tree under #7 above)
```

---

### 9. `buildOptimisticModifiedExpenseReportAction` — [PR 8]

> ⚠️ NEEDS FALLBACK: callers in PR 11 via SplitTransactionUpdate.ts and TransactionInlineEdit.ts
>
> **UPDATED 2026-05-15**: Full call tree re-traced on latest main. Key changes from previous version:
> - `updateSplitTransactions` moved from `IOU/Split.ts` → `IOU/SplitTransactionUpdate.ts`
> - NEW caller: `IOURequestStepCategoryCreate.tsx` (calls `updateMoneyRequestCategory`)
> - `TransactionInlineEdit.ts` is back (was reverted then re-landed)
> - `TransactionInlineEdit.ts` calls wrappers directly, NOT via `getIouParamsForTransaction`
> - `useTransactionInlineEdit` hook wires inline edits to: `TransactionListItem`, `MoneyRequestReportTransactionItem`

```
buildOptimisticModifiedExpenseReportAction (src/libs/ReportUtils.ts)     [PR 8] (with fallback)
│
├── getUpdateMoneyRequestParams (IOU/UpdateMoneyRequest.ts)               [PR 8]
│   ├── updateMoneyRequestDate (UpdateMoneyRequest.ts)                    [PR 8]
│   │   ├── IOURequestStepDate.tsx                                        [PR 8] component
│   │   └── TransactionInlineEdit.ts → editTransactionDateInline          [PR 11] (passes undefined)
│   │       └── useTransactionInlineEdit.ts → TransactionListItem | MoneyRequestReportTransactionItem
│   │
│   ├── updateMoneyRequestBillable (UpdateMoneyRequest.ts)                [PR 8]
│   │   └── MoneyRequestView.tsx                                          [PR 8] component
│   │
│   ├── updateMoneyRequestReimbursable (UpdateMoneyRequest.ts)            [PR 8]
│   │   └── MoneyRequestView.tsx                                          [PR 8] component
│   │
│   ├── updateMoneyRequestMerchant (UpdateMoneyRequest.ts)                [PR 8]
│   │   ├── IOURequestStepMerchant.tsx                                    [PR 8] component
│   │   └── TransactionInlineEdit.ts → editTransactionMerchantInline      [PR 11] (passes undefined)
│   │       └── useTransactionInlineEdit.ts → TransactionListItem | MoneyRequestReportTransactionItem
│   │
│   ├── updateMoneyRequestAttendees (UpdateMoneyRequest.ts)               [PR 8]
│   │   └── IOURequestStepAttendees.tsx                                   [PR 8] component
│   │
│   ├── updateMoneyRequestTag (UpdateMoneyRequest.ts)                     [PR 8]
│   │   ├── IOURequestStepTag.tsx                                         [PR 8] component
│   │   └── TransactionInlineEdit.ts → editTransactionTagInline           [PR 11] (passes undefined)
│   │       └── useTransactionInlineEdit.ts → TransactionListItem | MoneyRequestReportTransactionItem
│   │
│   ├── updateMoneyRequestTaxAmount (UpdateMoneyRequest.ts)               [PR 8]
│   │   └── IOURequestStepTaxAmountPage.tsx                               [PR 8] component
│   │
│   ├── updateMoneyRequestTaxRate (UpdateMoneyRequest.ts)                 [PR 8]
│   │   ├── IOURequestStepTaxRatePage.tsx                                 [PR 8] component
│   │   └── MoneyRequestView.tsx                                          [PR 8] component
│   │
│   ├── updateMoneyRequestDistance (UpdateMoneyRequest.ts)                 [PR 8]
│   │   ├── IOURequestStepDistance.tsx                                     [PR 8] component
│   │   ├── IOURequestStepDistanceMap.tsx                                  [PR 8] component
│   │   ├── IOURequestStepDistanceManual.tsx                               [PR 8] component
│   │   └── IOURequestStepDistanceOdometer.tsx                             [PR 8] component
│   │
│   ├── updateMoneyRequestDistanceRate (UpdateMoneyRequest.ts)             [PR 8]
│   │   └── IOURequestStepDistanceRate.tsx                                 [PR 8] component
│   │
│   ├── updateMoneyRequestCategory (UpdateMoneyRequest.ts)                 [PR 8]
│   │   ├── IOURequestStepCategory.tsx                                     [PR 8] component
│   │   ├── IOURequestStepCategoryCreate.tsx                               [PR 8] component ← NEW
│   │   └── TransactionInlineEdit.ts → editTransactionCategoryInline       [PR 11] (passes undefined)
│   │       └── useTransactionInlineEdit.ts → TransactionListItem | MoneyRequestReportTransactionItem
│   │
│   ├── updateMoneyRequestDescription (UpdateMoneyRequest.ts)              [PR 8]
│   │   ├── IOURequestStepDescription.tsx                                  [PR 8] component
│   │   └── TransactionInlineEdit.ts → editTransactionDescriptionInline    [PR 11] (passes undefined)
│   │       └── useTransactionInlineEdit.ts → TransactionListItem | MoneyRequestReportTransactionItem
│   │
│   ├── updateMoneyRequestAmountAndCurrency (UpdateMoneyRequest.ts)        [PR 8]
│   │   ├── IOURequestStepAmount.tsx                                       [PR 8] component
│   │   └── TransactionInlineEdit.ts → editTransactionAmountInline         [PR 11] (passes undefined)
│   │       └── useTransactionInlineEdit.ts → TransactionListItem | MoneyRequestReportTransactionItem
│   │
│   ├── getOnyxTargetTransactionData (MergeTransaction.ts)                 [PR 8]
│   │   NOTE: passes shouldBuildOptimisticModifiedExpenseReportAction=false → builder NOT run at runtime
│   │   └── mergeTransactionRequest (MergeTransaction.ts)                  [PR 8]
│   │       └── ConfirmationPage.tsx (TransactionMerge)                    [PR 8] component
│   │
│   └── updateSplitTransactions (IOU/SplitTransactionUpdate.ts)            [PR 11] (passes undefined)
│       ├── updateSplitTransactionsFromSplitExpensesFlow (same file)        [PR 11]
│       │   └── SplitExpensePage.tsx                                        [PR 11] component
│       └── useDeleteTransactions.ts                                        [PR 11] hook
│           ├── PopoverReportActionContextMenu.tsx                          component
│           ├── MoneyRequestHeaderSecondaryActions.tsx                      component
│           ├── useExpenseActions.ts → MoneyReportHeaderSecondaryActions.tsx component
│           ├── ReportDetailsPage.tsx                                       component
│           └── useSelectedTransactionsActions.ts                           hook
│               ├── SelectionToolbar.tsx                                    component
│               └── MoneyReportHeaderSelectionDropdown.tsx                  component
│
├── getUpdateTrackExpenseParams (IOU/UpdateMoneyRequest.ts)                [PR 8]
│   └── Called internally by updateMoneyRequest{Date,Merchant,Description,DistanceRate,AmountAndCurrency}
│       when transaction is a track expense in selfDM (branch inside each wrapper)
│   └── Also called by getOnyxTargetTransactionData (shouldBuild=false, unreported path)
│
└── updateMultipleMoneyRequests (IOU/BulkEdit.ts)                          [PR 8]
    └── SearchEditMultiplePage.tsx                                          [PR 8] component
```

> **Note on TransactionInlineEdit.ts**: This action file uses module-level `Onyx.connect` and
> calls 6 of the 13 wrappers (Date, Merchant, Tag, Category, Description, AmountAndCurrency) via
> individual `editTransaction*Inline` functions. Since it cannot use hooks, it will pass
> `delegateAccountID: undefined`. The real value will be threaded in **PR 11** when this file is
> refactored to accept `delegateAccountID` from its hook-based callers
> (`useTransactionInlineEdit` → `TransactionListItem`, `MoneyRequestReportTransactionItem`).
> Tracked in [https://github.com/Expensify/App/issues/66425](https://github.com/Expensify/App/issues/66425)
>
> **Note on SplitTransactionUpdate.ts**: `updateSplitTransactions` was moved from `IOU/Split.ts` to
> `IOU/SplitTransactionUpdate.ts` (commit `daa3a463868`, 2026-04-28). Same function, new file location.
> Its callers (via `useDeleteTransactions` and `SplitExpensePage`) are deferred to **PR 11**.

---

### 10. `buildOptimisticIOUReportAction` + `buildOptimisticMoneyRequestEntities` — [PR 9] + [PR 10-14]

> ⚠️ NEEDS FALLBACK: callers migrated across PR 9–14
> `buildOptimisticMoneyRequestEntities` is an internal wrapper that always calls `buildOptimisticIOUReportAction` — both get the param in PR 9.

```
buildOptimisticIOUReportAction (ReportUtils.ts)                 [PR 9] (with fallback)
│
├── buildOptimisticMoneyRequestEntities (ReportUtils.ts)        [PR 9] (internal, always calls buildOptimisticIOUReportAction)
│   ├── IOU/index.ts (getMoneyRequestInformation L2460)         [PR 9]
│   │   ├── requestMoney (TrackExpense.ts L1545)                [PR 10]
│   │   │   ├── IOURequestStepConfirmation.tsx L561             [PR 10]
│   │   │   ├── IOURequestStepAmount.tsx L278                   [PR 10]
│   │   │   ├── SubmitDetailsPage.tsx L185                      [PR 10]
│   │   │   ├── MoneyRequest.ts L256                            [PR 10]
│   │   │   ├── Duplicate.ts L637                               [PR 10]
│   │   │   └── handleFileRetry.ts L45                          [PR 10]
│   │   ├── createDistanceRequest (IOU/index.ts L4049)          [PR 10]
│   │   │   ├── IOURequestStepConfirmation.tsx L897             [PR 10]
│   │   │   ├── MoneyRequest.ts L729                            [PR 10]
│   │   │   └── Duplicate.ts L621                               [PR 10]
│   │   ├── convertBulkTrackedExpensesToIOU (TrackExpense L1861)[PR 14]
│   │   │   └── AddUnreportedExpenseFooter.tsx L72              [PR 14]
│   │   └── updateSplitTransactions (Split.ts L1401)            [PR 11]
│   │       ├── useDeleteTransactions.ts L149                   [PR 11]
│   │       │   ├── useSelectedTransactionsActions.ts L112      [PR 11]
│   │       │   ├── MoneyRequestHeaderSecondaryActions.tsx L150 [PR 11]
│   │       │   ├── PopoverReportActionContextMenu.tsx L334     [PR 11]
│   │       │   ├── MoneyReportHeader.tsx L311                  [PR 11]
│   │       │   └── ReportDetailsPage.tsx L316                  [PR 11]
│   │       └── SplitBillDetailsPage.tsx                        [PR 11]
│   │
│   ├── IOU/index.ts (createSplitsAndOnyxData L3904)            [PR 9]
│   │   └── (called by splitBill, splitBillAndOpenReport, startSplitBill [PR 11])
│   │
│   ├── TrackExpense.ts (getTrackExpenseInformation L1087)      [PR 9]
│   │   └── trackExpense (TrackExpense.ts L2227)                [PR 10]
│   │       ├── IOURequestStepConfirmation.tsx L801             [PR 10]
│   │       ├── IOURequestStepAmount.tsx L310                   [PR 10]
│   │       ├── SubmitDetailsPage.tsx L145                      [PR 10]
│   │       ├── MoneyRequest.ts L220, L681                      [PR 10]
│   │       ├── Duplicate.ts L765                               [PR 10]
│   │       └── handleFileRetry.ts L36                          [PR 10]
│   │
│   ├── PerDiem.ts (getPerDiemExpenseInformation L440)          [PR 9]
│   │   └── submitPerDiemExpense (PerDiem.ts L878)              [PR 13]
│   │       ├── IOURequestStepConfirmation.tsx L1173            [PR 13]
│   │       └── Duplicate.ts L634                               [PR 13]
│   │
│   ├── PerDiem.ts (getPerDiemExpenseInformationForSelfDM L720) [PR 9]
│   │   └── (internal to submitPerDiemExpense chain)
│   │
│   ├── SendMoney.ts (getSendMoneyParams L135)                  [PR 9]
│   │   ├── sendMoneyElsewhere (SendMoney.ts L497)              [PR 12]
│   │   │   ├── IOURequestStepConfirmation.tsx L1278            [PR 12]
│   │   │   └── IOURequestStepAmount.tsx L267                   [PR 12]
│   │   └── sendMoneyWithWallet (SendMoney.ts L530)             [PR 12]
│   │       ├── IOURequestStepConfirmation.tsx L1281            [PR 12]
│   │       └── IOURequestStepAmount.tsx L269                   [PR 12]
│   │
│   ├── SendInvoice.ts (getSendInvoiceInformation L674)         [PR 9]
│   │   └── sendInvoice (SendInvoice.ts L722+)                  [PR 12]
│   │       ├── IOURequestStepConfirmation.tsx L1126            [PR 12]
│   │       └── IOURequestStepCompanyInfo.tsx L93               [PR 12]
│   │
│   ├── RejectMoneyRequest.ts (prepareRejectMoneyRequestData L362, L453) [PR 9]
│   │   └── rejectMoneyRequest (RejectMoneyRequest.ts L872)     [PR 13]
│   │       ├── RejectReasonPage.tsx L46                        [PR 13]
│   │       └── Search.ts (rejectMoneyRequestsOnSearch L1143+, rejectMoneyRequestInBulk L1197+) [PR 13]
│   │           └── SearchRejectReasonPage.tsx L54              [PR 13]
│   │
│   └── Split.ts (completeSplitBill L963)                       [PR 11]
│       └── SplitBillDetailsPage.tsx L87                        [PR 11]
│
├── IOU/index.ts (createSplitsAndOnyxData L3595 — direct call)  [PR 9]
│   └── (called by splitBill, splitBillAndOpenReport, startSplitBill, createDistanceRequest-split [PR 11])
│
├── PayMoneyRequest.ts (getPayMoneyRequestParams L205)          [PR 9]
│   ├── payMoneyRequest (PayMoneyRequest.ts L725+)              [PR 12]
│   │   ├── PayActionButton.tsx L154                            [PR 12]
│   │   ├── PayPrimaryAction.tsx L121                           [PR 12]
│   │   ├── MoneyReportHeader.tsx L600                          [PR 12]
│   │   ├── useHoldMenuSubmit.ts L80                            [PR 12]
│   │   └── useSelectionModeReportActions.ts L374               [PR 12]
│   └── payInvoice (PayMoneyRequest.ts L812+)                   [PR 12]
│       ├── PayActionButton.tsx L106                            [PR 12]
│       └── PayPrimaryAction.tsx L121                           [PR 12]
│
├── Split.ts (startSplitBill L423 — direct call)                [PR 11]
│   ├── IOURequestStepConfirmation.tsx L1022                    [PR 11]
│   ├── MoneyRequest.ts L397                                    [PR 11]
│   └── handleFileRetry.ts L27                                  [PR 11]
│
├── IOU/index.ts (buildOnyxDataForTestDriveIOU L1372)           [PR 14]
├── IOU/index.ts (buildOnyxDataForMoneyRequest McTest L1688)    [PR 14]
│
├── Search.ts (setOptimisticDataForTransactionThreadPreview L1659) [PR 15]
│   └── SearchUIUtils.ts L2457                                  [PR 15]
│       └── Search/index.tsx L1129, L1162                       [PR 15]
│
├── MergeTransaction.ts (mergeTransactionRequest L607)          [PR 15]
│   └── ConfirmationPage.tsx (TransactionMerge) L74             [PR 15]
│
├── Report/index.ts (openReport L1424 — legacy repair)          [PR 15] (conditional)
│
└── ReportActionsView.tsx L216 (synthetic IOU action in useMemo) [PR 15]
```

---

### 11. `buildOptimisticReportPreview` — [PR 9] + [PR 10-15]

> ⚠️ NEEDS FALLBACK: callers migrated across PR 9–15

```
buildOptimisticReportPreview (ReportUtils.ts)                   [PR 9] (with fallback)
│
├── IOU/index.ts (getMoneyRequestInformation L2482)             [PR 9]
│   └── (callers: see tree #10 — requestMoney [PR 10], createDistanceRequest [PR 10],
│        convertBulkTrackedExpensesToIOU [PR 14], updateSplitTransactions [PR 11])
│
├── TrackExpense.ts (getTrackExpenseInformation L1108)           [PR 9]
│   └── trackExpense [PR 10]
│
├── PerDiem.ts (getPerDiemExpenseInformation L457)              [PR 9]
│   └── submitPerDiemExpense [PR 13]
│
├── IOU/index.ts (createSplitsAndOnyxData L3938)                [PR 9]
│   └── (callers: splitBill, splitBillAndOpenReport [PR 11])
│
├── SendMoney.ts (getSendMoneyParams L148)                      [PR 9]
│   └── (callers: sendMoneyElsewhere, sendMoneyWithWallet [PR 12])
│
├── SendInvoice.ts (getSendInvoiceInformation L670)             [PR 9]
│   └── sendInvoice [PR 12]
│
├── RejectMoneyRequest.ts (prepareRejectMoneyRequestData L466)  [PR 9]
│   └── rejectMoneyRequest [PR 13]
│
├── Split.ts (completeSplitBill L963)                           [PR 11]
│   └── SplitBillDetailsPage.tsx L87                            [PR 11]
│
├── Hold.ts (getReportFromHoldRequestsOnyxData L724)            [PR 9]
│   └── (used by getPayMoneyRequestParams [PR 9], approveMoneyRequest [PR 4 ✅])
│
└── Report/index.ts (buildOptimisticChangePolicyData L6845)     [PR 15]
    ├── changeReportPolicy (Report/index.ts L7060)              [PR 15]
    │   └── ReportChangeWorkspacePage.tsx L116                  [PR 15]
    └── changeReportPolicyAndInviteSubmitter (Report/index.ts L7104) [PR 15]
        └── ReportChangeWorkspacePage.tsx L102                  [PR 15]
```

---

## PR Breakdown (Pending)

### PR 8: ModifiedExpense

> ⚠️ NEEDS FALLBACK: `buildOptimisticModifiedExpenseReportAction` has callers in PR 11 via Split.ts (`updateSplitTransactions`) and an unmigrated module-level action file (`TransactionInlineEdit.ts`)

**Builder** (ReportUtils.ts):

- `buildOptimisticModifiedExpenseReportAction` (~L7618) — add `delegateAccountIDParam: number | undefined`, use fallback: `delegateAccountIDParam ?? (delegateEmail ? getPersonalDetailByEmail(delegateEmail)?.accountID : undefined)`

**Actions** (IOU/UpdateMoneyRequest.ts):

- `getUpdateMoneyRequestParams` (~L938) — add `delegateAccountID: number | undefined` to `GetUpdateMoneyRequestParamsType`, destructure and pass to builder
- `getUpdateTrackExpenseParams` (~L1509) — add `delegateAccountID: number | undefined` positional param, pass to builder

**Actions** (IOU/BulkEdit.ts):

- `updateMultipleMoneyRequests` (~L85) — add `delegateAccountID: number | undefined` to `UpdateMultipleMoneyRequestsParams`, pass directly to `buildOptimisticModifiedExpenseReportAction`

**Actions** (UpdateMoneyRequest.ts — 13 wrapper functions, all get `delegateAccountID: number | undefined`):

- `updateMoneyRequestDate` (~L79) — pass to `getUpdateMoneyRequestParams` / `getUpdateTrackExpenseParams`
- `updateMoneyRequestBillable` (~L126) — pass to `getUpdateMoneyRequestParams`
- `updateMoneyRequestReimbursable` (~L176) — pass to `getUpdateMoneyRequestParams`
- `updateMoneyRequestMerchant` (~L227) — pass to both
- `updateMoneyRequestAttendees` (~L285) — pass to `getUpdateMoneyRequestParams`
- `updateMoneyRequestTag` (~L354) — pass to `getUpdateMoneyRequestParams`
- `updateMoneyRequestTaxAmount` (~L393) — pass to `getUpdateMoneyRequestParams`
- `updateMoneyRequestTaxRate` (~L458) — pass to `getUpdateMoneyRequestParams`
- `updateMoneyRequestDistance` (~L519) — pass to both
- `updateMoneyRequestCategory` (~L621) — pass to `getUpdateMoneyRequestParams`
- `updateMoneyRequestDescription` (~L676) — pass to both
- `updateMoneyRequestDistanceRate` (~L736) — pass to both
- `updateMoneyRequestAmountAndCurrency` (~L840) — pass to both

**Actions** (src/libs/actions/MergeTransaction.ts):

- `getOnyxTargetTransactionData` (~L211) — add `delegateAccountID: number | undefined`, pass to `getUpdateMoneyRequestParams` / `getUpdateTrackExpenseParams`
- `mergeTransactionRequest` (~L343) — add `delegateAccountID: number | undefined`, pass to `getOnyxTargetTransactionData`

**Components** — add `useDelegateAccountID` hook, pass `delegateAccountID` through:

- `IOURequestStepDate.tsx` → `updateMoneyRequestDate`
- `IOURequestStepMerchant.tsx` → `updateMoneyRequestMerchant`
- `IOURequestStepAttendees.tsx` → `updateMoneyRequestAttendees`
- `IOURequestStepTag.tsx` → `updateMoneyRequestTag`
- `IOURequestStepTaxAmountPage.tsx` → `updateMoneyRequestTaxAmount`
- `IOURequestStepTaxRatePage.tsx` → `updateMoneyRequestTaxRate`
- `IOURequestStepDistance.tsx` → `updateMoneyRequestDistance`
- `IOURequestStepDistanceMap.tsx` → `updateMoneyRequestDistance`
- `IOURequestStepDistanceManual.tsx` → `updateMoneyRequestDistance`
- `IOURequestStepDistanceOdometer.tsx` → `updateMoneyRequestDistance`
- `IOURequestStepDistanceRate.tsx` → `updateMoneyRequestDistanceRate`
- `IOURequestStepCategory.tsx` → `updateMoneyRequestCategory`
- `IOURequestStepDescription.tsx` → `updateMoneyRequestDescription`
- `IOURequestStepAmount.tsx` → `updateMoneyRequestAmountAndCurrency`
- `MoneyRequestView.tsx` → `updateMoneyRequestBillable`, `updateMoneyRequestReimbursable`, `updateMoneyRequestTaxRate`
- `SearchEditMultiplePage.tsx` → `updateMultipleMoneyRequests`
- `ConfirmationPage.tsx` (TransactionMerge) → `mergeTransactionRequest`

**Unmigrated action callers** (pass `delegateAccountID: undefined` with TODO):

- `IOU/Split.ts` (`updateSplitTransactions`) — `// delegateAccountID: will be threaded in PR 11; buildOptimisticModifiedExpenseReportAction falls back to module-level Onyx.connect value (https://github.com/Expensify/App/issues/66425)`
- `TransactionInlineEdit.ts` (`getIouParamsForTransaction` shared return object, spreads into 6 wrappers: Date, Merchant, Tag, Category, Description, AmountAndCurrency) — `// delegateAccountID: will be threaded in a future PR; buildOptimisticModifiedExpenseReportAction falls back to module-level Onyx.connect value (https://github.com/Expensify/App/issues/66425)` — This file uses module-level `Onyx.connect` and cannot use hooks. Its callers (`useTransactionInlineEdit` hook → `TransactionListItem`, `MoneyRequestReportTransactionItem`) will need to thread `delegateAccountID` when this file is refactored.

**Tests**: Update existing test callers with `delegateAccountID: undefined`. Add new tests verifying `delegateAccountID` forwarding through `buildOptimisticModifiedExpenseReportAction` (both `number` and `undefined` cases).

---

### PR 9: IOUReportAction + ReportPreview — IOU helpers (~30-35 lines, no component changes)

> ⚠️ NEEDS FALLBACK for both builders — callers migrated across PR 10–15

**Builders** (ReportUtils.ts):

- `buildOptimisticIOUReportAction` (~L7133) — add `delegateEmailParam: string | undefined`, use fallback
- `buildOptimisticReportPreview` (~L7570) — add `delegateEmailParam: string | undefined`, use fallback
- `buildOptimisticMoneyRequestEntities` (~L8813) — add `delegateEmailParam: string | undefined`, forward to both builders above

**Actions** — add `delegateEmail: string | undefined`, pass to builder/entities, all pass `undefined` for now:

- `IOU/index.ts`:
  - `buildOnyxDataForMoneyRequest` (~L1500) — pass to `buildOptimisticMoneyRequestEntities`
  - `getMoneyRequestInformation` (~L2176) — pass to `buildOnyxDataForMoneyRequest` + `buildOptimisticReportPreview`
  - `getTrackExpenseInformation` (~L950 in IOU/index.ts, defined in TrackExpense.ts ~L1087) — pass to `buildOptimisticMoneyRequestEntities` + `buildOptimisticReportPreview`
  - `createSplitsAndOnyxData` (~L3523) — pass to `buildOptimisticMoneyRequestEntities` + `buildOptimisticIOUReportAction` + `buildOptimisticReportPreview`
  - `buildOnyxDataForTestDriveIOU` (~L1372) — pass `undefined` with TODO → PR 14
- `PayMoneyRequest.ts`:
  - `getPayMoneyRequestParams` (~L205) — pass to `buildOptimisticIOUReportAction`
- `Hold.ts`:
  - `getReportFromHoldRequestsOnyxData` (~L724) — pass to `buildOptimisticReportPreview`
- `RejectMoneyRequest.ts`:
  - `prepareRejectMoneyRequestData` (~L362, ~L453) — pass to `buildOptimisticMoneyRequestEntities` + `buildOptimisticReportPreview`
- `SendMoney.ts`:
  - `getSendMoneyParams` (~L135) — pass to `buildOptimisticMoneyRequestEntities` + `buildOptimisticReportPreview`
- `SendInvoice.ts`:
  - `getSendInvoiceInformation` (~L670) — pass to `buildOptimisticMoneyRequestEntities` + `buildOptimisticReportPreview`
- `PerDiem.ts`:
  - `getPerDiemExpenseInformation` (~L440) — pass to `buildOptimisticMoneyRequestEntities` + `buildOptimisticReportPreview`
  - `getPerDiemExpenseInformationForSelfDM` (~L720) — pass to `buildOptimisticMoneyRequestEntities`
- `Split.ts`:
  - `completeSplitBill` (~L963) — pass to `buildOptimisticMoneyRequestEntities` + `buildOptimisticReportPreview`

**No component changes** — all action-level functions pass `undefined` with TODO comments.

**Tests**: Verify `delegateAccountID` through `getMoneyRequestInformation`.

---

### PR 10: IOU request + track + distance (~15-20 lines)

**Actions** — add `delegateEmail: string | undefined`, pass to internal helpers:

- `TrackExpense.ts`:
  - `requestMoney` (~L1545) — pass to `getMoneyRequestInformation`
  - `trackExpense` (~L2227) — pass to `getTrackExpenseInformation`
- `IOU/index.ts`:
  - `createDistanceRequest` (~L4049) — pass to `getMoneyRequestInformation` / `createSplitsAndOnyxData`

**Other action callers** — add `delegateEmail: string | undefined`:

- `MoneyRequest.ts` L256, L220, L681, L729 — calls `requestMoney` / `trackExpense` / `createDistanceRequest`
- `Duplicate.ts` L637, L765, L621 — calls `requestMoney` / `trackExpense` / `createDistanceRequest`
- `handleFileRetry.ts` L45, L36 — calls `requestMoney` / `trackExpense`

**Components** — add `useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector})`, pass through:

- `IOURequestStepConfirmation.tsx` L561, L801, L897 (already has useOnyx from PR 6 ✅)
- `IOURequestStepAmount.tsx` L278, L310 — add useOnyx, pass to `requestMoney` / `trackExpense`
- `SubmitDetailsPage.tsx` L185, L145 — add useOnyx, pass to `requestMoney` / `trackExpense`

**Tests**: Verify `delegateAccountID` for `requestMoney` and `trackExpense`.

---

### PR 11: IOU split flows (~15-20 lines)

**Actions** — add `delegateEmail: string | undefined`, pass to internal helpers:

- `Split.ts`:
  - `startSplitBill` (~L372) — pass to `buildOptimisticIOUReportAction` + `createSplitsAndOnyxData`
  - `splitBill` (~L181) — pass to `createSplitsAndOnyxData`
  - `splitBillAndOpenReport` (~L276) — pass to `createSplitsAndOnyxData`
  - `completeSplitBill` (~L755) — pass to `buildOptimisticMoneyRequestEntities` + `buildOptimisticReportPreview`
  - `updateSplitTransactions` (~L1060) — pass to `getUpdateMoneyRequestParams` + `buildOptimisticAddCommentReportAction`

**Hooks/Utilities** — add `delegateEmail: string | undefined`:

- `useDeleteTransactions.ts` L149 — pass to `updateSplitTransactions`

**Components** — add `useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector})`, pass through:

- `IOURequestStepConfirmation.tsx` L1022, L1054, L1090 — `startSplitBill`, `splitBill`, `splitBillAndOpenReport` (already has useOnyx ✅)
- `SplitBillDetailsPage.tsx` L87 — `completeSplitBill`, add useOnyx
- `MoneyRequest.ts` L397 — `startSplitBill`
- `handleFileRetry.ts` L27 — `startSplitBill`
- `useSelectedTransactionsActions.ts` L112 — uses `useDeleteTransactions`
- `MoneyRequestHeaderSecondaryActions.tsx` L150 — uses `useDeleteTransactions`
- `PopoverReportActionContextMenu.tsx` L334 — uses `useDeleteTransactions`
- `MoneyReportHeader.tsx` L311 — uses `useDeleteTransactions`
- `ReportDetailsPage.tsx` L316 — uses `useDeleteTransactions`

**Tests**: Verify `delegateAccountID` for `splitBill`.

---

### PR 12: IOU pay + send + invoice (~15-20 lines)

**Actions** — add `delegateEmail: string | undefined`, pass to internal helpers:

- `PayMoneyRequest.ts`:
  - `payMoneyRequest` (~L725) — pass to `getPayMoneyRequestParams`
  - `payInvoice` (~L812) — pass to `getPayMoneyRequestParams`
- `SendMoney.ts`:
  - `sendMoneyElsewhere` (~L497) — pass to `getSendMoneyParams`
  - `sendMoneyWithWallet` (~L530) — pass to `getSendMoneyParams`
- `SendInvoice.ts`:
  - `sendInvoice` (~L722) — pass to `getSendInvoiceInformation`

**Components** — add `useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector})`, pass through:

- `PayActionButton.tsx` L154, L106 — `payMoneyRequest`, `payInvoice`
- `PayPrimaryAction.tsx` L121 — `payMoneyRequest`, `payInvoice`
- `MoneyReportHeader.tsx` L600 — `payMoneyRequest` (already has useOnyx from PR 3 ✅)
- `useHoldMenuSubmit.ts` L80 — `payMoneyRequest`
- `useSelectionModeReportActions.ts` L374 — `payMoneyRequest`
- `IOURequestStepConfirmation.tsx` L1278, L1281, L1126 — `sendMoneyElsewhere`, `sendMoneyWithWallet`, `sendInvoice` (already has useOnyx ✅)
- `IOURequestStepAmount.tsx` L267, L269 — `sendMoneyElsewhere`, `sendMoneyWithWallet` (already has useOnyx from PR 10 ✅)
- `IOURequestStepCompanyInfo.tsx` L93 — `sendInvoice`, add useOnyx

**Tests**: Verify `delegateAccountID` for `payMoneyRequest`.

---

### PR 13: IOU reject + per diem (~10-15 lines)

**Actions** — add `delegateEmail: string | undefined`, pass to internal helpers:

- `RejectMoneyRequest.ts`:
  - `rejectMoneyRequest` (~L872) — pass to `prepareRejectMoneyRequestData`
- `PerDiem.ts`:
  - `submitPerDiemExpense` (~L878) — pass to `getPerDiemExpenseInformation`
- `Search.ts`:
  - `rejectMoneyRequestsOnSearch` (~L1143) — pass to `rejectMoneyRequest`
  - `rejectMoneyRequestInBulk` (~L1197) — pass to `rejectMoneyRequest`

**Components** — add `useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector})`, pass through:

- `RejectReasonPage.tsx` L46 — `rejectMoneyRequest`, add useOnyx
- `SearchRejectReasonPage.tsx` L54 — `rejectMoneyRequestsOnSearch`, add useOnyx
- `IOURequestStepConfirmation.tsx` L1173 — `submitPerDiemExpense` (already has useOnyx ✅)

**Tests**: Verify `delegateAccountID` for `rejectMoneyRequest`.

---

### PR 14: prepareOnboardingOnyxData + task comment + test drive + createWorkspace (~20-25 lines)

Thread `delegateEmail` through the remaining internal ReportUtils callers and onboarding/workspace creation chains.

**ReportUtils.ts internal functions** — add `delegateEmailParam: string | undefined`:

- `buildOptimisticTaskCommentReportAction` (~L6534) — pass to `buildOptimisticAddCommentReportAction`
- `getTaskAssigneeChatOnyxData` (~L10439) — pass to `buildOptimisticTaskCommentReportAction`
- `prepareOnboardingOnyxData` (~L11741) — pass to `buildOptimisticAddCommentReportAction` + `buildOptimisticTaskReportAction` + `buildOptimisticTaskCommentReportAction`

**Actions** — add `delegateEmail: string | undefined`:

- `Task.ts`:
  - `createTaskAndNavigate` (~L140) — pass to `buildOptimisticTaskCommentReportAction` + `getTaskAssigneeChatOnyxData`
  - `editTaskAssignee` (~L241) — pass to `getTaskAssigneeChatOnyxData`
- `Report/index.ts`:
  - `getGuidedSetupDataForOpenReport` (~L1223) — pass to `prepareOnboardingOnyxData`
  - `completeOnboarding` (~L5068) — pass to `prepareOnboardingOnyxData`
- `Policy/Policy.ts`:
  - `buildPolicyData` (~L2895) — pass to `prepareOnboardingOnyxData`
  - `createWorkspace` — pass to `buildPolicyData`
- `IOU/index.ts`:
  - `buildOnyxDataForTestDriveIOU` (~L1372) — pass to `buildOptimisticIOUReportAction` (direct call, currently `undefined`)
  - test drive `buildPolicyData` call — pass to `buildPolicyData`
- `IOU/TrackExpense.ts`:
  - `convertBulkTrackedExpensesToIOU` (~L1861) — pass to `prepareOnboardingOnyxData` + `getMoneyRequestInformation`

**Components** — add `useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector})`, pass through:

- `BaseOnboardingPurpose.tsx` — `completeOnboarding`
- `BaseOnboardingWorkspaces.tsx` — `completeOnboarding`
- `BaseOnboardingWorkspaceInvite.tsx` — `completeOnboarding`
- `BaseOnboardingPersonalDetails.tsx` — `completeOnboarding`
- `BaseOnboardingWorkspaceOptional.tsx` — `completeOnboarding` + `createWorkspace`
- `BaseOnboardingInterestedFeatures.tsx` — `completeOnboarding` + `createWorkspace`
- `BaseOnboardingWorkspaceConfirmation.tsx` — `createWorkspace`
- `useAutoCreateTrackWorkspace.ts` — `completeOnboarding` + `createWorkspace`
- `SettlementButton/index.tsx` — `createWorkspace` (already has useOnyx ✅)
- `IOURequestStepUpgrade.tsx` — `createWorkspace`
- `WorkspaceConfirmationForTravelPage.tsx` — `createWorkspace`
- `AddUnreportedExpenseFooter.tsx` L72 — `convertBulkTrackedExpensesToIOU`
- `App.ts` — `createWorkspace` (server flow — may stay `undefined`)

**Tests**: Verify `delegateAccountID` for `prepareOnboardingOnyxData`.

---

### PR 15: Remaining callers (~15-20 lines)

Thread `delegateEmail` through remaining callers that still pass `undefined`:

**Actions** — add `delegateEmail: string | undefined`:

- `Workflow.ts` (`createApprovalWorkflow`) — pass to `completeTask`
- `Policy/Tag.ts` (2 callers of `getFinishOnboardingTaskOnyxData`)
- `Policy/Category.ts` (1 caller of `getFinishOnboardingTaskOnyxData`)
- `Report/index.ts`:
  - `openReport` (~L1424) — pass to `buildOptimisticIOUReportAction` (legacy repair, conditional)
  - `buildOptimisticChangePolicyData` (~L6577) — pass to `buildOptimisticReportPreview`
  - `changeReportPolicy` (~L7060) — pass to `buildOptimisticChangePolicyData`
  - `changeReportPolicyAndInviteSubmitter` (~L7104) — pass to `buildOptimisticChangePolicyData`
- `Search.ts` (`setOptimisticDataForTransactionThreadPreview` ~L1641) — pass to `buildOptimisticIOUReportAction`
- `MergeTransaction.ts` (`mergeTransactionRequest` ~L607) — pass direct `buildOptimisticIOUReportAction` call

**Components** — add `useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector})`, pass through:

- `ReportChangeWorkspacePage.tsx` L102, L116 — `changeReportPolicyAndInviteSubmitter`, `changeReportPolicy`
- `Search/index.tsx` L1129, L1162 — `setOptimisticDataForTransactionThreadPreview`
- `ReportActionsView.tsx` L216 — direct `buildOptimisticIOUReportAction` (synthetic IOU action)

**Tests**: Update any remaining test callers.

---

### PR 16 (Final): Remove Onyx.connect() (~5 lines)

- Remove `Onyx.connect()` for `ONYXKEYS.ACCOUNT` in `ReportUtils.ts`
- Remove the module-level `delegateEmail` variable
- Convert all `effectiveDelegateEmail = delegateEmailParam ?? delegateEmail` fallbacks back to direct `delegateEmailParam` usage
- Remove all `// Falls back to module-level delegateEmail...` comments
- Remove all remaining `// Will be refactored in PR ...` comments
- Make `delegateEmailParam` non-optional where appropriate

---

## Fresh Call Tree for `buildOptimisticModifiedExpenseReportAction` (traced on main, May 2026)

```
Level 0: buildOptimisticModifiedExpenseReportAction (src/libs/ReportUtils.ts)
│
├── Level 1: getUpdateMoneyRequestParams (src/libs/actions/IOU/UpdateMoneyRequest.ts) [ACTION]
│   │
│   ├── Level 2: updateMoneyRequestDate (UpdateMoneyRequest.ts) [ACTION] — calls BOTH getUpdateTrackExpenseParams & getUpdateMoneyRequestParams
│   │   ├── Level 3: IOURequestStepDate (src/pages/iou/request/step/IOURequestStepDate.tsx) [COMPONENT]
│   │   └── Level 3: editTransactionDateInline (src/libs/actions/TransactionInlineEdit.ts) [ACTION]
│   │       └── Level 4: useTransactionInlineEdit (src/hooks/useTransactionInlineEdit.ts) [HOOK]
│   │           ├── Level 5: TransactionListItem (src/components/Search/SearchList/ListItem/TransactionListItem/index.tsx) [COMPONENT]
│   │           └── Level 5: MoneyRequestReportTransactionItem (src/components/MoneyRequestReportView/MoneyRequestReportTransactionItem.tsx) [COMPONENT]
│   │
│   ├── Level 2: updateMoneyRequestMerchant (UpdateMoneyRequest.ts) [ACTION] — calls BOTH
│   │   ├── Level 3: IOURequestStepMerchant (src/pages/iou/request/step/IOURequestStepMerchant.tsx) [COMPONENT]
│   │   └── Level 3: editTransactionMerchantInline (TransactionInlineEdit.ts) [ACTION]
│   │       └── Level 4: useTransactionInlineEdit [HOOK] → TransactionListItem | MoneyRequestReportTransactionItem [COMPONENT]
│   │
│   ├── Level 2: updateMoneyRequestBillable (UpdateMoneyRequest.ts) [ACTION] — getUpdateMoneyRequestParams only
│   │   └── Level 3: MoneyRequestView (src/components/ReportActionItem/MoneyRequestView.tsx) [COMPONENT]
│   │
│   ├── Level 2: updateMoneyRequestReimbursable (UpdateMoneyRequest.ts) [ACTION] — getUpdateMoneyRequestParams only
│   │   └── Level 3: MoneyRequestView [COMPONENT]
│   │
│   ├── Level 2: updateMoneyRequestAttendees (UpdateMoneyRequest.ts) [ACTION] — getUpdateMoneyRequestParams only
│   │   └── Level 3: IOURequestStepAttendees (src/pages/iou/request/step/IOURequestStepAttendees.tsx) [COMPONENT]
│   │
│   ├── Level 2: updateMoneyRequestTag (UpdateMoneyRequest.ts) [ACTION] — getUpdateMoneyRequestParams only
│   │   ├── Level 3: IOURequestStepTag (src/pages/iou/request/step/IOURequestStepTag.tsx) [COMPONENT]
│   │   └── Level 3: editTransactionTagInline (TransactionInlineEdit.ts) [ACTION]
│   │       └── Level 4: useTransactionInlineEdit [HOOK] → TransactionListItem | MoneyRequestReportTransactionItem [COMPONENT]
│   │
│   ├── Level 2: updateMoneyRequestTaxAmount (UpdateMoneyRequest.ts) [ACTION] — getUpdateMoneyRequestParams only
│   │   └── Level 3: IOURequestStepTaxAmountPage (src/pages/iou/request/step/IOURequestStepTaxAmountPage.tsx) [COMPONENT]
│   │
│   ├── Level 2: updateMoneyRequestTaxRate (UpdateMoneyRequest.ts) [ACTION] — getUpdateMoneyRequestParams only
│   │   ├── Level 3: IOURequestStepTaxRatePage (src/pages/iou/request/step/IOURequestStepTaxRatePage.tsx) [COMPONENT]
│   │   └── Level 3: MoneyRequestView [COMPONENT]
│   │
│   ├── Level 2: updateMoneyRequestDistance (UpdateMoneyRequest.ts) [ACTION] — calls BOTH
│   │   ├── Level 3: IOURequestStepDistance (src/pages/iou/request/step/IOURequestStepDistance.tsx) [COMPONENT]
│   │   ├── Level 3: IOURequestStepDistanceMap (src/pages/iou/request/step/IOURequestStepDistanceMap.tsx) [COMPONENT]
│   │   ├── Level 3: IOURequestStepDistanceManual (src/pages/iou/request/step/IOURequestStepDistanceManual.tsx) [COMPONENT]
│   │   └── Level 3: IOURequestStepDistanceOdometer (src/pages/iou/request/step/IOURequestStepDistanceOdometer.tsx) [COMPONENT]
│   │
│   ├── Level 2: updateMoneyRequestCategory (UpdateMoneyRequest.ts) [ACTION] — getUpdateMoneyRequestParams only
│   │   ├── Level 3: IOURequestStepCategory (src/pages/iou/request/step/IOURequestStepCategory.tsx) [COMPONENT]
│   │   ├── Level 3: IOURequestStepCategoryCreate (src/pages/iou/request/step/IOURequestStepCategoryCreate.tsx) [COMPONENT]
│   │   └── Level 3: editTransactionCategoryInline (TransactionInlineEdit.ts) [ACTION]
│   │       └── Level 4: useTransactionInlineEdit [HOOK] → TransactionListItem | MoneyRequestReportTransactionItem [COMPONENT]
│   │
│   ├── Level 2: updateMoneyRequestDescription (UpdateMoneyRequest.ts) [ACTION] — calls BOTH
│   │   ├── Level 3: IOURequestStepDescription (src/pages/iou/request/step/IOURequestStepDescription.tsx) [COMPONENT]
│   │   └── Level 3: editTransactionDescriptionInline (TransactionInlineEdit.ts) [ACTION]
│   │       └── Level 4: useTransactionInlineEdit [HOOK] → TransactionListItem | MoneyRequestReportTransactionItem [COMPONENT]
│   │
│   ├── Level 2: updateMoneyRequestDistanceRate (UpdateMoneyRequest.ts) [ACTION] — calls BOTH
│   │   └── Level 3: IOURequestStepDistanceRate (src/pages/iou/request/step/IOURequestStepDistanceRate.tsx) [COMPONENT]
│   │
│   ├── Level 2: updateMoneyRequestAmountAndCurrency (UpdateMoneyRequest.ts) [ACTION] — calls BOTH
│   │   ├── Level 3: IOURequestStepAmount (src/pages/iou/request/step/IOURequestStepAmount.tsx) [COMPONENT]
│   │   └── Level 3: editTransactionAmountInline (TransactionInlineEdit.ts) [ACTION]
│   │       └── Level 4: useTransactionInlineEdit [HOOK] → TransactionListItem | MoneyRequestReportTransactionItem [COMPONENT]
│   │
│   ├── Level 2: updateSplitTransactions (src/libs/actions/IOU/SplitTransactionUpdate.ts) [ACTION]
│   │   ├── Level 3: updateSplitTransactionsFromSplitExpensesFlow (SplitTransactionUpdate.ts) [ACTION]
│   │   │   └── Level 4: SplitExpensePage (src/pages/iou/SplitExpensePage.tsx) [COMPONENT]
│   │   └── Level 3: useDeleteTransactions (src/hooks/useDeleteTransactions.ts) [HOOK]
│   │       ├── Level 4: ReportDetailsPage (src/pages/ReportDetailsPage.tsx) [COMPONENT]
│   │       ├── Level 4: MoneyRequestHeaderSecondaryActions (src/components/MoneyRequestHeaderSecondaryActions.tsx) [COMPONENT]
│   │       ├── Level 4: PopoverReportActionContextMenu (src/pages/inbox/report/ContextMenu/PopoverReportActionContextMenu.tsx) [COMPONENT]
│   │       ├── Level 4: useExpenseActions (src/hooks/useExpenseActions.ts) [HOOK]
│   │       │   └── Level 5: MoneyReportHeaderSecondaryActions (src/components/MoneyReportHeaderActions/MoneyReportHeaderSecondaryActions.tsx) [COMPONENT]
│   │       └── Level 4: useSelectedTransactionsActions (src/hooks/useSelectedTransactionsActions.ts) [HOOK]
│   │           ├── Level 5: SelectionToolbar (src/components/MoneyRequestReportView/SelectionToolbar.tsx) [COMPONENT]
│   │           └── Level 5: MoneyReportHeaderSelectionDropdown (src/components/MoneyReportHeaderActions/MoneyReportHeaderSelectionDropdown.tsx) [COMPONENT]
│   │
│   └── Level 2: getOnyxTargetTransactionData (src/libs/actions/MergeTransaction.ts) [ACTION]
│       NOTE: calls getUpdateMoneyRequestParams with shouldBuildOptimisticModifiedExpenseReportAction: false
│       └── Level 3: mergeTransactionRequest (MergeTransaction.ts) [ACTION]
│           └── Level 4: ConfirmationPage (src/pages/TransactionMerge/ConfirmationPage.tsx) [COMPONENT]
│
├── Level 1: getUpdateTrackExpenseParams (src/libs/actions/IOU/UpdateMoneyRequest.ts) [ACTION]
│   └── (called by the same wrappers listed above that have "calls BOTH" — if-branch for track expenses)
│
└── Level 1: updateMultipleMoneyRequests (src/libs/actions/IOU/BulkEdit.ts) [ACTION]
    └── Level 2: SearchEditMultiplePage (src/pages/Search/SearchEditMultiple/SearchEditMultiplePage.tsx) [COMPONENT]
```

### Summary

| Category | Count | Details |
|----------|------:|---------|
| **Level 0 builder** | 1 | `buildOptimisticModifiedExpenseReportAction` in ReportUtils.ts |
| **Level 1 direct callers** | 3 | `getUpdateMoneyRequestParams`, `getUpdateTrackExpenseParams`, `updateMultipleMoneyRequests` |
| **Level 2 wrapper functions** | 13 | All `updateMoneyRequest*` in UpdateMoneyRequest.ts |
| **Level 2 action callers** | 3 | `updateSplitTransactions`, `getOnyxTargetTransactionData`, `mergeTransactionRequest` |
| **Action files (TransactionInlineEdit)** | 6 | `editTransaction{Date,Merchant,Tag,Category,Description,Amount}Inline` |
| **Hooks** | 4 | `useTransactionInlineEdit`, `useDeleteTransactions`, `useExpenseActions`, `useSelectedTransactionsActions` |
| **Unique component files** | 27 | See list below |

### All 27 unique component files:

**Direct callers of `updateMoneyRequest*` (18 — need useDelegateAccountID hook):**
1. `src/pages/iou/request/step/IOURequestStepDate.tsx`
2. `src/pages/iou/request/step/IOURequestStepMerchant.tsx`
3. `src/pages/iou/request/step/IOURequestStepAttendees.tsx`
4. `src/pages/iou/request/step/IOURequestStepTag.tsx`
5. `src/pages/iou/request/step/IOURequestStepTaxAmountPage.tsx`
6. `src/pages/iou/request/step/IOURequestStepTaxRatePage.tsx`
7. `src/pages/iou/request/step/IOURequestStepDistance.tsx`
8. `src/pages/iou/request/step/IOURequestStepDistanceMap.tsx`
9. `src/pages/iou/request/step/IOURequestStepDistanceManual.tsx`
10. `src/pages/iou/request/step/IOURequestStepDistanceOdometer.tsx`
11. `src/pages/iou/request/step/IOURequestStepCategory.tsx`
12. `src/pages/iou/request/step/IOURequestStepCategoryCreate.tsx`
13. `src/pages/iou/request/step/IOURequestStepDescription.tsx`
14. `src/pages/iou/request/step/IOURequestStepDistanceRate.tsx`
15. `src/pages/iou/request/step/IOURequestStepAmount.tsx`
16. `src/components/ReportActionItem/MoneyRequestView.tsx`
17. `src/pages/Search/SearchEditMultiple/SearchEditMultiplePage.tsx`
18. `src/pages/TransactionMerge/ConfirmationPage.tsx`

**Indirect callers via hooks — do NOT need changes in PR 8 (future PR 11):**
19. `src/components/Search/SearchList/ListItem/TransactionListItem/index.tsx` (via useTransactionInlineEdit)
20. `src/components/MoneyRequestReportView/MoneyRequestReportTransactionItem.tsx` (via useTransactionInlineEdit)
21. `src/pages/iou/SplitExpensePage.tsx` (via updateSplitTransactionsFromSplitExpensesFlow)
22. `src/pages/ReportDetailsPage.tsx` (via useDeleteTransactions)
23. `src/components/MoneyRequestHeaderSecondaryActions.tsx` (via useDeleteTransactions)
24. `src/pages/inbox/report/ContextMenu/PopoverReportActionContextMenu.tsx` (via useDeleteTransactions)
25. `src/components/MoneyReportHeaderActions/MoneyReportHeaderSecondaryActions.tsx` (via useExpenseActions → useDeleteTransactions)
26. `src/components/MoneyRequestReportView/SelectionToolbar.tsx` (via useSelectedTransactionsActions → useDeleteTransactions)
27. `src/components/MoneyReportHeaderActions/MoneyReportHeaderSelectionDropdown.tsx` (via useSelectedTransactionsActions → useDeleteTransactions)

---

## Proposed PR 8 Breakdown

Given the size of the full tree (6 action files, 13 wrappers, 18 direct component callers, 4 hooks, 9 indirect components), we split PR 8 into two sub-PRs:

### PR 8a: Builder + action chain + hook + tests (NO component changes)

**Scope:** Thread `delegateAccountID` through the entire action/helper chain. All component callers continue to rely on the builder's fallback (`delegateAccountIDParam ?? (delegateEmail ? getPersonalDetailByEmail(delegateEmail)?.accountID : undefined)`).

**Files changed:**
1. `src/hooks/useDelegateAccountID.ts` — NEW FILE (with targeted `useOnyx` selector)
2. `src/libs/ReportUtils.ts` — builder gets `delegateAccountIDParam: number | undefined` + fallback
3. `src/libs/actions/IOU/UpdateMoneyRequest.ts` — type + `getUpdateMoneyRequestParams` + `getUpdateTrackExpenseParams` + all 13 wrappers
4. `src/libs/actions/IOU/BulkEdit.ts` — `updateMultipleMoneyRequests`
5. `src/libs/actions/MergeTransaction.ts` — `getOnyxTargetTransactionData` + `mergeTransactionRequest`
6. `src/libs/actions/IOU/SplitTransactionUpdate.ts` — pass `delegateAccountID: undefined` with TODO (PR 11)
7. `src/libs/actions/TransactionInlineEdit.ts` — 6 inline edit functions pass `delegateAccountID: undefined` with TODO (PR 11)
8. Test files — update all existing calls + add `buildOptimisticModifiedExpenseReportAction` tests

### PR 8b: Component callers use the hook

**Scope:** All 18 direct component callers get `useDelegateAccountID` and pass the real value.

**Files changed:**
1-15. All `IOURequestStep*.tsx` files (15 files)
16. `src/components/ReportActionItem/MoneyRequestView.tsx`
17. `src/pages/Search/SearchEditMultiple/SearchEditMultiplePage.tsx`
18. `src/pages/TransactionMerge/ConfirmationPage.tsx`

**After PR 8b merges**, the fallback in `buildOptimisticModifiedExpenseReportAction` still stays because `SplitTransactionUpdate.ts` and `TransactionInlineEdit.ts` still pass `undefined` (deferred to PR 11).

---

