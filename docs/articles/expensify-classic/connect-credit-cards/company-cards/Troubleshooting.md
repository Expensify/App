---
title: Troubleshooting
description: How to troubleshoot company card importing in Expensify
---
# Overview
This guide helps you troubleshoot common issues with company cards in Expensify, including connection errors, missing transactions, and account setup problems.

## Adding company cards to Expensify
To add company credit cards:

1. Go to **Settings** > **Domain** > _[Domain Name]_ > **Company Cards**.
2. Click **Import Card/Bank** and follow the prompts.

{% include info.html %}
Only Domain Admins can connect and assign company cards in Expensify. If you're not a Domain Admin and want to connect your own credit card, follow the steps [here](https://help.expensify.com/articles/expensify-classic/connect-credit-cards/Personal-Credit-Cards) to connect it as a personal card.
{% include end-info.html %}

## Best practices for establishing the initial card connection
To ensure a successful initial card connection in Expensify, follow these best practices:

- **Import in the Correct Location**: For company cards, navigate to **Settings** > **Domains** > _[Domain Name]_ > **Company Cards** > **Import Card** to establish the connection. For personal or individual card accounts, refer to the instructions [here](https://help.expensify.com/articles/expensify-classic/connect-credit-cards/Personal-Credit-Cards). 
- **Select the Appropriate Bank Connection**: Ensure you’re selecting the appropriate bank connection for your cards.
- **Use Master or Parent Administrative Credentials**: For company cards, always use the master administrative credentials to import the entire set of cards.
- **Disable Two-Factor Authentication (2FA)**: Expensify cannot bypass bank-imposed 2FA requirements. To maintain a stable connection, temporarily disable 2FA on your bank account before attempting to connect.

By following these steps, you can avoid common issues and establish a stable card connection with Expensify.

# Resolving missing card transactions 

Here are some common steps to resolve issues with missing imported expenses:

1. **Wait for posting.** Bank transactions may take up to 24 hours to import into Expensify after they have posted at your bank. Ensure sufficient time has passed for transactions to appear.
2. **Update company cards.** Go to **Settings** > **Domains** > _[Domain Name]_ > **Company Cards**. Click on the card in question and select **Update** to refresh the card feed.
3. **Reconcile cards.** Navigate to the **Reconciliation** section under **Settings** > **Domains** > _[Domain Name]_ > **Company Cards**. Refer to the detailed guide on how to use the [Reconciliation Dashboard](https://help.expensify.com/articles/expensify-classic/connect-credit-cards/company-cards/Reconciliation#identifying-outstanding-unapproved-expenses-using-the-reconciliation-dashboard).
4. **Review transactions.** Use the [Reconciliation Dashboard](https://help.expensify.com/articles/expensify-classic/connect-credit-cards/company-cards/Reconciliation#identifying-outstanding-unapproved-expenses-using-the-reconciliation-dashboard) to view all transactions within a specific timeframe. Transactions will display on the **Expenses** page based on their posted date. If needed, uncheck the Use Posted Date checkbox near the filters to view transactions based on their Transaction Date instead.
5. **Address gaps.** If there is a significant gap in transactions or if transactions are still missing, contact Concierge or your Account Manager. They can initiate a historical data update on your card feed to ensure all transactions are properly imported.

# General troubleshooting 

## Common import problems 

If company cards seem to be disconnected or not working as expected, troubleshoot by: 
- Clicking **Update Card** under:
  - **Settings** > **Account** > **Credit Card Import** for personal cards, or
  - **Settings** > **Domains** > _[Domain Name]_ > **Company Cards** for company cards.
- If a **Fix** option appears, click on it and follow the steps to fix the connection.

## Alternative workarounds
For persistent issues with API-based connections (e.g., American Express, Chase, Wells Fargo), the alternative option is to [manually add expenses](https://help.expensify.com/articles/expensify-classic/expenses/expenses/Add-an-expense), or [upload expenses via CSV](https://help.expensify.com/articles/expensify-classic/bank-accounts-and-credit-cards/company-cards/CSV-Import).

## The connection is established but there are no cards to assign
When establishing the connection, you must assign cards during the same session. It isn't possible to create the connection, log out, and assign the cards later, as the connection will not stick and will require you to reattempt the connection.

# Addressing duplicate expenses 

If a workspace member is experiencing duplicated expenses, this is typically due to:

 -  A cardholder having accidentally imported the card as a personal credit card, in addition to being assigned the company card by a Domain Admin.  
   - To troubleshoot, have the employee navigate to **Settings** > **Account** > **Credit Card Import** and confirm that their card is only listed once. 

 -  The card was reassigned to the cardholder without the appropriate transaction start date being selected, resulting in a period of overlap.  
   - To troubleshoot, ensure expenses on the new card assignment have not been submitted. Then unassign the card and reassign it with a more appropriate start date. This action will delete all unsubmitted expenses from the new card feed.

{% include info.html %}
Deleting a duplicate card will remove all Unapproved and Open expenses linked to that card. However, transactions associated with the remaining assigned card will remain unaffected. Any receipts attached to the deleted transactions will still appear on the Expenses page and can be reattached to the corresponding imported expense on the remaining assigned card.
{% include end-info.html %}

# Tips for stable bank connections 

## Causes for connection breaks 
Banks frequently update their APIs to enhance the security of financial information. However, for security reasons, they may not notify third-party services like Expensify in advance of these changes. Expensify's engineering team works diligently to minimize interruptions by monitoring bank connections and collaborating with banks to address updates promptly. 

## Resolving connection issues 
Expensify's API-based banking connections rely on the online banking login credentials to maintain the connection. If your online banking username, password, security questions, login authentication, or card numbers change, the connection may need to be reestablished. Domain Admins can update this information in Expensify and manually reestablish the connection via **Settings** > **Domains** > _[Domain Name]_ > **Company Cards** > **Fix**. The Domain Admin will be prompted to enter the new credentials or updated information, which should reestablish the connection.

# Common errors and resolutions 

Here are some errors that can occur when working with bank connections, and steps for resolving them: 

## Error: Too many attempts
If you've been locked out while trying to import a new card, you will need to wait a full 24 hours before trying again. This lock happens when incorrect online banking credentials are entered multiple times, and it cannot be bypassed. To avoid this, make sure your online banking credentials are correct before attempting to import your card again.

## Error: Invalid credentials/login failed
Verify the online banking login details by accessing your bank's website directly.
- Some known bank-specific requirements are:
  - **Chase**. Password must meet their 8-32 character requirement.
  - **Wells Fargo**. Password must be under 14 characters.
  - **SVB**. Enable Direct Connect and use the Direct Connect PIN for login.
  
## Error: Direct Connect not enabled
Direct Connect needs to be enabled on the bank account by your bank or credit card provider before it can be connected to Expensify. Please reach out to your bank to confirm if this option is available for your account and get instructions on how to enable it. 

## Error: Account setup 
This error message indicates that there is something you need to do on your bank account's end. Please visit your online banking portal and check if there are any pending actions required before attempting to connect your card again.

# Troubleshooting American Express connections

## Account roles and permissions 
When connecting American Express cards to Expensify, you must use the Amex login credentials of the Primary/Basic account holder. Using other credentials, such as Supplemental Cardmember or Authorized Account Manager, will fail to load card data or may result in an error.

{% include info.html %}
In American Express, the Primary/Basic Account Holder is typically the person who applied for the American Express Business card, owns the account, manages its finances, and controls card issuance and account management. They can see all charges made by other cardmembers on their account.

By contrast, a Supplemental Cardmember or Employee Cardmember is typically an employee on American Express accounts with access to their own card and payments. An Authorized Account Manager (AAM) has management privileges allowing them to manage the account and Supplemental Cardmembers' accounts. These roles do not have sufficient permissions in American Express to authorize the connection to Expensify, and therefore only the Primary/Basic Account Holder credentials can be used.
{% include end-info.html %}

## Importing multiple card programs 
If you have multiple American Express card programs, contact Amex and request that they separate the multiple card programs into distinct logins. For example, you can have your _Business Platinum_ cards under *"username1/password1"* and _Business Gold_ cards under *"username2/password2"*. This ensures smooth integration with Expensify.

## Connecting multiple company card programs under the same credentials 
If you have multiple company card programs using the same credentials, you can import all programs together, which will display them under a single dropdown. Be sure to select all relevant cards each time you add cards from any program.

If you prefer to manage card programs separately, you can import them one at a time, ensuring you select all cards within the specific program during each import. After authorizing the account, you will be guided back to Expensify to assign the cards as needed.

*Important Reminder*: Whenever you need to access the connection to assign a new card, you must still choose all card programs. For example, if you have a new employee with a card under your Business Gold Rewards Card program, you will still need to authorize all the cards in that program or all the programs if you have only one dropdown menu.

## Adding cards under different programs with different logins
If you have multiple card programs with different credentials, you will need another Domain Admin account to add each card program from their own account. Once all Domain Admins have connected and assigned the cards they are the Primary account holder for, all cards will be listed under one *American Express (New and Upgraded)* list on the Domain Company Card page.

## Amex error: Username, password, or security questions out of date
Your company card connection is broken because Expensify is missing answers to your security questions. Go to **Settings** > **Domain** > _[Domain Name]_ > **Company Cards** and click **Fix**. Answer your bank's security questions to restore the connection. Repeat this process for each security question your bank requires.

## Amex error: Account not found or card number changed
This error occurs when you have been issued a new card or if there has been a significant change to the account, such as a password or card number update.

To update the connection:
1. Go to **Settings** > **Domain** > _[Domain Name]_ > **Company Cards** and click **Fix**.
2. If there has been a card number change, remove the card with the previous number and re-import the card with the new number. 
3. Before removing the card, ensure all open reports have been submitted. Removing the card will delete all imported transactions associated with that card. A Domain Admin will need to re-assign the card after re-importing it.

## Amex error: General connection error
This error indicates that your bank or credit card provider is under maintenance and unavailable. Wait a few hours before trying to import your credit card again. Check Expensify's [status page](https://status.expensify.com/) for updates on bank or credit card connections, or subscribe to updates for your account type.

## Amex error: Session has expired
If you see an error stating "Your session has expired. Please return to Expensify and try again," this means you are using incorrect Amex credentials. Use the Primary/Basic account holder credentials. If you are unsure which credentials to use, contact American Express for guidance.

## Amex error: Card isn't eligible
This error occurs when the account is not a business account or the credentials used are not for the Primary account holder. Verify the account type and credentials before attempting to connect again.

# Troubleshooting Chase connections

## Resetting Chase access to Expensify 
If you are experiencing issues with your Chase connection in Expensify, resetting access can often resolve the problem. Follow these steps to troubleshoot:

1. Log in to your Chase account portal and visit the [Linked Apps & Websites](https://www.chase.com/digital/data-sharing) page in the Security Center. 
2. Locate Expensify in the Linked Apps & Websites list.
3. Select **Stop sharing data** to disconnect Expensify's access to your Chase account.
4. After resetting access, follow the instructions [here](https://help.expensify.com/articles/expensify-classic/connect-credit-cards/company-cards/Troubleshooting#how-to-add-company-cards-to-expensify) to reestablish the connection to Chase.

{% include faq-begin.md %}

## What bank connections does Expensify offer?
Expensify offers highly reliable bank connections, but we recommend using the Expensify Visa® Commercial Card. It provides daily and monthly settlement, unapproved expense limits, real-time compliance for secure and efficient spending, and cash back on all US purchases. [Click here to learn more about the Expensify Card](https://use.expensify.com/company-credit-card).

Alternatively, Expensify has partnered with major banks worldwide to ensure a smooth import of credit card transactions into your accounts, including:
- American Express
- Bank of America
- Brex
- Capital One
- Chase
- Citibank
- Stripe
- Wells Fargo

## What are the most stable bank connections? 
Commercial feeds for company cards are the most dependable connections in Expensify and are considered more stable than API-based connections. If you have a corporate or commercial card account, you might have access to a daily transaction feed where expenses from Visa, Mastercard, and American Express are automatically sent to Expensify. Contact your banking relationship manager to check if your card program qualifies for this feature.

## Why can’t I see the transactions before a certain date?
When importing a card into Expensify, the bank typically provides 30-90 days of historical transactions, depending on the card or account type. For commercial feeds, transactions cannot be imported before the bank starts sending data, however banks can send backdated files if historical transactions are needed. 

Additionally, Expensify does not import transactions dated before the "start date" you specify when assigning the card. Unless transitioning from an old card to a new one to avoid duplicates, it is advisable to set the start date to "earliest possible" or leave it blank. For historical expenses that cannot be imported automatically, consider using Expensify's [company card](https://help.expensify.com/articles/expensify-classic/connect-credit-cards/company-cards/CSV-Import) or [personal card](https://help.expensify.com/articles/expensify-classic/connect-credit-cards/Personal-Credit-Cards#importing-expenses-via-a-spreadsheet) spreadsheet import method to manually input missing transactions into the system.

{% include faq-end.md %}

