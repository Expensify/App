---
title: NS0384 Sync Error: Permission Error Querying NetSuite for 'Classification'
description: Learn why the NS0384 sync error occurs and how to update NetSuite role permissions for Classifications and access tokens.
keywords: NS0384, NetSuite Classification permission error, Expensify Integration role permissions, NetSuite access token permissions, NetSuite sync error, Expensify NetSuite integration
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers the NS0384 sync error related to Classification permissions and required role settings. Does not cover bundle reinstall steps or general login errors.
---

# NS0384 Sync Error: Permission Error Querying NetSuite for 'Classification'

If you see the error message **“NS0384 Sync Error: Permission error encountered when querying NetSuite for 'Classification'. Please confirm the token is assigned to the Expensify Integration role by viewing the 'Access Token' in NetSuite.”**, it means the NetSuite access token does not have the required permissions to query **Classifications**.

---

## Why the NS0384 Sync Error Happens

The NS0384 sync error occurs when the NetSuite access token:

- Is not assigned to the **Expensify Integration role**, or  
- The role does not have the required **List** and **Setup** permissions  

Without proper Classification access, Expensify cannot query Class, Department, or Location data during sync.

---

## How to Fix the NS0384 Sync Error

### Step 1: Confirm the Token Is Assigned to the Expensify Integration Role

In NetSuite:

1. Search for **Access Tokens**.
2. Click **View** next to the token used for the Expensify connection.
3. Confirm the token is assigned to the **Expensify Integration role**.

If it is assigned correctly, proceed to Step two.

---

### Step 2: Confirm Expensify Integration Role Permissions

In NetSuite:

1. Go to **Setup > Users/Roles > Manage Roles**.
2. Select **Expensify Integration**.
3. Click **Edit**.
4. Scroll to **Permissions**.
5. Confirm the **List** and **Setup** permissions match the tables below.

---

## Required List Permissions

| Permission                     | Level |
|--------------------------------|--------|
| Accounts                       | Full   |
| Classes                        | View   |
| Currency                       | View   |
| Custom Record Entries          | View   |
| Customers                      | View   |
| Departments                    | Full   |
| Documents and Files            | Full   |
| Employee Record                | Full   |
| Employees                      | Full   |
| Expense Categories             | View   |
| Imported Employee Expenses     | View   |
| Items                          | View   |
| Locations                      | View   |
| Projects                       | View   |
| Record Custom Field            | View   |
| Subsidiaries                   | View   |
| Tax Records                    | View   |
| Tax Schedules                  | View   |
| Vendors                        | Full   |

---

## Required Setup Permissions

| Permission                     | Level |
|--------------------------------|--------|
| Access Token Management        | Full   |
| Custom Lists                   | View   |
| Custom Record Types            | Full   |
| Custom Segments                | View   |
| Deleted Records                | Full   |
| Log in using Access Tokens     | Full   |
| Managed Accounting Periods     | View   |
| SOAP Web Services              | Full   |
| SuiteSignOn                    | Full   |
| User Access Tokens             | Full   |

---

After updating permissions:

On web:

1. Go to the **navigation tabs on the left** and select **Workspaces**.
2. Select your Workspace.
3. Select **Accounting**.
4. Click the **three-dot icon** next to the NetSuite connection.
5. Click **Sync now**.

On mobile:

1. Tap the **navigation tabs on the bottom** and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the **three-dot icon** next to the NetSuite connection.
5. Tap **Sync now**.

Retry the sync after confirming all permissions match the tables above.

---

# FAQ

## Does the NS0384 Sync Error affect category or tag imports?

Yes. If Classification permissions are restricted, Class, Department, Location, and other related data may fail to sync.

## Do I need NetSuite admin access to fix the NS0384 Sync Error?

Yes. You must have permission to manage roles and update List and Setup permissions in NetSuite.
