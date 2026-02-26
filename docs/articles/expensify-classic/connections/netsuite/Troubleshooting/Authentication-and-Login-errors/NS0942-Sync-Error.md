---
title: NS0942 Sync Error in NetSuite Integration
description: Learn how to fix the NS0942 sync error in NetSuite when subsidiaries are not imported after moving to a OneWorld account.
keywords: NS0942, NetSuite OneWorld sync error, parent company not found subsidiaries, disconnect reconnect NetSuite, Expensify NetSuite sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0942 sync error caused by moving from a non-OneWorld to a OneWorld NetSuite account. Does not cover other NetSuite error codes.
---

# NS0942 Sync Error in NetSuite Integration

If you see the error:

NS0942: 'Parent Company' not found for subsidiaries. Please disconnect and reconnect the NetSuite connection to import the subsidiaries.

This means the NetSuite account type has changed, and Expensify needs to reimport subsidiary data.

---

## Why the NS0942 Sync Error Happens in NetSuite

The NS0942 error occurs when:

- Your NetSuite account was upgraded from a **non-OneWorld** account to a **OneWorld** account.
- The NetSuite connection was already established in Expensify before the upgrade.
- Subsidiary data was not reimported after enabling OneWorld.

Expensify must reconnect to properly detect and import subsidiary structure in OneWorld accounts.

---

## How to Fix the NS0942 Sync Error

Before disconnecting, it is strongly recommended to document your current configuration.

### Step One: Save Current Configuration

1. Take screenshots of:
   - Export settings.
   - Categories.
   - Tags.
   - Any imported mapping or layout settings.
2. Save these screenshots for reference after reconnecting.

Disconnecting removes imported options and requires reconfiguration.

---

### Step Two: Disconnect the NetSuite Connection

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Do Not Connect to NetSuite**.
6. Click **Disconnect** in the confirmation window.
7. Manually refresh your browser to confirm the connection has been removed.

---

### Step Three: Reconnect to NetSuite

1. Click **Connect to NetSuite**.
2. Follow the NetSuite connection steps in Expensify Help.
3. Complete the authentication process.
4. Allow the subsidiaries to import.

After reconnecting, reconfigure your accounting settings using the screenshots you saved earlier.

---

### Step Four: Repeat for Other Workspaces

If multiple Workspaces are connected to NetSuite:

- Repeat the disconnect and reconnect process in each Workspace.

---

# FAQ

## Will Disconnecting Remove My Settings?

Yes. Disconnecting clears imported options such as categories and tags. That is why saving screenshots beforehand is recommended.

## Does NS0942 Mean My Data Is Lost?

No. This error only affects the integration configuration. Your data remains intact in both Expensify and NetSuite.
