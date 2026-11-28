---
title: Resolve the BC78 Export Error in Dynamics 365 Business Central
description: Learn how to resolve the BC78 export error when Expensify can't read the Dynamics 365 Business Central company's base currency.
keywords: [BC78, BC78 export error, Business Central base currency, LCY Code, General Ledger Setup, local currency, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection. Covers resolving BC78 when the company's local currency code is missing from the response. Does not cover zero expense amounts (BC80), invalid currency factors (BC81), or reimbursement sync (BC79).
contentType: task
platform: [web, mobile]
order: 78
---

# Resolve the BC78 Export Error in Dynamics 365 Business Central

## What the BC78 export error means

If a report or the **Accounting** page shows this error:

> BC78 Export Error: Could not read the Business Central company base currency. Check its LCY Code in General Ledger Setup and try again.

Expensify can't read the connected company's local currency, also called its base currency or LCY. It needs that currency before preparing an export.

Despite its **Export Error** label, BC78 can also appear while syncing reimbursements or Expensify Card settlements.

## Why the BC78 export error happens

Business Central returns no General Ledger Setup record, or the record doesn't contain a local currency code.

## How to fix the BC78 export error in Business Central

1. In Business Central, switch to the company connected to your Expensify workspace.
2. Search for **General Ledger Setup** and check **LCY Code**.
3. Ask your Business Central admin to confirm the field contains the company's correct local currency code.
4. If a report export failed, open the report in Expensify and export it again.

If BC78 appeared during a sync, sync again instead. In Expensify's navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**. Select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now**.

Don't change an established company's base currency just to clear this error. If **LCY Code** is already correct, contact Concierge.

## When to contact Concierge

Contact Concierge if **LCY Code** is populated correctly but BC78 still appears. Include the report link and company name.
