---
title: Resolve the BC52 Export Error in Dynamics 365 Business Central
description: Learn what the BC52 export error means and how to select a journal batch in the Dynamics 365 Business Central Expensify setup.
keywords: [BC52, BC52 export error, Business Central no journal batch selected, Expensify assisted setup, Business Central general journal, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection. Covers resolving BC52 when the Expensify setup has no journal batch selected. Does not cover a missing Expensify setup (BC67) or other journal posting errors.
contentType: task
platform: [web, mobile]
order: 52
---

# Resolve the BC52 Export Error in Dynamics 365 Business Central

## What the BC52 export error means

If a report or the **Accounting** page shows this error:

> BC52 Export Error: The Expensify setup of this Business Central company has no journal batch selected. Choose one in the Expensify assisted setup in Business Central, then try again.

Expensify can't create general journal lines until the connected Business Central company has a journal batch selected.

Despite its **Export Error** label, BC52 can also appear while syncing reimbursements or Expensify Card settlements, which use general journal lines.

## Why the BC52 export error happens

The Expensify extension doesn't return a journal batch for the company. The batch selection may be missing or may reference a batch that no longer exists.

## How to fix the BC52 export error in Business Central

1. In Business Central, switch to the company connected to your Expensify workspace.
2. Open the Expensify assisted setup and select a valid general journal template and batch.
3. Use a batch dedicated to Expensify. When **Posting mode** is **Create and post**, Expensify posts every open journal in that batch.
4. If a report export failed, open the report in Expensify and export it again.

If BC52 appeared during a sync, sync again instead of exporting the report. In Expensify's navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**. Select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now**.

If the error ends with **records already created in Business Central**, contact Concierge before exporting again. Some purchase invoices may already exist, even though the journal export failed. Learn how to [recover an incomplete Business Central export](/articles/new-expensify/connections/business-central/Troubleshooting/Export-Errors/Recover-Incomplete-Exports).

## When to contact Concierge

Contact Concierge if a valid batch is selected but BC52 still appears. Include the report link and the full error.
