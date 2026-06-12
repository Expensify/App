---
title: INT122 Sync Error in Sage Intacct Integration
description: Learn what the INT122 sync error means in Sage Intacct and how to reauthenticate your connection by updating credentials and Sender ID settings.
keywords: INT122, Sage Intacct sync error, authentication error Sage Intacct, xmlgateway_expensify credentials, Sage Intacct Sender ID expensify, Expensify Sage Intacct integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT122 sync error caused by authentication or Sender ID configuration issues. Does not cover other Sage Intacct error codes.
---

# INT122 Sync Error in Sage Intacct Integration

If you see the error:

INT122: Authentication error during sync.

This means Expensify cannot authenticate the Sage Intacct connection, preventing the sync from completing.

---

## Why the INT122 Sync Error Happens in Sage Intacct

The INT122 error typically indicates:

- The credentials for the `xmlgateway_expensify` web services user are incorrect.
- The password for the integration user was changed and not updated.
- The Sender ID is not properly configured in Sage Intacct.
- Web Services authorization settings are incomplete.

If authentication fails, Expensify cannot sync with Sage Intacct.

This is an authentication configuration issue, not a dimension or export mapping issue.

---

## How to Fix the INT122 Sync Error

This issue must be resolved in Sage Intacct and then retried in Expensify.

### Confirm Web Services User Credentials

1. Log in to Sage Intacct.
2. Confirm the credentials for the **xmlgateway_expensify** web services user are correct.
3. Verify the password has not changed.
4. If the password was updated, reenter the updated credentials in Expensify.

---

### Confirm Sender ID Configuration

1. In Sage Intacct, go to **Company > Setup > Company > Security**.
2. Select **Edit**.
3. Scroll to **Web Services Authorizations**.
4. Add `expensify` (all lowercase) as a **Sender ID**.
5. Click **Save**.

The Sender ID must be entered exactly as `expensify` in lowercase.

If `expensify` is already listed and the error persists:

1. Remove `expensify` from Web Services Authorizations.
2. Save the changes.
3. Re-add `expensify` (all lowercase).
4. Save again.

---

### Retry the Sync in Expensify

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Confirm the sync completes successfully.

---

# FAQ

## Can I Retry the Sync?

Yes. After updating credentials and Sender ID settings, retry the sync.

## Does INT122 Mean the Integration Is Disconnected?

Not necessarily. It typically means authentication failed during sync.

## Do I Need Sage Intacct Admin Access?

Yes. Updating Web Services users and Sender IDs requires appropriate permissions in Sage Intacct.
