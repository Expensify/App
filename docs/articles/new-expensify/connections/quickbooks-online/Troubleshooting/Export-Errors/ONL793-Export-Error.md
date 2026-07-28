---
title: ONL793 Export Error in QuickBooks Online
description: Learn how to fix the ONL793 export error in QuickBooks Online when billable expenses are not coded to an appropriate account type.
keywords: ONL793, QuickBooks Online billable expenses error, billable account type error, expense account type mismatch, cost of goods sold account, Expensify QuickBooks Online export error, Workspace Admin, accounting export error
internalScope: Audience is Workspace Admins using QuickBooks Online integration. Covers fixing the ONL793 export error caused by incorrect account types on billable expenses. Does not cover other export error codes.
---

# ONL793 Export Error in QuickBooks Online

If you see the error:

ONL793: Billable expenses not coded with appropriate account type.

This means one or more billable expenses on the report are not categorized to a supported account type in QuickBooks Online.

---

## Why the ONL793 Export Error Happens in QuickBooks Online

The ONL793 error occurs when expenses are marked as billable but are not categorized under one of the following account types:

- Expense
- Other Expense
- Other Current Liabilities
- Other Current Assets
- Other Assets
- Fixed Assets
- Cost of Goods Sold

QuickBooks Online only allows billable expenses to post to specific account types. If an expense is categorized to an unsupported account type, the export will fail.

---

## How to Confirm Billable Expenses Use the Correct Account Type

1. Open the report in Expensify.
2. Review each expense marked as billable.
3. Confirm the category used maps to one of the supported account types in QuickBooks Online.
4. Update the category if needed.
5. Save the changes.

After confirming all billable expenses use a supported account type, retry exporting the report.

---

## What to Do If Categories Are Correct

If:

- All billable expenses are categorized correctly, or
- There are no billable expenses on the report,

The error may be related to a temporary QuickBooks Online issue.

1. Wait a few minutes and retry the export.
2. Check the QuickBooks Online status page to confirm there are no active outages.
3. Retry exporting the report once the system is fully operational.

---

# FAQ

## Do Non-Billable Expenses Need to Use These Account Types?

No. The account type restriction applies only to billable expenses.

## Can an Incorrect Account Type Cause the Entire Report to Fail?

Yes. If even one billable expense is categorized to an unsupported account type, the export will fail with the ONL793 error.
