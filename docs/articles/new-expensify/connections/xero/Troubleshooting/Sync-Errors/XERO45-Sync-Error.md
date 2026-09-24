---
title: XERO45 Sync Error in Xero Integration
description: Learn what the XERO45 sync error means and how to reconnect Xero in New Expensify so syncing can resume.
keywords: XERO45, XERO45 sync error, Xero rejected credentials, reconnect Xero New Expensify, enter your credentials Xero, Expensify Xero integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration in New Expensify. Covers resolving the XERO45 sync error that appears when Xero rejects the credentials stored for the connection, including reconnecting without disconnecting first. Does not cover Xero export mapping configuration, and does not cover temporary problems reaching Xero, which report XERO46 instead.
---

# XERO45 Sync Error in Xero Integration

If you see the error:

XERO45 Sync Error: Unable to sync Xero data because Xero rejected the connection's credentials. Please reconnect Xero in the workspace.

This means Xero turned down the credentials stored for the connection, so the sync could not run.

While the error is showing, the Xero configuration options are hidden. They come back once the connection is authorized again.

---

## Why the XERO45 Sync Error Happens in Xero

The XERO45 error typically indicates:

- Access for Expensify was revoked in Xero.
- The Xero login used to create the connection no longer has access to the organization.

This is a connection issue, not an export mapping issue.

A temporary problem reaching Xero, such as a timed-out request or a busy Xero API, is reported as XERO46 instead. That error usually clears on its own and does not need a reconnection.

---

# How to Fix the XERO45 Sync Error

Follow the steps below to restore the connection.

---

## Reconnect to Xero in the Workspace

You do not need to disconnect Xero first. Reconnecting restores access while keeping your imported data and your Xero configuration.

On web:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot icon next to the Xero connection.
5. Click **Enter your credentials**.
6. Log in to Xero using an account with admin access to the connected organization.
7. Review the access permissions and click **Allow Access**.

On mobile:

1. Tap the navigation tabs on the bottom.
2. Tap **Workspaces**.
3. Select your Workspace.
4. Tap **Accounting**.
5. Tap the three-dot icon next to the Xero connection.
6. Tap **Enter your credentials** and complete the authorization flow.

If the Workspace is not connected to Xero at all, [learn how to connect to Xero](/articles/new-expensify/connections/xero/Connect-to-Xero).

---

## Run Sync

1. Go to **Settings > Workspaces > [Workspace Name] > Accounting**.
2. Click the three-dot icon next to the Xero connection.
3. Click **Sync now**.
4. Retry any exports that failed while the error was showing.

---

# FAQ

## Do I Need to Disconnect Xero Before Reconnecting?

No. Reconnecting on its own is enough, and it keeps your settings. Disconnecting removes imported options and configuration, so it creates extra work without fixing anything.

## Do I Need Xero Admin Access to Reconnect?

Yes. You must sign in with a Xero account that has admin access to the connected organization.

## Why Are My Xero Settings Missing While the Error Is Showing?

The configuration options are hidden while the connection cannot be verified. They reappear after you reconnect, with your previous settings intact.

## Does This Error Affect All Syncs?

Yes. While the credentials are rejected, every sync and export to Xero fails until the connection is authorized again.

## Why Does the XERO45 Error Keep Coming Back After Reconnecting?

If access for Expensify is revoked in Xero again, or the Xero login used for the connection loses access to the organization, the credentials are rejected again. Reconnect using a Xero login that keeps admin access to the organization.

## Does the XERO45 Error Mean Data Was Lost in Xero?

No. A rejected credential stops Expensify from reaching Xero. Nothing already in Xero is changed or removed.
