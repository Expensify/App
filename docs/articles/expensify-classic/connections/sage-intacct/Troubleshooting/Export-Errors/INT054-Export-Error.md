---
title: INT054 Export Error in Sage Intacct Integration
description: Learn what the INT054 export error means in Sage Intacct and how to match employee records between Expensify and Sage Intacct to restore successful exports.
keywords: INT054, Sage Intacct employee not found, employee email mismatch Intacct, duplicate employee Intacct, Expensify Sage Intacct integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT054 export error caused by missing or mismatched employee records in Sage Intacct. Does not cover approval or journal configuration errors.
---

# INT054 Export Error in Sage Intacct Integration

If you see the error:

INT054 Export Error: Expensify couldn’t find a matching employee for [X] in Sage Intacct. Ensure the employee exists and the email matches Expensify.

This means Expensify cannot locate a matching employee record in Sage Intacct for the report creator or submitter.

The employee must exist in Sage Intacct, and the email address must match exactly.

---

## Why the INT054 Export Error Happens in Sage Intacct

The INT054 error typically indicates:

- The employee record does not exist in Sage Intacct.
- The email address in Sage Intacct does not match the email used in Expensify.
- There are duplicate employee records with the same email address.
- Sage Intacct validation failed because the employee could not be uniquely matched.

If Expensify cannot match the employee by email, the export will fail.

This is an employee record configuration issue, not an approval or journal configuration error.

---

## How to Fix the INT054 Export Error

This issue must be resolved in Sage Intacct.

### Confirm the Employee Exists and Email Matches in Sage Intacct

1. Log in to Sage Intacct.
2. Go to **Time & Expenses > Employee**.
3. Locate the employee profile for the report creator or submitter.
4. Confirm the **email address** matches exactly what is used in Expensify.
5. Save any changes.

### Remove Duplicate Employee Records in Sage Intacct

1. Identify any duplicate employee profiles using the same email address.
2. Deactivate or remove duplicate records as appropriate.
3. Ensure only one active employee record uses the matching email address.
4. Save your changes.

Duplicate records can prevent Expensify from correctly matching the employee.

After updating employee records:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

# FAQ

## Does the Email Address Need to Match Exactly?

Yes. The email address in Sage Intacct must exactly match the email used in Expensify.

## Do I Need Sage Intacct Admin Access?

You need sufficient permissions in Sage Intacct to view and edit employee records.
