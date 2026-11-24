---
title: Resolve the BC57 Export Error in Dynamics 365 Business Central
description: Learn how to fix the BC57 export error by removing conflicting Customers and CUSTOMER dimension import mappings for Dynamics 365 Business Central.
keywords: [BC57, BC57 export error, Business Central CUSTOMER dimension, Customers import mapping, purchase invoice dimensions, workspace admin]
internalScope: Audience is workspace admins exporting purchase invoices to Dynamics 365 Business Central. Covers resolving BC57 when both Customers and the CUSTOMER dimension import as tags. Does not cover other dimension errors or general journal exports.
contentType: task
platform: [web, mobile]
order: 57
---

# Resolve the BC57 Export Error in Dynamics 365 Business Central

## What the BC57 export error means

If a report shows this error:

> BC57 Export Error: Both the CUSTOMER dimension and Customers import mapping are enabled. Disable one and try again.

Expensify can't export a purchase invoice with two mappings using the same **CUSTOMER** dimension code.

## Why the BC57 export error happens

The **Customers** import and a Business Central dimension named **CUSTOMER** are both enabled. Both would send a value using the same dimension code on a purchase invoice line.

## How to fix the BC57 export error in Business Central

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
2. Under **Dynamics 365 Business Central**, select **Import**.
3. Disable either **Customers** or the **CUSTOMER** dimension. Keep the mapping your accounting team uses.
4. Return to **Accounting**, select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now**.
5. Review the affected expenses' tags and export the report again.

## When to contact Concierge

Contact Concierge if only one mapping is enabled but BC57 still appears.
