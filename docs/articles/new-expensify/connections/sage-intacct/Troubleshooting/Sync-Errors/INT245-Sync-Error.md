---
title: INT245 Sync Error in Sage Intacct Integration
description: Learn what the INT245 sync error means and how to update Sage Intacct user permissions or configure the reimbursable export option.
keywords: INT245, Sage Intacct invalid credentials, web services user permissions Intacct, reimbursable export option vendor bill, Sage Intacct sync error, xmlgateway permissions, Workspace Admin
internalScope: Audience is Workspace Admins managing the Sage Intacct integration. Covers resolving the INT245 sync error related to missing user permissions or reimbursable export configuration. Does not cover export data validation or report-level errors.
---

# INT245 Sync Error in Sage Intacct Integration

If you see the error:

INT245 Sync Error: Invalid credentials for Sage Intacct. The Sage Intacct user is missing required permissions or the reimbursable export option isn’t fully configured.

This means either:

- The Sage Intacct web services user does not have the required permissions, or  
- The reimbursable export configuration was not completed correctly  

---

## Why the INT245 Sync Error Happens in Sage Intacct

The INT245 error typically occurs when:

- Required permissions are missing for the Sage Intacct web services user.
- The web services user does not have access to required modules.
- The reimbursable export option was not configured correctly during setup.
- The Workspace is configured to export reimbursable expenses differently than Sage Intacct expects.

The resolution depends on whether reimbursable expenses are exported as **Expense reports** or **Vendor bills**.

This is a permissions or configuration issue, not a report data issue.

---

# How to Fix the INT245 Sync Error

Follow the section below that matches your reimbursable export configuration.

---

## Update Web Services User Permissions for Expense Report Exports

If reimbursable expenses are exported as **Expense reports**, confirm the web services user permissions in Sage Intacct.

1. Log in to Sage Intacct as an administrator.
2. Go to **Company > Web Services Users**.
3. Select the web services user used for the integration.
4. Click the subscription link for that user.
5. Enable the appropriate application or module.
6. Click **Permissions** and confirm the following access levels:

- **Administration:** All  
- **Company:** Read-only  
- **Cash Management:** All  
- **General Ledger:** All  
- **Time & Expense:** All  
- **Projects:** Read-only (only required if importing projects and customers)  
- **Accounts Payable:** All (only required if exporting non-reimbursable expenses as Vendor bills)

7. Click **Save**.

After updating permissions, run sync again.

---

## Configure the Reimbursable Export Option for Vendor Bill Exports

If reimbursable expenses are exported as **Vendor bills**, confirm the reimbursable export setting in the Workspace.

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Review the **Reimbursable export option** setting.
5. Confirm it is set to **Vendor bill** if the **Time & Expense** module is not used in Sage Intacct.
6. Click **Save**.

If you see the error message **“No expense types found”** after the initial sync:

- Close the message.
- Update the reimbursable export option to **Vendor bill**.
- Save your changes.

---

## Run Sync

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

If permissions and export configuration are correct, the sync should complete successfully.

---

# FAQ

## Do I Need Sage Intacct Admin Permissions to Fix This?

Yes. Updating web services user permissions requires administrative access in Sage Intacct.

## What Does “No Expense Types Found” Mean?

This message appears if the **Time & Expense** module is not being used in Sage Intacct. In that case, reimbursable expenses should be configured to export as **Vendor bills** instead.

## Does the INT245 Error Affect Exports?

Yes. If sync fails due to permission or configuration issues, exports cannot proceed until the issue is resolved.
