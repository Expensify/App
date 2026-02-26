---
title: INT194 Export Error in Sage Intacct Integration
description: Learn what the INT194 export error means and how to enable and map billable expenses in your Workspace before exporting to Sage Intacct.
keywords: INT194, billable expenses export error, Sage Intacct billable mapping error, billable expenses turned off, Workspace accounting Coding tab, Expensify Sage Intacct integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT194 export error caused by billable expense configuration or mapping issues. Does not cover tag validation or employee record errors.
---

# INT194 Export Error in Sage Intacct Integration

If you see the error:

INT194 Export Error: Billable expenses were selected on the report, but billable options are turned off in the configuration in the Expensify workspace. Please re-enable billable settings or update the expense mapping.

This means the report includes expenses marked as **billable**, but billable expenses are not enabled or properly mapped in your Workspace accounting settings.

---

## Why the INT194 Export Error Happens in Sage Intacct

The INT194 error typically indicates:

- One or more expenses on the report are marked as **billable**.
- Billable expenses are not enabled in the Workspace configuration.
- Billable expenses are not mapped to the appropriate Sage Intacct accounts or expense types.

If billable expenses are turned off or not mapped correctly, the export cannot complete.

This is a Workspace accounting configuration issue, not a tag validation or employee record error.

---

## How to Fix the INT194 Export Error

You must enable and map billable expenses in your Workspace configuration or remove the billable designation from the expenses.

### Enable and Map Billable Expenses in the Workspace

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Coding** tab.
6. Confirm that **Billable expenses** are enabled.
7. Ensure billable expenses are mapped to the appropriate Sage Intacct accounts or expense types.
8. Click **Save**.

After updating the configuration, retry exporting the report.

### Remove the Billable Flag from the Expenses (If Not Needed)

If the expenses should not be billable:

1. Open the report.
2. Edit the expenses marked as billable.
3. Remove the billable designation.
4. Save your changes.
5. Retry exporting the report.

---

# FAQ

## Can I Resolve This by Removing the Billable Flag?

Yes. If the expenses should not be billable, remove the billable designation and retry the export.

## Do I Need to Run Sync Now?

Running **Sync Now** is not typically required unless you made additional accounting configuration changes.

## Does This Error Affect Non-Billable Reports?

No. This error only occurs when expenses are marked as billable and billable settings are disabled or not mapped.
