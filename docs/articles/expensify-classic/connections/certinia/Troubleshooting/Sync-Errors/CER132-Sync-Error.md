---
title: CER132 Sync Error in Certinia Integration
description: Learn what the CER132 sync error means in Certinia and how to enable the Modify All Data permission to restore successful syncing.
keywords: CER132, Certinia sync error, insufficient access Certinia, Modify All Data permission required, Certinia user permissions error, Expensify Certinia sync failure, Workspace Admin
internalScope: Audience is Workspace Admins using the Certinia integration. Covers resolving the CER132 sync error caused by missing Modify All Data permissions. Does not cover other Certinia error codes.
---

# CER132 Sync Error in Certinia Integration

If you see the error:

CER132: Insufficient access. Modify All Data permission required.

This means the Certinia user connected to Expensify does not have the required **Modify All Data** system permission, preventing syncing and exports from completing.

---

## Why the CER132 Sync Error Happens in Certinia

The CER132 error typically indicates:

- The connected Certinia user lacks the **Modify All Data** permission.
- The integration user does not have sufficient system-level access.
- Certinia validation failed due to restricted user permissions.

The Certinia integration requires broad system access to create, update, and sync records.

This is a Certinia user permission issue, not a Workspace configuration issue.

---

## How to Fix the CER132 Sync Error

This issue must be resolved in Certinia.

1. Log in to Certinia.
2. Go to **Setup**.
3. Navigate to **Users**.
4. Locate the user connected to the Expensify integration.
5. Open the user’s profile.
6. Go to **System Permissions**.
7. Enable **Modify All Data**.
8. Save your changes.

After updating permissions:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then confirm the sync completes successfully.

---

# FAQ

## Can I Retry the Sync?

Yes. After enabling **Modify All Data** and selecting **Sync Now**, retry the sync or export. If the error persists, confirm the correct user profile was updated.

## Does CER132 Mean My Reports Were Deleted?

No. The reports remain in Expensify. The sync failed due to insufficient Certinia user permissions.

## Is CER132 Caused by Workspace Settings?

No. CER132 is triggered by missing system permissions in Certinia. Workspace accounting settings are not the cause.
