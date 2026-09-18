---
title: Fix a Broken Company Card Feed Connection
description: Learn how to fix a broken company card connection in Expensify so transactions resume importing correctly.
keywords: [fix company card connection, troubleshoot card feed, Expensify card errors, reconnect bank feed, log into your bank, couldn't load this feed, temporary bank issue, can't auto-match receipt]
internalScope: Audience is Workspace Admins. Covers fixing broken company card connections, which feeds can be reconnected in Expensify, resolving connection errors, and recognizing temporary bank issues that resolve on their own. Does not cover CSV imports, missing transactions, or feed monitoring.
---

# Fix a Broken Company Card Feed Connection

When a company card connection breaks, transactions stop importing. Workspace Admins can reconnect the card feed so expenses resume importing. 

---
## How to know if your company card connection is broken

Workspace Admins see indicators in Expensify when a company card feed is broken: 

- A notification appears in the **Time Sensitive** section on **Home**.
- Concierge sends a message to the #admins room
- A red dot appears on the card feed with a broken connection message. On a direct (bank-connected or Plaid) feed, the message is “Card feed connection is broken. Please log into your bank so we can establish the connection again.” and **log into your bank** is a link that starts the reconnect.
- An expense with an imported card receipt shows a pending message that the bank connection is broken or needs re-authentication

These reminders appear while the connection has recently broken. If a company card feed has gone 90 days or more without a successful sync, the **Time Sensitive** notification on **Home** and the red dot on the workspace row stop showing. The “Card feed connection is broken” banner remains on the **Company cards** page for direct (bank-connected) feeds, so a Workspace Admin can still reconnect the feed at any time.

---

## How to fix a broken company card connection

If your direct (bank-connected or Plaid) company card feed stops working, a Workspace Admin can reconnect it from the workspace.

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [Workspace name]**. 
2. Select **Company cards**.
3. Locate the card feed with a red dot indicator and the message “Card feed connection is broken. Please log into your bank so we can establish the connection again.”
4. Select **log into your bank** in that message.
5. Complete the login in the bank window that opens.

The panel stays open while you log into your bank and closes on its own once the reconnect finishes.

---

## What to do when a company card feed can’t be reconnected in Expensify

Only direct (bank-connected or Plaid) feeds can be reconnected from Expensify, because those are the only feeds Expensify holds a bank login for. A commercial feed, or a feed you import from a spreadsheet, shows “Your card connection is broken.” with no **log into your bank** link.

To fix those feeds:

- For a commercial feed, contact your bank and ask them to resume sending the transaction file for your card program.
- For a feed you import from a spreadsheet, upload a new file containing the missing transactions.

[Learn how to set up a commercial card feed connection](/articles/new-expensify/connect-credit-cards/Set-up-a-Commercial-Card-Feed-Connection).

---

## How to troubleshoot company card connection errors

If you see an error while reconnecting, use the guidance below:

**Error: Too many attempts**
 - **What it means:** Your login was attempted too many times in a short period.
 - **What to do:** Wait 24 hours before trying again.

**Error: Invalid credentials / Login failed**
 - **What it means**: Your bank login failed authentication.
 - **What to do:** Log into your bank directly to confirm the credentials, and check for bank-side maintenance or password resets that may be affecting login. 

**Error: Account setup required**
 - **What it means:** Your bank requires an additional step before allowing connections.
 - **What to do:** Complete any required actions in your bank’s portal, then try again

**Error: Direct Connect not enabled**
 - **What it means:** Your bank requires Direct Connect to be activated.
 - **What to do:** Enable Direct Connect in your bank portal (typically under security or download settings)

**Error: Account not found / Card number changed**
 - **What it means:** The card number changed or the account is no longer active.
 - **What to do:** Import the new card using the updated number

**Error: General connection issue**
 - **What it means:** Temporary downtime or maintenance from your bank or connection provider
 - **What to do:** Wait and try again later

