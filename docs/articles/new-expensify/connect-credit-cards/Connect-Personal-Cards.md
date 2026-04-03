---
title: Connect a personal card in New Expensify
description: Learn how to connect a new personal credit card to your Expensify account to automatically import transactions.
keywords: [personal cards, connect card, Wallet, Plaid, bank connection, card import, credit card, New Expensify, oAuth, add card]
internalScope: Audience is members who want to connect a new personal credit card. Covers the card connection flow including country selection, bank selection, oAuth and Plaid connections, company card warnings, and free card limits. Does not cover managing existing cards or company card programs.
---

# Connect a personal card in New Expensify

Connect your personal credit card to Expensify to automatically import transactions, eliminating the need to manually create expenses or scan receipts. Expensify supports over 10,000 banks across the United States, Canada, the United Kingdom, and the European Union.

---

## Who can connect a personal card

Anyone with an Expensify account can connect up to two personal cards for free. To connect more than two personal cards, you'll need a paid workspace (Collect plan or above).

---

## How to connect a personal card

1. Navigate to **Account > Wallet** on web or mobile.
2. Tap **Add personal card**.
3. Select your country from the country selector.
4. If you selected **United States**, choose your bank from the bank selector.
   - If your bank is listed, you'll be prompted to connect via your bank's secure login (oAuth).
   - If your bank is not listed, select **Other** to connect via Plaid.
5. If you selected any country other than the United States, you'll connect via Plaid.
6. Follow the prompts to log into your bank and authorize the connection.
7. You'll see a success page once your card is connected.

Your card will now appear under **Assigned cards** in the **Wallet**, and transactions will begin importing automatically.

---

## What to do if you see a company card warning

If you're a member of a workspace or domain that has a company card feed, Expensify will ask you to confirm that the card you're adding is a personal card.

- **If you're an employee:** You'll see options to ask your admin if you should be assigned a company card, or continue adding a personal card.
- **If you're an admin:** You'll see options to confirm this is a company card (which redirects you to the company card connection flow) or proceed with adding it as a personal card.

---

## What happens when you reach the free card limit

If you're not on a paid workspace and try to add more than two personal cards, you'll see an upgrade page prompting you to create a Collect workspace.

If you proceed with the upgrade:
1. A Collect workspace is created for your account.
2. You'll see a success page with options to add company cards or additional personal cards.

---

# FAQ

## How many banks does Expensify support?

Expensify supports over 10,000 banks across the United States, Canada, the United Kingdom, and the European Union through a combination of direct bank connections (oAuth) and Plaid.

## What if my bank connection fails?

If there's an error connecting to your bank, you'll see a bank connection issue error page. Try again, and if the problem persists, contact your bank to ensure third-party access is enabled.

## How many personal cards can I connect for free?

You can connect up to two personal cards for free. To add more, you'll need a paid workspace on the Collect plan or above.

## How do I manage a personal card after connecting it?

Once connected, your card appears in **Account > Wallet** under **Assigned cards**. Learn how to [manage your personal cards]({{site.url}}/articles/new-expensify/connect-credit-cards/Personal-Cards).
