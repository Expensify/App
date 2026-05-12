---
title: ONL118 Export Error in QuickBooks Online
description: Learn how to fix the ONL118 export error in QuickBooks Online by associating a customer or project with all billable expenses and syncing your Workspace in Expensify.
keywords: ONL118, QuickBooks Online customer project error, associate customer project billable transactions, billable expenses export error, inactive customer project QuickBooks Online, Sync now, Expensify QuickBooks Online export error, Workspace Admin, accounting export error
internalScope: Audience is Workspace Admins using QuickBooks Online integration. Covers fixing the ONL118 export error caused by missing or inactive customer/project associations. Does not cover other export error codes.
---

# ONL118 Export Error in QuickBooks Online

If you see the error:

ONL118: Associate a customer/project on all billable transactions before exporting to QuickBooks Online.

This means one or more billable expenses on the report are not linked to a valid customer or project from QuickBooks Online.

---

## Why the ONL118 Export Error Happens in QuickBooks Online

The ONL118 error occurs when:

- A billable expense does not have a customer or project applied in Expensify.
- The associated customer or project is inactive in QuickBooks Online.
- The customer or project was deleted in QuickBooks Online.
- A manually created tag in Expensify does not match a customer or project imported from QuickBooks Online.

All billable transactions must be linked to an active QuickBooks Online customer or project before exporting.

---

## How to Confirm All Billable Expenses Have a Customer or Project in Expensify

1. Open the report that failed to export.
2. Review each billable expense.
3. Confirm a **Customer/Project** is selected on every billable expense.
4. Update any missing customer or project fields.
5. Save the changes.

If all billable expenses already have a customer or project selected, verify that the customer or project is active in QuickBooks Online.

---

## How to Confirm the Customer or Project Is Active in QuickBooks Online

1. In QuickBooks Online, go to **Sales**.
2. Select **Customers** or **Projects**.
3. Search for the customer or project used on the report.
4. Confirm it is active and has not been deleted.

If the customer or project is inactive or deleted, reactivate it or select a different active customer or project in Expensify.

If you previously created manual tags in Expensify that were not imported from QuickBooks Online, remove those tags from the Workspace and use only synced customer or project options.

---

## How to Sync QuickBooks Online in Expensify

After confirming customers or projects are active, refresh your connection.

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

After syncing, update the billable expenses if needed and retry exporting the report.

---

# FAQ

## Do Only Billable Expenses Require a Customer or Project?

Yes. The ONL118 error only applies to billable transactions. Non-billable expenses do not require a customer or project.

## What Happens If a Customer or Project Is Deleted in QuickBooks Online?

If a customer or project is deleted or inactive in QuickBooks Online, exports tied to that record will fail. You must reactivate it or assign a different active customer or project before exporting.
