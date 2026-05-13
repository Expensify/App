---
title: INT503 Export Error in Sage Intacct Integration
description: Learn what the INT503 export error means and how to enable Expense Type in Sage Intacct before retrying the export.
keywords: INT503, Sage Intacct expense type not enabled, Time & Expenses configuration error, expense record creation failure, enable Expense Type Sage Intacct, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT503 export error caused by Expense Type not being enabled in Sage Intacct. Does not cover category mapping, project, or vendor configuration errors.
---

# INT503 Export Error in Sage Intacct Integration

If you see the error:

INT503 Export Error: Sage Intacct couldn’t create the expense record because “Expense Type” isn’t enabled.

This means the **Expense Type** feature is not enabled in Sage Intacct.

Sage Intacct requires Expense Type to be enabled in order to create expense records during export from the Workspace.

---

## Why the INT503 Export Error Happens in Sage Intacct

The INT503 error typically occurs when:

- The Workspace is exporting expense reports to Sage Intacct.
- The **Expense Type** setting is disabled in Sage Intacct.
- The export attempts to create an expense record.

If Expense Type is not enabled, Sage Intacct cannot generate the required expense record, and the export fails.

This is a Sage Intacct configuration issue, not a category or project mapping issue.

---

# How to Fix the INT503 Export Error

Follow the steps below to enable Expense Type and retry the export.

---

## Enable Expense Type in Sage Intacct

1. Log in to Sage Intacct as an administrator.
2. Go to **Time & Expenses > Setup > Configuration**.
3. Enable **Expense Type**.
4. Click **Save**.

---

## Sync the Workspace

After enabling Expense Type:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

This refreshes the configuration between Sage Intacct and the Workspace.

---

## Retry the Export

1. Open the report.
2. Retry exporting to Sage Intacct.

If Expense Type is enabled, the export should complete successfully.

---

# FAQ

## Do I Need Sage Intacct Admin Permissions to Enable Expense Type?

Yes. Updating configuration settings in Sage Intacct typically requires administrative permissions.

## Does the INT503 Error Affect Vendor Bill Exports?

No. This error applies specifically to expense record creation that requires Expense Type to be enabled.

## Do I Need to Reconnect the Integration?

No. Enabling Expense Type and running **Sync Now** is typically sufficient to resolve the error.
