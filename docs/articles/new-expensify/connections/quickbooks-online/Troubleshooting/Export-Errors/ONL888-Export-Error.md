---
title: ONL888 Export Error in QuickBooks Online
description: Learn how to fix the ONL888 export error in QuickBooks Online when exporting to a closed reporting period.
keywords: ONL888, QuickBooks Online closed reporting period, reporting period is closed, reopen accounting period, change export date, export by bank posting date, Expensify QuickBooks Online export error, Workspace Admin, accounting export error
internalScope: Audience is Workspace Admins using QuickBooks Online integration. Covers fixing the ONL888 export error caused by closed reporting periods. Does not cover other export error codes.
---

# ONL888 Export Error in QuickBooks Online

If you see the error:

ONL888: Export not completed. Reporting period is closed in QuickBooks Online. Reopen the period or change the export date in workspace configurations.

This means the report is attempting to export into a closed reporting period in QuickBooks Online.

---

## Why the ONL888 Export Error Happens in QuickBooks Online

The ONL888 error occurs when:

- The export date falls within a closed reporting period in QuickBooks Online.
- The accounting period has been locked to prevent changes.
- Non-reimbursable expenses are exported as credit card transactions, which post by bank posting date and may fall within a closed period.

QuickBooks Online blocks transactions from being added to closed periods.

---

## Option One: Reopen the Closed Reporting Period in QuickBooks Online

If you want to export using the original report date:

1. Log in to QuickBooks Online.
2. Go to **Settings**.
3. Locate the accounting or advanced settings related to closing the books.
4. Reopen the closed reporting period.

After reopening the period, refresh the connection in Expensify.

### How to Sync QuickBooks Online in Expensify

#### On Web

1. Go to the **Workspaces** navigation tab on the left.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the **three-dot icon** next to the QuickBooks Online connection.
5. Select **Sync now**.

#### On Mobile

1. Tap the **Workspaces** navigation tab on the bottom.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the **three-dot icon** next to the QuickBooks Online connection.
5. Tap **Sync now**.

Retry exporting the report after the sync completes.

---

## Option Two: Change the Export Date in Expensify

If you prefer not to reopen the accounting period, change the export date.

### On Web

1. Go to the **Workspaces** navigation tab on the left.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Export**.
5. Select a different export date option that falls outside the closed reporting period:
   - Date of last expense
   - Submitted date
   - Exported date
6. Click **Save**.

### On Mobile

1. Tap the **Workspaces** navigation tab on the bottom.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Export**.
5. Select a different export date option that falls outside the closed reporting period:
   - Date of last expense
   - Submitted date
   - Exported date
6. Tap **Save**.

Retry exporting the report.

---

## Important Note About Credit Card Exports

If exporting non-reimbursable expenses as credit card transactions:

- The transaction posts by bank posting date.
- If the bank posting date falls within a closed reporting period, the period must be reopened in QuickBooks Online.
- Changing the export date setting will not override the bank posting date.

---

# FAQ

## Can I Export Into a Closed Reporting Period?

No. QuickBooks Online does not allow transactions to post into a closed period unless it is reopened.

## Which Export Date Options Can I Use?

You can choose:

- Date of last expense
- Submitted date
- Exported date

Select the option that falls outside the closed reporting period to complete the export.
