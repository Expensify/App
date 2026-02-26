---
title: ONL912 Export Error in QuickBooks Online Integration
description: Learn what the ONL912 export error means in QuickBooks Online and how to resolve deleted or inactive account and mapping issues.
keywords: ONL912, QuickBooks Online export error, account not found QuickBooks, inactive category QuickBooks, deleted export account QuickBooks, Expensify QuickBooks Online integration, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers resolving the ONL912 export error caused by inactive or deleted QuickBooks mappings. Does not cover other QuickBooks Online error codes.
---

# ONL912 Export Error in QuickBooks Online Integration

If you see the error:

ONL912: Account not found.

This means the category or export account used on the report is no longer active or available in QuickBooks Online, preventing the export from completing.

---

## Why the ONL912 Export Error Happens in QuickBooks Online

The ONL912 error typically indicates:

- The selected category was deleted in QuickBooks Online.
- The export account was marked as inactive in the Chart of Accounts.
- A related mapping (Vendor, Customer, Item, or Class) was deleted or inactivated.

If any referenced value no longer exists or is inactive, QuickBooks cannot validate the transaction and blocks the export.

This is a QuickBooks Online mapping issue, not a connection issue.

---

## How to Fix the ONL912 Export Error

This issue can be resolved by confirming active mappings and refreshing the Workspace.

### Confirm Accounts Are Active

1. Log in to QuickBooks Online.
2. Go to the **Chart of Accounts**.
3. Locate the category or export account used in the report.
4. Confirm the account is active.

If the account is inactive, reactivate it.

---

### Confirm Related Records Are Active

If the account is active, review other related mappings:

- Confirm the report submitter’s **Vendor or Employee** record is active.
- Confirm **Customers**, **Items**, and **Classes** used on the report are active.
- Ensure none of the referenced values have been deleted.

If any value is inactive or deleted, either reactivate it in QuickBooks Online or update the report in Expensify to use an active value.

---

### Sync the Workspace

After reactivating or updating records:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After confirming all mapped accounts and related records are active and selecting **Sync Now**, retry the export.

## Does ONL912 Mean My QuickBooks Connection Is Broken?

No. It means a referenced account or related record is inactive or deleted in QuickBooks Online.

## Do I Need to Reconnect QuickBooks Online?

No. Reactivating the correct account or selecting a different active mapping and running **Sync Now** is typically sufficient.
