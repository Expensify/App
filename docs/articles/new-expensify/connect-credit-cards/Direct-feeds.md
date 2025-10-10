---
title: Direct Company Card Feeds
description: Learn how to connect company credit cards using direct feeds or Plaid to import transactions and assign cards in New Expensify.
keywords: [New Expensify, direct feeds, commercial cards, Plaid integration, company cards, credit card import, assign cards, connect bank, manage card feeds, corporate cards, Amex Small Business]
---


Direct feeds in Expensify provide a fast, reliable way to import company card transactions. You can also use Plaid to connect your company card program, giving you even more options to manage your corporate card account directly in Expensify. You can connect eligible commercial cards using a direct feed.

You can add one **direct** or [**commercial feed**](https://help.expensify.com/articles/new-expensify/connect-credit-cards/Commercial-feeds) on the **Collect plan**. Upgrade to the **Control plan** to add unlimited company cards.

---

# Prerequisites

**A workspace on the Collect or Control plan:** Before setting up a direct feed, go to **Workspaces > New Workspace** to create a workspace (if you haven't already).

---

# Set Up a Direct Feed

1. . Go to **Workspaces > [Workspace Name] > Company cards** to view your company’s card setup page.
2. Click **Add cards** to start connecting a new feed.
3. **Select your country** from the list.  
   - Expensify will prefill this based on your workspace’s currency, but you can manually change it if needed.  
   - You won’t be able to continue without selecting a country -- You'll see an error.  
   
4. **Choose your feed type** when prompted:
   - **Direct feed** – This is the default option in most supported countries and works for the majority of users.  
   - **Commercial feed** – Best for large-scale card programs where your bank facilitates the connection directly.
5. **Pick your bank:**
   - If you’re in the U.S., select your bank from the list or choose **Other** to see additional banks supported by Plaid.
   - For international members in supported countries, choosing **Direct feed** will automatically launch the Plaid connection process.

![Click add cards to add a card feed]({{site.url}}/assets/images/Direct Feed HelpDot Images/directfeeds_01.png){:width="100%"}

---

# Assign Company Cards

Once connected, you'll want to assign the company cards to their respective cardholders:

1. Go to **Workspaces > [Workspace Name] > Company cards**.
2. If you have multiple feeds, click the feed name at the top left to select the correct one.
3. Click **Assign card**
   - You may be prompted to reauthenticate your account before assigning cards.
5. Select a **workspace member** from the list.
6. Choose a **card** (only cards with recent transactions will appear).
7. Set a **start date**:
   - **From the beginning** (typically 30–90 days)
   - **Custom date** to define your own range
8. Review your selections and click **Assign card**.

![Click the feed name in the top left to open the feed selector where you can select a feed from the list]({{site.url}}/assets/images/Direct Feed HelpDot Images/directfeeds_06.png){:width="100%"}

![Click company cards in the workspace editor to open the feed]({{site.url}}/assets/images/Direct Feed HelpDot Images/directfeeds_05.png){:width="100%"}

---

# Manage Assigned Cards

To manage a card, click any assigned card to open the **Card details** page.

![Tap the assigned card to open the card details page where you can manage the card]({{site.url}}/assets/images/Direct Feed HelpDot Images/directfeeds_11.png){:width="100%"}

**Available actions:**
- Rename the card  
- Assign a specific export account  
- Update transactions  
- Unassign the card

**Note:** Unassigning a card will delete unsubmitted expenses from draft reports for that cardholder.

---

# FAQ

## What if I’m outside the U.S.?

Plaid feeds are available in many countries outside the U.S. If your country isn’t supported, you’ll see the option to connect a **Commercial feed**.

**Direct feeds are supported for the following countries:**
- United States
- Canada
- United Kingdom
- Austria
- Belgium
- Denmark
- Estonia
- Finland
- France
- Germany
- Ireland
- Italy
- Latvia
- Lithuania
- Netherlands
- Norway
- Poland
- Portugal
- Spain
- Sweden

## How do I reconnect a broken feed?

1. Go to **Workspaces > [Workspace Name] > Company cards**  
2. Click the red error banner  
3. Log in to your bank using your bank account credentials to restore the connection

## Can I connect multiple feeds from the same bank?

Not quite. Each workspace can only have **one direct feed per bank**.  
If your company uses cards from multiple banks, that’s no problem — just connect each bank as its own separate feed.

## Is there an extra cost?

Nope — there's no extra charge for using Plaid or direct feeds.

- With the **Collect** plan, you can add one direct or Plaid feed at no cost.  
- To connect more than one, you'll need to upgrade to the **Control** plan.

## Can I import debit card transactions?

Yes! Debit card transactions can be imported by linking a checking/current account in any Plaid-supported country.

This is especially helpful in the EU, where open banking rules often block access to credit card data via aggregators. Debit cards, however, are fully supported under these regulations.

## Which banks support direct feeds?

Some examples of supported direct feed banks include:

- American Express  
- Bank of America  
- Brex  
- Capital One  
- Chase  
- Citibank  
- Stripe  
- Wells Fargo  
- Plaid enables a connection with hundreds of banks ([Plaid - European Bank Coverage](https://plaid.com/docs/resources/#european-bank-coverage))

