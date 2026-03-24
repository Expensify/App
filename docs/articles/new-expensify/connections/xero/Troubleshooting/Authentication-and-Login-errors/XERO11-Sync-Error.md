---
title: XERO11 Sync Error in Xero Integration
description: Learn what the XERO11 sync error means and how to reconnect your Xero integration in New Expensify.
keywords: XERO11, Xero connection expired, reconnect Xero New Expensify, Xero sync error, Expensify Xero integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration in New Expensify. Covers resolving the XERO11 sync error related to expired Xero credentials and reconnection steps. Does not cover Xero export mapping, tax, or category configuration.
---

# XERO11 Sync Error in Xero Integration

If you see the error:

XERO11 Sync Error: The connection to Xero has expired. Please follow prompts in the Workspace to reconnect.

This means the authentication credentials for your Xero connection have expired.

Until the connection is reauthenticated, syncing and exports to Xero will fail.

---

## Why the XERO11 Sync Error Happens in Xero

The XERO11 error typically occurs when:

- The Xero authentication token has expired.
- The Xero connection was revoked in Xero.
- The connected Xero admin user no longer has access.
- Xero requires reauthorization for security reasons.

Xero requires periodic reauthentication to maintain a secure integration.

This is a connection issue, not a category or export mapping issue.

---

# How to Reconnect Xero in New Expensify

Follow the steps below to restore the connection.

---

## Reconnect the Xero Integration in the Workspace

On web:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot icon next to the Xero connection.
5. Click **Sync now**.
6. When prompted, click **Reconnect**.
7. Log in using the Xero admin credentials originally used to connect the Workspace.
8. Complete the authorization flow.

On mobile:

1. Tap the navigation tabs on the bottom.
2. Tap **Workspaces**.
3. Select your Workspace.
4. Tap **Accounting**.
5. Tap the three-dot icon next to the Xero connection.
6. Tap **Sync now**.
7. When prompted, tap **Reconnect** and complete the authorization flow.

---

## Retry the Sync or Export

After reconnecting:

1. Go to **Settings > Workspaces > [Workspace Name] > Accounting**.
2. Click **Sync now**.
3. Retry exporting the report if needed.

If the connection was successfully restored, syncing and exports should complete normally.

---

# FAQ

## Do I Need Xero Admin Access to Reconnect?

Yes. You must use a Xero account with admin permissions for the connected organization.

## Will Previously Failed Exports Retry Automatically?

No. You may need to manually retry exports after the connection has been restored.
