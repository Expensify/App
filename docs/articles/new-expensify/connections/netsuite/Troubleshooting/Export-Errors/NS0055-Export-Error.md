---
title: NS0055 Export Error in NetSuite Integration
description: Learn what the NS0055 export error means and how to add the correct currency to the vendor’s Financial tab in NetSuite before exporting.
keywords: NS0055, NetSuite vendor currency error, vendor does not have access to currency NetSuite, add currency to vendor Financial tab NetSuite, transaction currency error NetSuite, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0055 export error caused by vendor currency access issues in NetSuite. Does not cover subsidiary or employee record mismatches.
---

# NS0055 Export Error in NetSuite Integration

If you see the error:

NS0055 Export Error: The vendor doesn’t have access to the transaction currency. Add the currency to the vendor’s 'Financial tab' in NetSuite.

This means the vendor record in NetSuite does not support the currency used on the report.

NetSuite requires vendors to have access to the transaction currency before the export can succeed.

---

## Why the NS0055 Export Error Happens in NetSuite

The NS0055 error typically occurs when:

- The report currency differs from the vendor’s allowed currencies in NetSuite.
- The vendor record does not include that currency on the **Financial** tab.
- Multi-currency is enabled, but the vendor is restricted to a specific currency.

If the vendor does not have the transaction currency assigned, NetSuite blocks the export.

This is a vendor currency configuration issue, not a subsidiary or employee record mismatch.

---

## How to Fix the NS0055 Export Error

Follow the steps below to add the correct currency to the vendor record.

### Add the Currency to the Vendor Record in NetSuite

1. Log in to NetSuite as an administrator.
2. Locate the vendor record associated with the report creator or submitter.
3. Open the vendor profile.
4. Navigate to the **Financial** tab.
5. Add the corresponding transaction currency.
6. Click **Save**.

Confirm the vendor now has access to the report currency.

### Sync the Workspace in Expensify

After updating the vendor record:

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

### Retry the Export

1. Open the report.
2. Retry exporting to NetSuite.

If the vendor has access to the correct currency, the export should complete successfully.

---

# FAQ

## Does the NS0055 Export Error Affect Only Certain Currencies?

Yes. The error appears only when the report currency is not enabled on the vendor record in NetSuite.

## Do I Need NetSuite Admin Access to Fix the NS0055 Export Error?

Yes. Updating vendor currency settings requires appropriate NetSuite permissions.

## Do I Need to Reconnect the Integration?

No. Adding the currency to the vendor and selecting **Sync Now** is typically sufficient.
