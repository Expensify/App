---
title: INT043 Export Error in Sage Intacct Integration
description: Learn what the INT043 export error means in Sage Intacct and how to update xml_gateway user or role permissions to restore successful exports.
keywords: INT043, Sage Intacct xml_gateway permissions, Intacct user subscriptions permissions, Intacct role subscriptions permissions, missing Intacct module permissions, Expensify Sage Intacct integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT043 export error caused by missing xml_gateway user or role permissions. Does not cover authentication Sender ID errors.
---

# INT043 Export Error in Sage Intacct Integration

If you see the error:

INT043 Export Error: The 'xml_gateway' user is missing required permissions in Sage Intacct. Please update the user or role permissions.

This means the Sage Intacct Web Services user (`xml_gateway`) does not have sufficient access to required modules, preventing the export from completing.

Without the correct permissions, Sage Intacct blocks exports.

---

## Why the INT043 Export Error Happens in Sage Intacct

The INT043 error typically indicates:

- The `xml_gateway` user lacks required module permissions.
- The role assigned to the `xml_gateway` user does not include the necessary subscriptions.
- Sage Intacct validation failed due to missing required access.

Sage Intacct requires specific module access for the integration to create and update transactions.

This is a permissions configuration issue in Sage Intacct, not a Sender ID or authentication error.

---

## How to Fix the INT043 Export Error

The resolution depends on whether permissions are assigned at the user level or role level in Sage Intacct.

### Update User-Based Permissions for the xml_gateway User

1. Log in to Sage Intacct.
2. Go to **Company > Users**.
3. Select the `xml_gateway` user.
4. Click **Subscriptions**.
5. Enable the required permissions.
6. Save your changes.

### Update Role-Based Permissions for the xml_gateway User

1. Log in to Sage Intacct.
2. Go to **Company > Roles**.
3. Select the role assigned to the `xml_gateway` user.
4. Click **Subscriptions**.
5. Enable the required permissions.
6. Save your changes.

---

## Required Permissions for the xml_gateway User

Confirm the following module permissions are enabled:

- **Administration:** All  
- **Company:** Read-only  
- **Cash Management:** All  
- **Time and Expense:** All  
- **General Ledger:** All  
- **Projects:** Read-only  
- **Accounts Payable:** All  

After updating permissions in Sage Intacct:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

# FAQ

## Do I Need to Update Both User and Role Permissions?

Only update the level at which permissions are managed in your Sage Intacct environment (user-based or role-based).

## Do I Need Sage Intacct Admin Access?

You need sufficient administrative permissions in Sage Intacct to update user or role subscriptions.
