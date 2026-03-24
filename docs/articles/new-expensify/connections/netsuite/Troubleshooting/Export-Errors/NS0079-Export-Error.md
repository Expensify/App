---
title: NS0079 Export Error in NetSuite Integration
description: Learn what the NS0079 export error means and how to allow posting outside the period in NetSuite and enable Export to Next Open Period in the Workspace.
keywords: NS0079, NetSuite posting period error, transaction date outside posting period NetSuite, allow transaction date outside posting period NetSuite, Export to Next Open Period Workspace, closed accounting period NetSuite, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0079 export error caused by closed posting periods and export timing configuration. Does not cover approval workflow or role permission issues.
---

# NS0079 Export Error in NetSuite Integration

If you see the error:

NS0079 Export Error: The transaction date is outside the posting period.

This means the expense report is attempting to export to a closed accounting period in NetSuite.

NetSuite blocks transactions dated within closed posting periods.

---

## Why the NS0079 Export Error Happens in NetSuite

The NS0079 error typically occurs when:

- The report or expense transaction date falls within a **closed posting period** in NetSuite.
- NetSuite is configured to prevent posting outside the active period.
- The transaction date cannot be posted to an open period.

If the transaction date falls in a closed period, the export fails.

This is a posting period configuration issue, not an approval workflow or role permission issue.

---

## How to Fix the NS0079 Export Error

Follow the steps below to allow the transaction to export to the next open period.

---

## Update Accounting Preferences in NetSuite

1. Log in to NetSuite as an administrator.
2. Go to **Setup > Accounting > Accounting Preferences**.
3. Locate **Allow Transaction Date Outside of the Posting Period**.
4. Set the preference to **Warn**.
5. Click **Save**.

Setting this to **Warn** allows transactions to proceed with a warning instead of being blocked.

---

## Enable Export to Next Open Period in the Workspace

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Advanced**.
5. Enable **Export to Next Open Period**.
6. Click **Save**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Advanced**.
5. Enable **Export to Next Open Period**.
6. Tap **Save**.

---

## Sync the Workspace and Retry the Export

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot menu next to the NetSuite connection.
5. Click **Sync Now**.
6. Retry exporting the report.

The report should now export to the next available open posting period.

---

# FAQ

## Does the NS0079 Export Error Affect All Reports?

It affects reports dated within closed posting periods in NetSuite.

## Do I Need NetSuite Admin Access to Fix the NS0079 Export Error?

Yes. Updating accounting preferences in NetSuite requires administrator permissions.

## Can I Change the Report Date Instead?

Yes. If appropriate, you can update the report or expense date to fall within an open posting period instead of changing NetSuite preferences.
