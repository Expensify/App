---
title: NS0091 Export Error in NetSuite Integration
description: Learn how to fix the NS0091 export error in NetSuite when the default Tax ID is not enabled in Expensify.
keywords: NS0091, NetSuite default Tax ID not found, enable tax import Expensify, NetSuite tax configuration error, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0091 export error caused by tax not being enabled in Expensify. Does not cover other NetSuite error codes.
---

# NS0091 Export Error in NetSuite Integration

If you see the error:

NS0091: Could not find default Tax ID in Expensify. Please enable tax for import within Expensify configurations.

This means the default Tax ID required for export is not enabled or accessible in Expensify.

---

## Why the NS0091 Export Error Happens in NetSuite

The NS0091 error occurs when:

- Tax import is disabled in the Workspace settings.
- No default Tax ID is available in Expensify.
- The NetSuite subsidiary requires tax tracking.
- Tax codes were not imported from NetSuite.

Expensify must have tax import enabled to apply and pass the correct Tax ID during export.

---

## How to Fix the NS0091 Export Error

### Step One: Enable Tax Import in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Configure**.
6. Open the **Coding** tab.
7. Enable **Tax** for import.
8. Click **Save**.

---

### Step Two: Retry the Export

1. Open the report in Expensify.
2. Confirm tax codes are applied to expenses if required.
3. Retry exporting to NetSuite.

Once tax import is enabled and a default Tax ID is available, the export should complete successfully.

---

# FAQ

## Does NS0091 Mean My Integration Is Broken?

No. This error indicates that tax is not enabled in Expensify.

## Do I Need to Reconnect NetSuite?

No. Enabling tax import and retrying the export is typically sufficient.
