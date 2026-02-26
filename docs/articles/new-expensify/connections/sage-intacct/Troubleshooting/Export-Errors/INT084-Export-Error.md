---
title: INT084 Export Error: Sage Intacct Couldn’t Validate Service Line
description: Learn why the INT084 export error occurs and how to verify tags are active in Sage Intacct before retrying the export.
keywords: INT084, service line validation error, Sage Intacct tag inactive, dimension not active Sage Intacct, project department class location error, sync tag configuration
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers the INT084 export error related to invalid or inactive tags. Does not cover employee or tax configuration errors.
---

# INT084 Export Error: Sage Intacct Couldn’t Validate Service Line

If you see the error message:

**“INT084 Export Error: Sage Intacct couldn’t validate service line [XX]. Check that all tags used on the report exist and are active in Sage Intacct.”**

It means one or more tags selected on the report are invalid or inactive in Sage Intacct.

Sage Intacct validates all dimensions on each service line before allowing the export.

---

## Why the INT084 Export Error Happens

The INT084 export error occurs when:

- A tag selected on an expense does not exist in Sage Intacct, or  
- A tag exists but is inactive in Sage Intacct  

Tags can include:

- Departments  
- Classes  
- Locations  
- Customers  
- Projects  
- User-defined dimensions  

If any selected tag is inactive, deleted, or not properly synced, the export will fail.

---

# How to Fix the INT084 Export Error

Follow the steps below to verify tags and retry the export.

---

## Step 1: Review Tags on the Report

1. Open the report that failed to export.  
2. Review each expense line.  
3. Check all selected tags, including:
   - Departments  
   - Classes  
   - Locations  
   - Customers  
   - Projects  
   - User-defined dimensions  

Identify any tags that may be outdated or incorrect.

---

## Step 2: Confirm Tags Are Active in Sage Intacct

1. Log in to Sage Intacct.  
2. Locate each tag referenced on the report.  
3. Confirm that each tag:
   - Exists  
   - Is active  

If a tag is inactive or missing:

- Reactivate it in Sage Intacct, or  
- Update the expense in the report to use a valid, active tag  

Save any changes.

---

## Step 3: Run Sync

1. Go to **Workspaces > [Workspace Name] > Accounting**.  
2. Click the three-dot icon next to the connection.  
3. Select **Sync Now** from the dropdown.  

This refreshes tag and dimension data.

---

## Step 4: Retry the Export

Return to the report and retry the export.

If all tags are valid and active in Sage Intacct, the export should complete successfully.

---

# FAQ

## Does this error mean the integration is broken?

No. The integration is functioning. The error only applies to the specific report containing invalid or inactive tags.

## Do I need to reconnect the integration?

No. Correcting the tag and running **Sync Now** is typically sufficient.

## Can this error occur with user-defined dimensions?

Yes. User-defined dimensions must also exist and be active in Sage Intacct.
