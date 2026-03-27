---
title: INT245 Sync Error in Sage Intacct Integration
description: Learn what the INT245 sync error means in Sage Intacct and how to update user permissions or reimbursable export settings to restore successful syncing.
keywords: INT245, Sage Intacct sync error, invalid credentials Sage Intacct, Sage Intacct web services permissions, reimbursable export option vendor bill, Expensify Sage Intacct integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT245 sync error caused by missing Sage Intacct user permissions or incomplete reimbursable export configuration. Does not cover other Sage Intacct error codes.
---

# INT245 Sync Error in Sage Intacct Integration

If you see the error:

INT245: Invalid credentials for Sage Intacct.

This means the Sage Intacct Web Services user is missing required permissions, or the reimbursable export option was not fully configured, preventing the sync from completing.

---

## Why the INT245 Sync Error Happens in Sage Intacct

The INT245 error typically indicates:

- The Sage Intacct Web Services user does not have required module permissions.
- The reimbursable export option (Expense Report vs. Vendor Bill) was not properly configured during setup.
- The connection was established, but required configuration steps were incomplete.

This is a Sage Intacct user permission or export configuration issue, not a Sender ID authentication issue.

---

## How to Fix the INT245 Sync Error

The resolution depends on how reimbursable expenses are configured to export.

---

### If Exporting as Expense Reports

#### Update Sage Intacct Web Services User Permissions

1. Log in to Sage Intacct.
2. Go to **Company > Web Services Users**.
3. Locate the Web Services user.
4. Click the **Subscription** link.
5. Check the box next to the relevant Application/Module.
6. Click **Permissions** and configure:

- Administration: All  
- Company: Read-only  
- Cash Management: All  
- General Ledger: All  
- Time & Expense: All  
- Projects: Read-only (required only if importing projects and customers)  
- Accounts Payable: All (required if exporting non-reimbursable expenses as Vendor Bills)

7. Save your changes.

#### Retry the Sync

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

### If Exporting as Vendor Bills

This error may occur if the reimbursable export option was not fully configured.

After the initial sync:

1. You may see the error **No expense types found** if not using the Time & Expense module.
2. Close the error message.
3. The configuration window will open.
4. Change the **Reimbursable export option** to **Vendor Bill**.
5. Click **Save**.

Then:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Retry exporting the report.

---

# FAQ

## Can I Retry the Sync?

Yes. After updating user permissions or export configuration, retry the sync.

## Does INT245 Always Mean the Credentials Are Wrong?

Not necessarily. It often means the Web Services user is missing required permissions rather than having incorrect login credentials.

## Do I Need Sage Intacct Admin Access?

Yes. Updating Web Services user permissions requires administrative access in Sage Intacct.
