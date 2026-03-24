---
title: DESK23 Error in QuickBooks Desktop Web Connector
description: Learn how to fix the DESK23 error in QuickBooks Desktop when the wrong company file is open during sync.
keywords: DESK23, QuickBooks Desktop wrong company file open, Web Connector company file error, QuickBooks Desktop sync error, reauthorize Web Connector, Expensify QuickBooks Desktop sync error, Workspace Admin
internalScope: Audience is Workspace Admins using QuickBooks Desktop integration with Web Connector. Covers resolving the DESK23 error caused by incorrect or unauthorized company files. Does not cover QuickBooks Online errors.
---

# DESK23 Error in QuickBooks Desktop Web Connector

If you see the error:

DESK23: The wrong QuickBooks company file is open. Please close the file and reopen.

This means QuickBooks Desktop has a different company file open than the one connected to your Expensify Workspace.

---

## Why the DESK23 Error Happens in QuickBooks Desktop

The DESK23 error occurs when:

- Multiple QuickBooks company files are open at the same time.
- A company file that is not connected to the Expensify Workspace is open.
- The Web Connector is attempting to sync with a different file than the one originally authorized.

Expensify can only sync with the specific QuickBooks company file that was previously connected.

---

## How to Confirm the Correct Company File Is Open

1. Open **QuickBooks Desktop**.
2. Go to **File** > **Open or Restore Company**.
3. Select the correct company file associated with your Expensify Workspace.
4. Close any other open company files.
5. Retry the sync in Expensify.

If the correct company file is already open and the error persists:

1. Completely close **QuickBooks Desktop**.
2. Reopen QuickBooks Desktop.
3. Open the correct company file.
4. Retry the sync.

---

## How to Sync QuickBooks Desktop in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync now**.

If the error continues, proceed with reauthorization.

---

## How to Reauthorize the Web Connector

1. Log in to **QuickBooks Desktop** in **Single-user mode** as an Admin.
2. Go to **Edit** > **Preferences**.
3. Select **Integrated Applications**.
4. Click the **Company Preferences** tab.
5. Locate the **Web Connector** entry.
6. Remove the Web Connector from the list.
7. Click **OK**.

Then, in Expensify:

1. Go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync now**.

This will prompt reauthorization for QuickBooks Desktop. Complete the authorization process.

Once reauthorized, the connection should sync successfully.

---

# FAQ

## Can I Have Multiple Company Files Open During Sync?

No. Only the company file connected to the Expensify Workspace should be open during sync.

## Does This Apply to QuickBooks Online?

No. DESK23 applies only to QuickBooks Desktop integrations using the Web Connector.
