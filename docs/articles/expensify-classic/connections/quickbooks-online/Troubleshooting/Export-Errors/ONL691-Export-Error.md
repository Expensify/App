---
title: ONL691 Export Error in QuickBooks Online Integration
description: Learn what the ONL691 export error means in QuickBooks Online and how to resolve negative or zero-dollar reimbursable check exports.
keywords: ONL691, QuickBooks Online export error, negative check QuickBooks, zero dollar check QuickBooks, reimbursable $0 expense QuickBooks, Expensify QuickBooks Online integration, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers resolving the ONL691 export error caused by exporting negative or $0.00 totals as checks. Does not cover other QuickBooks Online error codes.
---

# ONL691 Export Error in QuickBooks Online Integration

If you see the error:

ONL691: Checks cannot be exported with a negative or $0.00 total amount.

This means the report total is negative or $0.00 and the export type is set to **Check**, preventing the export from completing.

QuickBooks Online does not allow checks with negative or zero totals.

---

## Why the ONL691 Export Error Happens in QuickBooks Online

The ONL691 error typically indicates:

- The report total is negative.
- The report total is $0.00.
- One or more reimbursable expenses are $0.00 and the export type is **Check**.

QuickBooks Online does not support negative or zero-dollar checks. When reimbursable expenses are exported as checks, QuickBooks validates the total and blocks unsupported amounts.

This is a QuickBooks Online export limitation, not a Workspace configuration issue.

---

## How to Fix the ONL691 Export Error

This issue can be resolved by updating the report or adjusting export settings.

### Change $0.00 Expenses to Non-Reimbursable

If the issue is caused by $0.00 reimbursable expenses:

1. Open the affected report.
2. Edit the $0.00 expenses.
3. Change them from **Reimbursable** to **Non-reimbursable**.
4. Save your changes.

Retry exporting the report.

---

### Change the Export Type from Check

If the report total is negative or zero:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Export** tab.
6. Change the export type for **Reimbursable expenses** from **Check** to:
   - **Journal Entry**, or  
   - **Vendor Bill**.
7. Click **Save**.

Then retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After updating the report or changing the export type, retry the export.

## Does ONL691 Mean the Report Is Invalid?

No. The report is valid, but QuickBooks Online does not allow negative or zero-dollar checks.

## Do I Need to Reconnect QuickBooks Online?

No. Updating the report or export settings and retrying the export is typically sufficient.
