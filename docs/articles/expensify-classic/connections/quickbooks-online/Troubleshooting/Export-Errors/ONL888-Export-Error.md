---
title: ONL888 Export Error in QuickBooks Online Integration
description: Learn what the ONL888 export error means in QuickBooks Online and how to reopen a closed reporting period or adjust the export date to restore successful exports.
keywords: ONL888, QuickBooks Online export error, reporting period closed QuickBooks, reopen accounting period QuickBooks, change export date QuickBooks, Expensify QuickBooks Online integration, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers resolving the ONL888 export error caused by closed reporting periods in QuickBooks Online. Does not cover other QuickBooks Online error codes.
---

# ONL888 Export Error in QuickBooks Online Integration

If you see the error:

ONL888: Reporting period is closed in QuickBooks Online.

This means the report is attempting to post to a closed accounting period in QuickBooks Online, preventing the export from completing.

---

## Why the ONL888 Export Error Happens in QuickBooks Online

The ONL888 error typically indicates:

- The export date falls within a closed reporting period.
- The posting date corresponds to a locked accounting period.
- QuickBooks validation failed because transactions cannot post to closed periods.

QuickBooks Online does not allow transactions to post to closed accounting periods.

This is an accounting period restriction, not a Workspace configuration issue.

---

## How to Fix the ONL888 Export Error

You can resolve this by reopening the period or adjusting the export date.

### Reopen the Closed Reporting Period

1. Log in to QuickBooks Online.
2. Navigate to your accounting period settings.
3. Reopen the closed reporting period.
4. Save your changes.

After reopening the period:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

### Change the Export Date in Expensify

If you prefer not to reopen the period:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Export** tab.
6. Select a different export date option:
   - **Date of Last Expense**
   - **Submitted Date**
   - **Exported Date**
7. Click **Save**.

Then retry exporting the report.

---

## Important: Credit Card Transactions

If exporting non-reimbursable expenses as **Credit Card Transactions**, the reporting period must be reopened.

Credit card transactions export using the bank posting date, which cannot be overridden by changing export date settings.

---

# FAQ

## Can I Retry the Export?

Yes. After reopening the period or updating the export date and selecting **Sync Now**, retry the export.

## Does ONL888 Mean My QuickBooks Connection Is Broken?

No. The connection is active. The transaction attempted to post to a closed reporting period.

## Do I Need to Reconnect QuickBooks Online?

No. Reopening the reporting period or adjusting export date settings is typically sufficient.
