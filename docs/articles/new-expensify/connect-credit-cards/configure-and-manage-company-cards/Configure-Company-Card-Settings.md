---
title: Configure Company Card Settings
description: Learn how to manage the settings for company card feeds in Expensify, including setting the statement close date, allowing transactions to be deleted, and reading the Export account column. 
keywords: [New Expensify, company cards, card feed settings, third-party cards, commercial feeds, direct feeds, card management, card admin, allow deleting transactions, export account column]
internalScope: Applies to workspace admins and card admins. Covers how to manage third-party feed settings on the workspace level and how to read the Export account column on the Company cards page. Does not cover company card troubleshooting, setup, card assignment or Expensify Card settings. 
order: 2
---

# Configure Company Card Settings

Configure company card feed settings to manage how an existing direct or commercial card feed works in your workspace. You can rename the feed, set its statement close date, allow cardholders to delete imported transactions, refresh available cards for a direct feed, or remove the feed.

To create a new connection, see [Set up a Direct Connection for Company Cards](/articles/new-expensify/connect-credit-cards/connect-company-cards/Set-up-a-Direct-Connection-for-Company-Cards) or see [Set up a Commercial Feed for Company Cards](/articles/new-expensify/connect-credit-cards/connect-company-cards/Set-up-a-Commercial-Feed-for-Company-Cards).

This article only covers third-party card feeds. To manage settings for the Expensify Card, see [Set Up and Manage the Expensify Card](/articles/new-expensify/expensify-card/Set-Up-and-Manage-the-Expensify-Card-US).

---

## Who can configure Company Card Settings?

Workspace admins and card admins can manage company card feed settings for an existing company card connection.

Some settings are available only for specific feed types. For example, **Assign new cards** is available for direct feeds.

## How to configure settings for company card feeds

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Company cards**.
3. Confirm the card feed you want to manage is selected.
    - If you have multiple card feeds and need to select a different one, select the current card feed name, then select the card feed you want to manage.
4. Select **Settings**.
5. Configure the applicable settings:
    - **Card feed name**: Change the name of the card feed to make it easier to identify.
    - **Statement close date**: Enter the date your card statement closes. Expensify uses this date to create a matching statement under **Card statements** on the **Spend** page.
    - **Allow deleting transactions**: Allow cardholders to delete imported company card transactions. This setting applies only to transactions imported after it is enabled.
    - **Assign new cards**: For direct feeds, reconnect to your bank and refresh the available card list so newly issued cards can be assigned.
    - **Remove card feed**: Remove the card feed from the workspace, unassign its cards, and delete all imported expenses in the **Unreported** and **Draft** states. If the feed is not connected to another workspace, the feed is permanently deleted.

![Tap settings to open the card feed settings page]({{site.url}}/assets/images/company-cards-configure-settings.png){:width="100%"}

## What the Export account column shows on the Company cards page

The **Company cards** page includes an **Export account** column so you can see which accounting account each card exports to without opening the card. The column sits after **Card name**. Select the **Export account** column header to sort the list by export account.

Each assigned card shows one of the following:

- The account chosen for that card in the **Accounting** section of its card details page.
- Your workspace's default export account, when the card has no account of its own. Depending on your accounting integration, this reads **Default account**, **Default vendor**, **Default card**, or the account name followed by **(default)**.

Unassigned cards show a blank **Export account** because an export account is only set on an assigned card.

**Note:** The **Export account** column is hidden on narrow and medium screens. Widen your browser window or view the page on a larger screen to see it.

<!-- SCREENSHOT:
Suggestion: The Company cards page on a wide browser window with the Export account column visible after Card name, showing one assigned card set to a named account, one assigned card showing the workspace default label, and one unassigned card with a blank value.
Location: Immediately after this section.
Purpose: Shows card admins where the Export account column sits and why an unassigned row is blank, so they don't read the blank value as a missing or broken export setting.
-->

---

# FAQ

## Does enabling Allow deleting transactions apply to existing company card transactions?

No. **Allow deleting transactions** applies only to new transactions imported after the setting is enabled. Transactions imported before the setting was enabled are not affected.

## What happens if I remove a company card feed?

Removing a company card feed unassigns all cards associated with that feed. Imported expenses in the **Unreported** and **Draft** states are also deleted.

If the feed is not connected to another workspace, removing it permanently deletes the feed.

## What does the Statement close date do?

The **Statement close date** tells Expensify when the card statement closes. Expensify uses this date to create a corresponding statement under **Card statements** on the **Spend** page.

## Why don't I see the Export account column on the Company cards page?

The **Export account** column only appears when your workspace has an accounting integration connected and that integration's export destination lets you choose an export account for a single card. This is the same condition that shows the **Accounting** section on a card's details page, so if that section is missing, the column is hidden too.

The column is also hidden on narrow and medium screens. Widen your browser window or view the page on a larger screen to see it.

## How do I manage settings for a different company card feed?

**Settings** applies to the currently selected card feed. If you have multiple card feeds, select the current card feed name, then select the feed you want to manage. Select **Settings** to configure that feed.
