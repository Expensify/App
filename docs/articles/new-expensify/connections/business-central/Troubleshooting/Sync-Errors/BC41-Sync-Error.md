---
title: BC41 Sync Error in Dynamics 365 Business Central
description: Learn what the BC41 sync error means when Dynamics 365 Business Central rejects a request without a reason, and how to retry the sync or export.
keywords: [BC41, BC41 sync error, Business Central rejected the request, Business Central request rejected, Business Central export failed, Dynamics 365 Business Central sync error, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection. Covers resolving the BC41 error when Business Central rejects a sync or export request without explaining why. Does not cover rejected credentials (BC04), requests that can't reach Business Central (BC61), or errors where Business Central gives its own reason.
contentType: task
order: 41
---

# BC41 Sync Error in Dynamics 365 Business Central

If the **Accounting** page or a report shows this error:

> BC41 Sync Error: Business Central rejected the request.

Business Central refused a request from Expensify and didn't say why. This error can appear on the **Accounting** page after a sync, or in a report's history after an export.

## Why the BC41 sync error happens

The BC41 error happens when Business Central returns an error without a message. This often means Business Central had a temporary problem, such as an update of the environment.

When Business Central explains why it rejected a request, Expensify shows that reason instead of BC41.

## How to fix the BC41 sync error in Business Central

1. In the Business Central admin center, select **Environments**.
2. Confirm the environment's **State** is **Active**. If Microsoft is updating it, wait until the update finishes.
3. Sync or export again.

To sync again:

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
2. Select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now**.

To export a report again:

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Spend > Reports**.
2. Open the report.
3. Select **More**, then select **Export**.
4. Select **Export to Dynamics 365 Business Central**.

If the error on the report ends with **records already created in Business Central**, contact Concierge before you export again, so the report isn't recorded twice.

## When to contact Concierge

Contact Concierge if the BC41 error keeps appearing while the Business Central environment is active.

# FAQ

## Why do some errors show a Business Central code instead of BC41?

When Business Central explains why it rejected a request, Expensify shows Business Central's own error code and message, such as **BadRequest_NotFound**, instead of BC41. Follow the message from Business Central to fix the problem.
