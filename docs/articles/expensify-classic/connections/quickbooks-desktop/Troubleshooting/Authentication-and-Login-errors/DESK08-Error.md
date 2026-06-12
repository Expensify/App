---
title: DESK08 Error in QuickBooks Desktop Web Connector
description: Learn how to fix the DESK08 error in QuickBooks Desktop when Expensify cannot connect to the Web Connector or company file.
keywords: DESK08, QuickBooks Desktop connection error, unable to reach QuickBooks Desktop, Web Connector not open, QuickBooks company file not open, run Web Connector as administrator, reinstall Web Connector, Expensify QuickBooks Desktop sync error, Workspace Admin
internalScope: Audience is Workspace Admins using QuickBooks Desktop integration with Web Connector. Covers fixing the DESK08 error caused by connection issues between Expensify and QuickBooks Desktop. Does not cover QuickBooks Online errors.
---

# DESK08 Error in QuickBooks Desktop Web Connector

If you see the error:

DESK08: Unable to reach QuickBooks Desktop connection. Please confirm both Web Connector and QuickBooks company file are both open.

This means Expensify cannot connect to QuickBooks Desktop through the Web Connector.

---

## Why the DESK08 Error Happens in QuickBooks Desktop

The DESK08 error occurs when:

- QuickBooks Desktop is not open.
- The correct company file is not open.
- QuickBooks Web Connector (QBWC) is not running.
- The Web Connector is installed on a different machine than QuickBooks Desktop.
- The Web Connector does not have sufficient permissions to connect.

Expensify relies on the Web Connector to communicate with QuickBooks Desktop. If either application is not running or not accessible, the sync will fail.

---

## How to Fix the DESK08 Error

### Step One: Confirm Both Applications Are Running

1. Open **QuickBooks Desktop**.
2. Open the correct **company file**.
3. Launch **QuickBooks Web Connector**.
4. Attempt to sync again from Expensify.

---

### Step Two: Confirm Web Connector Is Installed in the Correct Location

Verify that the Web Connector is installed on the same machine where QuickBooks Desktop is installed:

- If QuickBooks Desktop is installed on your local computer, the Web Connector must also be installed locally.
- If QuickBooks Desktop is hosted on a remote server, the Web Connector must be installed on that same server.

If they are installed on different machines, reinstall the Web Connector in the correct location.

---

### Step Three: Run Web Connector as Administrator

If the error persists:

1. Close QuickBooks Web Connector completely.
2. Use **Task Manager** to confirm it is no longer running.
3. Right-click the **QuickBooks Web Connector** icon.
4. Select **Run as administrator**.
5. Retry the sync.

---

### Step Four: Restart and Retry

1. Restart **QuickBooks Desktop**.
2. Reopen the correct company file.
3. Open **QuickBooks Web Connector**.
4. In Expensify:
   - Go to **Settings**.
   - Select **Workspaces**.
   - Select your Workspace.
   - Click **Accounting**.
   - Click **Sync now**.
5. Retry the sync.

---

### Step Five: Reinstall QuickBooks Web Connector

If the issue continues:

1. Uninstall **QuickBooks Web Connector**.
2. Download and reinstall the latest version.
3. Reconfigure the connection in Web Connector.
4. Retry the sync.

---

# FAQ

## Does DESK08 Mean My Data Is Lost?

No. This error only indicates a connection issue. Your data remains in both Expensify and QuickBooks Desktop.

## Does This Apply to QuickBooks Online?

No. DESK08 applies only to QuickBooks Desktop integrations using the Web Connector.
