---
title: Set up a Direct Company Card Feed Connection
description: Learn how to connect company credit cards using a direct bank connection or Plaid to import transactions and assign company card.
keywords: [New Expensify, set up direct company card feed, connect company cards Expensify, direct feed Expensify, Plaid company cards]
internalScope: Audience is Workspace Admins. Covers connecting a company card feed using direct feed or Plaid. Does not cover assigning cards, managing cards, or troubleshooting feeds.
---

# Set up a Direct Company Card Feed Connection

Setting up a direct company card feed connection allows you to automatically import card transactions into Expensify.

You can connect company cards using a direct connection with your bank, or through Plaid, depending on your bank and country.

---

## Who can set up a direct company card feed connection 

Any Workspace Admin can set up a direct company card feed connection. 

 - On the **Collect** plan, you can add one company card feed. 
 - On the **Control** plan, you can add unlimited company card feeds. 

[Learn about the different plan types available in Expensify.](/articles/new-expensify/billing-and-subscriptions/Plan-types-and-pricing)

---

## How to set up a direct company card feed connection 

1. Click the navigation tabs (on the left on web, on the bottom on mobile) and select **Workspaces > [Workspace name]**.
2. Choose **Company cards** to view your company’s card setup page.
 - If you don't see **Company cards**, enable the feature under **More features > Company cards**.
3. Click **Add cards** to set up your first connection.
    -  If you don't see **Add cards**, click on your existing company card feed connection then **Add cards**.
4. Select the country your bank is located in and select **Next**.
5. Choose **Direct feed** and select **Next**.
6. Choose your bank from the list, or select **Other** to see additional banks supported by Plaid.


![Click add cards to add a card feed]({{site.url}}/assets/images/Direct Feed HelpDot Images/directfeeds_01.png){:width="100%"}

---

## What happens after you set up a direct company card feed connection 

 - Cards with recent expenses will appear as a list and can be assigned to Workspace members.
 - After a card is assigned, posted transactions import into the assigned member's account automatically as expenses.

[Learn how to assign company cards](/articles/new-expensify/connect-credit-cards/Assign-Company-Cards).

---

## What bank requirements affect company card connections

Some banks have specific requirements for successful connections:

 - **Chase:** Password must be 8–32 characters
 - **Wells Fargo:** Password must be under 14 characters
 - **SVB:** Enable Direct Connect and use a Direct Connect PIN instead of your online banking password
   
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

If your company card feed is broken, you can fix it from the **Time Sensitive** section on **Home**. Click **Fix** to restore the connection. [Learn how to fix a broken company card feed connection](/articles/new-expensify/connect-credit-cards/Fix-a-broken-Company-Card-Feed-Connection). 

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

