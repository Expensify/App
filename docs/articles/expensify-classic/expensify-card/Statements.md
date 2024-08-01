---
title: — Expensify Card Statements and Settlements
description: Understand how to access your Expensify Card Statement
---

## Expensify Card Statements
Expensify offers several settlement types and a detailed statement of transactions and settlements.

### Accessing the Statement
- If your domain uses the Expensify Card and you have a validated Business Bank Account, access the statement at _**Settings > Domains > Company Cards > Reconciliation Tab > Settlements**_.
- The statement shows individual transactions (debits) and their corresponding settlements (credits).

### Key Information in the Statement
- **Date:** Debit date for card payments; purchase date for transactions.
- **Entry ID:** Unique ID grouping card payments and transactions.
- **Withdrawn Amount:** Amount debited from the Business Bank Account for card payments.
- **Transaction Amount:** Expense purchase amount for card transactions.
- **User Email:** Cardholder’s Expensify email address.
- **Transaction ID:** Unique ID for locating transactions and assisting support.

![Expanded card settlement that shows the various items that make up each card settlement.](https://help.expensify.com/assets/images/ExpensifyHelp_SettlementExpanded.png){:width="100%"}

**Note:** The statement only includes payments from existing Business Bank Accounts under **Settings > Account > Payments > Business Accounts**. Deleted accounts' payments won't appear.

## Exporting Statements
1. Log in to the web app and go to **Settings > Domains > Company Cards**.
2. Click the **Reconciliation** tab and select **Settlements**.
3. Enter the start and end dates for your statement.
4. Click **Search** to view the statement.
5. Click **Download** to export it as a CSV.

![Click the Download CSV button in the middle of the page to export your card settlements.](https://help.expensify.com/assets/images/ExpensifyHelp_SettlementExport.png){:width="100%"}

## Expensify Card Settlement Frequency
- **Daily Settlement:** Balance paid in full every business day with an itemized debit each day.
- **Monthly Settlement:** Balance settled monthly on a predetermined date with one itemized debit per month (available for Plaid-connected accounts with no recent negative balance).

## How Settlement Works
- Each business day or on your monthly settlement date, the total of posted transactions is calculated.
- The settlement amount is withdrawn from the Verified Business Bank Account linked to the primary domain admin, resetting your card balance to $0.
- To change your settlement frequency or bank account, go to _**Settings > Domains > [Domain Name] > Company Cards**_, click the **Settings** tab, and select the new options from the dropdown menu. Click **Save** to confirm.

![Change your card settlement account or settlement frequency via the dropdown menus in the middle of the screen.](https://help.expensify.com/assets/images/ExpensifyHelp_CardSettings.png){:width="100%"}


# FAQ

## Can you pay your balance early if you’ve reached your Domain Limit?
- For Monthly Settlement, use the “Settle Now” button to manually initiate settlement.
- For Daily Settlement, balances settle automatically with no additional action required.

## Will our domain limit change if our Verified Bank Account has a higher balance?
Domain limits may change based on cash balance, spending patterns, and history with Expensify. If your bank account is connected through Plaid, expect changes within 24 hours of transferring funds.

## How is the “Amount Owed” figure on the card list calculated?
It includes all pending and posted transactions since the last settlement date. The settlement amount withdrawn only includes posted transactions.

## How do I view all unsettled expenses?
1. Note the dates of expenses in your last settlement.
2. Go to the **Expenses** tab on the Reconciliation Dashboard.
3. Set the start date after the last settled expenses and the end date to today.
4. The **Imported Total** shows the outstanding amount, and you can click to view individual expenses.
