---
name: delegateAccountID migration v3
overview: Fresh, streamlined plan to complete the delegateEmail-to-delegateAccountID migration in ReportUtils.ts, organized into small, focused PRs (each under 50 lines of actual code change).
todos:
  - id: pr-8
    content: "PR 8 (merged 8+8b+8c+8d): buildOptimisticModifiedExpenseReportAction builder + core helpers + 13 wrappers + 18 component callers + tests"
    status: completed
  - id: pr-9
    content: "PR 9: buildOptimisticIOUReportAction + buildOptimisticReportPreview builders + all action file helpers (~38 lines)"
    status: pending
  - id: pr-10
    content: "PR 10: IOU request/track/distance action layer + intermediaries + hooks (~38 lines)"
    status: pending
  - id: pr-10b
    content: "PR 10b: IOU request/track/distance component callers - 16 files (~48 lines)"
    status: pending
  - id: pr-11
    content: "PR 11: Split + SplitTransactionUpdate + TransactionInlineEdit action layer (~20 lines)"
    status: pending
  - id: pr-11b
    content: "PR 11b: Split flows hooks + component callers (~40 lines)"
    status: pending
  - id: pr-12
    content: "PR 12: Pay + send + invoice action layer + hooks (~20 lines)"
    status: pending
  - id: pr-12b
    content: "PR 12b: Pay + send + invoice component callers - 14 files (~42 lines)"
    status: pending
  - id: pr-13
    content: "PR 13: Reject + perDiem + hold actions + components (~39 lines)"
    status: pending
  - id: pr-14
    content: "PR 14: Onboarding + test drive + ReportUtils internal callers (~42 lines)"
    status: pending
  - id: pr-15
    content: "PR 15: Remaining callers - Policy, Workflow, Report, Search (~37 lines)"
    status: pending
  - id: pr-16
    content: "PR 16: Remove Onyx.connect() + final cleanup (~18 lines)"
    status: pending
isProject: false
---

# delegateAccountID Migration Plan (v3 - Fresh Start)

## Goal

Remove the deprecated `Onyx.connect()` for `ONYXKEYS.ACCOUNT` in [src/libs/ReportUtils.ts](src/libs/ReportUtils.ts) by threading `delegateAccountID` through all `buildOptimistic*` functions and their callers.

**Reference issue**: https://github.com/Expensify/App/issues/66425

---

## Current State

### What's Done (PRs 1-7 - all MERGED)

| PR | Builder | Status |
|----|---------|--------|
| 1 | `buildOptimisticEditedTaskFieldReportAction` | Merged |
| 2 | `buildOptimisticChangedTaskAssigneeReportAction` | Merged |
| 3 | `buildOptimisticSubmittedReportAction`, `buildOptimisticUnapprovedReportAction`, `buildOptimisticRetractedReportAction` | Merged |
| 4 | `buildOptimisticApprovedReportAction` | Merged |
| 5 | `buildOptimisticTaskReportAction` (with fallback - some callers deferred) | Merged |
| 6 | Task secondary callers (`getFinishOnboardingTaskOnyxData`, `completeTestDriveTask`) | Merged |
| 7 | `buildOptimisticAddCommentReportAction` (with fallback - some callers deferred) | Merged |

### What's Left (3 unmigrated builders)

These still read the **raw module-level** `delegateEmail` with no param at all:

