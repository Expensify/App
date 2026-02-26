---
title: INT028 Export Error: Employee Location Is Required in Sage Intacct
description: Learn why the INT028 export error occurs and how to add a required Location to the employee profile before retrying the export.
keywords: INT028, Sage Intacct employee location required, employee profile missing location, export failure location field, Sage Intacct employee configuration
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers the INT028 export error related to missing employee Location fields. Does not cover approval or journal configuration errors.
---

# INT028 Export Error: Employee Location Is Required in Sage Intacct

If you see the error message:

**“INT028 Export Error: Sage Intacct requires employees to have a location. Please add a location to the employee profile, sync, and attempt to export the report again.”**

It means the employee associated with the report does not have a **Location** assigned in Sage Intacct.

If the Location field is required and missing, Sage Intacct blocks the export.

---

## Why the INT028 Export Error Happens

The INT028 export error occurs when:

- The **Location** field is required for employees in Sage Intacct, and  
- The report creator or submitter does not have a Location assigned in their employee profile  

Sage Intacct requires all mandatory employee fields to be populated before transactions can be created.

---

# How to Fix the INT028 Export Error

Follow the steps below to update the employee profile and retry the export.

---

## Step 1: Add a Location to the Employee Profile in Sage Intacct

1. Log in to Sage Intacct.  
2. Locate the employee profile for the report creator or submitter.  
3. Confirm that a valid **Location** is listed.  
4. If the Location field is empty, add the appropriate Location.  
5. Save your changes.  

---

## Step 2: Run Sync

1. Go to **Workspaces > [Workspace Name] > Accounting**.  
2. Click the three-dot icon next to the Sage Intacct connection.  
3. Select **Sync Now** from the dropdown.  

---

## Step 3: Retry the Export

Return to the report and retry the export.

If the employee profile includes a valid Location, the export should complete successfully.

---

# FAQ

## Does the Location need to match a specific value?

Yes. The Location must be valid and active in Sage Intacct.

## Does this error apply to vendor bill exports?

No. This error applies to employee-based exports that require employee profile validation.

## Do I need Sage Intacct admin permissions to update the employee profile?

Yes. Editing employee records typically requires appropriate administrative permissions in Sage Intacct.
