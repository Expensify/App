---
title: DESK23 Error in QuickBooks Desktop Integration
description: Learn what the DESK23 error means and how to reopen the correct QuickBooks company file before syncing with Expensify.
keywords: DESK23, wrong QuickBooks company file open, QuickBooks Desktop company file error, reauthorize QuickBooks Web Connector, Expensify QuickBooks Desktop sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Desktop integration. Covers resolving the DESK23 error related to incorrect QuickBooks company files and reauthorization. Does not cover mapping or export configuration errors.
---

# DESK23 Error in QuickBooks Desktop Integration

If you see the error:

DESK23 Error: The wrong QuickBooks company file is open. Please close the file and reopen.

This means the QuickBooks company file currently open does not match the one connected to the Workspace.

QuickBooks Desktop must have the exact company file open that is connected to the Workspace.

---

## Why the DESK23 Error Happens in QuickBooks Desktop

The DESK23 error typically occurs when:

- Multiple QuickBooks company files are open at the same time.
- A different QuickBooks company file is open than the one connected to the Workspace.
- The Web Connector is pointing to a different company file.
- The company file connection was changed without reauthorization.

This is a company file mismatch issue, not a data issue.

---

# How to Fix the DESK23 Error

Follow the steps below to confirm the correct company file and restore the connection.

---

## Open the Correct QuickBooks Company File

1. Open **QuickBooks Desktop**.
2. Go to **File > Open or Restore Company**.
3. Select the correct **Company Name** connected to the Workspace.
4. Confirm only that company file is open.
5. Close any additional QuickBooks company files.

If the correct file is already open but the error persists:

1. Close QuickBooks Desktop completely.
2. Reopen QuickBooks Desktop.
3. Open the correct company file again.

Then in the Workspace:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot icon next to the QuickBooks Desktop connection.
5. Click **Sync now**.

---

## Reauthorize the QuickBooks Web Connector (If Needed)

If the error continues:

1. Log in to QuickBooks Desktop in **Single-user Admin mode**.
2. Go to **Edit > Preferences > Integrated Applications > Company Preferences**.
3. Locate the **Web Connector** entry.
4. Remove the Web Connector from the list.
5. Click **OK**.

Then in the Workspace:

1. Go to **Settings > Workspaces > [Workspace Name] > Accounting**.
2. Click the three-dot icon next to the connection.
3. Click **Sync now**.

This will prompt you to reauthorize QuickBooks Desktop.

Complete the authorization steps. Once finished, the connection should sync successfully.

---

# FAQ

## Does the DESK23 Error Mean My Data Is Lost?

No. It means the wrong QuickBooks company file is open.

## Do I Need to Use Single-User Mode?

If reauthorization is required, yes. You must log in as an admin in Single-user mode to remove and reauthorize the Web Connector.

## Can Multiple Company Files Be Open at the Same Time?

No. Only the company file connected to the Workspace should be open during sync.
