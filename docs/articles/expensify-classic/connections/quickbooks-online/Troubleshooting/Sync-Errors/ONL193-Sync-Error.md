---
title: ONL193 Sync Error in QuickBooks Online Integration
description: Learn what the ONL193 sync error means in QuickBooks Online and how to reconnect using updated admin credentials.
keywords: ONL193, QuickBooks Online sync error, couldn’t connect to QuickBooks Online, reconnect QuickBooks Online, reenter admin credentials, Expensify QuickBooks Online integration, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers resolving the ONL193 sync error caused by invalid or expired QuickBooks Online credentials. Does not cover other QuickBooks Online error codes.
---

# ONL193 Sync Error in QuickBooks Online Integration

If you see the error:

ONL193: Couldn’t connect to QuickBooks Online.

This means the QuickBooks Online credentials used to establish the connection are no longer valid, preventing syncing and exports from completing.

---

## Why the ONL193 Sync Error Happens in QuickBooks Online

The ONL193 error typically indicates:

- The QuickBooks Online admin password was changed.
- The QuickBooks Online admin user was removed or updated.
- The authentication token expired.
- A different admin account replaced the original connection account.

When this happens, Expensify can no longer authenticate with QuickBooks Online and requires reconnection.

This is a QuickBooks Online credential issue, not a Workspace configuration issue.

---

## How to Fix the ONL193 Sync Error

This issue must be resolved by reconnecting QuickBooks Online.

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.
5. Select **Reconnect**.
6. Enter your QuickBooks Online admin credentials.

If reconnecting with new credentials, you may need to reconfigure export settings, accounts, categories, or tags.

After reconnecting:

1. Click **Sync Now** again.
2. Confirm the sync completes without errors.
3. Retry exporting any previously failed reports.

---

# FAQ

## Can I Retry the Sync?

Yes. After reconnecting with valid admin credentials, retry the sync. If the error persists, confirm you are using an active QuickBooks Online Admin account.

## Does ONL193 Mean My Reports Were Deleted?

No. Your reports remain in Expensify. The sync failed due to invalid or expired QuickBooks Online credentials.

## Do I Need to Disconnect First?

No. Selecting **Reconnect** from the Sync window is typically sufficient.
