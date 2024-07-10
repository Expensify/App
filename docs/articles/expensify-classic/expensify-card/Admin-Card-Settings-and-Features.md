---
title: Admin Card Settings and Features 
description: A deep dive into the available controls and settings for the Expensify Card.
---
# Expensify Visa® Commercial Card Overview
The Expensify Visa® Commercial Card offers various settings to help admins manage expenses and card usage efficiently. Here’s how to use these features:

## Smart Limits
Smart Limits allow you to set custom spending limits for each Expensify cardholder or default limits for groups. Setting a Smart Limit activates an Expensify card for your user and issues a virtual card for immediate use.

#### Set Limits for Individual Cardholders
As a Domain Admin, you can set or edit Custom Smart Limits for a card:
1. Go to _**Settings > Domains > Domain Name > Company Cards**_.
2. Click **Edit Limit** to set the limit.

This limit restricts the amount of unapproved (unsubmitted and processing) expenses a cardholder can incur. Once the limit is reached, the cardholder cannot use their card until they submit outstanding expenses and have their card spend approved. If you set the Smart Limit to $0, the user’s card cannot be used.

#### Set Default Group Limits
Domain Admins can set or edit custom Smart Limits for a domain group:

1. Go to _**Settings > Domains > Domain Name > Groups**_.
2. Click on the limit in-line for your chosen group and amend the value.

This limit applies to all members of the Domain Group who do not have an individual limit set via _**Settings > Domains > Domain Name > Company Cards**_.

#### Refreshing Smart Limits
To let cardholders continue spending, you can approve their pending expenses via the Reconciliation tab. This frees up their limit, allowing them to use their card again.

To check an unapproved card balance and approve expenses:
1. Click on **Reconciliation** and enter a date range.
2. Click on the Unapproved total to see what needs approval.
3. You can add to a new report or approve an existing report from here.

You can also increase a Smart Limit at any time by clicking **Edit Limit**.

### Understanding Your Domain Limit
To ensure you have the most accurate Domain Limit for your company, follow these steps:

1. **Connect Your Bank Account:** Go to _**Settings > Account > Payments > Add Verified Bank Account**_ and connect via Plaid.

2. **Request a Custom Limit:** If your bank isn’t supported or you’re experiencing connection issues, you can request a custom limit at _**Settings > Domains > Domain Name > Company Cards > Request Limit Increase**_. Note that you’ll need to provide three months of unredacted bank statements for review by our risk management team.

### Factors Affecting Your Domain Limit
Your Domain Limit may fluctuate due to several factors:

- **Available Funds in Your Verified Business Bank Account:** We regularly monitor balances via Plaid. A sudden decrease in balance within the last 24 hours may impact your limit. For accounts with 'sweep' functionality, maintain a sufficient balance even when sweeping daily.

- **Pending Expenses:** Check the Reconciliation Dashboard for large pending expenses that could affect your available balance. Your Domain Limit automatically adjusts to include pending expenses.

- **Processing Settlements:** Settlements typically take about three business days to process and clear. Multiple large settlements over consecutive days may affect your Domain Limit, which updates dynamically once settlements are cleared.

Please note: If your Domain Limit is reduced to $0, cardholders cannot make purchases, even if they have higher Smart Limits set on their individual cards.

## Reconciling Expenses and Settlements
Reconciling expenses ensures your financial records are accurate and up-to-date. Follow these steps to review and reconcile expenses associated with your Expensify Cards:

#### How to Reconcile Expenses:
1. Go to _**Settings > Domains > Domain Name > Company Cards > Reconciliation > Expenses**_.
2. Enter your start and end dates, then click *Run*.
3. The Imported Total will display all Expensify Card transactions for the period.
4. You'll see a list of all Expensify Cards, the total spend on each card, and a snapshot of expenses that have been approved and have not been approved (Approved Total and Unapproved Total, respectively).
5. Click on the amounts to view the associated expenses.

#### How to Reconcile Settlements:
A settlement is the payment to Expensify for purchases made using the Expensify Cards. The program can settle on either a daily or monthly basis. Note that not all transactions in a settlement will be approved when running reconciliation.

