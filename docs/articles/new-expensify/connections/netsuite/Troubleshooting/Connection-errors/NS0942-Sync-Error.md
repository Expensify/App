---
title: NS0942 Sync Error in NetSuite Integration
description: Learn what the NS0942 sync error means when switching to a NetSuite OneWorld account and how to disconnect and reconnect the NetSuite integration.
keywords: NS0942, NetSuite OneWorld error, Parent Company not found, NetSuite subsidiaries not importing, disconnect NetSuite, reconnect NetSuite integration, Expensify NetSuite sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0942 sync error caused by moving from a non-OneWorld to a OneWorld NetSuite account. Does not cover bundle updates or token permission troubleshooting.
---

# NS0942 Sync Error in NetSuite Integration

If you see the error:

NS0942 Sync Error: 'Parent Company' not found for subsidiaries. Please disconnect and reconnect the NetSuite connection to import the subsidiaries.

This means your NetSuite account type has changed.

This error commonly appears when switching from a **non-OneWorld** NetSuite account to a **OneWorld** account after the connection has already been established in the Workspace.

---

## Why the NS0942 Sync Error Happens in NetSuite

The NS0942 error typically occurs when:

- Your NetSuite account was previously non-OneWorld.
- You upgraded or migrated to a **OneWorld** account.
- The existing NetSuite connection was not reconfigured after the change.

OneWorld accounts use subsidiaries and a parent company structure. The original connection does not properly import subsidiary data after this change.

The integration must be reconnected to refresh the account structure.

This is an account structure change issue, not a bundle update or token permission issue.

---

## How to Fix the NS0942 Sync Error

You must disconnect and reconnect the NetSuite integration in each affected Workspace.

---

## Save Your Current Configuration Before Disconnecting

Before disconnecting:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Take screenshots of:
   - Imported categories.
   - Imported tags.
   - Mapping settings.
   - Any custom configuration.

Disconnecting removes imported data and settings.

---

## Disconnect the NetSuite Connection

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot menu next to the NetSuite connection.
5. Click **Disconnect**.
6. Confirm the disconnection.
7. Refresh the page to confirm the connection has been removed.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the three-dot menu next to the NetSuite connection.
5. Tap **Disconnect**.
6. Confirm the disconnection.
7. Refresh the app to confirm the connection is removed.

---

## Reconnect to NetSuite

After confirming the connection has been removed:

1. Click **Connect to NetSuite**.
2. Complete the NetSuite connection flow.
3. Confirm subsidiaries and parent company data import successfully.

Once reconnected, subsidiary and parent company data should sync correctly.

---

## Repeat for Each Connected Workspace

If multiple Workspaces are connected to NetSuite, repeat the disconnect and reconnect process in each one.

---

# FAQ

## Will Disconnecting Remove My Configuration?

Yes. Disconnecting resets the NetSuite connection and removes imported settings. Save screenshots of your configuration before disconnecting.

## Does the NS0942 Sync Error Fix Itself Automatically?

No. The integration must be manually disconnected and reconnected after switching to a OneWorld account.

## Does This Affect All Exports?

Yes. Until the connection is refreshed, syncing and exports may fail due to missing subsidiary data.
