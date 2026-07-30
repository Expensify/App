---
title: DESK48 Sync Error in QuickBooks Desktop Integration
description: Learn what the DESK48 sync error means and how to ensure the correct QuickBooks Desktop company file is open before syncing.
keywords: DESK48, QuickBooks Desktop company file already open, wrong company file open QuickBooks, reauthorize QuickBooks Web Connector, Expensify QuickBooks Desktop sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Desktop integration. Covers resolving the DESK48 sync error related to multiple or incorrect company files being open. Does not cover mapping or export configuration errors.
---

# DESK48 Sync Error in QuickBooks Desktop Integration

If you see the error:

DESK48 Sync Error: QuickBooks Desktop already has a company file open.

This means QuickBooks Desktop has a different company file open than the one connected to the Workspace, or multiple company files are open at the same time.

QuickBooks Desktop must have only the correct company file open during sync.

---

## Why the DESK48 Sync Error Happens in QuickBooks Desktop

The DESK48 error typically occurs when:

- Multiple QuickBooks company files are open simultaneously.
- A different QuickBooks company file is open than the one connected to the Workspace.
- The Web Connector is attempting to connect to the wrong company file.
- The integration requires reauthorization.

This is a company file mismatch issue, not a data issue.

---

# How to Fix the DESK48 Sync Error

Follow the steps below to confirm the correct company file and restore the connection.

---

## Confirm the Correct QuickBooks Company File Is Open

1. Open **QuickBooks Desktop**.
2. Go to **File > Open or Restore Company**.
3. Select the correct **Company Name** connected to the Workspace.
4. Confirm only that company file is open.
5. Close any additional QuickBooks company files.

If the correct company file is already open but the error persists:

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
2. Go to **Edit > Preferences**.
3. Select **Integrated Applications**.
4. Click the **Company Preferences** tab.
5. Remove the **Web Connector** entry.
6. Click **OK**.

Then in the Workspace:

1. Go to **Settings > Workspaces > [Workspace Name] > Accounting**.
2. Click the three-dot icon next to the connection.
3. Click **Sync now**.

This will prompt reauthorization in QuickBooks Desktop.

Complete the authorization process. Once finished, the connection should sync successfully.

---

# FAQ

## Does the DESK48 Error Mean My Data Is Lost?

No. It means the wrong QuickBooks company file is open.

## Do I Need to Use Single-User Admin Mode?

Yes, if reauthorization is required to remove and reconnect the Web Connector.

## Can Multiple Company Files Be Open During Sync?

No. Only the company file connected to the Workspace should be open during sync.
