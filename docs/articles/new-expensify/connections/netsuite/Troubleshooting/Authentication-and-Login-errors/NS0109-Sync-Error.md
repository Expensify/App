---
title: NS0109 Sync Error in NetSuite Integration
description: Learn what the NS0109 sync error means and how to refresh or update your NetSuite admin credentials to restore syncing.
keywords: NS0109, NetSuite login failed, failed to login to NetSuite, NetSuite admin credentials, refresh NetSuite token, NetSuite sync error, Expensify NetSuite integration, NetSuite authentication error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0109 sync error caused by invalid or expired NetSuite admin credentials. Does not cover full NetSuite integration setup or advanced NetSuite configuration.
---

# NS0109 Sync Error in NetSuite Integration

If you see the error:

NS0109 Sync Error: Failed to login to NetSuite. Please verify your admin credentials.

This means the Workspace is unable to authenticate with NetSuite.

When authentication fails, reports and data cannot sync between Expensify and NetSuite.

---

## Why the NS0109 Sync Error Happens in NetSuite

The NS0109 error typically indicates an issue with the NetSuite credentials used for the integration.

Common causes include:

- The NetSuite admin password was changed.
- The access token was revoked or expired.
- The integration credentials were updated in NetSuite but not refreshed in the Workspace.
- The integration role permissions were modified in NetSuite.
- The NetSuite role associated with the token was disabled.

When credentials are no longer valid, Expensify cannot log in to NetSuite and syncing fails.

This is an authentication issue, not a report data issue.

---

## How to Fix the NS0109 Sync Error

Follow the steps below to verify and refresh your NetSuite credentials.

### Verify the NetSuite Admin Credentials

1. Confirm the correct NetSuite admin account is being used.
2. Verify the integration role is active and has the required permissions.
3. Confirm the account ID, role ID, consumer key, consumer secret, token ID, and token secret match what is configured in NetSuite.
4. Update any credentials that were recently changed.
5. Click **Save** in the Workspace if changes were made.

### Generate a New NetSuite Access Token

If the credentials appear correct but the error persists:

1. Log in to NetSuite as an administrator.
2. Navigate to the Access Token configuration for the integration role.
3. Generate a new access token.
4. Copy the new token ID and token secret.
5. Update the credentials in the Workspace.
6. Click **Save**.
7. Click **Sync Now** under **Settings > Workspaces > Accounting**.

### Retry the Sync

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

If the credentials are valid, syncing should resume successfully.

### Contact Concierge if the Error Persists

If you are unsure which credentials changed or continue to see the NS0109 error, reach out to **Concierge** and include:

- The full error message.
- Confirmation that you are seeing **NS0109**.
- The approximate time the sync was attempted.

---

# FAQ

## Does the NS0109 Sync Error Affect All Exports?

Yes. If Expensify cannot log in to NetSuite, all report exports and sync activity will fail until the credentials are corrected.

## Do I Need a NetSuite Admin to Fix the NS0109 Sync Error?

Yes. Only a NetSuite administrator, or someone with the correct integration role and permissions, can verify credentials or generate a new access token.

## Should I Disconnect and Reconnect NetSuite?

Do not disconnect the integration unless directed by Concierge, as reconnecting may require full reconfiguration.
