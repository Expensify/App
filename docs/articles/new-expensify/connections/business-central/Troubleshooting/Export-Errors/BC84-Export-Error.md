---
title: Resolve the BC84 Export Error in Dynamics 365 Business Central
description: Learn how to resolve BC84 by adding the zero-rate Business Central VAT posting setup needed to export an expense with reduced tax.
keywords: [BC84, BC84 export error, Business Central 0% VAT posting setup, edited tax amount, untaxed expense, VAT business posting group, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection with imported taxes. Covers resolving BC84 when an edited tax amount requires a 0% VAT setup in the same VAT business posting group. Does not cover excessive tax (BC83) or missing selected tax rates (BC94).
contentType: task
platform: [web, mobile]
order: 84
---

# Resolve the BC84 Export Error in Dynamics 365 Business Central

## What the BC84 export error means

If a report shows this error:

> BC84 Export Error: The tax amount of expense [merchant] was edited, but Business Central has no 0% VAT posting setup for VAT business posting group [group] to export the untaxed part of it. Add one in VAT Posting Setup, sync the connection, and try exporting again.

Expensify needs a matching 0% VAT posting setup to preserve the expense's reduced tax amount in Business Central.

## Why the BC84 export error happens

Business Central calculates tax from the VAT posting setup rather than accepting an edited tax amount directly. Expensify splits an expense with reduced tax into taxed and untaxed lines.

For example, an expense of 100.00 at 25% with tax reduced to 10.00 exports as 50.00 at 25% and 50.00 at 0%.

The 0% setup must use the same VAT business posting group as the selected tax rate. **(blank)** in the error means that group has no code.

## How to fix the BC84 export error in Business Central

1. Ask your Business Central admin or accounting team to open **VAT Posting Setup** in the connected company.
2. Add an appropriate setup with a VAT rate of 0%, the VAT business posting group named in the error, and a populated **VAT Identifier**.
3. In Expensify's navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
4. Select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now**.
5. Open the report and export it again.

Keep the expense's correct tax amount. The additional setup lets Expensify export the untaxed portion without increasing the VAT claim.

Expensify only imports VAT posting setups with a **VAT Identifier**. A 0% setup without one won't resolve BC84.

## When to contact Concierge

Contact Concierge if a 0% setup exists in the same VAT business posting group and the connection has synced, but BC84 still appears.