1. Log into the Expensify web app.
2. Click _**Settings > Domains > Domain Name > Company Cards > Reconciliation > `Settlements**_.
3. Use the Search function to generate a statement for the specific period you need.

The search results will include the following info for each entry:
- **Date:** When a purchase was made or funds were debited for payments.
- **Posted Date:** When the purchase transaction is posted.
- **Entry ID:** A unique number grouping card payments and transactions settled by those payments.
- **Amount:** The amount debited from the Business Bank Account for payments.
- **Merchant:** The business where a purchase was made.
- **Card:** Refers to the Expensify Card number and cardholder’s email address.
- **Business Account:** The business bank account connected to Expensify that the settlement is paid from.
- **Transaction ID:** A special ID that helps Expensify support locate transactions if there’s an issue.

Review the individual transactions (debits) and the payments (credits) that settled them. Each cardholder will have a virtual and a physical card listed, handled the same way for settlements, reconciliation, and exporting.

4. Click **Download CSV** for reconciliation. This will list everything you see on the screen.
5. To reconcile pre-authorizations, use the Transaction ID column in the CSV file to locate the original purchase.
6. Review account payments: You’ll see payments made from the accounts listed under _**Settings > Account > Payments > Bank Accounts**_. Payment data won’t show for deleted accounts.

Use the Reconciliation Dashboard to confirm the status of expenses missing from your accounting system. It allows you to view both approved and unapproved expenses within your selected date range that haven’t been exported yet.

### Set a Preferred Workspace
Many customers find it helpful to separate their company card expenses from other types of expenses for easier coding. To do this, create a separate workspace specifically for card expenses.

**Using a Preferred Workspace:** 
Combine this feature with Scheduled Submit to automatically add new card expenses to reports connected to your card-specific workspace.

### Change the Settlement Account
You can change your settlement account to any verified business bank account in Expensify. If your current bank account is closing, make sure to set up a replacement as soon as possible.

#### Steps to Select a Different Settlement Account:
1. Go to _**Settings > Domains > Domain Name > Company Cards > Settings**_ tab.
2. Use the Expensify Card settlement account dropdown to select a new account.
3. Click **Save**.

### Change the Settlement Frequency
By default, Expensify Cards settle daily. However, you can switch to monthly settlements.

#### Monthly Settlement Requirements:
  - The settlement account must not have had a negative balance in the last 90 days.
  - There will be an initial settlement for any outstanding spending before the switch.
  - The settlement date going forward will be the date you switch (e.g., if you switch on September 15th, future settlements will be on the 15th of each month).

#### Steps to Change the Settlement Frequency:
1. Go to _**Settings > Domains > Domain Name > Company Cards > Settings**_ tab.
2. Click the **Settlement Frequency** dropdown and select **Monthly**.
3. Click **Save** to confirm the change.

### Declined Expensify Card Transactions
If you have 'Receive real-time alerts' enabled, you'll get a notification explaining why a transaction was declined. To enable alerts:
1. Open the mobile app.
2. Click the three-bar icon in the upper-left corner.
3. Go to Settings.
4. Toggle 'Receive real-time alerts' on.

If you or your employees notice any unfamiliar purchases or need a new card, go to _**Settings > Account > Credit Card Import**_ and click on **Request a New Card**.

#### Common Reasons for Declines:
- **Insufficient Card Limit:** If a transaction exceeds your card's limit, it will be declined. Always check your balance under _**Settings > Account > Credit Card Import**_ on the web or mobile app. Approve pending expenses to free up your limit.

- **Card Not Activated or Canceled:** Transactions won't process if the card hasn't been activated or has been canceled.

- **Incorrect Card Information:** Entering incorrect card details, such as the CVC, ZIP, or expiration date, will lead to declines.

- **Suspicious Activity:** Expensify may block transactions if unusual activity is detected. This could be due to irregular spending patterns, risky vendors, or multiple rapid transactions. Check your Expensify Home page to approve unusual merchants. If further review is needed, Expensify will perform a manual due diligence check and lock your cards temporarily.

- **Merchant in a Restricted Country:** Transactions will be declined if the merchant is in a restricted country. 
