---
title: Card-feed-settings.md
description: Manage your card feed via the settings page 
---

# Overview
Workspace admins can manage commercial or direct card feed settings for their workspace.

# Managing Card Feed Settings
To manage card feed settings:

1. Go to **Settings > Workspaces > [your workspace] > Company cards**.
2. Click **Settings**, where you can:
   - Change the card feed name.
   - Adjust whether cardholders can delete transactions *(note: changes to this setting only apply to new card transactions)*.
   - Remove the card feed *(note: removing the feed unassigns all its cards and deletes unsubmitted expenses on draft reports in cardholder accounts)*.

![Tap settings to open the card feed settings page]({{site.url}}/assets/images/Direct Feed HelpDot Images/directfeeds_12.png){:width="100%"}

# Exporting Transactions to an Accounting System
If you’ve connected accounting software (e.g., QuickBooks, NetSuite, Xero), you can export card transactions to either:

- A central account (default setting).
- Separate individual accounts.

To adjust the export type for the central account:

1. Go to **Settings > Workspaces > [your workspace] > Accounting > Connections > Export > Export company card expenses as**.

To set individual card export accounts:

1. Go to **Settings > Workspaces > [your workspace] > Company cards**.
2. Click an assigned card to open the **Card details** page.
3. Select an individual card account manually to override the central export account.
   - If left as **Default card**, the central account will be used.

# Using eReceipts
Expensify provides eReceipts as digital substitutes for paper receipts, eliminating the need to SmartScan physical receipts. eReceipts are automatically generated for many USD purchases of $75 or less on both commercial and direct feeds.

To enable eReceipts:

1. Go to **Settings > Workspaces > [your workspace] > More features**, and enable **Rules**.
2. Navigate to **Rules**, and enable **eReceipts**.

**Note**:
- eReceipts are not generated for specific expense categories, such as lodging.
- Incomplete or inaccurate category information from some banks, or re-categorizing expenses, may invalidate eReceipts.

{% include faq-begin.md %}
## FAQ

### Are company cards limited to a certain plan?
Yes, company cards are limited to the Control plan. However, the [Expensify Card](https://use.expensify.com/company-credit-card) is available on both the Collect and Control plans.

### When do card transactions import into Expensify?
Card transactions start importing after a card is assigned. Expensify imports transactions as soon as they post, typically within 1-3 business days. Pending transactions will not appear in your account.

{% include faq-end.md %}
