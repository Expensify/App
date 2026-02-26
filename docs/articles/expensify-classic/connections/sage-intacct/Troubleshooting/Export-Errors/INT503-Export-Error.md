---
title: INT503 Export Error in Sage Intacct Integration
description: Learn what the INT503 export error means and how to enable Expense Type in Sage Intacct before retrying your export.
keywords: INT503, Sage Intacct expense type not enabled, Expense Type configuration error, Sage Intacct export failure, Time & Expenses configuration, Sync Now Sage Intacct, Expensify Sage Intacct integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT503 export error caused by Expense Type being disabled in Sage Intacct. Does not cover category mapping or project configuration errors.
---

# INT503 Export Error in Sage Intacct Integration

If you see the error:

INT503 Export Error: Sage Intacct couldn’t create the expense record because ‘Expense Type’ isn’t enabled.

This means the **Expense Type** feature is not enabled in Sage Intacct.

Sage Intacct requires Expense Type to be enabled in order to create expense records during export.

---

## Why the INT503 Export Error Happens in Sage Intacct

The INT503 error typically indicates:

- The Workspace is exporting expense reports to Sage Intacct.
- The **Expense Type** setting is disabled in Sage Intacct.
- Sage Intacct validation failed because it cannot create the required expense record.

If Expense Type is not enabled, Sage Intacct cannot generate the required expense record, and the export fails.

This is a Sage Intacct configuration issue, not a category mapping or project configuration error.

---

## How to Fix the INT503 Export Error

Follow the steps below to enable Expense Type and retry the export.

### Enable Expense Type in Sage Intacct

1. Log in to Sage Intacct.
2. Go to **Time & Expenses > Setup > Configuration**.
3. Enable **Expense Type**.
4. Click **Save**.

### Sync the Workspace in Expensify

After enabling Expense Type:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

### Retry the Export

1. Open the report.
2. Retry exporting to Sage Intacct.

If Expense Type is enabled in Sage Intacct, the export should complete successfully.

---

# FAQ

## Do I Need Sage Intacct Admin Permissions to Enable Expense Type?

You need sufficient administrative permissions in Sage Intacct to update configuration settings.

## Does This Error Affect Vendor Bill Exports?

No. This error applies specifically to expense record creation that requires Expense Type to be enabled.

## Do I Need to Reconnect the Integration?

No. Enabling Expense Type and selecting **Sync Now** is typically sufficient.
