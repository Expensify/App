---
title: Set up a Direct Connection for Company Cards 
description: Learn how to connect a company card account using a direct connection so its cards can be assigned to workspace members and their transactions imported into Expensify.
keywords: [New Expensify, set up direct company card connection, connect company cards Expensify, direct connection Expensify, direct feed Expensify, Plaid company cards]
internalScope: Audience is workspace admins and card admins. Covers connecting a company card account using a direct connection or Plaid. Does not cover assigning cards, managing cards, or troubleshooting connections.
order: 2
---

# Set up a Direct Connection for Company Cards

When you set up a direct connection, you connect your company's credit card account to Expensify through your bank or card provider. The individual cards under the connected account then become available to assign to workspace members. Once a card is assigned, its transactions import into the assigned member's account as expenses that can be added to reports.

If your bank isn't supported, you can [import company card transactions from a spreadsheet](/articles/new-expensify/connect-credit-cards/Import-Company-Card-Transactions-From-a-Spreadsheet) instead.

---

## Who can set up a direct connection

To set up a direct connection, you must: 

- Be a workspace admin or card admin for a workspace on the Collect or Control plan
- Have **Company Cards** enabled on the workspace
- Have master login credentials for your organization's online banking account

**Note**: Workspaces on the Collect plan are limited to one company card connection. [Learn about the different plan types available in Expensify.](/articles/new-expensify/billing-and-subscriptions/explore-plans-subscriptions-and-pricing/Compare-Collect-and-Control-Plans)

---

## How to set up a direct connection

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [Workspace name]**.
2. Select **Company cards**.
3. Select **Add cards** to set up your first connection.
    -  If you don't see **Add cards**, select your existing company card connection then **Add cards**.
4. Choose the country your bank is located in and select **Next**.
5. Choose **Direct feed** and select **Next**.
6. Choose your bank from the list, or select **Other** to see additional banks.
7. Follow the prompts to authenticate the connection using the master online banking credentials for your organization. 

![Click add cards to add a card feed]({{site.url}}/assets/images/Direct Feed HelpDot Images/directfeeds_01.png){:width="100%"}

---

## What happens after you set up a direct connection

 - Cards with recent expenses will appear as a list and can be assigned to workspace members.
 - After a card is assigned, posted transactions import into the assigned member's account automatically as expenses.

[Learn how to assign company cards](/articles/new-expensify/connect-credit-cards/configure-and-manage-company-cards/Assign-Company-Cards).
   
---

# FAQ

## Why don't newly issued cards appear in the assignment list?

Direct connections cache the card list when first connected. If your bank issues new cards after the initial setup, they won't appear automatically. To refresh the card list:

1. From the list of cards under **Company cards** in your workspace, select **Settings**.
2. Select **Assign new cards**.
3. Complete the bank re-authentication to pull the latest cards from your bank.

New cards will then be available for assignment.

## How can I resolve an error when setting up a direct connection? 

If you receive an error while connecting your bank or card provider, [find the error and follow the recommended troubleshooting steps](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Fix-a-Card-Connection-Error). 

## Can I connect the same company card account across different workspaces? 

Yes, direct connections can be shared across workspaces. [Learn how to add an existing company connection to a workspace](/articles/new-expensify/connect-credit-cards/Share-a-Company-Card-Connection-Across-Workspaces). 

## Can I import debit card transactions?

Yes, debit card transactions can be imported by following the same steps for setting up a direct connection for company cards. 

## How can I check if my bank is supported? 

Below are examples of banks that support direct connections. This is not a complete list:

- American Express  
- Bank of America  
- Brex  
- Capital One  
- Chase  
- Citibank  
- Stripe  
- Wells Fargo  
- Plaid enables connections with hundreds of additional banks across the U.S., Canada, and Europe. Check the [Plaid coverage page for US/Canada](https://plaid.com/docs/institutions/) or [Plaid coverage page for UK/Europe](https://plaid.com/docs/institutions/europe/) to see if your bank is supported.

