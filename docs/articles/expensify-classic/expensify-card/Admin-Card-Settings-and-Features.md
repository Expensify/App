---
title: Admin Card Settings and Features
description: A deep dive into the available controls and settings for the Expensify Card.
---

# Expensify Visa® Commercial Card Overview
The Expensify Visa® Commercial Card includes various settings to help admins manage expenses and card usage efficiently.

## Set and Manage Smart Limits
Smart Limits allow you to control spending for each Expensify cardholder or set default limits for groups. Enabling a Smart Limit activates an Expensify Card and issues a virtual card for immediate use.

### Set Limits for Individual Cardholders
As a Domain Admin, you can set or edit Custom Smart Limits:
1. Go to **Settings > Domains > [Domain Name] > Company Cards**.
2. Click **Edit Limit** and enter the desired amount.

- The limit controls how much unapproved spending a cardholder can accumulate.
- Once the limit is reached, the cardholder must submit expenses for approval before making new transactions.
- Setting a Smart Limit of $0 disables the card.

### Set Default Group Limits
To set or update default Smart Limits for a domain group:
1. Go to **Settings > Domains > [Domain Name] > Groups**.
2. Click the in-line limit for your chosen group and adjust the value.

This applies to all group members who do not have an individual limit.

### Refreshing Smart Limits
To enable further spending, approve pending expenses:
1. Go to **Reconciliation**, enter a date range, and click **Run**.
2. Click the **Unapproved Total** to review pending expenses.
3. Approve expenses or add them to a report.

You can also increase a Smart Limit at any time by clicking **Edit Limit**.

---

## Check and Adjust Your Domain Limit
Ensure your Domain Limit is accurate by following these steps:

1. **Connect Your Bank Account:** Go to **Settings > Account > Payments > Add Verified Bank Account** and connect via Plaid.
2. **Request a Custom Limit:** If Plaid does not support your bank, request a limit increase at **Settings > Domains > [Domain Name] > Company Cards > Request Limit Increase**.
   - You’ll need to upload three months of unredacted bank statements.

### Factors Affecting Your Domain Limit
Your Domain Limit may change due to:
- **Available Funds:** Expensify monitors balances via Plaid. A sudden drop in funds within 24 hours can lower your limit.
- **Pending Expenses:** Large pending transactions reduce your available balance.
- **Processing Settlements:** Settlements take about three business days, dynamically adjusting your Domain Limit.

**Note:** If your Domain Limit is $0, cardholders cannot make purchases.

---

## Reconcile Expenses and Settlements
### Reconcile Expenses
1. Go to **Settings > Domains > [Domain Name] > Company Cards > Reconciliation > Expenses**.
2. Enter start and end dates, then click **Run**.
3. Review the **Imported Total**, which shows all Expensify Card transactions for the period.
4. Click totals to view associated expenses.

### Reconcile Settlements
1. Log into Expensify.
2. Click **Settings > Domains > [Domain Name] > Company Cards > Reconciliation > Settlements**.
3. Use **Search** to generate a statement for a specific period.
4. Click **Download CSV** to review settlement details, including:
   - **Date & Posted Date**
   - **Entry ID & Transaction ID**
   - **Amount & Merchant**
   - **Cardholder & Business Account**
5. To reconcile pre-authorizations, use the **Transaction ID** column in the CSV file.

---

## Manage Settlement Settings
### Set a Preferred Workspace
Create a dedicated workspace for card expenses and use **Scheduled Submit** to automatically add expenses to reports.

### Change the Settlement Account
1. Go to **Settings > Domains > [Domain Name] > Company Cards > Settings**.
2. Select a new verified business bank account from the **Settlement Account** dropdown.
3. Click **Save**.

### Change the Settlement Frequency
By default, settlements occur daily. You can switch to monthly settlements if needed.

#### Monthly Settlement Requirements:
- The account must not have had a negative balance in the last 90 days.
- An initial settlement will process any outstanding spending before switching.
- The settlement date will be the day you switch moving forward.

#### Steps to Change the Settlement Frequency:
1. Go to **Settings > Domains > [Domain Name] > Company Cards > Settings**.
2. Click **Settlement Frequency** and select **Monthly**.
3. Click **Save**.

---

## Declined Expensify Card Transactions
Enable **Receive real-time alerts** to get notified about declined transactions:
1. Open the mobile app.
2. Tap the menu icon (**≡**) and go to **Settings**.
3. Toggle **Receive real-time alerts** on.

### Common Reasons for Declines
#### Insufficient Card Limit
The transaction exceeds the card's limit. Check your balance under **Settings > Account > Credit Card Import**.

#### Card Not Activated or Canceled
Ensure the card is active.

#### Incorrect Card Information
Mistyped CVC, ZIP, or expiration date will result in a decline.

#### Suspicious Activity
Expensify may block flagged transactions.

#### Merchant in a Restricted Country
Transactions from restricted countries will be declined.

---

# FAQ

## Who can access the Reconciliation tab?
Only **Domain Admins** can access the Reconciliation tool.

## Who can view and process company card transactions?
- **Domain Admins** can view all company card transactions, including unreported ones, via the Reconciliation tool.
- **Workspace Admins** can only view reported expenses in a workspace. If they lack domain access, they cannot see transactions that haven’t been added to a report.

## What do I do if company card expenses are missing?
1. Use the **Reconciliation** tool to locate the missing expense:
   - Select the date range for the expense.
   - View the specific card to check the data.
2. If the expense isn’t listed, click **Update** next to the card under the **Card List** tab to pull in missing transactions.
3. If the expense still doesn’t appear, contact Concierge with these details:
   - Merchant name
   - Date
   - Amount
   - Last four digits of the card number

**Note:** Only posted transactions will be imported.

---

**Still have questions?** Reach out to Concierge for further assistance.
