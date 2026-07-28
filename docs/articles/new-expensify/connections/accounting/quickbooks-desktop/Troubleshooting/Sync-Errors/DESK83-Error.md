---
title: DESK83 Error in QuickBooks Desktop Integration
description: Learn what the DESK83 error means and how to approve the QuickBooks Desktop Application Certificate for Expensify.
keywords: DESK83, approve application certificate QuickBooks Desktop, allow access even if QuickBooks not running, QuickBooks Web Connector authorization, Expensify QuickBooks Desktop connection issue, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Desktop integration. Covers resolving the DESK83 error related to Application Certificate approval and reauthorization. Does not cover mapping or export configuration errors.
---

# DESK83 Error in QuickBooks Desktop Integration

If you see the error:

DESK83: Please return to QuickBooks Desktop and approve the Application Certificate by selecting “Yes, always; allow access even if QuickBooks is not running.”

This means QuickBooks Desktop has not granted the required permissions for Expensify to access the company file.

The Application Certificate must be approved with the correct permission settings before syncing can proceed.

---

## Why the DESK83 Error Happens in QuickBooks Desktop

The DESK83 error typically occurs when:

- The Application Certificate was not fully approved.
- The incorrect permission option was selected during authorization.
- The Web Connector authorization was removed or reset.
- QuickBooks was not in Single-user Admin mode during setup.

QuickBooks requires explicit approval to allow Expensify to connect automatically.

This is a permissions and authorization issue, not a data issue.

---

# How to Fix the DESK83 Error

Follow the steps below to reauthorize the connection correctly.

---

## Remove the Existing Web Connector Authorization

1. Open **QuickBooks Desktop**.
2. Log in under **Single-user Admin mode**.
3. Go to **Edit > Preferences**.
4. Select **Integrated Applications**.
5. Click the **Company Preferences** tab.
6. Remove the **Web Connector** listed there.
7. Click **OK**.

---

## Reauthorize the Connection From the Workspace

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot icon next to the QuickBooks Desktop connection.
5. Click **Sync now**.

This will trigger the Application Certificate prompt in QuickBooks Desktop.

---

## Approve the Application Certificate Correctly

When the authorization window appears in QuickBooks Desktop:

1. Select **Yes, always; allow access even if QuickBooks is not running**.
2. Choose the **Admin user** from the dropdown.
3. Click **Continue**.
4. Click **Done** in the confirmation window.

Return to the Workspace and allow the sync to complete.

If approved correctly, the connection should sync successfully.

---

# FAQ

## Do I Need to Be in Single-User Admin Mode?

Yes. You must log in as an Admin in Single-user mode to remove and reauthorize the Web Connector.

## What Happens If I Select the Wrong Option?

If you do not select **Yes, always; allow access even if QuickBooks is not running**, the integration may continue to fail and require reauthorization again.

## Does This Mean My Integration Is Disconnected?

Not permanently. It means the Application Certificate was not properly approved. Reauthorizing resolves the issue.
