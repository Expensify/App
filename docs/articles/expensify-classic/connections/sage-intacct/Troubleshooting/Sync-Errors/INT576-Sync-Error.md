---
title: INT576 Sync Error in Sage Intacct Integration
description: Learn what the INT576 sync error means and how to create Expense Types in Sage Intacct or change the export type before retrying.
keywords: INT576, Sage Intacct no Expense Types found, Intacct Time and Expenses module, export as Expense Report Intacct, Vendor Bill export Intacct, Expensify Sage Intacct integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT576 sync error caused by missing Expense Types in the Time and Expenses module or incorrect export type configuration. Does not cover authentication or dimension errors.
---

# INT576 Sync Error in Sage Intacct Integration

If you see the error:

INT576 Sync Error: No Expense Types found. The connection in Expensify is set to export as Expense Reports, but no 'expense types' exist in Sage Intacct.

This means the Workspace is configured to export as **Expense Reports**, but Sage Intacct does not have any Expense Types created.

Sage Intacct requires Expense Types in the **Time and Expenses** module when exporting as Expense Reports.

---

## Why the INT576 Sync Error Happens in Sage Intacct

The INT576 error typically indicates:

- The export type in the Workspace is set to **Expense Report**.
- No Expense Types exist in the **Time and Expenses** module in Sage Intacct.
- Sage Intacct cannot process expense report exports without configured Expense Types.

Without Expense Types, the sync and export cannot proceed.

This is an export type or Expense Type configuration issue, not an authentication or dimension error.

---

## How to Fix the INT576 Sync Error

You can resolve this by creating Expense Types in Sage Intacct or changing the export type.

---

## Create Expense Types in Sage Intacct for Expense Report Exports

If you plan to export as **Expense Reports**:

### Create Expense Types in the Time and Expenses Module

1. Log in to Sage Intacct.
2. Go to **Applications > Time and Expenses**.
3. Create the required **Expense Types**.
4. Click **Save**.

### Sync the Workspace in Expensify

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

After syncing, retry exporting the report.

---

## Change the Export Type to Vendor Bill

If you are not using the Time and Expenses module in Sage Intacct:

### Update the Export Type in the Workspace

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Export** tab.
6. Change the export type from **Expense Report** to **Vendor Bill**.
7. Click **Save**.

### Sync and Retry the Export

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.
5. Retry exporting the report.

---

# FAQ

## Do I Need to Use the Time and Expenses Module?

Only if you plan to export as Expense Reports. If not, configure the export type as **Vendor Bill**.

## Do I Need Sage Intacct Admin Access to Fix This?

You need sufficient permissions in Sage Intacct to create Expense Types in the Time and Expenses module.

## Does This Error Affect Vendor Bill Exports?

No. This error only occurs when exporting as Expense Reports without Expense Types configured.
