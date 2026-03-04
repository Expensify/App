---
title: NS0109 Sync Error in NetSuite Integration
description: Learn how to fix the NS0109 sync error in NetSuite when Expensify cannot log in using admin credentials.
keywords: NS0109, NetSuite login failed, verify admin credentials NetSuite, refresh NetSuite token, NetSuite access token error, Expensify NetSuite sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0109 sync error caused by invalid or expired admin credentials. Does not cover other NetSuite error codes.
---

# NS0109 Sync Error in NetSuite Integration

If you see the error:

NS0109: Failed to login to NetSuite. Please verify your admin credentials.

This means Expensify is unable to authenticate with NetSuite using the current admin credentials or token.

---

## Why the NS0109 Sync Error Happens in NetSuite

The NS0109 error occurs when:

- The NetSuite admin password was changed.
- The access token expired or was revoked.
- The NetSuite role permissions were modified.
- The integration credentials in Expensify are outdated.
- Multi-factor authentication or security settings were updated.

When credentials change or expire, Expensify cannot log in until the connection is refreshed.

---

## How to Fix the NS0109 Sync Error

### Step One: Confirm NetSuite Admin Credentials

1. Log in to NetSuite directly using the admin credentials.
2. Confirm the account is active and has the correct permissions for integration.
3. Review the NetSuite integration setup guide to ensure all required fields are correct.

If login fails in NetSuite, update the credentials before reconnecting in Expensify.

---

### Step Two: Generate a New NetSuite Access Token (If Needed)

If you are using token-based authentication:

1. Log in to NetSuite as an Admin.
2. Navigate to the **Access Token Management** section.
3. Create a new access token.
4. Copy the new token details.

---

### Step Three: Update the Connection in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Open the NetSuite connection settings.
6. Enter the updated admin credentials or new access token.
7. Save the changes.
8. Click **Sync now**.

After refreshing the credentials or token, the sync should complete successfully.

---

# FAQ

## Do I Need to Disconnect the NetSuite Integration?

Not usually. Updating the admin credentials or generating a new access token typically resolves the issue.

## Does NS0109 Mean My Data Is Lost?

No. This error only indicates a login or authentication failure. Your data remains intact in both Expensify and NetSuite.
