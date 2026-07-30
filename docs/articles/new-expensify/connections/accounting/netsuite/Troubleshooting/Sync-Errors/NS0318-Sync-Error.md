---
title: NS0318 Sync Error in NetSuite Integration
description: Learn what the NS0318 sync error means and how to update the Expensify Connect bundle in NetSuite when invoice exports fail.
keywords: NS0318, NetSuite permissions error, could not import items NetSuite, Expensify Connect bundle update, invoice export NetSuite error, SuiteBundler NetSuite, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0318 sync error caused by an outdated Expensify Connect bundle during invoice exports. Does not cover general NetSuite credential errors or full integration setup.
---

# NS0318 Sync Error in NetSuite Integration

If you see the error:

NS0318 Sync Error: Could not import items due to permissions error. Please update your NetSuite bundle version.

This usually means the **Expensify Connect bundle** in NetSuite is out of date.

This error most commonly appears when exporting an **Invoice** from the Workspace to NetSuite.

---

## Why the NS0318 Sync Error Happens in NetSuite

The NS0318 error typically occurs when:

- The **Expensify Connect bundle** in NetSuite is not updated to the latest version.
- You are exporting an **Invoice** (not an expense report).
- Permission mismatches exist between the integration role and the installed bundle version.

An outdated bundle can prevent items from importing correctly into NetSuite during invoice exports.

This is a bundle version issue, not a general credential or login issue.

---

## How to Fix the NS0318 Sync Error

Follow the steps below to confirm your export type and update the bundle.

---

## Confirm You Are Exporting an Invoice

1. Open the report.
2. Check the **Type** field.
3. Confirm whether it is:
   - **Invoice**, or  
   - **Expense report**

If exporting an **Expense report**:

- Refresh the page.
- Confirm the Workspace sync completed successfully.
- Retry the export.

If exporting an **Invoice**, continue below.

---

## Update the Expensify Connect Bundle in NetSuite

1. Log in to NetSuite as an administrator.
2. Go to **Customization > SuiteBundler > Search & Install Bundles > List**.
3. Locate the **Expensify Connect bundle**.
4. Click **Update**.
5. Install the latest version.
6. Confirm the update completes successfully.

---

## Sync the Workspace and Retry the Export

After updating the bundle:

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot menu next to the NetSuite connection.
5. Click **Sync Now**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the three-dot menu next to the NetSuite connection.
5. Tap **Sync Now**.

Then retry exporting the invoice.

---

## Reconfirm the NetSuite Connection if the Error Persists

If the bundle is already updated and the error continues:

1. Review your NetSuite connection settings.
2. Confirm the integration role and permissions are correctly configured.
3. If needed, reconnect the NetSuite integration.

---

# FAQ

## Does the NS0318 Sync Error Affect Expense Report Exports?

No. This error is primarily related to invoice exports.

## Do I Need NetSuite Admin Access to Update the Expensify Connect Bundle?

Yes. Updating bundles in NetSuite requires administrator-level permissions.

## Do I Need to Reinstall the Integration?

No. Updating the bundle and selecting **Sync Now** is typically sufficient.
