---
title: Manage Multiple Company Cards
description: Learn how to select multiple company cards at once to unassign them, view their transactions, or export them as a CSV from the Company cards page in New Expensify.
keywords: [New Expensify, manage company cards, bulk unassign company cards, export company cards CSV, view company card transactions, select multiple company cards, company card feed, card admin]
internalScope: Audience is Workspace Admins, Card Admins, and their Copilots. Covers selecting multiple company cards on the Company cards page to unassign them, view their transactions, or export them as a CSV. Does not cover connecting a feed, assigning individual cards, or troubleshooting connection issues.
---

# Manage Multiple Company Cards

Selecting multiple company cards lets you act on several cards at once from the Company cards page. You can unassign assigned cards, view their transactions, or export the selected cards as a CSV file, which saves time when you manage large card feeds.

---

## Who can manage multiple company cards

Workspace Admins, Card Admins, and their Copilots can select and manage company cards after a company card feed is connected.

If you haven’t set up a feed yet, learn how to set one up:

 - [Learn how to set up a direct company card feed connection](/articles/new-expensify/connect-credit-cards/Set-up-a-Direct-Company-Card-Feed-Connection).
 - [Learn how to import company card transactions from a spreadsheet](/articles/new-expensify/connect-credit-cards/Import-Company-Card-Transactions-From-a-Spreadsheet).

---

## How to select multiple company cards

1. Click the navigation tabs (on the left on web, on the bottom on mobile) and select **Workspaces > [Workspace Name]**.
2. Select **Company cards**.
3. Select the company card feed you want to manage.
4. Use **Find company card** to search for cards, or **Filters** to narrow the list.
5. Select the checkbox next to each card you want to include.

When one or more cards are selected, a selected-count dropdown appears above the table. The actions available in the dropdown depend on your selection:

- When you select only assigned cards, the dropdown shows **Unassign cards**, **View transactions**, and **Export as CSV**.
- When you select only unassigned cards, or a mix of assigned and unassigned cards, the dropdown shows only **Export as CSV**.

**ADD A SCREENSHOT HERE.**
Suggestion: Show the Company cards table with several rows selected and the selected-count dropdown open.

---

## How to unassign multiple company cards

1. Select the assigned company cards you want to unassign.
2. Open the selected-count dropdown and select **Unassign cards**.
3. In the confirmation window, select **Unassign**.

---

## How to view transactions for selected company cards

1. Select the assigned company cards whose transactions you want to review.
2. Open the selected-count dropdown and select **View transactions**.

This opens the Search page filtered to the transactions from the selected cards.

---

## How to export selected company cards as a CSV

1. Select the company cards you want to export.
2. Open the selected-count dropdown and select **Export as CSV**.

The downloaded file includes the following columns: **Email**, **Name**, **Card number**, **Transaction start date**, **Last updated**, and **Assigned**.

---

## What happens after you unassign company cards

- The selected cards are unassigned from their Workspace members.
- Unassigning a card deletes all of that card’s unsubmitted transactions.
- New transactions from the unassigned cards stop importing into the previous cardholders’ accounts.

---

# FAQ

## Why do I only see Export as CSV in the dropdown?

**Unassign cards** and **View transactions** apply only to assigned cards. If your selection includes any unassigned cards, only **Export as CSV** is available. Select only assigned cards to see all three actions.

## What happens to my selection when I search or switch feeds?

Your selection is cleared when you change the search text or switch to a different company card feed. Selecting a card after filtering keeps that card selected while the filter is applied.

## Can members unassign their own company cards?

No. Only Workspace Admins, Card Admins, and their Copilots can assign, reassign, or unassign company cards.
