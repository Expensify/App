---
title: NS0228 Sync Error in NetSuite Integration
description: Learn how to fix the NS0228 sync error in NetSuite when the Expensify Integration Role is not properly assigned to a user.
keywords: NS0228, NetSuite expense category permission error, Expensify Integration Role not assigned, NetSuite token user role mismatch, permission error querying ExpenseCategory, Expensify NetSuite sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0228 sync error caused by incorrect user-role-token configuration. Does not cover other NetSuite error codes.
---

# NS0228 Sync Error in NetSuite Integration

If you see the error:

NS0228: Permission error querying NetSuite for 'ExpenseCategory'. Please ensure the Expensify Integration Role has been added to a user in NetSuite.

This means the Expensify Integration Role is not properly assigned to a NetSuite user.

---

## Why the NS0228 Sync Error Happens in NetSuite

The NS0228 error occurs when:

- The **Expensify Integration Role** is not assigned to a NetSuite user.
- The user associated with the access token does not have the correct role.
- The token was created under one role but the connection is attempting to use another.
- The role-user-token combination does not match the original integration setup.

In NetSuite, access tokens are tied to:

- A **User**
- A **Role**

Once a connection is created using a specific token/user/role combination, it cannot be switched to another role without creating a new token and reconnecting.

---

## How to Fix the NS0228 Sync Error

### Step One: Confirm the Expensify Integration Role Is Assigned to a User

1. Log in to **NetSuite** as an Administrator.
2. Go to **Setup**.
3. Select **Users/Roles**.
4. Click **Manage Users**.
5. Open the user associated with the Expensify integration.
6. Confirm the **Expensify Integration Role** is assigned to that user.
7. Save the user record if changes are made.

The user does not need to be a NetSuite Admin, but must have the permissions included in the Expensify Integration Role.

---

### Step Two: Confirm Token Configuration

1. Search for **Access Tokens** in NetSuite.
2. Confirm the token is associated with:
   - The correct **User**
   - The correct **Expensify Integration Role**

Important:

- You cannot create a connection using tokens with one role and then switch roles later.
- If the role needs to change, create a new token with the correct user-role combination and reconnect the integration in Expensify.

---

### Step Three: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

---

# FAQ

## Does NS0228 Mean the Integration Is Broken?

No. This error indicates a role and user configuration issue in NetSuite.

## Do I Need to Create a New Token?

If the token is tied to the wrong role, yes. Tokens cannot be reassigned to a different role after they are created.
