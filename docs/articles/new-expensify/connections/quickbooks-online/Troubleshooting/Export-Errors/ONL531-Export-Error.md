---
title: ONL531 Export Error in QuickBooks Online
description: Learn how to fix the ONL531 export error in QuickBooks Online when an account, customer, vendor, item, or class has been deleted or made inactive.
keywords: ONL531, QuickBooks Online account deleted error, category inactive QuickBooks, export account deleted, customer tag inactive, vendor inactive, class deleted QuickBooks Online, Expensify QuickBooks Online export error, Workspace Admin, accounting export error
internalScope: Audience is Workspace Admins using QuickBooks Online integration. Covers fixing the ONL531 export error caused by deleted or inactive records in QuickBooks Online. Does not cover other export error codes.
---

# ONL531 Export Error in QuickBooks Online

If you see the error:

ONL531: Account has been deleted. The category or export account may be deleted or inactive in the QuickBooks Online Chart of Accounts.

This means a record used on the report no longer exists or is inactive in QuickBooks Online.

---

## Why the ONL531 Export Error Happens in QuickBooks Online

The ONL531 error occurs when one of the following has been deleted or made inactive in QuickBooks Online:

- Account (category or export account)
- Customer (tag)
- Item (category)
- Vendor (submitter or credit card miscellaneous vendor)
- Class

If any of these records are no longer active, Expensify cannot complete the export.

---

## How to Fix Deleted or Inactive Records in QuickBooks Online

First, confirm which record is inactive or deleted.

1. Open the report in Expensify.
2. Review the category, customer, vendor, class, and export account used.
3. In QuickBooks Online, go to the relevant section (Chart of Accounts, Customers, Vendors, Products and Services, or Classes).
4. Confirm the record exists and is active.
5. Reactivate the record if needed, or create a new active record.

After confirming all records are active, update your export settings in Expensify.

---

## How to Refresh Export Settings in Expensify

If the error persists, reset the export configuration.

### On Web

1. Go to the **Workspaces** navigation tab on the left.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Export**.
5. Under **Export reimbursable expenses as** or **Export non-reimbursable expenses as**, select a different export option.
6. Click **Save**.
7. Click **Configure** again and reselect the correct export type.
8. Click **Save**.

### On Mobile

1. Tap the **Workspaces** navigation tab on the bottom.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Export**.
5. Under **Export reimbursable expenses as** or **Export non-reimbursable expenses as**, select a different export option.
6. Tap **Save**.
7. Return to **Export** and reselect the correct export type.
8. Tap **Save**.

After refreshing the export settings, retry exporting the report.

---

# FAQ

## Does ONL531 Mean My QuickBooks Online Connection Is Broken?

No. This error typically means a required record has been deleted or made inactive in QuickBooks Online.

## Do I Need to Reconnect QuickBooks Online?

Not usually. In most cases, reactivating the record or refreshing the export settings resolves the issue.
