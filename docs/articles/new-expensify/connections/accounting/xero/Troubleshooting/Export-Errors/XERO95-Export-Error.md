---
title: XERO95 Export Error in Xero Integration
description: Learn what the XERO95 export error means and how to correct mismatched tax codes and categories in Xero before exporting from New Expensify.
keywords: XERO95, Xero tax type cannot be used with account, invalid tax code category Xero, invoice category expense tax mismatch, Expensify Xero export error, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration in New Expensify. Covers resolving the XERO95 export error related to mismatched tax types and account categories in Xero. Does not cover authentication or chart of accounts sync issues.
---

# XERO95 Export Error in Xero Integration

If you see the error:

XERO95 Export Error: The TaxType [XXXX] cannot be used with account [YYYY]. Please select a new category and attempt to export again.

This means the selected tax code is not compatible with the chosen account in Xero.

This typically happens when an expense tax code is applied to an invoice-related account, or when the account type and tax type do not match.

---

## Why the XERO95 Export Error Happens in Xero

The XERO95 error typically occurs when:

- An expense is categorized under an account that is not configured for expense claims.
- A tax code intended for expense accounts is applied to an invoice-related or revenue account.
- The selected account type in Xero does not support the chosen TaxType.
- The account does not have **Show in Expense Claims** enabled.

In Xero, certain tax types can only be used with specific account types. If there is a mismatch, the export fails.

This is a tax and account configuration issue, not a connection issue.

---

# How to Fix the XERO95 Export Error

Follow the steps below to align the tax code and account type.

---

## Review Categories and Tax Codes on the Report

1. Open the report that failed to export.
2. Review each expense.
3. Identify any expenses using invoice-related, revenue, or incorrect account categories.
4. Check the selected tax code for each expense.

---

## Select a Valid Expense Category

1. Edit the affected expense.
2. Select a category that:
   - Is set to **Expense** type in Xero.
   - Has **Show in Expense Claims** enabled.
   - Supports the selected tax code.
3. Click **Save**.

If needed, confirm the account configuration in Xero:

1. Log in to Xero.
2. Go to **Settings > Chart of Accounts**.
3. Locate the account.
4. Confirm it is set to **Expense** type and enabled for expense claims.
5. Click **Save**.

---

## Run Sync in the Workspace

If changes were made in Xero:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot icon next to the Xero connection.
5. Click **Sync now**.

---

## Retry the Export

1. Open the report.
2. Retry exporting to Xero.

If the tax code and account type are compatible, the export should complete successfully.

---

# FAQ

## Does the XERO95 Error Relate to Tax Settings in Xero?

Yes. It occurs when a tax type is not valid for the selected account category.

## Do I Need to Change the Tax Code in Xero?

Usually, updating the category in the Workspace resolves the issue. If the problem persists, review both the account type and tax configuration in Xero.
