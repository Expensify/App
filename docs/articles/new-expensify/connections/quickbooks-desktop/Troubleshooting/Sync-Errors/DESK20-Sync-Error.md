---
title: DESK20 Sync Error in QuickBooks Desktop Integration
description: Learn what the DESK20 sync error means and how to refresh the Workspace before retrying a sync to QuickBooks Desktop.
keywords: DESK20, workspace has changed since last loaded, QuickBooks Desktop sync conflict, multiple Workspace Admin changes, Expensify QuickBooks Desktop sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Desktop integration. Covers resolving the DESK20 sync error caused by concurrent Workspace changes. Does not cover connection or mapping configuration errors.
---

# DESK20 Sync Error in QuickBooks Desktop Integration

If you see the error:

DESK20 Sync Error: The workspace has changed since it was last loaded. Please refresh the page and try the sync again.

This means the Workspace was modified after you initiated the sync.

This typically occurs when another Workspace Admin makes changes at the same time.

---

## Why the DESK20 Sync Error Happens in QuickBooks Desktop

The DESK20 error occurs when:

- Another Workspace Admin updates settings.
- Accounting configuration is changed during a sync.
- The page has not refreshed to reflect recent updates.
- Multiple users are working in the same Workspace simultaneously.

When changes overlap, the system requires a refresh to ensure you are working with the latest version.

This is a timing and concurrency issue, not a connection issue.

---

# How to Fix the DESK20 Sync Error

Follow the steps below to clear the error.

---

## Refresh the Browser

1. Manually refresh your browser.
2. Reopen the Workspace accounting settings if needed.
3. Retry the sync.

After refreshing, the error should clear.

---

## Retry the Sync

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot icon next to the QuickBooks Desktop connection.
5. Click **Sync now**.

If no additional changes are being made, the sync should complete successfully.

---

# FAQ

## Does the DESK20 Error Mean the Sync Failed?

Not necessarily. It means the Workspace changed during the sync attempt and requires a refresh.

## Can Multiple Admins Cause This Error?

Yes. Simultaneous changes by multiple Workspace Admins can trigger this message.

## Do I Need to Reconnect the Integration?

No. Refreshing the page and retrying the sync resolves the issue.
