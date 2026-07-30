---
title: ONL715 Export Error in QuickBooks Online
description: Learn how to fix the ONL715 export error in QuickBooks Online when an account, customer, vendor, item, or class is inactive or deleted.
keywords: ONL715, QuickBooks Online invalid reference ID, export account inactive, category deleted, customer inactive, vendor inactive, class deleted, Expensify QuickBooks Online export error, Workspace Admin, accounting export error
internalScope: Audience is Workspace Admins using QuickBooks Online integration. Covers fixing the ONL715 export error caused by inactive or deleted records in QuickBooks Online. Does not cover other export error codes.
---

# ONL715 Export Error in QuickBooks Online

If you see the error:

ONL715: Invalid Reference ID. The export account, category, customer, vendor, or class may be inactive or deleted in QuickBooks Online.

This means a record used on the report no longer exists or is inactive in QuickBooks Online.

---

## Why the ONL715 Export Error Happens in QuickBooks Online

The ONL715 error occurs when one of the following has been deleted or made inactive in QuickBooks Online:

- Account (category or posting account)
- Customer (tag or report field)
- Item (category)
- Vendor (report creator/submitter or credit card miscellaneous vendor)
- Class (tag or report field)

If any required reference is inactive, QuickBooks Online cannot complete the export.

---

## How to Confirm Records Are Active in QuickBooks Online

1. Open the report in Expensify.
2. Identify the category, customer, vendor, class, and export account used.
3. In QuickBooks Online, go to the relevant section:
   - **Accounting** > **Chart of Accounts** (for accounts)
   - **Sales** > **Customers** (for customers)
   - **Expenses** > **Vendors** (for vendors)
   - **Sales** > **Products and Services** (for items)
   - **Classes** (if class tracking is enabled)
4. Confirm each record exists and is active.
5. Reactivate or recreate any deleted or inactive record as needed.

After confirming all records are active, retry exporting the report.

---

## How to Refresh Export Settings in Expensify

If the error continues, reset the export configuration.

### On Web

1. Go to the **Workspaces** navigation tab on the left.
2. Select your Workspace.
3. Click **Connections**.
4. Click **Export**.
5. Under **Export reimbursable expenses as** or **Export non-reimbursable expenses as**, select a different export option.
6. Click **Save**.

### On Mobile

1. Tap the **Workspaces** navigation tab on the bottom.
2. Select your Workspace.
3. Tap **Connections**.
4. Tap **Export**.
5. Under **Export reimbursable expenses as** or **Export non-reimbursable expenses as**, select a different export option.
6. Tap **Save**.

After refreshing the export configuration, retry exporting the report.

---

# FAQ

## Does ONL715 Mean My QuickBooks Online Connection Is Broken?

No. This error usually indicates that a referenced record has been deleted or made inactive in QuickBooks Online.

## Do I Need to Reconnect QuickBooks Online?

Not usually. In most cases, reactivating the record or refreshing the export settings resolves the issue.
