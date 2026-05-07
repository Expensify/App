---
title: NS0019 Export Error in NetSuite Integration
description: Learn how to fix the NS0019 export error in NetSuite when the payable account does not exist or a company card is mapped to Default Card.
keywords: NS0019, NetSuite payable account does not exist, company card default card error, map company card NetSuite account, journal entry export NetSuite, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0019 export error caused by missing or incorrect company card account mapping. Does not cover other NetSuite error codes.
---

# NS0019 Export Error in NetSuite Integration

If you see the error:

NS0019: The payable account doesn’t exist in NetSuite. Please ensure the company card is mapped to a valid NetSuite account and not set to 'Default Card'.

This means the company card used on the report is not mapped to a specific NetSuite account.

---

## Why the NS0019 Export Error Happens in NetSuite

The NS0019 error occurs when:

- Company card transactions are exported as **Journal Entries**.
- No specific export account is selected for the card.
- The card is set to **Default Card** instead of a mapped NetSuite account.
- The mapped NetSuite account no longer exists.

When exporting journal entries, NetSuite requires a valid payable or card account.

---

## How to Fix the NS0019 Export Error

### Step One: Confirm Expenses Are Company Card Transactions

1. Open the report in Expensify.
2. Confirm the affected expenses show the **Card + Lock** icon.
   - This indicates they are company card transactions and will follow card mapping rules.

---

### Step Two: Confirm Export Type for Non-Reimbursable Expenses

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Configure**.
6. Open the **Export** tab.
7. Confirm **Non-reimbursable expenses** are set to **Journal Entries**.

---

### Step Three: Map the Company Card to a Valid NetSuite Account

1. In Expensify, go to **Settings**.
2. Select **Domain**.
3. Click **Company Cards**.
4. Locate the card assigned to the report submitter.
5. Click **Edit export**.
6. In the dropdown, select the correct NetSuite card account.
   - Do not leave it set to **Default Card**.
7. Click **Save**.

---

### Step Four: Retry the Export

1. Open the report.
2. Retry exporting to NetSuite.

Once the company card is mapped to a valid NetSuite account, the export should complete successfully.

---

# FAQ

## Does NS0019 Only Affect Journal Entry Exports?

Yes. This error most commonly occurs when exporting non-reimbursable expenses as journal entries without a mapped card account.

## Does the Card + Lock Icon Matter?

Yes. Only expenses with the **Card + Lock** icon follow company card export mapping rules.
