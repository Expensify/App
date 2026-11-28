---
title: Resolve the BC97 Export Error in Dynamics 365 Business Central
description: Learn how to resolve the BC97 export error when the vendor for a company card journal export can't be found in the synced Business Central vendor list.
keywords: [BC97, BC97 export error, Business Central vendor not found, company card general journal, vendor number missing, workspace admin]
internalScope: Audience is workspace admins exporting company card expenses as general journals to Dynamics 365 Business Central. Covers resolving BC97 when a selected vendor is missing from synced data or has no number. Does not cover unset vendors (BC96) or reimbursable submitter vendors (BC95).
contentType: task
platform: [web, mobile]
order: 97
---

# Resolve the BC97 Export Error in Dynamics 365 Business Central

## What the BC97 export error means

If a report shows this error:

> BC97 Export Error: The Business Central vendor for expense [merchant] was not found. Sync the connection and try exporting again.

A vendor is selected, but Expensify can't find its number in the synced Business Central vendor list. General journal lines require that number.

## Why the BC97 export error happens

The vendor may have been deleted, replaced, or returned without a number. The selection may come from an individual card, the expense, or **Default company card vendor**.

## How to fix the BC97 export error in Business Central

1. Confirm the intended vendor exists, has a number, and isn't blocked as **All** in Business Central.
2. In Expensify's navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
3. Select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now**.
4. Open the affected expense and select a valid **Vendor**. Check **Export > Default company card vendor** under the connection if the expense uses the workspace default.
5. If the individual card has a vendor override, update it too. The card's vendor takes priority over the expense and workspace default.
6. Export the report again.

Learn how to [configure a Business Central vendor for a specific card](/articles/new-expensify/connections/business-central/Configure-Business-Central#how-to-set-a-business-central-vendor-for-a-specific-card).

## When to contact Concierge

Contact Concierge if the selected vendor has a number and appears after syncing, but BC97 still appears.
