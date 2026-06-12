---
title: DESK74 Error in QuickBooks Desktop Web Connector
description: Learn how to fix the DESK74 error in QuickBooks Desktop when a dialog box is blocking sync or export.
keywords: DESK74, QuickBooks Desktop dialog box open, Web Connector sync blocked, QuickBooks Desktop export error, close dialog box QuickBooks, Expensify QuickBooks Desktop sync error, Workspace Admin
internalScope: Audience is Workspace Admins using QuickBooks Desktop integration with Web Connector. Covers resolving the DESK74 error caused by open dialog boxes in QuickBooks Desktop. Does not cover QuickBooks Online errors.
---

# DESK74 Error in QuickBooks Desktop Web Connector

If you see the error:

DESK74: A dialog box is currently open in QuickBooks Desktop. Please close it and try syncing or exporting again.

This means a pop-up window or dialog box is open in QuickBooks Desktop and is blocking the Web Connector from completing a sync or export.

---

## Why the DESK74 Error Happens in QuickBooks Desktop

The DESK74 error occurs when:

- A confirmation window is open in QuickBooks Desktop.
- A transaction window is open and awaiting input.
- A warning or message box is open in the background.
- QuickBooks is not fully idle.

QuickBooks Desktop cannot process sync or export requests while a dialog box is open.

---

## How to Fix the DESK74 Error

1. Open **QuickBooks Desktop**.
2. Close any open transaction windows.
3. Close any pop-up messages or confirmation dialogs.
4. Ensure only the gray QuickBooks home screen is visible with no open windows.
5. Retry the sync or export in Expensify.

### How to Retry the Sync in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync now**.

Once all dialog boxes are closed, the sync or export should complete successfully.

---

# FAQ

## Can Background Pop-Ups Cause This Error?

Yes. Even a hidden confirmation or warning window can block the Web Connector and trigger the DESK74 error.

## Does This Apply to QuickBooks Online?

No. DESK74 applies only to QuickBooks Desktop integrations using the Web Connector.
