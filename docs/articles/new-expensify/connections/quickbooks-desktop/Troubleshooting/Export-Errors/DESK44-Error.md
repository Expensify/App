---
title: DESK44 Error in QuickBooks Desktop Integration
description: Learn what the DESK44 error means and how to create or select the correct QuickBooks Desktop account type for your export configuration.
keywords: DESK44, no export account selected QuickBooks Desktop, export type account mismatch, QuickBooks Desktop chart of accounts error, Expensify QuickBooks Desktop export configuration, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Desktop integration. Covers resolving the DESK44 error related to missing or incompatible export account types. Does not cover connection or permissions errors.
---

# DESK44 Error in QuickBooks Desktop Integration

If you see the error:

DESK44 Error: No export account selected in QuickBooks Desktop configurations. Please create the appropriate account in QuickBooks or choose a different export option.

This means the selected export type in the Workspace does not have a compatible account type available in the QuickBooks Desktop **Chart of Accounts**.

QuickBooks requires specific account types depending on the export method selected.

---

## Why the DESK44 Error Happens in QuickBooks Desktop

The DESK44 error typically occurs when:

- The selected export type requires a specific account type.
- That account type does not exist in the QuickBooks Desktop Chart of Accounts.
- The account was deleted or made inactive.
- The export configuration does not match available QuickBooks account types.

Each export type requires a specific QuickBooks account type.

---

# How to Fix the DESK44 Error

You can either create the required account in QuickBooks Desktop or change the export type in the Workspace.

---

## Create the Required Account in QuickBooks Desktop

Open **QuickBooks Desktop** and go to the **Chart of Accounts**. Create the appropriate account type based on your export configuration:

- **Vendor Bills** must export to an **Accounts Payable** account.
- **Journal Entries** must export to:
  - **Accounts Payable**,  
  - **Other Current Assets**, or  
  - **Other Current Liabilities**.  
  - Journal Entries can only export to **Other Current Liabilities** if the report creator is set up as an employee in QuickBooks Desktop (not a vendor).
- **Checks** must export to a **Bank** account.
- **Invoices** must export to an **Accounts Receivable** account.
- **Credit Card transactions** must export to a **Credit Card** account.

After creating or activating the correct account:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot icon next to the QuickBooks Desktop connection.
5. Click **Sync now**.

Then retry the export.

---

## Change the Export Type in the Workspace

If you prefer not to create a new account:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Export**.
5. Change the export type for either **Reimbursable** or **Non-reimbursable** expenses.
6. Click **Save**.
7. Click **Sync now**.

Then retry the export.

---

# FAQ

## Does the DESK44 Error Mean the Integration Is Disconnected?

No. It means the selected export type does not have a compatible account type in QuickBooks Desktop.

## Do I Need Admin Access in QuickBooks Desktop?

Yes. Creating or modifying accounts in the Chart of Accounts requires appropriate permissions.

## Can I Use Any Account Type?

No. Each export type must match the correct QuickBooks account type listed above.
