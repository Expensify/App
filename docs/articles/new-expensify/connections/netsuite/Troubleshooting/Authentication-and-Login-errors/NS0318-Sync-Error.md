---
title: NS0318 Sync Error in NetSuite Integration
description: Learn what the NS0318 sync error means and how to update the Expensify Connect bundle in NetSuite to resolve invoice export permission issues.
keywords: NS0318, NetSuite permissions error, could not import items NetSuite, Expensify Connect bundle, update NetSuite bundle, invoice export NetSuite, SuiteBundler, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0318 sync error caused by an outdated Expensify Connect bundle during invoice exports. Does not cover general NetSuite credential errors or full integration setup.
---

# NS0318 Sync Error in NetSuite Integration

If you see the error:

NS0318 Sync Error: Could not import items due to permissions error. Please update your NetSuite bundle version.

This usually means the **Expensify Connect bundle** in NetSuite is out of date.

This error most commonly appears when exporting an **invoice** from the Workspace to NetSuite.

---

## Why the NS0318 Sync Error Happens in NetSuite

The NS0318 error typically indicates:

- The **Expensify Connect bundle** in NetSuite is not updated to the latest version.
- You are exporting an **invoice** from the Workspace.
- NetSuite permissions do not align with the current integration requirements.

An outdated bundle can cause permission mismatches that prevent invoice items from importing correctly into NetSuite.

This is a bundle version or permission alignment issue, not a general credential error.

---

## How to Fix the NS0318 Sync Error

Follow the steps below based on what you are exporting.

### Confirm What You Are Exporting

1. Open the report in the Workspace.
2. Confirm whether you are exporting:
   - An **invoice**, or  
   - An **expense report**.

If you are exporting an expense report:

- Refresh the page.
- Go to **Settings > Workspaces > Accounting**.
- Click **Sync Now**.
- Confirm the Workspace synced successfully.

If you are exporting an invoice, continue to the next step.

### Update the Expensify Connect Bundle in NetSuite

1. Log in to NetSuite as an administrator.
2. Go to **Customization > SuiteBundler > Search & Install Bundles > List**.
3. Locate the **Expensify Connect bundle**.
4. Update the bundle to the latest available version.
5. Confirm the update completes successfully.

After updating the bundle:

1. Return to the Workspace.
2. Retry exporting the invoice to NetSuite.

### Reconfirm the NetSuite Connection (If Needed)

If the Expensify Connect bundle is already on the latest version and the error continues:

1. Review the NetSuite connection settings in the Workspace.
2. Confirm the correct account ID, role, and permissions are configured.
3. Click **Sync Now** under **Settings > Workspaces > Accounting**.

If the issue persists, reach out to **Concierge** and include:

- The full error message.
- Confirmation that you are seeing **NS0318**.
- The invoice ID.

---

# FAQ

## Does the NS0318 Sync Error Affect Expense Report Exports?

No. This error primarily affects invoice exports. If you see it while exporting an expense report, refresh the page and confirm the sync completed.

## Do I Need NetSuite Admin Access to Update the Expensify Connect Bundle?

Yes. Updating bundles in NetSuite requires administrator-level permissions.

## Do I Need to Reinstall the Bundle?

No. In most cases, updating the existing Expensify Connect bundle to the latest version is sufficient.
