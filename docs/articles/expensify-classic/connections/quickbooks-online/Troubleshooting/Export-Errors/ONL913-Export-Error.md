---
title: ONL913 Export Error in QuickBooks Online Integration
description: Learn what the ONL913 export error means in QuickBooks Online and how to select a supported account type to restore successful exports.
keywords: ONL913, QuickBooks Online export error, invalid account type QuickBooks, unsupported account type QuickBooks, chart of accounts mapping error, Expensify QuickBooks Online integration, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers resolving the ONL913 export error caused by unsupported QuickBooks account types. Does not cover other QuickBooks Online error codes.
---

# ONL913 Export Error in QuickBooks Online Integration

If you see the error:

ONL913: Invalid account type.

This means the category or export account selected in Expensify is not a supported account type in QuickBooks Online, preventing the export from completing.

---

## Why the ONL913 Export Error Happens in QuickBooks Online

The ONL913 error typically indicates:

- The selected category is mapped to an unsupported QuickBooks account type.
- The export account in Workspace settings is not compatible with the chosen export method.
- QuickBooks validation failed due to account type restrictions.

QuickBooks Online only allows certain account types to be used for specific export options.

This is a Chart of Accounts configuration issue, not a connection issue.

---

## How to Fix the ONL913 Export Error

This issue can be resolved by selecting a supported account type.

### Confirm the Account Is Active

1. Log in to QuickBooks Online.
2. Open the **Chart of Accounts**.
3. Locate the category or export account used in the report.
4. Confirm the account is active.

If the account is inactive, reactivate it or choose a different active account.

---

### Confirm the Account Type Is Supported

Below are supported QuickBooks Online account types for expense exports:

**Supported Account Types**

- Other Current Assets  
- Bank  
- Fixed Assets  
- Accounts Receivable  
- Accounts Payable  
- Credit Card  
- Other Current Liabilities  
- Other Expense (excluding Exchange Gain or Loss)  

**Unsupported Account Types**

- Other Assets  
- Long-Term Liabilities  
- Accumulated Adjustment  
- Equity  
- Income  
- Other Income  

If the selected category or export account falls under an unsupported account type, choose a different account in QuickBooks Online.

---

### Update Export Settings in Expensify

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Export** tab.
6. Select a valid export account from the supported account types.
7. Click **Save**.

Then retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After selecting a supported account type and selecting **Sync Now**, retry the export.

## Does ONL913 Mean My QuickBooks Connection Is Broken?

No. It means the selected account type is not supported for the chosen export option.

## Can I Use Income or Equity Accounts for Expense Exports?

No. Income, Equity, and several other account types are not supported for expense exports.
