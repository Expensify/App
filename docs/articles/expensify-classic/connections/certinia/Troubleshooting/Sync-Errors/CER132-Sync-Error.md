---
title: CER132 Sync Error: Insufficient Access – Modify All Data Permission Required
description: Learn why CER132 appears when syncing with Certinia and how to enable the Modify All Data permission for the connected user.
keywords: CER132, Certinia error CER132, insufficient access Certinia, Modify All Data permission, Certinia sync error, Certinia user permissions, Sync Now, Workspace Admin
internalScope: Audience is Workspace Admins using the Certinia integration. Covers resolving the CER132 insufficient access error by enabling Modify All Data permission and re-syncing the Workspace. Does not cover unrelated Certinia role configuration or general permission design.
---

# CER132 Sync Error: Insufficient Access – Modify All Data Permission Required

If you see the error:

**“CER132 Sync Error: Insufficient access. Please ensure the connection to Certinia is made with a user that has the 'Modify All Data' permission.”**

this means the Certinia user connected to Expensify does not have the required **Modify All Data** permission.

Until this permission is enabled, Certinia will block syncing and exports.

---

## Why CER132 Happens

The Certinia integration requires broad access permissions to create, update, and sync records.

If the connected Certinia user does not have the **Modify All Data** system permission, Certinia cannot complete sync operations and returns error **CER132**.

This is a Certinia user permission issue — not an Expensify Workspace configuration issue.

---

## Who Can Fix CER132

You must have access to manage user permissions in Certinia (typically a Certinia Admin or Salesforce Admin) to resolve this error.

---

## How to Enable Modify All Data Permission in Certinia

1. Log in to Certinia.
2. Go to **Setup**.
3. Navigate to **Manage Users**.
4. Click **Users**.
5. Locate the user who established the Certinia connection with Expensify.
6. Open the user’s profile.
7. Go to **System**.
8. Select **System Permissions**.
9. Enable **Modify All Data**.
10. Save your changes.

This permission allows full data access, ensuring reports sync and export properly.

---

## How to Sync Certinia After Updating Permissions

After enabling the permission, re-sync the connection in Expensify.

1. Go to the navigation tabs on the left.
2. Click **Settings**.
3. Click **Workspaces**.
4. Select your Workspace.
5. Click **Accounting**.
6. Click **Sync Now**.

---

## How to Confirm CER132 Is Resolved

After syncing:

1. Confirm the sync completes without errors.
2. Retry exporting any previously failed reports.
3. Verify that exports complete successfully.

If the error continues, confirm that:
- The correct Certinia user profile was updated.
- **Modify All Data** is enabled.
- The changes were saved before syncing.

---

# FAQ

## Does CER132 mean my reports were deleted?

No. The reports remain in Expensify. The sync failed because the connected Certinia user lacked sufficient permissions.

---

## Is CER132 caused by Expensify settings?

No. CER132 is triggered by missing system permissions in Certinia, not by Workspace settings in Expensify.

---

## Do I need to reconnect the Certinia integration?

Not necessarily. In most cases, enabling **Modify All Data** and selecting **Sync Now** resolves the issue.
