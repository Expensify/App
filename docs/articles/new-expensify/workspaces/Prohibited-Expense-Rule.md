---
title: Prohibited Expenses Rule
description: Learn how to use the Flag receipt line items rule to automatically flag receipts with restricted items such as alcohol, gambling, tobacco, or handwritten receipts.
keywords: [New Expensify, prohibited expenses, flag receipt line items, receipt violation, SmartScan, alcohol, gambling, handwritten receipts, expense rules, workspace rules, general tab, line item compliance]
internalScope: Audience is Workspace Admins. Covers configuring the Flag receipt line items rule and understanding the violations it creates. Does not cover other workspace rules or SmartScan configuration.
---

# Prohibited Expenses Rule

The Prohibited Expenses rule helps Workspace Admins enforce compliance by automatically flagging receipts that contain restricted purchases like alcohol, gambling, or tobacco, or that are handwritten. This rule uses Expensify's AI-powered SmartScan to review individual line items and alert admins when prohibited categories are detected.

In New Expensify, the rule is called **Flag receipt line items** and lives on the **General** tab of the **Rules** page.

Once set up, SmartScan reviews scanned receipts at the line-item level:

- Works in both **New Expensify** and **Expensify Classic**
- Can only be configured in **New Expensify**
- Automatically adds a violation to a prohibited expense type

---

## Who can configure the Prohibited Expenses rule

- Only **Workspace Admins** can enable or adjust this rule.
- **Rules** must be enabled for the workspace. [Learn how to enable Workspace Rules](/articles/new-expensify/workspaces/Workspace-Rules#how-to-enable-workspace-rules).

---

## How to set up the Prohibited Expenses rule

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your **workspace name**.
3. Click **Rules**.
4. On the **General** tab, click **Flag receipt line items**.
5. Select the prohibited categories you want to monitor:
   - Adult entertainment
   - Alcohol
   - Gambling
   - Gift card purchases
   - Handwritten receipts
   - Hotel incidentals
   - Tobacco
6. Click **Save**.

**Note:** **Gambling** and **Adult entertainment** are selected by default. Workspace Admins can add or remove any of the other categories.

---

## What happens when a prohibited item is detected

If SmartScan finds a prohibited item in a receipt:

- The expense is flagged with a violation.
- The following messages will appear:
  - `"Receipt Issue Found"`
  - `"Prohibited expense: Alcohol"` (or another selected category)
- The expense will require manual review by an approver.

---

# FAQ

## Will SmartScan still work if I clear every category?

Yes. SmartScan will still extract the merchant, date, and amount. However, it won't scan for prohibited items unless at least one category is selected.

## Where did the Prohibited Expenses section go?

It is now the **Flag receipt line items** rule on the **General** tab of the **Rules** page. [Learn how to configure Workspace Rules](/articles/new-expensify/workspaces/Workspace-Rules).
