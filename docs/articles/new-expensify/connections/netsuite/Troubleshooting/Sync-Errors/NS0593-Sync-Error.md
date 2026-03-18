---
title: NS0593 Sync Error in NetSuite Integration
description: Learn what the NS0593 sync error means and how to resolve NetSuite concurrency limits when syncing from the Workspace.
keywords: NS0593, NetSuite concurrency limit error, too many open connections NetSuite, NetSuite sync error concurrency, NetSuite connection limit 5 connections, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0593 sync error caused by NetSuite concurrency limits. Does not cover credential issues or bundle configuration.
---

# NS0593 Sync Error in NetSuite Integration

If you see the error:

NS0593 Sync Error: There are too many open connections to the NetSuite company at this moment. Please try again in a few minutes.

This means NetSuite has reached its maximum allowed number of simultaneous connections.

This error is temporary and related to NetSuite’s concurrency restrictions.

---

## Why the NS0593 Sync Error Happens in NetSuite

The NS0593 error occurs when there are more than **five active connections** to your NetSuite account at the same time.

NetSuite limits concurrency to five active sessions to prevent system overload.

The limit can be reached if:

- Multiple members are exporting reports at the same time.
- Multiple Workspaces are syncing simultaneously.
- Other third-party integrations are connected to NetSuite.
- Background integration jobs are still running.
- A previous sync did not close cleanly.

When the connection limit is exceeded, NetSuite temporarily blocks new sync attempts.

This is a NetSuite system limitation, not a configuration issue in the Workspace.

---

## How to Fix the NS0593 Sync Error

No configuration changes are required.

Follow the steps below to resolve the error.

---

## Wait and Retry the Sync

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

---

## Reduce Simultaneous Exports

If the error continues:

- Ask other members to pause exports temporarily.
- Avoid running multiple syncs at once.
- Confirm that no other integrations are actively syncing with NetSuite.

Once active connections drop below the limit, syncing will resume normally.

---

# FAQ

## Does the NS0593 Sync Error Mean Something Is Broken?

No. This is a temporary concurrency limit imposed by NetSuite and does not indicate a configuration issue.

## How Long Should I Wait Before Retrying?

Waiting a few minutes is typically sufficient. Once existing connections close, syncing should succeed.

## Do I Need to Reconnect the Integration?

No. Simply retry the sync after the connection count drops.
