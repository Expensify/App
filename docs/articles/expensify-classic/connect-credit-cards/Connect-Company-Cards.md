---
title: Connect Company Cards
description: How to set up a direct connection, Commercial Card Feeds, or import cards from a spreadsheet
---

{% include info.html %} 
This process must be completed by a Domain Admin, and you must [set up your domain](https://help.expensify.com/articles/expensify-classic/domains/Claim-And-Verify-A-Domain) before you can connect company cards. 
{% include end-info.html %}

You can connect your company cards using any of the following three options: 

- **Direct Connection**: If you use any of our Approved! Banking Partners below, you can set up a direct connection between Expensify and the bank:
   - Amex
   - Bank of America
   - Brex
   - Capital One
   - Chase
   - Citibank
   - Stripe
   - Wells Fargo

- **Commercial Card Feed**: If your card is not with one of our Approved! Banking Partners, you can set up a Commercial Card Feed to connect your credit card account with Expensify.

- **Spreadsheet import**: Import your cards from a spreadsheet 

# Connect company cards with a direct bank connection

1. Hover over **Settings** and click **Domains**.
2. Select the desired domain.
3. Click **Import Card**. 

![Expensify domain cards](https://help.expensify.com/assets/images/ExpensifyHelp_DomainCards.png){:width="100%"}

{:start="4"}
4. Select your card issuer and enter the mster administrative login credentials.
5. Set a start date from which expenses will appear in the cardholers' accounts.

# Set up a Commercial Card Feed 

To set up a Commercial Card Feed for Mastercard, Visa, or American Express, use the applicable instructions below.

{% include info.html %}
During this process, if you choose to select a transaction start date, any transactions posted prior to that date will not be imported into Expensify. If you do not make a selection, it will default to the earliest available transactions from the card. *Note: Expensify can only import data for the time period released by your credit card company. It's not possible to override the start date the bank has provided via this tool. Depending on your bank, you may be able to go back up to 90 days. To include transactions from an earlier date, you can upload a spreadsheet of those transactions separately using the Import Spreadsheet process below.
{% include end-info.html %}

## MasterCard

Your bank will need to access MasterCard's SmartData portal to complete the process. Expensify is a registered vendor in the portal, so neither you, your bank, nor Expensify need to complete any MasterCard forms (However, your bank may have its own form between you and the bank).

1. Contact your banking relationship manager and request that your Common Data File (CDF) feed be sent directly to Expensify in the MasterCard SmartData Portal (file type: CDF version 3 Release 11.01). Also specify the date of the earliest transactions you want included in the feed. Once this is done, the bank will email you the distribution ID.
2. Once you have the distribution ID, send it to us using [this submission form](https://expensify.typeform.com/to/cGlCAz?typeform-source=community.expensify.com). We will connect the feed once we receive the file details and will notify you once the feed is enabled. 

## Visa

1. Contact your banking relationship manager and request the following:
   - Have them send your Variant Call Format (VCF) feed directly to Expensify. To simplify the process, you can share this information with them: "There is a checkbox in your bank's Visa Subscription Management portal that they, or their BPS team, can select to enable the feed. This means there is no need for a test file because Visa already has agreements with 3rd parties who receive the files."
   - Have them send you the "feed file name" OR the raw file information. You'll need the Processor, Financial Institution (Bank), and Company IDs, which are available in Visa Subscription Management if your relationship manager needs help locating them.
2. Once you have the file information, send it to us using [this submission form](https://expensify.typeform.com/to/cGlCAz?typeform-source=community.expensify.com). We will connect the feed once we receive these details and notify you once the feed is enabled. 

## American Express

1. Complete [Amex's required forms](https://drive.google.com/file/d/1zqDA_MCk06jk_fWjzx2y0r4gOyAMqKJe/view?usp=sharing) so that they can process your feed. Below are instructions for filling out each page of the Amex form:
   - PAGE 1
      - **Corporation Name**: The legal name of your company on file with American Express
      - **Corporation Address**: The legal address of your company
      - **Requested Feed Start Date**: The date you want transactional data to start feeding into Expensify. This date must be in an international date format (i.e., DD/MM/YY or spelled out January 1, 1900) to ensure the correct date. If you'd like historical data, select a date back as far as you'd prefer. 
      - **Requestor Contact**: The name of the individual party completing the request
      - **Email address**: The email address of the individual party completing the request
      - **Control Account Number**: The master or basic control account number corresponding to the cards you'd like to be on the feed. *Note: This will not be a credit card number. If you need help with the correct control account number, contact Amex.*
   - PAGE 2
      - No information required.
   - PAGE 3
      - **Client Registered Name**: The legal name of your company on file with American Express
      - **Master Control Account or Basic Control Account**: Same as page 1; the master or basic control account number corresponding to the cards you'd like to be on the feed. *Note this will not be a credit card number. If you need help with the correct control account number, contact Amex.*
   - PAGE 4
      - **Country List**: The country for the account that you're requesting a feed for
      - **Client Authorization**: Complete your full first and last name, job title, and date. *Note: This date must in an international date format (i.e., DD/MM/YY). Sign in the area provided.

2. Once you've completed the forms, send them to electronictransmissionsteam@aexp.com and indicate you want to set up a Commercial Card feed for your company. You should receive a confirmation message from them within a few day with contact and tracking information. Once the feed is complete, Amex will send you a Production Letter. This will have the feed information in it, which will look something like this: R123456_B123456789_GL1025_001_$DATE$$TIME$_$SEQ$

3. Once you have the filename, send it to us using [this submission form](https://expensify.typeform.com/to/cGlCAz?typeform-source=community.expensify.com).

# ANZ Visa

You can import your ANZ Visa card into Expensify allows your card transactions to flow into your Expensify account. These transactions will then merge automatically with any SmartScanned receipts in your Expensify reports. 

You can connect ANZ to Expensify using your ANZ Internet Banking portal or ANZ Direct Online.

## Connect via ANZ Internet Banking

1. Log in to the ANZ Internet Banking portal.
2. Click **Your Settings** and select **Manage bank feeds**.
3. Select **Expensify**.
4. Complete and submit the Internet Banking Data authority form (or the ANZ Direct Online authority form). 

Once you’ve filled out and submitted your Internet Banking data authority form or the ANZ Direct Online authority form, ANZ will set up the feed and send all the details directly to Expensify. Then we’ll add the card feed to your Expensify account and send you a message to let you know that it has been set up. We'll also include some webinar training resources to ensure you have all the information you need.

## Connect via ANZ Direct Online

1. Log in to ANZ Direct Online with your ANZ credentials.
2. Complete the ANZ Direct Online authority form by creating a batch and submitting the Expensify Accounts Disclosure Authority secure mail template form. 

Once you’ve filled out and submitted your Internet Banking data authority form or the ANZ Direct Online authority form, ANZ will set up the feed and send all the details directly to Expensify. Then, we’ll add the card feed to your Expensify account and send you a message to let you know that it has been set up. We'll also include some webinar training resources to ensure you have all the information you need.

You can upload a CSV file containing your company card transactions and assign them to cardholders within your Expensify domain. This is also a good option to manage company card expenses when direct connections or commercial card feeds aren't available. 

{% include info.html %}
To complete this process, you must have Domain Admin access.
{% include end-info.html %}

# Import company cards from spreadsheet

1. Download a CSV of transactions from your bank by logging into their website and finding the relevant statement.
2. Format the CSV for upload using [this template](https://s3-us-west-1.amazonaws.com/concierge-responses-expensify-com/uploads%2F1594908368712-Best+Example+CSV+for+Domains.csv) as a guide. At a minimum, your file must include the following columns:
  - **Card Number**: Each number in this column should display at least the last four digits, and you can obscure up to 12 characters 
(e.g., 543212XXXXXX12334).
  - **Posted Date**: Use the YYYY-MM-DD format in this column (and any other date column in your spreadsheet).
  - **Merchant**: Enter the name of the individual or business that provided goods or services for the transaction.
  - **Posted Amount**: Use the number format in this column and indicate any negative amounts with parentheses (e.g., (335.98) for -$335.98).
  - **Posted Currency**: Use currency codes (e.g., USD, GBP, EUR) to indicate the currency of the posted transactions.
  - You can also add mapping for Categories and Tags, but those parameters are optional.
![Your CSV template should include, at a minimum, a column for the card number, posted date, merchant, posted amount, and posted currency.](https://help.expensify.com/assets/images/csv-01.png){:width="100%"}

{:start="3"}
3. In Expensify, hover over **Settings** and click **Domains**. 
4. Select the desired domain. 
5. Click **Manage/Import CSV**.
![Click Manage/Import CSV located in the top right between the Issue Virtual Card button and the Import Card button.](https://help.expensify.com/assets/images/csv-02.png){:width="100%"}

{:start="6"}
6. Create a Company Card Layout Name for your spreadsheet.
7. Click **Upload CSV**.
8. Review the mapping of your spreadsheet to ensure that the Card Number, Date, Merchant, Amount, and Currency fields match your data. 
9. Review the Output Preview for any errors and refer to the common error solutions listed in the FAQ below, if needed. 
10. Once the mapping is correct, click **Submit Spreadsheet** to complete the import.
11. Click **I'll wait a minute**, then wait about 1-2 minutes for the import to process. The domain page will refresh once the upload is complete.

{% include faq-begin.md %}

**Is there a fee for utilizing Commercial Card Feeds?**

Commercial Card Feed setup comes at no extra cost and is a part of the Corporate Workspace pricing.

**What is the difference between Commercial Card Feeds and your direct bank connections?**

The direct bank connection is a connection set up with your login credentials for that account, while the Commercial Card feed is set up by your bank requesting that Visa/MasterCard/Amex send a daily transaction feed to Expensify. A direct bank connection can be done without the assistance of your bank or Expensify, but a Commercial Card Feed requires support from your bank and Expensify to set up.

**What happens if I change my password with my credit card company? Does that affect my Commercial Card Feed?**

Commercial Card Feeds cannot be interrupted by common changes on the bank’s side such as updating login credentials or a change in the bank’s website.

**Why did I receive an error message when I was uploading my CSV, and how do I resolve it?**

If the CSV upload isn't formatted correctly, it may cause the following errors when you try to import or assign cards.  

*Error: "Attribute value mapping is missing"*

This error means that the spreadsheet may be missing critical details like the card number, date, merchant, amount, or currency. 

To resolve this error, 

1. Click the **X** at the top of the page to close the mapping window.
2. Confirm what's missing from the spreadsheet.
3. Add a new column to your spreadsheet and add the missing detail.
4. Click **Manage Spreadsheet** to upload the revised spreadsheet.
5. Enter a **Company Card Layout Name**.
6. Click **Upload CSV**.

*Error: "We've detected an error while processing your spreadsheet feed"*

This error usually occurs when there's an upload issue. 

To resolve this error, 

1. Hover over **Settings** and click **Domains**. 
2. Select the desired domain name.
3. Click **Manage/Import CSV**.
4. In the "Upload Company Card transactions for" dropdown, look for the layout name you previously created.
   - If the layout is listed, wait at least one hour and then sync the cards to see if new transactions are imported. 
   - If the layout isn't listed, create a new company card layout name and upload the spreadsheet again.

*Error: "An unexpected error occurred, and we could not retrieve the list of cards"*

This error occurs when there's an issue uploading the spreadsheet or the upload fails. 

To resolve this error,

1. Hover over **Settings** and click **Domains**. 
2. Select the desired domain name.
3. Click **Manage/Import CSV**.
4. In the "Upload Company Card transactions for" dropdown, look for the layout name you previously created.
   - If the layout is listed, wait at least one hour and then sync the cards to see if new transactions are imported. 
   - If the layout isn't listed, create a new company card layout name and upload the spreadsheet again.

**I added a new parameter to an existing spreadsheet, but the data isn't showing in Expensify after the upload completed.**

This may mean that the modification caused an issue. 

1. Hover over **Settings** and click **Domains**. 
2. Select the desired domain name.
3. Click **Manage/Import CSV**.
4. Select your saved layout in the dropdown list.
5. Click **Upload CSV** and select the revised spreadsheet.
6. Compare the Output Preview row count to your revised spreadsheet to ensure they match.
   - If they don't match, revise the spreadsheet by following the CSV formatting guidelines in step 2 of the "Import company cards via CSV" process above. Once you do that, save the revised spreadsheet with a new layout name and try to upload the revised spreadsheet again. 

**I'm trying to import a credit. Why isn't it uploading?**

Negative expenses shouldn't include a minus sign. Instead, they should just be wrapped in parentheses. For example, to indicate "-335.98," you'll want to make sure it's formatted as "(335.98)."

**When I connect multiple card programs to the same domain, the previously connected card gets disconnected.**

If you need to connect a separate card program from the same bank (that's accessed via a different set of login credentials), when you try to import it by clicking **Import Card/Bank**, the connection to your previous card will be disconnected. 

To fix this, you must contact your bank and request to combine all of your cards under a single login. This allows you to connect all of your cards from that bank to Expensify using a single login. 

**How can I connect and manage my company’s cards centrally if I’m not a domain admin?**

If you can't access Domains, you must request Domain Admin access from an existing Domain Admin (usually the Workspace Owner).

**Are direct bank connections the best option for connecting credit cards to Expensify?**

Yes, if Expensify offers a connection with your bank. However, if you want enhanced stability and additional functionality, a commercial card feed directly from your bank is a good option, or you can get the Expensify Card.

**Is there a fee for utilizing direct card connections?**

No, direct card connections come at no extra cost.

**What is the difference between commercial card feeds and direct bank connections?**

- The direct bank connection is a connection set up with your login credentials for that account. This can be done without the assistance of your bank or Expensify.
- The Commercial Card feed is set up by your bank requesting that Visa/MasterCard/Amex send a daily transaction feed to Expensify. This option may be more stable and reliable.  

**Why is my card connection broken after it was working just fine?**

Check for any changes to your bank information. 
- Have you recently changed your banking password without updating it in Expensify?
- Has your banking username or card number been updated?
- Did you edit your security questions for your bank?
- Additionally, if your security questions have changed or their answers aren't saved in Expensify. In that case, we won't be able to access your account list.

If you've answered "yes" to any of these questions, you'll need to update this information in Expensify and manually re-establish the connection. Expensify cannot automatically update this information for you.

A Domain Admin can fix the connection by completing the following steps:
1. Hover over **Settings** and click **Domains**.
2. Select the desired domain.
3. To the right of the company card, click **Fix**.
4. Enter the new credentials/updated information.

This should reestablish the connection. However, banks often make changes to safeguard your confidential information. And when they do, we have to update the connection between Expensify and the bank. We have a team of engineers who work closely with banks to monitor this and update our software accordingly.

If you are still experiencing issues with the card connection, search for company card troubleshooting or contact Expensify Support for help.

**I can't find a transaction. Where happened to it?**

If you can't locate a transaction, try the following steps: 

1. **Wait for CSV for post**: If you just uploaded a CSV file, you'll typically need to wait 1-2 minutes after clicking **I understand, I'll wait!**.
2. **Wait for Posting**: Bank transactions may take up to 24 hours to import into Expensify after they have "posted" at your bank. Ensure sufficient time has passed for transactions to appear.
3. **Update Company Cards**: Go to Settings > Domains > Company Cards. Click on the card in question and click "Update" to refresh the card feed.
4. **Reconcile Cards**: Navigate to the Reconciliation section under Settings > Domains > Company Cards. Refer to the detailed guide on how to use the [Reconciliation Dashboard](https://help.expensify.com/articles/expensify-classic/connect-credit-cards/company-cards/Reconciliation#identifying-outstanding-unapproved-expenses-using-the-reconciliation-dashboard).
5. **Review Transactions**: Use the Reconciliation Dashboard to view all transactions within a specific timeframe. Transactions will display on the Expenses page based on their "Posted Date". If needed, uncheck the "use posted date" checkbox near the filters to view transactions based on their "Transaction Date" instead.
6. **Address Gaps**: If there is a significant gap in transactions or if transactions are still missing, contact Expensify's Concierge or your Account Manager. They can initiate a historical data update on your card feed to ensure all transactions are properly imported.

**Known issues importing transactions**

The first step should always be to "Update" your card, either from Settings > Your Account > Credit Card Import or Settings > Domain > [Domain Name] > Company Cards for centrally managed cards. If a "Fix" or "Fix card" option appears, follow the steps to fix the connection. If this fails to import your missing transactions, there is a known issue whereby some transactions will not import for certain API-based company card connections. So far this has been reported on American Express, Chase and Wells Fargo. This can be temporarily resolved by [manually creating the expenses](https://help.expensify.com/articles/expensify-classic/expenses/expenses/Add-an-expense).

**Errors connecting company cards**

*Error: Too many attempts*

If you've been locked out while trying to import a new card, you'll need to wait a full 24 hours before trying again. This lock happens when incorrect online banking credentials are entered multiple times, and it's there for your security — it can't be removed. To avoid this, make sure your online banking credentials are correct before attempting to import your card again.

*Error: Invalid credentials/Login failed*

Verify your ability to log into your online banking portal by attempting to log into your bank account via the banking website. 
Check for any potential temporary outages on your bank's end that may affect third-party connections like Expensify.

For specific card types:

- **Chase Card**: Confirm your password meets their new 8-32 character requirement.
- **Wells Fargo Card**: Ensure your password is under 14 characters. Reset it if necessary before importing your card to Expensify. If your card is already imported, update it and use the "Fix Card" option to reestablish the connection.
- **SVB Card**: Enable Direct Connect from the SVB website and use your online banking username and Direct Connect PIN instead of your password when connecting an SVB card. If connecting via *Settings* > *Domain* > _[Domain Name]_ > *Company Cards*, contact SVB for CDF feed setup.

*Error: Direct Connect not enabled*

Direct Connect will need to be enabled in your account for your bank/credit card provider before you can import your card to Expensify. Please reach out to your bank to confirm if this option is available for your account, as well as get instructions on how to get this setup.

*Error: Account Setup*

This error message typically indicates that there's something you need to do on your bank account's end. Please visit your online banking portal and check if there are any pending actions required. Once you've addressed those, you can try connecting your card again.
For Amex cardholders with multiple card programs in your Amex US Business account: To import multiple card programs into Expensify, you'll need to contact Amex and request that they separate the multiple card programs into distinct logins. For instance, you'll want to have your _Business Platinum_ cards under *"username1/password1"* and _Business Gold_ cards under *"username2/password2."* This ensures smooth integration with Expensify.

*Error: Account type not supported*

If Expensify doesn't have a direct connection to your bank/credit card provider, we can still support the connection via spreadsheet import, which you can learn more about [here](https://help.expensify.com/articles/expensify-classic/bank-accounts-and-credit-cards/company-cards/CSV-Import). If the cards you're trying to import are company cards, it’s possible that you might be able to obtain a commercial feed directly from your bank. Please find more information on this [here](https://help.expensify.com/articles/expensify-classic/bank-accounts-and-credit-cards/company-cards/Commercial-Card-Feeds).

*Error: Username/Password/Questions out of date*

Your company card connection is broken because we're missing some answers to some security questions. Please head to *Settings* > *Domain* > _[Domain Name]_ > *Company Cards* and click _Fix Card_.
This will require you to answer your bank's security questions. You will need to do this for each security question you have with your bank; so if you have 3 security questions, you will need to do this 3 times.

*Error: Account not found/Card number changed*

This error message appears when you have been issued a new card, or if there's been a significant change to the account in some other way (password and/or card number change). When your online bank/card account password has been changed, you may need to update the details on the Expensify end as well. To do this, navigate to *Settings* > *Domain* > _[Domain Name]_ > *Company Cards* and click _Fix Card_.

If there’s been a recent change to the card number, you’ll have to remove the card with the previous number and re-import the card using the new number. A Domain Admin will have to re-assign the card via *Settings* > *Domain* > _Domain Name_ > *Company Cards*. Before removing the card, please ensure *all Open reports have been submitted*, as removing the card will remove all imported transactions from the account that are associated with that card.

*Error: General connection error*

This error message states that your bank or credit card provider is under maintenance and is unavailable at this time. Try waiting a few hours before trying to import your credit card again. Check out our [status page](https://status.expensify.com/) for updates on bank/credit card connections, or you can also choose to subscribe to updates for your specific account type.

*Error: Not seeing cards listed after a successful login*

The card will only appear in the drop-down list for assignment once it’s activated and there are transactions that have been incurred and posted on the card. If not, the card won't be available to assign to the card holder until then.

**How do I resolve errors while I’m trying to import my card?**

Make sure you're importing your card in the correct spot in Expensify and selecting the right bank connection. For company cards, use the master administrative credentials to import your set of cards at *Settings* > *Domains* > _Domain Name_ > *Company Cards* > *Import Card*.
Please note there are some things that cannot be bypassed within Expensify, including two-factor authentication being enabled within your bank account. This will prevent the connection from remaining stable and will need to be turned off on the bank side. 

**Why are there duplicates?**

Duplicates may appear if: 

- You recently unassigned and reassigned a company card with an overlapping start date. If this is the case and expenses on the “new” copy have not been submitted, you can unassign the card again and reassign it with a more appropriate start date. This action will delete all unsubmitted expenses from the new card feed.
- An employee imports an expense as a personal credit card expense and their Domain Admin also assigns them the same expense for a company card. If this is the case, have the employee navigate to Settings > Account > Credit Card Import and confirm that their card is only listed once. If the card is listed twice, delete the entry without the lock icon.

***Important**: Deleting a duplicate card will delete all unapproved expenses from that transaction feed. Transactions associated with the remaining card will not be affected. If receipts were attached to those transactions, they will still be on the Expenses page, and the employee can click to SmartScan them again.*

**What are the most reliable bank connections in Expensify?**
All bank connections listed below are extremely reliable, but we recommend transacting with the [Expensify Visa® Commercial Card](https://use.expensify.com/company-credit-card). It also offers daily and monthly settlement, unapproved expense limits, real-time compliance for secure and efficient spending, and cash back on all US purchases. 

**I have a Small Business Amex account. Am I eligible to set up a Commercial Card Feed?**

If you have a Small Business or Triumph account, you may not be eligible for a Commercial Card Feed and will need to use the direct bank connection for American Express Business. 

**Troubleshooting American Express Business**

*Amex account roles*

American Express provides three different roles for accessing accounts on their website. When connecting Amex cards to Expensify, it's crucial to use the credentials of the Primary/Basic account holder. Here's what each role means:

- **Primary/Basic Account Holder**: The person who applied for the American Express Business card, owns the account, manages its finances, and controls card issuance and account management. They can view all charges by other cardmembers on their account. They can see all charges made by other cardmembers on their account.
- **Supplemental Cardmember (Employee Cardmember)**: Chosen by the Primary Card Member (typically an employee on business accounts), they can access their own card info and make payments but can't see other account details.
- **Authorized Account Manager (AAM)**: Chosen by the Primary Card Member, AAMs can manage the account online or by phone, but they can't link cards to services like Expensify. They have admin rights, including adding cards, making payments, canceling cards, and setting limits. To connect cards to Expensify, use the Primary Card Holder's credentials for full access.

*The connection is established but there are no cards to assign*

When establishing the connection, you must assign cards during the same session. It isn't possible to create the connection, log out, and assign the cards later, as the connection will not stick, and require you to reattempt the connection again. 

*Amex error: Card isn't eligible*

This error comes directly from American Express and is typically related to an account that is not a business account or using credentials that are not the primary account holder credentials. 

*Amex error: Session has expired*

If you get an error stating an American Express Business Card “Your session has expired. Please return to Expensify and try again," this means that you are using the incorrect credentials. Remember, you need to use primary/basic cardholder credentials. If you are not sure which credentials to use, reach out to American Express for support.

*Connect multiple company card programs under the same credentials*

- If you have multiple company card programs with the same credentials, you can select ALL programs at once. With this, all programs will be under one dropdown. Make sure to select all cards each time you are adding any cards from any program. 
- If you would like your card programs listed under separate dropdowns, you can select only that group making sure to select all cards from that group each time you are adding a new card. 

Once you have authorized the account, you’ll be guided back to Expensify where you’ll assign all necessary cards across all programs.  
This will store all cards under the same American Express Business connection dropdown and allow all cards to be added to Expensify for you to assign to users.

***Important Reminder**: Whenever you need to access the connection to assign a new card, you must still choose "ALL card programs." For instance, if you have a new employee with a card under your Business Gold Rewards Card program, you'll still need to authorize all the cards in that program or all the programs if you have only one dropdown menu!*

*Add cards under different programs with different logins*

If you have multiple card programs with different credentials, you will need to have another Domain Admin account add each card program from their own account. Once all Domain Admins have connected and assigned the cards that they are the Primary account holder for, all cards will be listed under one *American Express (New and Upgraded)* list in the Domain Company Card page.

{% include faq-end.md %}
