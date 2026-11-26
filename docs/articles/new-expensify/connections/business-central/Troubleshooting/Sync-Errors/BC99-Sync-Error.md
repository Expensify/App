---
title: BC99 Sync Error in Dynamics 365 Business Central
description: Learn what the BC99 sync error means and how to match a reimbursed report's submitter to a Dynamics 365 Business Central vendor.
keywords: [BC99, BC99 sync error, no Business Central vendor matches the reimbursed report submitter, Business Central vendor email, Sync reimbursed reports, purchase invoices, Dynamics 365 Business Central sync error, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection with Sync reimbursed reports enabled. Covers resolving the BC99 sync error when no vendor matches the submitter of a reimbursed report that exported as purchase invoices. Does not cover the BC95 export error or reimbursements of reports exported as general journals (BC69).
contentType: task
order: 99
---

# BC99 Sync Error in Dynamics 365 Business Central

If the **Accounting** page shows this error:

> Can't connect to Dynamics 365 Business Central ("Report [report ID]: BC99 Sync Error: No Business Central vendor matches the reimbursed report submitter. Add a vendor with their email in Business Central, then sync again.")

When **Sync reimbursed reports** is enabled, Expensify records each reimbursement in Business Central as a payment. For reports exported as purchase invoices, the payment goes to the vendor whose email matches the submitter's. Business Central doesn't have that vendor, so Expensify didn't record the reimbursement for this report. Other reports still sync.

The number after **Report** is the report ID. To open the report on web, press **⌘+Shift+G** (Mac) or **Ctrl+Shift+G** (Windows/Linux), then enter the report ID.

## Why the BC99 sync error happens

The BC99 error happens when a report's reimbursable expenses exported as purchase invoices, and no vendor in Business Central has the submitter's email. For example, the vendor was deleted or its email changed after the report was exported.

## How to fix the BC99 sync error in Business Central

1. In Business Central, search for **Vendors** and open the vendor for the submitter. If there isn't one, create it.
2. Confirm the vendor's email matches the submitter's email in Expensify.
3. In Expensify, select **Workspaces > [workspace name] > Accounting**.
4. Select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now**.

## When to contact Concierge

Contact Concierge if the error still appears after a vendor has the submitter's email.

# FAQ

## Why does the Accounting page only show one report?

The **Accounting** page shows the first error of the last sync. If several reports have this problem, fix the one shown and sync again to see the next one.
