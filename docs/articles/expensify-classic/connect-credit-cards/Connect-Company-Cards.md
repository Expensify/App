---
title: Connect Company Cards
description: How to set up a direct connection, Commercial Card Feeds, or import cards from a spreadsheet
---

{% include info.html %} This process must be completed by a Domain Admin. {% include end-info.html %}

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

{% include info.html %}
You must [set up your domain](https://help.expensify.com/articles/expensify-classic/domains/Claim-And-Verify-A-Domain) before you can set up a Commercial Card Feed.
{% include end-info.html %}

If your company uses a card program with one of our Approved! Banking Partners, you can easily connect the card feed to Expensify via login credentials. Connecting company cards is a great way to bring all team members’ card expenses into their accounts and conveniently manage card transactions and out-of-pocket expenses in one place. Keeping things organized has never been easier!

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

**I have a Small Business Amex account. Am I eligible to set up a Commercial Card feed?**

If you have a Small Business or Triumph account, you may not be eligible for a Commercial Card feed and will need to use the direct bank connection for American Express Business. 

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

**Why can't I see my CSV transactions immediately after uploading them?**

You'll typically need to wait 1-2 minutes after clicking **I understand, I'll wait!**.

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

**How do I resolve errors while trying to import my card?**

You'll want to ensure that you're importing your card in the correct location in Expensify and selecting the proper bank connection. For company cards, 

1. Hover over **Settings** and click **Domains**.
2. Select the desired domain.
3. Click **Import Card**.
4. Use the master administrative credentials to import your set of cards.

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

This should reestablish the connection. If you are still experiencing issues with the card connection, search for company card troubleshooting or contact Expensify Support for help.

**Why do direct bank connections break?**

Banks often make changes to safeguard your confidential information. And when they do, we have to update the connection between Expensify and the bank. We have a team of engineers who work closely with banks to monitor this and update our software accordingly.

{% include faq-end.md %}
