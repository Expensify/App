---
title: DESK81 Error in QuickBooks Desktop Integration
description: Learn what the DESK81 error means and how to restore permissions for QuickBooks Web Connector to access the company file.
keywords: DESK81, no permission to access QuickBooks company file, QuickBooks Web Connector permissions, allow application to login automatically, reauthorize QuickBooks Desktop integration, Expensify QuickBooks Desktop error
internalScope: Audience is Workspace Admins using the QuickBooks Desktop integration. Covers resolving the DESK81 error related to company file access permissions and reauthorization. Does not cover mapping or export configuration errors.
---

# DESK81 Error in QuickBooks Desktop Integration

If you see the error:

DESK81 Error: You do not have permission to access QuickBooks Desktop company file.

This means QuickBooks Web Connector does not have permission to access the QuickBooks company file.

This is a permissions issue between QuickBooks Desktop and the Workspace.

---

## Why the DESK81 Error Happens in QuickBooks Desktop

The DESK81 error typically occurs when:

- QuickBooks Web Connector is not authorized to log in automatically.
- The integration permissions were changed or removed.
- QuickBooks is not running in Single-user Admin mode.
- The connection requires reauthorization.

This is a permissions issue, not a data or mapping issue.

---

# How to Fix the DESK81 Error

Follow the steps below to restore access permissions.

---

## Enable Automatic Login for QuickBooks Web Connector

1. Open **QuickBooks Desktop**.
2. Log in under **Single-user Admin mode**.
3. Go to **Edit > Preferences**.
4. Select **Integrated Applications**.
5. Click the **Company Preferences** tab.
6. Select **Web Connector** from the list.
7. Click **Properties**.
8. Confirm **Allow this application to login automatically** is checked.
9. Click **OK**.
10. Close all open windows within QuickBooks Desktop.

Retry the sync from the Workspace:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot icon next to the connection.
5. Click **Sync now**.

---

## Reauthorize the QuickBooks Desktop Connection (If Needed)

If the error persists:

1. In QuickBooks Desktop, go to **Edit > Preferences**.
2. Select **Integrated Applications**.
3. Click the **Company Preferences** tab.
4. Remove the **Web Connector** from the list.
5. Click **OK**.

Then in the Workspace:

1. Go to **Settings > Workspaces > [Workspace Name] > Accounting**.
2. Click the three-dot icon next to the connection.
3. Click **Sync now**.

You will be prompted to reauthorize QuickBooks Desktop.

During reauthorization:

1. Click **Yes, always; allow access even if QuickBooks is not running**.
2. Select the **Admin user** from the dropdown.
3. Click **Continue**.
4. Click **Done** in the pop-up window.

Return to the Workspace and allow the sync to complete.

---

# FAQ

## Do I Need to Be in Single-User Mode?

Yes. You must log in as an Admin in Single-user mode to modify Integrated Application permissions.

## Does the DESK81 Error Mean My Data Is Lost?

No. It means QuickBooks Web Connector does not currently have permission to access the company file.

## Will Reauthorization Fix the Issue?

In most cases, yes. Removing and reauthorizing the Web Connector restores access permissions.
