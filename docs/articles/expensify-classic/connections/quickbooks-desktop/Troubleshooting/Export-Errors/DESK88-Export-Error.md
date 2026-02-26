---
title: DESK88 Export Error in QuickBooks Desktop Web Connector
description: Learn how to fix the DESK88 export error in QuickBooks Desktop when split lines exported to Accounts Payable are linked to an employee instead of a vendor.
keywords: DESK88, QuickBooks Desktop split lines vendor error, Accounts Payable journal entry vendor required, employee vs vendor QuickBooks Desktop, vendor email required, Sync now, Expensify QuickBooks Desktop export error, Workspace Admin
internalScope: Audience is Workspace Admins using QuickBooks Desktop integration with Web Connector. Covers resolving the DESK88 export error caused by vendor and email mismatches. Does not cover QuickBooks Online errors.
---

# DESK88 Export Error in QuickBooks Desktop Web Connector

If you see the error:

DESK88: Split lines exported as a Journal Entry to Accounts Payable must be linked to a 'vendor', not an employee. Please ensure the vendor record includes the report creator’s email address.

This means the report submitter is not properly set up as a vendor in QuickBooks Desktop when exporting split lines to an Accounts Payable (A/P) account as a Journal Entry.

---

## Why the DESK88 Export Error Happens in QuickBooks Desktop

The DESK88 error occurs when:

- Split lines are exported as a **Journal Entry** to an **Accounts Payable** account.
- The report submitter’s email address is associated with an **employee** record instead of a vendor record.
- There is no vendor record in QuickBooks Desktop that matches the submitter’s email address.

When exporting to Accounts Payable, QuickBooks Desktop requires the transaction to be linked to a vendor, not an employee.

---

## How to Fix the DESK88 Export Error

### Step One: Check the Submitter’s Email in QuickBooks Desktop

1. Open **QuickBooks Desktop**.
2. Use the global search function.
3. Search for the report submitter’s email address.
4. Review all matching records.

---

### Step Two: Correct the Vendor or Employee Record

If the email is associated with an employee record:

1. Open the employee record.
2. Remove the email address.
3. Save the changes.

If a vendor record already exists for the report submitter:

1. Open the vendor record.
2. Add the submitter’s email address to the **Email** field.
3. Save the changes.

If a vendor record does not exist:

1. Go to the **Vendor Center**.
2. Create a new vendor.
3. Enter the report submitter’s email address in the **Email** field.
4. Save the vendor record.

The email in the vendor record must exactly match the submitter’s email in Expensify.

---

### Step Three: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync now**.

---

### Step Four: Retry the Export

1. Open the report in Expensify.
2. Retry exporting to QuickBooks Desktop.

Once the vendor record includes the correct email and no employee record conflicts exist, the export should complete successfully.

---

# FAQ

## Can a Person Be Both an Employee and a Vendor With the Same Email?

No. If the same email is associated with both an employee and a vendor record, QuickBooks Desktop may not correctly match the vendor during export.

## Does This Error Only Apply to Journal Entry Exports?

Yes. This error specifically applies when exporting split lines as Journal Entries to an Accounts Payable account.
