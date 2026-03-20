---
title: INT035 Export Error in Sage Intacct Integration
description: Learn what the INT035 export error means in Sage Intacct and how to update the export date or reopen a closed accounting period to restore successful exports.
keywords: INT035, Sage Intacct export error, closed accounting period Intacct, export date must be on or after, reopen period Sage Intacct, Expensify Sage Intacct integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT035 export error caused by closed accounting periods or export date configuration. Does not cover authentication or user permission errors.
---

# INT035 Export Error in Sage Intacct Integration

If you see the error:

INT035 Export Error: Export not completed. Date associated with export must be on or after [MM/dd/yyyy]. Reopen the period or change the export date in workspace configurations.

This means the export date falls within a **closed accounting period** in Sage Intacct, preventing the export from completing.

Sage Intacct does not allow transactions to post to closed periods.

---

## Why the INT035 Export Error Happens in Sage Intacct

The INT035 error typically indicates:

- The report date or selected export date falls within a closed accounting period.
- The General Ledger or a required sub-ledger is closed for that period.
- Sage Intacct validation failed due to posting restrictions on closed periods.

If the accounting period is closed, Sage Intacct blocks the export.

This is an accounting period configuration issue, not a report approval or dimension mapping error.

---

## How to Fix the INT035 Export Error

You can resolve this by updating the export date or reopening the accounting period in Sage Intacct.

### Change the Export Date in Expensify

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Export** tab.
6. In the **Date** field, select **Exported Date**.
7. Click **Save**.

Retry exporting the report.

### Reopen the Accounting Period in Sage Intacct

1. Log in to Sage Intacct.
2. Locate the closed accounting period.
3. Reopen the appropriate period in:
   - **General Ledger**
   - **Cash Management**
   - **Accounts Payable**
   - **Time & Expense**
4. Save your changes.

After reopening the period:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

# FAQ

## Should I Reopen the Accounting Period or Change the Export Date?

Changing the export date to **Exported Date** is often the simplest solution. Reopening a period should only be done if it aligns with your accounting policies.

## Do I Need Sage Intacct Admin Access?

You need sufficient permissions in Sage Intacct to reopen accounting periods or update ledger settings.
