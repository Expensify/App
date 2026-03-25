---
title: ONL531 Export Error in QuickBooks Online Integration
description: Learn what the ONL531 export error means in QuickBooks Online and how to resolve deleted or inactive account and mapping issues.
keywords: ONL531, QuickBooks Online export error, account has been deleted QuickBooks, inactive account mapping QuickBooks, deleted category QuickBooks error, Expensify QuickBooks Online integration, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers resolving the ONL531 export error caused by deleted or inactive account mappings. Does not cover other QuickBooks Online error codes.
---

# ONL531 Export Error in QuickBooks Online Integration

If you see the error:

ONL531: Account has been deleted.

This means one or more mapped accounts or tags used in the report are no longer active in QuickBooks Online, preventing the export from completing.

---

## Why the ONL531 Export Error Happens in QuickBooks Online

The ONL531 error typically indicates that one of the following was deleted or set to inactive in QuickBooks Online:

- Account (category or export account)  
- Customer  
- Item  
- Vendor (including report submitter or Credit Card Misc. vendor)  
- Class  

If any mapped value no longer exists or is inactive in the QuickBooks Online Chart of Accounts or lists, the export fails.

This is a QuickBooks Online mapping issue, not a connection issue.

---

## How to Fix the ONL531 Export Error

This issue can be resolved by refreshing mappings and confirming active accounts.

### Refresh the Export Configuration

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Export** tab.
6. Temporarily select a different export option under **Export Reimbursable/Non-reimbursable Expenses As**.
7. Click **Save**.
8. Reopen **Configure**.
9. Re-select the correct export type.
10. Click **Save**.

This refreshes the mapping between Expensify and QuickBooks Online.

### Confirm All Mapped Values Are Active

In QuickBooks Online:

1. Review the **Chart of Accounts**.
2. Confirm the export account and categories are active.
3. Review Customers, Vendors, Items, and Classes used in the report.
4. Reactivate or replace any deleted or inactive entries.

After confirming active mappings:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After refreshing export settings and confirming all mapped values are active, retry the export.

## Does ONL531 Mean My QuickBooks Connection Is Broken?

No. It means a mapped account or tag used in the export was deleted or set to inactive in QuickBooks Online.

## Do I Need to Reconnect QuickBooks Online?

No. Refreshing the export configuration and running **Sync Now** is typically sufficient.
