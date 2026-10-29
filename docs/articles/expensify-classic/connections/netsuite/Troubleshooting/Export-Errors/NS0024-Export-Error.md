---
title: NS0024 Export Error in NetSuite Integration
description: Learn how to fix the NS0024 export error in NetSuite when an employee is not listed as a resource on a customer or project.
keywords: NS0024, NetSuite invalid customer tag, NetSuite invalid project tag, employee not listed as resource NetSuite, customer project resource error, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0024 export error caused by missing employee resource assignments on customers or projects. Does not cover other NetSuite error codes.
---

# NS0024 Export Error in NetSuite Integration

If you see the error:

NS0024: Invalid 'customer' or 'project' tag. Please make sure the employee is listed as a resource on the 'customer' or 'project' in NetSuite.

This means the report creator is not assigned as a resource on the selected customer or project in NetSuite.

---

## Why the NS0024 Export Error Happens in NetSuite

The NS0024 error occurs when:

- A customer or project tag is selected on the report in Expensify.
- The employee record for the report creator is not listed as a resource on that customer or project in NetSuite.
- NetSuite requires resource assignments for project-based transactions.

If the employee is not assigned as a resource, NetSuite will reject the export.

---

## How to Fix the NS0024 Export Error

### Step One: Add the Employee as a Resource in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Go to **Lists**.
3. Select **Relationships**.
4. Click **Customers/Projects**.
5. Open the relevant customer or project used on the report.
6. Edit the record.
7. Locate the **Resources** section.
8. Add the report creator’s employee record as a resource.
9. Save the changes.

---

### Step Two: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

---

### Step Three: Retry the Export

1. Open the report in Expensify.
2. Retry exporting to NetSuite.

Once the employee is listed as a resource on the customer or project, the export should complete successfully.

---

# FAQ

## Does This Apply to All Customers or Projects?

Only customers or projects selected on billable transactions require the employee to be assigned as a resource.

## Does NS0024 Mean the Customer or Project Is Missing?

No. The customer or project exists, but the employee is not assigned as a resource.
