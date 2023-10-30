---
title: — Expensify Card Statements and Settlements
description: Learn how the Expensify Card statement and settlements work!
---

# Overview
Expensify offers several settlement types and a statement that provides a detailed view of transactions and settlements. We discuss specifics on both below.

# How to use Expensify Card Statement and Settlements
## Using the statement
If your domain uses the Expensify Card and you have a validated Business Bank Account, access the Expensify Card statement at Settings > Domains > Company Cards > Reconciliation Tab > Settlements.

The Expensify Card statement displays individual transactions (debits) and their corresponding settlements (credits). Each Expensify Cardholder has a Digital Card and a Physical Card, which are treated the same in settlement, reconciliation, and exporting to your accounting system.

Here's a breakdown of crucial information in the statement:
- **Date:** For card payments, it shows the debit date; for card transactions, it displays the purchase date.
- **Entry ID:** This unique ID groups card payments and transactions together.
- **Withdrawn Amount:** This applies to card payments, matching the debited amount from the Business Bank Account.
- **Transaction Amount:** This applies to card transactions, matching the expense purchase amount.
- **User email:** Applies to card transactions, indicating the cardholder's Expensify email address.
- **Transaction ID:** A unique ID for locating transactions and assisting Expensify Support in case of issues. Transaction IDs are handy for reconciling pre-authorizations. To find the original purchase, locate the Transaction ID in the Settlements tab of the reconciliation dashboard, download the settlements as a CSV, and search for the Transaction ID within it.

![Expanded card settlement that shows the various items that make up each card settlement.](https://help.expensify.com/assets/images/ExpensifyHelp_SettlementExpanded.png){:width="100%"}

The Expensify Card statement only shows payments from existing Business Bank Accounts under Settings > Account > Payments > Business Accounts. If a Business Account is deleted, the statement won't contain data for payments from that account.

## Exporting your statement
When using the Expensify Card, you can export your statement to a CSV with these steps:

  1. Login to your account on the web app and click on Settings > Domains > Company Cards.
  2. Click the Reconciliation tab at the top right, then select Settlements.
  3. Enter your desired statement dates using the Start and End fields.
  4. Click Search to access the statement for that period.
  5. You can view the table or select Download to export it as a CSV.

![Click the Download CSV button in the middle of the page to export your card settlements.](https://help.expensify.com/assets/images/ExpensifyHelp_SettlementExport.png){:width="100%"}

## Expensify Card Settlement Frequency
Paying your Expensify Card balance is simple with automatic settlement. There are two settlement frequency options:
  - **Daily Settlement:** Your Expensify Card balance is paid in full every business day, meaning you’ll see an itemized debit each business day.
  - **Monthly Settlement:** Expensify Cards are settled monthly, with your settlement date determined during the card activation process. With monthly, you’ll see only one itemized debit per month. (Available for Plaid-connected bank accounts with no recent negative balance.)

## How settlement works
Each business day (Monday through Friday, excluding US bank holidays) or on your monthly settlement date, we calculate the total of posted Expensify Card transactions since the last settlement. The settlement amount represents what you must pay to bring your Expensify Card balance back to $0.

We'll automatically withdraw this settlement amount from the Verified Business Bank Account linked to the primary domain admin. You can set up this bank account in the web app under Settings > Account > Payments > Bank Accounts.

Once the payment is made, your Expensify Card balance will be $0, and the transactions are considered "settled."

To change your settlement frequency or bank account, go to Settings > Domains > [Domain Name] > Company Cards. On the Company Cards page, click the Settings tab, choose a new settlement frequency or account from the dropdown menu, and click Save to confirm the change.

![Change your card settlement account or settlement frequency via the dropdown menus in the middle of the screen.](https://help.expensify.com/assets/images/ExpensifyHelp_CardSettings.png){:width="100%"}

# Expensify Card Statement and Settlements FAQs
## Can you pay your balance early if you've reached your Domain Limit?
If you've chosen Monthly Settlement, you can manually initiate settlement using the "Settle Now" button. We'll settle the outstanding balance and then perform settlement again on your selected predetermined monthly settlement date.

If you opt for Daily Settlement, the Expensify Card statement will automatically settle daily through an automatic withdrawal from your business bank account. No additional action is needed on your part.
  
## Will our domain limit change if our Verified Bank Account has a higher balance?
Your domain limit may fluctuate based on your cash balance, spending patterns, and history with Expensify. Suppose you've recently transferred funds to the business bank account linked to Expensify card settlements. In that case, you should expect a change in your domain limit within 24 hours of the transfer (assuming your business bank account is connected through Plaid).
  
## How is the “Amount Owed” figure on the card list calculated?
The amount owed consists of all Expensify Card transactions, both pending and posted, since the last settlement date. The settlement amount withdrawn from your designated Verified Business Bank Account only includes posted transactions.

Your amount owed decreases when the settlement clears. Any pending transactions that don't post timely will automatically expire, reducing your amount owed.
  
## **How do I view all unsettled expenses?**
To view unsettled expenses since the last settlement, use the Reconciliation Dashboard's Expenses tab. Follow these steps:
  1. Note the dates of expenses in your last settlement.
  2. Switch to the Expenses tab on the Reconciliation Dashboard.
  3. Set the start date just after the last settled expenses and the end date to today.
  4. The Imported Total will show the outstanding amount, and you can click through to view individual expenses.
