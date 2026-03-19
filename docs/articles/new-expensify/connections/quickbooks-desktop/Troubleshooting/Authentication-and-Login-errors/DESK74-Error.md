---
title: DESK74 Error in QuickBooks Desktop Integration
description: Learn what the DESK74 error means and how to close open dialog boxes in QuickBooks Desktop before syncing or exporting.
keywords: DESK74, QuickBooks dialog box open error, QuickBooks Desktop sync blocked, close dialog box QuickBooks, Expensify QuickBooks Desktop error, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Desktop integration. Covers resolving the DESK74 error caused by open dialog boxes in QuickBooks Desktop. Does not cover mapping or connection configuration errors.
---

# DESK74 Error in QuickBooks Desktop Integration

If you see the error:

DESK74 Error: A dialog box is currently open in QuickBooks Desktop. Please close it and try syncing or exporting again.

This means there is an open dialog box or window in QuickBooks Desktop that is preventing the integration from running.

QuickBooks cannot process sync or export requests while certain windows are open.

---

## Why the DESK74 Error Happens in QuickBooks Desktop

The DESK74 error occurs when:

- A pop-up dialog box is open in QuickBooks Desktop.
- A transaction window is open and not closed.
- A confirmation message is waiting for input.
- QuickBooks is prompting for a response in the background.

When any dialog box is open, QuickBooks blocks external requests from the Web Connector.

This is a QuickBooks interface issue, not a data issue.

---

# How to Fix the DESK74 Error

Follow the steps below to clear open windows and retry the sync.

---

## Close All Open Windows in QuickBooks Desktop

1. Open **QuickBooks Desktop**.
2. Close any open transaction windows, pop-ups, or dialog boxes.
3. Continue closing windows until only a gray screen is visible in QuickBooks.

There should be no open forms or prompts displayed.

---

## Retry the Sync or Export

After closing all open windows:

1. Open **QuickBooks Web Connector**.
2. Run the update again.

Or in the Workspace:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot icon next to the QuickBooks Desktop connection.
5. Click **Sync now**.

If no dialog boxes are open, the sync or export should complete successfully.

---

# FAQ

## Do I Need to Restart QuickBooks?

Usually no. Closing all open windows is sufficient. If the issue continues, restart QuickBooks Desktop and try again.

## Can Background Prompts Cause This Error?

Yes. Even a hidden confirmation window can block the integration. Make sure all prompts are closed.
