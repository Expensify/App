---
title: ONL056 Export Error in QuickBooks Online Integration
description: Learn what the ONL056 export error means in QuickBooks Online and how to recategorize expenses to restore successful exports.
keywords: ONL056, QuickBooks Online export error, expenses must be categorized QuickBooks, missing QuickBooks Online category, invalid category mapping QuickBooks, Expensify QuickBooks Online integration, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers resolving the ONL056 export error caused by missing or invalid category mappings. Does not cover other QuickBooks Online error codes.
---

# ONL056 Export Error in QuickBooks Online Integration

If you see the error:

ONL056: Expenses must be categorized to a QuickBooks Online account.

This means one or more expenses on the report are not mapped to a valid QuickBooks Online account, preventing the export from completing.

---

## Why the ONL056 Export Error Happens in QuickBooks Online

The ONL056 error typically indicates:

- An expense is missing a category.
- The selected category is no longer synced from QuickBooks Online.
- The category belongs to a different Workspace.
- The category does not exist in the current QuickBooks Online Chart of Accounts.

QuickBooks Online requires all exported expenses to be mapped to valid accounts.

This is a category mapping issue, not a connection issue.

---

## How to Fix the ONL056 Export Error

This issue can be resolved by syncing categories and updating invalid expenses.

### Sync QuickBooks Online Categories

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

This refreshes the Chart of Accounts from QuickBooks Online.

### Recategorize Invalid Expenses

1. Open the affected report.
2. Look for categories highlighted in red.
3. Edit those expenses.
4. Select a valid QuickBooks Online category.
5. Save your changes.

After updating the categories, retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After syncing and updating invalid categories, retry the export. If the error persists, confirm all categories are valid and properly synced.

## Does ONL056 Mean My QuickBooks Connection Is Broken?

No. The connection is active. The export failed because one or more expenses were not mapped to a valid account.

## Do I Need to Reconnect QuickBooks Online?

No. Running **Sync Now** and recategorizing expenses is typically sufficient.
