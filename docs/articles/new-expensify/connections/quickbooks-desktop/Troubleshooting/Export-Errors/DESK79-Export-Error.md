---
title: DESK79 Export Error in QuickBooks Desktop Integration
description: Learn what the DESK79 export error means and how to align account currency in QuickBooks Desktop with the report currency in Expensify.
keywords: DESK79, QuickBooks Desktop account currency mismatch, QuickBooks multi-currency export error, transaction currency mismatch QuickBooks, Expensify QuickBooks Desktop export error, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Desktop integration. Covers resolving the DESK79 export error related to currency mismatches between QuickBooks Desktop accounts and Expensify reports. Does not cover connection or mapping configuration errors.
---

# DESK79 Export Error in QuickBooks Desktop Integration

If you see the error:

DESK79 Export Error: The QuickBooks Desktop account currency must match either the home currency of the QuickBooks company file or the transaction currency as listed in Expensify.

This means the currency assigned to the category or export account in QuickBooks Desktop does not match the currency of the report or expenses in the Workspace.

QuickBooks Desktop requires the account currency to match either:

- The home currency of the QuickBooks company file, or  
- The transaction currency of the report being exported.

---

## Why the DESK79 Export Error Happens in QuickBooks Desktop

The DESK79 error typically occurs when:

- The selected category in QuickBooks Desktop is set to a different currency than the report.
- The export account is assigned a foreign currency that does not match the transaction.
- Multi-currency is enabled in QuickBooks Desktop and the wrong account is selected.

If the account currency does not align with the report currency, QuickBooks rejects the export.

This is a currency configuration issue, not a connection issue.

---

# How to Fix the DESK79 Export Error

Follow the steps below to confirm and align currencies.

---

## Confirm the Account Currency in QuickBooks Desktop

1. Open **QuickBooks Desktop**.
2. Go to the **Chart of Accounts**.
3. Locate the category or export account used for the report.
4. Confirm the account currency matches:
   - The home currency of the company file, or  
   - The currency of the report or individual expenses.
5. Update the account currency if needed.

If the account currency cannot be changed, you may need to create a new account with the correct currency.

---

## Run Sync in the Workspace

After updating or confirming the account currency:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot icon next to the QuickBooks Desktop connection.
5. Click **Sync now**.

This refreshes the account configuration from QuickBooks Desktop.

---

## Retry the Export

1. Open the report.
2. Retry exporting to QuickBooks Desktop.

If the account currency matches the report currency, the export should complete successfully.

---

# FAQ

## Does the DESK79 Error Only Occur in Multi-Currency Environments?

Yes. This error typically appears when multi-currency is enabled and account currencies do not align with the transaction currency.

## Can I Change the Report Currency Instead?

Only if appropriate for your accounting process. Otherwise, create or select a QuickBooks Desktop account with the correct currency.

## Do I Need to Reconnect the Integration?

No. This is a currency configuration issue, not a connection issue.
