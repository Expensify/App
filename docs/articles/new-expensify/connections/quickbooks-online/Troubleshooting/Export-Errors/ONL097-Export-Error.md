---
title: ONL097 Export Error in QuickBooks Online
description: Learn how to fix the ONL097 export error in QuickBooks Online when exporting reimbursable expenses as Journal Entries to Accounts Payable while employee records are in use.
keywords: ONL097, QuickBooks Online Accounts Payable error, select vendor in Name field, reimbursable expenses Journal Entry, Automatically create entities, vendor record QuickBooks Online, Expensify QuickBooks Online export error, Sync now, Workspace Admin, accounting export error
internalScope: Audience is Workspace Admins using QuickBooks Online integration. Covers fixing the ONL097 export error related to Accounts Payable and vendor selection. Does not cover other export error codes.
---

# ONL097 Export Error in QuickBooks Online

If you see the error:

ONL097: Please select a vendor in the 'Name' field when exporting reimbursable expenses as Journal Entries to Accounts Payable, since employee records are in use.

This means QuickBooks Online requires a vendor to be selected in the Name field when exporting reimbursable expenses as a Journal Entry to an Accounts Payable (A/P) account.

---

## Why the ONL097 Export Error Happens in QuickBooks Online

The ONL097 error occurs when:

- Reimbursable expenses are exported as Journal Entries.
- The export posts to an Accounts Payable (A/P) account.
- Employee records are enabled in QuickBooks Online.
- No vendor is associated with the transaction.

When posting to Accounts Payable, QuickBooks Online requires a vendor in the Name field.

---

## Option One: Change Reimbursable Export Type to Check in Expensify

If you do not want to use vendor records, change the export type for reimbursable expenses.

### On Web

1. Go to the **Workspaces** navigation tab on the left.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Export**.
5. Under reimbursable expenses, change the export type to **Check**.
6. Click **Save**.

### On Mobile

1. Tap the **Workspaces** navigation tab on the bottom.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Export**.
5. Under reimbursable expenses, change the export type to **Check**.
6. Tap **Save**.

Retry exporting the report.

---

## Option Two: Enable Automatically Create Entities in Expensify

If you want Expensify to create vendor records automatically during export:

### On Web

1. Go to the **Workspaces** navigation tab on the left.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Advanced**.
5. Turn on **Automatically create entities**.
6. Click **Save**.

### On Mobile

1. Tap the **Workspaces** navigation tab on the bottom.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Advanced**.
5. Turn on **Automatically create entities**.
6. Tap **Save**.

When enabled, Expensify creates a vendor record in QuickBooks Online for the report creator during export.

Retry exporting the report.

---

## Option Three: Manually Create a Vendor Record in QuickBooks Online

You can also create vendor records directly in QuickBooks Online.

1. In QuickBooks Online, go to **Expenses**.
2. Select **Vendors**.
3. Create a new vendor for the report creator.
4. In the **Email** field, enter the exact email address the report creator uses in Expensify.
5. Save the vendor record.

After creating the vendor, resync your connection in Expensify.

### How to Sync QuickBooks Online in Expensify

#### On Web

1. Go to the **Workspaces** navigation tab on the left.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the **three-dot icon** next to the QuickBooks Online connection.
5. Select **Sync now**.

#### On Mobile

1. Tap the **Workspaces** navigation tab on the bottom.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the **three-dot icon** next to the QuickBooks Online connection.
5. Tap **Sync now**.

Retry exporting the report after the sync completes.

---

# FAQ

## Why Does QuickBooks Online Require a Vendor in the Name Field?

When exporting to an Accounts Payable account, QuickBooks Online requires a vendor to be assigned to the transaction. This ensures the payable balance is associated with a specific vendor.

## Do the Vendor Email and Expensify Email Need to Match?

Yes. The vendor email in QuickBooks Online must exactly match the member’s email address in Expensify for exports to work correctly when using vendor-based exports.
