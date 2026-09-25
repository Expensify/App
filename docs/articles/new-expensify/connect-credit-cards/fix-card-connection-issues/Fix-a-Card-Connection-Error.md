---
title: Fix a Card Connection Error
description: Learn how to reconnect a broken card connection in Expensify and what to do about each error you may see along the way.
keywords: [New Expensify, card connection error, reconnect card feed, broken card connection, card feed connection is broken, can't connect card, bank connection error, card update failed, login failed, account setup required, Direct Connect, personal card, company card]
internalScope: Audience is members connecting personal cards and workspace admins and card admins managing company card feeds. Covers reconnecting a broken company card feed or personal card, the common card connection errors that can occur when adding a new card or reconnecting an existing one, and the appropriate next action for each error. Does not cover detailed bank-specific troubleshooting, reauthentication workflows, alternative connection setup, or spreadsheet imports.
retrievalIntent: How to reconnect a broken card connection or fix an error when connecting or updating a card in Expensify.
contentType: task
platform: new
order: 3
---

# Fix a Card Connection Error

Expensify establishes a secure connection with your bank to import card transactions. You may see a card connection error if Expensify can't establish that connection or if an existing connection stops working. The error can indicate that additional information or action is required from you or your bank.

If an existing connection is broken, reconnect it using the steps for your card type below. If an error appears while you connect or reconnect, use the error message you see to determine what to do next.

If you want to understand why card connection issues happen, see [Understand Card Connection Issues](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Understand-Card-Connection-Issues).

---

## Who can fix a card connection error

Who can take action depends on the card type:

- **Personal cards:** the cardholder manages their own card in **Account > Wallet**.
- **Company cards:** a workspace admin or card admin manages the connection under **Workspaces > [Workspace name] > Company cards**. Individual members can't fix a company card feed themselves.

If you're a member and see a connection issue on an expense from a company card, a workspace admin or card admin may need to resolve the underlying feed issue.

---

## How to reconnect a broken company card feed

When a company card feed shows **Card feed connection is broken**, a workspace admin or card admin can reconnect it from the workspace.

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [Workspace name]**.
2. Select **Company cards**.
3. Locate the card feed with a red dot indicator and the message **Card feed connection is broken**.
4. Select the message under the card feed name and follow the prompts to log into your bank and restore the connection.

If an error appears while you reconnect, find it in the table below and follow the recommended action.

<!-- SCREENSHOT:
Suggestion: Company cards page with a feed showing the red dot indicator and the "Card feed connection is broken" message.
Location: Workspaces > [Workspace name] > Company cards
Purpose: Confirm which message a workspace admin should select to start the reconnection, since the message itself is the clickable element rather than a named button.
-->

---

## How to reconnect a broken personal card

When a personal card shows a connection error, the cardholder can reconnect it from their wallet.

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Account > Wallet**.
2. Under **Cards**, select the card with the broken connection.
3. Choose **Fix card**.
4. Log into your bank when prompted to restore the connection.

If logging into your bank doesn't resolve the issue, choose **Update card** to attempt a manual refresh.

---

## How to fix a card connection error

Find the error you're seeing and follow the recommended action.

| Error                                               | What it means                                                                                  | What to do                                                                                                                                                      |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Card update failed**                              | The connection encountered an error while Expensify was trying to update the card.             | Select **Update card** once to try again. If the error continues, contact Concierge with details about the affected card and error.                              |
| **Too many attempts**                               | There have been too many connection or login attempts in a short period.                       | Wait 24 hours before trying again.                                                                                                                              |
| **Invalid credentials / Login failed**              | Your bank couldn't authenticate the credentials provided.                                      | Log in to your bank directly to confirm your credentials and check for a password reset, additional authentication, or another required action. Then try again. |
| **Account setup required**                          | Your bank requires an additional step before allowing the connection.                          | Log in to your bank, complete any required actions, then try again.                                                                                             |
| **Direct Connect not enabled**                      | Your bank requires Direct Connect to be enabled before Expensify can establish the connection. | Enable Direct Connect in your bank portal, typically under security or download settings, then try again.                                                       |
| **Account not found / Card number changed**         | The card number changed or the account is no longer active.                                    | If you have a new card number, add the updated card instead of continuing to update the old connection.                                                          |
| **General connection issue / temporary bank issue** | Your bank or connection provider may be temporarily unavailable.                               | Wait and try again later. If the error continues, follow the troubleshooting guidance for your bank or connection type.                                          |
| **Unknown error**                                   | Expensify received an error that doesn't have a specific troubleshooting action.               | Try the connection again once. If the error continues, contact Concierge or follow the troubleshooting guidance for your bank or connection type.                |

---

## What to do if your connection needs reauthentication

If Expensify says the connection **needs reauthentication**, the connection has been paused. Your bank needs you to authorize Expensify again before the connection can continue.

[Learn how to reauthenticate a card connection](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Reauthenticate-a-Card-Connection).

---

## What to do if the recommended action doesn't resolve the error

If your connection to American Express, Bank of America, Brex, Capital One, Chase, Citibank, Stripe, or Wells Fargo is broken and the recommended action doesn't resolve the error, you can try connecting to that bank a different way. See [What should I do if I can't connect to my bank?](/articles/new-expensify/connect-credit-cards/connect-company-cards/Set-up-a-Direct-Connection-for-Company-Cards#what-should-i-do-if-i-cant-connect-to-my-bank), which includes connecting through Plaid.

If you are still unable to resolve the error, contact Concierge for support. When you reach out, please include:

- The workspace or domain name where you are connecting the cards
- Whether you're trying to fix an existing connection or establish a new one
- The affected cardholder email address
- The last four digits of the affected card
- The date range of any missing transactions
- The full text of the error message

Don't send your full card number or bank credentials.

---

## What happens after you fix a card connection error

What happens next depends on when the error occurred.

If you were connecting a new card, you can continue the connection process after the issue is resolved.

If the card was already connected, Expensify can resume importing transactions after the connection is restored. The red dot indicator and the error message clear once the connection succeeds.

Transactions that didn't import while an existing connection was unavailable may import after the connection is restored.

---

# FAQ

## Why was I notified that my company card feed is broken?

Workspace admins and card admins are alerted in the **Time Sensitive** section on **Home** and in the **#admins** room when a card feed stops working, so it can be fixed before transactions go missing.

## What should I do if company card expenses are still missing after I reconnect the feed?

Refresh the assigned card manually from the **Company cards** list:

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [Workspace name]**.
2. Select **Company cards**.
3. Select the company card you want to refresh.
4. Select **Update card**.

## Can a member fix a company card connection themselves?

No. Only a workspace admin or card admin can fix a company card feed. Members can still mark a held expense as cash and submit it while they wait.

## Does my connection need reauthentication or is it broken?

Expensify tells you which one it is in the message on the card or feed. A connection that needs reauthentication is paused until you re-approve it with your bank, while a broken connection can no longer retrieve transactions at all. [Learn more about the difference between the two](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Understand-Card-Connection-Issues).
