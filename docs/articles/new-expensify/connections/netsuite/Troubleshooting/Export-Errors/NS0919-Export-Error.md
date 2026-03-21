---
title: NS0919 Export Error in NetSuite Integration
description: Learn what the NS0919 export error means and how to update the supervisor’s Expense Limit in NetSuite to allow report approval.
keywords: NS0919, NetSuite approver expense limit, insufficient expense limit NetSuite, supervisor Expense Limit blank NetSuite, approval limit NetSuite export error, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0919 export error caused by supervisor Expense Limit settings in NetSuite. Does not cover approval level configuration in the Workspace.
---

# NS0919 Export Error in NetSuite Integration

If you see the error:

NS0919 Export Error: NetSuite couldn’t find an approver with a sufficient expense limit. Ensure the submitter’s supervisor has a blank 'Expense Limit' in their NetSuite employee record, then retry the export.

This means the supervisor listed on the employee record does not have sufficient approval authority in NetSuite.

NetSuite requires the approver to have an adequate expense limit to approve exported reports.

---

## Why the NS0919 Export Error Happens in NetSuite

The NS0919 error typically occurs when:

- The report creator or submitter’s employee record lists a **Supervisor**.
- The Supervisor’s **Expense Limit** is set to a specific dollar amount.
- The report total exceeds the Supervisor’s Expense Limit.

Important:

- If the **Expense Limit** is set to **$0.00**, NetSuite treats this as a valid limit and will not allow approval of any reports.
- To allow approval of reports of any amount, the **Expense Limit must be blank**.

This is an approval authority configuration issue in NetSuite, not an approval level configuration issue in the Workspace.

---

## How to Fix the NS0919 Export Error

Follow the steps below to update the supervisor’s Expense Limit.

---

## Confirm the Supervisor on the Employee Record

1. Log in to NetSuite as an administrator.
2. Go to **Lists > Employees**.
3. Click **Edit** next to the employee record associated with the report creator.
4. Confirm the name listed in the **Supervisor** field.
5. Click **Save** if any updates are made.

---

## Update the Supervisor’s Expense Limit

1. Go to **Lists > Employees**.
2. Click **Edit** next to the Supervisor’s employee record.
3. Scroll to the **Human Resources** section.
4. Locate the **Expense Limit** field.
5. Confirm the Expense Limit is **blank** (not $0.00).
6. If it is set to $0.00 or another amount:
   - Clear the value so the field is empty.
7. Click **Save**.

The Expense Limit must be blank to allow approval of reports of any amount.

---

## Sync the Workspace and Retry the Export

After updating the supervisor record:

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

If the supervisor’s Expense Limit is blank, the export should complete successfully.

---

# FAQ

## Does the NS0919 Export Error Affect Only Certain Reports?

Yes. This error affects reports where the supervisor’s Expense Limit is lower than the report total.

## Do I Need NetSuite Admin Access to Fix the NS0919 Export Error?

Yes. Updating employee and supervisor records in NetSuite requires administrator permissions.

## Can I Set the Expense Limit to a High Dollar Amount Instead?

Yes. You can set a sufficiently high Expense Limit, but leaving the field blank allows unlimited approval authority.
