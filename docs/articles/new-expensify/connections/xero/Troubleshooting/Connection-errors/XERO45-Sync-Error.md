---
title: XERO45 Sync Error in Xero Integration
description: Learn what the XERO45 sync error means and how to disconnect and reconnect Xero in New Expensify to restore syncing.
keywords: XERO45, Xero invalid authentication token, disconnect Xero New Expensify, reconnect Xero Workspace, Expensify Xero integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration in New Expensify. Covers resolving the XERO45 sync error related to expired or invalid authentication tokens and reconnection steps. Does not cover Xero export mapping, tax, or category configuration.
---

# XERO45 Sync Error in Xero Integration

If you see the error:

XERO45 Sync Error: Unable to sync Xero data due to an invalid authentication token. Please disconnect and reconnect Xero in the Workspace.

This means the authentication token connecting the Workspace to Xero has expired or is no longer valid.

Until the connection is refreshed, syncing and exports will fail.

---

## Why the XERO45 Sync Error Happens in Xero

The XERO45 error typically occurs when:

- The Xero authentication token has expired.
- The Xero connection was revoked in Xero.
- The connected Xero account credentials were changed.
- The Xero admin user who authorized the connection no longer has access.

When the token is invalid, the Workspace cannot access Xero data.

This is a connection issue, not an export mapping issue.

---

# How to Fix the XERO45 Sync Error

Follow the steps below to disconnect and reconnect the Xero integration.

---

## Save Your Workspace Accounting Configuration

Before disconnecting:

On web:
1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Review and save your settings under:
   - **Export**
   - **Coding**
   - **Advanced**

Disconnecting may remove imported options and configuration settings.

On mobile:
1. Tap the navigation tabs on the bottom.
2. Tap **Workspaces**.
3. Select your Workspace.
4. Tap **Accounting**.
5. Review your accounting configuration settings.

---

## Disconnect Xero From the Workspace

On web:
1. Go to **Settings > Workspaces > [Workspace Name] > Accounting**.
2. Click the three-dot icon next to the Xero connection.
3. Click **Disconnect from Xero**.
4. Click **Disconnect** to confirm.
5. Refresh the page to confirm the connection is removed.

On mobile:
1. Tap the navigation tabs on the bottom.
2. Tap **Workspaces**.
3. Select your Workspace.
4. Tap **Accounting**.
5. Tap the three-dot icon next to the Xero connection.
6. Tap **Disconnect** and confirm.

---

## Reconnect to Xero in the Workspace

1. In **Settings > Workspaces > [Workspace Name] > Accounting**, click **Connect to Xero**.
2. Log in using the appropriate Xero admin credentials.
3. Select the correct Xero organization.
4. Complete the authorization flow.
5. Click **Save** if prompted.

---

## Run Sync

1. Go to **Settings > Workspaces > [Workspace Name] > Accounting**.
2. Click the three-dot icon.
3. Click **Sync now**.

If the connection is successfully restored, syncing and exports should complete normally.

---

# FAQ

## Do I Need Xero Admin Access to Reconnect?

Yes. You must use a Xero account with admin permissions for the connected organization.

## Will Disconnecting Remove My Configuration?

It may remove imported options and accounting settings. Save your configuration before disconnecting so you can reapply any custom settings if needed.
