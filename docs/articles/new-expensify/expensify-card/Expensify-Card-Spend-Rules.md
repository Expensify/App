---
title: Expensify Card Spend Rules
description: Learn how Workspace Admins use Expensify Card Spend rules to approve or decline card transactions in real time, including permitted currencies, max amount, the Restrict merchants Off, Allow, and Block options, default protections, and rule management.
keywords: [New Expensify, Expensify Card Spend rule, block card transactions, allow list, decline transaction, merchant restrictions, merchant types, permitted currencies, max amount, default protections, Workspace Admin]
internalScope: Audience is Workspace Admins. Covers creating and managing Expensify Card Spend rules, including permitted currencies, max amount, and merchant restrictions, and understanding default protections. Does not cover post-submission expense rules, card limits, or cardholder-side card management.
---

# Expensify Card Spend Rules 

Expensify Card Spend Rules let Workspace Admins approve or decline card transactions in real time before a transaction is authorized. Use Spend Rules to control where cards can be used by restricting permitted currencies, transaction amounts, merchants, and merchant types.

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

## What you can configure in an Expensify Card Spend rule

A Spend rule is made up of the settings below. You can use any combination of them.

**Permitted currencies**

Use **Permitted currencies** to control which currencies a card can be charged in. The default is **All currencies**. You can instead select specific currencies to allow.

- The card's settlement currency is always permitted, even when you select specific currencies.
- Charges in a currency that is not permitted are declined.
- To set specific currencies, the selected cards must settle in the same currency.

**Max amount**

Enter a maximum transaction amount. Any charge over this amount is declined, regardless of the merchant and merchant type restrictions.

To set a max amount, the selected cards must settle in the same currency.

**Restrict merchants**

Use **Restrict merchants** to control which merchants and merchant types a card can be used at. Choose one of three options:

- **Off:** Charges are approved for permitted currencies that don't exceed a max amount. No merchant or merchant type restrictions apply.
- **Allow:** Charges are approved for permitted currencies that don't exceed a max amount, and the merchant or merchant type matches. Use this when a card should only be used at specific merchants or merchant types, such as travel-only, subscription, benefits, or vendor-specific cards.
- **Block:** Charges are approved for permitted currencies that don't exceed a max amount, or the merchant or merchant type matches. Use this when a card should work broadly but certain merchants or merchant types should be restricted.

When **Allow** is selected, you configure **Allowed merchants** and **Allowed merchant types**. When **Block** is selected, you configure **Blocked merchants** and **Blocked merchant types**.

---

## How to create Expensify Card Spend rules

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [Workspace Name]**.
2. Click **Rules**.
3. Under **Spend**, click **Add spend rule**.
4. Under **Cards**, click **Choose cards** and select one or more cards to apply the rule to.
5. Under **Spend rules**, configure one or more of the following:
   - **Permitted currencies:** Keep **All currencies** or select specific currencies.
   - **Max amount:** Enter a maximum transaction amount.
   - **Restrict merchants:** Select **Off**, **Allow**, or **Block**. When you select **Allow** or **Block**, set the merchants and merchant types to allow or block.
6. Click **Save rule**.

Spend rules take effect immediately and are applied to future transactions on the selected cards.

<!-- SCREENSHOT:
Suggestion: The Add spend rule flow showing the Spend rules section with Permitted currencies, Max amount, and the Restrict merchants Off/Allow/Block toggle.
Location: After the create rule steps.
Purpose: Shows admins the rule configuration fields.
-->

---

## How to edit or delete an Expensify Card Spend rule

After a rule is created, you can review, change, or remove it.

1. Go to **Workspaces > [Workspace Name] > Rules**.
2. Locate the card's Spend Rule.
3. Select the rule to update its permitted currencies, max amount, merchants, or merchant types.
4. Click **Save rule**.

To remove a rule: 
1. Open the Spend Rule.
2. Click **Delete rule**.

After deletion, the card is governed only by default protections and any applicable card limits.

---

## How to create an Expensify Card Spend rule while issuing a card

You can apply an Expensify Card Spend rule during card issuance so spending controls are active before the card is used.

[Learn how to set up and manage Expensify Cards](/articles/new-expensify/expensify-card/Set-Up-and-Manage-the-Expensify-Card).

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [Workspace Name] > Expensify Card** and begin issuing a new card.
2. On the **Set card rules** step, enable **Add spend rule**.
3. Choose **Copy existing** to reuse an existing rule, or **Create new** to create a new one. 
4. Configure the Spend rule's permitted currencies, max amount, and merchant restrictions.
5. Complete the card issuance process. 

The Spend rule is applied when the card is issued and is enforced from the card's first transaction.

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

No. Each card can have only one Spend Rule.

## Can I set a max amount or specific currencies for cards that settle in different currencies?

No. To set a max amount or select specific permitted currencies, the selected cards must settle in the same currency. The card's settlement currency is always permitted.

## Can a Spend Rule override the default protections?

No. Default protections (such as ATMs and gambling) are part of the Expensify Card program. They are always enforced and cannot be edited or overridden by a Spend Rule.

## Why is a card visible in more than one workspace showing the same Spend rule?

Spend rules are enforced at the card level. If a cardholder is a member of multiple workspaces and the card appears in each, the same Spend rule can be viewed and managed from each location.

## What happens to a Spend rule when a card is replaced?

If a member loses a card or orders a replacement, Expensify automatically copies the Spend rule from the old card to the new one. Note that "Combo" cards from Expensify Classic always use the rule tied to the physical card; to set a separate rule for a virtual card, issue a new virtual card.
