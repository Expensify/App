---
title: ONL562 Export Error in QuickBooks Online Integration
description: Learn what the ONL562 export error means in QuickBooks Online and how to resolve currency mismatches between vendor records and Accounts Payable or Accounts Receivable accounts.
keywords: ONL562, QuickBooks Online export error, transaction must use same currency, vendor AP currency mismatch QuickBooks, accounts receivable currency error QuickBooks, Expensify QuickBooks Online integration, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers resolving the ONL562 export error caused by currency mismatches between vendor records and A/P or A/R accounts. Does not cover other QuickBooks Online error codes.
---

# ONL562 Export Error in QuickBooks Online Integration

If you see the error:

ONL562: The transaction must use the same currency as the Accounts Receivable or Accounts Payable account.

This means the currency assigned to the vendor record does not match the currency assigned to the Accounts Payable (A/P) or Accounts Receivable (A/R) account, preventing the export from completing.

---

## Why the ONL562 Export Error Happens in QuickBooks Online

The ONL562 error typically indicates:

- The vendor associated with the report creator or submitter has a different currency than the selected A/P or A/R account.
- Duplicate vendor records exist with different currencies assigned.
- QuickBooks validation failed due to currency mismatch.

QuickBooks requires the transaction currency to match the currency of the A/P or A/R account used for export.

This is a QuickBooks Online currency configuration issue, not a Workspace configuration issue.

---

## How to Fix the ONL562 Export Error

This issue can be resolved by verifying vendor and account currencies.

### Confirm Vendor Currency

1. Log in to QuickBooks Online.
2. Open the vendor record associated with the report creator or submitter.
3. Confirm the vendor’s currency.
4. Ensure it matches the currency assigned to the relevant A/P or A/R account.
5. Save any changes.

If duplicate vendor records exist with the same email address but different currencies:

- Remove the email address from the incorrect record.
- Ensure only one active vendor record remains with the correct currency.

### Confirm A/P or A/R Account Currency

1. In QuickBooks Online, go to the **Chart of Accounts**.
2. Locate the A/P or A/R account used for export.
3. Confirm the account currency matches the vendor currency.

The vendor currency and the A/P or A/R account currency must match exactly.

After correcting currencies:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After aligning vendor and account currencies and selecting **Sync Now**, retry the export.

## Does ONL562 Mean Multi-Currency Is Unsupported?

No. Multi-currency is supported, but vendor and A/P or A/R account currencies must match.

## Do I Need to Reconnect QuickBooks Online?

No. Updating vendor and account currency settings and running **Sync Now** is typically sufficient.
