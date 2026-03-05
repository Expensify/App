---
title: NS0109 Sync Error in NetSuite Integration
description: Learn what the NS0109 sync error means and how to refresh or update your NetSuite admin credentials to restore syncing.
keywords: NS0109, NetSuite login failed, failed to login to NetSuite, NetSuite admin credentials, refresh NetSuite token, NetSuite sync error, NetSuite authentication error, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0109 sync error caused by invalid or outdated NetSuite credentials. Does not cover full NetSuite integration setup or advanced NetSuite configuration.
---

# NS0109 Sync Error in NetSuite Integration

If you see the error:

NS0109 Sync Error: Failed to login to NetSuite. Please verify your admin credentials.

This means the Workspace is unable to authenticate with NetSuite.

When authentication fails, reports and data cannot sync between the Workspace and NetSuite.

---

## Why the NS0109 Sync Error Happens in NetSuite

The NS0109 error typically occurs when:

- The NetSuite admin password was changed.
- The NetSuite access token was revoked or expired.
- The integration credentials were updated in NetSuite but not refreshed in the Workspace.
- The integration role permissions were modified.
- The account ID, token ID, or token secret is incorrect.

When credentials are no longer valid, the Workspace cannot log in to NetSuite, and syncing fails.

This is an authentication issue, not a mapping or configuration issue.

---

## How to Fix the NS0109 Sync Error

Follow the steps below to verify and refresh your NetSuite credentials.

---

## Confirm the NetSuite Credentials

1. Log in to NetSuite directly using the admin account.
2. Confirm:
   - The account is active.
   - The integration role still exists.
   - The credentials match what is configured in the Workspace.
3. If the password was recently changed, prepare to update the connection.

---

## Generate a New NetSuite Access Token (If Needed)

If you are using token-based authentication:

1. Log in to NetSuite as an administrator.
2. Navigate to **Setup > Users/Roles > Access Tokens**.
3. Create a new access token for the integration role.
4. Copy the:
   - Token ID
   - Token Secret
5. Update the credentials in the Workspace connection settings.

Make sure the token is tied to the correct integration role.

---

## Refresh the NetSuite Connection in the Workspace

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Edit the NetSuite connection.
5. Enter the updated credentials.
6. Click **Save**.
7. Click **Sync Now**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Update the NetSuite credentials.
5. Tap **Save**.
6. Tap **Sync Now**.

---

## Contact Concierge if the Error Persists

If authentication continues to fail:

- Reach out to **Concierge**.
- Include the full NS0109 error message.
- Confirm whether credentials or tokens were recently changed.

Concierge can review the connection logs and help restore the integration.

---

# FAQ

## Does the NS0109 Sync Error Affect All Exports?

Yes. If the Workspace cannot log in to NetSuite, all exports and sync activity will fail until authentication is restored.

## Do I Need a NetSuite Admin to Fix the NS0109 Sync Error?

Yes. Only a NetSuite admin (or someone with the correct integration role and permissions) can verify credentials or generate a new access token.

## Do I Need to Reinstall the Integration?

No. In most cases, updating the credentials or access token is sufficient.
