---
title: Resolve the BC56 Export Error in Dynamics 365 Business Central
description: Learn how to resolve the BC56 export error when a Dynamics 365 Business Central bank account selected for general journal exports can't be found.
keywords: [BC56, BC56 export error, Business Central bank account not found, Reimbursable account, Company card account, Per-card account, workspace admin]
internalScope: Audience is workspace admins exporting general journals to Dynamics 365 Business Central. Covers resolving BC56 for workspace, card program, and individual card bank account mappings. Does not cover reimbursement payment accounts (BC79) or Expensify Card settlement sync accounts (BC89).
contentType: task
platform: [web, mobile]
order: 56
---

# Resolve the BC56 Export Error in Dynamics 365 Business Central

## What the BC56 export error means

If a report shows this error:

> BC56 Export Error: The Business Central bank account selected in the export settings was not found. Sync the connection and try exporting again.

Expensify can't find the selected bank account, or its Business Central account number is missing.

## Why the BC56 export error happens

The account may have been deleted or replaced since the last sync. The selection can come from:

- **Reimbursable account** or **Company card account**.
- A **Card program account** mapping.
- A **Per-card account** mapping, which takes priority over the card program and workspace accounts.

## How to fix the BC56 export error in Business Central

1. Confirm the intended bank account exists and has a number in the connected Business Central company.
2. In Expensify's navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
3. Select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now**.
4. Under **Dynamics 365 Business Central**, select **Export** and choose a valid **Reimbursable account** or **Company card account**.
5. If **Configure exporting to multiple accounts** is enabled, also check **Card program account** and **Per-card account** for the affected card.
6. Open the report and export it again.

## When to contact Concierge

Contact Concierge if the account exists, has a number, and is selected after syncing, but BC56 still appears.
