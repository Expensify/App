---
title: Troubleshooting
description: How to troubleshoot company card importing in Expensify
---
# Overview
This guide helps you troubleshoot common issues with company cards in Expensify, including connection errors, missing transactions, and account setup problems.

## Adding Company Cards to Expensify
To add company credit cards:
1. Go to **Settings** > **Domain** > _[Domain Name]_ > **Company Cards**.
2. Click **Import Card/Bank**, search for your bank and follow the prompts.

{% include info.html %}
Only domain admins can connect and assign company cards in Expensify. If you're not a domain admin and want to connect your own credit card, follow the steps [here](https://help.expensify.com/articles/expensify-classic/connect-credit-cards/Personal-Credit-Cards) to connect it as a personal card.
{% include end-info.html %}

## Best Practice for establishing the initial connection
To ensure a successful initial card connection in Expensify, follow these best practices:

 - **Import in the correct location**: For company cards, navigate to Settings > Domains > [Domain Name] > Company Cards > Import Card to establish the connection. For personal or individual card accounts, refer to the instructions [here] (https://help.expensify.com/articles/expensify-classic/connect-credit-cards/Personal-Credit-Cards). 
 - **Ensure you’re selecting the appropriate bank connection for your cards.**
 - **Use the Master or Parent Administrative Credentials:** For company cards, always use the master administrative credentials to import the entire set of cards.
 - **Disable Two-Factor Authentication (2FA):** Expensify cannot bypass bank-imposed 2FA requirements. To maintain a stable connection, temporarily disable 2FA on your bank account before attempting to connect.

## Resolving Missing Card Transactions
1. **Wait for Posting**: Bank transactions may take up to 24 hours to import into Expensify after they have posted to your bank statement. Ensure sufficient time has passed for transactions to appear.
2. **Update Company Cards**: Navigate to Settings > Domains > Company Cards. Click on the card in question and click **Update** to refresh the card feed.
3. **Reconcile Cards**: Navigate to the Reconciliation section via Settings > Domains > Company Cards. Refer to the detailed guide on how to use the [Reconciliation Dashboard](https://help.expensify.com/articles/expensify-classic/connect-credit-cards/company-cards/Reconciliation#identifying-outstanding-unapproved-expenses-using-the-reconciliation-dashboard).
4. **Review Transactions**: Use the Reconciliation Dashboard to view all transactions within a specific timeframe. Transactions will display on the Expenses page based on their "Posted Date". If needed, uncheck the "use posted date" checkbox near the filters to view transactions based on their "Transaction Date" instead.
5. **Address Gaps**: If there is a significant gap in transactions or if transactions are still missing, contact Expensify's Concierge or your Account Manager. They can initiate a historical data update on your card feed to ensure all transactions are properly imported.

# General troubleshooting 

## Common import problems 
- Always start by clicking **Update Card** in:
  - **Settings** > **Your Account** > **Credit Card Import**, or
  - **Settings** > **Domain** > _[Domain Name]_ > **Company Cards**.
- If a **Fix** or **Fix card** option appears, click on it and follow the steps to fix the connection.

## Alternative Workarounds
For persistent issues with API-based connections (e.g., American Express, Chase, Wells Fargo), the alternative option to import transactions is to: 
- [Manually add expenses](https://help.expensify.com/articles/expensify-classic/expenses/expenses/Add-an-expense), or 
- [Upload expenses via CSV](https://help.expensify.com/articles/expensify-classic/bank-accounts-and-credit-cards/company-cards/CSV-Import).

## The connection is established but there are no cards to assign
When establishing the connection, you must assign cards during the same session. It isn't possible to create the connection, log out, and assign the cards later, as the connection will not stick, and require you to reattempt the connection again. 

# Addressing duplicate expenses 

If an employee is seeing duplicate expenses, this is typically due to:
 - The employee having accidentally imported the card as a personal credit card, in addition to having been assigned company card by a domain admin
   - To troubleshoot, have the employee navigate to their Settings > Your Account > Credit Card Import and confirm that their card is only listed once. If the card is listed twice, delete the entry without the "padlock" icon.
 - The card was reassigned to the employee without the appropriate **Transaction start date** being selected, resulting in a period of overlap
   - To troubleshoot, ensure expenses on the new card assignment have not been submitted. Then unassign the card, and reassign it with a more appropriate start date. This action will delete all unsubmitted expenses from the new card feed.

{% include info.html %}

Deleting a duplicate card will delete all unapproved expenses from that transaction feed. Transactions associated with the remaining card will not be affected. If receipts were attached to those transactions, they will still be on the Expenses page, and the employee can click to SmartScan them again.

{% include end-info.html %}

# Tips for stable bank connections 

## Causes for connection breaks 

Banks frequently update their APIs to enhance the security of financial information. However, for security reasons, they may not notify third-party services like Expensify in advance of these changes. To ensure stability, Expensify's engineering team actively monitors bank connections and collaborates with banks to implement updates promptly, minimizing any potential disruption to users.

## Resolving connection issues 

Expensify's API-based banking connections rely on the online banking login credentials to maintain the connectionn. If your online banking username, password, security questions, login authentication or card numbers change, the connection may need to be reestablished. Domain Admins can update this information in Expensify and manually re-establish the connection via *Settings* > *Domains* > _Domain Name_ > *Company Cards* > *Fix*. The Domain Admin will be prompted to enter the new credentials/updated information and this should reestablish the connection.

# Common Errors and Resolutions

## Error: Too many attempts
If you've been locked out while trying to import a new card, you'll need to wait a full 24 hours before trying again. This lock happens when incorrect online banking credentials are entered multiple times, and it cannot be bypassed. To avoid this, make sure your online banking credentials are correct before attempting to import your card again.

### Error: Invalid Credentials/Login Failed
This error occurs when invalid online banking credentials are used. To resolve it, verify your login details by accessing your bank's website directly.

For specific cards:
  - **Chase:** Password must meet their 8-32 character requirement.
  - **Wells Fargo:** Password must be under 14 characters.
  - **SVB:** Enable Direct Connect and use the Direct Connect PIN for login.
  
## Error: Direct Connect not enabled
Direct Connect needs to be enabled on the bank account by your bank/credit card provider before the account can be connected to Expensify. Reach out to your bank to confirm if this option is available for your account, as well as get instructions on how to enable it. 

## Error: Account Setup
This error message indicates that there's something you need to do within your bank account that is blocking the connection.Please visit your online banking portal and check if there are any pending actions required before attemoting to connect your card again.

# Troubleshooting American Express 

## Account Roles and Permissions
When connecting American Express cards to Expensify, you must use the Amex login credentials of the **Primary/Basic account holder**. Using other credentials, such as Supplemental Cardmember or Authorized Account Manager, will fail to load card data or may result in an error. 

{% include info.html %}
In American Express, the **Primary/Basic Account Holder** is typically the person who applied for the American Express Business card, owns the account, manages its finances, and controls card issuance and account management. They can see all charges made by other cardmembers on their account.

By contrast, a Supplemental Cardmember/Employee Cardmember is typically an employee on American Express accounts with access to their own card and payments, while an Authorized Account Manager/AAM has management priveleges allowing them to manage the account and Supplemental Cardmembers' accounts. These roles do not have sufficient permissions in American Express to authorize the connection to Expensify, and therefore only the Primary/Basic Account Holder credentials can be used. 
{% include end-info.html %}

## Importing multiple card programs 
For Amex cardholders with multiple card programs in your Amex US Business account, you'll need to contact Amex and request that they separate the multiple card programs into distinct logins. For instance, you'll want to have your _Business Platinum_ cards under *"username1/password1"* and _Business Gold_ cards under *"username2/password2."* This ensures smooth integration with Expensify.

## Connecting multiple company card programs under the same credentials 
If you have multiple company card programs with the same credentials, you have the following options for importing the card programs: 

 - **To import all card programs at once as one list:** When importing or adding cards, make sure to select all cards across all programs.
   - Note that going forward, you must continue to choose "ALL card programs" when assigning cards. For example, if you have a new employee with a card under your Business Gold Rewards Card program, you'll still need to authorize all the cards in that program or all the programs if you have only one dropdown menu!
 -  **To import each card program as a separate list:** When importing or adding cards, select only relevant group of cards, making sure to select all cards from that group each time you are adding a new card. Once you have authorized the account, you’ll be guided back to Expensify where you’ll assign all necessary cards across all programs.

## Adding cards under different programs with different logins
If you have multiple card programs with different credentials, you will need to have another Domain Admin account add each card program from their own account.  
Once all Domain Admins have connected and assigned the cards that they are the Primary account holder for, all cards will be listed under one *American Express (New and Upgraded)* list in the Domain Company Card page.

## Amex Error: Username/Password/Questions out of date
This error occurs when the card connection breaks due to missing security question answers. To resolve it, navigate to *Settings* > *Domain* > _[Domain Name]_ > *Company Cards* and click _Fix Card_ to answer your bank's security questions. You will need to do this for each security question you have with your bank; so if you have 3 security questions, you will need to do this 3 times.

## Amex Error: Account not found/Card number changed
This error message appears when you have been issued a new card, or if there's been a significant change to the account in some other way (password and/or card number change). When your online bank/card account password has been changed, you may need to update the details on the Expensify end as well. To do this, navigate to *Settings* > *Domain* > _[Domain Name]_ > *Company Cards* and click _Fix Card_.

If there’s been a recent change to the card number, you’ll have to remove the card with the previous number and re-import the card using the new number. A Domain Admin will have to re-assign the card via *Settings* > *Domain* > _Domain Name_ > *Company Cards*. Before removing the card, please ensure *all Open reports have been submitted*, as removing the card will remove all imported transactions from the account that are associated with that card.

## Amex Error: General connection error
This error message states that your bank or credit card provider is under maintenance and is unavailable. Try waiting a few hours before trying to import your credit card again. Check out Expensify's [status page](https://status.expensify.com/) for updates on bank/credit card connections, or you can also choose to subscribe to updates for your specific account type.

## Amex error: Session has expired
If you get an error stating an American Express Business Card “Your session has expired. Please return to Expensify and try again, this always means that you are using the incorrect credentials. Remember, you need to use primary/basic cardholder credentials. If you are not sure which credentials you should use, reach out to American Express for guidance.

## Amex error: Card isn't eligible
This error comes directly from American Express and is typically related to an account that is not a business account or using credentials that are not the primary account holder credentials. 

# Troubleshooting Chase

## Resetting Chase access to Expensify 

If you’re experiencing issues with your Chase connection in Expensify, resetting access can often resolve the problem. Follow these steps to troubleshoot:

1. While logged into your Chase account portal, visit the [Linked Apps & Websites](https://www.chase.com/digital/data-sharing) page in the Security Center. 
2. Locate Expensify in the Linked Apps & Websites list
3. Select **Stop sharing data** to disconnect Expensify's access to your Chase account.
4. After resetting access, follow the instructions [here](https://help.expensify.com/articles/expensify-classic/connect-credit-cards/company-cards/Troubleshooting#how-to-add-company-cards-to-expensify) to reestablish the connection to Chase. 

{% include faq-begin.md %}

**What bank connections does Expensify offer?**

All bank connections Expensify offers are considered extremely reliable, but we recommend transacting with the Expensify Visa® Commercial Card. It also offers daily and monthly settlement, unapproved expense limits, realtime compliance for secure and efficient spending, and cash back on all US purchases. [Click here to learn more about the Expensify Card](https://use.expensify.com/company-credit-card).

Alternatively, we've also teamed up with the following major banks worldwide to ensure a smooth import of credit card transactions into your accounts:
- American Express
- Bank of America
- Brex
- Capital One
- Chase
- Citibank
- Stripe
- Wells Fargo

**What are the most stable bank connections?**

Commercial feeds for company cards are the most dependable connections in Expensify, and are considered more stable than API-based connections. If you have a corporate or commercial card account, you might have access to a daily transaction feed where expenses from Visa, Mastercard, and American Express are automatically sent to Expensify. Reach out to your banking relationship manager to check if your card program qualifies for this feature.

**Why Can’t I See the Transactions Before a Certain Date?**

When importing a card into Expensify, the platform typically retrieves 30-90 days of historical transactions, depending on the card or account type. For commercial feeds, transactions cannot be imported before the bank starts sending data. If needed, banks can send backdated files, and Expensify can run a historical update upon request.

Additionally, Expensify does not import transactions dated before the "start date" you specify when assigning the card. Unless transitioning from an old card to a new one to avoid duplicates, it's advisable to set the start date to "earliest possible" or leave it blank.

For historical expenses that cannot be imported automatically, consider using Expensify's [company card](https://help.expensify.com/articles/expensify-classic/connect-credit-cards/company-cards/CSV-Import) or [personal card](https://help.expensify.com/articles/expensify-classic/connect-credit-cards/Personal-Credit-Cards#importing-expenses-via-a-spreadsheet) spreadsheet import method. This allows you to manually input missing transactions into the system.

{% include faq-end.md %}

</div>
