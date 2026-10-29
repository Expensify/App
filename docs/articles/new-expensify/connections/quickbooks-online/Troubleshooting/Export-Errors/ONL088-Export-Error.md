---
title: ONL088 Export Error in QuickBooks Online
description: Learn how to fix the ONL088 export error in QuickBooks Online when a report creator already exists as an employee and a vendor record cannot be created.
keywords: ONL088, QuickBooks Online vendor error, report creator already exists as employee, error creating vendor, Automatically Create Entities, QuickBooks Online employee vs vendor, Expensify QuickBooks Online export error, Sync now, Workspace Admin, accounting export error
internalScope: Audience is Workspace Admins using QuickBooks Online integration. Covers fixing the ONL088 export error caused by employee and vendor name conflicts. Does not cover other export error codes.
---

# ONL088 Export Error in QuickBooks Online

If you see the error:

ONL088: Error creating vendor. Report creator already exists as an 'employee' in QuickBooks Online. Please use a different name on the employee record.

This means QuickBooks Online already has an employee record with the same name as the report creator, which prevents Expensify from creating a vendor with that name.

---

## Why the ONL088 Export Error Happens in QuickBooks Online

The ONL088 error occurs when:

- A report creator (submitter) exists as an employee in QuickBooks Online.
- Expensify attempts to create a vendor record with the same name.
- QuickBooks Online does not allow a vendor and employee to share the same name.

To resolve this, you must either adjust the employee record or manually manage vendor records.

---

## Option One: Edit the Employee Name in QuickBooks Online

If you want Expensify to continue automatically creating vendors, update the employee record so the names no longer conflict.

1. In QuickBooks Online, go to **Payroll** or **Employees**.
2. Open the employee record that matches the report creator’s email address in Expensify.
3. Edit the employee’s name so it is different from their Expensify display name.
4. Save the changes.

If you use vendor records for employees in QuickBooks Online, make sure:

- The email address on the vendor record exactly matches the member’s email address in Expensify.

After updating the record, resync your Workspace in Expensify.

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

## Option Two: Manually Create Vendor Records and Disable Automatic Creation

If you prefer to manage vendors manually, follow these steps.

1. In QuickBooks Online, go to **Expenses**.
2. Select **Vendors**.
3. Manually create vendor records for each report creator.
4. Ensure the vendor email exactly matches the member’s email in Expensify.

Then disable automatic entity creation in Expensify.

### How to Disable Automatically Create Entities in Expensify

#### On Web

1. Go to the **Workspaces** navigation tab on the left.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Advanced**.
5. Turn off **Automatically create entities**.
6. Click **Save**.

#### On Mobile

1. Tap the **Workspaces** navigation tab on the bottom.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Advanced**.
5. Turn off **Automatically create entities**.
6. Tap **Save**.

After completing these steps, retry exporting the report.

---

# FAQ

## Can a Person Be Both an Employee and a Vendor in QuickBooks Online?

No. QuickBooks Online does not allow an employee and a vendor to share the same name. The names must be different.

## Do the Email Addresses Need to Match Between Expensify and QuickBooks Online?

Yes. If you are creating vendor records for report creators, the vendor email in QuickBooks Online must exactly match the member’s email address in Expensify for exports to work correctly.
