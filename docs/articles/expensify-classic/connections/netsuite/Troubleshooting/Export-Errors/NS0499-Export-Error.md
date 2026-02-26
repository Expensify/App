---
title: NS0499 Export Error in NetSuite Integration
description: Learn how to fix the NS0499 export error in NetSuite when an expense category is not available to the report submitter’s subsidiary.
keywords: NS0499, NetSuite category not available to submitter, expense category subsidiary mismatch, employee subsidiary mismatch NetSuite, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0499 export error caused by subsidiary mismatches between expense categories and employee records. Does not cover other NetSuite error codes.
---

# NS0499 Export Error in NetSuite Integration

If you see the error:

NS0499: NetSuite category [X] isn’t available to the report submitter. Verify that the expense category and the submitter’s employee record are on the same subsidiary in NetSuite.

This means the expense category used on the report is not available to the subsidiary assigned to the report submitter’s employee record in NetSuite.

---

## Why the NS0499 Export Error Happens in NetSuite

The NS0499 error occurs when:

- The expense category in Expensify is linked to a NetSuite account assigned to a different subsidiary.
- The report submitter’s employee record is assigned to a different subsidiary.
- The category is not enabled for the employee’s subsidiary.
- The Workspace has not been synced after subsidiary changes.

NetSuite requires that the expense category and employee record belong to the same subsidiary.

---

## How to Fix the NS0499 Export Error

### Step One: Confirm the Employee’s Subsidiary in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Go to **Lists**.
3. Select **Employees**.
4. Locate the employee record associated with the report submitter’s email.
5. Confirm the **Subsidiary** assigned to the employee.
6. Save if any changes are made.

---

### Step Two: Confirm the Expense Category’s Subsidiary

1. In NetSuite, navigate to the **Chart of Accounts** or the relevant expense category.
2. Open the account associated with the category used in Expensify.
3. Confirm the account is assigned to the same subsidiary as the employee.
4. If not, add the expense category to the correct subsidiary.
5. Save your changes.

---

### Step Three: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

---

### Step Four: Retry the Export

1. Open the report in Expensify.
2. Confirm the correct expense category is selected.
3. Retry exporting to NetSuite.

Once the employee and expense category share the same subsidiary, the export should complete successfully.

---

# FAQ

## Does NS0499 Mean the Category Is Deleted?

No. The category may exist but is not assigned to the same subsidiary as the employee.

## Do I Need to Reconnect NetSuite?

No. Updating the subsidiary assignment and running **Sync** is usually sufficient.
