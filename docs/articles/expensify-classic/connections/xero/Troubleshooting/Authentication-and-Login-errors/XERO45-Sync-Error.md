---
title: XERO45 Sync Error in Xero Integration
description: Learn what the XERO45 sync error means and how to disconnect and reconnect Xero to restore syncing.
keywords: XERO45, Xero invalid authentication token, disconnect Xero Workspace, reconnect Xero Workspace, Expensify Xero integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration. Covers resolving the XERO45 sync error caused by expired or invalid authentication tokens and reconnection steps. Does not cover Xero export mapping configuration.
---

# XERO45 Sync Error in Xero Integration

If you see the error:

XERO45 Sync Error: Unable to sync Xero data due to an invalid authentication token. Please disconnect and reconnect Xero in the workspace.

This means the authentication token connecting the Workspace to Xero has expired or is no longer valid.

Until the connection is refreshed, syncing will fail.

---

## Why the XERO45 Sync Error Happens in Xero

The XERO45 error typically indicates:

- The Xero authentication token has expired.
- The Xero connection was revoked or changed.
- Xero requires reauthorization to restore access.

When the token is invalid, Expensify cannot access Xero data.

This is a connection authentication issue, not a Xero export mapping configuration error.

---

## How to Fix the XERO45 Sync Error

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

Yes. You must use Xero admin credentials to reauthorize the connection.

## Will Disconnecting Remove Imported Data?

Yes. Disconnecting clears imported data and settings, which is why saving your configuration beforehand is recommended.

## Does This Error Affect All Syncs?

Yes. While the authentication token is invalid, all Xero syncs and exports will fail until the connection is restored.
