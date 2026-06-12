---
title: NS0430 Sync Error in NetSuite Integration
description: Learn how to fix the NS0430 sync error in NetSuite when Projects or Jobs are not enabled in Expensify.
keywords: NS0430, NetSuite permission error querying Job, enable Projects Jobs Expensify, NetSuite projects not enabled, Expensify NetSuite sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0430 sync error caused by Projects/Jobs not being enabled in Expensify. Does not cover other NetSuite error codes.
---

# NS0430 Sync Error in NetSuite Integration

If you see the error:

NS0430: Permission error querying NetSuite for 'Job'. Please ensure 'Projects'/'Jobs' have been enabled in Expensify configurations.

This means Projects (Jobs) are not enabled in your Workspace settings in Expensify.

---

## Why the NS0430 Sync Error Happens in NetSuite

The NS0430 error occurs when:

- Projects/Jobs are enabled in NetSuite.
- Projects/Jobs are not enabled in Expensify.
- The Workspace attempts to sync Job (Project) records.
- The integration cannot query Job records because the feature is disabled in Expensify.

Expensify must have Projects (Jobs) enabled to import and sync NetSuite Job records.

---

## How to Enable Projects (Jobs) in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Configure**.
6. Open the **Coding** tab.
7. Enable the toggle for **Projects (Jobs)**.
8. Select the import type:
   - **Tag** (line-item level), or
   - **Report Field** (header level).
9. Click **Save**.

---

## Sync the Workspace

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

Once Projects (Jobs) are enabled and the Workspace is synced, the sync should complete successfully.

---

# FAQ

## Does NS0430 Mean My Role Lacks Permissions?

Not necessarily. This error typically indicates that Projects/Jobs are not enabled in Expensify, not a role permission issue.

## Do I Need to Reconnect NetSuite?

No. Enabling Projects (Jobs) and running **Sync** is usually sufficient.
