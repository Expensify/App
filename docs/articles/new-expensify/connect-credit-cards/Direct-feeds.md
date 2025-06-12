---
title: Direct Company Card Feeds
description: Learn how to connect company credit cards using direct feeds or Plaid to import transactions and assign cards in New Expensify.
keywords: [New Expensify, direct feeds, Plaid integration, company cards, credit card import, assign cards, connect bank, manage card feeds]
---

<div id="new-expensify" markdown="1">

Direct feeds in New Expensify provide a fast, reliable way to import company card transactions. You can now also use Plaid to connect to over 12,000 global banks, giving you even more options to connect cards without needing Expensify Classic.

You can add one **direct** or [**commercial feed**](https://help.expensify.com/articles/new-expensify/connect-credit-cards/Commercial-feeds) on the **Collect plan**. Upgrade to the **Control plan** to add unlimited company cards.

---

# Prerequisites

Before setting up a direct or Plaid feed, go to **Workspaces > New Workspace** to create a workspace (if you haven't already).

---

# Set Up a Direct Feed

1. . Go to **Workspaces > [Workspace Name] > Company cards** to view your company’s card setup page.
2. Click **Add cards** to start connecting a new feed.
3. **Select your country** from the list.  
   - We’ll try to prefill this based on your workspace’s currency, but you can manually change it if needed.  
   - You won’t be able to continue without selecting a country — if it’s left blank, we’ll show an error.  
   - All countries are listed, except those where Expensify isn’t available (like Iran, Cuba, Syria, Ukraine, or North Korea).
4. **Choose your feed type** when prompted:
   - **Direct feed** – This is the default option in most supported countries and works for the majority of users.  
   - **Commercial feed** – Best for large-scale card programs where your bank facilitates the connection directly.
5. **Pick your bank:**
   - If you’re in the U.S., select your bank from the list or choose **Other banks** to connect through Plaid.
   - For international members in supported countries, choosing **Direct feed** will automatically launch the Plaid connection process.

![Click add cards to add a card feed]({{site.url}}/assets/images/Direct Feed HelpDot Images/directfeeds_01.png){:width="100%"}

---

# Using Plaid to Connect a Direct Feed

If your bank isn’t listed, or you're in a supported Plaid country, Plaid will launch automatically to complete the connection.

## Supported countries for Plaid feeds:

- United States
- Canada
- United Kingdom
- Austria, Belgium, Denmark, Estonia, Finland, France, Germany, Ireland, Italy, Latvia, Lithuania, Netherlands, Norway, Poland, Portugal, Spain, Sweden

Once you choose **Direct feed** for any of these countries, you'll see the **Plaid UI**, where you can securely log in to your bank and select accounts.

---

# Assign Company Cards

Once connected, you'll want to assign the company cards to their respective cardholders:

1. Go to **Workspaces > [Workspace Name] > Company cards**.
2. If you have multiple feeds, click the feed name at the top left to select the correct one.
3. Click **Assign card**.  
   - You may be prompted to reauthenticate your Plaid login.
4. Select a **workspace member** from the list.
5. Choose a **card** (only cards with recent transactions will appear).
6. Set a **start date**:
   - **From the beginning** (typically 30–90 days)
   - **Custom date** to define your own range
7. Review your selections and click **Assign card**.

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

## Can I use Plaid if my bank isn’t listed?

Yes! If you don’t see your bank in the list, you can still connect it using Plaid. Just select **Other banks** (if you're in the US) or choose **Direct feed** in a country where Plaid is supported — we’ll take care of the rest.

## Do Plaid feeds behave the same as direct feeds?

They sure do. Once your cards are connected through Plaid, they’ll show up just like any other direct feed. You can assign and manage them from the **Company cards** page or a member’s **Wallet**, with no extra steps needed.

## What if I’m outside the U.S.?

Plaid feeds are available in many countries outside the U.S. See the list above. If your country isn’t supported, you’ll see the option to connect a **Commercial feed**.

## How do I reconnect a broken feed?

1. Go to **Workspaces > [Workspace Name] > Company cards**  
2. Click the red error banner  
3. Log in to your bank using Plaid or direct credentials to restore the connection

## Can I connect multiple feeds from the same bank?

Not quite. Each workspace can only have **one direct feed per bank**.  
If your company uses cards from multiple banks, that’s no problem — just connect each bank as its own separate feed.

## Is there an extra cost?

Nope — there’s no extra charge for using Plaid or direct feeds.

- With the **Collect** plan, you can add one direct or Plaid feed at no cost.  
- To connect more than one, you’ll need to upgrade to the **Control** plan.

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
- Plaid enables a connection with hundreds of banks

</div>
