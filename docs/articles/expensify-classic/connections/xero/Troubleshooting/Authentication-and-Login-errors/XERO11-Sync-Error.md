---
title: XERO11 Sync Error in Xero Integration
description: Learn what the XERO11 sync error means and how to reconnect your Xero account when the connection has expired.
keywords: XERO11, Xero connection expired, reconnect Xero Expensify Classic, Xero sync error, Expensify Xero integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration. Covers resolving the XERO11 sync error caused by expired Xero credentials and reconnection steps. Does not cover Xero export mapping or permission configuration.
---

# XERO11 Sync Error in Xero Integration

If you see the error:

XERO11 Sync Error: The connection to Xero has expired. Please follow prompts in the workspace to reconnect.

This means the authentication credentials for your Xero connection have expired.

Until the connection is reauthenticated, syncing and exports to Xero will fail.

---

## Why the XERO11 Sync Error Happens in Xero

The XERO11 error typically indicates:

- The Xero authentication token has expired.
- The Xero connection was revoked or disconnected.
- Xero requires reauthentication to maintain a secure connection.

Xero periodically requires reauthorization to keep the integration active.

This is a connection authentication issue, not an export mapping or permission configuration error.

---

## How to Fix the XERO11 Sync Error

Follow the steps below to reconnect the Xero integration.

### Reconnect the Xero Integration in the Workspace

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.
5. When prompted, click **Reconnect**.
6. Log in using the Xero admin credentials that were originally used to set up the connection.
7. Authorize the connection.

Once reconnected, the integration will refresh and syncing can resume.

### Retry the Sync or Export

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now** again.
5. Retry exporting any reports that previously failed.

---

# FAQ

## Do I Need Admin Access to Reconnect Xero?

Yes. You must use the Xero account with admin permissions that was originally used to connect the Workspace to Xero.

## Will Previously Failed Exports Sync Automatically?

After reconnecting, you may need to manually retry exporting any reports that failed while the connection was expired.

## Does This Error Affect All Exports?

Yes. While the connection is expired, all Xero syncs and exports will fail until the integration is reauthenticated.
