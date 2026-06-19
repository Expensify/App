---
title: Expensify Card Spend Rules
description: Learn how Workspace Admins use Expensify Card Spend rules to approve or decline card transactions in real time, including Allow and Block restriction types, default protections, and rule management.
keywords: [New Expensify, Expensify Card Spend rule, block card transactions, allow list, decline transaction, merchant restrictions, spend category, default protections, Workspace Admin]
internalScope: Audience is Workspace Admins. Covers creating and managing Expensify Card Spend rules and understanding default protections. Does not cover post-submission expense rules, card limits, or cardholder-side card management.
---

# Expensify Card Spend Rules 

Expensify Card Spend Rules let Workspace Admins approve or decline card transactions in real time before a transaction is authorized. Use Spend Rules to control where cards can be used by restricting merchants, spend categories, and transaction amounts.

---

## Who can use Expensify Card Spend Rules

- Workspace Admins can create, edit, and delete Expensify Card Spend rules.
- Cardholders can view Expensify Card Spend rules that apply to their cards but cannot modify them.

To create Spend rules, the workspace must have **Rules** enabled. [Learn how to enable Workspace Rules](/articles/new-expensify/workspaces/Workspace-Rules).

---

## What default protections apply to every Expensify Card

Default protections are applied to every Expensify Card and are evaluated before any Spend rules.

These protections:

 - Apply to all Expensify Cards.
 - Cannot be edited or removed.
 - Cannot be overridden by Spend rules.
 - Automatically decline transactions that match blocked merchant category codes (MCCs).

When you create Spend rules, they are applied in addition to these protections rather than replacing them.

You can view the default protections under **Workspaces > [Workspace Name] > Rules**.

---

## How Expensify Card Spend rules are evaluated

For every transaction, Expensify returns a single decision: approved or declined.

Transactions are evaluated in the following order:

1. Default protections are checked first. If a transaction matches a blocked MCC, it is declined.
2. The card's assigned Spend rules are checked next, if one exists.
3. If the transaction passes the default protections and any assigned Spend rules, it is approved.

Cards without Spend rules are governed only by the default protections and any applicable card limits.

---

## What restriction types are available for Expensify Card Spend rules

When creating a Spend rule, choose one of two restriction types:

**Allow**

Use Allow when a card should only be used for specific merchants or spend categories.

Transactions are approved when they:
- Match an allowed merchant or spend category
- Do not exceed the maximum amount

Examples include:
- Travel-only cards
- Subscription cards
- Benefits cards
- Vendor-specific purchasing cards

**Block**

Use Block when a card should work broadly but certain spending should be restricted.

Transactions are declined when they:
- Match a blocked merchant
- Match a blocked spend category
- Exceed the maximum amount

Examples include:
- Blocking specific merchants
- Restricting subscription services
- Preventing transactions above a defined amount

## How to create Expensify Card Spend rules

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [Workspace Name]**.
2. Click **Rules**.
3. Under **Spend**, click **Add Spend rule**.
4. Select one or more cards to apply the rule to.
5. Under **Restriction type**, select **Allow** or **Block**.
6. Configure one or more of the following:
   - **Merchant:** Add merchants using **Contains** or **Exact match**.
   - **Spend category:** Select one or more spend categories.
   - **Max amount:** Enter a maximum transaction amount.
7. Click **Save**.

Spend rules takes effect immediately and are applied to future transactions on the selected cards.

<!-- SCREENSHOT:
Suggestion: The Add card rule flow with Block mode selected and merchant/category/max amount fields visible.
Location: After the Block rule steps.
Purpose: Shows admins the rule configuration fields.
-->

---

## How to edit or delete an Expensify Card Spend rule

After a rule is created, you can review, change, or remove it.

1. Go to **Workspaces > [Workspace Name] > Rules**.
2. Locate the card's Spend Rule.
3. Select the rule to update its merchants, spend categories, maximum amount, or mode.
4. Click **Save**.

To remove a rule: 
1. Open the Spend Rule.
2. Click **Delete**.

After deletion, the card is governed only by default protections and any applicable card limits.

---

## How to create Expensify Card Spend rule while issuing a card

You can apply an Expensify Card Spend rule during card issuance so spending controls are active before the card is used.

[Learn how to set up and manage Expensify Cards](/articles/new-expensify/expensify-card/Set-Up-and-Manage-the-Expensify-Card).

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [Workspace Name] > Expensify Card** and begin issuing a new card.
2. On the **Set card rules** step, enable **Add a spend rule**
3. Choose **Copy existing** to reuse an existing rule, or **Create new** to create a new one. 
4. Configure the Spend rule and select the desired **Restriction type**.
5. Complete the card issuance process. 

The Spend Rules are applied when the card is issued and is enforced from the card's first transaction.

---

## How to find a card or Spend Rule using search

Use search to quickly locate a card or Spend Rule. 

1. Go to **Workspaces > [Workspace Name] > Rules**.
2. Use the search field to filter the list by card or rule.

---

# FAQ

## Do Spend rules apply to reimbursements or third-party cards?

No. Spend rules apply only to Expensify Card transactions. They do not apply to reimbursements, manually created expenses, or company cards from other providers.

## Can a card have more than one Spend rule?

No. Each card can have only one Spend Rule. A Spend Rule uses either the **Allow** or **Block** restriction type.

## Can a Spend Rule override the default protections?

No. Default protections (such as ATMs and gambling) are part of the Expensify Card program. They are always enforced and cannot be edited or overridden by a Spend Rule.

## Why is a card visible in more than one workspace showing the same Spend rule?

Spend rules are enforced at the card level. If a cardholder is a member of multiple workspaces and the card appears in each, the same Spend rule can be viewed and managed from each location.

## What happens to a Spend rule when a card is replaced?

If a member loses a card or orders a replacement, Expensify automatically copies the Spend rule from the old card to the new one. Note that "Combo" cards from Expensify Classic always use the rule tied to the physical card; to set a separate rule for a virtual card, issue a new virtual card.
