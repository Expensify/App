---
title: INT225 Export Error in Sage Intacct Integration
description: Learn what the INT225 export error means and how to properly import and configure tax rates in the Workspace before retrying the export.
keywords: INT225, Sage Intacct tax details missing, invalid tax rate export error Intacct, tax import not enabled Sage Intacct, manually entered tax rate error, Workspace Accounting Coding Tax
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT225 export error caused by missing, invalid, or manually created tax rates. Does not cover category or employee record errors.
---

# INT225 Export Error in Sage Intacct Integration

If you see the error:

INT225 Export Error: Tax details are missing or invalid. Please ensure tax import option is enabled in the Sage Intacct configurations.

This means the tax rate selected on one or more expenses is not properly imported from Sage Intacct.

Sage Intacct requires tax rates to be imported and mapped correctly before exporting.

---

## Why the INT225 Export Error Happens in Sage Intacct

The INT225 error typically occurs when:

- Tax import is not enabled in the Workspace.
- Tax rates were manually created in the Workspace instead of being imported from Sage Intacct.
- A selected tax rate no longer exists or is inactive in Sage Intacct.

Only tax rates imported from Sage Intacct can be used for export. Manually entered tax rates are not valid for Sage Intacct exports.

This is a tax configuration issue, not a category or employee configuration issue.

---

# How to Fix the INT225 Export Error

Follow the steps below to correct the tax configuration.

---

## Enable Tax Import in the Workspace

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Coding** tab.
6. Confirm **Tax** is enabled for import.
7. Click **Save**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Configure**.
5. Open the **Coding** tab.
6. Enable **Tax**.
7. Tap **Save**.

---

## Review Tax Rates in the Workspace

1. In the Workspace, click **Tax** in the navigation panel.
2. Review the list of tax rates.
3. Confirm each tax rate has the Sage Intacct icon next to it.

If a tax rate:

- Does not have the Sage Intacct icon, or  
- Shows a red X  

It was manually created and must be removed.

Delete any manually entered tax rates.

---

## Confirm Tax Rates in Sage Intacct and Sync

1. Log in to Sage Intacct.
2. Confirm the required tax rates exist and are active.
3. Return to the Workspace.
4. Go to **Accounting**.
5. Click **Sync Now**.

This imports tax rates from Sage Intacct into the Workspace.

---

## Update Tax Rates on the Report

If any expenses used manually created tax rates:

1. Open the report.
2. Edit each affected expense.
3. Select a valid imported tax rate.
4. Save the report.

---

## Retry the Export

1. Retry exporting the report to Sage Intacct.

If all tax rates are properly imported and mapped, the export should complete successfully.

---

# FAQ

## Can I Manually Create Tax Rates in the Workspace?

You can create them, but they cannot be used for Sage Intacct exports. Tax rates must be imported from Sage Intacct.

## Do All Tax Rates Need the Sage Intacct Icon?

Yes. Only tax rates with the Sage Intacct icon are valid for export.

## Do I Need to Run Sync After Updating Tax Rates?

Yes. Selecting **Sync Now** ensures tax rates from Sage Intacct are imported before retrying the export.
