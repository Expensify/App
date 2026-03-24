---
title: ONL793 Export Error in QuickBooks Online Integration
description: Learn what the ONL793 export error means in QuickBooks Online and how to correct account type mappings for billable expenses.
keywords: ONL793, QuickBooks Online export error, billable expenses account type error, QuickBooks account type requirement billable, unsupported account type QuickBooks, Expensify QuickBooks Online integration, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers resolving the ONL793 export error caused by unsupported account types for billable expenses. Does not cover other QuickBooks Online error codes.
---

# ONL793 Export Error in QuickBooks Online Integration

If you see the error:

ONL793: Billable expenses not coded with appropriate account type.

This means one or more billable expenses are categorized to an account type that QuickBooks Online does not support for billable transactions, preventing the export from completing.

---

## Why the ONL793 Export Error Happens in QuickBooks Online

The ONL793 error typically indicates:

- An expense is marked as **Billable**.
- The selected category maps to an unsupported account type in QuickBooks Online.
- QuickBooks validation failed due to account type restrictions.

QuickBooks Online supports billable transactions only for specific account types, including:

- Expense  
- Other Expense  
- Other Current Liabilities  
- Other Current Assets  
- Other Assets  
- Fixed Assets  
- Cost of Goods Sold  

If a billable expense is mapped to a different account type, the export fails.

This is a QuickBooks Online account type restriction, not a Workspace configuration issue.

---

## How to Fix the ONL793 Export Error

This issue can be resolved by reviewing billable expenses and updating categories.

### Confirm Billable Expenses on the Report

1. Open the affected report.
2. Review all expenses.
3. Confirm which expenses are marked as **Billable**.

If no expenses are marked as billable, the error may be temporary.

### Confirm the Account Type Is Supported

For each billable expense:

1. Review the selected category.
2. Confirm the QuickBooks Online account type for that category is one of the supported account types listed above.
3. If the account type is not supported, recategorize the expense to a valid account.
4. Save your changes.

After updating categories, retry exporting the report.

---

## If the Error Persists

If all billable expenses are categorized correctly, the issue may be related to a temporary QuickBooks Online outage.

1. Check the QuickBooks Online status page.
2. Wait until the system is fully operational.
3. Retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After correcting account types or confirming QuickBooks is fully operational, retry the export.

## Does ONL793 Mean Billable Is Disabled?

No. It means the selected account type is not supported for billable transactions.

## Do I Need to Reconnect QuickBooks Online?

No. Updating the category account type or retrying after a temporary issue is typically sufficient.
