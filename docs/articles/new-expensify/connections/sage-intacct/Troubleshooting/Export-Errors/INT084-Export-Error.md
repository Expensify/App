---
title: INT084 Export Error in Sage Intacct Integration
description: Learn what the INT084 export error means and how to verify that all tags and dimensions are active in Sage Intacct before retrying the export.
keywords: INT084, Sage Intacct service line validation error, Sage Intacct inactive tag error, dimension not active Intacct, project department class location export error, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT084 export error caused by invalid or inactive tags or dimensions. Does not cover employee or tax configuration errors.
---

# INT084 Export Error in Sage Intacct Integration

If you see the error:

INT084 Export Error: Sage Intacct couldn’t validate service line [XX]. Check that all tags used on the report exist and are active in Sage Intacct.

This means one or more tags (dimensions) selected on the report are invalid or inactive in Sage Intacct.

Sage Intacct validates all dimensions on each service line before allowing the export.

---

## Why the INT084 Export Error Happens in Sage Intacct

The INT084 error typically occurs when:

- A tag selected on an expense does not exist in Sage Intacct.
- A tag exists but is inactive in Sage Intacct.
- A tag was recently renamed or deleted.
- The Workspace has not synced after dimension changes.

Common tags include:

- **Departments**
- **Classes**
- **Locations**
- **Customers**
- **Projects**
- **User-defined dimensions**

If any selected tag is inactive, deleted, or not properly synced, the export fails.

This is a dimension validation issue, not an employee or tax configuration issue.

---

# How to Fix the INT084 Export Error

Follow the steps below to verify tags and retry the export.

---

## Review Tags on the Report

1. Open the report that failed to export.
2. Review each expense line.
3. Check all selected tags, including:
   - Departments
   - Classes
   - Locations
   - Customers
   - Projects
   - User-defined dimensions
4. Identify any tags that may be outdated or incorrect.

---

## Confirm Tags Are Active in Sage Intacct

1. Log in to Sage Intacct.
2. Navigate to the relevant dimension (for example, Departments or Projects).
3. Locate each tag used on the report.
4. Confirm that each tag:
   - Exists
   - Is marked as **Active**

If a tag is inactive or missing:

- Reactivate it in Sage Intacct, or  
- Update the expense in the report to use a valid, active tag.

Click **Save** after making changes.

---

## Sync the Workspace

After verifying or updating tags:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

This refreshes tag and dimension data from Sage Intacct.

---

## Retry the Export

1. Return to the report.
2. Retry exporting to Sage Intacct.

If all tags are valid and active, the export should complete successfully.

---

# FAQ

## Does This Error Mean the Integration Is Broken?

No. The integration is functioning correctly. The error applies only to the specific report containing invalid or inactive tags.

## Do I Need to Reconnect the Integration?

No. Correcting the tag and selecting **Sync Now** is typically sufficient.

## Can This Error Occur With User-Defined Dimensions?

Yes. User-defined dimensions must also exist and be active in Sage Intacct for the export to succeed.
