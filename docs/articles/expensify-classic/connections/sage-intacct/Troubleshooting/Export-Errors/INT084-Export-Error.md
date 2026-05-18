---
title: INT084 Export Error in Sage Intacct Integration
description: Learn what the INT084 export error means in Sage Intacct and how to resolve invalid or inactive tags before retrying your export.
keywords: INT084, Sage Intacct service line validation error, Sage Intacct tag inactive, Sage Intacct export error, department class location project dimension error, Sync Now Sage Intacct, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT084 export error caused by invalid or inactive tags. Does not cover integration setup or permission configuration errors.
---

# INT084 Export Error in Sage Intacct Integration

If you see the error:

INT084 Export Error: Sage Intacct couldn’t validate service line [XX]. Check that all tags used on the report exist and are active in Sage Intacct.

This means Sage Intacct rejected the export because one or more tags on the report are invalid or inactive.

Sage Intacct requires all dimensions used on a service line to exist and be active.

---

## Why the INT084 Export Error Happens in Sage Intacct

The INT084 error typically indicates:

- A tag selected on an expense does not exist in Sage Intacct.
- A tag exists in Sage Intacct but is marked inactive.
- Sage Intacct validation failed because a required dimension is invalid.

Common tags include:

- Departments  
- Classes  
- Locations  
- Customers  
- Projects  
- User-Defined Dimensions  

If any of these are inactive or missing in Sage Intacct, the export will fail.

This is a dimension or tag configuration issue, not an integration setup or permission error.

---

## How to Fix the INT084 Export Error

Follow the steps below to correct the issue and retry the export.

### Review Tags on the Report in Expensify

1. Open the report that failed to export.
2. Review each expense on the report.
3. Check all selected tags, including Departments, Classes, Locations, Customers, Projects, and User-Defined Dimensions.
4. Identify any tag that may be incorrect or outdated.
5. Update any incorrect tags.

### Confirm Tags Are Active in Sage Intacct

1. Log in to Sage Intacct.
2. Navigate to the relevant dimension, such as Department or Project.
3. Search for the tag used on the expense.
4. Confirm the tag exists and is active.

If the tag is inactive or missing:

- Reactivate the tag in Sage Intacct, or  
- Update the expense to use a valid, active tag  

After updating Sage Intacct:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

# FAQ

## Does the INT084 Error Mean the Integration Is Broken?

No. The integration is still functioning. The error applies only to the specific report containing invalid or inactive tags.

## Do I Need to Reconnect Sage Intacct?

No. In most cases, correcting the tag and selecting **Sync Now** resolves the issue.

## What If the Error Continues After Syncing?

Double-check that:

- Every expense line uses a valid tag.
- The tag is active in Sage Intacct.
- There are no renamed or deleted dimensions.

If everything appears correct, review the service line referenced in the error message for additional details.
