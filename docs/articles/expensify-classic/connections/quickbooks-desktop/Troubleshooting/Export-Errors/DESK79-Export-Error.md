---
title: DESK79 Export Error in QuickBooks Desktop Web Connector
description: Learn how to fix the DESK79 export error in QuickBooks Desktop when account currencies do not match the report currency.
keywords: DESK79, QuickBooks Desktop currency mismatch, account currency must match transaction currency, export account currency error, QuickBooks Desktop multi-currency error, Expensify QuickBooks Desktop export error, Workspace Admin
internalScope: Audience is Workspace Admins using QuickBooks Desktop integration with Web Connector. Covers resolving the DESK79 export error caused by currency mismatches between accounts and reports. Does not cover QuickBooks Online errors.
---

# DESK79 Export Error in QuickBooks Desktop Web Connector

If you see the error:

DESK79: The QuickBooks Desktop account currency must match either the home currency of the QuickBooks company file or the transaction currency as listed in Expensify.

This means the currency assigned to the category or export account in QuickBooks Desktop does not match the report or expense currency in Expensify.

---

## Why the DESK79 Export Error Happens in QuickBooks Desktop

The DESK79 error occurs when:

- The account used as the category has a different currency than the report.
- The export account currency does not match the report currency.
- The account currency does not match the QuickBooks Desktop company file home currency.
- Multi-currency is enabled and currencies are misaligned.

QuickBooks Desktop requires the account currency to match either:

- The company file’s home currency, or
- The transaction currency from Expensify.

If currencies do not align, the export will fail.

---

## How to Fix the DESK79 Export Error

### Step One: Confirm the Account Currency in QuickBooks Desktop

1. Open **QuickBooks Desktop**.
2. Go to **Lists** > **Chart of Accounts**.
3. Locate the category or export account used on the report.
4. Confirm the currency assigned to the account.
5. Ensure it matches:
   - The report currency in Expensify, or
   - The QuickBooks Desktop company file home currency.

If needed, update the account currency or create a new account with the correct currency.

---

### Step Two: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync now**.

This refreshes the account list and currency settings.

---

### Step Three: Retry the Export

1. Open the report in Expensify.
2. Confirm the correct category and export account are selected.
3. Retry exporting the report.

Once the account currency matches the report or home currency, the export should complete successfully.

---

# FAQ

## Does DESK79 Only Happen With Multi-Currency Enabled?

It most commonly occurs when multi-currency is enabled, but it can also happen if the account currency does not match the company home currency.

## Can I Change the Account Currency After Creation?

In some cases, QuickBooks Desktop does not allow changing the currency of an existing account. You may need to create a new account with the correct currency and update your export configuration.
