---
title: INT035 Export Error in Sage Intacct Integration
description: Learn what the INT035 export error means and how to change the export date or update permissions when the accounting period is closed in Sage Intacct.
keywords: INT035, Sage Intacct closed accounting period error, export date must be on or after, reopen period Sage Intacct, change export date Workspace Accounting Export, subledger closed Sage Intacct
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT035 export error caused by closed accounting periods and export date configuration. Does not cover tax or employee validation errors.
---

# INT035 Export Error in Sage Intacct Integration

If you see the error:

INT035 Export Error: Export not completed. Date associated with export must be on or after [MM/dd/yyyy]. Reopen the period or change the export date in workspace configurations.

This means the export date falls within a closed accounting period in Sage Intacct.

Sage Intacct does not allow transactions to post to closed periods.

---

## Why the INT035 Export Error Happens in Sage Intacct

The INT035 error typically occurs when:

- The report date (such as **Submitted Date** or **Date of Last Expense**) falls within a closed accounting period.
- The selected export date setting in the Workspace uses a date tied to that closed period.
- Sage Intacct prevents new transactions from posting to closed periods.

This commonly happens when accounting periods are closed before reports are exported.

This is a period configuration issue, not a connection or credential issue.

---

# How to Fix the INT035 Export Error

You can resolve this by changing the export date or adjusting period permissions.

---

## Change the Export Date in the Workspace

Using **Exported Date** ensures the transaction posts to the current open period.

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Export** tab.
6. In the **Date** field, select **Exported Date**.
7. Click **Save**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Configure**.
5. Open the **Export** tab.
6. Select **Exported Date**.
7. Tap **Save**.

Then:

1. Click **Sync Now**.
2. Retry exporting the report.

---

## Allow Posting to the Next Open Period in Sage Intacct

If you prefer Sage Intacct to automatically post to the next open period:

1. Log in to Sage Intacct as an administrator.
2. Grant the integration user **Open and Close Books** permissions.
3. Save your changes.

Then in the Workspace:

1. Go to **Workspaces > Accounting**.
2. Click **Sync Now**.
3. Retry the export.

---

# Additional Troubleshooting for Closed Periods

If the error continues, confirm that all required modules are open for the period.

In Sage Intacct, verify the following are open at the appropriate level (top level or entity level):

- **General Ledger**
- **Cash Management**
- **Accounts Payable**
  - Located under **Accounts Payable > Subledger > Open**
- **Time & Expense**
  - Located under **Time & Expenses > Subledger**

If any required subledger is closed, the export will fail.

---

# FAQ

## Do I Need to Reopen the Accounting Period?

Not necessarily. Changing the export date to **Exported Date** is often the simplest solution.

## Does This Error Mean the Integration Is Disconnected?

No. The integration is working correctly. Sage Intacct is preventing transactions from posting to a closed period.

## What If Only Some Modules Are Closed?

If any required subledger (such as Accounts Payable or Cash Management) is closed, the export can still fail. Ensure all relevant modules are open for the reporting period.
