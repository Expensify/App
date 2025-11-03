---
title: Sage Intacct Troubleshooting Guide
description: Learn how to troubleshoot common sync and export errors between Expensify and Sage Intacct with clear, step-by-step solutions.
keywords: [Expensify Classic, Sage Intacct, sync errors, export errors, authentication error, INT009, INT012, INT028, INT043, INT054, credit card configuration, customer not syncing]
---

<div id="expensify-classic" markdown="1">

Synchronizing data between Expensify and Sage Intacct helps automate your accounting workflow—but occasionally, errors can pop up due to incorrect credentials, missing configurations, or sync issues. This guide walks you through how to fix the most common problems.

# Common Sync and Export Errors

## Authentication error

**Error message**  
*Sage Intacct experienced the following error trying to synchronize your workspace: Authentication error.*

**Why this happens**  
This occurs when Expensify can't authenticate the Sage Intacct connection—typically due to incorrect credentials.

**How to fix it**  
1. **Verify your credentials**  
   - Make sure you're using the correct credentials for the `xmlgateway_expensify` web services user.
2. **Add Expensify to Web Services Authorizations**  
   - In Sage Intacct, go to **Company > Setup > Company > Security > Edit**
   - Scroll to **Web Services Authorizations**.
   - Add `expensify` (lowercase) as the Sender ID.
   - Click **Save**.
3. **Retry the connection**
   - Try syncing again.
   - **Tip:** If it still fails, remove and re-add `expensify` in the Web Services list.

---

## Company card expenses exporting to the wrong account

**Behavior**  
Company card transactions are exporting to an unexpected account.

**Why this happens**  
This usually comes from incorrect mapping, export settings, or import source.

**How to fix it**
1. **Check how the expense was imported**  
   - **Company card import**: Expenses with a **locked card icon** follow Domain Control mapping rules.  
   - **Other imports**: Manually created expenses or SmartScanned receipts export to the default account in your connection settings.
2. **Confirm card mapping**  
   - Go to **Settings > Domains > [Domain Name] > Company Cards** to check mapping.
3. **Merge SmartScanned receipts**  
   - If receipts should merge with card transactions, review and merge them manually.
4. **Verify export options**  
   - Go to **Settings > Workspaces > [Workspace Name] > Accounting > Export**.
   - For non-reimbursable expenses, select **Credit Card**.
5. **Check workspace mapping**  
   - If multiple workspaces connect to the same accounting system, confirm each workspace is exporting correctly.

---

## Credit card configuration is missing

**Error message**  
*Sage Intacct: Credit Card Configuration is Missing / You haven’t yet set up credit cards in Sage Intacct.*

**Why this happens**  
A configured credit card account is required in Sage Intacct to export non-reimbursable expenses.

**How to fix it**
1. **Set up a credit card account in Sage Intacct**  
   - Go to **Cash Management > Setup > + Charge Card Accounts**
   - Fill in:
     - **ID**: Recognizable name for the account
     - **Payment Method**: Credit
     - **Credit-card offset account**: The offset account to credit
     - **Expiration**: Required, but not critical
     - **Vendor ID**: Typically your bank or provider
2. **Link the account in Expensify**  
   - Go to **Settings > Workspaces > [Workspace Name] > Accounting > Export**
   - Select the newly created charge card account

---

## Customers or projects not showing in Expensify

**Behavior**  
Customers or projects from Sage Intacct are missing from Expensify.

**Why this happens**  
The web services user in Sage Intacct doesn’t have the necessary permissions.

**How to fix it**
1. **Verify user permissions in Sage Intacct**  
   - Go to **Company > Users > Subscriptions**
   - Ensure the `xmlgateway_expensify` user has **Read-Only** access to **Accounts Receivable (AR)**
2. **Sync the connection in Expensify**  
   - Go to **Settings > Workspaces > [Workspace Name] > Accounting >** click the **three-dot icon** next to the connection and select **Sync Now**

---

## ExpensiError INT009: Employee manager does not have a user associated

**Why this happens**  
The assigned manager for an employee in Sage Intacct doesn’t have a user profile.

**How to fix it**

- **If not using approvals**:
  1. In Sage Intacct, go to **Time & Expenses > Configure Time & Expenses**
  2. Disable **Expense Report Approval**
  3. In Expensify, go to **Settings > Workspaces > [Workspace Name] > Accounting >** click the **three-dot icon** next to the connection and select **Sync Now**

- **If using approvals**:
  1. Set the **First Approver** in **Time & Expenses > Configure Time & Expenses**
  2. Ensure the approver is a Sage Intacct admin

---

## ExpensiError INT012: “Reason for Expense” note is invalid

**Why this happens**  
The “Reason for Expense” field is required in Sage Intacct but wasn’t filled in.

**How to fix it**
1. In Sage Intacct, go to **Time & Expenses > Configure Time & Expenses**
2. Under **Expense Report Requirements**, uncheck **Reason for Expense**

---

## ExpensiError INT028: Use of an empty location is invalid

**Why this happens**  
The employee’s profile is missing a required Location field in Sage Intacct.

**How to fix it**
1. Add a **Location** to the employee profile in Sage Intacct
2. Sync the connection:
   - Go to **Settings > Workspaces > [Workspace Name] > Accounting >** click the **three-dot icon** next to the connection and select **Sync Now**
3. Retry exporting the report

---

## ExpensiError INT043: Not authorized to execute this function

**Why this happens**  
The `xmlgateway_expensify` user doesn’t have permission to perform the required action.

**How to fix it**
1. **Enable permissions in Sage Intacct**
   - **User-based**: Go to **Company > Users > Subscriptions**
   - **Role-based**: Go to **Company > Roles > Subscriptions**
   - Required permissions:
     - **Administration**: All
     - **Company**: Read-only
     - **Cash Management**: All
     - **Time and Expense**: All
     - **General Ledger**: All
     - **Projects**: Read-only
     - **Accounts Payable**: All
2. **Sync the connection in Expensify**  
   - Go to **Settings > Workspaces > [Workspace Name] > Accounting >** click the **three-dot icon** next to the connection and select **Sync Now**
3. Retry exporting

---

## ExpensiError INT054: No Sage Intacct employee found

**Why this happens**  
Expensify can’t match the report submitter to an employee in Sage Intacct.

**How to fix it**
1. **Check the employee record in Sage Intacct**  
   - Go to **Time & Expenses > + Employee**
   - Ensure the email matches the member's email in Expensify
2. **Remove duplicate employees** if they exist
3. **Sync the connection**  
   - Go to **Settings > Workspaces > [Workspace Name] > Accounting >** click the **three-dot icon** next to the connection and select **Sync Now**

</div>
