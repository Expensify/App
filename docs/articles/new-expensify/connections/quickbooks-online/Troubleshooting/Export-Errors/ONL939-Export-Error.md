---
title: ONL939 Export Error in QuickBooks Online
description: Learn how to fix the ONL939 export error in QuickBooks Online by changing the export type from Journal Entry to Vendor Bill.
keywords: ONL939, QuickBooks Online debit credit error, error affecting debits and credits, change export type to vendor bill, journal entry export error, tax rate change QuickBooks Online, Expensify QuickBooks Online export error, Workspace Admin, accounting export error
internalScope: Audience is Workspace Admins using QuickBooks Online integration. Covers fixing the ONL939 export error caused by exporting Journal Entries when tax rates have changed. Does not cover other export error codes.
---

# ONL939 Export Error in QuickBooks Online

If you see the error:

ONL939: Error affecting debits and credits. Please change export type from Journal Entries to Vendor Bills in workspace configurations.

This means the report is being exported as a Journal Entry, and QuickBooks Online cannot balance the debits and credits due to tax rate changes.

---

## Why the ONL939 Export Error Happens in QuickBooks Online

The ONL939 error occurs when:

- The export type is set to Journal Entry.
- A tax rate associated with the report has changed in QuickBooks Online.
- QuickBooks Online cannot properly calculate and balance debits and credits for the Journal Entry.

QuickBooks Online handles tax calculations more accurately when exporting as Vendor Bills instead of Journal Entries.

---

## How to Change the Export Type to Vendor Bill in Expensify

To resolve the error, update the export configuration for reimbursable expenses.

### On Web

1. Go to the **Workspaces** navigation tab on the left.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Export**.
5. Under **Export reimbursable expenses as**, change the export type from **Journal Entry** to **Vendor Bill**.
6. Click **Save**.

### On Mobile

1. Tap the **Workspaces** navigation tab on the bottom.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Export**.
5. Under **Export reimbursable expenses as**, change the export type from **Journal Entry** to **Vendor Bill**.
6. Tap **Save**.

After updating the export type, retry exporting the report.

---

# FAQ

## Does This Error Only Affect Journal Entry Exports?

Yes. The ONL939 error is specific to Journal Entry exports when tax rate changes create debit and credit imbalances.

## Do I Need to Reconnect QuickBooks Online?

No. Changing the export type to Vendor Bill and retrying the export typically resolves the issue.
