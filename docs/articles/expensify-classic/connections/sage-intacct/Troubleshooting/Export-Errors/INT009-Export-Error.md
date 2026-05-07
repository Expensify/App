---
title: INT009 Export Error in Sage Intacct Integration
description: Learn what the INT009 export error means in Sage Intacct and how to update approval settings to restore successful exports.
keywords: INT009, Sage Intacct export error, manager no user account Sage Intacct, expense report approval error Intacct, Time and Expenses approval configuration, Expensify Sage Intacct integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT009 export error caused by manager approval configuration in Sage Intacct. Does not cover other Sage Intacct error codes.
---

# INT009 Export Error in Sage Intacct Integration

If you see the error:

INT009: The employee’s manager doesn’t have a user account in Sage Intacct.

This means the employee’s manager listed in Sage Intacct does not have a valid user account, preventing the export from completing.

Sage Intacct requires managers to have user accounts when Expense Report Approval is enabled.

---

## Why the INT009 Export Error Happens in Sage Intacct

The INT009 error typically indicates:

- Expense Report Approval is enabled in Sage Intacct.
- The employee’s manager does not have an active Sage Intacct user account.
- Sage Intacct cannot assign the report to a valid approver.

If Sage Intacct cannot assign the report to a configured approver, the export fails.

This is an approval configuration issue, not an authentication or journal configuration issue.

---

## How to Fix the INT009 Export Error

The resolution depends on whether approvals are required in Sage Intacct.

---

## If You Are Not Using Approvals

### Disable Expense Report Approval

1. Log in to Sage Intacct.
2. Go to **Time & Expenses > Configure Time & Expenses**.
3. Disable **Expense Report Approval**.
4. Save your changes.

Then:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Retry exporting the report.

---

## If You Are Using Approvals

### Configure a Valid Approver

1. Log in to Sage Intacct.
2. Go to **Time & Expenses > Configure Time & Expenses**.
3. Set the **First Approver**.
4. Ensure the approver:
   - Has an active Sage Intacct user account.
   - Has appropriate admin or approval permissions.
5. Save your changes.

Then:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After updating approval settings and selecting **Sync Now**, retry the export.

## Does INT009 Always Mean the Manager Is Missing?

Yes, if Expense Report Approval is enabled. The manager must have an active Sage Intacct user account.

## Do I Need Sage Intacct Admin Access?

Yes. Updating approval settings and user accounts requires appropriate permissions in Sage Intacct.
