---
title: Resolve the BC95 Export Error in Dynamics 365 Business Central
description: Learn how to resolve the BC95 export error by matching a reimbursable report's submitter to a Dynamics 365 Business Central vendor.
keywords: [BC95, BC95 export error, no Business Central vendor matches submitter, reimbursable purchase invoice, vendor email, workspace admin]
internalScope: Audience is workspace admins exporting reimbursable purchase invoices to Dynamics 365 Business Central. Covers resolving BC95 through a vendor email match and connection sync. Does not cover employee matching for journals (BC54), company card vendors (BC96), or reimbursement payment sync (BC99).
contentType: task
platform: [web, mobile]
order: 95
---

# Resolve the BC95 Export Error in Dynamics 365 Business Central

## What the BC95 export error means

If a report shows this error:

> BC95 Export Error: No Business Central vendor matches submitter [email]. Add a vendor with that email in Business Central, sync the connection, and try exporting again.

Expensify can't find an imported Business Central vendor whose email matches the submitter of the reimbursable expenses.

## Why the BC95 export error happens

Reimbursable purchase invoices use the report submitter's vendor record. That vendor may be missing, use another email, or not have synced yet.

The expense's merchant name and **Default company card vendor** don't determine the vendor for reimbursable expenses.

## How to fix the BC95 export error in Business Central

1. In the connected Business Central company, search for **Vendors**.
2. Open the submitter's vendor card, or create one if needed.
3. Confirm its email matches the submitter's email in Expensify and **Blocked** isn't **All**.
4. In Expensify's navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
5. Select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now**.
6. Open the report and export it again.

Only change a vendor's blocked status with your accounting team's approval.

## When to contact Concierge

Contact Concierge if an eligible vendor with the matching email has synced but BC95 still appears.
