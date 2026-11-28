---
title: Resolve the BC96 Export Error in Dynamics 365 Business Central
description: Learn how to fix the BC96 export error by selecting a vendor for a company card expense or configuring a default Business Central vendor.
keywords: [BC96, BC96 export error, no Business Central vendor set, company card expense vendor, Default company card vendor, workspace admin]
internalScope: Audience is workspace admins exporting company card expenses to Dynamics 365 Business Central. Covers resolving BC96 when no card-specific vendor, expense vendor, or default company card vendor is set. Does not cover submitter vendor matching (BC95) or missing synced vendor records (BC97).
contentType: task
platform: [web, mobile]
order: 96
---

# Resolve the BC96 Export Error in Dynamics 365 Business Central

## What the BC96 export error means

If a report shows this error:

> BC96 Export Error: No Business Central vendor is set for company card expense [merchant]. Select a vendor on the expense or a default company card vendor in the export settings, then try exporting again.

Expensify needs a vendor for the company card expense, whether it exports as a general journal or a purchase invoice.

## Why the BC96 export error happens

No vendor is available from any of these sources, in priority order:

1. A vendor set for the individual managed card.
2. The expense's **Vendor** field.
3. The workspace's **Default company card vendor**.

## How to fix the BC96 export error in Business Central

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Spend > Reports** and open the report.
2. Open the expense named in the error.
3. Select **Vendor** and choose the appropriate Business Central vendor.
4. Export the report again.

To supply a fallback for expenses without a vendor:

1. Select **Workspaces > [workspace name] > Accounting**.
2. Under **Dynamics 365 Business Central**, select **Export > Default company card vendor**.
3. Choose the appropriate vendor, then export the report again.

If no vendors appear, add them in Business Central and sync the connection. Learn how to [manage Business Central vendor matching](/articles/new-expensify/connections/business-central/Manage-Vendor-Matching-for-Business-Central).

## When to contact Concierge

Contact Concierge if a vendor is selected on the expense or in the export settings but BC96 still appears.
