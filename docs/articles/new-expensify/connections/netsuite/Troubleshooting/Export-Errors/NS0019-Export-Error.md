---
title: NS0019 Export Error in NetSuite Integration
description: Learn what the NS0019 export error means and how to map company cards to a valid NetSuite account instead of Default Card.
keywords: NS0019, NetSuite payable account does not exist, Default Card export error, company card mapping NetSuite, journal entry export error, Expensify Domain Company Cards, Workspace Admin, Domain Admin
internalScope: Audience is Domain Admins and Workspace Admins using the NetSuite integration with company cards. Covers resolving the NS0019 export error caused by missing or invalid company card export mapping. Does not cover reimbursable report export issues.
---

# NS0019 Export Error in NetSuite Integration

If you see the error:

NS0019 Export Error: The payable account doesn’t exist in NetSuite. Please ensure the company card is mapped to a valid NetSuite account and not set to 'Default Card'.

This means the company card used on the report is not mapped to a valid NetSuite account.

This commonly occurs when exporting **company card transactions as journal entries** without selecting a specific NetSuite export account in Domain settings.

---

## Why the NS0019 Export Error Happens in NetSuite

The NS0019 error typically occurs when:

- Company card transactions are exported as **Journal entries**.
- The card is set to **Default Card** instead of a specific NetSuite account.
- No valid payable account is configured for the card in Domain settings.

When no valid payable account is selected, NetSuite cannot complete the export.

This is a company card export mapping issue, not a reimbursable report export issue.

---

## How to Fix the NS0019 Export Error

Follow the steps below to confirm proper mapping.

---

## Confirm the Expenses Are Company Card Transactions

1. Open the report.
2. Confirm the expenses display the **Card + Lock icon**.

The Card + Lock icon indicates the expense is tied to a company card and must be mapped to a valid NetSuite account.

---

## Confirm the Export Type for Non-Reimbursable Expenses

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Export**.
5. Confirm the export type for **non-reimbursable expenses** is set to **Journal entries**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Export**.
5. Confirm non-reimbursable expenses are set to **Journal entries**.

---

## Map the Company Card to a Valid NetSuite Account

1. Go to **Settings > Domains**.
2. Select your Domain.
3. Click **Company Cards**.
4. Locate the card assigned to the report creator or submitter.
5. Click **Edit Export**.
6. In the dropdown, select the appropriate NetSuite account.
7. Click **Save**.

Important: Do not leave the card set to **Default Card** when exporting as journal entries.

---

## Retry the Export

1. Open the report.
2. Retry exporting to NetSuite.

If the card is mapped to a valid NetSuite account, the export should complete successfully.

---

# FAQ

## Does the NS0019 Export Error Affect All Company Card Exports?

It affects company card transactions exported as journal entries when the card is not mapped to a valid NetSuite account.

## Do I Need Domain Admin Access to Fix the NS0019 Export Error?

Yes. Updating company card export mappings requires Domain Admin permissions.

## Does This Affect Reimbursable Reports?

No. This error applies to company card transactions, not reimbursable report exports.
