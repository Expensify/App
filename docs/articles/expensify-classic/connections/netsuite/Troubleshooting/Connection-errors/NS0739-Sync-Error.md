---
title: NS0739 Sync Error in NetSuite Integration
description: Learn how to fix the NS0739 sync error in NetSuite when access tokens are created with incorrect permissions or formatting.
keywords: NS0739, NetSuite token login error, unexpected error logging in with tokens, SOAP Web Services permission, NetSuite Sandbox token format, Expensify NetSuite sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0739 sync error caused by incorrect token permissions or formatting. Does not cover other NetSuite error codes.
---

# NS0739 Sync Error in NetSuite Integration

If you see the error:

NS0739: Unexpected error when logging in with tokens. This usually means the tokens were created with incorrect permissions or are not formatted properly.

This means the NetSuite access tokens used for the Expensify integration were created with incorrect permissions or are improperly formatted.

---

## Why the NS0739 Sync Error Happens in NetSuite

The NS0739 error occurs when:

- The NetSuite access token does not have the required permissions.
- The **SOAP Web Services** permission is not set to **Full**.
- The token is incorrectly formatted.
- A Sandbox token is not properly capitalized.
- The role assigned to the token is missing required permissions.

Expensify relies on properly configured token-based authentication to connect to NetSuite.

---

## How to Fix the NS0739 Sync Error

### Step One: Confirm SOAP Web Services Permission

1. Log in to **NetSuite** as an Administrator.
2. Go to **Setup**.
3. Select **Users/Roles**.
4. Click **Manage Users**.
5. Locate the user assigned to the **Expensify Integration Role**.
6. Click **Edit**.
7. Go to the **Permissions** tab.
8. Scroll to the **Setup** section.
9. Confirm **SOAP Web Services** is set to **Full**.
10. Save your changes.

---

### Step Two: Confirm Token Formatting (Sandbox Environments)

If you are connected to a NetSuite Sandbox environment, confirm the token is formatted correctly.

Correct format example:

- `12345678_SB1`

Incorrect format example:

- `12345678-sb1`

Sandbox identifiers must use an underscore and proper capitalization.

---

### Step Three: Retry the Sync in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

After correcting permissions and token formatting, the sync should complete successfully.

---

# FAQ

## Do I Need to Create a New Token?

If the token permissions or formatting are incorrect, it may be easier to generate a new access token after confirming the correct role permissions.

## Does NS0739 Mean My Integration Is Broken?

No. This error typically indicates a token configuration or permission issue, not a full integration failure.
