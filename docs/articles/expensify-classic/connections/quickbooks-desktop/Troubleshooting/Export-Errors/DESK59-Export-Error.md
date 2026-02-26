---
title: DESK59 Export Error in QuickBooks Desktop Web Connector
description: Learn how to fix the DESK59 export error in QuickBooks Desktop when a vendor cannot be matched to the report submitter’s email.
keywords: DESK59, QuickBooks Desktop vendor not found, vendor email mismatch, report submitter email error, duplicate vendor record QuickBooks Desktop, Expensify QuickBooks Desktop export error, Workspace Admin
internalScope: Audience is Workspace Admins using QuickBooks Desktop integration with Web Connector. Covers resolving the DESK59 export error caused by vendor email mismatches or duplicate records. Does not cover QuickBooks Online errors.
---

# DESK59 Export Error in QuickBooks Desktop Web Connector

If you see the error:

DESK59: QuickBooks Desktop couldn’t find a vendor matching the report submitter’s email. Add the email to the 'Main Email' field of the vendor record in QuickBooks Desktop.

This means Expensify cannot match the report submitter to a vendor record in QuickBooks Desktop using their email address.

---

## Why the DESK59 Export Error Happens in QuickBooks Desktop

The DESK59 error occurs when:

- There is no vendor record in QuickBooks Desktop with an email address matching the report submitter’s email in Expensify.
- The vendor exists, but the email is not listed in the **Main Email** field.
- The submitter’s email is associated with multiple records (for example, both a vendor and an employee).

Expensify matches vendors based on the exact email address stored in QuickBooks Desktop.

---

## How to Fix the DESK59 Export Error

### Step One: Confirm the Vendor Record in QuickBooks Desktop

1. Open **QuickBooks Desktop**.
2. Go to **Vendors** > **Vendor Center**.
3. Search for the report submitter.
4. Open the vendor record.
5. Confirm the report submitter’s email address is listed in the **Main Email** field.
6. Update the email if needed.
7. Click **OK** to save.

The email must exactly match the submitter’s email in Expensify.

---

### Step Two: Check for Duplicate Records

If the export still fails:

1. Use the search feature in QuickBooks Desktop.
2. Search for the report submitter’s email address.
3. Confirm the email is not associated with multiple records (vendor, employee, etc.).
4. Remove or deactivate duplicate records if necessary.
5. Save your changes.

Duplicate or conflicting records can prevent QuickBooks Desktop from correctly matching the vendor.

---

### Step Three: Retry the Export

1. Return to Expensify.
2. Open the report.
3. Retry exporting to QuickBooks Desktop.

Once the vendor record includes the correct email and there are no duplicates, the export should complete successfully.

---

# FAQ

## Does the Email Have to Match Exactly?

Yes. The email in the **Main Email** field of the vendor record must exactly match the report submitter’s email in Expensify.

## Does DESK59 Mean the Vendor Does Not Exist?

Not necessarily. The vendor may exist, but the email may be missing, incorrect, or associated with multiple records.
