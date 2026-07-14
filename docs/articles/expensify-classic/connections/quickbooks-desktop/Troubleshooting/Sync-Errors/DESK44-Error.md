---
title: DESK44 Error in QuickBooks Desktop Web Connector
description: Learn how to fix the DESK44 error in QuickBooks Desktop when no export account is selected for the chosen export type.
keywords: DESK44, QuickBooks Desktop no export account selected, export account missing, Chart of Accounts account type required, change export type Expensify, Expensify QuickBooks Desktop export error, Workspace Admin
internalScope: Audience is Workspace Admins using QuickBooks Desktop integration with Web Connector. Covers fixing the DESK44 error caused by missing or incorrect export account types. Does not cover QuickBooks Online errors.
---

# DESK44 Error in QuickBooks Desktop Web Connector

If you see the error:

DESK44: No export account selected in QuickBooks Desktop configurations. Please create the appropriate account in QuickBooks or choose a different export option.

This means the selected export type in Expensify does not have a compatible account type available in the QuickBooks Desktop Chart of Accounts.

---

## Why the DESK44 Error Happens in QuickBooks Desktop

The DESK44 error occurs when:

- The selected export type requires a specific account type.
- That account type does not exist in QuickBooks Desktop.
- The Workspace export configuration does not have a valid account selected.

Each export type in Expensify requires a compatible QuickBooks Desktop account type.

---

## Option One: Create the Required Account Type in QuickBooks Desktop

Log in to QuickBooks Desktop and create the appropriate account type in the **Chart of Accounts**, based on your selected export option.

### Required Account Types by Export Option

- **Vendor Bills** must export to an **Accounts Payable** account.
- **Journal Entries** must export to:
  - Accounts Payable
  - Other Current Assets
  - Other Current Liabilities  
  - Note: Journal Entries can only export to Other Current Liabilities if the report creator is set up as an employee in QuickBooks Desktop, not a vendor.
- **Checks** must export to a **Bank** account.
- **Invoices** must export to an **Accounts Receivable** account.
- **Credit Card transactions** must export to a **Credit Card** account.

After creating the correct account type:

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync now**.
6. Reconfigure the export account if needed.
7. Retry the export.

---

## Option Two: Change the Export Type in Expensify

If you do not want to create a new account in QuickBooks Desktop, you can change the export type.

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Configure**.
6. Open the **Export** tab.
7. Change the export type for reimbursable or non-reimbursable expenses.
8. Click **Save**.

After updating the export configuration, retry the export.

---

# FAQ

## Does This Error Mean My QuickBooks Desktop Connection Is Broken?

No. This error typically means a required account type is missing in the Chart of Accounts.

## Can I Use Any Account Type for Any Export Option?

No. Each export type requires a specific QuickBooks Desktop account type. If the account type does not match the export method, the export will fail.
