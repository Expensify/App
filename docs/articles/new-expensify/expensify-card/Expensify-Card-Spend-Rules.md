---
title: Set Up Expensify Card Spend Rules
description: Learn how Workspace Admins use Expensify Card Spend Rules to approve or decline card transactions in real time at the point of sale, including Block rules, Allow rules, and default protections.
keywords: [New Expensify, Expensify Card Spend Rules, block card transactions, allow list, decline transaction, merchant restrictions, spend category, default protections, Workspace Admin]
internalScope: Audience is Workspace Admins. Covers creating and managing Expensify Card Spend Rules and understanding default protections. Does not cover post-submission expense rules, card limits, or cardholder-side card management.
---

Spend Rules let Workspace Admins approve or decline Expensify Card transactions in real time, at the moment the card is used, before any expense is created. This gives you guardrails to issue cards more broadly while keeping tight control over where and how they can be used.

Spend Rules apply only to Expensify Card transactions. They do not apply to reimbursements, manually created expenses, or third-party card transactions. They are also distinct from expense rules, which determine how an expense is categorized *after* a transaction is approved.

Each card can have at most one admin-defined Spend Rule, in either **Block** mode or **Allow** mode.

---

## Who can manage Expensify Card Spend Rules

- **Workspace Admins** can create, edit, and delete Spend Rules.
- **Cardholders** are subject to Spend Rules and can view them, but cannot create or change them.

Spend Rules can only be configured in New Expensify. Once set, they are enforced on transactions made through Expensify Classic as well.

---

## What default protections apply to every Expensify Card

Every Expensify Card includes built-in default protections that block certain merchant category codes (MCCs), such as ATMs and gambling. These protections are part of the Expensify Card program.

- They apply automatically to all Expensify Cards.
- They cannot be edited or overridden, including by a Spend Rule.
- A transaction that matches a blocked MCC is always declined.

To view the default protections, go to **Settings > Workspaces > [Workspace Name] > Spend**. The default protection appears as a non-editable rule.

<!-- SCREENSHOT:
Suggestion: The workspace Spend section showing the non-editable Default Protection rule.
Location: After this section.
Purpose: Helps admins recognize the new Spend section and what the default protection looks like.
-->

---

## How Expensify Card Spend Rules are evaluated

For every transaction, Expensify returns a single decision — approve or decline — using this order:

1. **Default protections** are checked first. If the transaction matches a blocked MCC, it is declined.
2. **The card's admin-defined Spend Rule** is checked next, if one exists:
   - **Block mode:** the transaction is declined if it matches a blocked merchant or spend category, or exceeds the max amount. Otherwise, it is approved.
   - **Allow mode:** the transaction is approved only if it matches an allowed merchant or spend category and does not exceed the max amount. Otherwise, it is declined.
3. If nothing above declines the transaction, it is approved.

A card with no admin-defined Spend Rule is governed only by the default protections and its card limit.

---

## How to add a Block rule to an Expensify Card

Use a Block rule for broadly-used cards where only specific spend needs to be restricted — for example, a sales team card that works nearly everywhere except gambling or specific merchants.

1. Go to **Settings > Workspaces > [Workspace Name] > Spend**.
2. Click **Add card rule**.
3. Select one or more cards to apply the rule to. Only cards without an existing Spend Rule appear in the list.
4. Choose **Block** mode.
5. Configure any combination of the following restrictions:
   - **Merchants:** add merchant names using **Contains** or **Exact match**.
   - **Spend categories:** select one or more categories from the MCC-group list.
   - **Max amount:** enter a maximum transaction amount.
6. Click **Save**.

A transaction is declined if it matches any blocked merchant or spend category, or exceeds the max amount.

<!-- SCREENSHOT:
Suggestion: The Add card rule flow with Block mode selected and merchant/category/max amount fields visible.
Location: After the Block rule steps.
Purpose: Shows admins the rule configuration fields.
-->

---

## How to add an Allow rule to an Expensify Card

Use an Allow rule for tightly-scoped cards that should only work in specific situations — for example, a travel-only card (hotels, airlines, transportation), a benefits card (gym or fitness merchants), or a subscription card (specific merchant names).

1. Go to **Settings > Workspaces > [Workspace Name] > Spend**.
2. Click **Add card rule**.
3. Select one or more cards to apply the rule to. Only cards without an existing Spend Rule appear in the list.
4. Choose **Allow** mode.
5. Configure the restrictions that define what is permitted:
   - **Merchants:** add allowed merchant names using **Contains** or **Exact match**.
   - **Spend categories:** select the allowed categories from the MCC-group list.
   - **Max amount:** enter a maximum transaction amount.
6. Click **Save**.

A transaction is approved only if it matches an allowed merchant or spend category and does not exceed the max amount. Anything else is declined.

Each card can have one Spend Rule in one mode. A card cannot have both an Allow rule and a Block rule at the same time.

---

## How to edit or delete an Expensify Card Spend Rule

After a rule is created, you can review, change, or remove it.

1. Go to **Settings > Workspaces > [Workspace Name] > Spend**.
2. Locate the card's Spend Rule summary.
3. Click the rule to edit its merchants, spend categories, max amount, or mode.
4. To remove the rule entirely, choose **Delete**.

When you delete a rule, the card returns to being governed only by default protections and its card limit.

---

## How to apply a Spend Rule when issuing a new Expensify Card

You can apply a Spend Rule at the time you issue a card, so the card has controls in place from its first use.

1. Issue a new card from **Settings > Workspaces > [Workspace Name] > Expensify Card**. For the full issuance steps, [learn how to set up and manage Expensify Cards](/articles/new-expensify/expensify-card/Set-Up-and-Manage-the-Expensify-Card).
2. During issuance, apply an existing Spend Rule or create a new one for the card.

If a cardholder loses a card or orders a replacement, the Spend Rule from the old card is automatically copied to the new one.

---

## How to find a card or Spend Rule using search

In workspaces with many cards, use the search filter to quickly locate a specific card or its Spend Rule.

1. Go to **Settings > Workspaces > [Workspace Name] > Spend**.
2. Use the search field to filter the list by card or rule.

---

# FAQ

## Do Spend Rules apply to reimbursements or third-party cards?

No. Spend Rules apply only to Expensify Card transactions. They do not apply to reimbursements, manually created expenses, or company cards from other providers.

## Can a card have more than one Spend Rule?

No. Each card can have at most one admin-defined Spend Rule, in either Block mode or Allow mode. Only cards without an existing rule appear in the card selection list when you add a rule.

## Can a Spend Rule override the default protections?

No. Default protections (such as ATMs and gambling) are part of the Expensify Card program. They are always enforced and cannot be edited or overridden by a Spend Rule.

## Why is a card visible in more than one workspace showing the same Spend Rule?

Spend Rules are enforced at the card level. If a cardholder is a member of multiple workspaces and the card appears in each, the same Spend Rule can be viewed and managed from each location.

## What happens to a Spend Rule when a card is replaced?

If a member loses a card or orders a replacement, Expensify automatically copies the Spend Rule from the old card to the new one. Note that "Combo" cards from Expensify Classic always use the rule tied to the physical card; to set a separate rule for a virtual card, issue a new virtual card.

## Can Spend Rules be configured in Expensify Classic?

No. Spend Rules can only be configured in New Expensify. Once set, they are enforced on Expensify Classic transactions as well.
