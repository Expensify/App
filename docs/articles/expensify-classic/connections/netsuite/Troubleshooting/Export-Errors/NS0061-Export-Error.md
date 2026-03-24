---
title: NS0061 Export Error in NetSuite Integration
description: Learn how to fix the NS0061 export error in NetSuite when the subsidiary requires tax tracking and tax is not enabled in Expensify.
keywords: NS0061, NetSuite subsidiary requires tax tracking, enable tax import Expensify, apply tax codes to expenses, NetSuite tax export error, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0061 export error caused by tax tracking not being enabled in Expensify. Does not cover other NetSuite error codes.
---

# NS0061 Export Error in NetSuite Integration

If you see the error:

NS0061: NetSuite subsidiary requires tax tracking. Please enable tax import within Expensify and apply tax codes to expenses.

This means the NetSuite subsidiary requires tax tracking, but tax is not enabled in the Workspace in Expensify.

---

## Why the NS0061 Export Error Happens in NetSuite

The NS0061 error occurs when:

- The selected NetSuite subsidiary requires tax tracking.
- Tax import is disabled in Expensify.
- Expenses on the report do not have tax codes applied.

NetSuite blocks exports to subsidiaries that require tax if no tax information is provided.

---

## How to Fix the NS0061 Export Error

### Step One: Enable Tax Import in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Configure**.
6. Open the **Coding** tab.
7. Enable **Tax**.
8. Click **Save**.

This allows Expensify to import and apply NetSuite tax codes.

---

### Step Two: Apply Tax Codes to Expenses

1. Open the report in Expensify.
2. Review each expense.
3. Apply the appropriate tax rate to each expense.
4. Save the changes.

All expenses must have valid tax codes before exporting.

---

### Step Three: Retry the Export

1. Open the updated report.
2. Retry exporting to NetSuite.

Once tax is enabled and applied to the expenses, the export should complete successfully.

---

# FAQ

## Does NS0061 Only Happen for Certain Subsidiaries?

Yes. This error occurs when exporting to a NetSuite subsidiary that requires tax tracking.

## Do All Expenses Need a Tax Code?

Yes. If tax tracking is required by the subsidiary, each expense must have an appropriate tax code applied before exporting.
