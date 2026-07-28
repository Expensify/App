---
title: INT122 Sync Error in Sage Intacct Integration
description: Learn what the INT122 sync error means and how to update Sage Intacct web services credentials to restore the connection.
keywords: INT122, Sage Intacct authentication error, xmlgateway_expensify credentials, Sage Intacct web services authorization, Sender ID expensify, sync authentication failure, Workspace Admin
internalScope: Audience is Workspace Admins managing the Sage Intacct integration. Covers resolving the INT122 sync error related to authentication and web services credentials. Does not cover export data validation or report configuration errors.
---

# INT122 Sync Error in Sage Intacct Integration

If you see the error:

INT122 Sync Error: Authentication error during sync. Please reenter Sage Intacct admin credentials and attempt sync again.

This means the connection between the Workspace and Sage Intacct cannot be authenticated.

This typically occurs when credentials or web services settings in Sage Intacct are incorrect, expired, or incomplete.

---

## Why the INT122 Sync Error Happens in Sage Intacct

The INT122 error typically occurs when:

- The credentials for the **xmlgateway_expensify** web services user are incorrect or inactive.
- The required web services authorization (Sender ID) is missing or misconfigured.
- The integration password was changed but not updated in the Workspace.
- Sage Intacct is unable to validate the authentication request.

If Sage Intacct cannot authenticate the integration user, the sync will fail.

This is an authentication and credentials issue, not an export data issue.

---

# How to Fix the INT122 Sync Error

Follow the steps below to verify credentials and restore the connection.

---

## Confirm xmlgateway_expensify Credentials in Sage Intacct

1. Log in to Sage Intacct as an administrator.
2. Locate the **xmlgateway_expensify** web services user.
3. Confirm the username is active.
4. Verify the password is correct and has not expired.
5. Confirm the user has the required permissions for integration access.
6. Click **Save** if you made any updates.

If the password was recently changed, you will need to update the credentials in the Workspace.

---

## Confirm Web Services Authorization Settings in Sage Intacct

1. In Sage Intacct, go to **Company > Setup > Company > Security > Edit**.
2. Scroll to **Web Services Authorizations**.
3. Confirm **expensify** (all lowercase) is listed as a **Sender ID**.
4. Click **Save**.

If **expensify** is already listed and the error persists:

1. Remove it from the list.
2. Add it again as **expensify** (all lowercase).
3. Click **Save**.

The Sender ID must be entered exactly as **expensify** in lowercase.

---

## Reauthorize the Integration in the Workspace

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Reenter the Sage Intacct admin credentials if prompted.
5. Click **Save**.
6. Click **Sync Now**.

If credentials and web services settings are configured correctly, the sync should complete successfully.

---

# FAQ

## Does the Sender ID Have to Be Lowercase?

Yes. The Sender ID must be entered as **expensify** in all lowercase.

## Do I Need Sage Intacct Admin Permissions to Fix This?

Yes. Updating web services authorizations and credentials typically requires administrative access in Sage Intacct.

## Does the INT122 Error Affect Exports?

Yes. If sync fails due to authentication, exports and other integration features may not function until the connection is restored.
