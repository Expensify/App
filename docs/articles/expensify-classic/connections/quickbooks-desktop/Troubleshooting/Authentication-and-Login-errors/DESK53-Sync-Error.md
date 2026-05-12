---
title: DESK53 Sync Error in QuickBooks Desktop Web Connector
description: Learn how to fix the DESK53 sync error in QuickBooks Desktop when there is an issue provisioning the company connection.
keywords: DESK53, QuickBooks Desktop sync error, error while attempting to provision company, Web Connector login automatically, integrated applications preferences, Expensify QuickBooks Desktop sync error, Workspace Admin
internalScope: Audience is Workspace Admins using QuickBooks Desktop integration with Web Connector. Covers resolving the DESK53 sync error caused by Web Connector permission or provisioning issues. Does not cover QuickBooks Online errors.
---

# DESK53 Sync Error in QuickBooks Desktop Web Connector

If you see the error:

DESK53: Error while attempting to provision company.

This means there is a connection or permission issue between Expensify and QuickBooks Desktop during the provisioning process.

---

## Why the DESK53 Sync Error Happens in QuickBooks Desktop

The DESK53 error occurs when:

- QuickBooks Desktop is not running in Single-user mode.
- The Web Connector does not have permission to log in automatically.
- Integrated Application permissions are not configured correctly.
- The connection was not fully authorized.

Expensify must be allowed to log in automatically through the Web Connector to complete provisioning and sync successfully.

---

## How to Fix the DESK53 Sync Error

### Step One: Log In as Single-User Admin

1. Open **QuickBooks Desktop**.
2. Switch to **Single-user mode** if needed.
3. Log in as an **Admin** user.

---

### Step Two: Update Integrated Application Permissions

1. In QuickBooks Desktop, go to **Edit** > **Preferences**.
2. Select **Integrated Applications**.
3. Click the **Company Preferences** tab.
4. Select **Web Connector** from the list.
5. Click **Properties**.
6. Confirm that **Allow this application to log in automatically** is checked.
7. Click **OK**.
8. Click **OK** again to close Preferences.

---

### Step Three: Restart QuickBooks and Web Connector

1. Close all windows within QuickBooks Desktop.
2. Fully close QuickBooks Desktop.
3. Reopen QuickBooks Desktop.
4. Open the correct company file.
5. Launch **QuickBooks Web Connector**.

---

### Step Four: Sync in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync now**.

After completing these steps, the provisioning process should complete successfully.

---

# FAQ

## Does DESK53 Mean My Data Is Lost?

No. This error indicates a provisioning or permission issue. Your data remains intact.

## Does This Apply to QuickBooks Online?

No. DESK53 applies only to QuickBooks Desktop integrations using the Web Connector.
