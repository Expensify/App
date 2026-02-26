---
title: INT035 Export Error: Export Date Falls in a Closed Accounting Period
description: Learn why the INT035 export error occurs and how to update the export date or permissions when the accounting period is closed in Sage Intacct.
keywords: INT035, closed accounting period Sage Intacct, export date on or after error, reopen period Sage Intacct, change export date workspace, subledger closed error
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers the INT035 export error related to closed accounting periods and export date configuration. Does not cover tax or employee validation errors.
---

# INT035 Export Error: Export Date Falls in a Closed Accounting Period

If you see the error message:

**“INT035 Export Error: Export not completed. Date associated with export must be on or after [MM/dd/yyyy]. Reopen the period or change the export date in workspace configurations.”**

It means the export date falls within a closed accounting period in Sage Intacct.

Sage Intacct does not allow transactions to post to closed periods.

---

## Why the INT035 Export Error Happens

The INT035 export error occurs when:

- The report date (such as submitted date or last expense date) falls within a closed accounting period, and  
- Sage Intacct prevents new transactions from being created in that period  

This commonly happens when accounting periods are closed before reports are exported.

---

# How to Fix the INT035 Export Error

You can resolve this by changing the export date or updating permissions.

---

## Option 1: Change the Export Date in the Workspace

1. Go to **Workspace > [Workspace Name] > Accounting > Export**.  
2. In the **Date** field, select **Exported Date**.  
3. Click **Save**.  

Retry exporting the report.

Using **Exported Date** ensures the transaction posts to the current open period instead of the original report date.

---

## Option 2: Update Permissions in Sage Intacct

If you want Sage Intacct to automatically post to the next open period:

1. Log in to Sage Intacct.  
2. Update permissions to provide the integration user with **Open and Close** permissions.  

This allows the connection to recognize closed periods and automatically post expenses to the next open period.

Then:

1. Go to **Workspaces > [Workspace Name] > Accounting**.  
2. Click the three-dot icon next to the connection.  
3. Select **Sync Now** from the dropdown.  

Retry exporting the report.

---

# Additional Troubleshooting

If the error continues, confirm that subledgers are open for the period in question.

In Sage Intacct, verify the following are open at the appropriate level (top level or entity level):

- **General Ledger**  
- **Cash Management**  
- **Accounts Payable**  
  - Configured under **Accounts Payable > Subledger > Open**  
- **Time & Expense**  
  - Configured under **Time & Expenses > Subledger**  

Also confirm whether the Workspace is syncing at the top level or entity level:

1. Go to **Workspace > [Workspace Name] > Accounting > Export**.  
2. Confirm the selected sync level matches your Sage Intacct configuration.

---

# FAQ

## Do I need to reopen the accounting period?

Not necessarily. Changing the export date to **Exported Date** is often the simplest solution.

## Does this error mean the integration is disconnected?

No. The integration is working, but Sage Intacct is preventing transactions from posting to a closed period.

## What if only some modules are closed?

If any required subledger (such as Accounts Payable or Cash Management) is closed, the export can still fail. Ensure all relevant modules are open for the reporting period.
