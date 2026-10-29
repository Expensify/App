---
title: ONL056 Export Error in QuickBooks Online
description: Learn how to fix the ONL056 export error in QuickBooks Online by syncing your Workspace and categorizing all expenses to a valid QuickBooks Online account.
keywords: ONL056, QuickBooks Online export error, expenses must be categorized, missing category, out-of-workspace category, Sync now, Expensify QuickBooks Online sync, recategorize expense, Workspace Admin, accounting export error
internalScope: Audience is Workspace Admins using QuickBooks Online integration. Covers fixing the ONL056 export error caused by missing or invalid categories. Does not cover other export error codes.
---

# ONL056 Export Error in QuickBooks Online

If you see the error:

ONL056: Expenses must be categorized to a QuickBooks Online account.

This means at least one expense on the report is not mapped to a valid QuickBooks Online account.

---

## Why the ONL056 Export Error Happens in QuickBooks Online

The ONL056 error occurs when:

- An expense is missing a category, or
- The category used is no longer synced with QuickBooks Online, or
- The category is outside of the Workspace’s current accounting setup.

Every expense must be categorized to a valid QuickBooks Online account before it can be exported.

---

## How to Sync QuickBooks Online in Expensify

First, refresh your QuickBooks Online connection to make sure all accounts are up to date.

### On Web

1. Go to the **Workspaces** navigation tab on the left.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the **three-dot icon** next to the QuickBooks Online connection.
5. Select **Sync now**.

### On Mobile

1. Tap the **Workspaces** navigation tab on the bottom.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the **three-dot icon** next to the QuickBooks Online connection.
5. Tap **Sync now**.

After the sync completes, review the report.

---

## How to Fix Missing or Invalid Categories on a Report

1. Open the report that failed to export.
2. Look for expenses with categories highlighted in red.
3. Click each highlighted expense.
4. Select a valid category that maps to a QuickBooks Online account.
5. Save the changes.

All expenses must have a valid, synced category before exporting.

---

## How to Re-Export a Report After Fixing ONL056

1. Open the corrected report.
2. Click **Export to QuickBooks Online**.
3. Confirm the export.

If all expenses are categorized to valid QuickBooks Online accounts, the export should succeed.

---

# FAQ

## Does ONL056 Mean My QuickBooks Online Connection Is Broken?

Not necessarily. In most cases, the issue is caused by:

- A missing category.
- A category that was deleted or renamed in QuickBooks Online.
- A category that has not been synced recently.

Running **Sync now** and updating categories typically resolves the issue.

## Do All Expenses Need a Category Before Exporting?

Yes. Every expense must be categorized to a valid QuickBooks Online account before it can be exported.
