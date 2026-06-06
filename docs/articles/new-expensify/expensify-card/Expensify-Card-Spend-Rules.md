---
title: Expensify Card Spend Rules
description: Learn how Workspace Admins use Expensify Card Spend Rules to approve or decline card transactions in real time at the point of sale, including Block rules, Allow rules, and default protections.
keywords: [New Expensify, Expensify Card Spend Rules, block card transactions, allow list, decline transaction, merchant restrictions, spend category, default protections, Workspace Admin]
internalScope: Audience is Workspace Admins. Covers creating and managing Expensify Card Spend Rules and understanding default protections. Does not cover post-submission expense rules, card limits, or cardholder-side card management.
---

# Expensify Card Spend Rules 

Spend Rules let Workspace Admins approve or decline Expensify Card transactions in real time before an expense is created. This gives you more control over where cards can be used while allowing you to issue cards more broadly across your organization.

---

## Who can manage Expensify Card Spend Rules

- **Workspace Admins** can create, edit, and delete Spend Rules.
- **Cardholders** can view Spend Rules that apply to their cards but cannot create or modify them.

---

## What rules are automatically applied to every Expensify Card

These protections act as baseline rules for all cards and are evaluated before any Spend Rule.. 

When you create a Spend Rule, it is applied in addition to these default protections rather than replacing them.

- Default protections apply to all Expensify Cards.
- They cannot be edited or removed.
- They cannot be overridden by Spend Rules.
- Transactions that match a blocked MCC are automatically declined.

To view the default protections, go to **Workspaces > [Workspace Name] > Spend**. The default protection appears as a non-editable rule.

<!-- SCREENSHOT:
Suggestion: The workspace Spend section showing the non-editable Default Protection rule.
Location: After this section.
Purpose: Helps admins recognize the new Spend section and what the default protection looks like.
-->

---

## How Spend Rules are evaluated

For every transaction, Expensify returns a single decision: approved or declined.

Transactions are evaluated in the following order:

1. **Default protections** are checked first. If a transaction matches a blocked MCC, it is declined.
2. **The card's admin-defined Spend Rule** is checked next, if one exists. 
   - In **Block mode**, a transaction is declined if it matches a blocked merchant or spend category, or exceeds the maximum amount
   - In **Allow mode**, a transaction is approved only when it matches an allowed merchant or spend category and remains within the maximum amount..
3. If no rule declines the transaction, the transaction is approved.

Cards without an admin-defined Spend Rule are governed only by default protections and any applicable card limits.

---

## How to add a Block rule to an Expensify Card

Use a Block rule when cards should work broadly but specific spending needs to be restricted.

Examples include:

- Restricting subscription services
- Blocking specific a merchant
- Preventing transactions above a defined amount

1. Go to **Workspaces > [Workspace Name] > Rules**.
2. Click **Add card rule**.
3. Select one or more cards to apply the rule to.
4. Select **Block**. 
5. Configure one or more restrictions:
   - **Merchants:** Add merchants using **Contains** or **Exact match**.
   - **Spend categories:** Select blocked spend categories.
   - **Max amount:** Enter a maximum transaction amount.
6. Click **Save**.

A transaction is declined when it matches any blocked condition.

<!-- SCREENSHOT:
Suggestion: The Add card rule flow with Block mode selected and merchant/category/max amount fields visible.
Location: After the Block rule steps.
Purpose: Shows admins the rule configuration fields.
-->

---

## How to add an Allow rule to an Expensify Card

Use an Allow rule when cards should only work in specific situations.

Examples include:

 - Travel-only cards
 - Subscription cards
 - Benefits cards
 - Vendor-specific purchasing cards

1. Go to **Workspaces > [Workspace Name] > Rules**.
2. Click **Add card rule**.
3. Select one or more cards.
4. Select **Allow**.
5. Configure the allowed conditions:
   - **Merchants:** Add merchants using **Contains** or **Exact match**.
   - **Spend categories:** Select allowed spend categories.
   - **Max amount:** Enter a maximum transaction amount.
6. Click **Save**.

Transactions are approved only when they satisfy the allowed conditions and remain within the maximum amount.

---

## How to edit or delete an Expensify Card Spend Rule

After a rule is created, you can review, change, or remove it.

1. Go to **Workspaces > [Workspace Name] > Rules**.
2. Locate the card's Spend Rule.
3. Select the rule to update its merchants, spend categories, maximum amount, or mode.
4. Click Save to apply changes.

To remove a rule: 
1. Open the Spend Rule.
2. Click **Delete**.

After deletion, the card is governed only by default protections and any applicable card limits.

---

## How to apply an Expensify Card Spend Rule when issuing a card

You can apply a Spend Rule during card issuance so spending controls are active before the card is used.

[Learn how to set up and manage Expensify Cards](/articles/new-expensify/expensify-card/Set-Up-and-Manage-the-Expensify-Card).

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [Workspace Name] > Expensify Card** and begin issuing a new card.
2. On the **Set card rules** step, enable **Add a spend rule**
3. Choose **Copy existing** to reuse an existing rule, or **Create new** to create a new one. 
4. Configure the **Block** or **Allow** rule.
5. Complete the card issuance process. 

The Spend Rule is applied when the card is issued and is enforced from the card's first transaction.

---

## How to find a card or Spend Rule using search

Use search to quickly locate a card or Spend Rule. 

1. Go to **Workspaces > [Workspace Name] > Rules**.
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

