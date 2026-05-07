---
title: INT122 Sync Error in Sage Intacct Integration
description: Learn what the INT122 sync error means and how to update Sage Intacct web services credentials and Sender ID settings to restore the connection.
keywords: INT122, Sage Intacct authentication error, xmlgateway_expensify credentials, Sage Intacct Web Services Authorizations, Sender ID expensify lowercase, Sage Intacct sync authentication failure, Workspace Admin
internalScope: Audience is Workspace Admins managing the Sage Intacct integration. Covers resolving the INT122 sync error caused by authentication and web services credential issues. Does not cover export data validation errors.
---

# INT122 Sync Error in Sage Intacct Integration

If you see the error:

INT122 Sync Error: Authentication error during sync. Please reenter Sage Intacct admin credentials and attempt sync again.

This means the connection between the Workspace and Sage Intacct cannot be authenticated.

When authentication fails, syncing and exports will not work.

---

## Why the INT122 Sync Error Happens in Sage Intacct

The INT122 error typically occurs when:

- The credentials for the **xmlgateway_expensify** web services user are incorrect.
- The password for the web services user was changed but not updated in the Workspace.
- The required **Web Services Authorization (Sender ID)** is missing.
- The Sender ID is not entered exactly as required.

If Sage Intacct cannot authenticate the integration user, the sync will fail.

This is an authentication issue, not a report data or export configuration issue.

---

## How to Fix the INT122 Sync Error

Follow the steps below to verify credentials and restore the connection.

---

## Confirm xmlgateway_expensify Credentials in Sage Intacct

1. Log in to Sage Intacct as an administrator.
2. Locate the **xmlgateway_expensify** web services user.
3. Confirm:
   - The username is correct.
   - The password is correct.
   - The user is active.
   - The user has the required module permissions.
4. If the password was changed, update it in the Workspace connection settings.

Save any changes.

---

## Confirm Web Services Authorizations (Sender ID)

1. In Sage Intacct, go to **Company > Setup > Company**.
2. Click **Security**.
3. Click **Edit**.
4. Scroll to **Web Services Authorizations**.
5. Add **expensify** as a **Sender ID**.

Important:

- The Sender ID must be entered as **expensify** (all lowercase).
- Do not use uppercase letters.
- Do not add spaces.

If **expensify** is already listed and the error continues:

1. Remove it from the list.
2. Add **expensify** again (all lowercase).
3. Click **Save**.

---

## Retry the Sync

After confirming credentials and Sender ID settings:

1. Go to **Workspaces > [Workspace Name] > Accounting**.
2. Select **Sync Now**.
3. Confirm the sync completes successfully.

If authentication is configured correctly, the sync should complete without errors.

---

# FAQ

## Does the Sender ID Have to Be Lowercase?

Yes. The Sender ID must be entered exactly as **expensify** in all lowercase.

## Do I Need Sage Intacct Admin Access to Fix This?

Yes. Updating web services users and Web Services Authorizations requires administrator permissions in Sage Intacct.

## Does This Error Affect Exports?

Yes. If the sync fails due to authentication, exports and other integration features will not function until the connection is restored.
