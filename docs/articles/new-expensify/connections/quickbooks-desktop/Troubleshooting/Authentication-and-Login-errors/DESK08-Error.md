---
title: DESK08 Error in QuickBooks Desktop Integration
description: Learn what the DESK08 error means and how to restore the connection between Expensify and QuickBooks Desktop.
keywords: DESK08, QuickBooks Desktop connection error, unable to reach QuickBooks Desktop, Web Connector not connecting, Expensify QuickBooks Desktop sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Desktop integration. Covers resolving the DESK08 error related to connection issues between QuickBooks Web Connector and QuickBooks Desktop. Does not cover mapping or export configuration errors.
---

# DESK08 Error in QuickBooks Desktop Integration

If you see the error:

DESK08 Error: Unable to reach QuickBooks Desktop connection. Please confirm both Web Connector and QuickBooks company file are both open.

This means there is a connection issue between the Workspace and QuickBooks Desktop.

The integration cannot communicate with QuickBooks through the QuickBooks Web Connector.

---

## Why the DESK08 Error Happens in QuickBooks Desktop

The DESK08 error typically occurs when:

- QuickBooks Desktop is not open.
- The QuickBooks company file is not open.
- QuickBooks Web Connector (QBWC) is not running.
- QuickBooks Web Connector is installed on a different machine than QuickBooks Desktop.
- The Web Connector is not running with sufficient permissions.
- The Web Connector process is stuck or frozen.

This is a connectivity issue, not a data or mapping issue.

---

# How to Fix the DESK08 Error

Follow the steps below to restore the connection.

---

## Confirm QuickBooks Desktop and Web Connector Are Open

1. Open **QuickBooks Desktop**.
2. Open the correct **company file**.
3. Open **QuickBooks Web Connector**.
4. Attempt to run the update again.

QuickBooks and the Web Connector must be running at the same time.

---

## Confirm Web Connector Is Installed on the Correct Machine

Verify that QuickBooks Web Connector is installed in the same location as QuickBooks Desktop:

- If QuickBooks is installed on your local computer, the Web Connector must also be installed locally.
- If QuickBooks is hosted on a remote server, the Web Connector must be installed on that server.

If they are installed on different machines, reinstall the Web Connector in the correct location.

---

## Restart the Web Connector With Administrator Permissions

If the error persists:

1. Close QuickBooks Web Connector completely.
2. Open **Task Manager** and confirm the Web Connector process is fully closed.
3. Right-click the Web Connector icon.
4. Select **Run as administrator**.
5. Retry the sync or export.

---

## Restart QuickBooks Desktop

If the issue continues:

1. Close QuickBooks Desktop.
2. Reopen QuickBooks Desktop.
3. Open the company file.
4. Open QuickBooks Web Connector.
5. Retry the update.

---

## Run Sync From the Workspace

After confirming everything is running:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot icon next to the QuickBooks Desktop connection.
5. Click **Sync now**.

---

## Reinstall QuickBooks Web Connector

If none of the steps above resolve the issue:

1. Uninstall QuickBooks Web Connector.
2. Reinstall the latest supported version.
3. Reconnect the integration.
4. Retry the sync.

---

# FAQ

## Does the DESK08 Error Mean My Integration Is Disconnected?

Not necessarily. It usually means QuickBooks Desktop or Web Connector is not running or cannot communicate.

## Do QuickBooks and Web Connector Have to Be Open at the Same Time?

Yes. Both QuickBooks Desktop and QuickBooks Web Connector must be open and connected to the correct company file for syncing to work.

## Do I Need Administrator Permissions?

In many cases, yes. Running the Web Connector as an administrator can resolve permission-related connection issues.
