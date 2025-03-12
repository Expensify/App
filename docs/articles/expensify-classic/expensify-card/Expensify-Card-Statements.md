---
title: Expensify Card Statements
description: Learn how to access and manage your Expensify Card statements and settlements.
---

The Expensify Card provides detailed statements that help you track transactions and settlements with ease. This guide explains how to access, export, and manage your statements while understanding key details like settlement frequency and outstanding balances.

# Accessing Your Statement
To view your Expensify Card statement:
1. Ensure your domain uses the Expensify Card and has a validated Business Bank Account.
2. Navigate to **Settings > Domains > [Your Domain Name] > Company Cards**.
3. Click the **Reconciliation** tab and select **Settlements**.
4. Your statement will display:
   - **Transactions (Debits)**: Individual card purchases (transactions may take up to 1-2 business days to appear).
   - **Settlements (Credits)**: Payments made to cover transactions.

---

# Key Information in the Statement
Each statement includes the following details:
- **Date**: The posted date of each transaction and payment.
- **Entry ID**: A unique identifier grouping payments and transactions.
- **Withdrawn Amount**: The total debited from your Business Bank Account.
- **Transaction Amount**: The purchase amount for each transaction.
- **User Email**: The email address of the cardholder.
- **Transaction ID**: A unique identifier for each transaction.

![Expanded card settlement that shows the various items that make up each card settlement.](https://help.expensify.com/assets/images/ExpensifyHelp_SettlementExpanded.png){:width="100%"}

**Note:** Statements only include payments from active Business Bank Accounts under **Settings > Account > Payments > Business Accounts**. Payments from deleted accounts will not appear.

---
# Exporting Statements
To download a statement:
1. Log in to Expensify.
2. Go to **Settings > Domains > Company Cards**.
3. Click the **Reconciliation** tab and select **Settlements**.
4. Enter the start and end dates.
5. Click **Search** to view the statement.
6. Click **Download** to export it as a CSV file.

![Click the Download CSV button in the middle of the page to export your card settlements.](https://help.expensify.com/assets/images/ExpensifyHelp_SettlementExport.png){:width="100%"}

---
# Expensify Card Settlement Frequency
You can choose between two settlement options:
- **Daily Settlement**: Your balance is paid in full every business day.
- **Monthly Settlement**: Your balance is settled once per month on a predetermined date (available for Plaid-connected accounts with no recent negative balances).

**Updating Settlement Frequency:**
1. Go to **Settings > Domains > [Your Domain Name] > Company Cards**.
2. Click the **Settings** tab.
3. Select either **Daily** or **Monthly** from the dropdown menu.
4. Click **Save** to confirm.

**Note:** You cannot choose a specific settlement date beyond the available daily or monthly options.

---
# How Settlement Works
- On your scheduled settlement date, Expensify calculates the total of all posted transactions.
- The total settlement amount is withdrawn from your Verified Business Bank Account, resetting your card balance to $0.
- To change your settlement frequency or bank account:
  1. Go to **Settings > Domains > [Your Domain Name] > Company Cards**.
  2. Click the **Settings** tab.
  3. Select new options from the dropdown menu.
  4. Click **Save** to confirm.

![Change your card settlement account or settlement frequency via the dropdown menus in the middle of the screen.](https://help.expensify.com/assets/images/ExpensifyHelp_CardSettings.png){:width="100%"}

---
# FAQ

## Can I pay my balance early if I’ve reached my Domain Limit?
- **Monthly Settlement**: Click **Settle Now** to manually initiate payment.
- **Daily Settlement**: Balances settle automatically.

## Will our Domain Limit change if our Verified Bank Account balance increases?
Yes, your limit may adjust based on cash balance, spending patterns, and Expensify usage history. If your bank account is connected via Plaid, updates occur within 24 hours of a fund transfer.

## How is the "Amount Owed" on the card list calculated?
It includes all pending and posted transactions since the last settlement. Only posted transactions are included in the actual settlement withdrawal.

## How can I view unsettled expenses?
1. Check the date of your last settlement.
2. Go to **Settings > Domains > Company Cards > Reconciliation**.
3. Click the **Expenses** tab.
4. Set the start date to the day after the last settled expenses and the end date to today.
5. The **Imported Total** will display the outstanding amount, with a breakdown of individual expenses available.

For additional support, contact Concierge via Expensify.
