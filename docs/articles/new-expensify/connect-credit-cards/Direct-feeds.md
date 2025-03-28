---
title: Direct-feeds.md
description: Direct feeds
---
# Overview
Direct feeds are a quick and reliable way to import company card expenses. Connect your bank to Expensify with your login credentials to be up and running in minutes!

# Prerequisites for enabling a direct feed 
If you haven't already, you need to create a workspace before setting up a direct feed. Go to **Settings > Workspaces > New workspace** to create one.
You can add one direct or [commercial feed](https://help.expensify.com/articles/new-expensify/connect-credit-cards/Commercial-feeds) on the Collect plan. Upgrading to the Control plan allows you to add unlimited company cards. 
# How to set up a direct feed
After creating a workspace, you can add a direct feed by going to **Settings > Workspaces > [your workspace] > Company cards** and selecting **Add cards**. 

![Click add cards to add a card feed]({{site.url}}/assets/images/Direct Feed HelpDot Images/directfeeds_01.png){:width="100%"}

Select your bank from the list. If your bank isn’t there, check out [commercial feeds](https://help.expensify.com/articles/new-expensify/connect-credit-cards/company-cards/Commercial-feeds). 

![Select your bank and click Next]({{site.url}}/assets/images/Direct Feed HelpDot Images/directfeeds_02.png){:width="100%"}

Select **Direct feed**. 

![Select your feed type and click next]({{site.url}}/assets/images/Direct Feed HelpDot Images/directfeeds_03.png){:width="100%"}

Log into your bank’s website using the master credentials (typically those of the account owner with the highest-level access), then follow the steps to select your account(s) and connect them to Expensify. 

![Login to your bank]({{site.url}}/assets/images/Direct Feed HelpDot Images/directfeeds_04.png){:width="100%"}

# How to assign company cards
Once your feed is connected, you can assign cards to employees. To do this, navigate to **Settings > Workspaces > [your workspace] > Company cards**.

![Click company cards in the workspace editor to open the feed]({{site.url}}/assets/images/Direct Feed HelpDot Images/directfeeds_05.png){:width="100%"}

If you have multiple feeds, click the feed name at the top left to select the appropriate one.

![Click the feed name in the top left to open the feed selector where you can select a feed from the list]({{site.url}}/assets/images/Direct Feed HelpDot Images/directfeeds_06.png){:width="100%"}

Click **Assign card** to begin the process. Often, you’ll be prompted to log into your bank before you can assign cards. Select an employee. All workspace members appear in the list.

![Click assign card to begin the flow. Start by selecting a member from the list]({{site.url}}/assets/images/Direct Feed HelpDot Images
/directfeeds_07.png){:width="100%"}

Select the card you want to assign. Cards only appear if they have recent transactions.

![Select a card from the list]({{site.url}}/assets/images/Direct Feed HelpDot Images/directfeeds_08.png){:width="100%"}

Choose a start date:
- **From the beginning**: Imports all available transactions (typically 30-90 days).
- **Custom start date**: Allows you to specify a date.
  
![Choose a transaction start date]({{site.url}}/assets/images/Direct Feed HelpDot Images/directfeeds_09.png){:width="100%"}

Review the details and click **Assign card**. Transactions will import immediately.

![Check your selections and assign the card]({{site.url}}/assets/images/Direct Feed HelpDot Images/directfeeds_10.png){:width="100%"}

# Managing cards 
Clicking an assigned card opens the **Card details** page, where you can:

- Change the card name.
- Select a card-specific export account (if connected to accounting software like QuickBooks, NetSuite, Xero, etc.).
- Update the card to pull recent transactions.
- Unassign the card (note: unassigning deletes unsubmitted expenses on draft reports in the cardholder’s account).
  
![Tap the assigned card to open the card details page where you can manage the card]({{site.url}}/assets/images/Direct Feed HelpDot Images/directfeeds_11.png){:width="100%"}

{% include faq-begin.md %}
## My direct feed is connected. Why is a specific card not appearing for assignment?
Make sure you used your bank's master credentials when connecting. Also, note that cards will only appear for assignment if they’re active and have at least one recent transaction. If a card meeting these conditions doesn’t appear, reach out to your account manager or email concierge@expensify.com.
 
## Are direct bank connections the best option for connecting credit cards to Expensify?
Direct bank connections are a great option if Expensify supports your bank. For enhanced stability and added functionality, consider setting up a [commercial feed](https://help.expensify.com/articles/new-expensify/connect-credit-cards/company-cards/Commercial-feeds) with your bank or using the [Expensify Card](https://use.expensify.com/company-credit-card).

## Is there an extra fee for using direct feeds? 
No, the Collect plan includes one direct feed. You can add additional direct feeds by upgrading to the Control plan.

## What’s the difference between a direct feed and commercial feed? 
Direct feeds use login credentials for quick setup, but can require re-authentication from time to time. Commercial feeds require bank involvement for setup but offer the most reliable connection.

## What if Expensify doesn’t support direct feeds for my bank?
If direct feeds aren’t available for your bank, commercial feeds are the best option for importing company card transactions. Currently, Expensify supports direct feeds for:
- American Express
- Bank of America
- Brex
- Capital One
- Chase
- Citibank
- Stripe
- Wells Fargo
  
## Can direct feeds have maintenance/downtime?
Yes, occasionally. Banks may update their systems to enhance security, which can temporarily affect connections. Expensify’s engineering team works closely with banks to monitor and promptly update connections as needed.

## My direct feed connection is broken, how do I fix it?
Direct feed connections may break if your bank login credentials, card numbers, or security questions change. To fix this, go to **Settings > Workspaces > [your workspace] > Company cards** > select **log into your bank** on the error message and follow the steps to fix the connection.

## Can I connect several direct feeds with the same bank on one workspace?
No, only one direct feed per bank can be connected to a workspace. If you have multiple card programs with the same bank under different credentials, request that your bank consolidate them under one set of credentials. This allows you to connect all card programs through a single direct feed.

You can, however, connect multiple direct feeds to a workspace if they’re from different banks.
{% include faq-end.md %}

