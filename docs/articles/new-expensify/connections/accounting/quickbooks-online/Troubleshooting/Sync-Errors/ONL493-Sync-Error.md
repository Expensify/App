---
title: ONL493 Sync Error in QuickBooks Online
description: Learn how to fix the ONL493 sync error in QuickBooks Online when no export account is selected for the chosen export type.
keywords: ONL493, QuickBooks Online no export account selected, export account missing, Chart of Accounts account type required, change export type Expensify, Expensify QuickBooks Online sync error, Workspace Admin, accounting sync error
internalScope: Audience is Workspace Admins using QuickBooks Online integration. Covers fixing the ONL493 sync error caused by missing or incorrect export account types. Does not cover other sync or export error codes.
---

# ONL493 Sync Error in QuickBooks Online

If you see the error:

ONL493: No export account selected in QuickBooks Online settings. Please create the appropriate account in QuickBooks or choose a different export option.

This means the selected export type in Expensify does not have a compatible account type available in the QuickBooks Online Chart of Accounts.

---

## Why the ONL493 Sync Error Happens in QuickBooks Online

The ONL493 error occurs when:

- The selected export type requires a specific account type.
- That account type does not exist in the QuickBooks Online Chart of Accounts.
- The Workspace export configuration does not have a valid account selected.

Each export type in Expensify requires a compatible QuickBooks Online account type.

---

## Option One: Create the Required Account Type in QuickBooks Online

Log in to QuickBooks Online and create the appropriate account type in the **Chart of Accounts**, based on your selected export option.

### Required Account Types by Export Option

- **Vendor Bills** must export to an **Accounts Payable** account.
- **Journal Entries** must export to:
  - Accounts Payable
  - Other Current Assets
  - Other Current Liabilities  
  - Note: Journal Entries can only export to Other Current Liabilities if the report creator is set up as an employee in QuickBooks Online, not a vendor.
- **Checks** must export to a **Bank** account.
- **Invoices** must export to an **Accounts Receivable** account.
- **Debit Card transactions** must export to a **Bank** account.
- **Credit Card transactions** must export to a **Credit Card** account.

After creating the correct account type:

1. Return to Expensify.
2. Go to the **Workspaces** navigation tab.
3. Select your Workspace.
4. Click **Accounting**.
5. Click the **three-dot icon** next to the QuickBooks Online connection.
6. Select **Sync now**.
7. Reconfigure the export account if needed.
8. Retry the export.

---

## Option Two: Change the Export Type in Expensify

If you do not want to create a new account in QuickBooks Online, you can change the export type.

### On Web

1. Go to the **Workspaces** navigation tab on the left.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Export**.
5. Select a different export type that matches an existing account in QuickBooks Online.
6. Click **Save**.

### On Mobile

1. Tap the **Workspaces** navigation tab on the bottom.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Export**.
5. Select a different export type that matches an existing account.
6. Tap **Save**.

After updating the export configuration, retry the export.

---

# FAQ

## Does This Error Mean My QuickBooks Online Connection Is Broken?

No. This error typically means a required account type is missing in the Chart of Accounts.

## Can I Use Any Account Type for Any Export Option?

No. Each export type requires a specific QuickBooks Online account type. If the account type does not match the export method, the sync or export will fail.
