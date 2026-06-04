---
title: ONL038 Export Error in QuickBooks Online Integration
description: Learn what the ONL038 export error means in QuickBooks Online and how to change the export type to resolve tax rounding issues.
keywords: ONL038, QuickBooks Online export error, tax calculation error QuickBooks, export as vendor bill QuickBooks, rounding issues tax QuickBooks Online, Expensify QuickBooks Online integration, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers resolving the ONL038 export error caused by tax rounding issues when exporting as a Journal Entry. Does not cover other QuickBooks Online error codes.
---

# ONL038 Export Error in QuickBooks Online Integration

If you see the error:

ONL038: Tax calculation error.

This means QuickBooks Online encountered rounding differences when tax was exported as a Journal Entry, preventing the export from completing.

---

## Why the ONL038 Export Error Happens in QuickBooks Online

The ONL038 error typically indicates:

- Tax amounts are being exported as a Journal Entry.
- QuickBooks Online applies different tax rounding rules.
- Rounding differences caused validation to fail.

When exporting tax as a Journal Entry, QuickBooks may calculate tax differently than Expensify. These rounding differences can trigger export errors.

Exporting as a Vendor Bill allows QuickBooks Online to handle tax calculations internally, reducing rounding conflicts.

This is a QuickBooks Online tax handling limitation, not a Workspace calculation issue.

---

## How to Fix the ONL038 Export Error

This issue can be resolved by changing the export type.

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Export** tab.
6. Under **Reimbursable expenses**, select **Vendor Bill**.
7. Click **Save**.

After updating the export type, retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After changing the export type to **Vendor Bill**, retry the export. If the error persists, confirm the updated setting was saved.

## Does ONL038 Mean Tax Is Calculated Incorrectly?

No. The issue relates to how QuickBooks Online applies tax rounding when exporting as a Journal Entry.

## Do I Need to Reconnect QuickBooks Online?

No. Updating the export type and retrying the export is typically sufficient.
