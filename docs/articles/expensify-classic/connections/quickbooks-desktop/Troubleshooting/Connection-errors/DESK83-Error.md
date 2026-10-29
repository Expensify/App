---
title: DESK83 Error in QuickBooks Desktop Web Connector
description: Learn how to fix the DESK83 error in QuickBooks Desktop by approving the Application Certificate and reauthorizing the Web Connector.
keywords: DESK83, QuickBooks Desktop application certificate error, allow access even if QuickBooks is not running, Web Connector authorization, reauthorize QuickBooks Desktop connection, Expensify QuickBooks Desktop sync error, Workspace Admin
internalScope: Audience is Workspace Admins using QuickBooks Desktop integration with Web Connector. Covers resolving the DESK83 error caused by missing or unapproved application certificates. Does not cover QuickBooks Online errors.
---

# DESK83 Error in QuickBooks Desktop Web Connector

If you see the error:

DESK83: Please return to QuickBooks Desktop and approve the Application Certificate by selecting “Yes, always; allow access even if QuickBooks is not running.”

This means QuickBooks Desktop has not fully authorized the Web Connector to access the company file.

---

## Why the DESK83 Error Happens in QuickBooks Desktop

The DESK83 error occurs when:

- The Application Certificate prompt was not approved.
- The “Allow access even if QuickBooks is not running” option was not selected.
- The Web Connector authorization was interrupted.
- Integrated Application permissions were removed or reset.

Expensify requires full authorization to sync with QuickBooks Desktop.

---

## How to Fix the DESK83 Error

### Step One: Log In as Single-User Admin

1. Open **QuickBooks Desktop**.
2. Switch to **Single-user mode**.
3. Log in as an **Admin** user.

---

### Step Two: Remove the Existing Web Connector Authorization

1. In QuickBooks Desktop, go to **Edit** > **Preferences**.
2. Select **Integrated Applications**.
3. Click the **Company Preferences** tab.
4. Select **Web Connector** from the list.
5. Click **Remove**.
6. Click **OK**.

---

### Step Three: Reauthorize Through Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync now**.

QuickBooks Desktop will prompt you to approve the Application Certificate.

1. Select **Yes, always; allow access even if QuickBooks is not running**.
2. Choose the **Admin** user from the dropdown.
3. Click **Continue**.
4. Click **Done** in the confirmation window.

Return to Expensify and allow the Workspace to finish syncing.

Once the certificate is approved, the connection should complete successfully.

---

# FAQ

## What Happens If I Select a Different Option?

If you do not select “Yes, always; allow access even if QuickBooks is not running,” the Web Connector may not function correctly and sync attempts can fail.

## Does This Apply to QuickBooks Online?

No. DESK83 applies only to QuickBooks Desktop integrations using the Web Connector.
