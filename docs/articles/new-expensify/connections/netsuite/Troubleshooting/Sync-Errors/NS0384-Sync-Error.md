---
title: NS0384 Sync Error in NetSuite Integration
description: Learn what the NS0384 sync error means and how to update NetSuite role and token permissions for Classifications to restore syncing.
keywords: NS0384, NetSuite Classification permission error, Expensify Integration role permissions, NetSuite access token permissions, Class Department Location sync error NetSuite, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0384 sync error caused by missing Classification and token permissions on the Expensify Integration role. Does not cover bundle reinstall steps or general login errors.
---

# NS0384 Sync Error in NetSuite Integration

If you see the error:

NS0384 Sync Error: Permission error encountered when querying NetSuite for 'Classification'. Please confirm the token is assigned to the Expensify Integration role by viewing the 'Access Token' in NetSuite.

This means the NetSuite access token does not have the required permissions to query **Classifications**.

Without proper Classification access, the Workspace cannot sync **Class**, **Department**, **Location**, or related data.

---

## Why the NS0384 Sync Error Happens in NetSuite

The NS0384 error typically occurs when:

- The access token is not assigned to the **Expensify Integration** role.
- The Expensify Integration role does not have required **List** permissions.
- The role is missing required **Setup** permissions for token access.
- The token is tied to a different user or role than expected.

Access tokens in NetSuite are tied to both a specific **User** and **Role**. If either is misconfigured, NetSuite blocks Classification queries.

This is a role and token permission issue, not a bundle or general login issue.

---

## How to Fix the NS0384 Sync Error

Follow the steps below to confirm token assignment and role permissions.

---

## Confirm the Access Token Is Assigned to the Expensify Integration Role

1. Log in to NetSuite as an administrator.
2. Search for **Access Tokens**.
3. Click **View** next to the token used for the NetSuite connection.
4. Confirm:
   - The **User** is correct.
   - The **Role** is set to **Expensify Integration**.

If the role is incorrect:

- Generate a new token tied to the correct user and **Expensify Integration** role.
- Update the credentials in the Workspace connection settings.

---

## Confirm Expensify Integration Role Permissions

1. Go to **Setup > Users/Roles > Manage Roles**.
2. Select **Expensify Integration**.
3. Click **Edit**.
4. Review the **Permissions** section.

### Required List Permissions

Confirm the following are set correctly:

| Permission                  | Level |
|-----------------------------|--------|
| Accounts                    | Full   |
| Classes                     | View   |
| Currency                    | View   |
| Customers                   | View   |
| Departments                 | Full   |
| Employees                   | Full   |
| Expense Categories          | View   |
| Items                       | View   |
| Locations                   | View   |
| Projects                    | View   |
| Subsidiaries                | View   |
| Vendors                     | Full   |

### Required Setup Permissions

Confirm the following are set correctly:

| Permission                      | Level |
|---------------------------------|--------|
| Access Token Management         | Full   |
| Log in using Access Tokens      | Full   |
| User Access Tokens              | Full   |
| SOAP Web Services               | Full   |
| Custom Record Types             | Full   |
| Deleted Records                 | Full   |

Click **Save** after making any updates.

---

## Sync the Workspace

After confirming role and token settings:

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot menu next to the NetSuite connection.
5. Click **Sync Now**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the three-dot menu next to the NetSuite connection.
5. Tap **Sync Now**.

Retry the sync after confirming all permissions match the required settings.

---

# FAQ

## Does the NS0384 Sync Error Affect Category or Tag Imports?

Yes. If Classification permissions are restricted, **Class**, **Department**, **Location**, and related data will fail to sync.

## Do I Need NetSuite Admin Access to Fix the NS0384 Sync Error?

Yes. You must have administrator permissions to manage roles and update List and Setup permissions in NetSuite.

## Do I Need to Reinstall the Bundle?

No. In most cases, correcting the token assignment and role permissions is sufficient.
