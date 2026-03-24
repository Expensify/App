---
title: ONL417 Export Error in QuickBooks Online Integration
description: Learn what the ONL417 export error means in QuickBooks Online and how to align Accounts Receivable and Accounts Payable currencies to restore successful exports.
keywords: ONL417, QuickBooks Online export error, accounts receivable currency mismatch, accounts payable currency mismatch, AR AP currency QuickBooks, Expensify QuickBooks Online integration, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers resolving the ONL417 export error caused by currency mismatches between Accounts Receivable and Accounts Payable accounts. Does not cover other QuickBooks Online error codes.
---

# ONL417 Export Error in QuickBooks Online Integration

If you see the error:

ONL417: All Accounts Receivable and Accounts Payable accounts must be in the same currency.

This means the currency assigned to your **Accounts Receivable (AR)** or **Accounts Payable (AP)** account in QuickBooks Online does not match the report or Workspace currency, preventing the export from completing.

---

## Why the ONL417 Export Error Happens in QuickBooks Online

The ONL417 error typically indicates:

- The report currency in Expensify differs from the currency assigned to AR or AP accounts in QuickBooks Online.
- Multi-currency settings created mismatched account configurations.
- QuickBooks validation failed due to inconsistent account currencies.

QuickBooks requires all AR and AP accounts involved in the export to share the same currency.

This is a QuickBooks Online Chart of Accounts configuration issue, not a Workspace configuration issue.

---

## How to Fix the ONL417 Export Error

This issue must be resolved in QuickBooks Online.

1. Log in to QuickBooks Online.
2. Go to the **Chart of Accounts**.
3. Locate your **Accounts Receivable (AR)** account.
4. Confirm the currency assigned to the account.
5. Repeat the process for your **Accounts Payable (AP)** account.
6. Ensure both AR and AP accounts:
   - Use the same currency, and  
   - Match the Workspace currency used for export.
7. Save your changes.

After updating account currencies:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After aligning AR and AP currencies and selecting **Sync Now**, retry the export.

## Does ONL417 Mean Multi-Currency Is Not Supported?

No. Multi-currency is supported, but AR and AP accounts used in the export must share the same currency.

## Do I Need to Reconnect QuickBooks Online?

No. Updating the account currencies and running **Sync Now** is typically sufficient.
