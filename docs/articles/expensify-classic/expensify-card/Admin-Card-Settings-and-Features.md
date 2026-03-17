---
title: Admin Card Settings and Features
description: Learn how to manage Expensify Card settings, set Smart Limits, reconcile expenses, and troubleshoot transaction issues.
keywords: [Expensify Classic, Expensify Card, Smart Limits, reconciliation, declined transactions, settlement settings]
---

The Expensify Visa® Commercial Card offers various settings to help **Domain Admins** manage company spending effectively.

---

# Set and Manage Smart Limits
Smart Limits control spending for individual **Expensify Card** holders or groups. Enabling a Smart Limit activates a card and issues a **virtual Expensify Card** for immediate use.

## Set Limits for Individual Cardholders
As a **Domain Admin**, set or edit Custom Smart Limits:
1. Navigate to **Settings > Domains > [Domain Name] > Company Cards**.
2. Click **Edit Limit**, enter the amount, and save.

- The limit determines how much spending a cardholder can accumulate.
- When the limit is reached, expenses must be submitted for approval before further transactions.
- Setting a Smart Limit to $0 disables the card.

## Set Default Group Limits
To set or update default Smart Limits for a group:
1. Go to **Settings > Domains > [Domain Name] > Groups**.
2. Click the in-line limit for the group and adjust the value.

This applies to all group members who do not have a Custom Smart Limit.

## Refreshing Smart Limits
To enable further spending, approve pending expenses:
1. Go to **Reconciliation**, select a date range, and click **Run**.
2. Click **Unapproved Total** to review pending expenses.
3. Approve expenses or add them to a report.

You can also increase a Smart Limit anytime by clicking **Edit Limit**.

---

# Check and Adjust Your Domain Limit

Ensure your **Domain Limit** is accurate:
1. **Connect a Bank Account:** Go to **Settings > Account > Payments > Add Verified Bank Account** and connect via Plaid.
2. **Request a Custom Limit:** If your bank is not supported by Plaid:
   - Navigate to **Settings > Domains > [Domain Name] > Company Cards > Request Limit Increase**.
   - Upload three months of unredacted bank statements.

## Factors Affecting Your Domain Limit
- **Available Funds:** Expensify monitors balances via Plaid. A sudden drop in funds may lower your limit.
- **Pending Expenses:** Large pending transactions reduce available funds.
- **Processing Settlements:** Settlements take about three business days, dynamically adjusting your Domain Limit.

**Note:** If your Domain Limit is $0, cardholders cannot make purchases.

---

# Reconcile Expenses and Settlements

## Reconcile Expenses
1. Go to **Settings > Domains > [Domain Name] > Company Cards > Reconciliation > Expenses**.
2. Select a date range and click **Run**.
3. Review the **Imported Total**, displaying all Expensify Card transactions for the period.
4. Click totals to view associated expenses.

## Reconcile Settlements
1. Navigate to **Settings > Domains > [Domain Name] > Company Cards > Reconciliation > Settlements**.
2. Use **Search** to generate a statement for a specific period.
3. Click **Download CSV** to review settlement details, including:
   - **Date & Posted Date**
   - **Entry ID & Transaction ID**
   - **Amount & Merchant**
   - **Cardholder & Business Account**
4. To reconcile pre-authorizations, use the **Transaction ID** column in the CSV file.

---

# Manage Settlement Settings

## Set a Preferred Workspace
Create a dedicated workspace for card expenses and enable **Scheduled Submit** to automatically add expenses to reports.

## Change the Settlement Account
1. Go to **Settings > Domains > [Domain Name] > Company Cards > Settings**.
2. Select a new verified business bank account from the **Settlement Account** dropdown.
3. Click **Save**.

## Change the Settlement Frequency
Settlements occur **daily** by default but can be switched to **monthly** if needed.

**Monthly Settlement Requirements:**
- No negative balance in the last **90 days**.
- An initial settlement will process outstanding spending before switching.
- The settlement date will be the day you switch moving forward.

**Steps to Change Settlement Frequency:**
1. Navigate to **Settings > Domains > [Domain Name] > Company Cards > Settings**.
2. Click **Settlement Frequency** and select **Monthly**.
3. Click **Save**.

---

# Declined Expensify Card Transactions

## Enable real-time alerts to understand declined transactions:
1. Open the **Expensify mobile app**.
2. Tap the menu icon (**≡**) and go to **Settings**.
3. Toggle **Receive real-time alerts** on.

## Common Reasons for Declines
- **Insufficient Card Limit:** The transaction exceeded the card's Smart Limit.
  - Employees can check the balance of their Expensify Card under **Settings > Account > Wallet**.
  - Domain Admins can review employee Smart Limits under **Settings > Domains > Company Cards**.
  - Domain Admins can view the total Expensify Card available limit under **Settings > Domains > Company Cards**.
- **Card Not Activated or Canceled:** Ensure the card is active under **Settings > Account > Wallet**.
- **Incorrect Card Information:** Mistyped CVC, ZIP code, or expiration date will result in a decline.
- **Suspicious Activity:** Expensify may block flagged transactions.
- **Merchants in a Restricted Country:** Transactions from restricted countries will be declined.

---

# FAQ

## Who can access the Reconciliation tab?
Only **Domain Admins** can access the **Reconciliation** tool.

## Who can view and process company card transactions?
- **Domain Admins** can view all company card transactions, including unreported ones, via **Reconciliation**.
- **Workspace Admins** can only view reported expenses in a workspace. If they lack domain access, they cannot see transactions that haven’t been added to a report.

## What do I do if company card expenses are missing?
1. Use **Reconciliation** to locate missing expenses:
   - Select the correct date range.
   - Check the specific card’s transactions.
2. If the expense isn’t listed, click **Update** next to the card under **Card List** to pull in missing transactions.
3. If the expense is still missing, contact **Concierge** with:
   - **Merchant name**
   - **Date**
   - **Amount**
   - **Last four digits of the card number**

**Note:** Only posted transactions will be imported.

