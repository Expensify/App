---
title: NS0655 Export Error in NetSuite Integration
description: Learn how to fix the NS0655 export error in NetSuite when an employee’s default department is inactive.
keywords: NS0655, NetSuite employee default department inactive, inactive department NetSuite employee, default department error NetSuite, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0655 export error caused by an inactive default department on the employee record. Does not cover other NetSuite error codes.
---

# NS0655 Export Error in NetSuite Integration

If you see the error:

NS0655: NetSuite can’t save the report because the employee’s default department is inactive. Check the employee record in NetSuite and assign an active department.

This means the employee record in NetSuite has a default department that is no longer active.

---

## Why the NS0655 Export Error Happens in NetSuite

The NS0655 error occurs when:

- The report creator’s employee record has a **default Department** assigned.
- That Department was made inactive in NetSuite.
- NetSuite requires an active default department to complete the transaction.

NetSuite will not allow the export if the employee’s default classification is inactive.

---

## How to Fix the NS0655 Export Error

### Step One: Update the Employee’s Default Department in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Go to **Lists**.
3. Select **Employees**.
4. Locate the employee record associated with the report creator’s email address.
5. Click **Edit**.
6. Review the **Department** field.
7. Confirm the default Department:
   - Is active.
   - Is valid for the employee’s subsidiary.
8. If the department is inactive, select an active department.
9. Save the employee record.

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

Once the employee’s default department is active, the export should complete successfully.

---

# FAQ

## Does NS0655 Mean the Department Was Deleted?

Not necessarily. The department may still exist but is marked as inactive.

## Do I Need to Reconnect NetSuite?

No. Updating the employee record and running **Sync** is typically sufficient.
