---
title: DESK33 Export Error in QuickBooks Desktop Integration
description: Learn what the DESK33 export error means and how to ensure all expenses have a valid QuickBooks Desktop account selected before exporting.
keywords: DESK33, QuickBooks Desktop account not selected, missing category QuickBooks Desktop, recategorize expense QuickBooks export, Expensify QuickBooks Desktop export error, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Desktop integration. Covers resolving the DESK33 export error related to missing or invalid categories. Does not cover connection or permissions errors.
---

# DESK33 Export Error in QuickBooks Desktop Integration

If you see the error:

DESK33 Export Error: All expenses must have a QuickBooks Desktop account selected as the category. Please select an account as the category for all expenses and try export again.

This means one or more expenses on the report do not have a valid QuickBooks Desktop account selected as the category.

Every expense must be assigned to an account that exists in QuickBooks Desktop.

---

## Why the DESK33 Export Error Happens in QuickBooks Desktop

The DESK33 error typically occurs when:

- An expense is missing a category.
- The selected category no longer exists in QuickBooks Desktop.
- The category was removed from the Workspace.
- The Workspace has not synced after changes were made in QuickBooks.

If any expense does not have a valid QuickBooks Desktop account selected, the export will fail.

This is a category selection issue, not a connection issue.

---

# How to Fix the DESK33 Export Error

Follow the steps below to refresh categories and update the report.

---

## Run Sync in the Workspace

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot icon next to the QuickBooks Desktop connection.
5. Click **Sync now**.

This refreshes the account list from QuickBooks Desktop.

---

## Recategorize Flagged Expenses

1. Open the report that failed to export.
2. Look for expenses highlighted in red.
3. Edit each affected expense.
4. Select a valid QuickBooks Desktop account as the category.
5. Click **Save**.

Ensure every expense has a category selected before retrying the export.

---

## Retry the Export

1. Open the report.
2. Retry exporting to QuickBooks Desktop.

If all expenses have valid categories, the export should complete successfully.

---

# FAQ

## Does the DESK33 Error Affect Only One Expense?

It can affect one or multiple expenses. Every expense on the report must have a valid QuickBooks Desktop category.

## Do I Need to Reconnect the Integration?

No. Running **Sync now** and recategorizing the affected expenses is usually sufficient.

## Why Are Categories Highlighted in Red?

Categories are highlighted in red when they are missing or no longer valid in QuickBooks Desktop.
