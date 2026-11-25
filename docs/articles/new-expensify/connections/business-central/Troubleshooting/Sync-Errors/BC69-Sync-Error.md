---
title: BC69 Sync Error in Dynamics 365 Business Central
description: Learn what the BC69 sync error means and how to match a reimbursed report's submitter to an active Dynamics 365 Business Central employee.
keywords: [BC69, BC69 sync error, no active Business Central employee matches the reimbursed report submitter, Business Central employee email, Business Central inactive employee, Sync reimbursed reports, Dynamics 365 Business Central sync error, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection with Sync reimbursed reports enabled. Covers resolving the BC69 sync error when no active employee matches a reimbursed report's submitter. Does not cover the BC54 export error or reimbursements of reports exported as purchase invoices (BC99).
contentType: task
order: 69
---

# BC69 Sync Error in Dynamics 365 Business Central

If the **Accounting** page shows this error:

> Can't connect to Dynamics 365 Business Central ("Report [report ID]: BC69 Sync Error: No active Business Central employee matches the reimbursed report submitter. Add an active employee with their email in Business Central, then sync again.")

When **Sync reimbursed reports** is enabled, Expensify records each reimbursement in Business Central as a payment to the employee who submitted the report. Business Central doesn't have an active employee with the submitter's email, so Expensify didn't record the reimbursement for this report. Other reports still sync.

The number after **Report** is the report ID. To open the report on web, press **⌘+Shift+G** (Mac) or **Ctrl+Shift+G** (Windows/Linux), then enter the report ID.

## Why the BC69 sync error happens

The BC69 error happens when a report's reimbursable expenses exported as a general journal, and:

- The submitter's employee record in Business Central isn't **Active** anymore. For example, the employee left after the report was exported.
- Neither the email nor the personal email on the employee card matches the submitter's email in Expensify.

Expensify doesn't create employees when it records a reimbursement, even when **Auto-create employees/vendors** is enabled.

## How to fix the BC69 sync error in Business Central

1. In Business Central, search for **Employees** and open the submitter's employee card.
2. Confirm the **Status** is **Active**.
3. Confirm the email or personal email matches the submitter's email in Expensify.
4. In Expensify, select **Workspaces > [workspace name] > Accounting**.
5. Select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now**.

After the reimbursement is recorded, you can change the employee's status back if you need to.

## When to contact Concierge

Contact Concierge if the error still appears after the employee is active and the email matches.

# FAQ

## Why does the Accounting page only show one report?

The **Accounting** page shows the first error of the last sync. If several reports have this problem, fix the one shown and sync again to see the next one.
