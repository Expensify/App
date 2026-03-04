---
title: INT149 Export Error in Sage Intacct Integration
description: Learn what the INT149 export error means and how to resolve missing or duplicate employee records in Sage Intacct before retrying the export.
keywords: INT149, Sage Intacct employee record not found, duplicate employee email Sage Intacct, employee email mismatch Intacct, Sage Intacct employee export error, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT149 export error caused by missing, mismatched, or duplicate employee records based on email address. Does not cover vendor record or approval configuration errors.
---

# INT149 Export Error in Sage Intacct Integration

If you see the error:

INT149 Export Error: The employee record couldn’t be found in Sage Intacct. Ensure the employee record exists, the email matches Expensify exactly, and there are no duplicate employee records using the same email.

This means Sage Intacct cannot match the report creator or submitter to a single employee record.

The employee must exist in Sage Intacct, and the email must match exactly.

---

## Why the INT149 Export Error Happens in Sage Intacct

The INT149 error typically occurs when:

- The report creator’s email does not exist on any employee record in Sage Intacct.
- The same email address is assigned to multiple employee records.
- The email address does not exactly match the one used in the Workspace.

Sage Intacct matches employees by email. If it cannot uniquely match the email to one employee profile, the export fails.

This is an employee record matching issue, not a vendor or approval configuration issue.

---

# How to Fix the INT149 Export Error

Follow the steps below to correct the employee record and retry the export.

---

## Confirm the Employee Record in Sage Intacct

1. Log in to Sage Intacct.
2. Go to **Time & Expenses > Employees**.
3. Locate the employee record for the report creator or submitter.
4. Confirm that the email address:
   - Matches the email used in the Workspace exactly.
   - Is assigned to only one employee record.

---

## Update the Employee Email if Needed

If an employee record exists but does not list the correct email:

1. Add or update the email address to match the one used in the Workspace.
2. Click **Save**.

If multiple employee records share the same email address:

1. Remove the duplicate email from all but one employee record, or
2. Deactivate duplicate employee profiles if appropriate.
3. Click **Save**.

Each email address must be associated with only one employee profile.

---

## Sync the Workspace

After updating the employee record:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

---

## Retry the Export

1. Open the report.
2. Retry exporting to Sage Intacct.

If the employee record exists and the email matches exactly with no duplicates, the export should complete successfully.

---

# FAQ

## Does the Email Need to Match Capitalization Exactly?

Yes. The email must match exactly, including spelling and capitalization.

## Can Multiple Employees Share the Same Email?

No. Each employee record must have a unique email address.

## Do I Need to Reconnect the Integration?

No. Updating the employee record and selecting **Sync Now** is typically sufficient.
