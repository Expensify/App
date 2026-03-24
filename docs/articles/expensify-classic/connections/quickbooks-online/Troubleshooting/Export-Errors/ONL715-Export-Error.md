---
title: ONL715 Export Error in QuickBooks Online Integration
description: Learn what the ONL715 export error means in QuickBooks Online and how to resolve inactive or deleted account, vendor, customer, or class mappings.
keywords: ONL715, QuickBooks Online export error, invalid reference ID QuickBooks, inactive account QuickBooks, deleted vendor QuickBooks, Expensify QuickBooks Online integration, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers resolving the ONL715 export error caused by inactive or deleted QuickBooks mappings. Does not cover other QuickBooks Online error codes.
---

# ONL715 Export Error in QuickBooks Online Integration

If you see the error:

ONL715: Invalid Reference ID.

This means one or more mapped accounts, vendors, customers, items, or classes used in the report no longer exist or are inactive in QuickBooks Online, preventing the export from completing.

---

## Why the ONL715 Export Error Happens in QuickBooks Online

The ONL715 error typically indicates that one of the following was deleted or set to inactive in QuickBooks Online:

- Account (category or posting account)  
- Customer  
- Item  
- Vendor (report creator, submitter, or Credit Card Misc. vendor)  
- Class  

If any referenced value is inactive or deleted, QuickBooks cannot validate the transaction and blocks the export.

This is a QuickBooks Online mapping issue, not a connection issue.

---

## How to Fix the ONL715 Export Error

This issue can be resolved by refreshing mappings and confirming active records.

### Refresh the Export Configuration

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Export** tab.
6. Temporarily select a different export option under **Export Reimbursable/Non-reimbursable Expenses As**.
7. Click **Save**.
8. Reopen **Configure**.
9. Re-select the correct export option.
10. Click **Save**.

This refreshes the reference IDs used during export.

### Confirm All Mapped Values Are Active

In QuickBooks Online:

1. Review the **Chart of Accounts**.
2. Confirm the export account and categories are active.
3. Review Vendors, Customers, Items, and Classes used in the report.
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

## Does ONL715 Mean My QuickBooks Connection Is Broken?

No. It means a referenced account, vendor, customer, item, or class is inactive or deleted in QuickBooks Online.

## Do I Need to Reconnect QuickBooks Online?

No. Refreshing export settings and running **Sync Now** is typically sufficient.
