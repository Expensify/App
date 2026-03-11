---
title: NS0055 Export Error in NetSuite Integration
description: Learn how to fix the NS0055 export error in NetSuite when a vendor does not have access to the required transaction currency.
keywords: NS0055, NetSuite vendor currency error, vendor does not have access to transaction currency, add currency vendor financial tab, multi-currency NetSuite vendor, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0055 export error caused by vendor currency configuration issues. Does not cover other NetSuite error codes.
---

# NS0055 Export Error in NetSuite Integration

If you see the error:

NS0055: The vendor doesn’t have access to the transaction currency. Add the currency to the vendor’s 'Financial tab' in NetSuite.

This means the vendor record in NetSuite does not have the currency used on the report enabled.

---

## Why the NS0055 Export Error Happens in NetSuite

The NS0055 error occurs when:

- The report or expense in Expensify uses a currency that is not enabled on the vendor record in NetSuite.
- Multi-currency is enabled in NetSuite.
- The vendor’s Financial settings do not include the transaction currency.

NetSuite requires vendors to have access to the currency used in the transaction.

---

## How to Fix the NS0055 Export Error

### Step One: Update the Vendor Currency in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Navigate to **Lists** > **Relationships** > **Vendors**.
3. Open the vendor record associated with the report submitter.
4. Go to the **Financial** tab.
5. Add the currency used in the report.
6. Save the vendor record.

The currency must match the report currency in Expensify.

---

### Step Two: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

---

### Step Three: Retry the Export

1. Open the report in Expensify.
2. Retry exporting to NetSuite.

Once the vendor has access to the required currency, the export should complete successfully.

---

# FAQ

## Does NS0055 Only Occur With Multi-Currency Enabled?

Yes. This error typically occurs when multi-currency is enabled in NetSuite and the vendor does not have access to the transaction currency.

## Do I Need to Reconnect NetSuite?

No. Updating the vendor’s Financial tab and running **Sync** is usually sufficient.
