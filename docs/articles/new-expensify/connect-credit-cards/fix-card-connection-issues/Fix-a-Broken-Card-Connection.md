---
title: Fix a Broken Card Connection
description: Rebuild a broken personal card or company card feed connection in Expensify so transactions resume importing.
keywords: [New Expensify, fix broken card connection, broken company card feed, reconnect bank, troubleshoot card, card errors, Plaid fallback, personal card, company card]
internalScope: Audience is members with personal cards and Workspace Admins with company card feeds. Covers restoring a broken connection, troubleshooting reconnect errors, and alternative connection methods. Does not cover connections that only need re-authentication, connecting a brand-new card, or spreadsheet imports.
retrievalIntent: How to fix a broken personal card or company card feed connection.
contentType: task
platform: new
order: 4
---

# Fix a Broken Card Connection

When a card connection is **broken**, transactions stop importing until you rebuild it. Unlike a connection that only needs re-authentication, a broken connection has actually failed — often because your bank credentials changed, the card number changed, the bank is having an outage, or the bank withdrew support for the connection. This article covers restoring the connection for both personal cards and company card feeds.

If your card shows that it **needs to be re-authenticated** rather than broken, use [Re-authenticate a Card Connection](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Reauthenticate-a-Card-Connection) instead. Not sure which one you have? See [Identify Your Card Connection Issue](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Identify-Your-Card-Connection-Issue).

---

## Who can fix a broken connection

- **Personal cards:** the cardholder fixes their own card in **Account > Wallet**.
- **Company card feeds:** a Workspace Admin fixes the feed under **Workspace > Company cards**. Individual members can't fix a company feed — they'll see a broken connection indicator on affected expenses until an Admin restores it.

---

## How to know a connection is broken

**Personal cards** — you'll see:

- A notification in the **Time Sensitive** section on **Home**.
- A red dot on **Wallet** in the navigation tabs and on the affected card.

**Company card feeds** — Workspace Admins will see:

- A notification in the **Time Sensitive** section on **Home**.
- A message from Concierge in the **#admins** room.
- A red dot on the feed with the message "Card feed connection is broken."

---

## How to fix a broken personal card connection

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Account > Wallet**.
2. Under **Cards**, select the card with the broken connection.
3. Choose **Fix card**.
4. Log into your bank when prompted to re-establish the connection.

If logging into your bank doesn't resolve it, select **Update card** to attempt a manual refresh.

---

## How to fix a broken company card feed connection

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspace > [Workspace name]**.
2. Select **Company cards**.
3. Locate the feed with a red dot and the message "Card feed connection is broken."
4. Select the error message under the feed name and follow the prompts to log into your bank and restore the connection.

If expenses are still missing after the feed reconnects, update an assigned card manually: select the company card, then choose **Update card**.

---

## How to troubleshoot connection errors

If you see an error while reconnecting, use the guidance below:

