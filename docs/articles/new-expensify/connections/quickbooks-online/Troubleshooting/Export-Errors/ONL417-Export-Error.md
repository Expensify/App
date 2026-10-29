---
title: ONL417 Export Error in QuickBooks Online
description: Learn how to fix the ONL417 export error in QuickBooks Online when Accounts Receivable and Accounts Payable accounts are set to different currencies.
keywords: ONL417, QuickBooks Online AR AP currency error, Accounts Receivable currency mismatch, Accounts Payable currency mismatch, Chart of Accounts currency update, Expensify QuickBooks Online export error, Sync now, Workspace Admin, accounting export error
internalScope: Audience is Workspace Admins using QuickBooks Online integration. Covers fixing the ONL417 export error caused by currency mismatches in AR and AP accounts. Does not cover other export error codes.
---

# ONL417 Export Error in QuickBooks Online

If you see the error:

ONL417: All Accounts Receivable and Accounts Payable accounts must be in the same currency. Please update Chart of Accounts in QuickBooks Online.

This means the currency assigned to your Accounts Receivable (AR) or Accounts Payable (AP) accounts in QuickBooks Online does not match the report currency in Expensify.

---

## Why the ONL417 Export Error Happens in QuickBooks Online

The ONL417 error occurs when:

- The report currency in Expensify differs from the currency assigned to AR or AP accounts in QuickBooks Online.
- AR and AP accounts are set to different currencies in the Chart of Accounts.
- Multi-currency settings create a mismatch between the Workspace currency and the export account currency.

QuickBooks Online requires all AR and AP accounts used for export to share the same currency.

---

## How to Update AR and AP Account Currencies in QuickBooks Online

To resolve this error, confirm the currencies match.

1. In QuickBooks Online, go to **Accounting**.
2. Select **Chart of Accounts**.
3. Locate your **Accounts Receivable (AR)** account.
4. Click **Edit** and confirm the assigned currency.
5. Repeat for your **Accounts Payable (AP)** account.
6. Update the currency as needed so both AR and AP accounts match the report currency and Workspace currency used in Expensify.
7. Click **Save**.

Note: In some cases, QuickBooks Online does not allow changing the currency of an existing account. You may need to create a new AR or AP account with the correct currency and update your export settings accordingly.

---

## How to Sync QuickBooks Online in Expensify

After updating the account currencies, refresh your connection.

### On Web

1. Go to the **Workspaces** navigation tab on the left.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the **three-dot icon** next to the QuickBooks Online connection.
5. Select **Sync now**.

### On Mobile

1. Tap the **Workspaces** navigation tab on the bottom.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the **three-dot icon** next to the QuickBooks Online connection.
5. Tap **Sync now**.

Once the sync completes, retry exporting the report.

---

# FAQ

## Do AR and AP Accounts Have to Use the Same Currency?

Yes. QuickBooks Online requires all Accounts Receivable and Accounts Payable accounts used for export to share the same currency.

## Does the Report Currency Need to Match the Workspace Currency?

Yes. The report currency in Expensify should align with the Workspace currency and the AR/AP account currency in QuickBooks Online to avoid export errors.
