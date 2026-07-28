---
title: ONL022 Export Error in QuickBooks Online
description: Learn how to fix the ONL022 export error in QuickBooks Online by marking the correct account as billable and syncing your Workspace in Expensify.
keywords: ONL022, QuickBooks Online error, export billable expenses, mark account as billable, QuickBooks Online billable setting, Expensify QuickBooks Online sync, Sync now, Workspace Admin, accounting export error
internalScope: Audience is Workspace Admins using QuickBooks Online integration. Covers fixing the ONL022 export error caused by non-billable accounts. Does not cover other export error codes.
---

# ONL022 Export Error in QuickBooks Online

If you see the error:

ONL022: To export billable expenses, ensure the account in QuickBooks Online is marked as billable.

This means the account category used on an expense in Expensify is not marked as billable in QuickBooks Online.

---

## Why the ONL022 Export Error Happens in QuickBooks Online

The ONL022 error appears when:

- An expense in Expensify is coded to an account.
- That account in QuickBooks Online is not enabled for billable expenses.
- You attempt to export the report to QuickBooks Online.

QuickBooks Online requires accounts tied to billable expenses to be marked as billable and linked to an income account.

---

## How to Enable Billable Expenses in QuickBooks Online

First, confirm that billable expenses are enabled in QuickBooks Online.

1. In QuickBooks Online, click the Gear icon in the upper-right corner.
2. Select Account and Settings.
3. Click Expenses.
4. Turn on Make expenses and items billable.
5. Click Save, then Done.

If this setting is already enabled, move to the next section.

---

## How to Mark an Account as Billable in QuickBooks Online

After enabling billable expenses, make sure the specific account used in Expensify is set up correctly.

1. In QuickBooks Online, go to Chart of Accounts.
2. Find the account used on the expense.
3. Click Edit.
4. Ensure the account supports billable expenses.
5. Select the appropriate Income account for billable tracking.
6. Click Save.

Once updated, return to Expensify to resync.

---

## How to Sync QuickBooks Online in Expensify

After updating settings in QuickBooks Online, resync your connection in Expensify.

### On Web

1. Go to the Workspaces navigation tab on the left.
2. Select your Workspace.
3. Click Accounting.
4. Click the three-dot icon next to the QuickBooks Online connection.
5. Select Sync now.

### On Mobile

1. Tap the Workspaces navigation tab on the bottom.
2. Select your Workspace.
3. Tap Accounting.
4. Tap the three-dot icon next to the QuickBooks Online connection.
5. Tap Sync now.

After the sync completes, try exporting the report again.

---

## How to Re-Export a Report to QuickBooks Online After Fixing ONL022

1. Open the report that previously failed.
2. Click Export to QuickBooks Online.
3. Confirm the export.

If the account is now correctly marked as billable in QuickBooks Online, the export should succeed.

---

# FAQ

## Does the ONL022 Export Error Affect All Expenses?

No. The ONL022 error only affects expenses coded to accounts that are not enabled for billable expenses in QuickBooks Online.

## Do I Need to Reconnect QuickBooks Online to Fix ONL022?

No. In most cases, you only need to:

- Update the account settings in QuickBooks Online.
- Run Sync now in Expensify.

You do not need to disconnect and reconnect the integration.
