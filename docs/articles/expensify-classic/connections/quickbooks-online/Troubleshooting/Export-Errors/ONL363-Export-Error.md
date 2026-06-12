---
title: ONL363 Export Error in QuickBooks Online Integration
description: Learn what the ONL363 export error means in QuickBooks Online and how to resolve currency mismatches between accounts and vendors.
keywords: ONL363, QuickBooks Online export error, currency mismatch QuickBooks, account and vendor currencies don’t match, multi-currency QuickBooks error, Expensify QuickBooks Online integration, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers resolving the ONL363 export error caused by currency mismatches in multi-currency environments. Does not cover other QuickBooks Online error codes.
---

# ONL363 Export Error in QuickBooks Online Integration

If you see the error:

ONL363: Account and customer or supplier currencies don’t match.

This means the QuickBooks Online export account currency does not match the currency assigned to the vendor (supplier) or employee record, preventing the export from completing.

---

## Why the ONL363 Export Error Happens in QuickBooks Online

The ONL363 error typically indicates:

- Multi-currency is enabled in QuickBooks Online.
- The vendor or employee record has a different currency than the selected export account.
- QuickBooks validation failed due to currency mismatch.

QuickBooks requires the vendor (supplier) currency to match the currency assigned to the export account.

Exports may fail when:

- Reimbursable or non-reimbursable expenses are exported as **Journal Entries**.
- Credit Card Transactions are exported.
- Debit Card Transactions are exported.

This is a QuickBooks Online multi-currency configuration issue, not a Workspace configuration issue.

---

## How to Fix the ONL363 Export Error

This issue can be resolved by adjusting export settings and verifying currencies.

### Export as Vendor Bills in Multi-Currency Environments

If multi-currency is enabled:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Export** tab.
6. Set **Reimbursable expenses** to **Vendor Bill**.
7. Save your changes.

Vendor Bills handle currency correctly in multi-currency environments.

### Confirm Account and Vendor Currency Match

In QuickBooks Online:

1. Go to the **Chart of Accounts**.
2. Confirm the currency assigned to the export account.
3. Open the **Vendor** (or Employee) record.
4. Confirm the vendor currency matches the export account currency.

The vendor currency and export account currency must align.

### Check for Duplicate Vendor or Employee Records

ONL363 may also occur if:

- Duplicate vendor or employee records exist.
- The duplicate records use the same email address.
- The duplicate records have different currencies assigned.

To correct this:

1. Locate duplicate records in QuickBooks Online.
2. Remove the email address from one duplicate.
3. Ensure only one active record remains with the correct currency.

After making updates:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After updating export settings and confirming currency alignment, retry the export.

## Does ONL363 Mean Multi-Currency Is Misconfigured?

Not necessarily. It means the vendor and export account currencies do not match.

## Do I Need to Reconnect QuickBooks Online?

No. Updating export settings, correcting vendor currencies, and selecting **Sync Now** is typically sufficient.
