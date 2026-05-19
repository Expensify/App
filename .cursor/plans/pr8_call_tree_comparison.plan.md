---
name: PR 8 Call Tree Comparison
overview: Side-by-side comparison of the original plan tree vs the actual codebase tree for buildOptimisticModifiedExpenseReportAction, highlighting new/missing callers.
todos: []
isProject: false
---

# PR 8 Call Tree Comparison

Reference issue: `https://github.com/Expensify/App/issues/66425`

## Fresh Tree (from actual codebase, src/ only, no tests)

```
buildOptimisticModifiedExpenseReportAction (src/libs/ReportUtils.ts:7618)  [BUILDER, PR 8, with fallback]
│
├── getUpdateMoneyRequestParams (src/libs/actions/IOU/UpdateMoneyRequest.ts:938)  [PR 8]
│   │
│   ├── updateMoneyRequestDate (UpdateMoneyRequest.ts:79)  [PR 8]
│   │   ├── IOURequestStepDate.tsx                         [PR 8, COMPONENT]
│   │   └── TransactionInlineEdit.ts:182 (editTransactionDateInline)  [NEW — not in plan]
│   │
│   ├── updateMoneyRequestBillable (UpdateMoneyRequest.ts:126)  [PR 8]
│   │   └── MoneyRequestView.tsx                           [PR 8, COMPONENT]
│   │
│   ├── updateMoneyRequestReimbursable (UpdateMoneyRequest.ts:176)  [PR 8]
│   │   └── MoneyRequestView.tsx                           [PR 8, COMPONENT]
│   │
│   ├── updateMoneyRequestMerchant (UpdateMoneyRequest.ts:227)  [PR 8]
│   │   ├── IOURequestStepMerchant.tsx                     [PR 8, COMPONENT]
│   │   └── TransactionInlineEdit.ts:201 (editTransactionMerchantInline)  [NEW — not in plan]
│   │
│   ├── updateMoneyRequestAttendees (UpdateMoneyRequest.ts:285)  [PR 8]
│   │   └── IOURequestStepAttendees.tsx                    [PR 8, COMPONENT]
│   │
│   ├── updateMoneyRequestTag (UpdateMoneyRequest.ts:354)  [PR 8]
│   │   ├── IOURequestStepTag.tsx                          [PR 8, COMPONENT]
│   │   └── TransactionInlineEdit.ts:259 (editTransactionTagInline)  [NEW — not in plan]
│   │
│   ├── updateMoneyRequestTaxAmount (UpdateMoneyRequest.ts:393)  [PR 8]
│   │   └── IOURequestStepTaxAmountPage.tsx                [PR 8, COMPONENT]
│   │
│   ├── updateMoneyRequestTaxRate (UpdateMoneyRequest.ts:458)  [PR 8]
│   │   ├── IOURequestStepTaxRatePage.tsx                  [PR 8, COMPONENT]
│   │   └── MoneyRequestView.tsx                           [PR 8, COMPONENT]
│   │
│   ├── updateMoneyRequestDistance (UpdateMoneyRequest.ts:519)  [PR 8]
│   │   ├── IOURequestStepDistance.tsx                     [PR 8, COMPONENT]
│   │   ├── IOURequestStepDistanceMap.tsx                  [PR 8, COMPONENT]
│   │   ├── IOURequestStepDistanceManual.tsx               [PR 8, COMPONENT]
│   │   └── IOURequestStepDistanceOdometer.tsx             [PR 8, COMPONENT]
│   │
│   ├── updateMoneyRequestDistanceRate (UpdateMoneyRequest.ts:736)  [PR 8]
│   │   └── IOURequestStepDistanceRate.tsx                 [PR 8, COMPONENT]
│   │
│   ├── updateMoneyRequestCategory (UpdateMoneyRequest.ts:621)  [PR 8]
│   │   ├── IOURequestStepCategory.tsx                     [PR 8, COMPONENT]
│   │   └── TransactionInlineEdit.ts:221 (editTransactionCategoryInline)  [NEW — not in plan]
│   │
│   ├── updateMoneyRequestDescription (UpdateMoneyRequest.ts:676)  [PR 8]
│   │   ├── IOURequestStepDescription.tsx                  [PR 8, COMPONENT]
│   │   └── TransactionInlineEdit.ts:211 (editTransactionDescriptionInline)  [NEW — not in plan]
│   │
│   ├── updateMoneyRequestAmountAndCurrency (UpdateMoneyRequest.ts:840)  [PR 8]
│   │   ├── IOURequestStepAmount.tsx                       [PR 8, COMPONENT]
│   │   └── TransactionInlineEdit.ts:241 (editTransactionAmountInline)  [NEW — not in plan]
│   │
│   ├── getOnyxTargetTransactionData (MergeTransaction.ts:211)  [PR 8]
│   │   NOTE: passes shouldBuildOptimisticModifiedExpenseReportAction=false, so builder NOT executed at runtime
│   │   └── mergeTransactionRequest (MergeTransaction.ts:343)  [PR 8]
│   │       └── ConfirmationPage.tsx (TransactionMerge)     [PR 8, COMPONENT]
│   │
│   └── updateSplitTransactions (IOU/Split.ts:1062)  [PR 11, passes undefined]
│       ├── updateSplitTransactionsFromSplitExpensesFlow (Split.ts:2230)  [PR 11]
│       │   └── SplitExpensePage.tsx:283                    [PR 11, COMPONENT]
│       └── useDeleteTransactions (hooks/useDeleteTransactions.ts:151)  [PR 11]
│           ├── useSelectedTransactionsActions.ts:112       [PR 11, HOOK]
│           │   ├── SelectionToolbar.tsx:159                [PR 11, COMPONENT]
│           │   └── MoneyReportHeaderSelectionDropdown.tsx:160  [PR 11, COMPONENT]
│           ├── useExpenseActions.ts:161                    [PR 11, HOOK]
│           │   └── MoneyReportHeaderSecondaryActions.tsx:270  [PR 11, COMPONENT]
│           ├── ReportDetailsPage.tsx:318                   [PR 11, COMPONENT]
│           ├── PopoverReportActionContextMenu.tsx:334      [PR 11, COMPONENT]
│           └── MoneyRequestHeaderSecondaryActions.tsx:150  [PR 11, COMPONENT]
│
├── getUpdateTrackExpenseParams (UpdateMoneyRequest.ts:1509)  [PR 8]
│   NOTE: called internally by same updateMoneyRequest* fns when transaction is a track expense in selfDM
│   Same wrapper callers as above (Date, Merchant, Distance, Description, DistanceRate, AmountAndCurrency)
│   Also called by getOnyxTargetTransactionData (MergeTransaction.ts:260, shouldBuild=false)
│
└── updateMultipleMoneyRequests (IOU/BulkEdit.ts:85)  [PR 8]
    └── SearchEditMultiplePage.tsx:161                      [PR 8, COMPONENT]
```

