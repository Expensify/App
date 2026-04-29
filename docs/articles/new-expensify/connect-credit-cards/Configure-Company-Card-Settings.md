---
title: Configure Company Card Settings
description: Learn how to manage third-party company card feeds in Expensify, including commercial and direct feeds, accounting exports, and automated eReceipts.
keywords: [New Expensify, company cards, card feed settings, third-party cards, commercial feeds, direct feeds, accounting exports, ereceipts, expense automation, card management]
internalScope: Applies to Workspace Admins. Covers how to manage third-party feed settings on the workspace level. Does not cover company card troubleshooting, setup or card assignment. 
---

# Configure Company Card Settings

Workspace Admins can manage company card settings, export logic, and eReceipt functionality at the workspace level. This guide outlines how to configure your company card connection, route expenses to accounting systems, and automate receipt handling.

To set up a direct company credit card feed on a Workspace, see [Direct Feeds](/articles/new-expensify/connect-credit-cards/Direct-feeds)). 

To set up a commercial card file feed on a Workspace, see [Commercial Feeds](https://help.expensify.com/articles/new-expensify/connect-credit-cards/Commercial-feeds). 

---

## How to configure settings for company card feeds 

1. In the navigation tabs (on the left on web, on the bottom on mobile) navigate to **Workspaces > [Workspace Name]**.
2. Select **Company Cards** and chose the relevant company card feed. 
3. Click **Settings**. 

You can manage the following options:

- **Card feed name**  
  Update the name of the card feed to help identify it.

- **Allow deleting transactions**  
  Enable this setting to allow cardholders to delete card transactions.
   
  **Note:** This setting only applies to transactions imported after the setting is enabled.

- **Assign new cards** (direct feeds only)  
  Reconnects to your bank to refresh the card list so newly issued cards appear in the assignment UI.

- **Remove card feed**  
  Remove the card feed from the workspace and unassign all cards. If the feed is not connected to another workspace, it is permanently deleted.
  
  **Note:** Removing the feed or unassigning a card deletes all imported expenses in the **Unreported** and **Draft** states.

![Tap settings to open the card feed settings page]({{site.url}}/assets/images/Direct Feed HelpDot Images/directfeeds_12.png){:width="100%"}

---

## How to export transactions to your accounting system

If you’ve connected accounting software (like **QuickBooks**, **NetSuite**, or **Xero**), you can export company card expenses either to a **central account** or **individual accounts**.

## How to export to a central account

To apply this setting to all card expenses in the workspace:

1. Go to **Workspaces > [Workspace Name] > Accounting > Connections > Export**.
2. Under **Export company card expenses as**, choose **Central account**.

## How to export to individual accounts

To override the central export account per card:

1. Go to **Workspaces > [Workspace Name] > Company Cards**.
2. Click on an assigned card to open the **Card Details** page.
3. Select a specific **export account** for that card.

**Note:** If the card is set to Default Card, the central export account will be used.

---

## How to use eReceipts with third-party card Feeds

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

