---
title: How to resolve the XERO11 export error in Xero
description: Learn what the XERO11 export error means and how to reconnect Xero so you can export your report.
keywords: XERO11, XERO11 export error, Xero connection expired, Xero export failed, reconnect Xero, Expensify Xero export error, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration. Covers resolving the XERO11 export error that appears when the Xero connection has expired during a report export. Does not cover Xero export mapping configuration, and does not cover the XERO11 sync error that appears during a sync.
---

# How to resolve the XERO11 export error in Xero

If you see the error:

XERO11 Export Error: The connection to Xero has expired. Please follow prompts in the workspace to reconnect, then try exporting again.

This message appears in the **Xero Export Results** window after you export a report.

It means the connection between the Workspace and Xero has expired, so the report was not exported. Nothing was sent to Xero, and the report is still available to export once the connection is restored.

---

## Why the XERO11 export error happens in Xero

The XERO11 error typically indicates:

- The Xero connection has expired and needs to be authorized again.
- Access for Expensify was revoked in Xero.
- The Xero login used to create the connection no longer has access to the organization.

This is a connection issue, not a Xero export mapping configuration error. A report that failed with XERO11 can be exported again once the connection is restored, with no changes to its expenses.

---

## How to reconnect Xero after the XERO11 export error

Reconnecting restores access without removing your imported data or your Xero configuration.

1. Click **Settings** in the left-side navigation menu.
2. Navigate to **Workspaces > [Workspace Name] > Accounting**.
3. Click **Sync Now**.
4. When the **Couldn't connect to Xero** window appears, click **Reconnect**.
5. Enter your Xero login credentials.
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

## What happens to the report when the XERO11 export error appears?

The report is not exported and no data reaches Xero. The report keeps its current state and can be exported again after you reconnect.

## Who can reconnect the Xero integration?

A Workspace Admin in Expensify who can also sign in to Xero with access to the connected organization.

## Why can the XERO11 export error appear again after reconnecting?

If access for Expensify is revoked in Xero, or the Xero login used for the connection loses access to the organization, the connection expires again. Reconnect using a Xero login that retains access to the organization.
