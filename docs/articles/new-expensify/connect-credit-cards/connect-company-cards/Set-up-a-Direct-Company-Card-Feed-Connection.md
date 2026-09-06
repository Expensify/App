---
title: Set up a Direct Feed for Company Cards 
description: Learn how to connect company credit cards using a direct feed to import transactions and assign company cards.
keywords: [New Expensify, set up direct company card feed, connect company cards Expensify, direct feed Expensify, Plaid company cards]
internalScope: Audience is Workspace Admins. Covers connecting a company card feed using direct feed or Plaid. Does not cover assigning cards, managing cards, or troubleshooting connections.
---

# Set up a Direct Feed for Company Cards 

When you set up a direct feed for company cards, Expensify establishes a secure connection with your bank to import card transactions automatically. 

If your bank isn't supported, you can [import company card transactions from a spreadsheet](/articles/new-expensify/connect-credit-cards/Import-Company-Card-Transactions-From-a-Spreadsheet) instead.

---

## Who can set up a direct feed for company cards

To set up a direct feed, you must: 

- Be a workspace admin or card admin on workspace on the Collect or Control plan
- Have **Company Cards** enabled on the workspace
- Have master login credentials for your organization's online banking account

**Note**: Workspaces on the Collect plan are limited to one company card connection. [Learn about the different plan types available in Expensify.](/articles/new-expensify/billing-and-subscriptions/explore-plans-subscriptions-and-pricing/Compare-Collect-and-Control-Plans)

---

## How to set up a direct feed for company cards

1. In the navigation tabs (on the left on web, on the bottom on mobile) select **Workspaces > [Workspace name]**.
2. Select **Company cards**.
3. Select **Add cards** to set up your first connection.
    -  If you don't see **Add cards**, select on your existing company card connection then **Add cards**.
4. Choose the country your bank is located in and select **Next**.
5. Choose **Direct feed** and select **Next**.
6. Choose your bank from the list, or select **Other** to see additional banks.
7. Follow the prompts to authenticate the connection using the master online banking credentials for your organization. 

![Click add cards to add a card feed]({{site.url}}/assets/images/Direct Feed HelpDot Images/directfeeds_01.png){:width="100%"}

---

## What happens after you set up a direct feed for company cards

 - Cards with recent expenses will appear as a list and can be assigned to workspace members.
 - After a card is assigned, posted transactions import into the assigned member's account automatically as expenses.

[Learn how to assign company cards](/articles/new-expensify/connect-credit-cards/Assign-Company-Cards).
   
---

# FAQ

## Why don't newly issued cards appear in the assignment list?

Direct feeds cache the card list when first connected. If your bank issues new cards after the initial setup, they won't appear automatically. To refresh the card list:

1. Go to **Workspaces > [Workspace Name] > Company cards**.
2. Click **Settings** in the top-right corner.
3. Click **Assign new cards**.
4. Complete the bank re-authentication to pull the latest cards from your bank.

New cards will then be available for assignment.

## How do I fix a broken company card feed connection?

If your company card feed is broken, you can fix it from the **Time Sensitive** section on **Home**. Click **Fix** to restore the connection. [Learn how to fix a broken company card feed connection](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Fix-a-Card-Connection-Error). 

## Can I connect the same company card account across different workspaces? 

Yes, direct company card feeds can be shared across workspaces. [Learn how to add an existing company card feed connection to a workspace](/articles/new-expensify/connect-credit-cards/Share-a-Company-Card-Connection-Across-Workspaces). 

## Can I import debit card transactions?

Yes, debit card transactions can be imported by following the same steps for setting up a direct company card feed connection. 

This is especially helpful in the EU, where open banking rules often block access to credit card data via aggregators. Debit cards are fully supported under these regulations.

## How can I check if my bank is supported? 

Below are examples of banks that support direct company card feeds. This is not a complete list:

- American Express  
- Bank of America  
- Brex  
- Capital One  
- Chase  
- Citibank  
- Stripe  
- Wells Fargo  
- Plaid enables connections with hundreds of additional banks across the U.S., Canada, and Europe. Check the [Plaid coverage page for US/Canada](https://plaid.com/docs/institutions/) or [Plaid coverage page for UK/Europe](https://plaid.com/docs/institutions/europe/) to see if your bank is supported.

