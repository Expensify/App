---
title: Fix a Card Connection Error
description: Learn what to do when you see an error while connecting a card or managing an existing card connection in Expensify.
keywords: [New Expensify, card connection error, can't connect card, bank connection error, card update failed, login failed, account setup required, Direct Connect, personal card, company card]
internalScope: Audience is members connecting personal cards and Workspace Admins managing company card feeds. Covers common card connection errors that can occur when adding a new card or managing an existing connection and the appropriate next action for each error. Does not cover detailed bank-specific troubleshooting, re-authentication workflows, alternative connection setup, or spreadsheet imports.
retrievalIntent: How to fix an error when connecting or updating a card in Expensify.
contentType: task
platform: new
order: 4
---

# Fix a Card Connection Error

Expensify establishes a secure connection with your bank to import card transactions. You may see a card connection error if Expensify can't establish that connection or if an existing connection stops working. The error can indicate that additional information or action is required from you or your bank. Use the error message you see to determine what to do next.

If you want to understand why card connection issues happen, see [Understand Card Connection Issues](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Understand-Card-Connection-Issues).

---

## Who can fix a card connection error

Who can take action depends on the card type:
 - Personal cards: The cardholder manages their own card in **Account > Wallet**.
 - Company card feeds: A Workspace Admin manages the feed under **Workspace > Company cards**. Individual members can't fix a company card feed themselves.

If you're a member and see a connection issue on an expense from a company card, a Workspace Admin may need to resolve the underlying feed issue.

---

## How to fix a card connection error

Find the error you're seeing and follow the recommended action.

| Error                                               | What It Means                                                                                  | What to Do                                                                                                                                                      |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Card update failed**                              | The connection encountered an error while Expensify was trying to update the card.             | Select **Update card** once to try again. If the error continues, contact Concierge with details about the affected card and error.                             |
| **Too many attempts**                               | There have been too many connection or login attempts in a short period.                       | Wait 24 hours before trying again.                                                                                                                              |
| **Invalid credentials / Login failed**              | Your bank couldn't authenticate the credentials provided.                                      | Log in to your bank directly to confirm your credentials and check for a password reset, additional authentication, or another required action. Then try again. |
| **Account setup required**                          | Your bank requires an additional step before allowing the connection.                          | Log in to your bank, complete any required actions, then try again.                                                                                             |
| **Direct Connect not enabled**                      | Your bank requires Direct Connect to be enabled before Expensify can establish the connection. | Enable Direct Connect in your bank portal, typically under security or download settings, then try again.                                                       |
| **Account not found / Card number changed**         | The card number changed or the account is no longer active.                                    | If you have a new card number, add the updated card instead of continuing to update the old connection.                                                         |
| **General connection issue / temporary bank issue** | Your bank or connection provider may be temporarily unavailable.                               | Wait and try again later. If the error continues, follow the troubleshooting guidance for your bank or connection type.                                         |
| **Unknown error**                                   | Expensify received an error that doesn't have a specific troubleshooting action.               | Try the connection again once. If the error continues, contact Concierge or follow the troubleshooting guidance for your bank or connection type.               |


---

## What to do If your connection needs re-authentication

If Expensify says the connection **needs re-authentication**, the connection has been paused. Your bank needs you to authorize Expensify again before the connection can continue.

[Learn how to re-authenticate a card connection](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Reauthenticate-a-Card-Connection).

---

## What to do if the recommended action doesn't resolve the error 

If your connection to American Express, Bank of America, Brex, Capital One, Chase, Citibank, Stripe or Wells Fargo is broken and the recommended action doesn't resolve the error, you can try the alternative connection to those banks. You can access the alternative connection by following the steps here. 

If you are still unable to resolve the error, contact Concierge for support. When you reach out, please include: 

 - The workspace or domain name where you are connecting the cards
 - Whether you trying to fix an existing connection or establish a new one 
 - The affected cardholder email address 
 - The last four digits of the affected card
 - The date range of any missing transactions
 - The full text of the  error message

Don't send your full card number or bank credentials.

---

## What happens after you fix a card connection error

What happens next depends on when the error occurred.

If you were connecting a new card, you can continue the connection process after the issue is resolved.

If the card was already connected, Expensify can resume importing transactions after the connection is restored.

Transactions that didn't import while an existing connection was unavailable may import after the connection is restored.

---

## Where to Get More Help With a Card Connection Error

If the error continues after following the recommended action, use the troubleshooting guidance for the specific connection state or bank.

* [Learn how to re-authenticate a card connection](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Reauthenticate-a-Card-Connection)
* [Learn how to manage personal cards](/articles/new-expensify/connect-credit-cards/Manage-Personal-Cards)
* [Learn how to set up a commercial card feed](/articles/new-expensify/connect-credit-cards/Set-up-a-Commercial-Card-Feed-Connection)
