---
title: INT225 Export Error: Tax Details Are Missing or Invalid
description: Learn why the INT225 export error occurs and how to properly import and configure tax rates before retrying the export.
keywords: INT225, tax details missing Sage Intacct, invalid tax rate export error, tax import not enabled, manually entered tax rate error, sync tax configuration
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers the INT225 export error related to tax configuration and imported tax rates. Does not cover category or employee record errors.
---

# INT225 Export Error: Tax Details Are Missing or Invalid

If you see the error message:

**“INT225 Export Error: Tax details are missing or invalid. Please ensure tax import option is enabled in the Sage Intacct configurations.”**

It means the tax rate selected on one or more expenses is not properly imported from Sage Intacct.

Sage Intacct requires tax rates to be imported and mapped correctly before exporting.

---

## Why the INT225 Export Error Happens

The INT225 export error occurs when:

- Tax import is not enabled in the Workspace configuration, or  
- Tax rates were manually created in the Workspace instead of being imported from Sage Intacct  

Only tax rates imported from Sage Intacct can be used for export. Manually entered tax rates are not valid for Sage Intacct exports.

---

# How to Fix the INT225 Export Error

Follow the steps below to correct the tax configuration.

---

## Step 1: Enable Tax Import

1. Go to **Workspace > [Workspace Name] > Accounting > Coding**.  
2. Confirm that tax is enabled for import from Sage Intacct.  
3. Click **Save** if changes were made.  

---

## Step 2: Review Tax Rates in the Workspace

1. In the Workspace, click **Tax** on the left-hand side.  
2. Review the list of tax rates.  
3. Confirm each tax rate has a Sage Intacct icon next to it.  

If a tax rate:

- Does not have the Sage Intacct icon, or  
- Shows a red X  

It was manually entered and must be removed.

Delete any manually entered tax rates.

---

## Step 3: Add or Confirm Tax Rates in Sage Intacct

1. Log in to Sage Intacct.  
2. Add or confirm the required tax rates exist in Sage Intacct.  
3. Return to **Workspace > [Workspace Name] > Accounting**.  
4. Click the three-dot icon next to the connection.  
5. Select **Sync Now** from the dropdown.  

This imports tax rates from Sage Intacct.

---

## Step 4: Update Tax Rates on the Report

If any expenses on the report used manually entered tax rates:

1. Open the report.  
2. Select a valid imported tax rate, or  
3. Reselect the correct imported tax rate.  

---

## Step 5: Retry the Export

Retry exporting the report.

If all tax rates are properly imported and mapped, the export should complete successfully.

---

# FAQ

## Can I manually create tax rates in the Workspace?

You can create them, but they cannot be used for Sage Intacct exports. Tax rates must be imported from Sage Intacct.

## Do all tax rates need the Sage Intacct icon?

Yes. Only tax rates with the Sage Intacct icon are valid for export.

## Do I need to run Sync after updating tax rates?

Yes. Running **Sync Now** ensures tax rates from Sage Intacct are imported before retrying the export.
