---
title: DESK29 Error in QuickBooks Desktop Integration
description: Learn what the DESK29 error means and how to restore the connection between Expensify and QuickBooks Web Connector.
keywords: DESK29, Web Connector cannot be reached, QuickBooks Desktop connection error, QBWC not connecting, Expensify QuickBooks Desktop sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Desktop integration. Covers resolving the DESK29 error related to connection issues between QuickBooks Web Connector and QuickBooks Desktop. Does not cover mapping or export configuration errors.
---

# DESK29 Error in QuickBooks Desktop Integration

If you see the error:

DESK29 Error: Web Connector cannot be reached. Please confirm both Web Connector and QuickBooks company file are both open.

This means there is a connection issue between the Workspace and QuickBooks Web Connector.

The integration cannot communicate with QuickBooks Desktop.

---

## Why the DESK29 Error Happens in QuickBooks Desktop

The DESK29 error typically occurs when:

- QuickBooks Desktop is not open.
- The QuickBooks company file is not open.
- QuickBooks Web Connector (QBWC) is not running.
- Web Connector is installed on a different machine than QuickBooks Desktop.
- The Web Connector is not running with proper permissions.
- The Web Connector process is frozen or not responding.

This is a connection issue, not a data or mapping issue.

---

# How to Fix the DESK29 Error

Follow the steps below to restore the connection.

---

## Confirm QuickBooks Desktop and Web Connector Are Running

1. Open **QuickBooks Desktop**.
2. Open the correct **company file**.
3. Open **QuickBooks Web Connector**.
4. Retry the sync or export.

QuickBooks Desktop and Web Connector must be open at the same time.

---

## Confirm Web Connector Is Installed in the Correct Location

Verify that QuickBooks Web Connector is installed in the same location as QuickBooks Desktop:

- If QuickBooks is installed on your local computer, Web Connector must also be installed locally.
- If QuickBooks is hosted on a remote server, Web Connector must be installed on that server.

If they are installed on different machines, reinstall Web Connector in the correct location.

---

## Restart Web Connector With Administrator Permissions

If the error persists:

1. Close QuickBooks Web Connector completely.
2. Open **Task Manager** and confirm the Web Connector process is fully closed.
3. Right-click the Web Connector icon.
4. Select **Run as administrator**.
5. Retry the sync.

---

## Run Sync in the Workspace

After confirming everything is running properly:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot icon next to the QuickBooks Desktop connection.
5. Click **Sync now**.

If the connection is restored, the sync should complete successfully.

---

# FAQ

## Does the DESK29 Error Mean the Integration Is Disconnected?

Not necessarily. It usually means Web Connector or QuickBooks Desktop is not running or cannot communicate.

## Do QuickBooks Desktop and Web Connector Have to Be Open at the Same Time?

Yes. Both must be open and connected to the correct company file for syncing to work.

## Do I Need Administrator Permissions?

In many cases, yes. Running Web Connector as an administrator can resolve permission-related connection issues.
