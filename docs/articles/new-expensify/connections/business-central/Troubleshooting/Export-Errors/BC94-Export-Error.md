---
title: Resolve the BC94 Export Error in Dynamics 365 Business Central
description: Learn how to fix the BC94 export error when an expense's selected Business Central tax rate can't be found in the synced VAT posting setups.
keywords: [BC94, BC94 export error, Business Central tax rate not found, VAT posting setup missing, sync taxes, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection with imported taxes. Covers resolving BC94 when the selected tax rate has no matching synced VAT posting setup. Does not cover excessive edited tax (BC83) or missing zero-rate setups (BC84).
contentType: task
platform: [web, mobile]
order: 94
---

# Resolve the BC94 Export Error in Dynamics 365 Business Central

## What the BC94 export error means

If a report shows this error:

> BC94 Export Error: The Business Central tax rate for expense [merchant] was not found. Sync the connection and try exporting again.

The expense references a tax rate that Expensify can't find in the synced Business Central VAT posting setups.

## Why the BC94 export error happens

The VAT posting setup may have been deleted or replaced, or the expense may reference a tax rate that isn't in the current connection data. Expensify doesn't import VAT posting setups without a **VAT Identifier**.

## How to fix the BC94 export error in Business Central

1. Confirm the required VAT posting setup exists in the connected Business Central company and has a populated **VAT Identifier**.
2. In Expensify's navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
3. Select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now**.
4. Open the report and the expense named in the error.
5. Choose the correct imported tax rate and verify the tax amount, then export the report again.

Don't disable tax importing or remove correct tax information just to bypass the error.

## When to contact Concierge

Contact Concierge if the VAT setup exists and the expense uses its current imported tax rate, but BC94 still appears.
