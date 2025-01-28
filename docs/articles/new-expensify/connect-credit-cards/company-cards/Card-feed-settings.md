---
title: Card-feed-settings.md
description: Manage your card feed via the settings page 
---
# Overview
Workspace admins can manage commercial or direct card feed settings for their workspace.

# Managing card feed settings 
To manage card feed settings, go to **Settings > Workspaces > [your workspace] > Company cards**. Then, click **Settings**, where you can:
- Change the card feed name. 
- Adjust whether cardholders can delete transactions *(note: changes to this setting only apply to new card transactions.)*
- Remove the card feed *(note: removing the feed unassigns all its cards and deletes unsubmitted expenses on draft reports in cardholder accounts.)*
  
![Tap settings to open the card feed settings page]({{site.url}}/assets/images/Direct Feed HelpDot Images/directfeeds_12.png){:width="100%"}

# How to export transactions to an accounting system
If you’ve connected accounting software like QuickBooks, NetSuite, Xero, etc., you can export card transactions to either one central account or separate individual accounts. 
By default, transactions export to one central account. To adjust the export type or central account:

1. Go to **Settings > Workspaces > [your workspace] > Accounting > Connections > Export > Export company card expenses as**.

To set individual card export accounts:

1. Go to **Settings > Workspaces > [your workspace] > Company cards**.
2. Click an assigned card to open the **Card details** page.
3. Manually select an individual card account to override the central export account. If left as **Default card**, the central account will be used.

# How to use eReceipts
Expensify provides eReceipts as digital substitutes for paper receipts, removing the need to Smartscan physical receipts altogether. eReceipts are automatically generated for many USD purchases of $75 or less on both commercial and direct feeds.

To enable eReceipts:
1. Go to **Settings > Workspaces > [your workspace] > More features**, and enable **Rules**.
2. Navigate to **Rules** and enable **eReceipts**.
   
Note:
- eReceipts are not generated for certain expense categories, such as lodging.
- Incomplete or inaccurate category information from certain banks, or re-categorizing expenses, may result in invalid eReceipts.
  
{% include faq-begin.md %}
## Are company cards limited to a certain plan?
Yes, company cards are limited to the Control plan. However, the Expensify Card is available on both the Collect and Control plans.

## When do card transactions import into Expensify?
Card transactions start importing after a card is assigned. Expensify imports transactions as soon as they post, typically within 1-3 business days. Pending transactions will not appear in your account.
{% include faq-end.md %}

