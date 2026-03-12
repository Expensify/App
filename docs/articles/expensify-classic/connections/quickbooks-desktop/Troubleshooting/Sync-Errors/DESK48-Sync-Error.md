---
title: DESK48 Sync Error in QuickBooks Desktop Web Connector
description: Learn how to fix the DESK48 sync error in QuickBooks Desktop when a company file is already open.
keywords: DESK48, QuickBooks Desktop company file already open, Web Connector sync error, wrong company file open, reauthorize Web Connector, Expensify QuickBooks Desktop sync error, Workspace Admin
internalScope: Audience is Workspace Admins using QuickBooks Desktop integration with Web Connector. Covers resolving the DESK48 sync error caused by incorrect or multiple company files being open. Does not cover QuickBooks Online errors.
---

# DESK48 Sync Error in QuickBooks Desktop Web Connector

If you see the error:

DESK48: QuickBooks Desktop already has a company file open.

This means QuickBooks Desktop is currently running a company file that does not match the one connected to your Expensify Workspace, or multiple company files are open.

---

## Why the DESK48 Sync Error Happens in QuickBooks Desktop

The DESK48 error occurs when:

- Multiple QuickBooks company files are open at the same time.
- A company file not connected to the Expensify Workspace is open.
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

No. Only the QuickBooks company file connected to the Expensify Workspace should be open during sync.

## Does This Apply to QuickBooks Online?

No. DESK48 applies only to QuickBooks Desktop integrations using the Web Connector.
