---
title: INT194 Export Error in Sage Intacct Integration
description: Learn what the INT194 export error means and how to enable and map billable expenses in the Workspace before retrying the export.
keywords: INT194, Sage Intacct billable expenses error, billable expenses turned off Workspace, billable mapping Sage Intacct, Workspace Accounting Coding Billable, export billable expense failure
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT194 export error caused by billable expense configuration and mapping issues. Does not cover category or tax configuration errors.
---

# INT194 Export Error in Sage Intacct Integration

If you see the error:

INT194 Export Error: Billable expenses were selected on the report, but billable options are turned off in the configuration in the workspace. Please re-enable billable settings or update the expense mapping.

This means the report includes **billable expenses**, but billable expenses are not enabled or properly mapped in the Workspace accounting configuration.

Sage Intacct requires billable expenses to be enabled and mapped before they can be exported.

---

## Why the INT194 Export Error Happens in Sage Intacct

The INT194 error typically occurs when:

- One or more expenses on the report are marked as **Billable**.
- Billable expenses are disabled in the Workspace.
- Billable expenses are not mapped to the appropriate Sage Intacct accounts.

If billable settings are turned off or incomplete, the export fails.

This is a billable configuration issue, not a general category or tax configuration issue.

---

# How to Fix the INT194 Export Error

Follow the steps below to enable and map billable expenses.

---

## Enable and Map Billable Expenses in the Workspace

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Coding** tab.
6. Confirm **Billable expenses** is enabled.
7. Ensure billable expenses are mapped to the appropriate Sage Intacct accounts.
8. Click **Save**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Configure**.
5. Open the **Coding** tab.
6. Enable **Billable expenses**.
7. Confirm the mapping is correct.
8. Tap **Save**.

---

## Retry the Export

1. Open the report.
2. Retry exporting to Sage Intacct.

If billable expenses are enabled and properly mapped, the export should complete successfully.

---

# FAQ

## Can I Fix This by Removing the Billable Flag?

Yes. If the expenses should not be billable, remove the **Billable** designation and retry the export.

## Do I Need to Run Sync After Enabling Billable Expenses?

Sync is not typically required unless additional accounting changes were made.

## Does This Error Affect Non-Billable Reports?

No. This error only occurs when expenses are marked as billable and billable settings are disabled or not mapped.
