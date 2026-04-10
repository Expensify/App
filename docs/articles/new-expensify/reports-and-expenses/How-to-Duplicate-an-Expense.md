---
title: How to Duplicate an Expense
description: Learn how to create a copy of one or more expenses in Expensify using the Duplicate expense option, including bulk duplication from the Expenses tab.
keywords: [New Expensify, duplicate expense, copy expense, duplicate cash expense, duplicate distance expense, duplicate per diem expense, create copy of expense, bulk duplicate, duplicate multiple expenses]
internalScope: Audience is expense submitters. Covers how to duplicate a single expense and how to bulk-duplicate multiple expenses from the Expenses tab or a report. Does not cover duplicate detection, resolving flagged duplicates, or merging expenses.
---

# How to duplicate an expense

You can create a copy of one or more expenses using **Duplicate expense**. This generates new expenses on your primary workspace with the same details as the originals, including the merchant, amount, category, tags, and tax. The date is set to today and receipt images are not copied.

This is useful when you need to create similar expenses quickly without re-entering all the details manually. You can duplicate a single expense or select multiple expenses and duplicate them all at once.

**Note:** Card expenses cannot be duplicated. Only cash, distance, and per diem expenses support duplication.

---

## Who can duplicate an expense

Any expense submitter can duplicate their own expenses. **Duplicate expense** is available for cash, distance, and per diem expenses in any status, including Unreported, Draft, Processing, Approved, and Paid. 

Card expenses (company cards and Expensify Cards) cannot be duplicated.

---

## How to duplicate a single expense 

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Reports > Expenses**
1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Reports > Expenses**.
3. Select **More**. 
4. Choose **Duplicate expense**.The **Duplicate expense** menu item will briefly change to **Duplicated** to confirm the action.

The duplicate expense is created on your primary workspace with the original expense's merchant, amount, category, tags, tax, and billable or reimbursable status. The date is set to today and receipt images are not included.

<!-- SCREENSHOT:
WIP here: https://github.com/Expensify/Expensify/issues/616815
-->

---

## How to duplicate multiple expenses at once

You can select multiple eligible expenses and duplicate them all in one action.

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Reports > Expenses**.
2. Long-press an expense (or use the checkbox on web) to enter selection mode.
3. Select two or more cash, distance, or per diem expenses that you submitted.
4. Open the bulk actions dropdown and choose **Duplicate expenses**.

Each selected expense is duplicated individually. The same rules apply as for single duplication — card expenses, scanning expenses, per diem expenses without dates, and expenses you did not submit are excluded from selection.

<!-- SCREENSHOT:
Suggestion: Show the bulk actions dropdown with the "Duplicate expenses" option visible after selecting multiple expenses.
Location: After step 4.
Purpose: Helps the user identify the bulk duplicate option in the dropdown.
-->

---

## What happens after you duplicate an expense

A new expense is created on your primary workspace with the following details copied from the original:

- Merchant
- Amount and currency
- Category
- Tags
- Tax
- Billable and reimbursable status
- Attendees
- Description

The following details are not copied:

- **Date** is set to today instead of the original date
- **Receipt images** are not included on the duplicate

If the original expense's coding (such as categories or tags) is not available on your primary workspace, the duplicate expense will still be created. You will be prompted to correct the coding on the expense. 

---

## Why the duplicate option is unavailable for some per diem or distance expenses

Per diem and distance expenses use rates that are specific to each workspace. If your primary workspace has different rates than the workspace where the original expense lives, duplicating would apply incorrect rates.

When this restriction applies, Expensify will display a message explaining that the expense cannot be duplicated across workspaces because rates may differ.

---

# FAQ

## Can I duplicate multiple expenses at once?

Yes. Select two or more eligible expenses from the **Expenses** tab or from within a report, then choose **Duplicate expenses** from the bulk actions dropdown. Each selected expense is duplicated individually with the same rules as single duplication.

## Can I duplicate a card expense?

No. Expenses from company cards or Expensify Cards cannot be duplicated. Only cash, distance, and per diem expenses support duplication. 

<!-- CROSSLINK:
Learn more about expense types [LINK]. 
Page WIP here: https://github.com/Expensify/Expensify/issues/614406
-->

## Does the duplicated expense include the receipt image?

No. Receipt images are not copied to the duplicate expense. You will need to attach a new receipt if one is required.

## Why is the Duplicate option not showing in the More menu?

**Duplicate expense** only appears when the expense is a cash, distance, or per diem expense that you submitted. It will not appear if:

- The expense is from a company card or Expensify Card
- A receipt is currently being scanned
- For per diem expenses, if start or end dates are missing
