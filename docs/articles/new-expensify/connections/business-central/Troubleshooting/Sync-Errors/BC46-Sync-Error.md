---
title: BC46 Sync Error in Dynamics 365 Business Central
description: Learn what the BC46 sync error means when Expensify can't read a response from Dynamics 365 Business Central, and how to retry the sync or export.
keywords: [BC46, BC46 sync error, could not read the Business Central response, Business Central unexpected response, Dynamics 365 Business Central sync error, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection. Covers resolving the BC46 error when Expensify can't read Business Central's response during a sync or an export. Does not cover requests that can't reach Business Central (BC61) or that Business Central rejects (BC41).
contentType: task
order: 46
---

# BC46 Sync Error in Dynamics 365 Business Central

If the **Accounting** page or a report shows this error:

> BC46 Sync Error: Could not read the Business Central response.

Business Central answered a request from Expensify, but Expensify couldn't read the answer. This error can appear on the **Accounting** page after a sync, or in a report's history after an export.

## Why the BC46 sync error happens

The BC46 error usually happens when Business Central sends an incomplete or unexpected response, for example during a temporary service problem.

## How to fix the BC46 sync error in Business Central

Wait a few minutes, then sync or export again.

To sync again:

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
2. Select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now**.

To export a report again:

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Spend > Reports**.
2. Open the report.
3. Select **More**, then select **Export**.
4. Select **Export to Dynamics 365 Business Central**.

Before you export a report again, check Business Central for a purchase invoice or journal lines created for it. Business Central can create a record even when Expensify can't read its response. If you find one, contact Concierge instead of exporting again, so the report isn't recorded twice.

## When to contact Concierge

Contact Concierge if the BC46 error appears again after you retry.