**Error: Bank connection needs re-authentication**
 - **What it means:** Your bank requires you to re-authenticate the connection before transactions can resume importing. Until you reconnect, affected expenses show a pending message that the bank connection needs re-authentication.
 - **What to do:** Go to **Company cards**, select the affected card feed, and follow the prompts to reconnect and restore the connection.

**Error: Couldn't load this feed**
 - **What it means:** Your bank login succeeded, but Expensify couldn’t import the feed’s accounts afterwards. The panel shows “Couldn't load this feed” with the message “Oops... something went wrong and your request could not be completed. Please try again later.”
 - **What to do:** Select **Got it** to return to **Company cards**, then start the reconnect again. If it fails again, contact Concierge with the card feed name.

---

## How to recognize a temporary bank issue on a company card expense

Not every card connection message means the feed is broken. When your bank returns a temporary error, Expensify holds the expense and shows this message on it instead:

“Can't auto-match receipt due to a temporary bank issue. Please try again later.”

This message means the bank couldn't be reached right now, not that the card feed needs reconnecting.

- Do not reconnect the card feed. The connection is still valid.
- No Workspace Admin or member action is required.
- Expensify retries automatically, and the message clears once the transaction imports and matches the receipt.

Both members and Workspace Admins see this message on the expense and in the expense report header, whether the card is a company card or a personal card.

If the same expense still shows the message after several days, check the card feed for a “Card feed connection is broken” message and reconnect it using the steps above, or contact Concierge.

---

## What happens after you fix a company card connection

When a company card connection is fixed, the card feed reconnects to your bank and the red dot error message disappears. 

 - The panel closes on its own once the reconnect finishes.
 - New transactions begin importing again. 
 - Any missing transactions during downtime will import automatically.

If you started assigning a card and the reconnect ran partway through, the panel closes when the feed reconnects instead of returning you to the assignment. Assign the card again from **Company cards** once the red dot clears.

---

## How to connect a company card using an alternative method

If the company card feed connection continues to fail, you can connect your card using an alternative method.

Expensify supports connecting company cards through Plaid as a fallback option. [Learn how to set up a direct connection using Plaid](/articles/new-expensify/connect-credit-cards/Set-up-a-Direct-Company-Card-Feed-Connection).

---

# FAQ

## Why was I notified that my company card feed is broken?

Workspace Admins are alerted on the Home page and in the #admins room when a card feed stops working so it can be fixed quickly.

## What do I do if company card expenses are still missing after fixing the feed? 

After fixing the feed, you can update an assigned company card manually from the Company cards list: 
1. Click on the company card you want to update
2. Select **Update card**

## Why does my expense say “Can't auto-match receipt due to a temporary bank issue”?

Your bank returned a temporary error, so Expensify couldn't pull the card transaction to match against the receipt. The card feed is not broken, so there's nothing to reconnect. Expensify retries automatically and the message clears once the transaction imports.

## Why doesn’t my broken card feed have a log into your bank link?

The link only appears on direct (bank-connected or Plaid) feeds. Commercial feeds and feeds imported from a spreadsheet show “Your card connection is broken.” without the link, because Expensify doesn’t hold a bank login for them. Contact your bank for a commercial feed, or upload a new file for a spreadsheet import.

## Why did the reconnect panel close before I finished assigning a card?

If a card feed needs reconnecting while you're assigning a card, Expensify sends you to the bank login first and closes the panel once the feed reconnects. Your assignment isn't saved. Go back to **Company cards** and assign the card again.

## What should I do if the connection still fails after retrying?

Double-check your bank credentials by logging into your bank, and complete any required steps in your bank portal. If the issue continues, contact Concierge with the cardholder email and last four digits of the card.

## Why did the Home notification and workspace red dot disappear while the feed is still broken?

If a company card feed has gone 90 days or more without a successful sync, Expensify stops showing the proactive reminders — the **Time Sensitive** notification on **Home** and the red dot on the workspace row. For direct (bank-connected) feeds, the “Card feed connection is broken” banner stays on the **Company cards** page, so a Workspace Admin can still reconnect the feed and clear the error whenever they're ready.

