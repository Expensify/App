---
title: ONL912 Export Error in QuickBooks Online
description: Learn how to fix the ONL912 export error in QuickBooks Online when an account, category, or related record is inactive or deleted.
keywords: ONL912, QuickBooks Online account not found, category inactive QuickBooks, export account deleted, Chart of Accounts error, vendor inactive, customer inactive, class deleted, Expensify QuickBooks Online export error, Workspace Admin, accounting export error
internalScope: Audience is Workspace Admins using QuickBooks Online integration. Covers fixing the ONL912 export error caused by missing or inactive accounts and related records. Does not cover other export error codes.
---

# ONL912 Export Error in QuickBooks Online

If you see the error:

ONL912: Account not found. The category or export account may be deleted or inactive in the QuickBooks Online Chart of Accounts.

This means the category or export account used on the report cannot be found in QuickBooks Online.

---

## Why the ONL912 Export Error Happens in QuickBooks Online

The ONL912 error occurs when:

- The category used on the report has been deleted or made inactive in QuickBooks Online.
- The export account configured in Expensify no longer exists in the Chart of Accounts.
- A related record tied to the report is inactive, such as:
  - Employee or vendor (matching the report submitter’s email address)
  - Customer
  - Item
  - Class

If any required reference is inactive or missing, QuickBooks Online cannot complete the export.

---

## How to Confirm Accounts and Records Are Active in QuickBooks Online

1. Log in to QuickBooks Online.
2. Go to **Accounting** > **Chart of Accounts**.
3. Confirm the category and export account used in Expensify are active.
4. Reactivate any account that has been made inactive, if appropriate.

It is also recommended to check related records:

- **Expenses** > **Vendors** (for vendor records)
- **Sales** > **Customers** (for customer records)
- **Sales** > **Products and Services** (for items)
- **Classes** (if class tracking is enabled)

Confirm all relevant records are active.

---

## How to Resolve the ONL912 Export Error

If a record is inactive or deleted, you have two options:

### Option One: Reactivate the Record

1. Reactivate the account or record in QuickBooks Online.
2. In Expensify, go to the **Workspaces** navigation tab.
3. Select your Workspace.
4. Click **Accounting**.
5. Click the **three-dot icon** next to the QuickBooks Online connection.
6. Select **Sync now**.
7. Retry exporting the report.

### Option Two: Select a Different Active Record in Expensify

1. Open the report in Expensify.
2. Update the category, export account, customer, vendor, item, or class to an active record.
3. Save the changes.
4. Retry exporting the report.

---

# FAQ

## Does ONL912 Mean My QuickBooks Online Connection Is Broken?

No. This error typically means the account or related record used on the report is inactive or has been deleted.

## Do I Need to Reconnect QuickBooks Online?

Not usually. Reactivating the record or selecting a different active entry and running **Sync now** should resolve the issue.
