---
title: NS0024 Export Error in NetSuite Integration
description: Learn what the NS0024 export error means and how to add the employee as a resource on the related customer or project in NetSuite before exporting.
keywords: NS0024, NetSuite invalid customer tag, invalid project tag NetSuite, employee not listed as resource NetSuite, customer project export error, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0024 export error caused by missing employee resource assignments on customers or projects. Does not cover role permission or subsidiary mismatch issues.
---

# NS0024 Export Error in NetSuite Integration

If you see the error:

NS0024 Export Error: Invalid 'customer' or 'project' tag. Please make sure the employee is listed as a resource on the 'customer' or 'project' in NetSuite.

This means the employee is not assigned as a resource to the selected customer or project in NetSuite.

NetSuite requires the employee to be listed as a resource in order to associate transactions with that customer or project.

---

## Why the NS0024 Export Error Happens in NetSuite

The NS0024 error typically occurs when:

- A **Customer** or **Project** is selected on the expense or report.
- The report creator or submitter is not listed as a **resource** on that customer or project in NetSuite.
- NetSuite validation fails because the employee is not authorized to post transactions to that record.

If the employee is not assigned as a resource, NetSuite will reject the export.

This is a customer or project resource configuration issue, not a role permission or subsidiary mismatch issue.

---

## How to Fix the NS0024 Export Error

Follow the steps below to add the employee as a resource and retry the export.

### Add the Employee as a Resource in NetSuite

1. Log in to NetSuite as an administrator.
2. Go to **Lists > Relationships > Customers/Projects**.
3. Locate and edit the relevant customer or project.
4. Navigate to the **Resources** section.
5. Add the employee associated with the report creator or submitter.
6. Click **Save**.

### Sync the Workspace in Expensify

After updating the customer or project:

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot menu next to the NetSuite connection.
5. Click **Sync Now**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the three-dot menu next to the NetSuite connection.
5. Tap **Sync Now**.

### Retry the Export

1. Open the report.
2. Retry exporting to NetSuite.

If the employee is properly assigned as a resource to the selected customer or project, the export should complete successfully.

---

# FAQ

## Does the NS0024 Export Error Affect Only Project-Based Exports?

Yes. This error appears when a customer or project is selected and the employee is not assigned as a resource in NetSuite.

## Do I Need NetSuite Admin Access to Fix the NS0024 Export Error?

Yes. Editing customers, projects, and resource assignments in NetSuite requires appropriate administrator permissions.

## Can I Fix This by Changing the Customer or Project on the Report?

Yes. If the selected customer or project is incorrect, you can update the expense to use one where the employee is already assigned as a resource.
