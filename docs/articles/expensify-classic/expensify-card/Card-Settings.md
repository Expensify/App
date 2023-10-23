---
title: Expensify Card Settings 
description: Admin Card Settings and Features
---
## Expensify Card - admin settings and features
​
# Overview
​
The Expensify Card offers a range of settings and functionality to customize how admins manage expenses and card usage in Expensify. To start, we'll lay out the best way to make these options work for you.
​
Set Smart Limits to control card spend. Smart Limits are spend limits that can be set for individual cards or specific groups. Once a given Smart Limit is reached, the card is temporarily disabled until expenses are approved.
​
Monitor spend using your Domain Limit and the Reconciliation Dashboard.
Your Domain Limit is the total Expensify Card limit across your entire organization. No member can spend more than what's available here, no matter what their individual Smart Limit is. A Domain Limit is dynamic and depends on a number of factors, which we'll explain below.
​
Decide the settlement model that works best for your business
Monthly settlement is when your Expensify Card balance is paid in full on a certain day each month. Though the Expensify Card is set to settle daily by default, any Domain Admin can change this setting to monthly. 
​
Now, let's get into the mechanics of each piece mentioned above. 
​
# How to set Smart Limits
Smart Limits allow you to set a custom spend limit for each Expensify cardholder, or default limits for groups. Setting a Smart Limit is the step that activates an Expensify card for your user (and issues a virtual card for immediate use).
​
## Set limits for individual cardholders
As a Domain Admin, you can set or edit Custom Smart Limits for a card by going to Settings > Domains > Domain Name > Company Cards. Simply click Edit Limit to set the limit. This limit will restrict the amount of unapproved (unsubmitted and Processing) expenses that a cardholder can incur. After the limit is reached, the cardholder won't be able to use their card until they submit outstanding expenses and have their card spend approved.  If you set the Smart Limit to $0, the user's card can't be used. 
## Set default group limits
Domain Admins can set or edit custom Smart Limits for a domain group by going to Settings > Domains > Domain Name > Groups. Just click on the limit in-line for your chosen group and amend the value.
​
This limit will apply to all members of the Domain Group who do not have an individual limit set via Settings > Domains > Domain Name > Company Cards.
## Refreshing Smart Limits
To let cardholders keep spending, you can approve their pending expenses via the Reconciliation tab. This will free up their limit, allowing them to use their card again. 
​
To check an unapproved card balance and approve expenses, click on Reconciliation and enter a date range, then click though the Unapproved total to see what needs approving. You can add to a new report or approve an existing report from here.
​
You can also increase a Smart Limit at any time by clicking Edit Limit.
​
# Understanding your Domain Limit
​
To get the most accurate Domain Limit for your company, connect your bank account via Plaid under Settings > Account > Payments > Add Verified Bank Account. 
​
If your bank isn't supported or you're having connection issues, you can request a custom limit under Settings > Domains > Domain Name > Company Cards > Request Limit Increase. As a note, you'll need to provide three months of unredacted bank statements for review by our risk management team. 
​
Your Domain Limit may fluctuate from time to time based on various factors, including:
​
- Available funds in your Verified Business Bank Account: We regularly check bank balances via Plaid. A sudden drop in balance within the last 24 hours may affect your limit. For 'sweep' accounts, be sure to maintain a substantial balance even if you're sweeping daily.
- Pending expenses: Review the Reconciliation Dashboard to check for large pending expenses that may impact your available balance. Your Domain Limit will adjust automatically to include pending expenses.
- Processing settlements: Settlements need about three business days to process and clear. Several large settlements over consecutive days may impact your Domain Limit, which will dynamically update when settlements have cleared.
​
As a note, if your Domain Limit is reduced to $0, your cardholders can't make purchases even if they have a larger Smart Limit set on their individual cards. 
# How to reconcile Expensify Cards
## How to reconcile expenses
Reconciling expenses is essential to ensuring your financial records are accurate and up-to-date. 
​
Follow the steps below to quickly review and reconcile expenses associated with your Expensify Cards:
​
1. Go to Settings > Domains > Domain Name > Company Cards > Reconciliation > Expenses
2. Enter your start and end dates, then click Run
3. The Imported Total will show all Expensify Card transactions for the period
4. You'll also see a list of all Expensify Cards, the total spend on each card, and a snapshot of expenses that have and have not been approved (Approved Total and Unapproved Total, respectively)
By clicking on the amounts, you can view the associated expenses 
​
## How to reconcile settlements
A settlement is the payment to Expensify for the purchases made using the Expensify Cards. 
​
The Expensify Card program can settle on either a daily or monthly basis. One thing to note is that not all transactions in a settlement will be approved when running reconciliation.
​
You can view the Expensify Card settlements under Settings > Domains > Domain Name > Company Cards > Reconciliation > Settlements. 
​
By clicking each settlement amount, you can see the transactions contained in that specific payment amount. 
​
Follow the below steps to run reconciliation on the Expensify Card settlements:
​
1. Log into the Expensify web app
2. Click Settings > Domains > Domain Name > Company Cards > Reconciliation tab > Settlements
3. Use the Search function to generate a statement for the specific period you need
4. The search results will include the following info for each entry:
    - Date: when a purchase was made or funds were debited for payments
    - Posted Date: when the purchase transaction posted
    - Entry ID: a unique number grouping card payments and transactions settled by those payments
    - Amount: the amount debited from the Business Bank Account for payments
    - Merchant: the business where a purchase was made
    - Card: refers to the Expensify credit card number and cardholder's email address
    - Business Account: the business bank account connected to Expensify that the settlement is paid from
    - Transaction ID: a special ID that helps Expensify support locate transactions if there's an issue
