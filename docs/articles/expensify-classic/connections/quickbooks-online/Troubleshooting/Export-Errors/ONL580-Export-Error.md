---
title: ONL580 Export Error in QuickBooks Online Integration
description: Learn what the ONL580 export error means in QuickBooks Online and how to resolve foreign currency mismatches between reports and export accounts.
keywords: ONL580, QuickBooks Online export error, transactions can use only one foreign currency, report currency mismatch QuickBooks, posting account currency error, Expensify QuickBooks Online integration, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers resolving the ONL580 export error caused by currency mismatches between report currency and export account currency. Does not cover other QuickBooks Online error codes.
---

# ONL580 Export Error in QuickBooks Online Integration

If you see the error:

ONL580: Transactions can use only one foreign currency.

This means the currency of the report does not match the currency of the export account configured in your Workspace, preventing the export from completing.

---

## Why the ONL580 Export Error Happens in QuickBooks Online

The ONL580 error typically indicates:

- The report currency in Expensify differs from the export account currency in QuickBooks Online.
- The employee or vendor currency does not align with the export account currency.
- QuickBooks validation failed due to a foreign currency mismatch.

QuickBooks requires the transaction currency to match the posting account currency.

This is a QuickBooks Online currency configuration issue, not a Workspace configuration issue.

---

## How to Fix the ONL580 Export Error

This issue can be resolved by aligning report, vendor, and export account currencies.

### Select a Different Export Account

If the export account currency does not match the report currency:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Export** tab.
6. Select an export account that matches the report currency.
7. Click **Save**.

Retry exporting the report.

---

### Confirm Currency Matches Across Report, Vendor, and Export Account

1. Confirm the report currency in Expensify.
2. Log in to QuickBooks Online.
3. Open the vendor or employee record associated with the report.
4. Confirm the vendor or employee currency matches the report currency.
5. Go to the **Chart of Accounts**.
6. Confirm the export account currency matches both the vendor currency and report currency.

All three currencies must align.

After making updates:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

### Confirm the Report Currency Is Correct

If the report currency is incorrect:

- If the report status is **Paid: Confirmed**, the currency cannot be changed and a new report must be created.
- If the report status is **Approved**, **Done**, or **Paid**, a Workspace Admin can unapprove the report to allow edits.

After correcting the report currency, retry exporting.

---

# FAQ

## Can I Retry the Export?

Yes. After aligning currencies and selecting **Sync Now**, retry the export.

## Does ONL580 Mean Multi-Currency Is Not Supported?

No. Multi-currency is supported, but the report currency must match the posting account currency.

## Do I Need to Reconnect QuickBooks Online?

No. Updating export settings or correcting currency configurations and retrying the export is typically sufficient.
