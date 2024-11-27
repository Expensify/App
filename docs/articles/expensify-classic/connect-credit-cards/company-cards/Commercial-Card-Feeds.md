---
title: Commercial Card Feeds
description: Commercial Card Feeds
---
# Overview
A Commercial Card Feed is a connection that’s established directly between Expensify and your bank. This type of connection is considered the most reliable way to import company card expenses. Commercial Card Feeds cannot be interrupted by common changes on the bank’s side such as updating login credentials or a change in the bank’s UI.

The easiest way to confirm if your company card program is eligible for a commercial bank feed is to ask your bank directly. If your company uses a commercial card program that isn’t with one of our Approved! Banking Partners (which supports connecting the feed via login credentials), the best way to import your company cards is by setting up a direct Commercial Card Feed between Expensify and your bank.

# How to set up a Commercial Card Feed 
Before setting up a Commercial Card Feed, you’ll want to set up your domain in Expensify. You can do this by going to Settings > Domains > New Domain.

After the domain is set up in Expensify, you can follow the instructions that correspond with your company’s card program.

# How to set up a MasterCard Commercial Feed 
Your bank will need to access MasterCard's SmartData portal to complete the process. Expensify is a registered vendor in the portal, so neither you, your bank, nor Expensify need to complete any MasterCard forms. (Your bank may have its own form between you and the bank, though.)

