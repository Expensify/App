---
title: NS0228 Sync Error in NetSuite Integration
description: Learn what the NS0228 sync error means and how to assign the Expensify Integration role to a NetSuite user to restore category syncing.
keywords: NS0228, NetSuite ExpenseCategory permission error, Expensify Integration role not assigned to user, NetSuite sync error ExpenseCategory, NetSuite role not added to user, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0228 sync error caused by the Expensify Integration role not being assigned to a NetSuite user. Does not cover token formatting or bundle update issues.
---

# NS0228 Sync Error in NetSuite Integration

If you see the error:

NS0228 Sync Error: Permission error querying NetSuite for 'ExpenseCategory'. Please ensure the Expensify Integration Role has been added to a user in NetSuite.

This means the **Expensify Integration role** is not properly assigned to a NetSuite user.

Without the role assigned to a user, the Workspace cannot access **ExpenseCategory** records during sync.

---

## Why the NS0228 Sync Error Happens in NetSuite

The NS0228 error typically occurs when:

- The **Expensify Integration role** exists in NetSuite but is not assigned to any user.
- The access token is tied to a user that does not have the Expensify Integration role.
- The user-role-token combination used for the integration is invalid.

In NetSuite:

- Roles must be assigned to a user to function.
- Access tokens are tied to both a **User** and a **Role**.
- If the role is not attached to a user, NetSuite returns permission errors when querying ExpenseCategory data.

This is a role assignment issue, not a token formatting or bundle update issue.

---

## How to Fix the NS0228 Sync Error

Follow the steps below to confirm the role is assigned correctly.

---

## Assign the Expensify Integration Role to a NetSuite User

1. Log in to NetSuite as an administrator.
2. Go to **Lists > Employees** (or search for the user used for the integration).
3. Open the employee record used for the NetSuite connection.
4. Click **Edit**.
5. Select the **Access** tab.
6. Confirm the **Expensify Integration** role is listed under Roles.
7. If it is not listed:
   - Add the **Expensify Integration** role.
8. Click **Save**.

The user does not need to be a NetSuite Admin, but must have the permissions included in the Expensify Integration role.

---

## Confirm the Access Token Is Linked to the Correct User and Role

Access tokens in NetSuite are tied to both:

- A specific **User**
- A specific **Role**

Important:

- A connection cannot be created using tokens tied to one role and later switched to another role.
- If the role or user was changed after creating the token, you may need to generate a new access token and update the connection in the Workspace.

If needed:

1. Go to **Setup > Users/Roles > Access Tokens**.
2. Generate a new token for the correct user and **Expensify Integration** role.
3. Update the credentials in the Workspace.
4. Save the connection.

---

## Sync the Workspace

After confirming the role assignment:

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

---

# FAQ

## Does the NS0228 Sync Error Affect Category Imports?

Yes. If the Workspace cannot query **ExpenseCategory** records, categories will not import or sync properly.

## Do I Need NetSuite Admin Access to Fix the NS0228 Sync Error?

Yes. You must have permission to manage users and assign roles in NetSuite to resolve this issue.

## Do I Need to Reinstall the Bundle?

No. In most cases, assigning the Expensify Integration role to a user and syncing is sufficient.
