---
title: INT225 Export Error in Sage Intacct Integration
description: Learn what the INT225 export error means and how to properly import and configure tax rates from Sage Intacct before exporting.
keywords: INT225, Sage Intacct tax details missing, Sage Intacct tax import error, tax rates not imported, manually entered tax rate error, Workspace accounting Coding tab tax, Expensify Sage Intacct integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT225 export error caused by missing or invalid imported tax rates. Does not cover general tax calculation setup or journal configuration errors.
---

# INT225 Export Error in Sage Intacct Integration

If you see the error:

INT225 Export Error: Tax details are missing or invalid. Please ensure tax import option is enabled in the Sage Intacct configurations in Expensify.

This means the tax rate selected on one or more expenses is not properly imported from Sage Intacct.

Sage Intacct requires tax rates to be imported and mapped correctly before exporting.

---

## Why the INT225 Export Error Happens in Sage Intacct

The INT225 error typically indicates:

- Tax import is not enabled in the Workspace accounting configuration.
- Tax rates were manually created in the Workspace instead of being imported from Sage Intacct.
- Sage Intacct validation failed due to missing or invalid tax mapping.

Only tax rates imported from Sage Intacct can be used for export. Manually entered tax rates are not valid for Sage Intacct exports.

This is a tax configuration issue in the Workspace, not a general tax calculation or journal configuration error.

---

## How to Fix the INT225 Export Error

Follow the steps below to correct the tax configuration.

### Enable Tax Import in the Workspace

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Coding** tab.
6. Confirm that tax is enabled for import from Sage Intacct.
7. Click **Save** if changes were made.

### Review Tax Rates in the Workspace

1. In the Workspace, click **Tax**.
2. Review the list of tax rates.
3. Confirm each tax rate has the Sage Intacct icon next to it.

If a tax rate:

- Does not have the Sage Intacct icon, or  
- Shows a red X  

It was manually entered and cannot be used for export.

Delete any manually entered tax rates.

### Add or Confirm Tax Rates in Sage Intacct

1. Log in to Sage Intacct.
2. Add or confirm the required tax rates exist in Sage Intacct.

After updating Sage Intacct:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

This imports tax rates from Sage Intacct into the Workspace.

### Update Tax Rates on the Report

If any expenses on the report used manually entered tax rates:

1. Open the report.
2. Select a valid imported tax rate.
3. Save your changes.

Then retry exporting the report.

---

# FAQ

## Can I Manually Create Tax Rates in the Workspace?

You can create them, but they cannot be used for Sage Intacct exports. Tax rates must be imported from Sage Intacct.

## Do All Tax Rates Need the Sage Intacct Icon?

Yes. Only tax rates with the Sage Intacct icon are valid for export.

## Do I Need to Run Sync Now After Updating Tax Rates?

Yes. Selecting **Sync Now** ensures tax rates from Sage Intacct are imported and available for selection.
