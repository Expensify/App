---
title: ONL913 Export Error in QuickBooks Online
description: Learn how to fix the ONL913 export error in QuickBooks Online when a category or export account uses an invalid account type.
keywords: ONL913, QuickBooks Online invalid account type, export account error, category invalid account type, Chart of Accounts account type requirements, Expensify QuickBooks Online export error, Workspace Admin, accounting export error
internalScope: Audience is Workspace Admins using QuickBooks Online integration. Covers fixing the ONL913 export error caused by invalid account types in QuickBooks Online. Does not cover other export error codes.
---

# ONL913 Export Error in QuickBooks Online

If you see the error:

ONL913: Invalid account type. Please select a new category or export account for QuickBooks Online.

This means the category or export account selected in Expensify is not a supported account type for the chosen export method in QuickBooks Online.

---

## Why the ONL913 Export Error Happens in QuickBooks Online

The ONL913 error occurs when:

- The category used on the report is tied to an unsupported account type.
- The export account selected in Workspace settings is not valid for the chosen export type.
- The account is active but does not meet QuickBooks Online requirements for that export method.

Expensify imports only specific QuickBooks Online account types for certain export options.

---

## How to Confirm the Account Type in QuickBooks Online

1. Log in to QuickBooks Online.
2. Go to **Accounting** > **Chart of Accounts**.
3. Locate the category or export account used in Expensify.
4. Confirm the account is active.
5. Confirm the account type and detail type are supported for your selected export method.

If the account type is not supported, select a different account in Expensify or create a new account in QuickBooks Online with the correct type.

---

## Supported QuickBooks Online Account Types in Expensify

Below is a breakdown of how account types are imported and used in Expensify.

### Other Current Assets
- All detail types import as categories or Journal Entry export options

### Bank
- All detail types import as debit card and check export options

### Fixed Assets
- All detail types import as categories

### Other Assets
- Do not import

### Accounts Receivable
- All detail types import as invoice export options

### Accounts Payable
- Used for Vendor Bill or Journal Entry export options

### Credit Card
- Used for credit card export options

### Other Current Liabilities
- All detail types import as Journal Entry export options if the report creator is set up as an employee in QuickBooks Online

### Long-Term Liabilities
- Do not import

### Accumulated Adjustment
- Do not import

### Equity
- Do not import

### Income
- Do not import

### Other Income
- Do not import

### Other Expense
- All detail types except **Exchange Gain or Loss** import as categories
- **Exchange Gain or Loss** does not import

If the account type used on the report does not align with these rules, the export will fail.

---

## How to Fix the ONL913 Export Error

1. Confirm the account type in QuickBooks Online.
2. If unsupported, create a new account with a supported type.
3. In Expensify, open the report and update the category or export account.
4. Save your changes.
5. Retry exporting the report.

You can also update the export account configuration:

### On Web

1. Go to the **Workspaces** navigation tab on the left.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Export**.
5. Select a valid export account based on the supported account types.
6. Click **Save**.

### On Mobile

1. Tap the **Workspaces** navigation tab on the bottom.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Export**.
5. Select a valid export account based on the supported account types.
6. Tap **Save**.

After updating the account type or export configuration, retry exporting the report.

---

# FAQ

## Does ONL913 Mean the Account Is Deleted?

Not necessarily. The account may still be active but is an unsupported type for the selected export method.

## Can I Use Income Accounts as Categories?

No. Income and Other Income account types do not import into Expensify as categories and cannot be used for expense exports.
