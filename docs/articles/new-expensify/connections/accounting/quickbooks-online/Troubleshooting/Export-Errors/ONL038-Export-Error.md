---
title: ONL038 Export Error in QuickBooks Online
description: Learn how to fix the ONL038 export error in QuickBooks Online by exporting reimbursable expenses as a Vendor Bill instead of a Journal Entry.
keywords: ONL038, QuickBooks Online tax calculation error, rounding issues tax rates, export as vendor bill, Journal Entry export error, Expensify QuickBooks Online export, Workspace Admin, accounting export error
internalScope: Audience is Workspace Admins using QuickBooks Online integration. Covers fixing the ONL038 export error caused by exporting tax to a Journal Entry. Does not cover other export error codes.
---

# ONL038 Export Error in QuickBooks Online

If you see the error:

ONL038: Tax calculation error. Please export as a vendor bill to resolve rounding issues with tax rates.

This means QuickBooks Online cannot calculate tax correctly when the report is exported as a Journal Entry.

---

## Why the ONL038 Export Error Happens in QuickBooks Online

The ONL038 error occurs when:

- A report includes tax.
- The export type is set to Journal Entry.
- QuickBooks Online encounters rounding differences in tax calculations.

QuickBooks Online handles tax rounding more accurately when exporting as a Vendor Bill instead of a Journal Entry.

---

## How to Export Reimbursable Expenses as a Vendor Bill in Expensify

To fix the ONL038 error, update your export settings for reimbursable expenses.

### On Web

1. Go to the **Workspaces** navigation tab on the left.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Export**.
5. Under reimbursable expenses, select **Vendor Bill** as the export option.
6. Click **Save**.

### On Mobile

1. Tap the **Workspaces** navigation tab on the bottom.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Export**.
5. Under reimbursable expenses, select **Vendor Bill** as the export option.
6. Tap **Save**.

After updating the export type, retry exporting the report.

---

## How to Re-Export a Report After Fixing ONL038

1. Open the report that failed to export.
2. Click **Export to QuickBooks Online**.
3. Confirm the export.

The report should now export successfully without tax rounding errors.

---

# FAQ

## Does ONL038 Only Affect Reports With Tax?

Yes. The ONL038 error is triggered by tax calculation rounding issues during export.

## Do I Need to Reconnect QuickBooks Online to Fix ONL038?

No. You only need to change the export setting for reimbursable expenses to Vendor Bill and then retry the export.
