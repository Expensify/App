---
title: NS0655 Export Error in NetSuite Integration
description: Learn what the NS0655 export error means and how to assign an active default department on the employee record in NetSuite before exporting.
keywords: NS0655, NetSuite default department inactive, employee department inactive NetSuite, export error department inactive NetSuite, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0655 export error caused by an inactive default department on an employee record. Does not cover expense category or subsidiary mismatches.
---

# NS0655 Export Error in NetSuite Integration

If you see the error:

NS0655 Export Error: NetSuite can’t save the report because the employee’s default department is inactive. Check the employee record in NetSuite and assign an active department.

This means the default **Department** assigned to the employee is inactive in NetSuite.

NetSuite cannot process exports if the employee’s default department is inactive.

---

## Why the NS0655 Export Error Happens in NetSuite

The NS0655 error typically occurs when:

- The report creator or submitter’s employee record includes a default **Department**.
- That department has been marked as **Inactive** in NetSuite.
- NetSuite attempts to save the transaction using the inactive department.

When NetSuite detects an inactive department on the employee record, it blocks the export.

This is an employee department configuration issue, not an expense category or subsidiary mismatch.

---

## How to Fix the NS0655 Export Error

Follow the steps below to update the employee’s default department.

---

## Update the Employee’s Default Department in NetSuite

1. Log in to NetSuite as an administrator.
2. Go to **Lists > Employees**.
3. Locate and open the employee profile associated with the report creator or submitter.
4. Review the **Department** field.
5. Confirm the selected department is active.
6. If the department is inactive:
   - Select a new, active department, or  
   - Reactivate the original department if appropriate.
7. Click **Save**.

---

## Sync the Workspace and Retry the Export

After updating the employee record:

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

If the employee’s default department is active, the export should complete successfully.

---

# FAQ

## Does the NS0655 Export Error Affect Only This Employee?

Yes. This error is specific to the employee record tied to the report being exported.

## Do I Need NetSuite Admin Access to Fix the NS0655 Export Error?

Yes. Updating employee department settings requires NetSuite administrator permissions.

## Can I Reactivate the Inactive Department Instead?

Yes. If appropriate for your accounting structure, you can reactivate the department instead of assigning a new one.