**Card update failed**
- **What it means:** The connection hit an error that Expensify's team is automatically alerted to. It doesn't always mean you did something wrong.
- **What to do:** Select **Update card** once to retry. If it persists, contact Concierge with the details in [What to include when you contact Concierge](#what-to-include-when-you-contact-concierge) so it can be resolved without a back-and-forth.

**Too many attempts**
- **What it means:** Your login was attempted too many times in a short period.
- **What to do:** Wait 24 hours before trying again.

**Invalid credentials / Login failed**
- **What it means:** Your bank login failed authentication.
- **What to do:** Log into your bank directly to confirm your credentials, and check for bank-side maintenance or password resets that may be affecting login.

**Account setup required**
- **What it means:** Your bank requires an additional step before allowing connections.
- **What to do:** Complete any required actions in your bank's portal, then try again.

**Direct Connect not enabled**
- **What it means:** Your bank requires Direct Connect to be activated.
- **What to do:** Enable Direct Connect in your bank portal (typically under security or download settings).

**Account not found / Card number changed**
- **What it means:** The card number changed or the account is no longer active.
- **What to do:** Add the card again using the updated number.

**General connection issue / temporary bank issue**
- **What it means:** Temporary downtime or maintenance from your bank or connection provider.
- **What to do:** Wait and try again later. If it persists for more than a day, retry the reconnect steps above.

**Unknown error**
- **What it means:** Your bank returned an error Expensify can't classify. This is common with some international banks that don't support a direct connection.
- **What to do:** Try reconnecting once. If it persists, import your transactions from a spreadsheet instead — see [How to connect using an alternative method](#how-to-connect-using-an-alternative-method).

---

## Bank-specific guidance

Some banks have known connection quirks with a more reliable path than repeatedly reconnecting:

**Bank of America (persistent disconnects)**
If a direct or Plaid connection to Bank of America keeps breaking, the most reliable fix is to switch to a **commercial card feed** (Visa/Mastercard) or an **OFX feed** rather than reconnecting again and again. See [Set up a Commercial Card Feed](/articles/new-expensify/connect-credit-cards/connect-company-cards/Set-up-a-Commercial-Card-Feed-Connection).

**American Express (repeated reconnect prompts / authorization loop)**
If American Express keeps prompting you to reconnect or loops during authorization, first clear your browser cache, try a different browser, and disable browser extensions, then reconnect. If it still loops, the connection needs a token refresh on Expensify's side — contact Concierge (see below) so it can be reset, rather than continuing to retry.

---

## What to include when you contact Concierge

When a connection issue needs Concierge to resolve it, include all of the following in your first message so it can be fixed without a back-and-forth:

- The **workspace or domain name**
- The **cardholder email(s)** affected
- The **last four digits** of the affected card(s)
- The **date range** of any missing transactions
- A **screenshot of the error** message

---

## What happens after you fix a connection

When the connection is restored:

- The red dot and error message disappear.
- New transactions begin importing again.
- Any transactions from while the connection was down import automatically.
- Any **broken connection** violation held on receipt-scanned expenses is removed automatically.

---

## How to connect using an alternative method

If a connection keeps failing, you can connect using an alternative method:

- **Plaid** is supported as a fallback for both personal cards (select **Other** when choosing your bank) and company cards. It often stays connected more reliably than a direct bank login. [Learn how to set up a direct company card feed connection using Plaid](/articles/new-expensify/connect-credit-cards/connect-company-cards/Set-up-a-Direct-Company-Card-Feed-Connection).
- **Spreadsheet (CSV) import** always works as a backstop and won't create duplicates on re-import. [Import personal card transactions from a spreadsheet](/articles/new-expensify/connect-credit-cards/Import-Personal-Card-Transactions-From-a-Spreadsheet) or [import company card transactions from a spreadsheet](/articles/new-expensify/connect-credit-cards/connect-company-cards/Import-Company-Card-Transactions-From-a-Spreadsheet).

---

## Related articles

- [Identify Your Card Connection Issue](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Identify-Your-Card-Connection-Issue)
- [Re-authenticate a Card Connection](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Reauthenticate-a-Card-Connection)
- [Manage Personal Cards](/articles/new-expensify/connect-credit-cards/Manage-Personal-Cards)

---

# FAQ

## Why was I notified that my company card feed is broken?

Workspace Admins are alerted on the **Home** page and in the **#admins** room when a feed stops working, so it can be fixed quickly for everyone using it.

## What do I do if expenses are still missing after fixing the connection?

Update the affected card manually: open the card and select **Update card**. For transactions older than the import window, use a spreadsheet import instead.

## What should I do if the connection still fails after retrying?

Double-check your bank credentials by logging into your bank directly, and complete any required steps in your bank portal. If the issue continues, contact Concierge with the details in [What to include when you contact Concierge](#what-to-include-when-you-contact-concierge).

## Can a member fix a broken company card themselves?

No. Only a Workspace Admin can reconnect a company card feed. Members who see a broken connection indicator on their expenses should ask a Workspace Admin to restore the feed.
