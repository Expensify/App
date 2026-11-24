---
title: Resolve the BC86 Export Error in Dynamics 365 Business Central
description: Learn how to fix the BC86 export error by choosing an open-period export date or enabling Export to next open period for Business Central.
keywords: [BC86, BC86 export error, Business Central accounting period closed, Export to next open period, Transaction date, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection. Covers resolving BC86 when the export date falls in a closed accounting period and automatic next-period export is disabled. Does not cover missing periods (BC85) or no later open period (BC87).
contentType: task
platform: [web, mobile]
order: 86
---

# Resolve the BC86 Export Error in Dynamics 365 Business Central

## What the BC86 export error means

If a report shows this error:

> BC86 Export Error: The Business Central accounting period [period] is closed. Select an export date in an open period or enable export to next open period, then try exporting again.

The export date belongs to a closed accounting period, and **Export to next open period** is disabled.

## Why the BC86 export error happens

Expensify checks Business Central's accounting periods before exporting. It doesn't move a report's posting date out of a closed period unless you enable that behavior.

## How to fix the BC86 export error in Business Central

Confirm with your accounting team whether the report should use a different date basis or move to the next open period.

To move closed-period exports automatically:

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
2. Under **Dynamics 365 Business Central**, select **Advanced**.
3. Enable **Export to next open period**.
4. Open the report and export it again.

Expensify uses the starting date of the earliest open period after the configured export date. This changes the posting and document dates sent to Business Central, not the expense dates in Expensify.

If your accounting team requires another date basis instead, select **Export > Transaction date** under **Dynamics 365 Business Central**. Choose **Date of last expense**, **Export date**, or **Submitted date** as appropriate, then export again.

## When to contact Concierge

Contact Concierge if the period is open or **Export to next open period** is enabled, but BC86 still appears.
