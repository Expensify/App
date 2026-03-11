---
title: ONL099 Export Error in QuickBooks Online
description: Learn how to fix the ONL099 export error in QuickBooks Online by enabling sales information for billable Items and syncing your Workspace in Expensify.
keywords: ONL099, QuickBooks Online sales info error, enable sales for item, billable items QuickBooks Online, assign income account item, Expensify QuickBooks Online export error, Sync now, Workspace Admin, accounting export error
internalScope: Audience is Workspace Admins using QuickBooks Online integration. Covers fixing the ONL099 export error caused by missing sales information on Items. Does not cover other export error codes.
---

# ONL099 Export Error in QuickBooks Online

If you see the error:

ONL099: Enable sales info for billable Items in QuickBooks.

This means an Item used as a category on the expense does not have sales information enabled in QuickBooks Online.

---

## Why the ONL099 Export Error Happens in QuickBooks Online

The ONL099 error occurs when:

- An expense is categorized using an Item in Expensify.
- That Item in QuickBooks Online does not have sales information enabled.
- The Item does not have an associated Income account.

QuickBooks Online requires billable Items to have sales details and an assigned Income account in order to export successfully.

---

## How to Enable Sales Information for an Item in QuickBooks Online

To fix the ONL099 error, update the Item used on the report.

1. In QuickBooks Online, go to **Sales**.
2. Select **Products and Services** (Items List).
3. Find the Item used on the report (it appears as a category in Expensify).
4. Click **Edit**.
5. Enable **Sales information**.
6. Assign an appropriate **Income account**.
7. Click **Save and close**.

After updating the Item, return to Expensify and sync your connection.

---

## How to Sync QuickBooks Online in Expensify

After enabling sales information for the Item, refresh your QuickBooks Online connection.

### On Web

1. Go to the **Workspaces** navigation tab on the left.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the **three-dot icon** next to the QuickBooks Online connection.
5. Select **Sync now**.

### On Mobile

1. Tap the **Workspaces** navigation tab on the bottom.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the **three-dot icon** next to the QuickBooks Online connection.
5. Tap **Sync now**.

Once the sync completes, retry exporting the report.

---

## How to Re-Export a Report After Fixing ONL099

1. Open the report that failed to export.
2. Click **Export to QuickBooks Online**.
3. Confirm the export.

If the Item now includes sales information and an Income account, the export should succeed.

---

# FAQ

## What Is an Item in QuickBooks Online?

An Item (also called a Product or Service) in QuickBooks Online is used to track specific goods or services and link them to Income accounts.

## Do All Billable Items Need Sales Information Enabled?

Yes. If an Item is used for billable expenses, it must have sales information enabled and an assigned Income account in QuickBooks Online to export successfully.
