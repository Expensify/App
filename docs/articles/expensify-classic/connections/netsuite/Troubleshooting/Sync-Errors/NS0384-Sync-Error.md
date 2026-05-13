---
title: NS0384 Sync Error in NetSuite Integration
description: Learn how to fix the NS0384 sync error in NetSuite when the access token lacks permission to query Classifications.
keywords: NS0384, NetSuite permission error classification, Expensify Integration role permissions, NetSuite access token role mismatch, classification permission error NetSuite, Expensify NetSuite sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0384 sync error caused by insufficient role and token permissions for Classifications. Does not cover other NetSuite error codes.
---

# NS0384 Sync Error in NetSuite Integration

If you see the error:

NS0384: Permission error encountered when querying NetSuite for 'Classification'. Please confirm the token is assigned to the Expensify Integration role by viewing the 'Access Token' in NetSuite.

This means the NetSuite access token does not have permission to query Classification records.

---

## Why the NS0384 Sync Error Happens in NetSuite

The NS0384 error occurs when:

- The access token is not assigned to the **Expensify Integration** role.
- The Expensify Integration role is missing required **List** or **Setup** permissions.
- The token is associated with a different role than expected.
- Role permissions were modified after the token was created.

Access tokens in NetSuite are tied to both a **User** and a **Role**. If the role lacks required permissions, the sync will fail.

---

## How to Fix the NS0384 Sync Error

### Step One: Confirm the Token Is Assigned to the Expensify Integration Role

1. Log in to **NetSuite** as an Administrator.
2. Search for **Access Tokens**.
3. Click **View** next to the token used for Expensify.
4. Confirm the token is assigned to the **Expensify Integration** role.

If the role is incorrect, generate a new token tied to the correct user and role.

---

### Step Two: Confirm Required List Permissions

1. In NetSuite, go to **Setup**.
2. Select **Users/Roles**.
3. Click **Manage Roles**.
4. Select **Expensify Integration**.
5. Click **Edit**.
6. Scroll to **Permissions**.
7. Open the **Lists** tab.
8. Confirm the permissions match the table below.

#### List Permissions

| Permission                    | Level |
|------------------------------|-------|
| Accounts                     | Full  |
| Classes                      | View  |
| Currency                     | View  |
| Custom Record Entries        | View  |
| Customers                    | View  |
| Departments                  | Full  |
| Documents and Files          | Full  |
| Employee Record              | Full  |
| Employees                    | Full  |
| Expense Categories           | View  |
| Imported Employee Expenses   | View  |
| Items                        | View  |
| Locations                    | View  |
| Projects                     | View  |
| Record Custom Field          | View  |
| Subsidiaries                 | View  |
| Tax Records                  | View  |
| Tax Schedules                | View  |
| Vendors                      | Full  |

---

### Step Three: Confirm Required Setup Permissions

1. While editing the **Expensify Integration** role,
2. Open the **Setup** tab.
3. Confirm the permissions match the table below.

#### Setup Permissions

| Permission                     | Level |
|--------------------------------|-------|
| Access Token Management        | Full  |
| Custom Lists                   | View  |
| Custom Record Types            | Full  |
| Custom Segments                | View  |
| Deleted Records                | Full  |
| Log in using Access Tokens     | Full  |
| Managed Accounting Periods     | View  |
| SOAP Web Services              | Full  |
| SuiteSignOn                    | Full  |
| User Access Tokens             | Full  |

Save the role after confirming all permissions.

---

### Step Four: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

---

# FAQ

## Does NS0384 Mean the Token Is Invalid?

Not necessarily. The token may be valid but tied to a role missing required permissions.

## Do I Need to Reconnect NetSuite?

If the token is tied to the wrong role, you must generate a new token and reconnect. If permissions were simply missing, updating the role and running **Sync** is usually sufficient.
