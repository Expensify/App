---
title: BC67 Sync Error in Dynamics 365 Business Central
description: Learn what the BC67 sync error means and how to complete Expensify Assisted Setup for the Dynamics 365 Business Central company you sync with.
keywords: [BC67, BC67 sync error, Business Central company has no Expensify setup, Expensify Assisted Setup, Business Central subsidiary, journal batch setup, workspace admin]
internalScope: Audience is workspace admins connecting or syncing Dynamics 365 Business Central. Covers resolving the BC67 sync error when the selected company hasn't completed Expensify Assisted Setup. Does not cover installing the Expensify extension (BC28), rejected credentials (BC04), or a setup without a journal batch (BC52).
contentType: task
order: 67
---

# BC67 Sync Error in Dynamics 365 Business Central

If the **Accounting** page shows this error:

> Can't connect to Dynamics 365 Business Central ("BC67 Sync Error: This Business Central company has no Expensify setup. Run the Expensify assisted setup in Business Central, then try again.")

The Expensify extension is installed, but no one completed **Expensify Assisted Setup** for the company that Expensify syncs with. That setup chooses the journal batch, templates, and number series Expensify uses to create records, so Expensify can't sync without it.

## Why the BC67 sync error happens

Each Business Central company needs its own Expensify setup. The BC67 error usually happens when:

- The wizard was closed before it finished.
- Your environment has several companies, and the setup was completed in a different company than the one selected as the **Subsidiary** in Expensify.
- The **Subsidiary** in Expensify was changed to a company that wasn't set up yet.

## How to check which company Expensify syncs with

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
2. Under **Dynamics 365 Business Central**, check the company shown under **Subsidiary**.

## How to fix the BC67 sync error in Business Central

1. In Business Central, open the company shown under **Subsidiary** in Expensify.
2. Search for **Assisted Setup**, then open **Expensify Assisted Setup**.
3. Complete the wizard, including the journal batch, templates, and number series.
4. In Expensify, select **Workspaces > [workspace name] > Accounting**.
5. Select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now**.

If the error appeared while you were connecting Business Central for the first time, Expensify didn't keep the details you entered. Select **More (⋮)** next to **Dynamics 365 Business Central**, select **Disconnect**, then connect again. Learn how to [connect to Business Central](/articles/new-expensify/connections/business-central/Connect-to-Business-Central).

## When to contact Concierge

Contact Concierge if the error still appears after you complete Expensify Assisted Setup for the selected company.
