---
title: Commercial-feeds.md
description: Commercial feeds
---

# Overview
Commercial feeds are the most reliable way to import company card expenses. They remain unaffected by changes to bank login credentials or UI updates, making them highly recommended for those eligible.

The easiest way to confirm your eligibility for a commercial feed is to ask your bank directly.

# Prerequisites for Enabling a Commercial Feed 
If you haven't already, you need to create a workspace before setting up a commercial feed. Go to **Settings > Workspaces > New workspace** to create one. You can add one commercial or [direct feed](https://help.expensify.com/articles/new-expensify/connect-credit-cards/Direct-feeds) on the Collect plan. Upgrading to the Control plan allows you to add unlimited company cards. 

# How to Set Up a Mastercard Commercial Feed 
Your bank must access Mastercard's SmartData portal to complete the process. Expensify is a registered vendor in the portal, so no additional Mastercard forms are required. Your bank may, however, have its own forms.

## Steps to Add a Mastercard Commercial Feed:
1. Contact your banking relationship manager and request that your CDF (Common Data File) feed be sent directly to Expensify in the Mastercard SmartData Portal (file type: CDF version 3 Release 11.01). Specify the earliest transaction date you need in the feed.
2. The bank will initiate feed delivery by selecting Expensify in Mastercard's portal and will email you the distribution ID.
3. While waiting for your bank, ensure your workspace in Expensify is set up.
4. Submit the distribution ID in Expensify by navigating to **Settings > Workspaces > [your workspace] > Company cards > Add cards**, selecting your bank (choose "Other" if not listed), and then selecting **Mastercard Commercial Cards**.
5. Once submitted, Expensify will connect the feed and notify you when it’s enabled.
   
# How to Set Up a Visa Commercial Feed
## Steps to Add a Visa Commercial Feed:
1. Contact your banking relationship manager and request that your VCF (Variant Call Format) feed be sent directly to Expensify. Share this with your bank: "There’s a checkbox in your Visa Subscription Management portal that can be selected to enable the feed, eliminating the need for a test file."
2. Request the feed filename or raw file information, including the Processor ID, Financial Institution (bank) ID, and Company ID.
3. While waiting for your bank, ensure your workspace in Expensify is set up.
4. Submit the required IDs in Expensify by navigating to **Settings > Workspaces > [your workspace] > Company cards > Add cards**, selecting your bank (choose "Other" if not listed), and then selecting **Visa Commercial Cards**.
5. Once submitted, Expensify will connect the feed and notify you when it’s enabled.

# How to Set Up an American Express Corporate Feed 
To begin, fill out Amex's required forms and send them to Amex for processing. Download the forms [here](https://drive.google.com/file/d/1zqDA_MCk06jk_fWjzx2y0r4gOyAMqKJe/view?usp=sharing). 

## Instructions for Filling Out the Amex Forms:
**PAGE 1**
- **Corporation Name:** The legal name of your company on file with American Express
- **Corporation Address:** The legal address of your company
- **Requested Feed Start Date:** The earliest transaction date you want in Expensify (use international date format: DD/MM/YY or spelled out, e.g., January 1, 1900).
- **Requestor Contact:** Name of the person completing the request
- **Email Address:** Email of the person completing the request
- **Control Account Number:** The master or basic control account number for the cards you’d like to add (not a credit card number). Contact Amex if you need assistance identifying the correct number.

**PAGE 2**
No information required

**PAGE 3**
- **Client Registered Name:** The legal name of your company on file with American Express
- **Master Control Account or Basic Control Account:** Same as the control account number on page 1

**PAGE 4**
- **Country List:** The country where the account originates
- **Client Authorization:** Complete your full name, job title, and date (use international date format i.e., DD/MM/YY). Sign where indicated.

## Steps to Add an American Express Corporate Feed:
1. Send the completed forms to **electronictransmissionsteam@aexp.com** and request they send your corporate card feed to Expensify. You should receive a confirmation email within a few days.
2. While waiting, ensure your workspace in Expensify is set up.
3. Amex will send a Production Letter with delivery file name information (e.g., `R123456_B123456789_GL1025_001_$DATE$$TIME$_$SEQ$`).
4. Submit the delivery file name in Expensify by navigating to **Settings > Workspaces > [your workspace] > Company cards > Add cards > American Express > American Express Corporate Cards**.
5. Once submitted, Expensify will connect the feed and notify you when it’s enabled.

# How to Assign Company Cards
Once your feed is connected, you can assign cards to employees. To do this, navigate to **Settings > Workspaces > [your workspace] > Company cards**.

![Click the feed name to view the feed selector]({{site.url}}/assets/images/commfeed/commfeed-01-updated.png){:width="100%"}

If you have multiple feeds, click the feed name at the top left to select the appropriate one.

![Select a feed from the feed selector to view it]({{site.url}}/assets/images/commfeed/commfeed-02-updated.png){:width="100%"}

Click **Assign card** to select an employee. All workspace members appear in the list.

![Click assign card and select an employee from the list]({{site.url}}/assets/images/commfeed/commfeed-03-updated.png){:width="100%"}

Select the card you want to assign. Cards only appear if they have recent transactions.

![Select a card from the list]({{site.url}}/assets/images/commfeed/commfeed-04-updated.png){:width="100%"}

Choose a start date:
- **From the beginning:** Imports all available transactions (typically 30-90 days).
- **Custom start date:** Allows you to specify a date.
  
![Select your transaction start date]({{site.url}}/assets/images/commfeed/commfeed-05-updated.png){:width="100%"}

Review the details and click **Assign card**. Transactions will import immediately.

![Double check the selections and assign the card]({{site.url}}/assets/images/commfeed/commfeed-06-updated.png){:width="100%"}

# Managing Cards
Once a card is assigned, you can manage its settings by navigating to **Settings > Workspaces > [your workspace] > Company cards** and selecting the assigned card.

## Available Card Management Actions:
- **Rename the Card**: Change the card name for easier identification.
- **Set a Specific Export Account**: If connected to accounting software like QuickBooks, NetSuite, or Xero, you can assign a unique export account for this card.
- **Update Transactions**: Manually refresh the card feed to pull in the latest transactions.
- **Unassign the Card**: Removing a card unassigns it from the employee and deletes unsubmitted expenses from draft reports in their account.

![Manage the card on the card details page]({{site.url}}/assets/images/commfeed/commfeed-07-updated.png){:width="100%"}

# FAQ 

## My commercial feed is connected. Why is a specific card not appearing for assignment?
Cards appear for assignment if they’re active and have at least one recent transaction. If a card meeting these criteria doesn’t appear, contact your account manager or message concierge@expensify.com.

## Is there an extra fee for using commercial feeds? 
No, the Collect plan includes one commercial feed. You can add additional commercial feeds by upgrading to the Control plan.

## What’s the difference between a direct feed and commercial feed? 
Direct feeds use login credentials for quick setup, but can require re-authenticating from time to time. Commercial feeds require bank involvement for setup but offer the most reliable connection.

