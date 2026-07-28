---
title: INT245 Sync Error in Sage Intacct Integration
description: Learn what the INT245 sync error means and how to update Sage Intacct web services user permissions or configure the reimbursable export option.
keywords: INT245, Sage Intacct invalid credentials error, Sage Intacct web services user permissions, xmlgateway permissions Sage Intacct, reimbursable export option Vendor Bill, Sage Intacct sync error, Workspace Admin
internalScope: Audience is Workspace Admins managing the Sage Intacct integration. Covers resolving the INT245 sync error caused by missing web services user permissions or incomplete reimbursable export configuration. Does not cover export data validation errors.
---

# INT245 Sync Error in Sage Intacct Integration

If you see the error:

INT245 Sync Error: Invalid credentials for Sage Intacct. The Sage Intacct user is missing required permissions or the reimbursable export option isn’t fully configured.

This means either:

- The Sage Intacct web services user does not have the required permissions, or  
- The reimbursable export configuration was not completed correctly during setup.

Sync and exports will fail until this issue is resolved.

---

## Why the INT245 Sync Error Happens in Sage Intacct

The INT245 error typically occurs when:

- Required module permissions are missing for the Sage Intacct web services user.
- The web services user subscription is incomplete.
- The reimbursable export option (Expense Report vs Vendor Bill) was not configured properly.
- The **Time & Expense** module is not used, but the Workspace is configured to export as Expense Reports.

The resolution depends on how reimbursable expenses are configured to export.

---

# How to Fix the INT245 Sync Error

Follow the section below that matches your export configuration.

---

## If Reimbursable Expenses Export as Expense Reports

### Update Web Services User Permissions in Sage Intacct

1. Log in to Sage Intacct as an administrator.
2. Go to **Company > Web Services Users**.
3. Select the web services user used for the integration.
4. Click the **Subscriptions** link.
5. Confirm the correct applications are enabled.
6. Click **Permissions** and verify the following access levels:

- **Administration:** All  
- **Company:** Read-only  
- **Cash Management:** All  
- **General Ledger:** All  
- **Time & Expense:** All  
- **Projects:** Read-only (only required if importing projects and customers)  
- **Accounts Payable:** All (required if exporting non-reimbursable expenses as Vendor Bills)

7. Click **Save**.

### Sync the Workspace

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

If permissions are correct, the sync should complete successfully.

---

## If Reimbursable Expenses Export as Vendor Bills

This error may indicate that the reimbursable export configuration was not completed during setup.

If the **Time & Expense** module is not used in Sage Intacct, reimbursable expenses must export as **Vendor Bills**.

### Update the Reimbursable Export Option

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Export** tab.
6. Change the **Reimbursable export option** to **Vendor Bill**.
7. Click **Save**.

Then:

1. Click **Sync Now** under **Accounting**.
2. Confirm the sync completes without errors.

---

# FAQ

## Do I Need Sage Intacct Admin Permissions to Fix This?

Yes. Updating web services user subscriptions and permissions requires administrative access in Sage Intacct.

## What Does “No Expense Types Found” Mean?

This appears when the **Time & Expense** module is not used. In that case, reimbursable expenses should export as **Vendor Bills**, not Expense Reports.

## Does This Error Affect Exports?

Yes. If the sync fails due to permission or configuration issues, exports cannot proceed until the issue is resolved.
