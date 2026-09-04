---
title: Fix a Broken Company Card Feed Connection
description: Learn how to fix a broken company card connection in Expensify so transactions resume importing correctly.
keywords: [fix company card connection, troubleshoot card feed, Expensify card errors, reconnect bank feed]
internalScope: Audience is Workspace Admins. Covers fixing broken company card connections and resolving connection errors. Does not cover CSV imports, missing transactions, or feed monitoring.
---

# Fix a Broken Company Card Feed Connection

When a company card connection breaks, transactions stop importing. Workspace Admins can reconnect the card feed so expenses resume importing. 

---
## How to know if your company card connection is broken

Workspace Admins see indicators in Expensify when a company card feed is broken: 

- A notification appears in the **Time Sensitive** section on **Home**.
- Concierge sends a message to the #admins room
- A red dot appears on the card feed with the message “Card feed connection is broken”
- An expense with an imported card receipt shows a pending message that the bank connection is broken or needs re-authentication

These reminders appear while the connection has recently broken. If a company card feed has gone 90 days or more without a successful sync, the **Time Sensitive** notification on **Home** and the red dot on the workspace row stop showing. The “Card feed connection is broken” banner remains on the **Company cards** page for direct (bank-connected) feeds, so a Workspace Admin can still reconnect the feed at any time.

---

## How to fix a broken company card connection

If your company card feed stops working, a Workspace Admin can reconnect it from the Workspace. 

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [Workspace name]**. 
2. Select **Company cards**.
3. Locate the card feed with a red dot indicator and the message “Card feed connection is broken”
4. Select the error message under the card feed name and follow the prompts to restore the connection. 

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

---

## What happens after you fix a company card connection

When a company card connection is fixed, the card feed reconnects to your bank and the red dot error message disappears. 

 - New transactions begin importing again. 
 - Any missing transactions during downtime will import automatically.

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

## What should I do if the connection still fails after retrying?

Double-check your bank credentials by logging into your bank, and complete any required steps in your bank portal. If the issue continues, contact Concierge with the cardholder email and last four digits of the card.

## Why did the Home notification and workspace red dot disappear while the feed is still broken?

If a company card feed has gone 90 days or more without a successful sync, Expensify stops showing the proactive reminders — the **Time Sensitive** notification on **Home** and the red dot on the workspace row. For direct (bank-connected) feeds, the “Card feed connection is broken” banner stays on the **Company cards** page, so a Workspace Admin can still reconnect the feed and clear the error whenever they're ready.

