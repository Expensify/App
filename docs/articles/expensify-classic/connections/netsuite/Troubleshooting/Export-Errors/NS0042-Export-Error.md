---
title: NS0042 Export Error in NetSuite Integration
description: Learn how to fix the NS0042 export error in NetSuite when a vendor already exists but cannot be matched during export.
keywords: NS0042, NetSuite vendor already exists, vendor email mismatch NetSuite, vendor subsidiary mismatch NetSuite, duplicate vendor error NetSuite, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0042 export error caused by vendor email or subsidiary mismatches. Does not cover other NetSuite error codes.
---

# NS0042 Export Error in NetSuite Integration

If you see the error:

NS0042: Vendor already exists in NetSuite. Please make sure vendor record subsidiary and email matches between NetSuite and Expensify.

This means Expensify attempted to create a vendor for the report submitter, but a vendor with that name already exists in NetSuite and could not be matched.

---

## Why the NS0042 Export Error Happens in NetSuite

The NS0042 error occurs when:

- A vendor record already exists in NetSuite.
- The vendor’s **email address** does not exactly match the submitter’s email in Expensify.
- The vendor’s **subsidiary** does not match the subsidiary configured in Expensify.
- The integration cannot automatically match the existing vendor.

Expensify matches vendors using both email address and subsidiary configuration.

---

## How to Fix the NS0042 Export Error

### Step One: Confirm the Vendor Record in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Search for the vendor associated with the report submitter.
3. Open the vendor record.
4. Confirm:
   - The **Email** field exactly matches the submitter’s email in Expensify.
   - The **Subsidiary** matches the subsidiary configured in Expensify.
   - The vendor record is active.

Update the email or subsidiary if needed and save changes.

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

Once the vendor’s email and subsidiary match between NetSuite and Expensify, the export should complete successfully.

---

# FAQ

## Does the Email Have to Match Exactly?

Yes. The vendor email in NetSuite must exactly match the report submitter’s email in Expensify.

## Does NS0042 Mean the Vendor Is Missing?

No. This error means the vendor exists but cannot be matched due to email or subsidiary differences.
