---
title: NS0593 Sync Error in NetSuite Integration
description: Learn how to fix the NS0593 sync error in NetSuite when too many concurrent connections are open.
keywords: NS0593, NetSuite too many open connections, NetSuite concurrency limit, Expensify NetSuite sync error, NetSuite connection limit 5, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0593 sync error caused by NetSuite concurrency limits. Does not cover other NetSuite error codes.
---

# NS0593 Sync Error in NetSuite Integration

If you see the error:

NS0593: There are too many open connections to the NetSuite company at this moment. Please try again in a few minutes.

This means NetSuite has reached its maximum allowed number of concurrent connections.

---

## Why the NS0593 Sync Error Happens in NetSuite

The NS0593 error occurs when:

- More than five active connections are open to the same NetSuite account.
- Multiple Workspace Admins are exporting or syncing at the same time.
- Other third-party applications are connected to NetSuite simultaneously.
- Background jobs are still running in NetSuite.

NetSuite limits concurrency to five open connections at a time to prevent overloading the account.

Although Expensify runs only one job per Workspace at a time, additional integrations or users can exceed the limit.

---

## How to Fix the NS0593 Sync Error

1. Wait a few minutes to allow existing NetSuite connections to close.
2. Confirm no other users are actively exporting or syncing.
3. Retry syncing the Workspace in Expensify:
   - Go to **Settings**.
   - Select **Workspaces**.
   - Select your Workspace.
   - Click **Accounting**.
   - Click **Sync**.

If the error continues, confirm whether other integrations or automation tools are connected to NetSuite and temporarily pause them before retrying.

---

# FAQ

## Does NS0593 Mean My Integration Is Broken?

No. This error is caused by NetSuite’s concurrency limit, not a configuration issue.

## Can Expensify Increase the Connection Limit?

No. The concurrency limit is enforced by NetSuite and cannot be changed within Expensify.
