---
title: NS0123 Sync Error in NetSuite Integration
description: Learn what the NS0123 sync error means and how to enable the Expensify integration in NetSuite to restore syncing.
keywords: NS0123, NetSuite integration not enabled, Expensify integration NetSuite, enable Expensify in NetSuite, NetSuite sync error, Setup Integrations Manage Integrations NetSuite, Expensify NetSuite connection, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0123 sync error caused by the Expensify integration being disabled in NetSuite. Does not cover full NetSuite integration setup or credential troubleshooting.
---

# NS0123 Sync Error in NetSuite Integration

If you see the error:

NS0123 Sync Error: The Expensify integration is not enabled in NetSuite. Please enable it under Setup > Integrations > Manage Integrations in NetSuite.

This means the Expensify integration is currently turned off in NetSuite.

When the integration is not enabled, the Workspace cannot sync reports or data to NetSuite.

---

## Why the NS0123 Sync Error Happens in NetSuite

The NS0123 error typically occurs when:

- The **Expensify Integration** was never enabled in NetSuite.
- The integration was disabled manually.
- Changes were made to NetSuite integration settings.
- A bundle update or role change affected the integration status.

Until the integration is enabled again, all syncing between the Workspace and NetSuite will fail.

This is an integration status issue, not a credential or mapping issue.

---

## How to Enable the Expensify Integration in NetSuite

Follow the steps below to enable the integration and restore syncing.

---

## Enable the Expensify Integration in NetSuite

1. Log in to NetSuite as an administrator.
2. Go to **Setup > Integrations > Manage Integrations**.
3. Locate **Expensify Integration** in the list.
4. Confirm the integration is enabled.
5. If it is disabled, enable it.
6. Click **Save**.

Make sure the integration is fully enabled before leaving the page.

---

## Sync the Workspace

After enabling the integration in NetSuite:

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

Once the integration is enabled and synced, exports should resume normally.

---

# FAQ

## Does the NS0123 Sync Error Stop All Report Exports?

Yes. If the Expensify integration is not enabled in NetSuite, all syncing and exports to NetSuite will fail until the integration is turned back on.

## Do I Need NetSuite Admin Access to Fix the NS0123 Sync Error?

Yes. Only someone with administrator permissions in NetSuite can enable integrations under **Setup > Integrations > Manage Integrations**.

## Do I Need to Reconnect the Integration?

No. In most cases, enabling the integration and selecting **Sync Now** is sufficient.
