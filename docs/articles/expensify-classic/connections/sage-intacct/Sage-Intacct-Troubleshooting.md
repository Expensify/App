---
title: Sage-Intacct-Troubleshooting.md
description: Learn how to troubleshoot common synchronization and export errors between Expensify and Sage Intacct.
keywords: [Sage Intacct, troubleshooting, sync errors, export errors, Expensify integration]
---

<div id="expensify-classic" markdown="1">

Synchronizing and exporting data between Expensify and Sage Intacct streamlines financial processes, but errors can occasionally occur due to incorrect settings, missing data, or configuration issues. This guide outlines solutions to common issues, ensuring a seamless connection between your systems.

---

# Common Sage Intacct Sync & Export Errors

## Authentication Error

**Error Message:**  
*Sage Intacct experienced the following error trying to synchronize your workspace: Authentication error.*

### Why This Happens  
This error occurs when Expensify cannot authenticate the Sage Intacct connection due to incorrect credentials.

### How to Fix It  
1. **Verify Credentials**  
   - Ensure you are using the correct credentials for your `xmlgateway_expensify` web services user.
  
2. **Add Expensify to Web Services Authorizations**  
   - In **Sage Intacct**, go to **Company > Setup > Company > Security > Edit**.  
   - Scroll to **Web Services Authorizations** and add `expensify` (all lowercase) as a **Sender ID**.  
   - Click **Save**.

3. **Retry Connection**  
   - Attempt to sync again after making these changes.

**Note:** If the error persists, remove and re-add Expensify from the Web Services authorizations list.

---

## Company Card Expenses Exporting to the Wrong Account  

**Behavior:**  
Company card transactions are exporting to the wrong account.

### Why This Happens  
This can be caused by incorrect account mapping, export settings, or user permissions.

### How to Fix It  

1. **Check How the Expense Was Imported**  
   - **Company Card Import:** Only expenses with the locked card icon follow export mapping settings configured in **Domain Control**.  
   - **Other Imports:** Expenses from individually linked cards, SmartScanned receipts, or manually created cash expenses export to the **default account** in your connection settings.

2. **Confirm Card Mapping in Domain Control**  
   - Ensure company cards are mapped to the correct accounts.

3. **Merge SmartScanned Receipts**  
   - If SmartScanned receipts should have merged with company card transactions, verify and manually merge them if necessary.

4. **Verify Export Options**  
   - Go to **Settings > Workspaces > Group > [Workspace Name] > Connections > Configure**.  
   - Select **"Credit Card"** as the non-reimbursable export option if mapping to specific credit card accounts.

5. **Ensure the Exporter Has Domain Admin Permissions**  
   - Check the **Report Comments** section to see who exported the report.  
   - Ensure the **Preferred Exporter** in **Settings > Workspaces > Group > [Workspace Name] > Connections > Configure** is a **Domain Admin**.

6. **Check Workspace Mapping**  
   - If multiple workspaces connect to the same accounting system, ensure expenses export under the correct workspace.

---

## Credit Card Configuration is Missing  

**Error Message:**  
*Sage Intacct: Credit Card Configuration is Missing / You haven't yet set up credit cards in Sage Intacct.*

### Why This Happens  
Sage Intacct requires a configured credit card account to process non-reimbursable expenses.

### How to Fix It  

1. **Set Up a Credit Card Account in Sage Intacct**  
   - Go to **Cash Management > Setup > + Charge Card Accounts**.  
   - Fill in mandatory fields:
     - **ID:** Recognizable name for the account.
     - **Payment Method:** Select **Credit**.
     - **Credit-card offset account:** Account credited when expenses post.
     - **Expiration:** Required but not crucial for roll-up card accounts.
     - **Vendor ID:** Typically the bank or card provider.

2. **Link the Account in Expensify**  
   - Go to **Expensify > Settings > Workspaces > Group > [Workspace Name] > Connections > Configure > Export**.  
   - Select the newly created credit card account.  
   - Click **Save**.

---

## Expensify Not Displaying Customers/Projects  

**Behavior:**  
Customers or projects from Sage Intacct are not appearing in Expensify.

### Why This Happens  
The Sage Intacct web services user lacks the required permissions.

### How to Fix It  

1. **Verify Permissions**  
   - In **Sage Intacct**, go to **Company > Users > Subscriptions**.  
   - Ensure the web services user has **Read-Only** permissions for the **Accounts Receivable (AR)** module.

2. **Sync the Connection**  
   - In **Expensify**, go to **Settings > Workspaces > Group > [Workspace Name] > Connections > Sync Now**.

---

# ExpensiError Codes  

## ExpensiError INT009: Employee Manager Does Not Have a User Associated  

### Why This Happens  
This error occurs when an employee's manager in Sage Intacct lacks a user account.

### How to Fix It  

- **If Not Using Approvals**  
  1. Disable **Expense Report Approval** in **Sage Intacct > Time & Expenses > Configure Time & Expenses**.  
  2. Sync Expensify: **Settings > Workspaces > [Workspace Name] > Connections > Sync Now**.

- **If Using Approvals**  
  1. Set the **First Approver** in **Sage Intacct > Time & Expenses > Configure Time & Expenses**.  
  2. Ensure the **First Approver** is a Sage Intacct admin.

---

## ExpensiError INT012: "Reason for Expense" Note is Invalid  

### Why This Happens  
Sage Intacct requires a "Reason for Expense" note, preventing export.

### How to Fix It  

1. **Disable Requirement in Sage Intacct**  
   - Go to **Time & Expenses > Configure Time & Expenses**.  
   - Under **Expense Report Requirements**, uncheck **Reason for Expense**.

---

## ExpensiError INT028: Use of an Empty Location is Invalid  

### Why This Happens  
Sage Intacct requires a **Location** for employees, which is missing.

### How to Fix It  

1. **Specify a Location in Sage Intacct**  
   - Locate the employee profile and add a Location.

2. **Sync Expensify**  
   - Go to **Settings > Workspaces > Group > [Workspace Name] > Connections > Sync Now**.

3. **Re-export the Report**  
   - Retry the export after syncing.

---

## ExpensiError INT043: Not Authorized to Execute This Function  

### Why This Happens  
The `xml_gateway` user lacks the necessary permissions in Sage Intacct.

### How to Fix It  

1. **Enable Required Permissions**  
   - **User-Based Permissions:** Go to **Company > Users > Subscriptions**.  
   - **Role-Based Permissions:** Go to **Company > Roles > Subscriptions**.  
   - Ensure the following permissions are set:
     - **Administration:** All  
     - **Company:** Read-only  
     - **Cash Management:** All  
     - **Time and Expense:** All  
     - **General Ledger:** All  
     - **Projects:** Read-only  
     - **Accounts Payable:** All  

2. **Sync Connection in Expensify**  
   - Go to **Settings > Workspaces > [Workspace Name] > Connections > Sync Now**.

3. **Retry Export**  
   - Attempt to export again.

---

## ExpensiError INT054: No Sage Intacct Employee Found  

### Why This Happens  
Expensify cannot find a matching employee record in Sage Intacct.

### How to Fix It  

1. **Ensure the Employee Exists in Sage Intacct**  
   - Go to **Time & Expenses > + Employee**.  
   - Verify the email matches Expensify.

2. **Check for Duplicate Employee Records**  
   - Delete duplicates if they exist.

3. **Sync Expensify**  
   - Go to **Settings > Workspaces > Group > [Workspace Name] > Connections > Sync Now**.

</div>
