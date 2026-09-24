---
title: View Company Card Feed Transactions
description: Learn how to use the View transactions link on the Company cards page to open every expense imported on a company card feed.
keywords: [New Expensify, view company card transactions, company card feed transactions, View transactions, company card expenses, card feed filter, Spend expenses, workspace admin, card admin]
internalScope: Audience is workspace admins and card admins. Covers opening the expenses imported on a single company card feed from the Company cards page. Does not cover assigning company cards, configuring feed settings, statement reconciliation, or Expensify Card transactions.
order: 3
---

# View Company Card Feed Transactions

**View transactions** on the **Company cards** page opens every expense imported on the selected card feed, so you can review a feed's spend without building a search filter yourself. The results open in the **Expenses** view on the **Spend** page, already filtered to that feed.

This article only covers third-party card feeds. To open the transactions behind your Expensify Card balance, [learn how to view and reconcile Expensify Card expenses](/articles/new-expensify/expensify-card/View-and-Reconcile-Expensify-Card-Expenses).

---

## Who can view company card feed transactions

Workspace admins and card admins can use **View transactions** on any company card feed they can open on the **Company cards** page.

If a company card feed is not connected yet, [learn how to set up a direct connection for company cards](/articles/new-expensify/connect-credit-cards/connect-company-cards/Set-up-a-Direct-Connection-for-Company-Cards) or [learn how to set up a commercial feed for company cards](/articles/new-expensify/connect-credit-cards/connect-company-cards/Set-up-a-Commercial-Feed-for-Company-Cards).

---

## How to view the transactions on a company card feed

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Company cards**.
3. Confirm the card feed you want to review is selected.
    - If you have multiple card feeds and need to select a different one, select the current card feed name, then select the card feed you want to review.
4. Select **View transactions**, which appears below the card feed name.
5. Review the results in the **Expenses** view on the **Spend** page.

<!-- SCREENSHOT:
Suggestion: The Company cards page with a feed selected, showing the View transactions link directly below the card feed name and to the left of the Settings button.
Location: Immediately after step 5.
Purpose: Admins expect a button in the header row next to Settings, so they miss the link that sits below the feed name on its own line.
-->

---

## What the View transactions results include

The results are filtered by card feed only:

- Every expense imported on the selected feed, with no date range applied.
- Expenses on cards that are no longer assigned to a member, so the feed's full import history stays visible.

To narrow the results, add more filters in the **Expenses** view. [Learn how to search and download expenses](/articles/new-expensify/reports-and-expenses/Search-and-Download-Expenses).

---

## Why View transactions does not appear on the Company cards page

**View transactions** shows only once the selected feed's cards have loaded. It is hidden when:

- The **Company cards** page is still loading the feed.
- The card feed connection is still pending.
- No company card feed is connected to the workspace.
- The card feed has an error that prevents its cards from loading. [Learn how to fix a card connection error](/articles/new-expensify/connect-credit-cards/fix-card-connection-issues/Fix-a-Card-Connection-Error).

---

# FAQ

## Does View transactions include expenses from cards that are no longer assigned?

Yes. The results cover the whole card feed, including expenses imported on cards that have since been unassigned.

## Can I view the transactions for one company card instead of the whole feed?

Yes. Select the assigned card on the **Company cards** page, then select **View transactions** on the card details page to see only that card's expenses.

## Why doesn't the total in the results match my card statement?

**View transactions** applies no date range, so the results cover the feed's full history rather than a single statement period. To compare a statement period, [learn how to reconcile company card transactions against a statement](/articles/new-expensify/reports-and-expenses/Statement-Matching-and-Reconciliation).

## Is View transactions on the Company cards page the same as the one on the Expensify Card page?

No. On the **Expensify Card** page, **View transactions** is scoped to the expenses counted toward the **Current balance**. On the **Company cards** page, it returns every expense on the card feed.
