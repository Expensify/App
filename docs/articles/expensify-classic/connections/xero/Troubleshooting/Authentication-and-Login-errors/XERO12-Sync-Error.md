---
title: XERO12 Sync Error in Xero Integration
description: Learn what the XERO12 sync error means and how to disconnect and reconnect Xero when the Workspace still uses the retired OAuth 1.0 API.
keywords: XERO12, Xero OAuth 1.0, retired Xero API, disconnect Xero Workspace, reconnect Xero Expensify Classic, Expensify Xero integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration. Covers resolving the XERO12 sync error caused by connections still using Xero's retired OAuth 1.0 API and the disconnect and reconnect steps. Does not cover Xero export mapping or permission configuration.
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

This is a connection authentication issue, not an export mapping or permission configuration error.

---

## How to Fix the XERO12 Sync Error

Follow the steps below to disconnect and reconnect the Xero integration.

### Save Your Workspace Configuration

Before disconnecting:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Review and note the settings in:
   - **Export**
   - **Coding**
   - **Advanced**

Disconnecting removes imported data and settings.

### Disconnect Xero from the Workspace

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Click **Disconnect from Xero**.
6. Confirm by clicking **Disconnect**.
7. Refresh the page to confirm the connection is fully removed.

### Reconnect to Xero

1. Click **Connect to Xero**.
2. Log in using the Xero admin credentials originally used to set up the connection.
3. Authorize the connection.
4. Complete the connection flow.

### Reapply Configuration if Needed

If settings were cleared during disconnection:

1. Reapply the configuration based on your saved notes.
2. Click **Save**.

### Retry the Sync

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.
5. Retry any failed exports.

---

# FAQ

## Do I Need Xero Admin Access to Reconnect?

Yes. You must use Xero admin credentials to authorize the new connection.

## Why Didn't Clicking Reconnect Fix This?

Reconnecting reuses the existing credentials, which Xero no longer accepts. Only disconnecting and connecting again creates the connection on Xero's current API.

## Will Disconnecting Remove Imported Data?

Yes. Disconnecting clears imported data and settings, which is why saving your configuration beforehand is recommended.

## Does This Error Affect All Syncs?

Yes. All Xero syncs and exports will fail until the connection is set up again.
