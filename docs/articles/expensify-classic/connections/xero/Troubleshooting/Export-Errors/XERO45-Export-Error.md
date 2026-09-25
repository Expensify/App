---
title: How to resolve the XERO45 export error in Xero
description: Learn what the XERO45 export error means and how to reconnect Xero so you can export your report.
keywords: XERO45, XERO45 export error, Xero rejected credentials, Xero export failed, reconnect Xero, Expensify Xero export error, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration. Covers resolving the XERO45 export error that appears when Xero rejects the connection's credentials during a report export. Does not cover Xero export mapping configuration, and does not cover the XERO45 sync error that appears during a sync.
---

# How to resolve the XERO45 export error in Xero

If you see the error:

XERO45 Export Error: Unable to export to Xero because Xero rejected the connection's credentials. Please reconnect Xero in the workspace, then try exporting again.

This message appears in the **Xero Export Results** window after you export a report.

It means Xero turned down the credentials stored for the connection, so the report was not exported. Nothing was sent to Xero, and the report is still available to export once the connection is restored.

---

## Why the XERO45 export error happens in Xero

The XERO45 error typically indicates:

- Access for Expensify was revoked in Xero.
- The Xero login used to create the connection no longer has access to the organization.

This is a connection authentication issue, not a Xero export mapping configuration error. A report that failed with XERO45 can be exported again once the connection is restored, with no changes to its expenses.

A temporary problem reaching Xero, such as a timed-out request or a busy Xero API, is reported as XERO46 instead. That error usually clears on its own and does not need a reconnection.

---

## How to reconnect Xero after the XERO45 export error

You do not need to disconnect Xero first. Reconnecting restores access while keeping your imported data and your Xero configuration.

1. Click **Settings** in the left-side navigation menu.
2. Navigate to **Workspaces > [Workspace Name] > Accounting**.
3. Click **Sync Now**.
4. When the **Couldn't connect to Xero** window appears, click **Reconnect**.
5. Log in to Xero using an account with admin access to the connected organization.
6. Review the access permissions and click **Allow Access**.

You are returned to Expensify once the connection is restored.

If the Workspace is not connected to Xero at all, [learn how to connect to Xero](/articles/expensify-classic/connections/xero/Connect-To-Xero).

---

## How to export the report again after reconnecting Xero

1. Click **Reports** in the left-side navigation menu.
2. Select the report that failed to export.
3. Click **Export to**.
4. Select **Xero**.

---

# FAQ

## What happens to the report when the XERO45 export error appears?

The report is not exported and no data reaches Xero. The report keeps its current state and can be exported again after you reconnect.

## Who can reconnect the Xero integration?

A Workspace Admin in Expensify who can also sign in to Xero with admin access to the connected organization.

## Do I need to disconnect Xero before reconnecting?

No. Reconnecting on its own is enough, and it keeps your settings. Disconnecting removes imported data and configuration, so it creates extra work without fixing anything.

## Why can the XERO45 export error appear again after reconnecting?

If access for Expensify is revoked in Xero again, or the Xero login used for the connection loses access to the organization, the credentials are rejected again. Reconnect using a Xero login that keeps admin access to the organization.
