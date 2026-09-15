---
title: XERO12 Sync Error in Xero Integration
description: Learn what the XERO12 sync error means and how to disconnect and reconnect Xero in New Expensify when the Workspace still uses the retired OAuth 1.0 API.
keywords: XERO12, Xero OAuth 1.0, retired Xero API, disconnect Xero New Expensify, reconnect Xero Workspace, Expensify Xero integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration in New Expensify. Covers resolving the XERO12 sync error caused by connections still using Xero's retired OAuth 1.0 API and the disconnect and reconnect steps. Does not cover Xero export mapping, tax, or category configuration.
---

# XERO12 Sync Error in Xero Integration

If you see the error:

XERO12 Sync Error: This workspace is connected to Xero with the retired OAuth 1.0 API. Please disconnect and reconnect Xero in the workspace.

This means the Workspace was connected to Xero before Xero retired its OAuth 1.0 API, so the connection can no longer authenticate.

Until the connection is set up again, syncing and exports to Xero will fail.

---

## Why the XERO12 Sync Error Happens in Xero

Xero retired the OAuth 1.0 API in 2021. Connections created before that date use credentials Xero no longer accepts.

Syncing again or clicking **Reconnect** will not upgrade the connection. It has to be disconnected and set up again, which creates it with Xero's current API.

This is a connection issue, not an export mapping issue.

---

# How to Fix the XERO12 Sync Error

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

## Why Didn't Clicking Reconnect Fix This?

Reconnecting reuses the existing credentials, which Xero no longer accepts. Only disconnecting and connecting again creates the connection on Xero's current API.

## Will Disconnecting Remove My Configuration?

It may remove imported options and accounting settings. Save your configuration before disconnecting so you can reapply any custom settings if needed.
