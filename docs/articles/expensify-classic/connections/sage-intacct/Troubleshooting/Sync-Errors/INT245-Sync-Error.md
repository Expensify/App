---
title: INT245 Sync Error in Sage Intacct Integration
description: Learn what the INT245 sync error means and how to update Sage Intacct Web Services user permissions or reimbursable export settings before retrying the sync.
keywords: INT245, Sage Intacct invalid credentials, Sage Intacct Web Services permissions, reimbursable export option Vendor Bill, Expensify Sage Intacct integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT245 sync error caused by missing Sage Intacct user permissions or reimbursable export configuration issues. Does not cover Sender ID authentication errors.
---

# INT245 Sync Error in Sage Intacct Integration

If you see the error:

INT245 Sync Error: Invalid credentials for Sage Intacct. The Sage Intacct user is missing required permissions or the reimbursable export option isn’t fully configured.

This means either:

- The Sage Intacct Web Services user is missing required permissions, or  
- The reimbursable export option in the Workspace was not fully configured during setup.

---

## Why the INT245 Sync Error Happens in Sage Intacct

The INT245 error typically indicates:

- The Sage Intacct Web Services user does not have the required module permissions.
- The connection was established, but the reimbursable export option (Expense Report vs. Vendor Bill) was not properly configured.
- Sage Intacct validation failed due to missing access to required modules.

The resolution depends on how expenses are being exported.

This is a user permission or export configuration issue, not a Sender ID authentication error.

---

## How to Fix the INT245 Sync Error

Follow the steps below based on your export configuration.

---

## If Exporting as Expense Reports

### Update Sage Intacct Web Services User Permissions

1. Log in to Sage Intacct.
2. Go to **Company > Web Services Users**.
3. Locate the Web Services user.
4. Click the **Subscription** link for that user.
5. Select the relevant Application or Module.
6. Click **Permissions** and configure the following:

- **Administration:** All  
- **Company:** Read-only  
- **Cash Management:** All  
- **General Ledger:** All  
- **Time & Expense:** All  
- **Projects:** Read-only  
  - Only required if importing projects and customers into the Workspace  
- **Accounts Payable:** All  
  - Only required if exporting non-reimbursable expenses as Vendor Bills  

7. Click **Save**.

### Sync the Workspace in Expensify

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Retry the export after syncing.

---

## If Exporting as Vendor Bills

This can occur when the connection was established but the reimbursable export option was not fully configured.

### Complete Reimbursable Export Configuration

After the initial sync:

1. If you see the message **No expense types found**, close the error.
2. The configuration window will open.
3. Change the **Reimbursable export option** to **Vendor Bill**.
4. Click **Save**.

### Retry the Sync

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.
5. Retry exporting the report.

---

# FAQ

## Does This Always Mean the Credentials Are Wrong?

Not necessarily. It often means the Sage Intacct Web Services user is missing required permissions rather than having incorrect login credentials.

## Do I Need Sage Intacct Admin Access to Fix This?

You need sufficient administrative permissions in Sage Intacct to update Web Services user permissions.
