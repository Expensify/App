---
title: Set Up Commercial Card Feeds
description: How to set up MasterCard, Visa, and American Express commercial card feeds and assign company cards
---

A Commercial Card Feed is a connection that’s established directly between Expensify and your bank. This type of connection is considered the most reliable way to import company card expenses. Commercial Card Feeds cannot be interrupted by common changes on the bank’s side such as updating login credentials or a change in the bank’s website.

The easiest way to confirm if your company card program is eligible for a commercial bank feed is to ask your bank directly. If your company uses a commercial card program that isn’t with one of our Approved! Banking Partners, the best way to import your company cards is by setting up a direct Commercial Card Feed between Expensify and your bank.

{% include info.html %}
You must [set up your domain](https://help.expensify.com/articles/expensify-classic/domains/Claim-And-Verify-A-Domain) before you can set up a Commercial Card Feed. 
{% include end-info.html %}

# Set up a Commercial Card Feed 

To set up a Commercial Card Feed for Mastercard, Visa, or American Express, use the applicable instructions below.

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

# Assign company cards

After connecting your company cards with Expensify, you can assign each card to its respective cardholder. 

1. Hover over **Settings** and click **Domains**. 
2. Select the desired domain.
3. Click the card dropdown menu and select the desired feed from the list.
4. Click **Assign New Cards** to populate the emails and the last four digits of the cardholder. 

![Under the Company Cards tab on the left, you'll use the dropdown menu to select a card and beneath that, you'll click Assign New Cards]({{site.url}}/assets/images/CompanyCards_Assign.png){:width="100%"}
{:start="5"}

5. Select the cardholder.
6. Enter or select the employee's email address. *Note: Employees must have an email address under this domain in order to assign a card to them.*
![Below the Assign a Card header, enter or select the employee's email address]({{site.url}}/assets/images/CompanyCards_EmailAssign.png){:width="100%"}
{:start="8"}

8. Select the last four digits of the card number.
9. (Optional) Select the transaction start date, if desired.
10. Click **Assign**.
11. Select the card. You can search the list using the last 4 digits of the card number.
   - If no transactions have posted on the card, the card number will not appear in the list. Instead, you can assign the card by typing in the full card number in the field. *Note: if you're assigning a card by typing in the full PAN (the full card number), press the ENTER key on your keyboard afterwards. The field may clear itself after pressing ENTER, but click Assign anyway and then verify that the assignment shows up in the cardholder table.*

## Set the transaction start date (optional)

{% include info.html %}
Any transactions posted prior to the transaction start date will not be imported into Expensify. If you do not make a selection, it will default to the earliest available transactions from the card. *Note: We can only import data for the time period the bank is releasing to us. It's not possible to override the start date the bank has provided via this tool.*
{% include end-info.html %}

1. Click **Assign**. Once assigned, you'll see each cardholder associated with their card as well as the start date listed.

If you're using a connected accounting system such as NetSuite, Xero, Intacct, Quickbooks Desktop, or QuickBooks Online, you can also connect the card to export to a specific credit card GL account:

1. Hover over **Settings** and click **Domains**. 
2. Select the desired domain.
3. Click **Edit Exports** and select the general ledger (GL) account you want to export expenses to.

After the account is set, exported expenses will be mapped to the selected account when exported by a Domain Admin.

# Unassign company cards

{% include info.html %}
Unassigning a company card will delete any unsubmitted (Open or Unreported) expenses in the cardholder's account.
{% include end-info.html %}

To unassign a specific card, click the Actions button to the right of the card and click **Unassign**.

![Click the Actions button to the right of the card and select Unassign.]({{site.url}}/assets/images/CompanyCards_Unassign.png){:width="100%"}

To completely remove the card connection, unassign every card from the list and then refresh the page.

*Note: If expenses are Processing and then rejected, they will also be deleted when they're returned to an Open state, as the card they're linked to no longer exists.*

{% include faq-begin.md %}

**My Commercial Card Feed is set up. Why is a specific card not coming up when I try to assign it to an employee?**

Cards will appear in the dropdown when they are activated and have at least one posted transaction. If the card is activated and has been used for a while and you're still not seeing it, reach out to your Account Manager or message concierge@expensify.com for further assistance.

**Is there a fee for utilizing Commercial Card Feeds?**

Commercial Card Feed setup comes at no extra cost and is a part of the Corporate Workspace pricing.

**What is the difference between Commercial Card Feeds and your direct bank connections?**

The direct bank connection is a connection set up with your login credentials for that account, while the Commercial Card feed is set up by your bank requesting that Visa/MasterCard/Amex send a daily transaction feed to Expensify. A direct bank connection can be done without the assistance of your bank or Expensify, but a Commercial Card Feed requires support from your bank and Expensify to set up.

**I have a Small Business Amex account. Am I eligible to set up a Commercial Card feed?**

If you have a Small Business or Triumph account, you may not be eligible for a Commercial Card feed and will need to use the direct bank connection for American Express Business.

**What if my bank uses a Commercial Card program that isn't with one of Expensify's Approved! Banking partners?**

The Approved! Banking Partners include: 
- Bank of America
- Citibank
- Capital One
- Chase
- Wells Fargo 
- Amex
- Stripe
- Brex

If your bank isn't included in this list, the best way to import your company cards is by setting up a direct Commercial Card Feed between Expensify and your bank. 

{% include faq-end.md %}
