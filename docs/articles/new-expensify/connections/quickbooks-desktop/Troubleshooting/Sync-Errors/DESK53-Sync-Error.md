---
title: DESK53 Sync Error in QuickBooks Desktop Integration
description: Learn what the DESK53 sync error means and how to restore automatic login permissions for QuickBooks Web Connector.
keywords: DESK53, error while attempting to provision company, QuickBooks Web Connector permissions, allow application to login automatically, Expensify QuickBooks Desktop sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Desktop integration. Covers resolving the DESK53 sync error related to QuickBooks Web Connector login permissions. Does not cover mapping or export configuration errors.
---

# DESK53 Sync Error in QuickBooks Desktop Integration

If you see the error:

DESK53 Sync Error: Error while attempting to provision company.

This means there is a connection or permissions issue between the Workspace and QuickBooks Desktop.

QuickBooks Web Connector does not have the required permission to automatically log in and sync.

---

## Why the DESK53 Sync Error Happens in QuickBooks Desktop

The DESK53 error typically occurs when:

- QuickBooks Web Connector is not authorized to log in automatically.
- The integration permissions were changed or removed.
- QuickBooks is not running in the correct user mode.
- The connection requires reauthorization.

This is a permissions issue in QuickBooks Desktop, not a report data issue.

---

# How to Fix the DESK53 Sync Error

Follow the steps below to restore automatic login permissions.

---

## Enable Automatic Login for QuickBooks Web Connector

1. Open **QuickBooks Desktop**.
2. Log in under **Single-user Admin mode**.
3. Go to **Edit > Preferences**.
4. Select **Integrated Applications**.
5. Click the **Company Preferences** tab.
6. Select **Web Connector** from the list.
7. Click **Properties**.
8. Confirm **Allow this application to login automatically** is checked.
9. Click **OK**.
10. Click **OK** again to close Preferences.

---

## Restart QuickBooks Desktop and Web Connector

1. Close all windows within QuickBooks Desktop.
2. Close QuickBooks Desktop completely.
3. Reopen QuickBooks Desktop.
4. Open the correct company file.
5. Open **QuickBooks Web Connector**.

---

## Run Sync in the Workspace

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot icon next to the QuickBooks Desktop connection.
5. Click **Sync now**.

If permissions are configured correctly, the sync should complete successfully.

---

# FAQ

## Do I Need to Be in Single-User Mode?

Yes. You must log in as an Admin in Single-user mode to modify Integrated Application permissions.

## Does the DESK53 Error Mean My Integration Is Disconnected?

Not necessarily. It usually means QuickBooks Web Connector does not have automatic login permission.

## Do I Need to Reinstall Web Connector?

In most cases, no. Updating the login permissions resolves the issue.
