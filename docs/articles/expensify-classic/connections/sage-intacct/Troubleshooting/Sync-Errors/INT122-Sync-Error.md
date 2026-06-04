---
title: INT122 Sync Error in Sage Intacct Integration
description: Learn what the INT122 sync error means and how to reauthenticate your Sage Intacct connection by updating credentials and Sender ID configuration.
keywords: INT122, Sage Intacct authentication error, xmlgateway_expensify credentials, Sage Intacct Sender ID expensify, Expensify Sage Intacct sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT122 sync error caused by authentication or Sender ID configuration issues. Does not cover Sage Intacct journal or dimension configuration errors.
---

# INT122 Sync Error in Sage Intacct Integration

If you see the error:

INT122 Sync Error: Authentication error during sync. Please reenter Sage Intacct admin credentials and attempt sync again.

This means Expensify cannot authenticate the Sage Intacct connection.

This is typically caused by incorrect credentials or an issue with Web Services authorization settings in Sage Intacct.

---

## Why the INT122 Sync Error Happens in Sage Intacct

The INT122 error typically indicates:

- The credentials for the `xmlgateway_expensify` Web Services user are incorrect.
- The password for the Web Services user was changed and not updated in Expensify.
- The **Sender ID** is not properly configured in Sage Intacct.
- Sage Intacct authentication failed during sync.

If authentication fails, Expensify cannot sync with Sage Intacct.

This is an authentication or Sender ID configuration issue, not a journal or dimension configuration error.

---

## How to Fix the INT122 Sync Error

Follow the steps below to reauthenticate the Sage Intacct connection.

### Confirm Web Services User Credentials in Sage Intacct

1. Log in to Sage Intacct.
2. Locate the **`xmlgateway_expensify`** Web Services user.
3. Confirm the username and password are correct.
4. If the password was recently updated, note the new password.

You will need to reenter the updated credentials in Expensify.

### Confirm Sender ID Configuration in Sage Intacct

1. Log in to Sage Intacct.
2. Go to **Company > Setup > Company**.
3. Select **Security**.
4. Click **Edit**.
5. Scroll to **Web Services Authorizations**.
6. Add `expensify` (all lowercase) as a **Sender ID** if it is not already listed.
7. Click **Save**.

Important: The Sender ID must be exactly `expensify` in lowercase.

### Retry the Connection in Expensify

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Reenter the Sage Intacct credentials if prompted.
5. Click **Sync Now**.

---

## If the INT122 Error Persists

If authentication continues to fail:

1. In Sage Intacct, remove `expensify` from **Web Services Authorizations**.
2. Click **Save**.
3. Re-add `expensify` (all lowercase).
4. Click **Save** again.
5. Retry syncing from Expensify.

---

# FAQ

## Does This Error Always Mean the Password Is Wrong?

Not always. It often means the Sender ID is missing or the Web Services authorization needs to be updated.

## Do I Need Sage Intacct Admin Access to Fix This?

You need sufficient administrative permissions in Sage Intacct to update Web Services users and Sender IDs.
