---
title: INT028 Export Error in Sage Intacct Integration
description: Learn what the INT028 export error means and how to add a required Location to the employee profile before retrying the export.
keywords: INT028, Sage Intacct employee location required, employee profile missing Location Intacct, export failure Location field, Sage Intacct employee configuration, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT028 export error caused by missing employee Location settings. Does not cover approval or journal configuration errors.
---

# INT028 Export Error in Sage Intacct Integration

If you see the error:

INT028 Export Error: Sage Intacct requires employees to have a location. Please add a location to the employee profile, sync, and attempt to export the report again.

This means the employee associated with the report does not have a **Location** assigned in Sage Intacct.

If the **Location** field is required and not populated, Sage Intacct blocks the export.

---

## Why the INT028 Export Error Happens in Sage Intacct

The INT028 error typically occurs when:

- The **Location** field is configured as required in Sage Intacct.
- The report creator or submitter’s employee profile does not have a Location assigned.
- Sage Intacct validation fails due to missing required employee data.

This is an employee profile configuration issue, not a coding, dimension, or approval configuration error.

---

# How to Fix the INT028 Export Error

Follow the steps below to update the employee profile and retry the export.

---

## Add a Location to the Employee Profile in Sage Intacct

1. Log in to Sage Intacct.
2. Locate the employee profile for the report creator or submitter.
3. Confirm a valid **Location** is listed.
4. If the Location field is empty, add the appropriate Location.
5. Click **Save**.

---

## Sync the Workspace

After updating the employee profile:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

---

## Retry the Export

1. Open the report.
2. Retry exporting to Sage Intacct.

If the employee profile includes a valid Location, the export should complete successfully.

---

# FAQ

## Does the Location Need to Match a Specific Value?

Yes. The Location must be valid and active in Sage Intacct.

## Does This Error Apply to Vendor Bill Exports?

No. This error applies to employee-based exports that require employee profile validation.

## Do I Need Sage Intacct Admin Permissions to Update the Employee Profile?

Yes. Editing employee records typically requires appropriate administrative permissions in Sage Intacct.
