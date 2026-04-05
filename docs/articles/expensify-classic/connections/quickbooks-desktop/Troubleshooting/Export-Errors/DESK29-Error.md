---
title: DESK29 Error in QuickBooks Desktop Web Connector
description: Learn how to fix the DESK29 error in QuickBooks Desktop when the Web Connector cannot be reached during sync.
keywords: DESK29, QuickBooks Desktop Web Connector cannot be reached, QBWC connection error, QuickBooks company file not open, run Web Connector as administrator, Expensify QuickBooks Desktop sync error, Workspace Admin
internalScope: Audience is Workspace Admins using QuickBooks Desktop integration with Web Connector. Covers resolving the DESK29 error caused by connection issues between Expensify and QuickBooks Desktop. Does not cover QuickBooks Online errors.
---

# DESK29 Error in QuickBooks Desktop Web Connector

If you see the error:

DESK29: Web Connector cannot be reached. Please confirm both Web Connector and QuickBooks company file are both open.

This means Expensify cannot communicate with QuickBooks Desktop through the Web Connector.

---

## Why the DESK29 Error Happens in QuickBooks Desktop

The DESK29 error occurs when:

- QuickBooks Desktop is not open.
- The correct company file is not open.
- QuickBooks Web Connector (QBWC) is not running.
- The Web Connector is installed on a different machine than QuickBooks Desktop.
- The Web Connector does not have sufficient permissions.

Expensify relies on the Web Connector to sync data with QuickBooks Desktop. If either application is not accessible, the sync will fail.

---

## How to Fix the DESK29 Error

### Step One: Confirm Both Applications Are Running

1. Open **QuickBooks Desktop**.
2. Open the correct **company file**.
3. Launch **QuickBooks Web Connector**.
4. Retry the sync in Expensify.

---

### Step Two: Confirm Web Connector Is Installed in the Correct Location

Verify that the Web Connector is installed on the same machine as QuickBooks Desktop:

- If QuickBooks Desktop is installed on your local computer, the Web Connector must also be installed locally.
- If QuickBooks Desktop is hosted on a remote server, the Web Connector must be installed on that same server.

If needed, reinstall the Web Connector in the correct location.

---

### Step Three: Run Web Connector as Administrator

If the error persists:

1. Close QuickBooks Web Connector completely.
2. Use **Task Manager** to confirm it is no longer running.
3. Right-click the **QuickBooks Web Connector** icon.
4. Select **Run as administrator**.
5. Retry the sync.

---

## How to Retry the Sync in Expensify

1. Go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync now**.

Once both applications are running correctly and permissions are confirmed, the sync should complete successfully.

---

# FAQ

## Is DESK29 the Same as DESK08?

Both errors indicate connection issues between Expensify and QuickBooks Desktop, though they may occur in slightly different scenarios. The troubleshooting steps are similar.

## Does This Apply to QuickBooks Online?

No. DESK29 applies only to QuickBooks Desktop integrations using the Web Connector.
