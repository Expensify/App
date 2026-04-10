---
title: Expensify Card Spend Rules
description: Create spend rules to automatically approve or decline Expensify Card transactions in real time based on merchants, spend categories, or max amounts.
keywords: [spend rules, Expensify Card rules, card restrictions, block merchants, allow merchants, spend categories, max amount, card spend limits, real-time card controls]
internalScope: Audience is Workspace Admins on the Control plan with Expensify Cards enabled. Covers creating and managing spend rules for Expensify Card transactions. Does not cover general workspace expense rules, category rules, or Expensify Card setup and issuance.
---

# Expensify Card Spend Rules

Spend rules let Workspace Admins control Expensify Card transactions in real time. You can create rules that automatically approve or decline charges based on merchants, spend categories, or maximum amounts. These rules apply at the time of purchase, not after the expense is submitted.

Expensify Cards include built-in protections that always block charges for adult services, ATMs, gambling, and money transfers. You can add custom spend rules to further protect company cash flow.

---

## Who can use Expensify Card Spend Rules

- You must be a **Workspace Admin** on the **Control** plan.
- **Expensify Cards** must be enabled and issued in the workspace.
- **Rules** must be enabled under **More Features**.

---

## How to view built-in Expensify Card protections

Expensify Cards always decline charges in these categories:

- Adult services
- ATMs
- Gambling
- Money transfers

To view these protections:

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your **workspace name**.
3. Click **Rules**.
4. Scroll to the **Spend** section.
5. Click the built-in protection rule to see details.

---

## How to add a custom Expensify Card Spend Rule

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your **workspace name**.
3. Click **Rules**.
4. Scroll to the **Spend** section.
5. Click **Add spend rule**.
6. Select the cards this rule applies to, then click **Next**.
7. Configure the rule:
   - **Restriction type** - Choose **Allow** (approve matching charges) or **Block** (decline matching charges).
   - **Merchants** - Add merchant names using **Contains** or **Matches exactly** matching.
   - **Spend category** - Select one or more spend categories (e.g., Airlines, Dining, Hotels, Retail).
   - **Max amount** - Set a maximum charge amount. Any charge over this amount is declined regardless of other rule settings. All selected cards must settle in the same currency to set a max amount.
8. Click **Save rule**.

---

## How Expensify Card Spend Rules work

- **Allow rules** approve charges that match any specified merchant or spend category and do not exceed the max amount.
- **Block rules** decline charges that match any specified merchant or spend category, or exceed the max amount.
- Rules are evaluated in real time when the card is used for a purchase.
- Each rule can apply to specific cards or all Expensify Cards in the workspace.
- Multiple spend rules can exist at the same time.

---

# FAQ

## Why don't I see the Spend section on the Rules page?

The **Spend** section only appears when Expensify Cards are enabled for the workspace. To enable Expensify Cards, go to **Workspaces** > your **workspace name** > **More Features** and toggle on **Expensify Card**.

## Can I set a max amount with cards in different currencies?

No. To set a max amount, all selected cards must settle in the same currency. If your selected cards settle in different currencies, you will be prompted to review the selected cards.

## What spend categories are available for Spend Rules?

Available spend categories include Airlines, Alcohol and bars, Amazon and bookstores, Automotive, Car rentals, Dining, Fuel and gas, Government and non-profits, Groceries, Gyms and fitness, Healthcare, Hotels, Internet and phone, Office supplies, Parking and tolls, Professional services, Retail, Shipping and delivery, Software, Transit and rideshare, and Travel agencies.
