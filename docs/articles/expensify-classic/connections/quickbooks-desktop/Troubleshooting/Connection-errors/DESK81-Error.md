---
title: DESK81 Error in QuickBooks Desktop Web Connector
description: Learn how to fix the DESK81 error in QuickBooks Desktop when the Web Connector does not have permission to access the company file.
keywords: DESK81, QuickBooks Desktop permission error, no permission to access company file, Web Connector access denied, reauthorize Web Connector, allow login automatically QuickBooks, Expensify QuickBooks Desktop sync error, Workspace Admin
internalScope: Audience is Workspace Admins using QuickBooks Desktop integration with Web Connector. Covers resolving the DESK81 error caused by permission and authorization issues. Does not cover QuickBooks Online errors.
---

# DESK81 Error in QuickBooks Desktop Web Connector

If you see the error:

DESK81: You do not have permission to access QuickBooks Desktop company file.

This means QuickBooks Web Connector does not have the required permissions to access the company file.

---

## Why the DESK81 Error Happens in QuickBooks Desktop

The DESK81 error occurs when:

- QuickBooks Desktop is not running in Single-user mode.
- The Web Connector is not authorized to log in automatically.
- Integrated Application permissions are misconfigured.
- The Web Connector authorization has expired or been removed.

Expensify must be granted permission to access the company file through QuickBooks Desktop.

---

## How to Fix the DESK81 Error

### Step One: Log In as Single-User Admin

1. Open **QuickBooks Desktop**.
2. Switch to **Single-user mode**.
3. Log in as an **Admin** user.

---

### Step Two: Confirm Web Connector Permissions

1. In QuickBooks Desktop, go to **Edit** > **Preferences**.
2. Select **Integrated Applications**.
3. Click the **Company Preferences** tab.
4. Select **Web Connector** from the list.
5. Click **Properties**.
6. Confirm **Allow this application to log in automatically** is checked.
7. Click **OK**.
8. Close all open windows in QuickBooks Desktop.

Retry the sync in Expensify.

---

## If the Error Persists: Reauthorize the Web Connector

### Step One: Remove the Existing Web Connector Authorization

1. In QuickBooks Desktop, go to **Edit** > **Preferences**.
2. Select **Integrated Applications**.
3. Click the **Company Preferences** tab.
4. Select **Web Connector**.
5. Click **Remove**.
6. Click **OK**.

---

### Step Two: Reauthorize Through Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync now**.

You will be prompted to reauthorize the connection in QuickBooks Desktop.

1. Click **Yes, always; allow access even if QuickBooks is not running**.
2. Select the **Admin** user from the dropdown.
3. Click **Continue**.
4. Click **Done** in the pop-up window.
5. Return to Expensify and allow the Workspace to finish syncing.

After reauthorization, the connection should sync successfully.

---

# FAQ

## Do I Need to Be Logged in as an Admin?

Yes. The Web Connector must be authorized by an Admin user in Single-user mode.

## Does This Apply to QuickBooks Online?

No. DESK81 applies only to QuickBooks Desktop integrations using the Web Connector.
