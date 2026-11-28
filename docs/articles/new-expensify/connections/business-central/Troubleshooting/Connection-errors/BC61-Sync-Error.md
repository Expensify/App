---
title: BC61 Sync Error in Dynamics 365 Business Central
description: Learn what the BC61 sync error means when Expensify can't reach Dynamics 365 Business Central, and how to retry the sync or export.
keywords: [BC61, BC61 sync error, could not reach Business Central, Business Central timeout, Business Central unavailable, Business Central environment maintenance, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection. Covers resolving the BC61 error when Expensify can't reach Business Central during a sync or an export. Does not cover rejected credentials (BC04) or requests that Business Central rejects (BC41).
contentType: task
order: 61
---

# BC61 Sync Error in Dynamics 365 Business Central

If the **Accounting** page or a report shows this error:

> BC61 Sync Error: Could not reach Business Central. [details]

Expensify couldn't reach Business Central or Microsoft Entra. The details at the end of the error describe the network problem, such as **Read timed out**.

This error can appear on the **Accounting** page after a sync, or in a report's history after an export.

## Why the BC61 sync error happens

The BC61 error usually happens when:

- Business Central or Microsoft Entra is temporarily unavailable.
- Microsoft is updating or maintaining the Business Central environment.
- A network problem interrupted the connection between Expensify and Microsoft.

## How to fix the BC61 sync error in Business Central

1. In the Business Central admin center, select **Environments**.
2. Confirm the environment's **State** is **Active**. If Microsoft is updating it, wait until the update finishes.
3. Wait a few minutes, then sync or export again.

To sync again:

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
2. Select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now**.

Before you export a report again, check Business Central for a purchase invoice or journal lines created for it. Business Central can create a record even when Expensify doesn't receive its response. If you find one, contact Concierge instead of exporting again, so the report isn't recorded twice.

To export a report again:

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Spend > Reports**.
2. Open the report.
3. Select **More**, then select **Export**.
4. Select **Export to Dynamics 365 Business Central**.

## When to contact Concierge

Contact Concierge if the error keeps appearing for more than a few hours while the Business Central environment is active.
