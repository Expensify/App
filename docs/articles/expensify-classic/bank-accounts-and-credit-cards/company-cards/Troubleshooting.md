---
title: Troubleshooting
description: How to troubleshoot company card importing in Expensify
---
# Overview
Whether you're encountering issues related to company cards, require assistance with company card account access, or have questions about company card import features, you've come to the right place. 

## How to add company cards to Expensify
You can add company credit cards under the Domain settings in your Expensify account by navigating to *Settings* > *Domain* > _Domain Name_ > *Company Cards* and clicking *Import Card/Bank* and following the prompts.

# Errors connecting company cards

## Error: Too many attempts
If you've been locked out while trying to import a new card, you'll need to wait a full 24 hours before trying again. This lock happens when incorrect online banking credentials are entered multiple times, and it's there for your security — it can't be removed. To avoid this, make sure your online banking credentials are correct before attempting to import your card again.

## Error: Invalid credentials/Login failed
Verify your ability to log into your online banking portal by attempting to log into your bank account via the banking website. 
Check for any potential temporary outages on your bank's end that may affect third-party connections like Expensify.
For specific card types:
- *Chase Card*: Confirm your password meets their new 8-32 character requirement.
- *Wells Fargo Card*: Ensure your password is under 14 characters. Reset it if necessary before importing your card to Expensify. If your card is already imported, update it and use the "Fix Card" option to reestablish the connection.
- *SVB Card*: Enable Direct Connect from the SVB website and use your online banking username and Direct Connect PIN instead of your password when connecting an SVB card. If connecting via *Settings* > *Domain* > _[Domain Name]_ > *Company Cards*, contact SVB for CDF feed setup.
  
## Error: Direct Connect not enabled
Direct Connect will need to be enabled in your account for your bank/credit card provider before you can import your card to Expensify. Please reach out to your bank to confirm if this option is available for your account, as well as get instructions on how to get this setup.

## Error: Account Setup
This error message typically indicates that there's something you need to do on your bank account's end. Please visit your online banking portal and check if there are any pending actions required. Once you've addressed those, you can try connecting your card again.
For Amex cardholders with multiple card programs in your Amex US Business account: To import multiple card programs into Expensify, you'll need to contact Amex and request that they separate the multiple card programs into distinct logins. For instance, you'll want to have your _Business Platinum_ cards under *"username1/password1"* and _Business Gold_ cards under *"username2/password2."* This ensures smooth integration with Expensify.

