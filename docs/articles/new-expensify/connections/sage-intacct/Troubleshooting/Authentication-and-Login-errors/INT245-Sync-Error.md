---
title: INT245 Sync Error: Invalid Credentials or Missing Permissions in Sage Intacct
description: Learn why the INT245 sync error occurs and how to update Sage Intacct user permissions or configure the reimbursable export option.
keywords: INT245, Sage Intacct invalid credentials, web services user permissions, reimbursable export option vendor bill, Sage Intacct sync error, xmlgateway permissions
internalScope: Audience is Workspace Admins managing the Sage Intacct integration. Covers the INT245 sync error related to missing user permissions or reimbursable export configuration. Does not cover data validation export errors.
---

# INT245 Sync Error: Invalid Credentials or Missing Permissions in Sage Intacct

If you see the error message:

**“INT245 Sync Error: Invalid credentials for Sage Intacct. The Sage Intacct user is missing required permissions or the reimbursable export option isn’t fully configured.”**

It means either:

- The Sage Intacct web services user does not have the required permissions, or  
- The reimbursable export configuration was not completed correctly  

---

## Why the INT245 Sync Error Happens

The INT245 sync error occurs when:

- Required permissions are missing for the Sage Intacct web services user, or  
- The reimbursable export option is not properly configured during setup  

The resolution depends on whether you are exporting reimbursable expenses as **expense reports** or **vendor bills**.

---

# How to Fix the INT245 Sync Error

---

## If Exporting as Expense Reports

### Step 1: Update Web Services User Permissions in Sage Intacct

1. Log in to Sage Intacct.  
2. Go to **Company > Web Services Users**.  
3. Select the web services user used for the integration.  
4. Click the **subscription link** for that user.  
5. Check the box next to the appropriate **Application/Module**.  
6. Click **Permissions** and confirm the following access levels:

- **Administration:** All  
- **Company:** Read-only  
- **Cash Management:** All  
- **General Ledger:** All  
- **Time & Expense:** All  
- **Projects:** Read-only (only required if importing projects and customers)  
- **Accounts Payable:** All (only required if exporting non-reimbursable expenses as vendor bills)  

Save your changes.

---

### Step 2: Run Sync

1. Go to **Workspaces > [Workspace Name] > Accounting**.  
2. Click the three-dot icon next to the Sage Intacct connection.  
3. Select **Sync Now** from the dropdown.  

If permissions are correct, the sync should complete successfully.

---

## If Exporting as Vendor Bills

The error may indicate that the reimbursable export configuration was not completed during setup.

During the [connection process to Sage Intacct](https://help.expensify.com/articles/new-expensify/connections/sage-intacct/Connect-to-Sage-Intacct), a required configuration step may have been skipped.

After the initial sync completes:

- You may see the error **“No expense types found”** if the **Time & Expense** module is not used in Sage Intacct  
- Close the error message  
- The accounting configuration window will open automatically  

### Step 1: Update the Reimbursable Export Option

1. Change the **Reimbursable export option** to **Vendor bill**.  
2. Save your changes.  

Retry the sync.

---

# FAQ

## Do I need Sage Intacct admin permissions to fix this?

Yes. Updating web services user permissions requires administrative access in Sage Intacct.

## What does “No expense types found” mean?

This message appears if the **Time & Expense** module is not being used. In that case, reimbursable expenses should be configured to export as **Vendor bills** instead.

## Does this error affect exports?

Yes. If the sync fails due to permission or configuration issues, exports cannot proceed until the issue is resolved.