​
5. Review the individual transactions (debits) and the payments (credits) that settled them
6. Every cardholder will have a virtual and a physical card listed. They're handled the same way for settlements, reconciliation, and exporting.
7. Click Download CSV for reconciliation
8. This will list everything that you see on screen
9. To reconcile pre-authorizations, you can use the Transaction ID column in the CSV file to locate the original purchase
10. Review account payments
11. You'll see payments made from the accounts listed under Settings > Account > Payments > Bank Accounts. Payment data won't show for deleted accounts. 
​
You can use the Reconciliation Dashboard to confirm the status of expenses that are missing from your accounting system. It allows you to view both approved and unapproved expenses within your selected date range that haven't been exported yet.
​
# Deep dive
## Set a preferred workspace
Some customers choose to split their company card expenses from other expense types for coding purposes. Most commonly this is done by creating a separate workspace for card expenses. 
​
You can use the preferred workspace feature in conjunction with Scheduled Submit to make sure all newly imported card expenses are automatically added to reports connected to your card-specific workspace.
## How to change your settlement account
You can change your settlement account to any other verified business bank account in Expensify. If your bank account is closing, make sure you set up the replacement bank account in Expensify as early as possible. 
​
To select a different settlement account:
​
1. Go to Settings > Domains > Domain Name > Company Cards > Settings tab
2. Use the Expensify Card settlement account dropdown to select a new account
3. Click Save
​
## Change the settlement frequency
​
By default, the Expensify Cards settle on a daily cadence. However, you can choose to have the cards settle on a monthly basis.
​
1. Monthly settlement is only available if the settlement account hasn't had a negative balance in the last 90 days
2. There will be an initial settlement to settle any outstanding spend that happened before switching the settlement frequency 
3. The date that the settlement is changed to monthly is the settlement date going forward (e.g. If you switch to monthly settlement on September 15th, Expensify Cards will settle on the 15th of each month going forward)
​
To change the settlement frequency:
1. Go to Settings > Domains > Domain Name > Company Cards > Settings tab
2. Click the Settlement Frequency dropdown and select Monthly
3. Click Save to confirm the change
​
​
## Declined Expensify Card transactions 
As long as you have 'Receive realtime alerts' enabled, you'll get a notification explaining the decline reason. You can enable alerts in the mobile app by clicking on three-bar icon in the upper-left corner > Settings > toggle Receive realtime alerts on. 
​
If you ever notice any unfamiliar purchases or need a new card, go to Settings > Account > Credit Card Import and click on Request a New Card right away.
​
Here are some reasons an Expensify Card transaction might be declined:
​
1. You have an insufficient card limit
    - If a transaction amount exceeds the available limit on your Expensify Card, the transaction will be declined. It's essential to be aware of the available balance before making a purchase to avoid this - you can see the balance under Settings > Account > Credit Card Import on the web app or mobile app. Submitting expenses and having them approved will free up your limit for more spend.
​
2. Your card hasn't been activated yet, or has been canceled
    - If the card has been canceled or not yet activated, it won't process any transactions. 
​
3. Your card information was entered incorrectly. Entering incorrect card information, such as the CVC, ZIP or expiration date will also lead to declines.
​
4. There was suspicious activity
    - If Expensify detects unusual or suspicious activity, we may block transactions as a security measure. This could happen due to irregular spending patterns, attempted purchases from risky vendors, or multiple rapid transactions. Check your Expensify Home page to approve unsual merchants and try again.
    If the spending looks suspicious, we may do a manual due diligence check, and our team will do this as quickly as possible - your cards will all be locked while this happens.  
​
5. The merchant is located in a restricted country
    - Some countries may be off-limits for transactions. If a merchant or their headquarters (billing address) are physically located in one of these countries, Expensify Card purchases will be declined. This list may change at any time, so be sure to check back frequently: Belarus, Burundi, Cambodia, Central African Republic, Democratic Republic of the Congo, Cuba, Iran, Iraq, North Korea, Lebanon, Libya, Russia, Somalia, South Sudan, Syrian Arab Republic, Tanzania, Ukraine, Venezuela, Yemen, and Zimbabwe.
​
# FAQ 
## What happens when I reject an Expensify Card expense?
​
​
Rejecting an Expensify Card expense from an Expensify report will simply allow it to be reported on a different report. You cannot undo a credit card charge.
​
If an Expensify Card expense needs to be rejected, you can reject the report or the specific expense so it can be added to a different report. The rejected expense will become Unreported and return to the submitter's Expenses page.
​
If you want to dispute a card charge, please message Concierge to start the dispute process.
​
If your employee has accidentally made an unauthorised purchase, you will need to work that out with the employee to determine how they will pay back your company.
​
​
## What happens when an Expensify Card transaction is refunded?
​
​
The way a refund is displayed in Expensify depends on the status of the expense (pending or posted) and whether or not the employee also submitted an accompanying SmartScanned receipt. Remember, a SmartScanned receipt will auto-merge with the Expensify Card expense.
​
- Full refunds:
If a transaction is pending and doesn't have a receipt attached (except for eReceipts), getting a full refund will make the transaction disappear.
If a transaction is pending and has a receipt attached (excluding eReceipts), a full refund will zero-out the transaction (amount becomes zero).
- Partial refunds:
If a transaction is pending, a partial refund will reduce the amount of the transaction.
- If a transaction is posted, a partial refund will create a negative transaction for the refund amount.
