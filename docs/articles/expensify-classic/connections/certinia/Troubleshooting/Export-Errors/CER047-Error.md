---
title: CER047 Error in Certinia Integration
description: Learn what the CER047 error means in Certinia and how to enable the Expense Ops Edit permission to restore syncing.
keywords: CER047, Certinia export error, Ops Edit permission, Expense Ops Edit, approved records permission error, Expensify Certinia sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the Certinia integration. Covers resolving the CER047 error caused by missing Expense Ops Edit permissions. Does not cover other Certinia error codes.
---

# CER047 Error in Certinia Integration

If you see the error:

CER047: "Ops Edit" permission is required to edit approved records.

This means the Certinia integration user does not have permission to edit approved expense records, preventing the export from completing.

---

## Why the CER047 Error Happens in Certinia

The CER047 error typically indicates:

- The connected Certinia integration user lacks the **Expense Ops Edit** permission.
- Certinia requires permission to modify approved records during export processing.
- The export is blocked due to missing permissions.

This is a Certinia permission configuration issue, not a Workspace configuration issue.

---

## How to Fix the CER047 Error

This issue must be resolved in Certinia.

1. Log in to Certinia.
2. Go to **Permission Controls**.
3. Select the permission set assigned to the integration user.
4. Locate **Expense Ops Edit**.
5. Enable the permission.
6. Save your changes.

After updating permissions:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After enabling **Expense Ops Edit** and selecting **Sync Now**, retry the export. If the error persists, confirm the permission is applied to the exact user connected to the integration.

## Does CER047 Mean My Expense Was Deleted?

No. The report remains in Expensify. The export was blocked due to missing permissions.

## Is CER047 Caused by Workspace Settings?

No. CER047 is triggered by missing permissions in Certinia. Workspace accounting settings are not the cause.
