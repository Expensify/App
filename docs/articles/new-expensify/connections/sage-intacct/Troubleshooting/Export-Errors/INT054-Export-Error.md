---
title: INT054 Export Error in Sage Intacct Integration
description: Learn what the INT054 export error means and how to ensure the employee record and email match before retrying the export.
keywords: INT054, Sage Intacct employee not found, employee email mismatch Sage Intacct, duplicate employee profile Intacct, Sage Intacct Time & Expenses employee, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT054 export error caused by missing, mismatched, or duplicate employee records. Does not cover vendor record or approval configuration errors.
---

# INT054 Export Error in Sage Intacct Integration

If you see the error:

INT054 Export Error: Expensify couldn’t find a matching employee for [X] in Sage Intacct. Ensure the employee exists and the email matches Expensify.

This means Sage Intacct cannot match the report creator or submitter to a valid employee record.

The employee must exist in Sage Intacct, and the email must match exactly.

---

## Why the INT054 Export Error Happens in Sage Intacct

The INT054 error typically occurs when:

- The employee record does not exist in Sage Intacct.
- The employee’s email address does not match the email used in the Workspace.
- Multiple employee profiles exist with the same email address.

Sage Intacct matches employees by email. If it cannot uniquely match the email to a single employee profile, the export fails.

This is an employee record matching issue, not a coding or configuration issue.

---

# How to Fix the INT054 Export Error

Follow the steps below to verify the employee record and retry the export.

---

## Confirm the Employee Record in Sage Intacct

1. Log in to Sage Intacct.
2. Go to **Time & Expenses > Employee**.
3. Locate the employee profile for the report creator or submitter.
4. Confirm that:
   - The employee profile exists.
   - The email address matches the email used in the Workspace exactly.

If the employee does not exist:

1. Create a new employee record.
2. Enter the correct email address.
3. Click **Save**.

---

## Remove Duplicate Employee Profiles

If multiple employee profiles share the same email address:

1. Identify the duplicate profiles.
2. Remove the duplicate email from all but one profile, or
3. Deactivate or delete duplicate employee records if appropriate.

Each employee email must be unique.

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

If the employee record exists and the email matches exactly, the export should complete successfully.

---

# FAQ

## Does the Email Need to Match Capitalization?

Yes. The email address must match exactly, including spelling and capitalization.

## Can Multiple Employees Share the Same Email?

No. Each employee record must have a unique email address for exports to work correctly.

## Do I Need to Reconnect the Integration?

No. Updating the employee record and selecting **Sync Now** is typically sufficient.
