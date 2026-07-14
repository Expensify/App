---
title: NS0994 Export Error in NetSuite Integration
description: Learn how to fix the NS0994 export error in NetSuite when the entity (vendor) field is missing or the default company card vendor is not valid.
keywords: NS0994, NetSuite enter value for entity, vendor name field missing NetSuite, default company card vendor error, map company card vendor Expensify, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0994 export error caused by invalid or missing vendor mapping for company card exports. Does not cover other NetSuite error codes.
---

# NS0994 Export Error in NetSuite Integration

If you see the error:

NS0994: Enter value for 'entity'. Please confirm the associated vendor record includes the 'name' field.

This means NetSuite did not receive a valid vendor (entity) value during export.

---

## Why the NS0994 Export Error Happens in NetSuite

The NS0994 error occurs when:

- The default company card export vendor is set to **Default** instead of a specific vendor.
- The selected vendor record is not valid in NetSuite.
- The vendor record is missing required fields.
- The export account mapping is incomplete.

NetSuite requires a valid vendor (entity) when exporting company card transactions.

---

## How to Fix the NS0994 Export Error

### Step One: Update the Company Card Export Mapping in Expensify

1. In Expensify, go to **Settings**.
2. Select **Domain**.
3. Click **Company Cards**.
4. Locate the card associated with the report.
5. Click **Edit Export**.
6. In the dropdown, select a specific vendor or card account.
   - Do **not** leave it set to **Default**.
7. Click **Save**.

---

### Step Two: Retry the Export

1. Open the report in Expensify.
2. Retry exporting to NetSuite.

Once a valid vendor is selected for the company card export, the export should complete successfully.

---

# FAQ

## Does NS0994 Mean the Vendor Record Is Missing?

Not necessarily. It usually means the company card is mapped to **Default** instead of a specific vendor.

## Do I Need to Reconnect NetSuite?

No. Updating the company card export mapping and retrying the export is typically sufficient.
