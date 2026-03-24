---
title: NS0770 Export Error in NetSuite Integration
description: Learn what the NS0770 export error means and how to reactivate or update project tags in NetSuite before exporting.
keywords: NS0770, NetSuite project not active, inactive project export error NetSuite, project can’t accept expenses NetSuite, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0770 export error caused by inactive project records in NetSuite. Does not cover customer resource assignment or subsidiary mismatch issues.
---

# NS0770 Export Error in NetSuite Integration

If you see the error:

NS0770 Export Error: Project [X] is not active and can’t accept expenses. Please update the project tag.

This means the selected project is inactive in NetSuite.

NetSuite does not allow expenses to be exported to inactive or closed projects.

---

## Why the NS0770 Export Error Happens in NetSuite

The NS0770 error typically occurs when:

- A **Project** selected in the Workspace is marked as **Inactive** in NetSuite.
- The project has been closed or archived.
- The project is no longer available for new transactions.

If the project is not active, NetSuite blocks the export.

This is a project status issue, not a customer resource assignment or subsidiary mismatch issue.

---

## How to Fix the NS0770 Export Error

Follow the steps below to correct the project configuration.

---

## Confirm the Project Is Active in NetSuite

1. Log in to NetSuite as an administrator.
2. Go to **Lists > Relationships > Projects**.
3. Locate the project referenced in the error.
4. Confirm the project is marked as **Active**.
5. If the project is inactive:
   - Reactivate the project, or  
   - Select a different active project in the Workspace.
6. Click **Save** if changes are made.

---

## Sync the Workspace and Retry the Export

After confirming or updating the project:

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

Then retry exporting the report.

If the project is active, the export should complete successfully.

---

# FAQ

## Does the NS0770 Export Error Affect Only Project-Tagged Expenses?

Yes. This error appears only when exporting expenses associated with an inactive project.

## Do I Need NetSuite Admin Access to Fix the NS0770 Export Error?

Yes. Reactivating or editing project records in NetSuite requires administrator permissions.

## Can I Fix This by Changing the Project on the Expense?

Yes. Selecting a valid, active project will resolve the error if the original project is inactive.
