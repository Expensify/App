---
title: INT149 Export Error in Sage Intacct Integration
description: Learn what the INT149 export error means in Sage Intacct and how to resolve employee email mismatches or duplicate employee records to restore successful exports.
keywords: INT149, Sage Intacct employee not found, Sage Intacct duplicate employee email, employee record export error, Sage Intacct email mismatch, Expensify Sage Intacct integration, Sync Now Sage Intacct, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT149 export error caused by missing or duplicate employee records based on email address. Does not cover user permission or role configuration errors.
---

# INT149 Export Error in Sage Intacct Integration

If you see the error:

INT149 Export Error: The employee record couldn’t be found in Sage Intacct. Ensure the employee record exists, the email matches Expensify exactly, and there are no duplicate employee records using the same email.

This means Sage Intacct cannot match the report submitter’s email address to a single employee record.

Sage Intacct requires each employee email to match exactly and be tied to only one employee profile.

---

## Why the INT149 Export Error Happens in Sage Intacct

The INT149 error typically indicates:

- The report creator’s email in Expensify does not exist on any employee record in Sage Intacct.
- The same email address is assigned to multiple employee records in Sage Intacct.
- Sage Intacct validation failed because the email could not be uniquely matched.

If Sage Intacct cannot uniquely match the email address to a single employee profile, the export fails.

This is an employee record configuration issue, not a permission or role configuration error.

---

## How to Fix the INT149 Export Error

Follow the steps below to correct the employee record and retry the export.

### Verify the Employee Record in Sage Intacct

1. Log in to Sage Intacct.
2. Locate the employee record for the report creator or submitter.
3. Confirm the email address:
   - Matches the email used in Expensify exactly.
   - Is assigned to only one employee record.

### Update the Employee Email in Sage Intacct

If the employee record exists but does not list the correct email address:

1. Add or update the email address on the employee profile.
2. Save your changes.

If multiple employee records use the same email address:

1. Remove the email address from all but one employee record.
2. Ensure only one employee profile contains that email.
3. Save your changes.

Each email address must be tied to a single employee profile.

After correcting the employee record:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

# FAQ

## Does the Email Have to Match Exactly?

Yes. The email address in Sage Intacct must match the report submitter’s email in Expensify exactly, including spelling and formatting.

## Can Multiple Employees Share the Same Email Address?

No. Each employee record in Sage Intacct must have a unique email address for exports to work correctly.

## Does This Error Mean the Employee Is Not Active?

Not necessarily. The error is related specifically to email matching and duplicate records, not employee status.
