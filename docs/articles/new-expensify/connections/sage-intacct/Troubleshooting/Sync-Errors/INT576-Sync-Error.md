---
title: INT576 Sync Error in Sage Intacct Integration
description: Learn what the INT576 sync error means and how to create Expense Types in Sage Intacct or update the export configuration.
keywords: INT576, no expense types found Sage Intacct, Time and Expenses module error, expense report export error, change export type to Vendor bill, sync Expense Types, Workspace Admin
internalScope: Audience is Workspace Admins managing the Sage Intacct integration. Covers resolving the INT576 sync error related to missing Expense Types in Sage Intacct. Does not cover export validation or permission errors.
---

# INT576 Sync Error in Sage Intacct Integration

If you see the error:

INT576 Sync Error: No Expense Types found. The connection is set to export as Expense Reports, but no “Expense Types” exist in Sage Intacct.

This means the integration is configured to export reimbursable expenses as **Expense reports**, but there are no Expense Types created in Sage Intacct.

Expense Types are required to export expense reports.

---

## Why the INT576 Sync Error Happens in Sage Intacct

The INT576 error typically occurs when:

- The export type is set to **Expense reports**.
- No Expense Types exist in the **Time and Expenses** module in Sage Intacct.
- The Workspace attempts to sync configuration data.

If Expense Types do not exist, Sage Intacct cannot complete the sync.

This is an Expense Type configuration issue, not a report data or permission issue.

---

# How to Fix the INT576 Sync Error

You can resolve this by creating Expense Types in Sage Intacct or changing the export type.

---

## Create Expense Types in Sage Intacct

1. Log in to Sage Intacct as an administrator.
2. Go to **Applications > Time and Expenses**.
3. Create the required **Expense Types**.
4. Click **Save**.

Then:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

If Expense Types exist, the sync should complete successfully.

---

## Change the Export Type to Vendor Bill in the Workspace

If you do not use the Time and Expenses module:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Locate the reimbursable export configuration.
5. Change the export type from **Expense report** to **Vendor bill**.
6. Click **Save**.
7. Click **Sync Now**.

This allows reimbursable expenses to export without requiring Expense Types.

---

# FAQ

## Do I Need the Time and Expenses Module to Export Expense Reports?

Yes. Expense Types must exist in the Time and Expenses module to export as **Expense reports**.

## When Should I Use Vendor Bill Instead?

If you do not use the Time and Expenses module in Sage Intacct, exporting as **Vendor bill** is typically the correct configuration.

## Does the INT576 Error Affect Existing Reports?

The error prevents syncing configuration data. Once Expense Types are created or the export type is updated, reports can be exported normally.
