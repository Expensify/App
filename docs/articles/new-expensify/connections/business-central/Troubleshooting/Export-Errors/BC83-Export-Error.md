---
title: Resolve the BC83 Export Error in Dynamics 365 Business Central
description: Learn how to fix the BC83 export error when an expense's edited tax amount exceeds the tax allowed by its Business Central VAT rate.
keywords: [BC83, BC83 export error, Business Central tax amount too high, edited tax amount, VAT posting setup, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection with imported taxes. Covers resolving BC83 when edited tax exceeds the amount allowed by the selected VAT rate. Does not cover missing tax rates (BC94) or missing zero-rate VAT setups (BC84).
contentType: task
platform: [web, mobile]
order: 83
---

# Resolve the BC83 Export Error in Dynamics 365 Business Central

## What the BC83 export error means

If a report shows this error:

> BC83 Export Error: The tax amount of expense [merchant] is higher than its Business Central tax rate allows. Correct the tax amount and try exporting again.

The expense's edited tax amount is higher than Business Central can calculate from its total and selected VAT rate.

## Why the BC83 export error happens

The tax amount may be incorrect, or the VAT rate may have changed in Business Central since the expense was coded. Expensify can't preserve an edited tax amount that exceeds the selected rate's allowance.

For example, a tax-inclusive expense of 100.00 at 25% contains 20.00 of VAT, not 25.00.

## How to fix the BC83 export error in Business Central

1. Confirm the correct VAT rate and tax amount with your accounting team.
2. If the VAT posting setup changed in Business Central, select **Workspaces > [workspace name] > Accounting** in Expensify's navigation tabs (on the left on web, on the bottom on mobile).
3. Select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now**.
4. Open the report and the expense named in the error.
5. Correct the selected tax rate or tax amount to match the receipt, then export the report again.

Don't reduce a correct tax amount just to clear the error. Ask your accounting team to confirm the appropriate VAT setup.

## When to contact Concierge

Contact Concierge if the receipt, tax amount, and Business Central VAT rate agree but BC83 still appears.
