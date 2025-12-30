---
title: Company Card Settings
description: Learn how to manage third-party company card feeds in Expensify, including commercial and direct feeds, accounting exports, and automated eReceipts.
keywords: [New Expensify, company cards, card feed settings, third-party cards, commercial feeds, direct feeds, accounting exports, ereceipts, expense automation, card management]
---

Workspace Admins can manage company card settings, export logic, and eReceipt functionality at the workspace level. This guide outlines how to configure your company card connection, route expenses to accounting systems, and automate receipt handling.

---

# Manage Company Card Settings for Commercial and Direct Feeds

To adjust your card feed configuration:

1. Go to **Workspaces > [Workspace Name] > Company Cards**.
2. Click **Settings** in the top-right corner.

**Available actions include:**

- **Rename the card feed connection**
- **Control whether cardholders can delete transactions:** Applies only to new transactions going forward
- **Remove the card connection:** Unassigns all cards and deletes unsubmitted expenses in draft reports

![Tap settings to open the card feed settings page]({{site.url}}/assets/images/Direct Feed HelpDot Images/directfeeds_12.png){:width="100%"}

---

# Export Transactions to Your Accounting System

If you’ve connected accounting software (like **QuickBooks**, **NetSuite**, or **Xero**), you can export company card expenses either to a **central account** or **individual accounts**.

## Export to a Central Account

To apply this setting to all card expenses in the workspace:

1. Go to **Workspaces > [Workspace Name] > Accounting > Connections > Export**.
2. Under **Export company card expenses as**, choose **Central account**.

## Export to Individual Accounts

To override the central export account per card:

1. Go to **Workspaces > [Workspace Name] > Company Cards**.
2. Click on an assigned card to open the **Card Details** page.
3. Select a specific **export account** for that card.

**Note:** If the card is set to Default Card, the central export account will be used.

---

# Use eReceipts with Third-Party Card Feeds

**eReceipts** are digital receipts that replace paper ones for many USD transactions of $75 or less on commercial and direct card feeds.

1. Go to **Workspaces > [Workspace Name] > More Features** and toggle on **Rules**.
2. Navigate to the **Rules** section.
3. Enable **eReceipts**.

**Things to Note:**
- eReceipts are not generated for certain categories, like **lodging**.
- Missing or incorrect category data may prevent eReceipts from being applied.
- Manually re-categorizing an expense can invalidate an existing eReceipt.

---

# FAQ

## Are commercial and direct card feeds limited by plan?

Yes, below is a breakdown:  
- On the **Collect plan**, you can connect one [commercial](https://help.expensify.com/articles/new-expensify/connect-credit-cards/Commercial-feeds) or [direct feed](https://help.expensify.com/articles/new-expensify/connect-credit-cards/Direct-feeds).
- The **Control plan** supports **unlimited** card connections.
- The [Expensify Card](https://use.expensify.com/company-credit-card) is available on **both plans**.

## When do direct or commercial feed transactions import?

Transactions import **after a card is assigned**. Once a purchase **posts** (typically within 1–3 business days), it will appear in the cardholder’s account.

**Note:** Pending transactions are not imported.

