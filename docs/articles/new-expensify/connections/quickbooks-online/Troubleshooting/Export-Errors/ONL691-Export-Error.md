---
title: ONL691 Export Error in QuickBooks Online
description: Learn how to fix the ONL691 export error in QuickBooks Online when exporting checks with a negative or $0.00 total amount.
keywords: ONL691, QuickBooks Online check export error, negative total check, zero dollar check export, $0 reimbursable expense, change export type to vendor bill, change export type to journal entry, Expensify QuickBooks Online export error, Workspace Admin, accounting export error
internalScope: Audience is Workspace Admins using QuickBooks Online integration. Covers fixing the ONL691 export error caused by negative or zero-dollar check exports. Does not cover other export error codes.
---

# ONL691 Export Error in QuickBooks Online

If you see the error:

ONL691: Checks cannot be exported with a negative or $0.00 total amount.

This means the report total is negative or $0.00, or it contains reimbursable expenses that total $0.00, and the export type is set to Check.

QuickBooks Online does not allow checks to be created for negative or zero-dollar amounts.

---

## Why the ONL691 Export Error Happens in QuickBooks Online

The ONL691 error occurs when:

- The report total is negative.
- The report total is $0.00.
- Reimbursable expenses total $0.00.
- The export type for reimbursable expenses is set to Check.

Checks in QuickBooks Online must have a positive dollar amount.

---

## Option One: Change $0.00 Expenses to Non-Reimbursable

If the report includes $0.00 reimbursable expenses:

1. Open the report in Expensify.
2. Click into the $0.00 expense.
3. Change the expense from reimbursable to non-reimbursable.
4. Save the changes.

After updating the expenses, retry exporting the report.

---

## Option Two: Change the Export Type From Check

If the report total is negative or $0.00, update the export type.

### On Web

1. Go to the **Workspaces** navigation tab on the left.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Export**.
5. Under **Export reimbursable expenses as**, change the export type from **Check** to **Journal Entry** or **Vendor Bill**.
6. Click **Save**.

### On Mobile

1. Tap the **Workspaces** navigation tab on the bottom.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Export**.
5. Under **Export reimbursable expenses as**, change the export type from **Check** to **Journal Entry** or **Vendor Bill**.
6. Tap **Save**.

After updating the export type, retry exporting the report.

---

# FAQ

## Can QuickBooks Online Create a Check for $0.00?

No. QuickBooks Online does not allow checks with a zero or negative total amount.

## Which Export Types Allow $0.00 or Negative Amounts?

Journal Entry and Vendor Bill exports can handle $0.00 or negative totals, depending on your accounting setup.
