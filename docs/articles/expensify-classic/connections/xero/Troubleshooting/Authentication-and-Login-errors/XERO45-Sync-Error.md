---
title: How to resolve the XERO45 sync error in Xero
description: Learn what the XERO45 sync error means and how to reconnect Xero so syncing can resume.
keywords: XERO45, XERO45 sync error, Xero rejected credentials, reconnect Xero, Xero sync failed, Expensify Xero integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration. Covers resolving the XERO45 sync error that appears when Xero rejects the credentials stored for the connection, including reconnecting without disconnecting first. Does not cover Xero export mapping configuration, and does not cover temporary problems reaching Xero, which report XERO46 instead.
---

# How to resolve the XERO45 sync error in Xero

If you see the error:

XERO45 Sync Error: Unable to sync Xero data because Xero rejected the connection's credentials. Please reconnect Xero in the workspace.

This means Xero turned down the credentials stored for the connection, so the sync could not run.

Until the connection is authorized again, syncs and exports to Xero will keep failing.

---

## Why the XERO45 sync error happens in Xero

The XERO45 error typically indicates:

- Access for Expensify was revoked in Xero.
- The Xero login used to create the connection no longer has access to the organization.

This is a connection authentication issue, not a Xero export mapping configuration error.

A temporary problem reaching Xero, such as a timed-out request or a busy Xero API, is reported as XERO46 instead. That error usually clears on its own and does not need a reconnection.

---

## How to reconnect Xero after the XERO45 sync error

You do not need to disconnect Xero first. Reconnecting restores access while keeping your imported data and your Xero configuration.

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.
5. When the **Couldn't connect to Xero** window appears, click **Reconnect**.
6. Log in to Xero using an account with admin access to the connected organization.
7. Review the access permissions and click **Allow Access**.

You are returned to Expensify once the connection is restored.

If the Workspace is not connected to Xero at all, [learn how to connect to Xero](/articles/expensify-classic/connections/xero/Connect-To-Xero).

## How to retry the Xero sync after reconnecting

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.
5. Retry any exports that failed while the error was showing.

---

# FAQ

## Do I need to disconnect Xero before reconnecting?

No. Reconnecting on its own is enough, and it keeps your settings. Disconnecting removes imported data and configuration, so it creates extra work without fixing anything.

## Do I need Xero admin access to reconnect?

Yes. You must sign in with a Xero account that has admin access to the connected organization.

## Will my Xero configuration be lost?

No. Your export, coding, and advanced settings stay in place when you reconnect.

## Does this error affect all syncs?

Yes. While the credentials are rejected, every sync and export to Xero fails until the connection is authorized again.

## Why does the XERO45 error keep coming back after reconnecting?

If access for Expensify is revoked in Xero again, or the Xero login used for the connection loses access to the organization, the credentials are rejected again. Reconnect using a Xero login that keeps admin access to the organization.

## Does the XERO45 error mean data was lost in Xero?

No. A rejected credential stops Expensify from reaching Xero. Nothing already in Xero is changed or removed.
