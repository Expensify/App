---
title: DESK20 Sync Error in QuickBooks Desktop Web Connector
description: Learn how to fix the DESK20 sync error in QuickBooks Desktop when the Workspace has changed since it was last loaded.
keywords: DESK20, QuickBooks Desktop sync error, workspace has changed, refresh page sync error, Web Connector sync conflict, Expensify QuickBooks Desktop sync error, Workspace Admin
internalScope: Audience is Workspace Admins using QuickBooks Desktop integration with Web Connector. Covers resolving the DESK20 sync error caused by concurrent Workspace changes. Does not cover QuickBooks Online errors.
---

# DESK20 Sync Error in QuickBooks Desktop Web Connector

If you see the error:

DESK20: The workspace has changed since it was last loaded. Please refresh the page and try the sync again.

This means another Workspace Admin made changes to the Workspace while you were attempting to sync.

---

## Why the DESK20 Sync Error Happens in QuickBooks Desktop

The DESK20 error occurs when:

- Multiple Workspace Admins are editing the Workspace at the same time.
- Workspace settings were updated after the page was loaded.
- A sync attempt was made using outdated Workspace data.

The system requires a refresh to ensure you are working with the most recent configuration.

---

## How to Fix the DESK20 Sync Error

1. Manually refresh your browser.
2. Reopen the Workspace.
3. Retry the sync.

### How to Retry the Sync in Expensify

1. Go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync now**.

After refreshing the page, the error should clear and the sync should proceed normally.

---

# FAQ

## Does DESK20 Mean the Sync Failed?

Not necessarily. It indicates that the Workspace data changed and the page must be refreshed before retrying.

## Can Multiple Admins Cause This Error?

Yes. Simultaneous changes by multiple Workspace Admins can trigger the DESK20 message.
