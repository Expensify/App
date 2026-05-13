---
title: NS0123 Sync Error in NetSuite Integration
description: Learn how to fix the NS0123 sync error in NetSuite when the Expensify integration is not enabled.
keywords: NS0123, NetSuite integration not enabled, enable Expensify integration NetSuite, manage integrations NetSuite, Expensify NetSuite sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0123 sync error caused by the Expensify integration being disabled in NetSuite. Does not cover other NetSuite error codes.
---

# NS0123 Sync Error in NetSuite Integration

If you see the error:

NS0123: The Expensify integration is not enabled in NetSuite. Please enable it under Setup > Integrations > Manage Integrations in NetSuite.

This means the Expensify integration is currently disabled in your NetSuite account.

---

## Why the NS0123 Sync Error Happens in NetSuite

The NS0123 error occurs when:

- The Expensify integration is not enabled in NetSuite.
- The integration was previously disabled.
- Integration permissions were modified.
- A NetSuite configuration change removed integration access.

Expensify cannot sync with NetSuite unless the integration is enabled.

---

## How to Fix the NS0123 Sync Error

### Step One: Enable the Expensify Integration in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Go to **Setup**.
3. Select **Integrations**.
4. Click **Manage Integrations**.
5. Locate the **Expensify Integration**.
6. Ensure the integration is enabled.
7. Save your changes.

---

### Step Two: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

Once the integration is enabled in NetSuite and the Workspace is synced in Expensify, the connection should complete successfully.

---

# FAQ

## Do I Need to Reconnect the Integration?

Not usually. Enabling the integration in NetSuite and running **Sync** in Expensify typically resolves the issue.

## Does NS0123 Mean My Data Is Lost?

No. This error only indicates that the integration is disabled. Your data remains intact in both Expensify and NetSuite.
