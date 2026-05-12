---
title: NS0430 Sync Error in NetSuite Integration
description: Learn what the NS0430 sync error means and how to enable Projects (Jobs) in the Workspace to restore NetSuite syncing.
keywords: NS0430, NetSuite Job permission error, enable Projects Jobs Workspace, Jobs not enabled NetSuite sync, Projects Jobs toggle Workspace, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0430 sync error caused by Projects (Jobs) not being enabled in the Workspace. Does not cover token permissions or bundle configuration issues.
---

# NS0430 Sync Error in NetSuite Integration

If you see the error:

NS0430 Sync Error: Permission error querying NetSuite for 'Job'. Please ensure 'Projects'/'Jobs' have been enabled in Expensify configurations.

This means **Projects (Jobs)** are not enabled in your Workspace settings.

When Projects (Jobs) are not enabled, the Workspace cannot query Job data from NetSuite during sync.

---

## Why the NS0430 Sync Error Happens in NetSuite

The NS0430 error typically occurs when:

- NetSuite is configured to use **Projects (Jobs)**.
- The Workspace is not configured to import or map Projects (Jobs).
- The integration attempts to query Job records but the feature is disabled in the Workspace.

If Projects (Jobs) are not enabled, the sync will fail when querying Job records.

This is a Workspace configuration issue, not a token permission or bundle configuration issue.

---

## How to Fix the NS0430 Sync Error

Follow the steps below to enable Projects (Jobs) in the Workspace.

---

## Enable Projects (Jobs) in the Workspace

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Coding**.
5. Enable the toggle for **Projects (Jobs)**.
6. Choose the import type:
   - **Tag (line-item level)**, or  
   - **Report field (header level)**.
7. Click **Save**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Coding**.
5. Enable **Projects (Jobs)**.
6. Select the import type:
   - **Tag (line-item level)**, or  
   - **Report field (header level)**.
7. Tap **Save**.

---

## Sync the Workspace and Retry

After enabling Projects (Jobs):

On web:

1. Go to **Workspaces > Accounting**.
2. Click the three-dot menu next to the NetSuite connection.
3. Click **Sync Now**.

On mobile:

1. Tap **Workspaces > Accounting**.
2. Tap the three-dot menu next to the NetSuite connection.
3. Tap **Sync Now**.

Retry the sync or export after the process completes.

---

# FAQ

## What’s the Difference Between Tag and Report Field for Projects (Jobs)?

- **Tag (line-item level)** allows different Projects (Jobs) to be applied to individual expenses within a report.
- **Report field (header level)** applies one Project (Job) to the entire report.

## Do I Need NetSuite Admin Access to Fix the NS0430 Sync Error?

No. You only need Workspace Admin access to enable Projects (Jobs) in the Workspace settings.

## Do I Need to Reconnect the Integration?

No. Enabling Projects (Jobs) and selecting **Sync Now** is typically sufficient.
