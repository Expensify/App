---
title: DESK59 Export Error in QuickBooks Desktop Integration
description: Learn what the DESK59 export error means and how to ensure the vendor email in QuickBooks Desktop matches the report submitter’s email.
keywords: DESK59, QuickBooks Desktop vendor not found, vendor email mismatch QuickBooks, report submitter email QuickBooks Desktop, duplicate vendor record QuickBooks, Expensify QuickBooks Desktop export error, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Desktop integration. Covers resolving the DESK59 export error related to missing or duplicate vendor records based on email address. Does not cover connection or category configuration errors.
---

# DESK59 Export Error in QuickBooks Desktop Integration

If you see the error:

DESK59 Export Error: QuickBooks Desktop couldn’t find a vendor matching the report submitter’s email. Add the email to the “Main Email” field of the vendor record in QuickBooks Desktop.

This means QuickBooks Desktop cannot find a vendor record that matches the report submitter’s email address.

The vendor’s **Main Email** field must exactly match the email listed in the Workspace.

---

## Why the DESK59 Export Error Happens in QuickBooks Desktop

The DESK59 error typically occurs when:

- A vendor record does not exist for the report submitter.
- The vendor’s **Main Email** field does not match the submitter’s email in the Workspace.
- The email address is listed on multiple records (for example, both an employee and a vendor).
- Duplicate vendor or employee records exist in QuickBooks Desktop.

If QuickBooks cannot uniquely match the email to a single vendor record, the export will fail.

This is a vendor record matching issue, not a connection issue.

---

# How to Fix the DESK59 Export Error

Follow the steps below to verify the vendor record and resolve duplicates.

---

## Confirm the Vendor Record in QuickBooks Desktop

1. Open **QuickBooks Desktop**.
2. Locate the vendor record for the report submitter.
3. Confirm:
   - A vendor record exists.
   - The **Main Email** field exactly matches the submitter’s email in the Workspace.
4. Update the email if needed.
5. Click **Save**.

The email must match exactly to allow QuickBooks to identify the vendor correctly.

---

## Check for Duplicate Records Using Global Search

1. In QuickBooks Desktop, use the **global search** function.
2. Search for the report submitter’s email address.
3. Review the results to see if the email appears on:
   - Multiple vendor records.
   - Both vendor and employee records.
4. Remove or deactivate duplicate records if appropriate.

Multiple records using the same email can cause the export to fail.

---

## Retry the Export

After confirming the vendor record and resolving duplicates:

1. Open the report in the Workspace.
2. Retry exporting to QuickBooks Desktop.

If the vendor record exists and the email matches exactly, the export should complete successfully.

---

# FAQ

## Does the Email Have to Match Exactly?

Yes. The email in the vendor’s **Main Email** field must match the report submitter’s email exactly.

## Can Duplicate Records Cause This Error?

Yes. If the same email exists on multiple records (vendor, employee, or customer), QuickBooks may not be able to determine which record to use.

## Do I Need to Reconnect the Integration?

No. This is a vendor record configuration issue, not a connection issue.
