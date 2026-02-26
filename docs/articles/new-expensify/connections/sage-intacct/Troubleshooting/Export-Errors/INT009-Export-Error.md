---
title: INT009 Export Error: Employee’s Manager Doesn’t Have a User Account in Sage Intacct
description: Learn why the INT009 export error occurs and how to update approval settings in Sage Intacct before retrying the export.
keywords: INT009, Sage Intacct manager no user account, expense report approval error, Time and Expenses approval configuration, Sage Intacct export failure
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers the INT009 export error related to manager approval configuration in Sage Intacct. Does not cover authentication or journal configuration errors.
---

# INT009 Export Error: Employee’s Manager Doesn’t Have a User Account in Sage Intacct

If you see the error message:

**“INT009 Export Error: The employee’s manager doesn’t have a user account in Sage Intacct. Please update the approval settings in Sage Intacct.”**

It means the employee’s manager listed in Sage Intacct does not have a valid user account.

Sage Intacct requires managers to have user accounts when Expense Report Approval is enabled.

---

## Why the INT009 Export Error Happens

The INT009 export error occurs when:

- Expense Report Approval is enabled in Sage Intacct, and  
- The employee’s manager does not have an active Sage Intacct user account  

If Sage Intacct cannot assign the report to a valid approver, the export fails.

---

# How to Fix the INT009 Export Error

The resolution depends on whether you are using approvals in Sage Intacct.

---

## If You Are Not Using Approvals

### Step 1: Disable Expense Report Approval in Sage Intacct

1. Log in to Sage Intacct.  
2. Go to **Time & Expenses > Configure Time & Expenses**.  
3. Disable **Expense Report Approval**.  
4. Save your changes.  

### Step 2: Run Sync

1. Go to **Workspaces > [Workspace Name] > Accounting**.  
2. Click the three-dot icon next to the Sage Intacct connection.  
3. Select **Sync Now** from the dropdown.  

Retry exporting the report.

---

## If You Are Using Approvals

### Step 1: Configure a Valid First Approver in Sage Intacct

1. Log in to Sage Intacct.  
2. Go to **Time & Expenses > Configure Time & Expenses**.  
3. Set the **First Approver**.  
4. Ensure the approver:
   - Has an active Sage Intacct user account  
   - Has appropriate admin or approval permissions  
5. Save your changes.  

### Step 2: Run Sync

1. Go to **Workspaces > [Workspace Name] > Accounting**.  
2. Click the three-dot icon next to the Sage Intacct connection.  
3. Select **Sync Now** from the dropdown.  

Retry exporting the report.

---

# FAQ

## Does the manager always need a user account?

Only if Expense Report Approval is enabled in Sage Intacct.

## Do I need Sage Intacct admin access to fix this?

Yes. Updating approval settings and user accounts requires appropriate permissions in Sage Intacct.

## Does this error affect vendor bill exports?

No. This error specifically applies to expense report approval workflows.