These are the steps you'll need to follow for a MasterCard feed:
- Contact your banking relationship manager and request that your CDF (Common Data File) feed be sent directly to Expensify in the MasterCard SmartData Portal (file type: CDF version 3 Release 11.01). Please also specify the date of the earliest transactions you require in the feed. 
- The bank will initiate feed delivery by finding Expensify in MasterCard's online portal. Once this is done, the bank will email you the distribution ID.
- While you're waiting for your bank, make sure to set up a domain in Expensify -- it's required for us to be able to add the card feed to your account!
- Once you have the distribution ID, send it to us using the submission form [here](https://expensify.typeform.com/to/cGlCAz?typeform-source=community.expensify.com).
- We will connect the feed once we receive the file details and notify you when the feed is enabled. 

# How to set up a Visa Commercial Feed
These are the steps you'll need to follow for a Visa feed:
- Contact your banking relationship manager and request that your VCF (Variant Call Format) feed be sent directly to Expensify. Feel free to share this information with them: "There is a check box in your bank's Visa Subscription Management portal that they, or their BPS team, can select to enable the feed. This means there is no need for a test file because Visa already has agreements with 3rd parties who receive the files."
- Ask your bank to send you the "feed filename" OR the raw file information. You'll need the Processor, Financial Institution (Bank), and Company IDs; these are available in Visa Subscription Management if your relationship manager is still looking for them.
- Once you have the file information, send it to us using the submission form [here](https://expensify.typeform.com/to/cGlCAz?typeform-source=community.expensify.com).
- While you're waiting for your bank, make sure to set up a domain -- it's required for us to be able to add the feed to your account!
- We will connect the feed once we receive these details and notify you when the feed is enabled. 

# How to set up an American Express corporate feed 
To begin the process, you'll need to fill out Amex's required forms and send them to Amex so they can start processing your feed. You can download the forms [here](https://drive.google.com/file/d/1zqDA_MCk06jk_fWjzx2y0r4gOyAMqKJe/view?usp=sharing). 

Below are instructions for filling out each page of the Amex form:
- PAGE 1
  - Corporation Name = the legal name of your company on file with American Express
  - Corporation Address = the legal address of your company
  - Requested Feed Start Date = the date you want transactional data to start feeding into Expensify. If you'd like historical data, be sure to date back as far as you'd prefer. You must put this date in an international date format (i.e., DD/MM/YY or spelled out January 1, 1900) to ensure the correct date.
  - Requestor Contact = the name of the individual party completing the request
  - Email address = the email address of the individual party completing the request
  - Control Account Number = the master or basic control account number corresponding to the cards you'd like to be on the feed. Please note this will not be a credit card number. If you need help with the correct control account number, please contact Amex.
- PAGE 2
  - No information required
- PAGE 3
  - Client Registered Name = the legal name of your company on file with American Express
  - Master Control Account or Basic Control Account = same as from page 1; the master or basic control account number corresponding to the cards you'd like to be on the feed. Please note this will not be a credit card number. If you need help with the correct control account number, please contact Amex.
- PAGE 4
  - Country List = the name of the country in which the account for which you're requesting a feed originates
  - Client Authorization = please complete your full first and last name, job title, and date (note, put this date in an international date format--i.e., DD/MM/YY). Sign in the area provided.

Once you've completed the forms, send them to electronictransmissionsteam@aexp.com and indicate you want to set up a Commercial Card feed for your company. You should receive a confirmation message from them within a day or two with contact and tracking information. 

While you're waiting for Amex, make sure to set up a domain -- it's required for us to be able to add the feed to your account.

Once the feed is complete, Amex will send you a Production Letter. This will have the feed information in it, which will look something like this:
R123456_B123456789_GL1025_001_$DATE$$TIME$_$SEQ$

Once you have the filename, send it to us using the submission form [here](https://expensify.typeform.com/to/cGlCAz?typeform-source=community.expensify.com).

# How to assign company cards
After connecting your company cards with Expensify, you can assign each card to its respective cardholder. 
To assign cards go to Settings > Domains > [Your domain] > Company Cards.
If you have more than one card feed, select the correct feed in the drop-down list in the Company Card section. 
Once you’ve selected the appropriate feed, click the `Assign New Cards` button to populate the emails and last four digits of the cardholder. 

![Assign Cards]({{site.url}}/assets/images/CompanyCards_Assign.png){:width="100%"}

Select the cardholder
You can search the populated list for all employees' email addresses. Please note that the employee will need to have an email address under this Domain in order to assign a card to them.

![Email Assign]({{site.url}}/assets/images/CompanyCards_EmailAssign.png){:width="100%"}

Select the card
You can search the list using the last 4 digits of the card number. If no transactions have posted on the card then the card number will not appear in the list. You can instead assign the card by typing in the full card number in the field.
Note: if you're assigning a card by typing in the full PAN (the full card number), press the ENTER key on your keyboard after. The field may clear itself after pressing ENTER, but click Assign anyway and then verify that the assignment shows up in the cardholder table.

## Set the transaction start date (optional)
Any transactions that were posted prior to this date will not be imported into Expensify. If you do not make a selection, it will default to the earliest available transactions from the card. Note: We can only import data for the time period the bank is releasing to us. It's not possible to override the start date the bank has provided via this tool.

Click the Assign button
Once assigned, you will see each cardholder associated with their card as well as the start date listed.

If you're using a connected accounting system such as NetSuite, Xero, Intacct, QuickBooks Desktop, or QuickBooks Online, you can also connect the card to export to a specific credit card GL account.

Go to Settings > Domains > [Domain name] > Company Cards
Click Edit Exports on the right-hand side of the card table and select the GL account you want to export expenses to.
You're all done. After the account is set, exported expenses will be mapped to the specific account selected when exported by a Domain Admin.

# How to unassign company cards
Before you begin the unassigning process, please note that unassigning a company card will delete any unsubmitted (Open or Unreported) expenses in the cardholder's account.

If you need to unassign a certain card, click the Actions button associated with the card in question and then click "Unassign."

![Unassign Cards]({{site.url}}/assets/images/CompanyCards_Unassign.png){:width="100%"}

To completely remove the card connection, unassign every card from the list and then refresh the page.

Note: If expenses are Processing and then rejected, they will also be deleted when they're returned to an Open state as the card they're linked to no longer exists.

{% include faq-begin.md %}

## My Commercial Card feed is set up. Why is a specific card not coming up when I try to assign it to an employee?
Cards will appear in the drop-down when activated and have at least one posted transaction. If the card is activated and has been used for a while and you're still not seeing it, please reach out to your Account Manager or message concierge@expensify.com for further assistance.

## Is there a fee for utilizing Commercial Card Feeds? 
Nope! Commercial Card Feed setup comes at no extra cost and is a part of the Corporate Workspace pricing.

## What is the difference between Commercial Card feeds and your direct bank connections? 
The direct bank connection is a connection set up with your login credentials for that account, while the Commercial Card feed is set up by your bank requesting that Visa/MasterCard/Amex send a daily transaction feed to Expensify. The former can be done without the assistance of your bank or Expensify, but the latter requires effort from your bank and Expensify to get set up.

## I have a Small Business Amex account. Am I eligible to set up a Commercial Card feed? 
If you have a Small Business or Triumph account, you may not be eligible for a Commercial Card feed and will need to use the direct bank connection for American Express Business.

## What if my bank uses a Commercial Card program that isn't with one of Expensify's Approved! Banking partners?
If your company uses a Commercial Card program that isn’t with one of our Approved! Banking Partners (which supports connecting the feed via login credentials), the best way to import your company cards is by setting up a direct Commercial Card feed between Expensify and your bank. Note the Approved! Banking Partners include: 
- Bank of America
- Citibank
- Capital One
- Chase
- Wells Fargo 
- Amex
- Stripe
- Brex


{% include faq-end.md %}
