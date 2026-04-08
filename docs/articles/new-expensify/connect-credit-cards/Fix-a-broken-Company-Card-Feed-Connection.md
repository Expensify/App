---
title: Fix a Broken Company Card Feed Connection
description: Learn how to fix a broken company card connection in Expensify so transactions resume importing correctly.
keywords: [fix company card connection, troubleshoot card feed, Expensify card errors, reconnect bank feed]
internalScope: Audience is Workspace Admins. Covers fixing broken company card connections and resolving connection errors. Does not cover CSV imports, missing transactions, or feed monitoring.
---

# Fix a broken company card feed

When a company card connection breaks, transactions may stop flowing into Expensify. Workspace Admins are notified on the Home page and in the #admins room by a message from Concierge.

This guide explains how to reconnect the card and resolve common connection errors so transactions resume importing.

---

## Who can fix company card connections in Expensify

Workspace Admins can fix broken company card connections

---

## How to fix a broken company card connection

If your company card feed stops working, you can reconnect it from the Workspace. 

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to Workspaces > [Workspace name] 
2. Select **Company cards**.
3. Find the card feed with a red dot and the message “Card feed connection is broken”
4. Click the error message under the card feed name and follow the prompts to restore the connection. 

---

## What connection errors mean when fixing company card feeds

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
 - **What it means: **Your bank requires Direct Connect to be activated.
 - **What to do:** Enable Direct Connect in your bank portal (typically under security or download settings)

**Error: Account not found / Card number changed**
 - **What it means:** The card number changed or the account is no longer active.
 - **What to do:** Import the new card using the updated number

**Error: General connection issue**
 - **What it means: **Temporary downtime or maintenance from your bank or connection provider
 - **What to do:** Wait and try again later

---

## What bank requirements affect company card connections

Some banks have specific requirements for successful connections:

 - **Chase:** Password must be 8–32 characters
 - **Wells Fargo:** Password must be under 14 characters
 - **SVB:** Enable Direct Connect and use a Direct Connect PIN instead of your online banking password

---

## What happens after you fix a company card connection

When a company card connection is fixed, the card feed reconnects to your bank and the red dot error message disappears. 

 - New transactions begin importing again. 
 - Any missing transactions during downtime will import automatically.

# FAQ

## Why was I notified that my company card feed is broken?

Workspace Admins are alerted on the Home page and in the #admins room when a card feed stops working so it can be fixed quickly.

## What do I do if company card expenses are still missing after fixing the feed? 

After fixing the feed, you can update an assigned company card manually from the Company cards list: 
1. Click on the company card you want to update
2. Select **Update card**

## What should I do if the connection still fails after retrying?

Double-check your bank credentials by logging into your bank, and complete any required steps in your bank portal. If the issue continues, contact Concierge with the cardholder email and last four digits of the card.




