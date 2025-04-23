---
title: Company Card Settings
description: Learn how to manage company card settings, export transactions to accounting software, and enable eReceipts for efficient expense tracking in Expensify
---

Workspace admins can easily manage the company card settings at the workspace level. This guide walks you through adjusting the settings, exporting transactions to your accounting system, and enabling eReceipts for efficient expense tracking.

---
# Managing Company Card Settings
To make changes to the settings:

1. Go to **Settings > Workspaces > [Workspace Name] > Company cards**.
2. Click **Settings**, where you can:
   - Change the name of the company card connection.
   - Adjust whether cardholders can delete transactions (changes to this setting only apply to new card transactions).
   - Remove the card connection (removing the connection unassigns all its cards and deletes unsubmitted expenses on draft reports in cardholder accounts).

![Tap settings to open the card feed settings page]({{site.url}}/assets/images/Direct Feed HelpDot Images/directfeeds_12.png){:width="100%"}

---
# Exporting Transactions to an Accounting System
If you’ve connected accounting software (e.g., QuickBooks, NetSuite, Xero), you can export card transactions to either:

- A central account (default setting).
- Separate individual accounts.

## Exporting to a Central Account 
To adjust the export type for the central account head to **Settings > Workspaces > [Workspace Name] > Accounting > Connections > Export > Export company card expenses as**.

## Exporting to Individual Accounts
1. Go to **Settings > Workspaces > [Workspace Name] > Company cards**.
2. Click an assigned card to open the **Card details** page.
3. Select an individual card account manually to override the central export account.
   - If left as **Default card**, the central account is used.
---
# Using eReceipts
Expensify provides eReceipts as digital substitutes for paper receipts, eliminating the need for SmartScanned physical receipts. eReceipts are automatically generated for many USD purchases of $75 or less on both commercial and direct credit card connections.

To enable eReceipts:
1. Go to **Settings > Workspaces > [Workspace Name] > More features**, and enable **Rules**.
2. Navigate to **Rules**, and enable **eReceipts**.

**Note**:
- eReceipts are not generated for some expense categories, such as lodging.
- Incomplete or inaccurate category information from some banks or re-categorizing expenses may invalidate eReceipts.

---
# FAQ

## Are company cards limited to a certain plan?
You can add one [commercial](https://help.expensify.com/articles/new-expensify/connect-credit-cards/Commercial-feeds) or [direct feed](https://help.expensify.com/articles/new-expensify/connect-credit-cards/Direct-feeds) on the Collect plan. Upgrading to the Control plan allows you to add unlimited company cards. The [Expensify Card](https://use.expensify.com/company-credit-card) is also always available on both the Collect and Control plans.

## When do card transactions import into Expensify?
Card transactions start importing after a card is assigned. Expensify imports transactions as soon as they post, typically within 1-3 business days. Pending transactions will not appear in your account.
