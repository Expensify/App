---
title: Resolve the BC93 Export Error in Dynamics 365 Business Central
description: Learn how to fix the BC93 export error by selecting categories imported from Dynamics 365 Business Central for every expense.
keywords: [BC93, BC93 export error, Business Central account selected as category, missing category, invalid expense category, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection. Covers resolving BC93 when expenses lack categories imported from Business Central. Does not cover item categories on journal exports (BC55) or category import failures (BC98).
contentType: task
platform: [web, mobile]
order: 93
---

# Resolve the BC93 Export Error in Dynamics 365 Business Central

## What the BC93 export error means

If a report shows this error:

> BC93 Export Error: All expenses must have a Dynamics 365 Business Central account selected as the category. Please select an account as the category for all expenses and try exporting again.

At least one expense doesn't have a category imported from Business Central.

## Why the BC93 export error happens

An expense may have no category, a manually created category, or a category left over from another accounting connection. The category must belong to the report's workspace and come from Business Central.

## How to fix the BC93 export error in Business Central

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
2. Select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now**.
3. Select **Spend > Reports** and open the report.
4. Check every expense's **Category** and choose a category imported from Business Central.
5. Export the report again.

Choose a G/L account category for **General journal** exports. Imported item categories are supported for **Purchase invoices**, but cause BC55 on journal exports.

If no categories import, learn how to [resolve the BC98 category sync error](/articles/new-expensify/connections/business-central/Troubleshooting/Sync-Errors/BC98-Sync-Error).

## When to contact Concierge

Contact Concierge if every expense uses an imported Business Central category but BC93 still appears.
