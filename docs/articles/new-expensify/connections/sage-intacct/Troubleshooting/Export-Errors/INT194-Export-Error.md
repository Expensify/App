---
title: INT194 Export Error: Billable Expenses Are Turned Off in Workspace Configuration
description: Learn why the INT194 export error occurs and how to enable and map billable expenses before retrying the export.
keywords: INT194, billable expenses export error, Sage Intacct billable mapping, billable expenses turned off, accounting coding configuration, export billable expense failure
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers the INT194 export error related to billable expense configuration and mapping. Does not cover category or tax configuration errors.
---

# INT194 Export Error: Billable Expenses Are Turned Off in Workspace Configuration

If you see the error message:

**“INT194 Export Error: Billable expenses were selected on the report, but billable options are turned off in the configuration in the workspace. Please re-enable billable settings or update the expense mapping.”**

It means the report includes billable expenses, but billable expenses are not enabled or properly mapped in the accounting configuration.

Sage Intacct requires billable expenses to be enabled and mapped before they can be exported.

---

## Why the INT194 Export Error Happens

The INT194 export error occurs when:

- Expenses on the report are marked as **billable**, and  
- Billable expenses are not enabled or not mapped to Sage Intacct accounts in the Workspace  

If billable settings are turned off or not configured correctly, the export fails.

---

# How to Fix the INT194 Export Error

Follow the steps below to enable and map billable expenses.

---

## Step 1: Enable and Map Billable Expenses

1. Go to **Workspace > [Workspace Name] > Accounting > Coding**.  
2. Confirm that **Billable expenses** are enabled.  
3. Ensure billable expenses are mapped to the appropriate Sage Intacct accounts.  
4. Click **Save**.  

---

## Step 2: Retry the Export

Return to the report and retry the export.

If billable expenses are enabled and properly mapped, the export should complete successfully.

---

# FAQ

## Can I resolve this by removing the billable flag?

Yes. If the expenses should not be billable, removing the billable designation will allow the export to proceed.

## Do I need to run Sync after enabling billable expenses?

Sync is not typically required unless additional accounting changes were made.

## Does this error affect non-billable reports?

No. This error only occurs when expenses are marked as billable and billable settings are disabled or not mapped.
