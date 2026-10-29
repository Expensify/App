---
title: DESK99 Error in QuickBooks Desktop Integration
description: Learn what the DESK99 error means and how to confirm whether your sync or export to QuickBooks Desktop was successful.
keywords: DESK99, please refresh to confirm action, QuickBooks Desktop sync conflict, multiple Workspace Admin changes, Expensify QuickBooks Desktop error, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Desktop integration. Covers resolving the DESK99 error caused by simultaneous changes during sync or export. Does not cover mapping or connection configuration errors.
---

# DESK99 Error in QuickBooks Desktop Integration

If you see the error:

DESK99 Error: Please refresh to confirm if action was successful.

This means a change was made to the Workspace or report while a sync or export to QuickBooks Desktop was in progress.

This typically happens when another Workspace Admin makes updates at the same time.

---

## Why the DESK99 Error Happens in QuickBooks Desktop

The DESK99 error occurs when:

- Multiple Workspace Admins are making changes at the same time.
- A report was edited during a sync or export attempt.
- Workspace settings were updated during the integration process.

When changes overlap, the system prompts you to refresh to confirm the final status.

This is a timing and concurrency issue, not a connection issue.

---

# How to Fix the DESK99 Error

Follow the steps below to confirm whether the action was successful.

---

## Refresh the Browser

1. Manually refresh your browser.
2. Reopen the affected report or Workspace settings.
3. Confirm whether the sync or export completed successfully.

If the sync or export was successful, the error will clear automatically.

---

## Retry the Sync or Export

If the action was not successful:

1. Confirm no other Workspace Admin is making changes.
2. Retry the sync or export.

In the Workspace:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot icon next to the QuickBooks Desktop connection.
5. Click **Sync now**.

---

# FAQ

## Does the DESK99 Error Mean the Export Failed?

Not necessarily. It means the system needs you to refresh to confirm the final status.

## Can Multiple Admins Cause This Error?

Yes. Simultaneous changes to reports or Workspace settings can trigger this message.

## Do I Need to Reconnect the Integration?

No. This is not a connection issue. Refreshing and confirming the final status usually resolves it.
