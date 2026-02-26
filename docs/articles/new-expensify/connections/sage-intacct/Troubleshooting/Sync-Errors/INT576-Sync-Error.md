---
title: INT576 Sync Error: No Expense Types Found in Sage Intacct
description: Learn why the INT576 sync error occurs and how to create Expense Types in Sage Intacct or update the export configuration.
keywords: INT576, no expense types found, Sage Intacct Time and Expenses module, expense report export error, change export type to vendor bill, sync expense types
internalScope: Audience is Workspace Admins managing the Sage Intacct integration. Covers the INT576 sync error related to missing Expense Types in Sage Intacct. Does not cover export validation or permission errors.
---

# INT576 Sync Error: No Expense Types Found in Sage Intacct

If you see the error message:

**“INT576 Sync Error: No Expense Types found. The connection is set to export as Expense Reports, but no ‘expense types’ exist in Sage Intacct.”**

It means the integration is configured to export reimbursable expenses as **Expense Reports**, but there are no Expense Types created in Sage Intacct.

---

## Why the INT576 Sync Error Happens

The INT576 sync error occurs when:

- The export type is set to **Expense Reports**, and  
- No Expense Types exist in the **Time and Expenses** module in Sage Intacct  

Expense Types are required to export expense reports. If they do not exist, the sync cannot complete.

---

# How to Fix the INT576 Sync Error

You can resolve this by creating Expense Types or changing the export type.

---

## Option 1: Create Expense Types in Sage Intacct

1. Log in to Sage Intacct.  
2. Go to **Applications > Time and Expenses**.  
3. Create the required **Expense Types**.  
4. Save your changes.  

Then:

1. Go to **Workspace > [Workspace Name] > Accounting**.  
2. Click the three-dot icon next to the Sage Intacct connection.  
3. Select **Sync Now** from the dropdown.  

If Expense Types exist, the sync should complete successfully.

---

## Option 2: Change the Export Type to Vendor Bill

If you do not use the Time and Expenses module:

1. Go to **Workspace > [Workspace Name] > Accounting > Export**.  
2. Change the export type from **Expense Report** to **Vendor Bill**.  
3. Save your changes.  

Retry the sync.

---

# FAQ

## Do I need the Time and Expenses module to export expense reports?

Yes. Expense Types must exist in the Time and Expenses module to export as Expense Reports.

## When should I use Vendor Bill instead?

If you do not use the Time and Expenses module in Sage Intacct, exporting as **Vendor Bill** is typically the correct configuration.

## Does this error affect existing reports?

The error prevents syncing configuration data. Once Expense Types are created or the export type is updated, reports can be exported normally.
