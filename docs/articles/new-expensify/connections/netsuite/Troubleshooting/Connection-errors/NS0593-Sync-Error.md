---
title: NS0593 Sync Error in NetSuite Integration
description: Learn what the NS0593 sync error means and how to resolve NetSuite concurrency limits when syncing from Expensify.
keywords: NS0593, NetSuite concurrency limit, too many open connections NetSuite, NetSuite sync error, Expensify NetSuite integration, NetSuite connection limit, retry sync, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0593 sync error caused by NetSuite concurrency limits. Does not cover credential issues or bundle configuration.
---

# NS0593 Sync Error in NetSuite Integration

If you see the error:

NS0593 Sync Error: There are too many open connections to the NetSuite company at this moment. Please try again in a few minutes.

This means NetSuite has reached its connection limit.

This error is temporary and related to NetSuite’s concurrency restrictions.

---

## Why the NS0593 Sync Error Happens in NetSuite

The NS0593 error typically indicates there are more than **five open connections** to your NetSuite company at the same time.

NetSuite limits concurrency to five active connections to prevent overloading accounts.

Even though Expensify runs one job at a time, the limit can be reached if:

- Multiple members are exporting reports at the same time.
- Multiple Workspaces are syncing simultaneously.
- Other third-party integrations are connected to NetSuite.
- Background scripts or scheduled jobs are running in NetSuite.

When the connection limit is exceeded, NetSuite temporarily blocks additional sync attempts.

This is a concurrency limitation, not a credential or bundle configuration issue.

---

## How to Fix the NS0593 Sync Error

No configuration changes are required.

### Wait and Retry the Sync

1. Wait a few minutes to allow existing NetSuite connections to close.
2. Retry syncing the Workspace.

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot menu next to the NetSuite connection.
5. Click **Sync Now**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the three-dot menu next to the NetSuite connection.
5. Tap **Sync Now**.

If the issue continues, confirm that no other large exports, integrations, or background jobs are actively running in NetSuite at the same time.

---

# FAQ

## Does the NS0593 Sync Error Mean Something Is Broken?

No. This is a temporary concurrency limit imposed by NetSuite and does not indicate a configuration issue.

## How Long Should I Wait Before Retrying?

Waiting a few minutes is typically enough. Once active connections close, syncing should resume normally.

## Can This Affect Multiple Workspaces?

Yes. If several Workspaces or integrations attempt to sync at the same time, they may trigger the NetSuite connection limit.
