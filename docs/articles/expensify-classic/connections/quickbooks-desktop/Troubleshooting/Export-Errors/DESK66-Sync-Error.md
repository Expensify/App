---
title: DESK66 Sync Error in QuickBooks Desktop Web Connector
description: Learn how to fix the DESK66 sync error in QuickBooks Desktop when no data parameter is selected.
keywords: DESK66, QuickBooks Desktop no data parameter selected, Web Connector sync error, reset QuickBooks permissions certificate, reinstall QBFC driver, reconnect QuickBooks Desktop, Expensify QuickBooks Desktop sync error, Workspace Admin
internalScope: Audience is Workspace Admins using QuickBooks Desktop integration with Web Connector. Covers resolving the DESK66 sync error caused by connection or certificate issues. Does not cover QuickBooks Online errors.
---

# DESK66 Sync Error in QuickBooks Desktop Web Connector

If you see the error:

DESK66: No data parameter selected.

This means there is a connection or configuration issue between Expensify and QuickBooks Desktop.

---

## Why the DESK66 Sync Error Happens in QuickBooks Desktop

The DESK66 error occurs when:

- QuickBooks Desktop services are not running properly.
- The Web Connector permissions certificate is corrupted or expired.
- Integrated Application permissions are misconfigured.
- Multiple versions of QuickBooks are installed on the same machine.
- The QuickBooks Foundation Class (QBFC) driver is not functioning correctly.

This error typically requires resetting permissions or reinstalling components.

---

## How to Fix the DESK66 Sync Error

### Step One: Perform a Full Reboot

1. Perform a full reboot of the computer or server where QuickBooks Desktop is installed.
2. This ensures all QuickBooks Desktop processes and services are fully reset.
3. After rebooting, open QuickBooks Desktop and Web Connector.
4. Retry the sync.

If the error persists, reset the permissions certificate.

---

### Step Two: Reset the QuickBooks Permissions Certificate

1. Log in to **QuickBooks Desktop** in **Single-user mode** as an **Admin**.
2. Go to **Edit** > **Preferences**.
3. Select **Integrated Applications**.
4. Click the **Company Preferences** tab.
5. Remove the **Web Connector** from the list.
6. Exit the Preferences window.

You will be prompted to reauthorize the Web Connector. Follow the prompts to allow the Web Connector to access the QuickBooks Desktop company file.

---

### Step Three: Remove Unused QuickBooks Versions

1. Uninstall any unused versions of QuickBooks from the machine.
2. Ensure only the active QuickBooks Desktop version remains installed.

---

### Step Four: Reinstall QuickBooks Components

If the issue continues:

1. Reinstall **QuickBooks Desktop**.
2. Reinstall the **QBFC driver**.
3. Open QuickBooks Desktop and Web Connector.
4. Retry the sync.

---

## If the Error Persists

Follow these advanced troubleshooting steps:

1. Remove the **Web Connector** from Integrated Applications in QuickBooks Desktop.
2. In Expensify:
   - Go to **Settings**.
   - Select **Workspaces**.
   - Select your Workspace.
   - Click **Accounting**.
   - Click **Disconnect Workspace**.
3. Refresh your browser to confirm the Workspace has been disconnected.
4. Reboot the computer.
5. Download and reinstall **QuickBooks Web Connector**.
6. Reconnect QuickBooks Desktop to Expensify using the QuickBooks Desktop connection instructions in Expensify Help.

After reconnecting, complete the authorization prompts and retry the sync.

---

# FAQ

## Does DESK66 Mean My Data Is Lost?

No. This error indicates a connection or permission issue. Your data remains intact in both Expensify and QuickBooks Desktop.

## Does This Apply to QuickBooks Online?

No. DESK66 applies only to QuickBooks Desktop integrations using the Web Connector.
