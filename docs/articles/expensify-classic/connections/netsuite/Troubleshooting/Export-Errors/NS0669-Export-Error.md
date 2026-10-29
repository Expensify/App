---
title: NS0669 Export Error in NetSuite Integration
description: Learn how to fix the NS0669 export error in NetSuite when the default '-Accountant-' vendor is selected in Expensify.
keywords: NS0669, NetSuite default Accountant vendor error, vendor ID -3 NetSuite, change default vendor Expensify, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0669 export error caused by selecting NetSuite’s default '-Accountant-' vendor. Does not cover other NetSuite error codes.
---

# NS0669 Export Error in NetSuite Integration

If you see the error:

NS0669: NetSuite’s default vendor '-Accountant-' (ID -3) cannot be used for exports. Please choose or create a different vendor and retry.

This means the default **-Accountant-** vendor in NetSuite is selected as the export vendor in Expensify.

---

## Why the NS0669 Export Error Happens in NetSuite

NetSuite automatically includes a default vendor called:

- **-Accountant-**
- Internal ID: **-3**

This vendor is system-generated and cannot be used for exports from Expensify.

The error occurs when:

- The **Default Vendor** setting in Expensify is set to **-Accountant-**.
- The export attempts to use this system vendor.
- NetSuite blocks the transaction.

---

## How to Fix the NS0669 Export Error

### Step One: Select a Different Default Vendor in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Configure**.
6. Open the **Export** tab.
7. Locate the **Default Vendor** field.
8. Select a valid vendor (not **-Accountant-**).
9. Click **Save**.

If needed, create a new vendor in NetSuite and use that vendor instead.

---

### Step Two: Retry the Export

1. Open the report in Expensify.
2. Retry exporting to NetSuite.

Once a valid vendor is selected, the export should complete successfully.

---

# FAQ

## Can I Use the '-Accountant-' Vendor for Any Exports?

No. The **-Accountant-** vendor (ID -3) is a system default in NetSuite and cannot be used for Expensify exports.

## Do I Need to Reconnect NetSuite?

No. Updating the Default Vendor setting and retrying the export is typically sufficient.