## Error: Account type not supported
If Expensify doesn't have a direct connection to your bank/credit card provider, we can still support the connection via spreadsheet import, which you can learn more about [here](https://help.expensify.com/articles/expensify-classic/bank-accounts-and-credit-cards/company-cards/CSV-Import). If the cards you're trying to import are company cards, it’s possible that you might be able to obtain a commercial feed directly from your bank. Please find more information on this [here](https://help.expensify.com/articles/expensify-classic/bank-accounts-and-credit-cards/company-cards/Commercial-Card-Feeds).

## Error: Username/Password/Questions out of date
Your company card connection is broken because we're missing some answers to some security questions. Please head to *Settings* > *Domain* > _[Domain Name]_ > *Company Cards* and click _Fix Card_.
This will require you to answer your bank's security questions. You will need to do this for each security question you have with your bank; so if you have 3 security questions, you will need to do this 3 times.

## Error: Account not found/Card number changed
This error message appears when you have been issued a new card, or if there's been a significant change to the account in some other way (password and/or card number change).
When your online bank/card account password has been changed, you may need to update the details on the Expensify end as well. To do this, navigate to *Settings* > *Domain* > _[Domain Name]_ > *Company Cards* and click _Fix Card_.
If there’s been a recent change to the card number, you’ll have to remove the card with the previous number and re-import the card using the new number. A Domain Admin will have to re-assign the card via *Settings* > *Domain* > _Domain Name_ > *Company Cards*. Before removing the card, please ensure *all Open reports have been submitted*, as removing the card will remove all imported transactions from the account that are associated with that card.

## Error: General connection error
This error message states that your bank or credit card provider is under maintenance and is unavailable at this time. Try waiting a few hours before trying to import your credit card again. Check out our [status page](https://status.expensify.com/) for updates on bank/credit card connections, or you can also choose to subscribe to updates for your specific account type.

## Error: Not seeing cards listed after a successful login
The card will only appear in the drop-down list for assignment once it’s activated and there are transactions that have been incurred and posted on the card. If not, the card won't be available to assign to the card holder until then.

# Troubleshooting issues assigning company cards

## Why do bank connections break?
Banks often make changes to safeguard your confidential information, and when they do, we need to update the connection between Expensify and the bank. We have a team of engineers that works closely with banks to monitor this and update our software accordingly when this happens. 
The first step is to check if there have been any changes to your bank information. Have you recently changed your banking password without updating it in Expensify? Has your banking username or card number been updated? Did you update your security questions for your bank?
If you've answered "yes" to any of these questions, a Domain Admins need to update this information in Expensify and manually reestablish the connection by heading to *Settings* > *Domains* > _Domain Name_ > *Company Cards* > *Fix*. The Domain Admin will be prompted to enter the new credentials/updated information and this should reestablish the connection.

## How do I resolve errors while I’m trying to import my card?*
Make sure you're importing your card in the correct spot in Expensify and selecting the right bank connection. For company cards, use the master administrative credentials to import your set of cards at *Settings* > *Domains* > _Domain Name_ > *Company Cards* > *Import Card*.
Please note there are some things that cannot be bypassed within Expensify, including two-factor authentication being enabled within your bank account. This will prevent the connection from remaining stable and will need to be turned off on the bank side. 

## What are the most reliable bank connections in Expensify?*
The most reliable corporate card to use with Expensify is the Expensify Card. We offer daily settlement, unapproved expense limits, and real-time compliance for secure and efficient spending, as well as 2% cash back. Click here to learn more or apply.
Additionally, we've teamed up with major banks worldwide to ensure a smooth import of credit card transactions into your accounts. Corporate cards from the following banks also offer the most dependable connections in Expensify:
- American Express
- Bank of America
- Brex
- Capital One
- Chase
- Citibank
- Stripe
- Wells Fargo

Commercial feeds for company cards are the dependable connections in Expensify. If you have a corporate or commercial card account, you might have access to a daily transaction feed where expenses from Visa, MasterCard, and American Express are automatically sent to Expensify. Reach out to your banking relationship manager to check if your card program qualifies for this feature.

# Troubleshooting American Express Business

## Amex account roles
American Express provides three different roles for accessing accounts on their website. When connecting Amex cards to Expensify, it's crucial to use the credentials of the Primary/Basic account holder. Here's what each role means:
- *Primary/Basic Account Holder*: The person who applied for the American Express Business card, owns the account, manages its finances, and controls card issuance and account management. They can view all charges by other cardmembers on their account. They can see all charges made by other cardmembers on their account.
- *Supplemental Cardmember (Employee Cardmember)*: Chosen by the Primary Card Member (typically an employee on business accounts), they can access their own card info and make payments but can't see other account details.
- *Authorized Account Manager (AAM)*: Chosen by the Primary Card Member, AAMs can manage the account online or by phone, but they can't link cards to services like Expensify. They have admin rights, including adding cards, making payments, canceling cards, and setting limits. To connect cards to Expensify, use the Primary Card Holder's credentials for full access.

## The connection is established but there are no cards to assign

When establishing the connection, you must assign cards during the same session. It isn't possible to create the connection, log out, and assign the cards later, as the connection will not stick, and require you to reattempt the connection again. 

## Amex error: Card isn't eligible
This error comes directly from American Express and is typically related to an account that is not a business account or using credentials that are not the primary account holder credentials. 

## Amex error: Session has expired
If you get an error stating an American Express Business Card “Your session has expired. Please return to Expensify and try again, this always means that you are using the incorrect credentials. Remember, you need to use primary/basic cardholder credentials. If you are not sure which credentials you should use, reach out to American Express for guidance.

## Connect multiple company card programs under the same credentials 
If you have multiple company card programs with the same credentials, you can select ALL programs at once. With this, all programs will be under one dropdown. Make sure to select all cards each time you are adding any cards from any program. 
If you would like your card programs listed under separate dropdowns, you can select only that group making sure to select all cards from that group each time you are adding a new card. 
Once you have authorized the account, you’ll be guided back to Expensify where you’ll assign all necessary cards across all programs.  
This will store all cards under the same American Express Business connection dropdown and allow all cards to be added to Expensify for you to assign to users.
*Important Reminder*: Whenever you need to access the connection to assign a new card, you must still choose "ALL card programs." For instance, if you have a new employee with a card under your Business Gold Rewards Card program, you'll still need to authorize all the cards in that program or all the programs if you have only one dropdown menu!

## Add cards under different programs with different logins
If you have multiple card programs with different credentials, you will need to have another Domain Admin account add each card program from their own account.  
Once all Domain Admins have connected and assigned the cards that they are the Primary account holder for, all cards will be listed under one *American Express (New and Upgraded)* list in the Domain Company Card page.
