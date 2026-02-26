---
title: ONL363 Export Error in QuickBooks Online
description: Learn how to fix the ONL363 export error in QuickBooks Online when account and vendor currencies do not match during export.
keywords: ONL363, QuickBooks Online currency mismatch, account and vendor currencies don’t match, multi-currency export error, vendor bill export, duplicate vendor currency, Expensify QuickBooks Online export error, Workspace Admin, accounting export error
internalScope: Audience is Workspace Admins using QuickBooks Online integration. Covers fixing the ONL363 export error caused by currency mismatches and multi-currency settings. Does not cover other export error codes.
---

# ONL363 Export Error in QuickBooks Online

If you see the error:

ONL363: Export error: Account and customer/supplier currencies don’t match.

This means the currency assigned to the QuickBooks Online account does not match the currency assigned to the vendor (supplier) or employee record.

---

## Why the ONL363 Export Error Happens in QuickBooks Online

The ONL363 error occurs when:

- Multi-currency is enabled in QuickBooks Online.
- The export account currency does not match the vendor’s currency.
- The export is set to Journal Entry, credit card transaction, or debit card transaction instead of Vendor Bill.
- There are duplicate employee or vendor records with the same email address but different currencies.

QuickBooks Online requires the vendor currency and home currency to match the export account currency.

---

## How to Fix Currency Mismatches in QuickBooks Online

### If Multi-Currency Is Enabled

When multi-currency is enabled in QuickBooks Online:

- Both reimbursable and non-reimbursable expenses must be exported as **Vendor Bills**.
- Exports will fail if using:
  - Journal Entries
  - Credit card transactions
  - Debit card transactions

Update your export settings in Expensify to use Vendor Bill for all expense types.

### How to Change Export Type to Vendor Bill in Expensify

#### On Web

1. Go to the **Workspaces** navigation tab on the left.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Export**.
5. Set both reimbursable and non-reimbursable expenses to **Vendor Bill**.
6. Click **Save**.

#### On Mobile

1. Tap the **Workspaces** navigation tab on the bottom.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Export**.
5. Set both reimbursable and non-reimbursable expenses to **Vendor Bill**.
6. Tap **Save**.

Retry exporting the report after updating the export settings.

---

## How to Check Vendor and Account Currencies in QuickBooks Online

1. In QuickBooks Online, open the vendor (or employee) record.
2. Confirm the assigned currency.
3. Open the export account in the Chart of Accounts.
4. Confirm the account currency matches the vendor’s currency.

The vendor currency, home currency, and export account currency must align.

---

## How to Fix Duplicate Vendor or Employee Records With Different Currencies

If there are duplicate records:

1. In QuickBooks Online, search for vendor or employee records with the same email address.
2. Check whether the records use different currencies.
3. Remove the duplicate email address from one of the records or merge records if appropriate.
4. Save your changes.

After correcting duplicate or mismatched records, retry exporting the report.

---

# FAQ

## Does ONL363 Only Happen When Multi-Currency Is Enabled?

Yes. This error typically occurs when multi-currency is enabled in QuickBooks Online and currencies do not align between the vendor and the export account.

## Do All Expenses Need to Be Exported as Vendor Bills With Multi-Currency?

Yes. When multi-currency is enabled, exporting as Journal Entries or card transactions will fail. All expenses must be exported as Vendor Bills to avoid currency mismatch errors.