---

## Differences from Original Plan Tree (plan file lines 383–428)

### NEW callers not in original plan (all via TransactionInlineEdit.ts)

TransactionInlineEdit.ts was created 2026-02-21 and was not in the plan. It calls 6 of the 13 wrappers via a shared `getIouParamsForTransaction` helper that spreads params:


| Wrapper function                      | TransactionInlineEdit caller       | Line |
| ------------------------------------- | ---------------------------------- | ---- |
| `updateMoneyRequestDate`              | `editTransactionDateInline`        | :182 |
| `updateMoneyRequestMerchant`          | `editTransactionMerchantInline`    | :201 |
| `updateMoneyRequestDescription`       | `editTransactionDescriptionInline` | :211 |
| `updateMoneyRequestCategory`          | `editTransactionCategoryInline`    | :221 |
| `updateMoneyRequestAmountAndCurrency` | `editTransactionAmountInline`      | :241 |
| `updateMoneyRequestTag`               | `editTransactionTagInline`         | :259 |


**Impact on this PR:** Since the wrappers now require `delegateAccountID` in their param type, and `TransactionInlineEdit.ts` spreads `getIouParamsForTransaction()` into those calls, we added `delegateAccountID: undefined as number | undefined` to the shared return object. This is correct — the file uses module-level `Onyx.connect` and can't use hooks, so it must pass `undefined` with a TODO.

**Upstream callers of TransactionInlineEdit (not in plan):**

- `useTransactionInlineEdit` hook (src/hooks/useTransactionInlineEdit.ts)
  - `TransactionListItem.tsx` (Search list)
  - `MoneyRequestReportTransactionItem.tsx` (Report transaction list)

These upstream callers don't need changes because they don't pass `delegateAccountID` — they call `editTransaction*Inline` functions which internally use the shared params.

### Callers that ARE in plan but with WRONG file paths


| Plan says                                          | Actual location                        |
| -------------------------------------------------- | -------------------------------------- |
| `getUpdateMoneyRequestParams` in `IOU/index.ts`    | `IOU/UpdateMoneyRequest.ts`            |
| `getUpdateTrackExpenseParams` in `IOU/index.ts`    | `IOU/UpdateMoneyRequest.ts`            |
| `updateMultipleMoneyRequests` in `IOU/index.ts`    | `IOU/BulkEdit.ts`                      |
| `MergeTransaction.ts` in `IOU/MergeTransaction.ts` | `src/libs/actions/MergeTransaction.ts` |


### Callers that are the SAME

All 17 original component callers match exactly:

- 14 IOURequestStep* pages
- MoneyRequestView.tsx
- SearchEditMultiplePage.tsx
- ConfirmationPage.tsx (TransactionMerge)

Split.ts `updateSplitTransactions` (PR 11 unmigrated caller) — matches exactly.

### PR 11 subtree (updateSplitTransactions callers) — for future reference

The plan (lines 456–465) lists these callers of `updateSplitTransactions`:

- `updateSplitTransactionsFromSplitExpensesFlow` → `SplitExpensePage.tsx`
- `useDeleteTransactions` → `useSelectedTransactionsActions`, `MoneyRequestHeaderSecondaryActions`, `PopoverReportActionContextMenu`, `ReportDetailsPage`

Fresh tree confirms these plus adds:

- `useExpenseActions.ts` → `MoneyReportHeaderSecondaryActions.tsx`
- `SelectionToolbar.tsx` (via `useSelectedTransactionsActions`)
- `MoneyReportHeaderSelectionDropdown.tsx` (via `useSelectedTransactionsActions`)

These are all PR 11 scope and don't affect PR 8.