---
title: INT028 Export Error in Sage Intacct Integration
description: Learn what the INT028 export error means in Sage Intacct and how to add a required Location to the employee profile to restore successful exports.
keywords: INT028, Sage Intacct export error, employee location required Intacct, missing location employee Sage Intacct, Expensify Sage Intacct integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT028 export error caused by missing employee Location settings. Does not cover other Sage Intacct error codes.
---

# INT028 Export Error in Sage Intacct Integration

If you see the error:

INT028: Sage Intacct requires employees to have a location.

This means the employee associated with the report does not have a **Location** assigned in Sage Intacct, preventing the export from completing.

---

## Why the INT028 Export Error Happens in Sage Intacct

The INT028 error typically indicates:

- The **Location** field is required in Sage Intacct.
- The report creator or submitter’s employee profile does not have a Location assigned.
- Sage Intacct validation failed due to missing required employee data.

If Location is required and not populated on the employee record, Sage Intacct blocks the export.

This is an employee profile configuration issue, not a dimension or approval configuration error.

---

## How to Fix the INT028 Export Error

This issue must be resolved in Sage Intacct.

### Add a Location to the Employee Profile

1. Log in to Sage Intacct.
2. Locate the employee profile associated with the report creator or submitter.
3. Confirm a valid **Location** is listed.
4. If no Location is assigned, add the appropriate Location.
5. Save the employee record.

After updating the employee profile:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After adding a Location and selecting **Sync Now**, retry the export.

## Does Every Employee Need a Location?

Only if Location is configured as required in Sage Intacct.

## Do I Need Sage Intacct Admin Access?

You need sufficient permissions to update employee profiles in Sage Intacct.