1. **`buildOptimisticModifiedExpenseReportAction`** (~line 7572) - used by UpdateMoneyRequest + BulkEdit
2. **`buildOptimisticIOUReportAction`** (~line 7045) - used by many IOU action files
3. **`buildOptimisticReportPreview`** (~line 7480) - used by many IOU action files (heavy overlap with #2)

Plus cleanup of deferred `undefined` callers from PRs 5 and 7.

### Existing Infrastructure

- [src/hooks/useDelegateAccountID.ts](src/hooks/useDelegateAccountID.ts) - hook with targeted `useOnyx` selector (created in PR 7)
- `delegateEmailSelector` in `src/selectors/Account.ts`

---

## Rules (carry forward from v2)

1. Parameter type: `delegateAccountID: number | undefined` (never optional `?`)
2. Components: use `useDelegateAccountID()` hook
3. Fallback: when builder has unmigrated callers, use `delegateAccountIDParam ?? (delegateEmail ? getPersonalDetailByEmail(delegateEmail)?.accountID : undefined)`
4. TODO format: `// delegateAccountID: will be threaded in PR <N>; <builderFunctionName> falls back to module-level Onyx.connect value (https://github.com/Expensify/App/issues/66425)`
5. Dylan's feedback: avoid large PRs; think about cleaner optimization, remove dead code, increase unit test coverage; use selectors for narrow subscriptions
6. Post-edit: always run `prettier`, `eslint`, `typecheck-tsgo`

---

## PR Breakdown

---

**PR 8 (merged 8+8b+8c+8d): `buildOptimisticModifiedExpenseReportAction` -- full chain** **[COMPLETED]**

NEEDS FALLBACK: callers in SplitTransactionUpdate + TransactionInlineEdit pass `undefined` (deferred to PR 11).

Merges original PR 8 (builder + core helpers), PR 8b (13 wrappers), PR 8c (component callers), and PR 8d (remaining component callers) into a single PR.

All types use `delegateAccountID: number | undefined` (required). All 18 component callers pass `delegateAccountID` via `useDelegateAccountID()`. Action callers (SplitTransactionUpdate, TransactionInlineEdit) pass `undefined` with TODO for PR 11.

---

**PR 9: `buildOptimisticIOUReportAction` + `buildOptimisticReportPreview` -- builders + all action file helpers** (~38 lines + tests)

NEEDS FALLBACK for both builders -- callers migrated across PRs 10-15.

```
ReportUtils.ts -- add delegateAccountIDParam: number | undefined:
├── buildOptimisticIOUReportAction (L7045) -- fallback to delegateEmail via getPersonalDetailByEmail
├── buildOptimisticReportPreview (L7480) -- fallback to delegateEmail via getPersonalDetailByEmail
└── buildOptimisticMoneyRequestEntities (L8788) -- internal wrapper, forward to both builders above

IOU/MoneyRequestBuilder.ts -- add delegateAccountID: number | undefined:
├── buildOnyxDataForMoneyRequest -- forward to buildOptimisticMoneyRequestEntities + buildOptimisticIOUReportAction
├── getMoneyRequestInformation -- forward to buildOnyxDataForMoneyRequest + buildOptimisticReportPreview
└── buildOnyxDataForTestDriveIOU -- undefined -> PR 14; buildOptimisticIOUReportAction falls back (https://github.com/Expensify/App/issues/66425)

IOU/TrackExpense.ts -- add delegateAccountID: number | undefined:
└── getTrackExpenseInformation -- forward to buildOptimisticMoneyRequestEntities + buildOptimisticReportPreview

IOU/Split.ts -- add delegateAccountID: number | undefined:
├── createSplitsAndOnyxData -- forward to buildOptimisticMoneyRequestEntities + buildOptimisticIOUReportAction + buildOptimisticReportPreview
├── completeSplitBill -- undefined -> PR 11; both builders fall back (https://github.com/Expensify/App/issues/66425)
└── startSplitBill -- undefined -> PR 11; buildOptimisticIOUReportAction falls back (https://github.com/Expensify/App/issues/66425)

IOU/PayMoneyRequest.ts -- add delegateAccountID: number | undefined:
└── getPayMoneyRequestParams -- forward to buildOptimisticIOUReportAction

IOU/SendMoney.ts -- add delegateAccountID: number | undefined:
└── getSendMoneyParams -- forward to buildOptimisticMoneyRequestEntities + buildOptimisticReportPreview

IOU/SendInvoice.ts -- add delegateAccountID: number | undefined:
└── getSendInvoiceInformation -- forward to buildOptimisticMoneyRequestEntities + buildOptimisticReportPreview

IOU/PerDiem.ts -- add delegateAccountID: number | undefined:
├── getPerDiemExpenseInformation -- forward to buildOptimisticMoneyRequestEntities + buildOptimisticReportPreview + buildOnyxDataForMoneyRequest
└── getPerDiemExpenseInformationForSelfDM -- forward to buildOptimisticMoneyRequestEntities

IOU/RejectMoneyRequest.ts -- add delegateAccountID: number | undefined:
└── prepareRejectMoneyRequestData -- forward to buildOptimisticMoneyRequestEntities + buildOptimisticReportPreview (2 call sites)

IOU/Hold.ts -- add delegateAccountID: number | undefined:
└── getReportFromHoldRequestsOnyxData -- forward to buildOptimisticReportPreview

Report/index.ts -- undefined + TODO:
├── openReport (legacy branch) -- undefined -> PR 15; buildOptimisticIOUReportAction falls back (https://github.com/Expensify/App/issues/66425)
└── buildOptimisticChangePolicyData -- undefined -> PR 15; buildOptimisticReportPreview falls back (https://github.com/Expensify/App/issues/66425)

Search.ts -- undefined + TODO:
└── setOptimisticDataForTransactionThreadPreview -- undefined -> PR 15; buildOptimisticIOUReportAction falls back (https://github.com/Expensify/App/issues/66425)

Tests -- update all existing calls + add builder tests for both.
```

---

**PR 10: IOU request + track + distance -- action layer + intermediaries + hooks** (~38 lines)

```
Action layer (parameterized in PR 9, now thread real value from callers):
├── requestMoney (IOU/TrackExpense.ts) -- add delegateAccountID param
├── trackExpense (IOU/TrackExpense.ts) -- add delegateAccountID param
├── createDistanceRequest (IOU/Split.ts) -- add delegateAccountID param
└── convertBulkTrackedExpensesToIOU (IOU/TrackExpense.ts) -- add delegateAccountID param

Intermediary actions -- add delegateAccountID, forward:
├── MoneyRequest.ts createTransaction -- forward to requestMoney / trackExpense
├── MoneyRequest.ts handleMoneyRequestStepScanParticipants -- forward to createTransaction / startSplitBill
├── MoneyRequest.ts handleMoneyRequestStepDistanceNavigation -- forward to createDistanceRequest / trackExpense
├── Duplicate.ts duplicateExpenseTransaction -- forward to trackExpense / createExpenseByType
├── Duplicate.ts createExpenseByType -- forward to requestMoney / createDistanceRequest / submitPerDiemExpense
├── Duplicate.ts bulkDuplicateExpenses -- forward to duplicateExpenseTransaction
├── Duplicate.ts duplicateReport -- forward to createExpenseByType
├── Duplicate.ts bulkDuplicateReports -- forward to duplicateReport
└── handleFileRetry.ts -- forward to requestMoney / trackExpense

Hooks -- add delegateAccountID, forward:
├── useExpenseSubmission.ts -- local requestMoney/trackExpense/createDistanceRequest wrappers, add param + forward
├── useReceiptScan.ts -- forward to handleMoneyRequestStepScanParticipants
├── useDistanceNavigation.ts -- forward to handleMoneyRequestStepDistanceNavigation
├── useOdometerNavigation.ts -- forward to handleMoneyRequestStepDistanceNavigation
├── useBulkDuplicateAction.ts -- forward to bulkDuplicateExpenses
├── useBulkDuplicateReportAction.ts -- forward to bulkDuplicateReports
└── useExpenseActions.ts -- forward to duplicateExpenseTransaction
```

---

**PR 10b: IOU request + track + distance -- component callers** (~48 lines, 16 files)

```
Component callers -- add useDelegateAccountID(), pass delegateAccountID:
├── IOURequestStepConfirmation.tsx (via useExpenseSubmission)
├── SubmitExpenseOrchestrator.tsx (drives useExpenseSubmission)
├── IOURequestStepAmount.tsx (direct requestMoney/trackExpense) -- already has hook from PR 8d
├── SubmitDetailsPage.tsx (direct requestMoney/trackExpense)
├── IOURequestStepScan/index.tsx (via useReceiptScan)
├── IOURequestStepScan/index.native.tsx (via useReceiptScan)
├── IOURequestStepDistance.tsx (via useDistanceNavigation) -- already has hook from PR 8d
├── IOURequestStepDistanceMap.tsx (via useDistanceNavigation) -- already has hook from PR 8d
├── IOURequestStepDistanceManual.tsx (direct handleMoneyRequestStepDistanceNavigation) -- already has hook from PR 8d
├── IOURequestStepDistanceGPS/index.native.tsx (direct)
├── IOURequestStepDistanceOdometer.tsx (via useOdometerNavigation) -- already has hook from PR 8d
├── AddExistingExpenseFooter.tsx (convertBulkTrackedExpensesToIOU)
├── BulkDuplicateHandler.tsx (via useBulkDuplicateAction)
├── BulkDuplicateReportHandler.tsx (via useBulkDuplicateReportAction)
├── MoneyRequestHeaderSecondaryActions.tsx (via useExpenseActions)
└── MoneyReportHeaderSecondaryActions.tsx (via useExpenseActions)
```

---

**PR 11: Split + SplitTransactionUpdate + TransactionInlineEdit -- action layer** (~20 lines)

Removes deferred `undefined` from PR 8 (SplitTransactionUpdate, TransactionInlineEdit) and PR 7 (addCommentToSplitTransactionThread).

```
Action layer -- add delegateAccountID, thread real value:
├── Split.ts startSplitBill -- remove undefined, accept + forward
├── Split.ts splitBill -- add param, forward to createSplitsAndOnyxData
├── Split.ts splitBillAndOpenReport -- add param, forward to createSplitsAndOnyxData
├── Split.ts completeSplitBill -- remove undefined, accept + forward to buildOptimisticMoneyRequestEntities + buildOptimisticReportPreview
├── SplitTransactionUpdate.ts updateSplitTransactions -- remove undefined, accept + forward to getUpdateMoneyRequestParams
├── SplitTransactionUpdate.ts updateSplitTransactionsFromSplitExpensesFlow -- add param, forward to updateSplitTransactions
├── SplitTransactionUpdate.ts addCommentToSplitTransactionThread -- remove undefined from buildOptimisticAddCommentReportAction call
├── TransactionInlineEdit.ts editTransactionDateInline -- remove undefined, accept + forward to updateMoneyRequestDate
├── TransactionInlineEdit.ts editTransactionMerchantInline -- same
├── TransactionInlineEdit.ts editTransactionTagInline -- same
├── TransactionInlineEdit.ts editTransactionCategoryInline -- same
├── TransactionInlineEdit.ts editTransactionDescriptionInline -- same
└── TransactionInlineEdit.ts editTransactionAmountInline -- same
```

---

**PR 11b: Split flows -- hooks + component callers** (~40 lines)

```
Hooks -- add delegateAccountID, forward:
├── useExpenseSubmission.ts -- split paths (splitBill, splitBillAndOpenReport, startSplitBill)
├── useDeleteTransactions.ts -- forward to updateSplitTransactions
├── useTransactionInlineEdit.ts -- forward to editTransaction*Inline
├── useExpenseActions.ts -- forward (uses useDeleteTransactions)
└── useSelectedTransactionsActions.ts -- forward (uses useDeleteTransactions)

Component callers -- add useDelegateAccountID(), pass:
├── IOURequestStepConfirmation.tsx (via useExpenseSubmission split paths) -- already has hook from PR 10b
├── IOURequestStepScan/index.tsx + index.native.tsx (via useReceiptScan -> startSplitBill) -- already has hook from PR 10b
├── SplitBillDetailsPage.tsx (completeSplitBill)
├── SplitExpensePage.tsx (updateSplitTransactionsFromSplitExpensesFlow)
├── TransactionListItem/index.tsx (via useTransactionInlineEdit)
├── MoneyRequestReportTransactionItem.tsx (via useTransactionInlineEdit)
├── MoneyRequestHeaderSecondaryActions.tsx (via useDeleteTransactions)
├── PopoverReportActionContextMenu.tsx (via useDeleteTransactions)
├── ReportDetailsPage.tsx (via useDeleteTransactions)
├── MoneyReportHeaderSecondaryActions.tsx (via useExpenseActions -> useDeleteTransactions)
├── SelectionToolbar.tsx (via useSelectedTransactionsActions -> useDeleteTransactions)
└── MoneyReportHeaderSelectionDropdown.tsx (via useSelectedTransactionsActions)
```

---

**PR 12: Pay + send + invoice -- action layer + hooks** (~20 lines)

```
Action layer (parameterized in PR 9, now thread real value):
├── PayMoneyRequest.ts payMoneyRequest -- add delegateAccountID param
├── PayMoneyRequest.ts payInvoice -- add delegateAccountID param
├── SendMoney.ts sendMoneyElsewhere -- add delegateAccountID param
├── SendMoney.ts sendMoneyWithWallet -- add delegateAccountID param
├── SendInvoice.ts sendInvoice -- add delegateAccountID param
└── Search.ts payMoneyRequestOnSearch -- add delegateAccountID param

Hooks -- add delegateAccountID, forward:
├── useExpenseSubmission.ts -- sendMoney / sendInvoice paths
├── useHoldMenuSubmit.ts -- forward to payMoneyRequest
├── useSelectionModeReportActions.ts -- forward to payMoneyRequest / payInvoice
└── useSearchBulkActions.ts -- forward to payMoneyRequestOnSearch
```

---

**PR 12b: Pay + send + invoice -- component callers** (~42 lines, 14 files)

```
Component callers -- add useDelegateAccountID(), pass:
├── IOURequestStepConfirmation.tsx (via useExpenseSubmission send paths) -- already has hook from PR 10b
├── IOURequestStepAmount.tsx (direct sendMoneyElsewhere/sendMoneyWithWallet) -- already has hook from PR 8d
├── IOURequestStepCompanyInfo.tsx (direct sendInvoice)
├── PayPrimaryAction.tsx (payMoneyRequest / payInvoice)
├── PayActionButton.tsx (payMoneyRequest / payInvoice)
├── MoneyReportHeaderSecondaryActions.tsx (payMoneyRequest / payInvoice) -- already has hook
├── MoneyReportHeaderSelectionDropdown.tsx (payMoneyRequest / payInvoice) -- already has hook from PR 11b
├── ProcessMoneyReportHoldMenu.tsx (via useHoldMenuSubmit)
├── HoldMenuModalWrapper.tsx (via useHoldMenuSubmit)
├── SearchBulkActionsButton.tsx (via useSearchBulkActions)
├── PayActionCell.tsx (payMoneyRequestOnSearch)
├── TransactionListItem (handler wiring) -- already has hook from PR 11b
├── ExpenseReportListItem (handler wiring)
└── ReportListItemHeader (handler wiring)
```

---

**PR 13: Reject + perDiem + hold -- actions + components** (~39 lines)

```
Action layer (parameterized in PR 9, now thread real value):
├── RejectMoneyRequest.ts rejectMoneyRequest -- add delegateAccountID param
├── Search.ts rejectMoneyRequestInBulk -- add delegateAccountID param
├── Search.ts rejectMoneyRequestsOnSearch -- add delegateAccountID param, forward to rejectMoneyRequest + rejectMoneyRequestInBulk
├── PerDiem.ts submitPerDiemExpense -- add delegateAccountID param
├── PerDiem.ts submitPerDiemExpenseForSelfDM -- add delegateAccountID param
├── Hold.ts putOnHold -- add delegateAccountID param
└── Hold.ts putTransactionsOnHold -- add delegateAccountID param, forward to putOnHold

Hooks/intermediaries -- add delegateAccountID, forward:
├── useExpenseSubmission.ts -- perDiem paths (submitPerDiemExpense / submitPerDiemExpenseForSelfDM)
└── Duplicate.ts mergeDuplicates -- forward to submitPerDiemExpense (perDiem duplicate case)

Component callers -- add useDelegateAccountID(), pass:
├── RejectReasonPage.tsx (rejectMoneyRequest)
├── SearchRejectReasonPage.tsx (rejectMoneyRequestsOnSearch)
├── RejectExpenseReportPage.tsx (rejectExpenseReport)
├── IOURequestStepConfirmation.tsx (via useExpenseSubmission perDiem) -- already has hook
├── TransactionDuplicate/Confirmation.tsx (via mergeDuplicates -> submitPerDiemExpense)
├── HoldReasonPage.tsx (putOnHold)
└── SearchHoldReasonPage.tsx (putOnHold / putTransactionsOnHold)
```

---

**PR 14: Onboarding + test drive + ReportUtils internal callers** (~42 lines)

Migrates deferred `undefined` from PRs 5 and 7.

```
ReportUtils.ts internal callers (currently pass delegateAccountIDParam: undefined):
├── prepareOnboardingOnyxData -- 3x buildOptimisticAddCommentReportAction({...delegateAccountIDParam: undefined}) -> thread real value
├── prepareOnboardingOnyxData -- task loop calls buildOptimisticTaskCommentReportAction -> thread real value
└── buildOptimisticTaskCommentReportAction -- calls buildOptimisticAddCommentReportAction({...delegateAccountIDParam: undefined}) -> thread real value

Action callers of prepareOnboardingOnyxData -- add delegateAccountID param:
├── Report/index.ts getGuidedSetupDataForOpenReport -- forward (called from openReport)
├── Report/index.ts completeOnboarding -- forward
├── Policy/Policy.ts buildPolicyData -> createWorkspace -- forward
├── TrackExpense.ts (test-drive / guidedSetupData branch) -- forward
└── PayMoneyRequest.ts completePaymentOnboarding -- forward

Action callers of buildOptimisticTaskCommentReportAction -- add delegateAccountID param:
└── Task.ts (via getTaskAssigneeChatOnyxData -> createTaskAndNavigate, editTaskAssignee) -- forward

MoneyRequestBuilder.ts buildOnyxDataForTestDriveIOU -- remove undefined, thread real value

Component callers for completeOnboarding -- add useDelegateAccountID(), pass:
├── BaseOnboardingPurpose.tsx
├── BaseOnboardingWorkspaces.tsx
├── BaseOnboardingInterestedFeatures.tsx
├── BaseOnboardingWorkspaceOptional.tsx
├── BaseOnboardingWorkspaceInvite.tsx
├── BaseOnboardingPersonalDetails.tsx
├── useAutoCreateTrackWorkspace.ts
└── useAutoCreateSubmitWorkspace.ts
```

---

**PR 15: Remaining callers -- Policy, Workflow, Report, Search** (~37 lines)

```
Report/index.ts -- thread delegateAccountID through legacy paths:
├── openReport (legacy buildOptimisticIOUReportAction branch when transaction && !parentReportActionID) -- many screens call openReport but only this branch uses the builder
└── buildOptimisticChangePolicyData -- forward to buildOptimisticReportPreview
    ├── changeReportPolicy -- forward
    │   └── ReportChangeWorkspacePage.tsx -- add useDelegateAccountID(), pass
    └── changeReportPolicyAndInviteSubmitter -- forward
        └── ReportChangeWorkspacePage.tsx -- same component

Search.ts -- thread delegateAccountID:
└── setOptimisticDataForTransactionThreadPreview -- forward to buildOptimisticIOUReportAction
    ├── Search/index.tsx (2 direct call sites) -- add useDelegateAccountID(), pass
    └── SearchUIUtils.ts createAndOpenSearchTransactionThread -- forward
        ├── Search/index.tsx -- already has hook
        ├── SearchStaticList.tsx -- add useDelegateAccountID(), pass
        └── TransactionGroupListExpanded.tsx -- add useDelegateAccountID(), pass

getReportActionsToDisplay.ts -- forward to buildOptimisticIOUReportAction:
└── useReportActionsPagination.ts -- forward
    └── ReportActionsView.tsx -- add useDelegateAccountID(), pass

Policy/Tag.ts -- createPolicyTag calls getFinishOnboardingTaskOnyxData with undefined for delegate:
└── WorkspaceCreateTagPage.tsx -- add useDelegateAccountID(), pass

Policy/Category.ts -- appendSetupCategoriesOnboardingData calls getFinishOnboardingTaskOnyxData with undefined:
├── CategorySettingsPage.tsx -- add useDelegateAccountID(), pass
└── WorkspaceCategoriesPage.tsx -- add useDelegateAccountID(), pass

Workflow.ts -- createApprovalWorkflow calls completeTask with undefined for delegate:
└── WorkspaceWorkflowsApprovalsCreatePage.tsx -- add useDelegateAccountID(), pass
```

---

**PR 16 (Final): Remove `Onyx.connect()` + cleanup** (~18 lines)

```
src/libs/ReportUtils.ts:
├── Remove: let delegateEmail = '';
├── Remove: Onyx.connect({ key: ONYXKEYS.ACCOUNT, callback: (value) => { delegateEmail = value?.delegatedAccess?.delegate ?? ''; } });
├── Remove fallback in buildOptimisticAddCommentReportAction: ?? (delegateEmail ? getPersonalDetailByEmail(delegateEmail)?.accountID : undefined)
├── Remove fallback in buildOptimisticTaskReportAction: ?? delegateEmail
├── Remove fallback in buildOptimisticModifiedExpenseReportAction: ?? (delegateEmail ? getPersonalDetailByEmail(delegateEmail)?.accountID : undefined)
├── Remove fallback in buildOptimisticIOUReportAction: ?? (delegateEmail ? getPersonalDetailByEmail(delegateEmail)?.accountID : undefined)
├── Remove fallback in buildOptimisticReportPreview: ?? (delegateEmail ? getPersonalDetailByEmail(delegateEmail)?.accountID : undefined)
├── Remove all TODO comments referencing https://github.com/Expensify/App/issues/66425
└── Verify: grep 'delegateEmail' in ReportUtils.ts returns 0 matches (excluding unrelated code)
```

---

## Dependency Graph

```
PR 8     (ModifiedExpense full chain - merged 8+8b+8c+8d) -- COMPLETED ✅
PR 9     (IOU + Preview builders + action helpers)       -- independent
PR 10    (request/track/distance actions + hooks)        -- depends on PR 9
PR 10b   (request/track/distance components)             -- depends on PR 10
PR 11    (split + inline edit actions)                   -- depends on PR 9 + PR 8
PR 11b   (split flows hooks + components)                -- depends on PR 11
PR 12    (pay/send/invoice actions + hooks)              -- depends on PR 9
PR 12b   (pay/send/invoice components)                   -- depends on PR 12
PR 13    (reject/perDiem/hold)                           -- depends on PR 9
PR 14    (onboarding/testdrive)                          -- depends on PR 9
PR 15    (remaining callers)                             -- depends on PR 14
PR 16    (final cleanup)                                 -- depends on ALL above
```

**Critical path**: PR 9 -> PR 10 -> PR 10b, PR 11 -> PR 11b, PR 12 -> PR 12b, PR 13 -> PR 14 -> PR 15 -> PR 16

**Parallel tracks**:
- PR 10b, PR 11b, PR 12b, PR 13 can all run in parallel after their action PRs merge

---

## Immediate Next Step

**PR 8 is COMPLETED.** Next up: **PR 9** (buildOptimisticIOUReportAction + buildOptimisticReportPreview builders + all action file helpers).
