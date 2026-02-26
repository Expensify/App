---
title: INT009 Export Error in Sage Intacct Integration
description: Learn what the INT009 export error means and how to update manager approval settings in Sage Intacct before retrying the export.
keywords: INT009, Sage Intacct manager no user account, expense report approval error Sage Intacct, Time & Expenses approval configuration Intacct, Sage Intacct export failure manager approval, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT009 export error caused by manager approval configuration in Sage Intacct. Does not cover authentication or journal configuration errors.
---

# INT009 Export Error in Sage Intacct Integration

If you see the error:

INT009 Export Error: The employee’s manager doesn’t have a user account in Sage Intacct. Please update the approval settings in Sage Intacct.

This means the employee’s manager listed in Sage Intacct does not have a valid user account.

When **Expense Report Approval** is enabled, Sage Intacct requires managers to have active user accounts in order to route approvals correctly.

---

## Why the INT009 Export Error Happens in Sage Intacct

The INT009 error typically occurs when:

- **Expense Report Approval** is enabled in Sage Intacct.
- The employee record includes a manager.
- The manager does not have an active Sage Intacct user account.

If Sage Intacct cannot assign the report to a valid approver, the export fails.

This error applies specifically to expense report approval workflows.

---

# How to Fix the INT009 Export Error

The resolution depends on whether you use approvals in Sage Intacct.

---

## If You Are Not Using Expense Report Approvals

If you do not use Sage Intacct’s approval workflow, disable it.

### Disable Expense Report Approval in Sage Intacct

1. Log in to Sage Intacct as an administrator.
2. Go to **Time & Expenses > Configure Time & Expenses**.
3. Disable **Expense Report Approval**.
4. Click **Save**.

Then in the Workspace:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Retry exporting the report.

---

## If You Are Using Expense Report Approvals

If approvals are required, the manager must have a valid user account.

### Configure a Valid First Approver in Sage Intacct

1. Log in to Sage Intacct.
2. Go to **Time & Expenses > Configure Time & Expenses**.
3. Set or confirm the **First Approver**.
4. Ensure the approver:
   - Has an active Sage Intacct user account.
   - Has appropriate approval or administrative permissions.
5. Click **Save**.

Then in the Workspace:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Retry exporting the report.

---

# FAQ

## Does the Manager Always Need a User Account?

Only if **Expense Report Approval** is enabled in Sage Intacct.

## Do I Need Sage Intacct Admin Access to Fix This?

Yes. Updating approval settings and creating user accounts requires administrative access in Sage Intacct.

## Does This Error Affect Vendor Bill Exports?

No. This error applies specifically to expense report approval workflows.
