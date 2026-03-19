---
title: ONL493 Sync Error in QuickBooks Online Integration
description: Learn what the ONL493 sync error means in QuickBooks Online and how to create the correct account type or update export settings to restore successful syncing.
keywords: ONL493, QuickBooks Online sync error, no export account selected QuickBooks, QuickBooks Chart of Accounts configuration error, vendor bill export account QuickBooks, Expensify QuickBooks Online integration, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers resolving the ONL493 sync error caused by missing or incompatible QuickBooks account types. Does not cover other QuickBooks Online error codes.
---

# ONL493 Sync Error in QuickBooks Online Integration

If you see the error:

ONL493: No export account selected in QuickBooks Online settings.

This means the selected export type in Expensify does not have a compatible account type available in your QuickBooks Online Chart of Accounts, preventing syncing or exporting from completing.

---

## Why the ONL493 Sync Error Happens in QuickBooks Online

The ONL493 error typically indicates:

- The required account type for the selected export option does not exist.
- The Chart of Accounts does not contain a compatible account.
- QuickBooks validation failed due to missing account configuration.

Each export type in Expensify requires a specific account type in QuickBooks Online. If the required account type is missing, the export fails.

This is a QuickBooks Online Chart of Accounts configuration issue, not a Workspace configuration issue.

---

## How to Fix the ONL493 Sync Error

You can resolve this by creating the correct account type in QuickBooks Online or changing the export type.

---

### Create the Required Account Type in QuickBooks Online

Log in to QuickBooks Online and create the required account type in the **Chart of Accounts**, based on your selected export option:

- **Vendor Bills** → Requires an **Accounts Payable** account  
- **Journal Entries** → Requires:
  - Accounts Payable  
  - Other Current Assets, or  
  - Other Current Liabilities  
    - Note: You can only export to **Other Current Liabilities** if the report creator is set up as an **Employee**, not a Vendor  
- **Checks** → Requires a **Bank** account  
- **Invoices** → Requires an **Accounts Receivable** account  
- **Debit Card Transactions** → Requires a **Bank** account  
- **Credit Card Transactions** → Requires a **Credit Card** account  

After creating the appropriate account:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

---

### Change the Export Type in Expensify

If you prefer not to create a new account:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Export** tab.
6. Select a different export option that matches an existing QuickBooks account type.
7. Click **Save**.
8. Click **Sync Now**.

---

## How to Confirm ONL493 Is Resolved

1. Run **Sync Now**.
2. Retry exporting the affected report.
3. Confirm the export completes successfully.

---

# FAQ

## Can I Retry the Sync?

Yes. After creating the correct account type or updating the export settings, retry the sync or export.

## Does ONL493 Mean My QuickBooks Connection Is Broken?

No. The connection is active, but the required account type does not exist in the Chart of Accounts.

## Do I Need to Reconnect QuickBooks Online?

No. Creating the correct account type or adjusting export settings and running **Sync Now** is typically sufficient.
