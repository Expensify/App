---
title: ONL099 Export Error in QuickBooks Online Integration
description: Learn what the ONL099 export error means in QuickBooks Online and how to enable sales information for Items used in billable expense exports.
keywords: ONL099, QuickBooks Online export error, enable sales info QuickBooks, billable item sales information missing, QuickBooks item configuration error, Expensify QuickBooks Online integration, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers resolving the ONL099 export error caused by missing sales information on billable Items. Does not cover other QuickBooks Online error codes.
---

# ONL099 Export Error in QuickBooks Online Integration

If you see the error:

ONL099: Enable sales info for billable Items in QuickBooks.

This means the Item (category) used on the expense does not have sales information enabled in QuickBooks Online, preventing the export from completing.

---

## Why the ONL099 Export Error Happens in QuickBooks Online

The ONL099 error typically indicates:

- The expense is marked as billable.
- The selected Item in QuickBooks Online does not have **Sales** enabled.
- The Item is not linked to an Income account.
- QuickBooks Online validation failed due to incomplete Item configuration.

QuickBooks requires billable Items to include sales information and an associated Income account.

This is a QuickBooks Online Item configuration issue, not a Workspace configuration issue.

---

## How to Fix the ONL099 Export Error

This issue must be resolved in QuickBooks Online.

1. Log in to QuickBooks Online.
2. Go to the **Products and Services** (Items) list.
3. Locate the Item used on the report.
4. Select **Edit**.
5. Enable **Sales** for the Item.
6. Assign an appropriate **Income account**.
7. Save your changes.

After updating the Item:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After enabling sales information and selecting **Sync Now**, retry the export. If the error persists, confirm the correct Item was updated.

## Does ONL099 Mean Billable Is Disabled in QuickBooks?

Not necessarily. It usually means the specific Item used on the expense does not have Sales enabled.

## Do I Need to Reconnect QuickBooks Online?

No. Updating the Item settings and running **Sync Now** is typically sufficient.
