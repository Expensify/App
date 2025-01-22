---
title: Commercial-feeds.md
description: Commercial feeds
---
# Overview
Commercial feeds are the most reliable way to import company card expenses. They remain unaffected by changes to bank login credentials or UI updates, making them highly recommended for those eligible.
The easiest way to confirm your eligibility for a commercial feed is to ask your bank directly.
# Prerequisites for enabling a commercial feed 
If you haven't already, you need to create a workspace before setting up a commercial feed. Go to Settings > Workspaces > New workspace to create one.
Additionally, you’ll need to enable company cards on your workspace by navigating to Settings > Workspaces > [your workspace] > More features, and toggling on Company cards. Note that upgrading to the Control plan is required to access this feature.
# How to set up a Mastercard commercial feed 
Your bank must access Mastercard's SmartData portal to complete the process. Expensify is a registered vendor in the portal, so no additional Mastercard forms are required. Your bank may, however, have its own forms.
## Steps to add a Mastercard commercial feed:
Contact your banking relationship manager and request that your CDF (Common Data File) feed be sent directly to Expensify in the Mastercard SmartData Portal (file type: CDF version 3 Release 11.01). Specify the earliest transaction date you need in the feed.
The bank will initiate feed delivery by selecting Expensify in Mastercard's portal and will email you the distribution ID.
While waiting for your bank, ensure your Control plan workspace in Expensify is set up.
Submit the distribution ID in Expensify by navigating to Settings > Workspaces > [your workspace] > Company cards > Add cards, selecting your bank (choose "Other" if not listed), and then selecting Mastercard Commercial Cards.
Once submitted, Expensify will connect the feed and notify you when it’s enabled.
# How to set up a Visa commercial feed
## Steps to add a Visa commercial feed:
Contact your banking relationship manager and request that your VCF (Variant Call Format) feed be sent directly to Expensify. Share this with your bank: "There’s a checkbox in your Visa Subscription Management portal that can be selected to enable the feed, eliminating the need for a test file."
Request the feed filename or raw file information, including the Processor ID, Financial Institution (bank) ID, and Company ID.
While waiting for your bank, ensure your Control plan workspace in Expensify is set up.
Submit the required IDs in Expensify by navigating to Settings > Workspaces > [your workspace] > Company cards > Add cards, selecting your bank (choose "Other" if not listed), and then selecting Visa Commercial Cards.
Once submitted, Expensify will connect the feed and notify you when it’s enabled.

# How to set up an American Express corporate feed 
To begin, fill out Amex's required forms and send them to Amex for processing. Download the forms [here](https://drive.google.com/file/d/1zqDA_MCk06jk_fWjzx2y0r4gOyAMqKJe/view?usp=sharing). 

## Instructions for filling out the Amex forms:
PAGE 1
Corporation Name: The legal name of your company on file with American Express
Corporation Address: The legal address of your company
Requested Feed Start Date: The earliest transaction date you want in Expensify (use international date format: DD/MM/YY or spelled out, e.g., January 1, 1900).
Requestor Contact: Name of the person completing the request
Email Address: Email of the person completing the request
Control Account Number: The master or basic control account number for the cards you’d like to add (not a credit card number). Contact Amex if you need assistance identifying the correct number.
PAGE 2
No information required
PAGE 3
Client Registered Name: The legal name of your company on file with American Express
Master Control Account or Basic Control Account: Same as the control account number on page 1
PAGE 4
Country List: The country where the account originates
Client Authorization: Complete your full name, job title, and date (use international date format i.e., DD/MM/YY). Sign where indicated.


## Steps to add an American Express corporate feed:
Send the completed forms to electronictransmissionsteam@aexp.com and request they send your corporate card feed to Expensify. You should receive a confirmation email within a few days.
While waiting, ensure your Control plan workspace in Expensify is set up.
Amex will send a Production Letter with delivery file name information (e.g., R123456_B123456789_GL1025_001_$DATE$$TIME$_$SEQ$).
Submit the delivery file name in Expensify by navigating to Settings > Workspaces > [your workspace] > Company cards > Add cards > American Express > American Express Corporate Cards.
Once submitted, Expensify will connect the feed and notify you when it’s enabled.

# How to assign company cards
Once your feed is connected, you can assign cards to employees. To do this, navigate to Settings > Workspaces > [your workspace] > Company cards.

![Click the feed name to view the feed selector]({{site.url}}/assets/images/commfeed/commfeed-01.png){:width="100%"}

If you have multiple feeds, click the feed name at the top left to select the appropriate one.

![Select a feed from the feed selector to view it]({{site.url}}/assets/images/commfeed/commfeed-02.png){:width="100%"}

Click Assign card to select an employee. All workspace members appear in the list.

![Click assign card and select an employee from the list]({{site.url}}/assets/images/commfeed-03.png){:width="100%"}

Select the card you want to assign. Cards only appear if they have recent transactions.

![Select a card from the list]({{site.url}}/assets/images/commfeed/commfeed-04.png){:width="100%"}

Choose a start date:
From the beginning: Imports all available transactions (typically 30-90 days).
Custom start date: Allows you to specify a date.
![Select your transaction start date]({{site.url}}/assets/images/commfeed/commfeed-05.png){:width="100%"}
Review the details and click Assign card. Transactions will import immediately.
![Double check the selections and assign the card]({{site.url}}/assets/images/commfeed/commfeed-06.png){:width="100%"}

# Managing cards 
Clicking an assigned card opens the Card details page, where you can:
Change the card name.
Select a card-specific export account (if connected to accounting software like QuickBooks, NetSuite, Xero, etc.).
Update the card to pull recent transactions.
Unassign the card (note: unassigning deletes unsubmitted expenses on draft reports in the cardholder’s account).
![Manage the card on the card details page]({{site.url}}/assets/commfeed/commfeed-07.png){:width="100%"}

{% include faq-begin.md %}

## My commercial feed is connected. Why is a specific card not appearing for assignment?
Cards appear for assignment if they’re active and have at least one recent transaction. If a card meeting these criteria doesn’t appear, contact your account manager or message concierge@expensify.com.

## Is there an extra fee for using commercial feeds? 
No, commercial feed setup is included in the Control plan.

## What’s the difference between a direct feed and commercial feed? 
Direct feeds use login credentials for quick setup, but can require re-authenticating from time to time. Commercial feeds require bank involvement for setup but offer the most reliable connection.

## I have a Small Business Amex account. Am I eligible to set up a commercial feed? 
Small Business or Triumph Amex accounts may not be eligible for a commercial feed and might need to use an Amex direct feed. 

## Are commercial feeds the best option if my bank isn’t one where Expensify supports direct feeds?
Yes. If direct feeds are not available for your bank, commercial feeds are the best option for importing company card transactions. Currently, Expensify supports direct feeds for:
American Express
Bank of America
Brex
Capital One
Chase
Citibank
Stripe
Wells Fargo


{% include faq-end.md %}



