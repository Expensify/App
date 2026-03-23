---
title: NS0739 Sync Error in NetSuite Integration
description: Learn what the NS0739 sync error means and how to correct NetSuite token permissions and formatting issues to restore syncing.
keywords: NS0739, NetSuite token login error, unexpected error logging in with tokens NetSuite, SOAP Web Services permission NetSuite, Expensify Integration role token permissions, NetSuite Sandbox token format, NetSuite sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0739 sync error caused by incorrect token permissions or formatting. Does not cover bundle updates or general NetSuite login credential errors.
---

# NS0739 Sync Error in NetSuite Integration

If you see the error:

NS0739 Sync Error: Unexpected error when logging in with tokens.

This means NetSuite rejected the authentication attempt using access tokens.

This error is usually caused by incorrect token permissions or formatting issues.

---

## Why the NS0739 Sync Error Happens in NetSuite

The NS0739 error typically occurs when:

- The access token was created with incorrect permissions.
- The **Expensify Integration** role does not have required permissions.
- The **SOAP Web Services** permission is not set to **Full**.
- The token is formatted incorrectly, especially in a **Sandbox** environment.
- The token is tied to the wrong user or role.

If the token configuration does not meet NetSuite’s requirements, the login attempt fails.

This is a token and role configuration issue, not a bundle update or general login credential issue.

---

## How to Fix the NS0739 Sync Error

Follow the steps below to verify role permissions and token formatting.

---

## Confirm SOAP Web Services Permission

1. Log in to NetSuite as an administrator.
2. Go to **Setup > Users/Roles > Manage Roles**.
3. Select **Expensify Integration**.
4. Click **Edit**.
5. Scroll to **Permissions > Setup**.
6. Confirm **SOAP Web Services** is set to **Full**.
7. Click **Save** if changes are made.

After updating the permission, return to the Workspace and retry the sync.

---

## Confirm the Token Is Assigned to the Correct User and Role

1. Go to **Setup > Users/Roles > Access Tokens**.
2. Locate the token used for the Workspace connection.
3. Confirm:
   - The **User** is correct.
   - The **Role** is **Expensify Integration**.
4. If needed, generate a new token tied to the correct user and role.
5. Update the connection credentials in the Workspace.

---

## Confirm Sandbox Token Formatting (Sandbox Only)

If you are connected to a **NetSuite Sandbox** environment, confirm the account ID is formatted correctly.

Correct format example:
- `12345678_SB1`

Incorrect format example:
- `12345678-sb1`

Important:

- Sandbox account IDs are case-sensitive.
- Use an underscore (`_`) before the sandbox identifier.
- Do not use a dash (`-`).

After correcting the format, update the connection and retry the sync.

---

## Sync the Workspace

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

## Does the NS0739 Sync Error Affect All Exports?

Yes. If the Workspace cannot authenticate using NetSuite tokens, all syncing and exports will fail.

## Do I Need NetSuite Admin Access to Fix the NS0739 Sync Error?

Yes. You must have administrator permissions to edit roles, manage access tokens, and update permissions in NetSuite.

## Do I Need to Reinstall the Integration?

No. In most cases, correcting token permissions or formatting and selecting **Sync Now** is sufficient.
