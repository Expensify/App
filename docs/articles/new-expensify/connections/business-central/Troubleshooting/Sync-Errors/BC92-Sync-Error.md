---
title: BC92 Sync Error in Dynamics 365 Business Central
description: Learn what the BC92 sync error means and how to choose a default company card vendor so Expensify can record Expensify Card settlements in Dynamics 365 Business Central.
keywords: [BC92, BC92 sync error, select a default vendor for company card expenses, Business Central default company card vendor, Expensify Card settlements, Dynamics 365 Business Central sync error, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection with the Expensify Card. Covers resolving the BC92 sync error when no default company card vendor is selected and company card expenses export as purchase invoices. Does not cover vendor matching on individual expenses or export errors on reports.
contentType: task
order: 92
---

# BC92 Sync Error in Dynamics 365 Business Central

If the **Accounting** page shows this error:

> Can't connect to Dynamics 365 Business Central ("BC92 Sync Error: Select a default vendor for company card expenses in the export settings, so Expensify Card settlements can be recorded against it.")

When company card expenses export as purchase invoices, Expensify records each Expensify Card settlement as a payment to the **Default company card vendor**. No default vendor is selected, so Expensify doesn't record Expensify Card settlements until you fix it. The rest of the sync still runs.

## Why the BC92 sync error happens

The BC92 error happens when **Export company card expenses as** is **Purchase invoices**, **Sync Expensify Card settlements** is enabled, and:

- No **Default company card vendor** is selected.
- The selected vendor was deleted in Business Central.

## How to fix the BC92 sync error in Business Central

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
2. Select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now** to import the latest vendors.
3. Under **Dynamics 365 Business Central**, select **Export**.
4. Select **Default company card vendor**, then choose the vendor to use for company card expenses that don't match a vendor. Expensify also records Expensify Card settlements against this vendor.
5. Go back to the **Accounting** page, select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now**.

The next sync records the settlements that weren't recorded while the error was showing.

## When to contact Concierge

Contact Concierge if the error still appears after you select a **Default company card vendor** and sync.
