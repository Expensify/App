---
title: ONL939 Export Error in QuickBooks Online Integration
description: Learn what the ONL939 export error means in QuickBooks Online and how to switch from Journal Entries to Vendor Bills to resolve debit and credit imbalance issues.
keywords: ONL939, QuickBooks Online export error, error affecting debits and credits, journal entry tax error QuickBooks, change export type to vendor bill, Expensify QuickBooks Online integration, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers resolving the ONL939 export error caused by debit and credit imbalances when exporting as Journal Entries. Does not cover other QuickBooks Online error codes.
---

# ONL939 Export Error in QuickBooks Online Integration

If you see the error:

ONL939: Error affecting debits and credits.

This means QuickBooks Online detected a debit and credit imbalance when exporting the report as a Journal Entry, preventing the export from completing.

---

## Why the ONL939 Export Error Happens in QuickBooks Online

The ONL939 error typically indicates:

- The export type is set to **Journal Entry**.
- A tax rate on the report was changed or adjusted.
- QuickBooks calculates debits and credits differently than Expensify when exporting as Journal Entries.
- Rounding or balancing differences caused validation to fail.

When tax calculations are modified, QuickBooks may apply rounding rules that create a debit and credit mismatch during Journal Entry exports.

Exporting as a Vendor Bill avoids this issue because Vendor Bills handle tax calculations differently within QuickBooks Online.

This is a QuickBooks Online export limitation, not a Workspace configuration issue.

---

## How to Fix the ONL939 Export Error

This issue can be resolved by changing the export type.

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Export** tab.
6. Change the export type for **Reimbursable expenses** from **Journal Entry** to **Vendor Bill**.
7. Click **Save**.

After updating the export type, retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After changing the export type to **Vendor Bill**, retry the export.

## Does ONL939 Mean the Report Totals Are Incorrect?

No. The issue relates to how QuickBooks processes tax and balancing when exporting as Journal Entries.

## Do I Need to Reconnect QuickBooks Online?

No. Changing the export type and retrying the export is typically sufficient.
