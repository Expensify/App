---
title: DESK33 Export Error in QuickBooks Desktop Web Connector
description: Learn how to fix the DESK33 export error in QuickBooks Desktop when expenses are missing a valid QuickBooks account category.
keywords: DESK33, QuickBooks Desktop category required, expense missing account, out-of-workspace category, recategorize expense QuickBooks Desktop, Sync now, Expensify QuickBooks Desktop export error, Workspace Admin
internalScope: Audience is Workspace Admins using QuickBooks Desktop integration with Web Connector. Covers fixing the DESK33 export error caused by missing or invalid expense categories. Does not cover QuickBooks Online errors.
---

# DESK33 Export Error in QuickBooks Desktop Web Connector

If you see the error:

DESK33: All expenses must have a QuickBooks Desktop account selected as the category. Please select an account as the category for all expenses and try export again.

This means one or more expenses on the report are not categorized with a valid QuickBooks Desktop account.

---

## Why the DESK33 Export Error Happens in QuickBooks Desktop

The DESK33 error occurs when:

- An expense does not have a category selected.
- The selected category no longer exists in QuickBooks Desktop.
- The category is outside the Workspace’s synced Chart of Accounts.
- The connection has not been synced after changes in QuickBooks Desktop.

All expenses must be mapped to a valid QuickBooks Desktop account before exporting.

---

## How to Fix Missing or Invalid Categories

### Step One: Sync the QuickBooks Desktop Connection

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync now**.

This refreshes the Chart of Accounts from QuickBooks Desktop.

---

### Step Two: Review the Report for Missing Categories

1. Open the report in Expensify.
2. Look for any categories highlighted in red.
3. Click into each affected expense.
4. Select a valid QuickBooks Desktop account as the category.
5. Save your changes.

All expenses must have an active, synced category before exporting.

---

### Step Three: Retry the Export

1. Open the corrected report.
2. Retry exporting to QuickBooks Desktop.

Once all expenses are categorized correctly, the export should complete successfully.

---

# FAQ

## Does DESK33 Mean My QuickBooks Desktop Connection Is Broken?

No. This error typically indicates that one or more expenses are missing a valid QuickBooks Desktop category.

## Do I Need to Reconnect QuickBooks Desktop?

Not usually. Running **Sync now** and updating the categories resolves the issue in most cases.
