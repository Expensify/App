---
title: NS0942 Sync Error in NetSuite Integration
description: Learn what the NS0942 sync error means and how to disconnect and reconnect the NetSuite integration after switching to a OneWorld account.
keywords: NS0942, NetSuite OneWorld error, Parent Company not found NetSuite, subsidiaries not importing NetSuite, disconnect NetSuite integration, reconnect NetSuite OneWorld, Expensify NetSuite sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0942 sync error caused by switching from a non-OneWorld to a OneWorld NetSuite account. Does not cover bundle updates or token permission troubleshooting.
---

# NS0942 Sync Error in NetSuite Integration

If you see the error:

NS0942 Sync Error: 'Parent Company' not found for subsidiaries. Please disconnect and reconnect the NetSuite connection to import the subsidiaries.

This means your NetSuite account type has changed.

This error commonly appears when switching from a **non-OneWorld** NetSuite account to a **OneWorld** account after the connection was already established.

---

## Why the NS0942 Sync Error Happens in NetSuite

The NS0942 error typically occurs when:

- Your NetSuite account was originally **non-OneWorld**.
- You upgraded or migrated to a **OneWorld** account.
- The existing NetSuite connection in the Workspace was not reconfigured after the change.

OneWorld accounts use a **parent company and subsidiary structure**. If the integration was set up before this structure existed, subsidiaries will not import correctly.

The integration must be disconnected and reconnected to refresh the account structure.

This is an account structure change issue, not a bundle or token permission issue.

---

## How to Fix the NS0942 Sync Error

You will need to disconnect and reconnect the NetSuite integration in each affected Workspace.

---

## Save Your Current Configuration

Before disconnecting, save your current configuration:

- Imported categories  
- Imported tags  
- Export settings  
- Mapping settings  
- Any custom configuration  

Taking screenshots is recommended, as disconnecting resets imported data.

---

## Disconnect the NetSuite Connection

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot menu next to the NetSuite connection.
5. Click **Disconnect**.
6. Confirm the disconnection.
7. Refresh the page to confirm the connection is removed.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the three-dot menu next to the NetSuite connection.
5. Tap **Disconnect**.
6. Confirm the disconnection.
7. Refresh the app.

---

## Reconnect to NetSuite

1. Click **Connect to NetSuite**.
2. Complete the full connection flow.
3. Confirm subsidiaries import successfully.

Once reconnected, the parent company and subsidiaries should import correctly.

---

## Repeat for Each Workspace

If multiple Workspaces are connected to the same NetSuite account, repeat the disconnect and reconnect process in each Workspace.

---

# FAQ

## Will Disconnecting Remove My Configuration?

Yes. Disconnecting resets the NetSuite connection and clears imported settings. Save your configuration before disconnecting.

## Does the NS0942 Sync Error Fix Itself Automatically?

No. You must manually disconnect and reconnect the integration after switching to a OneWorld account.

## Do I Need NetSuite Admin Access to Fix This?

Yes. Reconnecting requires NetSuite credentials with the appropriate integration role permissions.
