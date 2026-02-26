---
title: INT480 Export Error in Sage Intacct Integration
description: Learn what the INT480 export error means and how to associate the report submitter with the correct project in Sage Intacct before exporting.
keywords: INT480, Sage Intacct project resource error, report submitter not resource, Sage Intacct project association error, project resource export failure, Sync Now Sage Intacct, Expensify Sage Intacct integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT480 export error caused by project resource assignment issues. Does not cover category, tax, or vendor configuration errors.
---

# INT480 Export Error in Sage Intacct Integration

If you see the error:

INT480 Export Error: The report submitter is not a resource of project [X] in Sage Intacct. Please ensure the submitter is part of the project in Sage Intacct.

This means the person who created or submitted the report is not assigned as a resource to the selected project in Sage Intacct.

Sage Intacct requires employees to be associated with a project before expenses tied to that project can be exported.

---

## Why the INT480 Export Error Happens in Sage Intacct

The INT480 error typically indicates:

- A project is selected on one or more expenses.
- The report creator or submitter is not listed as a resource on that project in Sage Intacct.
- Sage Intacct validation failed because the employee is not associated with the project.

If the employee is not assigned as a resource to the project, Sage Intacct blocks the export.

This is a project resource configuration issue, not a category, tax, or vendor configuration error.

---

## How to Fix the INT480 Export Error

Follow the steps below to associate the submitter with the correct project and retry the export.

### Locate the Project in Sage Intacct

1. Log in to Sage Intacct.
2. Search for the project using the project ID listed in the error message.
3. Open the project record.

### Confirm the Submitter Is a Project Resource

1. Review the project’s assigned resources.
2. Confirm that the report creator or submitter is listed as a resource.
3. If the employee is not listed:
   - Add the employee as a resource to the project.
   - Click **Save**.

### Sync the Workspace in Expensify

After updating the project:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

### Retry the Export

1. Open the report.
2. Confirm the correct project is selected on each expense.
3. Retry exporting to Sage Intacct.

If the submitter is properly assigned as a resource to the project, the export should complete successfully.

---

# FAQ

## Does Every Employee Need to Be Added as a Project Resource?

Yes. Any employee submitting expenses tied to a project must be assigned as a resource to that project in Sage Intacct.

## Can I Fix This by Changing the Project on the Expense?

Yes. If the selected project is incorrect, update the expense to use a project where the submitter is already assigned as a resource.

## Does This Error Affect Non-Project Expenses?

No. This error only occurs when a project is selected and the submitter is not associated with that project in Sage Intacct.
