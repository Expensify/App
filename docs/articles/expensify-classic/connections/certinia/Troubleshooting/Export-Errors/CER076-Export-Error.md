---
title: CER076 Export Error in Certinia Integration
description: Learn what the CER076 export error means in Certinia and how to update the employee record to restore successful exports.
keywords: CER076, Certinia export error, employee not found Certinia, employee email mismatch, Expensify Certinia sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the Certinia integration. Covers resolving the CER076 export error caused by missing or mismatched employee email records. Does not cover other Certinia error codes.
---

# CER076 Export Error in Certinia Integration

If you see the error:

CER076: Employee not found in Certinia.

This means Certinia cannot match the report creator or submitter’s email address to an employee record, preventing the export from completing.

---

## Why the CER076 Export Error Happens in Certinia

The CER076 error typically indicates:

- The Expensify email address is not added to the employee record in Certinia.
- The email address is linked to multiple employee records.
- Certinia cannot uniquely match the report to a valid employee.

Certinia requires the email address in Expensify to match exactly one employee record.

This is a Certinia employee record configuration issue, not a Workspace configuration issue.

---

## How to Fix the CER076 Export Error

This issue must be resolved in Certinia.

1. Log in to Certinia.
2. Go to **Contacts**.
3. Locate the employee record for the report creator or submitter.
4. Add the user’s Expensify email address to the employee record.
5. Save your changes.

If the email address already exists:

- Confirm it matches exactly.
- Ensure it is associated with only one employee record.

After updating the employee record:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After correcting the employee email and selecting **Sync Now**, retry the export. If the error persists, confirm the email matches exactly and is not duplicated.

## Does CER076 Mean the Employee Does Not Exist?

Not necessarily. It means Certinia cannot find a matching employee based on the email address.

## Is CER076 Caused by Workspace Settings?

No. CER076 is triggered by a missing or mismatched employee record in Certinia. Workspace accounting settings are not the cause.
