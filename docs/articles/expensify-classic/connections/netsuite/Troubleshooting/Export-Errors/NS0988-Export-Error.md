---
title: NS0988 Export Error in NetSuite Integration
description: Learn how to fix the NS0988 export error in NetSuite when the CA-Zero tax group is missing or inactive.
keywords: NS0988, NetSuite CA-Zero tax group missing, mileage tax code NetSuite, per diem tax group NetSuite, tax group inactive NetSuite, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0988 export error caused by a missing or inactive CA-Zero tax group. Does not cover other NetSuite error codes.
---

# NS0988 Export Error in NetSuite Integration

If you see the error:

NS0988: The 'CA-Zero' tax group is missing or renamed in NetSuite. This tax code is required for exporting mileage and per diem expenses.

This means the required **CA-Zero** tax group is not available in NetSuite.

---

## Why the NS0988 Export Error Happens in NetSuite

The NS0988 error occurs when:

- The **CA-Zero** tax group is inactive.
- The tax group was renamed.
- The tax group was deleted.
- Tax groups have not been synced after changes.
- Mileage or per diem expenses are being exported without a valid zero-tax group.

NetSuite requires the **CA-Zero** tax group when exporting mileage or per diem expenses where no tax is applied.

---

## How to Fix the NS0988 Export Error

### Step One: Confirm the CA-Zero Tax Group in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Go to **Setup**.
3. Select **Accounting**.
4. Click **Tax Groups**.
5. Confirm that **CA-Zero**:
   - Exists.
   - Is active.
   - Has not been renamed.

If it is inactive, reactivate it.  
If it was renamed or deleted, recreate the tax group as **CA-Zero**.

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

Once the CA-Zero tax group is active and synced, the export should complete successfully.

---

# FAQ

## Does NS0988 Only Affect Mileage and Per Diem?

Yes. This error typically appears when exporting mileage or per diem expenses where no tax is applied.

## Do I Need to Reconnect NetSuite?

No. Reactivating or recreating the CA-Zero tax group and running **Sync** is usually sufficient.
