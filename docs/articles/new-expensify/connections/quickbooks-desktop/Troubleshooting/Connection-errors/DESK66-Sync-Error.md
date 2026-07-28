---
title: DESK66 Sync Error in QuickBooks Desktop Integration
description: Learn what the DESK66 sync error means and how to reset QuickBooks Desktop services, permissions, and Web Connector settings.
keywords: DESK66, no data parameter selected, QuickBooks Desktop sync error, reset QuickBooks permissions certificate, reinstall Web Connector, Expensify QuickBooks Desktop connection issue, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Desktop integration. Covers resolving the DESK66 sync error related to connection resets, permissions certificates, and Web Connector reinstallation. Does not cover mapping or export configuration errors.
---

# DESK66 Sync Error in QuickBooks Desktop Integration

If you see the error:

DESK66 Sync Error: No data parameter selected.

This means there is a connection issue between the Workspace and QuickBooks Desktop.

The integration request could not be processed due to a permissions, service, or installation issue.

---

## Why the DESK66 Sync Error Happens in QuickBooks Desktop

The DESK66 error typically occurs when:

- QuickBooks Desktop services are stuck or not running properly.
- The permissions certificate between QuickBooks and Web Connector is corrupted.
- Multiple versions of QuickBooks are installed on the same machine.
- The QuickBooks Foundation Classes (QBFC) driver is missing or corrupted.
- The Web Connector connection needs to be reset.

This is a system-level connection issue, not a report data issue.

---

# How to Fix the DESK66 Sync Error

Follow the steps below in order.

---

## Perform a Full Reboot of the Server or Machine

1. Completely reboot the computer or server where the QuickBooks Desktop company file is installed.
2. Ensure all QuickBooks Desktop processes and services are fully reset.
3. After rebooting, open:
   - QuickBooks Desktop
   - The correct company file
   - QuickBooks Web Connector
4. Retry the sync.

---

## Reset the QuickBooks Desktop Permissions Certificate

1. Log in to **QuickBooks Desktop** in **Single-user Admin mode**.
2. Go to **Edit > Preferences**.
3. Select **Integrated Applications**.
4. Click the **Company Preferences** tab.
5. Remove the **Web Connector** listed there.
6. Click **OK** to exit Preferences.

You will be prompted with the permissions certificate window during reauthorization.

Follow the prompts to allow the Web Connector to access the QuickBooks Desktop company file.

---

## Remove Unused Versions of QuickBooks

If multiple versions of QuickBooks Desktop are installed on the machine:

1. Uninstall any versions that are not actively used.
2. Ensure only the correct version remains.

---

## Reinstall QuickBooks and QBFC Driver (If Needed)

If the issue persists:

1. Reinstall **QuickBooks Desktop**.
2. Reinstall the **QBFC driver**.
3. Reopen QuickBooks Desktop.
4. Retry the sync.

---

## Fully Reset the Integration (If Error Persists)

If none of the above resolves the issue:

### Step 1: Remove Web Connector

1. Open QuickBooks Desktop in **Single-user Admin mode**.
2. Go to **Edit > Preferences > Integrated Applications > Company Preferences**.
3. Remove the **Web Connector** entry.
4. Click **OK**.

---

### Step 2: Disconnect QuickBooks Desktop in the Workspace

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot icon next to the QuickBooks Desktop connection.
5. Click **Disconnect**.
6. Refresh the browser page to confirm the Workspace is disconnected.

---

### Step 3: Reboot and Reinstall Web Connector

1. Reboot the computer.
2. Download and install the latest version of **QuickBooks Web Connector**.
3. Reconnect to QuickBooks Desktop from the Workspace.
4. Complete the authorization process.
5. Click **Sync now**.

If reconnected successfully, the sync should complete without the DESK66 error.

---

# FAQ

## Do I Need to Be in Single-User Admin Mode?

Yes. Resetting the permissions certificate and removing Web Connector requires Admin access in Single-user mode.

## Does the DESK66 Error Mean My Data Is Lost?

No. It indicates a system-level connection issue between QuickBooks Desktop and the Workspace.

## Should I Reinstall Web Connector First?

Start with a full reboot and certificate reset. Reinstall Web Connector only if the issue persists.
