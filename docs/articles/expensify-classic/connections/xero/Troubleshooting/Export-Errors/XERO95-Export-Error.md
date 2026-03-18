---
title: XERO95 Export Error in Xero Integration
description: Learn what the XERO95 export error means and how to correct mismatched tax codes and account categories in Xero before exporting.
keywords: XERO95, Xero tax type cannot be used with account, invalid tax code category Xero, invoice category expense tax mismatch, Expensify Xero export error, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration. Covers resolving the XERO95 export error caused by mismatched tax types and account categories in Xero. Does not cover authentication or chart of accounts sync issues.
---

# XERO95 Export Error in Xero Integration

If you see the error:

XERO95 Export Error: The TaxType [XXXX] cannot be used with account [YYYY]. Please select a new category and attempt to export again.

This means the selected tax code is not compatible with the chosen account in Xero.

This typically happens when an expense tax code is applied to an invoice-related account, or when the tax type does not match the account configuration.

---

## Why the XERO95 Export Error Happens in Xero

The XERO95 error typically indicates:

- An expense is categorized under an account intended for invoices or a different transaction type.
- A tax code is applied that is not valid for that account type.
- Xero validation failed due to a mismatch between the selected **TaxType** and the account configuration.

In Xero, certain tax types can only be used with specific account types. If there is a mismatch, the export fails.

This is a tax and account configuration mismatch, not an authentication or chart of accounts sync issue.

---

## How to Fix the XERO95 Export Error

Follow the steps below to correct the category or tax mismatch.

### Review the Categories on the Report

1. Open the report in the Workspace.
2. Review each expense.
3. Identify any expenses categorized under invoice-related or incorrect account types.

### Select a Valid Category

1. For affected expenses, select a new category that:
   - Is appropriate for expense claims.
   - Matches the correct account type in Xero.
2. Click **Save**.

The selected category must be compatible with the applied tax type.

### Sync the Workspace (If Needed)

If the error continues:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

### Retry the Export

1. Open the report.
2. Retry exporting to Xero.

If the tax type and account category are compatible, the export should complete successfully.

---

# FAQ

## Does This Error Relate to Tax Settings in Xero?

Yes. It occurs when a tax type is not valid for the selected account category in Xero.

## Do I Need to Change the Tax Code in Xero?

Usually, updating the category in the Workspace resolves the issue. If the problem persists, review the account and tax configuration in Xero.

## Does This Affect All Expenses on the Report?

Only expenses using an incompatible category and tax combination will trigger the error.
