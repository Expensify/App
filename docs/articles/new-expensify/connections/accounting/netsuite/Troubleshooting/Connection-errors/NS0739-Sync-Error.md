---
title: NS0739 Sync Error in NetSuite Integration
description: Learn what the NS0739 sync error means and how to fix NetSuite token permission and formatting issues to restore syncing.
keywords: NS0739, NetSuite token error, unexpected error logging in with tokens, SOAP Web Services permission, Expensify Integration role, NetSuite Sandbox token format, NetSuite sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0739 sync error caused by NetSuite token permissions or formatting issues. Does not cover bundle updates or general NetSuite login credential errors.
---

# NS0739 Sync Error in NetSuite Integration

If you see the error:

NS0739 Sync Error: Unexpected error when logging in with tokens.

This usually means the NetSuite tokens were created with incorrect permissions or are not formatted properly.

When token configuration does not meet NetSuite’s requirements, Expensify cannot authenticate and syncing fails.

---

## Why the NS0739 Sync Error Happens in NetSuite

The NS0739 error typically occurs when:

- The generated access tokens do not have the correct permissions.
- The **SOAP Web Services** permission is not set correctly on the integration role.
- The token is formatted incorrectly in NetSuite.
- A Sandbox account ID uses incorrect capitalization or formatting.

If the token configuration does not align with NetSuite’s requirements, the login attempt will fail.

This is a token permission or formatting issue, not a bundle update or general login credential issue.

---

## How to Fix the NS0739 Sync Error

Follow the steps below to verify permissions and token formatting.

---

## Confirm SOAP Web Services Permission

1. Log in to NetSuite as an administrator.
2. Go to **Setup > Users/Roles > Manage Roles**.
3. Locate and click **Edit** for the **Expensify Integration role**.
4. Click the **Permissions** tab.
5. Scroll to the **Setup** section.
6. Confirm **SOAP Web Services** is set to **Full**.
7. Click **Save** if changes were made.

After updating permissions:

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

## Confirm Token Formatting for NetSuite Sandbox Accounts

If you are connected to a **NetSuite Sandbox** environment, confirm the account ID and token formatting are correct.

Correct format example:

- `12345678_SB1`

Incorrect format example:

- `12345678-sb1`

Sandbox account IDs are case-sensitive and must use the correct capitalization and underscore format.

After confirming formatting:

1. Update the account ID or token details in the Workspace if needed.
2. Click **Save**.
3. Click **Sync Now**.

---

# FAQ

## Does the NS0739 Sync Error Affect All Exports?

Yes. If Expensify cannot authenticate using the NetSuite tokens, all syncing and exports will fail until the issue is resolved.

## Do I Need NetSuite Admin Access to Fix the NS0739 Sync Error?

Yes. You must have permission to edit roles and manage token settings in NetSuite.

## Do I Need to Reconnect the Integration?

No. In most cases, correcting the role permissions or token formatting and selecting **Sync Now** is sufficient.
